const express = require('express');
const router = express.Router();
const controller = require('../controllers/nodecontroller');

router.post('/register', controller.registerNode);
router.post('/heartbeat', controller.heartbeat);
router.post('/stop', controller.stopNode);
router.get('/all', controller.getNodes);

module.exports = router;
