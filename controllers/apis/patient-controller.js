const prisma = require('../../services/prisma')

const patientController = {
  // 新增病人
  createPatient: async (req, res, next) => {
    const { medicalId, idNumber, birthDate, name, contactInfo } = req.body
    try {
      const existingPatient = await prisma.patient.findUnique({
        where: { medicalId }
      })

      if (existingPatient) {
        return res.status(400).json({
          status: 'error',
          message: 'Patient with this medicalId already exists!'
        })
      }

      // 如果不存在，則繼續創建新病人
      const newPatient = await prisma.patient.create({
        data: { medicalId, idNumber, birthDate, name, contactInfo }
      })
      res.status(201).json({
        status: 'success',
        data: newPatient
      })
    } catch (error) {
      next(error) // 將錯誤傳遞給錯誤處理中介軟體
    }
  },

  // 查詢所有病人
  getAllPatients: async (req, res, next) => {
    try {
      const patients = await prisma.patient.findMany()
      res.status(200).json({
        status: 'success',
        data: patients
      })
    } catch (error) {
      next(error) // 將錯誤傳遞給錯誤處理中介軟體
    }
  },

  // 根據ID查詢病人
  getPatientById: async (req, res, next) => {
    const { id } = req.params
    try {
      const patient = await prisma.patient.findUnique({
        where: { id: parseInt(id) }
      })
      if (patient) {
        res.status(200).json({
          status: 'success',
          data: patient
        })
      } else {
        res.status(404).json({
          status: 'fail',
          message: "Patient doesn't exist!"
        })
      }
    } catch (error) {
      next(error) // 將錯誤傳遞給錯誤處理中介軟體
    }
  },

  // 更新病人
  updatePatient: async (req, res, next) => {
    const { id } = req.params
    const { medicalId, idNumber, birthDate, name, contactInfo } = req.body
    try {
      const updatedPatient = await prisma.patient.update({
        where: { id: parseInt(id) },
        data: { medicalId, idNumber, birthDate, name, contactInfo }
      })
      res.status(200).json({
        status: 'success',
        data: updatedPatient
      })
    } catch (error) {
      next(error) // 將錯誤傳遞給錯誤處理中介軟體
    }
  },

  // 刪除病人
  deletePatient: async (req, res, next) => {
    const { id } = req.params
    try {
      const deletedPatient = await prisma.patient.delete({
        where: { id: parseInt(id) }
      })
      res.status(200).json({
        status: 'success',
        data: deletedPatient
      }) // 成功刪除後，返回被刪除的deletedPatient
    } catch (error) {
      next(error) // 將錯誤傳遞給錯誤處理中介軟體
    }
  }
}

module.exports = patientController
