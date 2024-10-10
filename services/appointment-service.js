const prisma = require('./prisma')
const { validateIdNumber } = require('../helpers/idValidation')
const secretKey = process.env.RECAPTCHA_SECRET_KEY

const createAppointment = async (req, res, next) => {
  const { idNumber, birthDate, doctorScheduleId, recaptchaResponse } = req.body
  // 檢查必填資料
  if (!(idNumber && birthDate && recaptchaResponse)) {
    return res.status(400).json({
      status: 'error',
      message: '缺少必要的資料'
    })
  }
  // 驗證身分證字號
  if (!validateIdNumber(idNumber)) {
    return res.status(400).json({
      status: 'error',
      message: 'Invalid ID number(身分證字號格式錯誤)'
    })
  }
  try {
    // 驗證 reCAPTCHA
    const verificationURL = 'https://www.google.com/recaptcha/api/siteverify'
    const verificationParams = new URLSearchParams()
    verificationParams.append('secret', secretKey)
    verificationParams.append('response', recaptchaResponse)

    const verificationResponse = await fetch(verificationURL, {
      method: 'POST',
      body: verificationParams // 使用 x-www-form-urlencoded 格式
    })

    const verificationData = await verificationResponse.json()

    // 驗證失敗，返回錯誤訊息
    if (!verificationData.success) {
      return res.status(400).json({
        status: 'error',
        message: 'reCAPTCHA 驗證失敗'
      })
    }

    // 查詢該病人的 patientId
    const patient = await prisma.patient.findUnique({
      where: {
        idNumber,
        birthDate: new Date(birthDate)
      }
    })

    if (!patient) {
      return res.status(404).json({
        status: 'fail',
        message: 'Patient not found.(若為初診病人，請先填寫初診資料)'
      })
    }

    const patientId = patient.id // 獲取 patientId

    // 查詢該時段的詳細資料
    const schedule = await prisma.doctorSchedule.findUnique({
      where: { id: doctorScheduleId },
      include: {
        appointments: true // 查詢相關的appointments
      }
    })

    if (!schedule) {
      return res.status(404).json({
        status: 'fail',
        message: 'Schedule not found.'
      })
    }

    // 檢查時段狀態是否為 FULL
    if (schedule.status === 'FULL') {
      return res.status(400).json({
        status: 'fail',
        message: 'This time slot is fully booked.'
      })
    }

    // 先查詢是否有重複掛號的紀錄
    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        patientId,
        doctorScheduleId,
        status: 'CONFIRMED' // 確認過的掛號，避免已取消的掛號被算進去
      }
    })

    // 如果已經有掛號紀錄，則返回錯誤
    if (existingAppointment) {
      return res.status(400).json({
        status: 'fail',
        message: 'You have already booked this time slot.'
      })
    }

    // 查詢該時段所有的看診號碼，並找到最大值
    const existingConsultationNumbers = await prisma.appointment.findMany({
      where: { doctorScheduleId },
      select: { consultationNumber: true }
    })

    const maxConsultationNumber = existingConsultationNumbers.length > 0
      ? Math.max(...existingConsultationNumbers.map(appointment => appointment.consultationNumber))
      : 0

    const consultationNumber = maxConsultationNumber + 1

    // 如果沒有重複掛號，則創建新掛號
    const newAppointment = await prisma.appointment.create({
      data: { patientId, doctorScheduleId, status: 'CONFIRMED', consultationNumber },
      include: {
        doctorSchedule: {
          include: {
            doctor: {
              include: {
                specialty: true // 確保包含醫生及其專科資料
              }
            }
          }
        }
      }
    })

    // 格式化掛號資料
    const formattedAppointment = {
      appointmentId: newAppointment.id,
      date: newAppointment.doctorSchedule.date,
      scheduleSlot: newAppointment.doctorSchedule.scheduleSlot,
      doctorName: newAppointment.doctorSchedule.doctor.name,
      doctorSpecialty: newAppointment.doctorSchedule.doctor.specialty.name,
      consultationNumber: newAppointment.consultationNumber,
      status: newAppointment.status
    }

    // 檢查並更新時段狀態
    const updatedBookedAppointments = schedule.appointments.filter(appointment => appointment.status === 'CONFIRMED').length + 1
    if (updatedBookedAppointments >= schedule.maxAppointments) {
      await prisma.doctorSchedule.update({
        where: { id: doctorScheduleId },
        data: { status: 'FULL' }
      })
    }

    return formattedAppointment
  } catch (error) {
    next(error)
  }
}

module.exports = {
  createAppointment
}
