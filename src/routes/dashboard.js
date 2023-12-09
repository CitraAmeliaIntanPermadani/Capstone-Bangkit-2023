const express = require('express')
const router = express.Router()
// LOGIC NYA DARI API
// 1. dashboard
const dashboard  = require('../controllers/dashboard.js')

router.route('/').get(dashboard)

module.exports = router