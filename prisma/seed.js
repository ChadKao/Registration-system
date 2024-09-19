const prisma = require('../services/prisma')

// 星期幾的映射(限定星期一到五)
const dayMap = {
  1: 'Monday',
  2: 'Tuesday',
  3: 'Wednesday',
  4: 'Thursday',
  5: 'Friday'
}

// 時段
const timeSlots = ['Morning', 'Afternoon']

// 隨機選擇元素
function getRandomElement (arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

// 生成隨機日期
function generateRandomDate (start, end) {
  const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
  return date
}

async function main () {
  // 定義科別
  const specialties = ['一般內科', '一般外科', '皮膚科']

  // 確保每個科別有 3 位醫生
  for (const specialty of specialties) {
    for (let i = 0; i < 3; i++) {
      const doctorName = names[i + specialties.indexOf(specialty) * 3]
      const schedules = []

      for (let j = 0; j < 3; j++) {
        // 隨機生成日期
        const date = generateRandomDate(new Date('2024-09-02'), new Date('2024-09-05'))
        const dayOfWeek = dayMap[date.getDay()] // 獲取星期幾
        const timeSlot = getRandomElement(timeSlots)

        schedules.push({
          scheduleSlot: `${dayOfWeek}_${timeSlot}`,
          date,
          maxAppointments: 10,
          status: 'AVAILABLE'
        })
      }

      await prisma.doctor.create({
        data: {
          name: doctorName,
          specialty,
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
        idNumber: 'A123456789',
        birthDate: new Date('1990-01-01'),
        contactInfo: '聯絡資訊一' // 必須提供 contactInfo
      },
      {
        name: '病患二',
        medicalId: 'MED002', // 必須提供唯一的 medicalId
        idNumber: 'B987654321',
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
