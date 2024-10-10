const express = require('express')
const router = express.Router()
const appointmentController = require('../../controllers/apis/appointment-controller')

// Appointment 路由
router.post('/', appointmentController.createAppointment)
router.post('/first-visit', appointmentController.createPatientAndAppointment)
router.get('/', appointmentController.getAllAppointments)
router.get('/:id', appointmentController.getAppointmentById)
router.post('/by-patient', appointmentController.getAppointmentsByPatient)

router.put('/:id', appointmentController.updateAppointment)
router.patch('/:id', appointmentController.cancelAppointment)
router.delete('/:id', appointmentController.deleteAppointment)

module.exports = router
