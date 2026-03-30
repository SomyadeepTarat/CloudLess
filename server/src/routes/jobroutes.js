const express = require('express');
const router = express.Router();
const controller = require('../controllers/jobcontroller');

router.post('/job', controller.submitJob);
router.get('/job', controller.getJob);
router.post('/result', controller.submitResult);
router.get('/all', controller.getAllJobs);
router.get('/status/:jobId', controller.getJobStatus);

module.exports = router;