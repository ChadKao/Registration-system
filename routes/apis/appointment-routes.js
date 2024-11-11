const express = require('express')
const router = express.Router()
const appointmentController = require('../../controllers/apis/appointment-controller')
const { authenticated, authenticatedAdmin } = require('../../middleware/api-auth')

// Appointment 路由
router.get('/', appointmentController.getAllAppointments)
router.get('/:id', appointmentController.getAppointmentById)
router.put('/:id', authenticated, authenticatedAdmin, appointmentController.updateAppointment)
router.delete('/:id', authenticated, authenticatedAdmin, appointmentController.deleteAppointment)

router.post('/', authenticated, appointmentController.createAppointment)
router.post('/first-visit', appointmentController.createPatientAndAppointment)
router.post('/by-patient', authenticated, appointmentController.getAppointmentsByPatient)
router.patch('/:id', authenticated, appointmentController.cancelAppointment)

module.exports = router
