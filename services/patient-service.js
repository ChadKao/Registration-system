const prisma = require('./prisma')
const { validateIdNumber } = require('../helpers/idValidation')

const createPatient = async (req, res, next) => {
  const { medicalId, idNumber, birthDate, name, email } = req.body
  if (!(idNumber && birthDate && name)) {
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
    const existingPatient = await prisma.patient.findUnique({
      where: { idNumber }
    })

    if (existingPatient) {
      return res.status(400).json({
        status: 'error',
        message: 'Patient with this idNumber already exists!'
      })
    }

    // 如果不存在，則繼續創建新病人
    const newPatient = await prisma.patient.create({
      data: { medicalId, idNumber, birthDate, name, email }
    })
    return newPatient
  } catch (error) {
    next(error) // 將錯誤傳遞給錯誤處理中介軟體
  }
}

module.exports = {
  createPatient
}
