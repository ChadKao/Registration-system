const prisma = require('../services/prisma')
// 可配置變數
const NUM_DOCTORS_PER_CATEGORY = 3 // 每個科別的醫生數量
const NUM_SCHEDULES_PER_DOCTOR = 3 // 每位醫生的時段數量

const doctorDescriptions = [
  // 一般內科
  ['高血壓', '糖尿病', '慢性病管理', '心血管疾病', '內分泌疾病', '腎臟病', '呼吸系統疾病', '傳染病'],
  ['消化道問題', '胃腸道疾病', '肝臟疾病', '內視鏡學', '膽胰疾病', '幽門螺旋桿菌', '超音波術', '胃癌'],
  ['呼吸系統疾病', '過敏反應', '慢性阻塞性肺病', '肺炎', '哮喘', '傳染病控制', '免疫系統', '代謝疾病'],

  // 一般外科
  ['心臟外科', '血管外科', '急救手術', '創傷處理', '器官移植', '胸腔外科', '肝膽手術', '腹腔鏡手術'],
  ['腹腔鏡手術', '膽囊切除', '闌尾切除', '腸道修復手術', '內視鏡手術', '胃癌切除', '大腸癌手術', '急診手術'],
  ['創傷外科', '急診外科', '燒傷處理', '腹腔手術', '胸腔手術', '結直腸手術', '急救處理', '血管修復手術'],

  // 皮膚科
  ['皮膚過敏', '濕疹', '異位性皮膚炎', '蕁麻疹', '銀屑病', '皮膚病理', '皮膚真菌感染', '青春痘治療'],
  ['皮膚美容', '微整形', '去角質', '注射填充劑', '皮膚老化治療', '雷射美容', '去疤手術', '脂肪移植'],
  ['皮膚癌', '黑色素瘤', '基底細胞癌', '皮膚腫瘤切除', '皮膚病變', '早期皮膚癌診斷', '冷凍治療', '放射療法']
]

// 星期幾的映射(限定星期一到五)
const scheduleArray = [
  { dayOfWeek: 'Monday', date: new Date('2024-09-02') },
  { dayOfWeek: 'Tuesday', date: new Date('2024-09-03') },
  { dayOfWeek: 'Wednesday', date: new Date('2024-09-04') },
  { dayOfWeek: 'Thursday', date: new Date('2024-09-05') },
  { dayOfWeek: 'Friday', date: new Date('2024-09-06') }
]

// 時段
const timeSlots = ['Morning', 'Afternoon']

// 生成所有可能的 dayOfWeek 和 timeSlot 組合
const allPossibleSlots = []

for (const day of scheduleArray) {
  for (const slot of timeSlots) {
    allPossibleSlots.push({
      dayOfWeek: day.dayOfWeek,
      date: day.date,
      timeSlot: slot
    })
  }
}

// 映射星期幾為數字方便排序
const dayOrderMap = {
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5
}

async function main () {
  // 定義科別
  const categories = ['內科', '外科', '其他']
  const specialties = ['一般內科', '一般外科', '皮膚科']

  // 確保每個科別有 對應數量 位醫生
  for (let i = 0; i < categories.length; i++) {
    const categoryName = categories[i]
    const specialtyName = specialties[i]

    // 創建類別
    const category = await prisma.category.create({
      data: {
        name: categoryName,
        specialties: {
          create: [{ name: specialtyName }] // 創建對應的專科
        }
      },
      include: {
        specialties: true // 確保返回 specialties
      }
    })

    for (let j = 0; j < NUM_DOCTORS_PER_CATEGORY; j++) {
      const doctorName = names[j + i * NUM_DOCTORS_PER_CATEGORY]
      const schedules = []
      const description = JSON.stringify(doctorDescriptions[j + i * 3]) // 獲取對應的主治專長描述
      const availableSlots = [...allPossibleSlots]

      // 確保每個科別有 對應數量 時段
      for (let k = 0; k < NUM_SCHEDULES_PER_DOCTOR; k++) {
        // 隨機選擇一個時段，並從可用時段中移除
        const randomIndex = Math.floor(Math.random() * availableSlots.length)
        const selectedSlot = availableSlots.splice(randomIndex, 1)[0] // 取得並移除該時段

        const { dayOfWeek, date, timeSlot } = selectedSlot

        schedules.push({
          scheduleSlot: `${dayOfWeek}_${timeSlot}`,
          date, // 使用對應的日期
          maxAppointments: 10,
          status: 'AVAILABLE'
        })
      }

      // 根據 dayOfWeek 和 timeSlot 排序 schedules
      schedules.sort((a, b) => {
        const dayA = dayOrderMap[a.scheduleSlot.split('_')[0]]
        const dayB = dayOrderMap[b.scheduleSlot.split('_')[0]]

        // 如果是同一天，再比較 Morning 和 Afternoon
        if (dayA === dayB) {
          const timeA = a.scheduleSlot.includes('Morning') ? 0 : 1
          const timeB = b.scheduleSlot.includes('Morning') ? 0 : 1
          return timeA - timeB
        }
        return dayA - dayB
      })

      await prisma.doctor.create({
        data: {
          name: doctorName,
          specialty: {
            connect: { id: category.specialties[0].id } // 將醫生連接到相對應的專科
          },
          description,
          schedules: {
            create: schedules
          }
        }
      })
    }
  }
  // 填充 Patient
  await prisma.patient.createMany({
    data: [
      {
        name: '病患一',
        medicalId: 'MED001', // 必須提供唯一的 medicalId
        idNumber: 'K207654606',
        birthDate: new Date('1990-01-01'),
        contactInfo: '聯絡資訊一' // 必須提供 contactInfo
      },
      {
        name: '病患二',
        medicalId: 'MED002', // 必須提供唯一的 medicalId
        idNumber: 'J103371747',
        birthDate: new Date('1992-05-10'),
        contactInfo: '聯絡資訊二' // 必須提供 contactInfo
      }
    ]
  })

  const patientList = await prisma.patient.findMany()
  const scheduleList = await prisma.doctorSchedule.findMany()

  // 填充 appointment
  await prisma.appointment.createMany({
    data: [
      {
        patientId: patientList[0].id,
        doctorScheduleId: scheduleList[0].id,
        consultationNumber: 1,
        status: 'CONFIRMED'
      },
      {
        patientId: patientList[1].id,
        doctorScheduleId: scheduleList[1].id,
        consultationNumber: 1,
        status: 'CONFIRMED'
      }
    ]
  })
}

const names = [
  '張偉華', '李靜文', '王超群',
  '趙麗萍', '錢勇軍', '孫娜娜',
  '周敏玲', '吳軍超', '鄭洋洋'
]

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
