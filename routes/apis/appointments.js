const express = require('express')
const router = express.Router()
const appointmentController = require('../../controllers/apis/appointment-controller')

// Appointment 路由
router.post('/', appointmentController.createAppointment)
router.get('/', appointmentController.getAllAppointments)
router.get('/:id', appointmentController.getAppointmentById)
router.post('/by-patient', appointmentController.getAppointmentsByPatient)

router.put('/:id', appointmentController.updateAppointment)
router.delete('/:id', appointmentController.deleteAppointment)

module.exports = router
