// /controllers/apis/doctor-controller.js
const prisma = require('../../services/prisma')

const doctorController = {
  // 新增醫生
  createDoctor: async (req, res, next) => {
    const { name, specialty } = req.body
    try {
      const newDoctor = await prisma.doctor.create({
        data: { name, specialty }
      })
      res.status(201).json({
        status: 'success',
        data: newDoctor
      })
    } catch (error) {
      next(error) // 將錯誤傳遞給錯誤處理中介軟體
    }
  },

  // 查詢所有醫生
  getAllDoctors: async (req, res, next) => {
    try {
      const doctors = await prisma.doctor.findMany()
      res.status(200).json({
        status: 'success',
        data: doctors
      })
    } catch (error) {
      next(error) // 將錯誤傳遞給錯誤處理中介軟體
    }
  },

  // 根據ID查詢醫生
  getDoctorById: async (req, res, next) => {
    const { id } = req.params
    try {
      const doctor = await prisma.doctor.findUnique({
        where: { id: parseInt(id) }
      })
      if (doctor) {
        res.status(200).json({
          status: 'success',
          data: doctor
        })
      } else {
        res.status(404).json({
          status: 'fail',
          message: "Doctor doesn't exist!"
        })
      }
    } catch (error) {
      next(error) // 將錯誤傳遞給錯誤處理中介軟體
    }
  },

  // 更新醫生
  updateDoctor: async (req, res, next) => {
    const { id } = req.params
    const { name, specialty } = req.body
    try {
      const updatedDoctor = await prisma.doctor.update({
        where: { id: parseInt(id) },
        data: { name, specialty }
      })
      res.status(200).json({
        status: 'success',
        data: updatedDoctor
      })
    } catch (error) {
      next(error) // 將錯誤傳遞給錯誤處理中介軟體
    }
  },

  // 刪除醫生
  deleteDoctor: async (req, res, next) => {
    const { id } = req.params
    try {
      const deletedDoctor = await prisma.doctor.delete({
        where: { id: parseInt(id) }
      })
      res.status(200).json({
        status: 'success',
        data: deletedDoctor
      }) // 成功刪除後，返回被刪除的deletedDoctor
    } catch (error) {
      next(error) // 將錯誤傳遞給錯誤處理中介軟體
    }
  }
}

module.exports = doctorController
