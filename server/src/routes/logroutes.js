const express = require('express');
const router = express.Router();
const controller = require('../controllers/logcontroller');

router.get('/stats', controller.getSystemStats);

module.exports = router;