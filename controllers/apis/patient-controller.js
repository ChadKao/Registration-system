const prisma = require('../../services/prisma')
const bcrypt = require('bcryptjs')
const { validateIdNumber } = require('../../helpers/idValidation')

const patientController = {
  // 新增病人
  createPatient: async (req, res, next) => {
    const { medicalId, idNumber, birthDate, name, email, password } = req.body
    if (!(idNumber && birthDate && name)) {
      return res.status(400).json({
        status: 'error',
        message: '缺少必要的資料'
      })
    }
    try {
      // 驗證身分證字號
      if (!validateIdNumber(idNumber)) {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid ID number(身分證字號格式錯誤)'
        })
      }
      const existingPatient = await prisma.patient.findUnique({
        where: { idNumber }
      })

      if (existingPatient) {
        return res.status(400).json({
          status: 'error',
          message: 'Patient with this idNumber already exists!'
        })
      }
      const hashedPassword = password ? await bcrypt.hash(password, 10) : null

      // 如果不存在，則繼續創建新病人
      const newPatient = await prisma.patient.create({
        data: { medicalId, idNumber, birthDate, name, email, password: hashedPassword }
      })
      // 移除敏感的 hashedPassword 欄位
      delete newPatient.password

      return res.status(201).json({
        status: 'success',
        data: newPatient
      })
    } catch (error) {
      next(error)
    }
  },

  // 查詢所有病人
  getAllPatients: async (req, res, next) => {
    try {
      const patients = await prisma.patient.findMany()
      return res.status(200).json({
        status: 'success',
        data: patients
      })
    } catch (error) {
      next(error)
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
        return res.status(200).json({
          status: 'success',
          data: patient
        })
      } else {
        return res.status(404).json({
          status: 'error',
          message: "Patient doesn't exist!"
        })
      }
    } catch (error) {
      next(error)
    }
  },

  // 更新病人
  updatePatient: async (req, res, next) => {
    const { id } = req.params
    const { medicalId, idNumber, birthDate, name, email } = req.body
    try {
      const updatedPatient = await prisma.patient.update({
        where: { id: parseInt(id) },
        data: { medicalId, idNumber, birthDate, name, email }
      })
      return res.status(200).json({
        status: 'success',
        data: updatedPatient
      })
    } catch (error) {
      next(error)
    }
  },

  // 刪除病人
  deletePatient: async (req, res, next) => {
    const { id } = req.params
    try {
      const deletedPatient = await prisma.patient.delete({
        where: { id: parseInt(id) }
      })
      return res.status(200).json({
        status: 'success',
        data: deletedPatient
      }) // 成功刪除後，返回被刪除的deletedPatient
    } catch (error) {
      next(error)
    }
  }
}

module.exports = patientController
