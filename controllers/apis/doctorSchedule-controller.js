// controllers/apis/doctorSchedule-controller.js
const prisma = require('../../services/prisma')

const doctorScheduleController = {
  createDoctorSchedule: async (req, res, next) => {
    const { doctorId, scheduleSlot, date, maxAppointments, status } = req.body
    try {
      const newSchedule = await prisma.doctorSchedule.create({
        data: { doctorId, scheduleSlot, date, maxAppointments, status }
      })
      res.status(201).json({ status: 'success', data: newSchedule })
    } catch (error) {
      next(error)
    }
  },

  // 查詢醫生排班
  getAllDoctorSchedules: async (req, res, next) => {
    try {
      const schedules = await prisma.doctorSchedule.findMany()
      res.status(200).json({ status: 'success', data: schedules })
    } catch (error) {
      next(error)
    }
  },

  // 根據 ID 查詢醫生排班
  getDoctorScheduleById: async (req, res, next) => {
    const { id } = req.params
    try {
      const schedule = await prisma.doctorSchedule.findUnique({
        where: { id: parseInt(id) }
      })
      if (schedule) {
        res.status(200).json({ status: 'success', data: schedule })
      } else {
        res.status(404).json({ status: 'error', message: 'Schedule not found' })
      }
    } catch (error) {
      next(error)
    }
  },

  // 更新醫生排班
  updateDoctorSchedule: async (req, res, next) => {
    const { id } = req.params
    const { scheduleSlot, date, maxAppointments, status } = req.body
    try {
      const updatedSchedule = await prisma.doctorSchedule.update({
        where: { id: parseInt(id) },
        data: { scheduleSlot, date, maxAppointments, status }
      })
      res.status(200).json({ status: 'success', data: updatedSchedule })
    } catch (error) {
      next(error)
    }
  },

  // 刪除醫生排班
  deleteDoctorSchedule: async (req, res, next) => {
    const { id } = req.params
    try {
      const deletedSchedule = await prisma.doctorSchedule.delete({
        where: { id: parseInt(id) }
      })
      res.status(200).json({ status: 'success', data: deletedSchedule })
    } catch (error) {
      next(error)
    }
  }
}

module.exports = doctorScheduleController