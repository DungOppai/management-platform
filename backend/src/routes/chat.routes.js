const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat.controller');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/project/:projectId', chatController.listMessages);
router.post('/project/:projectId', chatController.sendMessage);

module.exports = router;
