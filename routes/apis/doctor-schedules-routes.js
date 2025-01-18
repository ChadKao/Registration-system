const express = require('express')
const router = express.Router()
const doctorScheduleController = require('../../controllers/apis/doctorSchedule-controller')

// DoctorSchedule 路由
router.get('/', doctorScheduleController.getAllDoctorSchedules)
router.get('/:id', doctorScheduleController.getDoctorScheduleById)

router.get('/status/:id', doctorScheduleController.checkScheduleStatus)

router.get('/schedules-by-specialty/:specialty', doctorScheduleController.getSchedulesBySpecialty)
router.get('/schedules-by-doctor/:doctorId', doctorScheduleController.getSchedulesByDoctorId)
// 執行cron-job用
router.post('/cron/check-slots', doctorScheduleController.checkAndGenerateDoctorSlots)

module.exports = router
