const express = require('express');
const router = express.Router();
const controller = require('../controllers/recommendercontroller');

router.post('/resources', controller.recommendResources);

module.exports = router;
