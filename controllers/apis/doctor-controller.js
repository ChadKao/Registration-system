// /controllers/apis/doctor-controller.js
const prisma = require('../../services/prisma')
const { Prisma } = require('@prisma/client')
const today = new Date()
today.setHours(0, 0, 0, 0)

const doctorController = {
  // 新增醫生
  createDoctor: async (req, res, next) => {
    const { name, specialty, description, schedules } = req.body
    // 如果改成下拉式選單則這邊可以改成帶入specialtyId
    try {
      // 驗證輸入資料
      if (!name || !specialty) {
        return res.status(400).json({
          status: 'error',
          message: 'Name and specialty are required.'
        })
      }
      // 先根據科別名稱查找相應的專科
      const foundSpecialty = await prisma.specialty.findUnique({
        where: { name: specialty } // 根據名稱查找對應的專科
      })

      if (!foundSpecialty) {
        return res.status(400).json({
          status: 'error',
          message: `Specialty "${specialty}" not found!`
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
      return res.status(201).json({
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
      const totalDoctors = await prisma.doctor.count()
      let limit = req.query.limit ? Number(req.query.limit) : totalDoctors // 預設取全部醫師
      limit = limit > totalDoctors ? totalDoctors : limit < 1 ? 1 : limit
      const totalPage = limit ? Math.ceil(totalDoctors / limit) : 1 // 預設1頁
      let page = Number(req.query.page) || 1 // 預設第1頁
      page = page > totalPage ? totalPage : page < 1 ? 1 : page
      const offset = limit ? (page - 1) * limit : 0 // 預設無略過

      const sort = req.query.sort || 'specialty' // 預設依科別排序
      const order = req.query.order === 'desc' ? 'desc' : 'asc' // 預設為升序

      // 驗證排序欄位，確保它是有效的
      const validSortFields = ['name', 'specialty', 'id']
      if (!validSortFields.includes(sort)) {
        return res.status(400).json({
          status: 'error',
          message: 'Invalid sort field'
        })
      }

      let doctors

      if (sort === 'name') {
        doctors = await prisma.$queryRaw`
        SELECT d.*, s.name AS specialty_name
        FROM Doctor AS d
        LEFT JOIN Specialty AS s ON d.specialtyId = s.id
        ORDER BY CONVERT(d.name USING BIG5)  ${Prisma.sql([order])}
         LIMIT ${limit} OFFSET ${offset}
      `
      } else if (sort === 'specialty') {
        doctors = await prisma.$queryRaw`
        SELECT d.*, s.name AS specialty_name
        FROM Doctor AS d
        LEFT JOIN Specialty AS s ON d.specialtyId = s.id
        ORDER BY CONVERT(specialty_name USING BIG5)  ${Prisma.sql([order])}
         LIMIT ${limit} OFFSET ${offset}
      `
      } else {
        doctors = await prisma.doctor.findMany({
          include: {
            specialty: true // 包含專科資訊
          },
          take: limit,
          skip: offset,
          orderBy: {
            [sort]: order // 根據請求中的排序參數排序
          }
        })
      }

      // 格式化回傳資料，提取必要的欄位
      const formattedDoctors = doctors.map(doctor => ({
        id: doctor.id,
        name: doctor.name,
        specialty: doctor.specialty_name || doctor.specialty.name, // 直接回傳科別名稱
        description: doctor.description
      }))

      return res.status(200).json({
        status: 'success',
        totalDoctors,
        page,
        totalPage,
        limit,
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
          specialty: {
            select: {
              name: true
            }
          },
          schedules: {
            where: {
              date: {
                gte: today // 只選擇今天及以後的日程
              }
            },
            include: {
              _count: {
                select: {
                  appointments: {
                    where: {
                      status: 'CONFIRMED' // 只計算已確認的預約數量
                    }
                  }
                }
              }
            }
          }
        }
      })
      if (doctor) {
        const formattedSchedules = doctor.schedules.map(schedule => ({
          id: schedule.id,
          date: schedule.date,
          scheduleSlot: schedule.scheduleSlot,
          maxAppointments: schedule.maxAppointments,
          status: schedule.status,
          bookedAppointments: schedule._count.appointments // 計算已確認的預約數量
        }))
        const formattedDoctor = {
          id: doctor.id,
          name: doctor.name,
          specialty: doctor.specialty.name,
          description: doctor.description,
          schedules: formattedSchedules
        }

        return res.status(200).json({
          status: 'success',
          data: formattedDoctor
        })
      } else {
        return res.status(404).json({
          status: 'error',
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
      const foundSpecialty = await prisma.specialty.findUnique({
        where: { name: specialty } // 使用專科名稱來查詢
      })

      // 如果沒有找到對應的專科，返回錯誤
      if (!foundSpecialty) {
        return res.status(404).json({
          status: 'error',
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
            connect: { id: foundSpecialty.id } // 使用 connect 來連接到指定的專科
          }
        },
        include: {
          specialty: true
        }
      })
      return res.status(200).json({
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
      return res.status(200).json({
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
        },
        orderBy: {
          id: 'asc'
        }
      })
      const formattedCategories = categories.map(category => ({
        category: category.name,
        specialties: category.specialties.map(specialty => specialty.name) // 只返回專科名稱
      }))

      return res.status(200).json({
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
          specialty: true, // 確保返回專科資料
          schedules: {
            where: {
              date: {
                gte: today // 只選擇今天及以後的日程
              }
            }
          }
        }
      })
      const formattedDoctors = doctors.map(doctor => ({
        id: doctor.id,
        name: doctor.name,
        specialty: doctor.specialty.name, // 直接回傳科別名稱
        description: doctor.description,
        schedules: doctor.schedules
      }))
      return res.json(formattedDoctors) // 返回符合條件的醫師資料
    } catch (error) {
      next(error)
    }
  }
}

module.exports = doctorController
