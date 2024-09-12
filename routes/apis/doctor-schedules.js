const express = require('express')
const router = express.Router()
const doctorScheduleController = require('../../controllers/apis/doctorSchedule-controller')

// DoctorSchedule 路由
router.post('/', doctorScheduleController.createDoctorSchedule)
router.get('/', doctorScheduleController.getAllDoctorSchedules)
router.get('/:id', doctorScheduleController.getDoctorScheduleById)
router.put('/:id', doctorScheduleController.updateDoctorSchedule)
router.delete('/:id', doctorScheduleController.deleteDoctorSchedule)

router.get('/status/:id', doctorScheduleController.checkScheduleStatus)

router.get('/schedules-by-specialty/:specialty', doctorScheduleController.getSchedulesBySpecialty)

module.exports = router
