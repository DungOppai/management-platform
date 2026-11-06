const express = require('express');
const router = express.Router();
const taskController = require('../controllers/task.controller');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/project/:projectId', taskController.listTasksByProject);
router.post('/', taskController.createTask);
router.put('/:id', taskController.updateTask);
router.delete('/:id', taskController.deleteTask);
router.post('/:id/checklists', taskController.addChecklistItem);
router.put('/checklists/:itemId/toggle', taskController.toggleChecklistItem);

module.exports = router;
