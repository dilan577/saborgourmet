const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { estaAutenticado } = require('../middleware/auth');

router.get('/', estaAutenticado, dashboardController.index);

module.exports = router;
