const express = require('express')
const router = express.Router()
const appointmentController = require('../../controllers/apis/appointment-controller')
const { authenticated } = require('../../middleware/api-auth')
const { csrfProtection } = require('../../controllers/auth-controller')

// Appointment 路由
router.post('/', csrfProtection, authenticated, appointmentController.createAppointment)
router.post('/first-visit', appointmentController.createPatientAndAppointment)
router.post('/by-patient', csrfProtection, authenticated, appointmentController.getAppointmentsByPatient)
router.post('/by-patient/past', csrfProtection, authenticated, appointmentController.getPastAppointmentsByPatient)
router.patch('/:id', csrfProtection, authenticated, appointmentController.cancelAppointment)

module.exports = router
