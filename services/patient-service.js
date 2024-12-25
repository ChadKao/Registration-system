const prisma = require('./prisma')
const { validateIdNumber } = require('../helpers/idValidation')
const validator = require('validator')
const AppError = require('../errors/AppError')

const createPatient = async (patientData) => {
  const { medicalId, idNumber, birthDate, name, email } = patientData
  if (!(idNumber && birthDate && name)) {
    throw new AppError('缺少必要的資料', 400)
  }
  // 驗證身分證字號
  if (!validateIdNumber(idNumber)) {
    throw new AppError('Invalid ID number (身分證字號格式錯誤)', 400)
  }
  if (email && !validator.isEmail(email)) {
    throw new AppError('Invalid email format(Email格式錯誤)', 400)
  }
  const existingPatient = await prisma.patient.findUnique({
    where: { idNumber }
  })

  if (existingPatient) {
    throw new AppError('Patient with this idNumber already exists!', 400)
  }

  // 如果不存在，則繼續創建新病人
  const newPatient = await prisma.patient.create({
    data: { medicalId, idNumber, birthDate, name, email }
  })
  return newPatient
}

module.exports = {
  createPatient
}
