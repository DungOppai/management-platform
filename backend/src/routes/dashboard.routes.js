const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/project/:projectId', dashboardController.getProjectDashboardStats);

module.exports = router;
