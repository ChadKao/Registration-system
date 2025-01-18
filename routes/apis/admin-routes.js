const express = require('express')
const router = express.Router()
const doctorController = require('../../controllers/apis/doctor-controller')
const doctorScheduleController = require('../../controllers/apis/doctorSchedule-controller')
const appointmentController = require('../../controllers/apis/appointment-controller')
const patientController = require('../../controllers/apis/patient-controller')
const { authenticated, authenticatedAdmin } = require('../../middleware/api-auth')
const { csrfProtection, localSignIn } = require('../../controllers/auth-controller')
const { authenticatedByLocal } = require('../../middleware/api-auth')

// Doctor routes
router.post('/doctors', csrfProtection, authenticated, authenticatedAdmin, doctorController.createDoctor)
router.put('/doctors/:id', csrfProtection, authenticated, authenticatedAdmin, doctorController.updateDoctor)
router.delete('/doctors/:id', csrfProtection, authenticated, authenticatedAdmin, doctorController.deleteDoctor)

// DoctorSchedule routes
router.post('/doctor-schedules', csrfProtection, authenticated, authenticatedAdmin, doctorScheduleController.createDoctorSchedule)
router.put('/doctor-schedules/:id', csrfProtection, authenticated, authenticatedAdmin, doctorScheduleController.updateDoctorSchedule)
router.delete('/doctor-schedules/:id', csrfProtection, authenticated, authenticatedAdmin, doctorScheduleController.deleteDoctorSchedule)

// Appointment routes
router.get('/appointments', csrfProtection, authenticated, authenticatedAdmin, appointmentController.getAllAppointments)
router.get('/appointments/:patientId', csrfProtection, authenticated, authenticatedAdmin, appointmentController.getAppointmentsByPatientForAdmin)
router.get('/appointments/past/:patientId', csrfProtection, authenticated, authenticatedAdmin, appointmentController.getPastAppointmentsByPatientForAdmin)
router.get('/appointments/all/:patientId', csrfProtection, authenticated, authenticatedAdmin, appointmentController.getAllAppointmentsByPatientForAdmin)
router.put('/appointments/:id', csrfProtection, authenticated, authenticatedAdmin, appointmentController.updateAppointment)
router.delete('/appointments/:id', csrfProtection, authenticated, authenticatedAdmin, appointmentController.deleteAppointment)

// Patient routes
router.get('/patients', csrfProtection, authenticated, authenticatedAdmin, patientController.getAllPatients)
router.delete('/patients/:id', csrfProtection, authenticated, authenticatedAdmin, patientController.deletePatient)

router.post('/sign-in', authenticatedByLocal('local-admin'), localSignIn)

module.exports = router
