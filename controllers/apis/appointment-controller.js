// controllers/apis/appointment-controller.js
const prisma = require('../../services/prisma')

const appointmentController = {
  createAppointment: async (req, res, next) => {
    const { patientId, doctorScheduleId, status } = req.body
    try {
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

      // 如果沒有重複掛號，則創建新掛號
      const newAppointment = await prisma.appointment.create({
        data: { patientId, doctorScheduleId, status }
      })

      // 檢查並更新時段狀態
      const updatedBookedAppointments = schedule.appointments.filter(appointment => appointment.status === 'CONFIRMED').length + 1
      if (updatedBookedAppointments >= schedule.maxAppointments) {
        await prisma.doctorSchedule.update({
          where: { id: doctorScheduleId },
          data: { status: 'FULL' }
        })
      }

      res.status(201).json({ status: 'success', data: newAppointment })
    } catch (error) {
      next(error)
    }
  },

  // 查詢所有預約
  getAllAppointments: async (req, res, next) => {
    try {
      const appointments = await prisma.appointment.findMany()
      res.status(200).json({ status: 'success', data: appointments })
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
        res.status(200).json({ status: 'success', data: appointment })
      } else {
        res.status(404).json({ status: 'error', message: 'Appointment not found' })
      }
    } catch (error) {
      next(error)
    }
  },

  // 查詢病人的所有掛號紀錄
  getAppointmentsByPatient: async (req, res, next) => {
    const { idNumber, birthDate } = req.body

    try {
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
              doctor: true // 包含醫生資料
            }
          }
        }
      })

      // 如果沒有找到掛號紀錄，返回 404
      if (appointments.length === 0) {
        return res.status(404).json({
          status: 'fail',
          message: 'No appointments found for this patient.'
        })
      }

      // 格式化返回資料
      const formattedAppointments = appointments.map(appointment => ({
        appointmentId: appointment.id,
        date: appointment.doctorSchedule.date,
        scheduleSlot: appointment.doctorSchedule.scheduleSlot,
        doctorName: appointment.doctorSchedule.doctor.name,
        doctorSpecialty: appointment.doctorSchedule.doctor.specialty,
        status: appointment.status
      }))

      res.status(200).json({
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
      res.status(200).json({ status: 'success', data: updatedAppointment })
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
      res.status(200).json({ status: 'success', data: deletedAppointment })
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
        data: { status: 'CANCELED' }
      })
      res.status(200).json({ status: 'success', data: updatedAppointment })
    } catch (error) {
      next(error)
    }
  }
}

module.exports = appointmentController
