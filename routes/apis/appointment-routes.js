const express = require('express')
const router = express.Router()
const appointmentController = require('../../controllers/apis/appointment-controller')
const { authenticated, authenticatedAdmin } = require('../../middleware/api-auth')
const { csrfProtection } = require('../../controllers/auth-controller')

// Appointment 路由
router.get('/', csrfProtection, authenticated, authenticatedAdmin, appointmentController.getAllAppointments)
router.get('/:id', csrfProtection, authenticated, appointmentController.getAppointmentById)
router.put('/:id', csrfProtection, authenticated, authenticatedAdmin, appointmentController.updateAppointment)
router.delete('/:id', csrfProtection, authenticated, authenticatedAdmin, appointmentController.deleteAppointment)
router.get('/by-patient-admin/:id', csrfProtection, authenticated, authenticatedAdmin, appointmentController.getAppointmentsByPatientForAdmin)

router.post('/', csrfProtection, authenticated, appointmentController.createAppointment)
router.post('/first-visit', appointmentController.createPatientAndAppointment)
router.post('/by-patient', csrfProtection, authenticated, appointmentController.getAppointmentsByPatient)
router.patch('/:id', csrfProtection, authenticated, appointmentController.cancelAppointment)

module.exports = router
