const express = require('express');
const router = express.Router();
const aiController = require('../controllers/ai.controller');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

router.post('/extract-task', aiController.extractTaskFromChat);
router.post('/standup-report', aiController.generateStandup);
router.get('/bottlenecks/:projectId', aiController.detectBottlenecks);
router.get('/chat-catchup/:projectId', aiController.summarizeChat);

module.exports = router;
