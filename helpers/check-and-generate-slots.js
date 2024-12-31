const prisma = require('../services/prisma')

async function checkAndGenerateDoctorSlots (doctorId, requiredWeeks = 2) {
  const today = new Date()

  const scheduleSlots = await prisma.doctorSchedule.findMany({
    where: {
      doctorId
      // date: {
      //   gte: today // 僅獲取未來的排班
      // }
    },
    select: {
      scheduleSlot: true,
      date: true
    },
    distinct: ['scheduleSlot'] // 確保每個時段唯一
  })

  for (const { scheduleSlot, date } of scheduleSlots) {
    const schedules = await prisma.doctorSchedule.findMany({
      where: {
        doctorId,
        scheduleSlot,
        date: {
          gte: today
        }
      },
      orderBy: {
        date: 'asc'
      }
    })

    let remainingWeeks = schedules.length

    if (remainingWeeks < requiredWeeks) {
      let lastScheduleDate = null

      if (remainingWeeks === 0) {
        const scheduleDate = new Date(date)
        // eslint-disable-next-line no-unmodified-loop-condition
        while (scheduleDate < today) {
          scheduleDate.setDate(scheduleDate.getDate() + 7)
        }
        scheduleDate.setDate(scheduleDate.getDate() - 7) // 減 7 天
        lastScheduleDate = new Date(scheduleDate)
      } else {
        lastScheduleDate = schedules[schedules.length - 1].date
      }

      // 生成新的排班
      while (remainingWeeks < requiredWeeks) {
        const newSlotDate = new Date(lastScheduleDate)
        newSlotDate.setDate(lastScheduleDate.getDate() + 7) // 增加一週

        await prisma.doctorSchedule.create({
          data: {
            doctorId,
            scheduleSlot,
            date: newSlotDate,
            maxAppointments: 10,
            status: 'AVAILABLE'
          }
        })

        remainingWeeks++
        lastScheduleDate = newSlotDate
      }
    }
  }
}

module.exports = {
  checkAndGenerateDoctorSlots
}
