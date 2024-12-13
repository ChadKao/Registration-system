const prisma = require('../../services/prisma')
const secretKey = process.env.RECAPTCHA_SECRET_KEY
const { validateIdNumber } = require('../../helpers/idValidation')
const { createPatient } = require('../../services/patient-service')
const appointmentService = require('../../services/appointment-service')
const AppError = require('../../errors/AppError')

const appointmentController = {
  createAppointment: async (req, res, next) => {
    try {
      const formattedAppointment = await appointmentService.createAppointment(req.body)

      return res.status(201).json({
        status: 'success',
        data: {
          appointment: formattedAppointment
        }
      })
    } catch (error) {
      next(error)
    }
  },

  createPatientAndAppointment: async (req, res, next) => {
    try {
      const newPatient = await createPatient(req, res, next)

      const formattedAppointment = await appointmentService.createAppointment(req.body)

      return res.status(201).json({
        status: 'success',
        data: {
          patient: newPatient,
          appointment: formattedAppointment
        }
      })
    } catch (error) {
      next(error)
    }
  },
  // 查詢所有預約
  getAllAppointments: async (req, res, next) => {
    try {
      const appointments = await prisma.appointment.findMany()
      return res.status(200).json({ status: 'success', data: appointments })
    } catch (error) {
      next(error)
    }
  },

  // 根據 ID 查詢預約
  getAppointmentById: async (req, res, next) => {
    const { id } = req.params
    try {
      const appointment = await prisma.appointment.findUnique({
        where: { id: parseInt(id) }
      })
      if (appointment) {
        return res.status(200).json({ status: 'success', data: appointment })
      } else {
        return res.status(404).json({ status: 'error', message: 'Appointment not found' })
      }
    } catch (error) {
      next(error)
    }
  },

  // 查詢病人的所有掛號紀錄
  getAppointmentsByPatient: async (req, res, next) => {
    const { idNumber, birthDate, recaptchaResponse } = req.body

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

      const patient = await prisma.patient.findUnique({
        where: {
          idNumber,
          birthDate: new Date(birthDate)
        }
      })

      if (!patient) {
        throw new AppError('Patient not found.(若為初診病人，請先填寫初診資料)', 404)
      }

      // 查詢病人的所有掛號紀錄，並包含相關的醫生排班資料
      const appointments = await prisma.appointment.findMany({
        where: {
          patient: {
            idNumber,
            birthDate: new Date(birthDate)
          } // 根據病人資料篩選掛號紀錄
        },
        include: {
          doctorSchedule: {
            include: {
              doctor: {
                include: {
                  specialty: true // 確保包含專科資料
                }
              }
            }
          }
        }
      })

      // 如果沒有找到掛號紀錄，返回 404
      if (appointments.length === 0) {
        return res.status(404).json({
          status: 'error',
          message: 'No appointments found for this patient.'
        })
      }

      // 格式化返回資料
      const formattedAppointments = appointments.map(appointment => ({
        appointmentId: appointment.id,
        date: appointment.doctorSchedule.date,
        doctorScheduleId: appointment.doctorSchedule.id,
        scheduleSlot: appointment.doctorSchedule.scheduleSlot,
        doctorName: appointment.doctorSchedule.doctor.name,
        doctorSpecialty: appointment.doctorSchedule.doctor.specialty.name,
        consultationNumber: appointment.consultationNumber,
        status: appointment.status
      }))

      return res.status(200).json({
        status: 'success',
        data: formattedAppointments
      })
    } catch (error) {
      next(error)
    }
  },

  // 更新預約
  updateAppointment: async (req, res, next) => {
    const { id } = req.params
    const { status } = req.body
    try {
      const updatedAppointment = await prisma.appointment.update({
        where: { id: parseInt(id) },
        data: { status }
      })
      return res.status(200).json({ status: 'success', data: updatedAppointment })
    } catch (error) {
      next(error)
    }
  },

  // 刪除預約
  deleteAppointment: async (req, res, next) => {
    const { id } = req.params
    try {
      const deletedAppointment = await prisma.appointment.delete({
        where: { id: parseInt(id) }
      })
      return res.status(200).json({ status: 'success', data: deletedAppointment })
    } catch (error) {
      next(error)
    }
  },
  // 取消預約
  cancelAppointment: async (req, res, next) => {
    const { id } = req.params
    try {
      const updatedAppointment = await prisma.appointment.update({
        where: { id: parseInt(id) },
        data: { status: 'CANCELED' },
        include: {
          doctorSchedule: { // 包含醫生的時段資料
            include: {
              doctor: {
                include: {
                  specialty: true // 確保包含專科資料
                }
              }
            }
          }
        }
      })
      // 格式化掛號資料
      const formattedAppointment = {
        appointmentId: updatedAppointment.id,
        date: updatedAppointment.doctorSchedule.date,
        doctorScheduleId: updatedAppointment.doctorSchedule.id,
        scheduleSlot: updatedAppointment.doctorSchedule.scheduleSlot,
        doctorName: updatedAppointment.doctorSchedule.doctor.name,
        doctorSpecialty: updatedAppointment.doctorSchedule.doctor.specialty.name,
        consultationNumber: updatedAppointment.consultationNumber,
        status: updatedAppointment.status
      }
      return res.status(200).json({ status: 'success', data: formattedAppointment })
    } catch (error) {
      next(error)
    }
  }
}

module.exports = appointmentController
