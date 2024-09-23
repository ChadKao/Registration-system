// /routes/apis/doctor-routes.js
const express = require('express')
const router = express.Router()
const doctorController = require('../../controllers/apis/doctor-controller')

// 醫師 CRUD API 路由
router.post('/', doctorController.createDoctor)
router.get('/', doctorController.getAllDoctors)
router.get('/specialties', doctorController.getUniqueSpecialties)
router.get('/search-doctors', doctorController.searchDoctors)
router.get('/:id', doctorController.getDoctorById)
router.put('/:id', doctorController.updateDoctor)
router.delete('/:id', doctorController.deleteDoctor)

module.exports = router
