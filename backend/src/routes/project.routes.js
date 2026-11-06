const express = require('express');
const router = express.Router();
const projectController = require('../controllers/project.controller');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/', projectController.listProjects);
router.post('/', projectController.createProject);
router.get('/:id', projectController.getProjectById);
router.post('/:id/members', projectController.addMember);

module.exports = router;
