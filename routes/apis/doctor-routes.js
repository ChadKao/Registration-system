// /routes/apis/doctor-routes.js
const express = require('express')
const router = express.Router()
const doctorController = require('../../controllers/apis/doctor-controller')
const { authenticated, authenticatedAdmin } = require('../../middleware/api-auth')
const { csrfProtection } = require('../../controllers/auth-controller')

// 醫師 CRUD API 路由
router.post('/', csrfProtection, authenticated, authenticatedAdmin, doctorController.createDoctor)
router.get('/', doctorController.getAllDoctors)
router.get('/specialties', doctorController.getSpecialties)
router.get('/search-doctors', doctorController.searchDoctors)
router.get('/:id', doctorController.getDoctorById)
router.put('/:id', csrfProtection, authenticated, authenticatedAdmin, doctorController.updateDoctor)
router.delete('/:id', csrfProtection, authenticated, authenticatedAdmin, doctorController.deleteDoctor)

module.exports = router
