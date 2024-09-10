// controllers/apis/appointment-controller.js
const prisma = require('../../services/prisma')

const appointmentController = {
  createAppointment: async (req, res, next) => {
    const { patientId, doctorScheduleId, status } = req.body
    try {
      const newAppointment = await prisma.appointment.create({
        data: { patientId, doctorScheduleId, status }
      })
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
  }
}

module.exports = appointmentController
