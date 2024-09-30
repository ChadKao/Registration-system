// /controllers/apis/doctor-controller.js
const prisma = require('../../services/prisma')

const doctorController = {
  // 新增醫生
  createDoctor: async (req, res, next) => {
    const { name, specialty, description, schedules } = req.body
    try {
      // 驗證輸入資料
      if (!name || !specialty) {
        return res.status(400).json({
          status: 'fail',
          message: 'Name and specialty are required.'
        })
      }
      // 先根據科別名稱查找相應的專科
      const foundSpecialty = await prisma.specialty.findUnique({
        where: { name: specialty } // 根據名稱查找對應的專科
      })

      if (!foundSpecialty) {
        return res.status(400).json({
          status: 'fail',
          message: '找不到對應的科別'
        })
      }
      const newDoctor = await prisma.doctor.create({
        data: {
          name,
          specialty: {
            connect: { id: foundSpecialty.id } // 確保 specialtyId 是存在的
          },
          description,
          schedules: {
            create: schedules
          }
        },
        include: {
          specialty: true, // 包含專科資訊
          schedules: true // 包含日程資訊
        }
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
      // 從資料庫獲取所有醫生資料，並包含其科別資訊
      const doctors = await prisma.doctor.findMany({
        include: {
          specialty: true // 包含專科資訊
        }
      })

      // 格式化回傳資料，提取必要的欄位
      const formattedDoctors = doctors.map(doctor => ({
        id: doctor.id,
        name: doctor.name,
        specialty: doctor.specialty.name, // 直接回傳科別名稱
        description: doctor.description
      }))

      res.status(200).json({
        status: 'success',
        data: formattedDoctors // 返回格式化後的醫生資料
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
        where: { id: parseInt(id) },
        include: {
          specialty: true, // 包含科別資料
          schedules: true // 包含醫生的排班表
        }
      })
      if (doctor) {
        const formattedDoctor = {
          id: doctor.id,
          name: doctor.name,
          specialty: doctor.specialty.name,
          description: doctor.description,
          schedules: doctor.schedules
        }

        res.status(200).json({
          status: 'success',
          data: formattedDoctor
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
    const { name, specialty, description } = req.body
    try {
      // 根據專科名稱查找對應的專科 ID
      const specialtyRecord = await prisma.specialty.findUnique({
        where: { name: specialty } // 使用專科名稱來查詢
      })

      // 如果沒有找到對應的專科，返回錯誤
      if (!specialtyRecord) {
        return res.status(404).json({
          status: 'fail',
          message: `Specialty "${specialty}" not found!`
        })
      }

      // 使用找到的專科 ID 來更新醫生的專科
      const updatedDoctor = await prisma.doctor.update({
        where: { id: parseInt(id) },
        data: {
          name,
          description,
          specialty: {
            connect: { id: specialtyRecord.id } // 使用 connect 來連接到指定的專科
          }
        },
        include: {
          specialty: true
        }
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
  },
  getSpecialties: async (req, res, next) => {
    try {
      const categories = await prisma.category.findMany({
        include: {
          specialties: true // 包含每個類別中的所有專科資料
        }
      })
      const formattedCategories = categories.map(category => ({
        category: category.name,
        specialties: category.specialties.map(specialty => specialty.name) // 只返回專科名稱
      }))

      res.status(200).json({
        status: 'success',
        data: formattedCategories
      })
    } catch (error) {
      next(error)
    }
  },
  searchDoctors: async (req, res, next) => {
    const keyword = req.query.keyword?.trim() || ''// 從查詢參數獲取關鍵字

    try {
      const doctors = await prisma.doctor.findMany({
        where: {
          OR: [
            { name: { contains: keyword } }, // 醫師姓名
            { specialty: { name: { contains: keyword } } }, // 科別
            { description: { contains: keyword } } // 主治專長
          ]
        },
        include: {
          specialty: true // 確保返回專科資料
        }
      })
      const formattedDoctors = doctors.map(doctor => ({
        id: doctor.id,
        name: doctor.name,
        specialty: doctor.specialty.name, // 直接回傳科別名稱
        description: doctor.description
      }))
      res.json(formattedDoctors) // 返回符合條件的醫師資料
    } catch (error) {
      next(error)
    }
  }
}

module.exports = doctorController
