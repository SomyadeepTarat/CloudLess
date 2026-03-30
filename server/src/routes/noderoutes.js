const express = require('express');
const router = express.Router();
const controller = require('../controllers/nodecontroller');

router.post('/register', controller.registerNode);
router.post('/heartbeat', controller.heartbeat);
router.get('/nodes/all', controller.getNodes);

module.exports = router;