const express = require('express')
const router = express.Router()
const doctorScheduleController = require('../../controllers/apis/doctorSchedule-controller')
const { authenticated, authenticatedAdmin } = require('../../middleware/api-auth')
const { csrfProtection } = require('../../controllers/auth-controller')

// DoctorSchedule 路由
router.post('/', csrfProtection, authenticated, authenticatedAdmin, doctorScheduleController.createDoctorSchedule)
router.get('/', doctorScheduleController.getAllDoctorSchedules)
router.get('/:id', doctorScheduleController.getDoctorScheduleById)
router.put('/:id', csrfProtection, authenticated, authenticatedAdmin, doctorScheduleController.updateDoctorSchedule)
router.delete('/:id', csrfProtection, authenticated, authenticatedAdmin, doctorScheduleController.deleteDoctorSchedule)

router.get('/status/:id', doctorScheduleController.checkScheduleStatus)

router.get('/schedules-by-specialty/:specialty', doctorScheduleController.getSchedulesBySpecialty)
router.get('/schedules-by-doctor/:doctorId', doctorScheduleController.getSchedulesByDoctorId)

router.post('/cron/check-slots', doctorScheduleController.checkAndGenerateDoctorSlots)

module.exports = router
