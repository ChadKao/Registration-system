const prisma = require('./prisma')
const { validateIdNumber } = require('../helpers/idValidation')
const secretKey = process.env.RECAPTCHA_SECRET_KEY
const AppError = require('../errors/AppError')

const createAppointment = async (appointmentData) => {
  const { idNumber, birthDate, doctorScheduleId, recaptchaResponse } = appointmentData
  // 檢查必填資料
  if (!(idNumber && birthDate && recaptchaResponse)) {
    throw new AppError('缺少必要的資料', 400)
  }
  // 驗證身分證字號
  if (!validateIdNumber(idNumber)) {
    throw new AppError('Invalid ID number (身分證字號格式錯誤)', 400)
  }

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
    throw new AppError('reCAPTCHA 驗證失敗', 400)
  }

  // 查詢該病人的 patientId
  const patient = await prisma.patient.findUnique({
    where: {
      idNumber,
      birthDate: new Date(birthDate)
    }
  })

  if (!patient) {
    throw new AppError('Patient not found.(若為初診病人，請先填寫初診資料)', 404)
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
    throw new AppError('Schedule not found.', 404)
  }

  // 檢查時段狀態是否為 FULL
  if (schedule.status === 'FULL') {
    throw new AppError('This time slot is fully booked.', 400)
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
    throw new AppError('You have already booked this time slot.', 400)
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

  // 檢查剩餘名額
  const bookedAppointments = schedule.appointments.filter(appointment => appointment.status === 'CONFIRMED').length
  const slotsRemaining = schedule.maxAppointments - bookedAppointments

  let newAppointment

  if (slotsRemaining > 3) {
    // 名額足夠，不需要加鎖，直接創建預約
    newAppointment = await prisma.appointment.create({
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

    // 檢查並更新時段狀態
    const updatedBookedAppointments = schedule.appointments.filter(appointment => appointment.status === 'CONFIRMED').length + 1
    if (updatedBookedAppointments >= schedule.maxAppointments) {
      await prisma.doctorSchedule.update({
        where: { id: doctorScheduleId },
        data: { status: 'FULL' }
      })
    }
  } else {
    // 使用交易和悲觀鎖進行保護，名額少於等於 3 時
    newAppointment = await prisma.$transaction(async (prisma) => {
      const [lockedSchedule] = await prisma.$queryRaw`SELECT * FROM DoctorSchedule WHERE id = ${doctorScheduleId} FOR UPDATE`

      if (lockedSchedule.status === 'AVAILABLE') {
        // 創建新掛號
        const appointment = await prisma.appointment.create({
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

        // 檢查並更新時段狀態
        const updatedBookedAppointments = schedule.appointments.filter(appointment => appointment.status === 'CONFIRMED').length + 1
        if (updatedBookedAppointments >= schedule.maxAppointments) {
          await prisma.doctorSchedule.update({
            where: { id: doctorScheduleId },
            data: { status: 'FULL' }
          })
        }

        return appointment
      } else {
        // 名額已滿，回傳錯誤或進行其他處理
        throw new AppError('名額已滿，無法預約', 400)
      }
    })
  }

  // 格式化掛號資料
  const formattedAppointment = {
    appointmentId: newAppointment.id,
    date: newAppointment.doctorSchedule.date,
    doctorScheduleId: newAppointment.doctorSchedule.id,
    scheduleSlot: newAppointment.doctorSchedule.scheduleSlot,
    doctorName: newAppointment.doctorSchedule.doctor.name,
    doctorSpecialty: newAppointment.doctorSchedule.doctor.specialty.name,
    consultationNumber: newAppointment.consultationNumber,
    status: newAppointment.status
  }

  return formattedAppointment
}

module.exports = {
  createAppointment
}
