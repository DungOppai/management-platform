const db = require('../config/db');

async function listTasksByProject(req, res) {
  try {
    const { projectId } = req.params;
    const tasksRes = await db.query(
      `SELECT t.*, 
              u_assignee.full_name as assignee_name, 
              u_assignee.avatar_url as assignee_avatar,
              u_creator.full_name as creator_name
       FROM tasks t
       LEFT JOIN users u_assignee ON t.assignee_id = u_assignee.id
       LEFT JOIN users u_creator ON t.creator_id = u_creator.id
       WHERE t.project_id = $1
       ORDER BY t.priority = 'URGENT' DESC, t.due_date ASC NULLS LAST, t.created_at DESC`,
      [projectId]
    );

    const taskIds = tasksRes.rows.map((t) => t.id);
    let checklistsByTaskId = {};

    if (taskIds.length > 0) {
      const checkRes = await db.query(
        `SELECT * FROM task_checklists WHERE task_id = ANY($1) ORDER BY id ASC`,
        [taskIds]
      );
      checkRes.rows.forEach((item) => {
        if (!checklistsByTaskId[item.task_id]) {
          checklistsByTaskId[item.task_id] = [];
        }
        checklistsByTaskId[item.task_id].push(item);
      });
    }

    const tasks = tasksRes.rows.map((t) => ({
      ...t,
      checklists: checklistsByTaskId[t.id] || [],
    }));

    res.json({ tasks });
  } catch (err) {
    console.error('List tasks error:', err);
    res.status(500).json({ error: 'Lỗi khi lấy danh sách công việc' });
  }
}

async function createTask(req, res) {
  try {
    const { projectId, title, description, priority, dueDate, assigneeId, checklists } = req.body;
    if (!projectId || !title) {
      return res.status(400).json({ error: 'Thiếu thông tin dự án hoặc tiêu đề công việc' });
    }

    const taskRes = await db.query(
      `INSERT INTO tasks (project_id, title, description, status, priority, progress, due_date, creator_id, assignee_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        projectId,
        title,
        description || '',
        'TODO',
        priority || 'MEDIUM',
        0,
        dueDate || null,
        req.user.id,
        assigneeId || null,
      ]
    );

    const task = taskRes.rows[0];

    // Checklists if provided
    let createdChecklists = [];
    if (Array.isArray(checklists) && checklists.length > 0) {
      for (const itemTitle of checklists) {
        if (typeof itemTitle === 'string' && itemTitle.trim()) {
          const itemRes = await db.query(
            `INSERT INTO task_checklists (task_id, title, is_completed)
             VALUES ($1, $2, false) RETURNING *`,
            [task.id, itemTitle.trim()]
          );
          createdChecklists.push(itemRes.rows[0]);
        }
      }
    }

    // Get assignee name for response
    let assigneeName = null;
    if (task.assignee_id) {
      const userRes = await db.query('SELECT full_name FROM users WHERE id = $1', [task.assignee_id]);
      if (userRes.rows.length > 0) assigneeName = userRes.rows[0].full_name;
    }

    const completeTask = {
      ...task,
      assignee_name: assigneeName,
      creator_name: req.user.full_name,
      checklists: createdChecklists,
    };

    // Broadcast socket event if available
    if (req.io) {
      req.io.to(`project_${projectId}`).emit('task_created', completeTask);
    }

    res.status(201).json({ message: 'Tạo công việc thành công', task: completeTask });
  } catch (err) {
    console.error('Create task error:', err);
    res.status(500).json({ error: 'Lỗi khi tạo công việc mới' });
  }
}

async function updateTask(req, res) {
  try {
    const { id } = req.params;
    const { title, description, status, priority, progress, dueDate, assigneeId } = req.body;

    const fields = [];
    const values = [];
    let idx = 1;

    if (title !== undefined) {
      fields.push(`title = $${idx++}`);
      values.push(title);
    }
    if (description !== undefined) {
      fields.push(`description = $${idx++}`);
      values.push(description);
    }
    if (status !== undefined) {
      fields.push(`status = $${idx++}`);
      values.push(status);
      if (status === 'DONE' && progress === undefined) {
        fields.push(`progress = 100`);
      }
    }
    if (priority !== undefined) {
      fields.push(`priority = $${idx++}`);
      values.push(priority);
    }
    if (progress !== undefined) {
      const progNum = Math.min(100, Math.max(0, parseInt(progress, 10) || 0));
      fields.push(`progress = $${idx++}`);
      values.push(progNum);
      if (status === undefined) {
        if (progNum === 100) {
          fields.push(`status = 'DONE'`);
        } else {
          fields.push(`status = CASE WHEN status = 'DONE' THEN (CASE WHEN ${progNum} > 0 THEN 'IN_PROGRESS' ELSE 'TODO' END) ELSE status END`);
        }
      }
    }
    if (dueDate !== undefined) {
      fields.push(`due_date = $${idx++}`);
      values.push(dueDate || null);
    }
    if (assigneeId !== undefined) {
      fields.push(`assignee_id = $${idx++}`);
      values.push(assigneeId || null);
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const updateQuery = `
      UPDATE tasks
      SET ${fields.join(', ')}
      WHERE id = $${idx}
      RETURNING *
    `;

    const result = await db.query(updateQuery, values);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy công việc' });
    }

    const updatedTask = result.rows[0];

    // Fetch assignee name & checklists
    const uRes = await db.query('SELECT full_name, avatar_url FROM users WHERE id = $1', [updatedTask.assignee_id]);
    const cRes = await db.query('SELECT * FROM task_checklists WHERE task_id = $1 ORDER BY id ASC', [id]);

    const completeTask = {
      ...updatedTask,
      assignee_name: uRes.rows[0]?.full_name || null,
      assignee_avatar: uRes.rows[0]?.avatar_url || null,
      checklists: cRes.rows,
    };

    if (req.io) {
      req.io.to(`project_${updatedTask.project_id}`).emit('task_updated', completeTask);
    }

    res.json({ message: 'Cập nhật thành công', task: completeTask });
  } catch (err) {
    console.error('Update task error:', err);
    res.status(500).json({ error: 'Lỗi khi cập nhật công việc' });
  }
}

async function deleteTask(req, res) {
  try {
    const { id } = req.params;
    const taskRes = await db.query('DELETE FROM tasks WHERE id = $1 RETURNING project_id', [id]);
    if (taskRes.rows.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy công việc để xóa' });
    }

    const projectId = taskRes.rows[0].project_id;
    if (req.io) {
      req.io.to(`project_${projectId}`).emit('task_deleted', { id: parseInt(id, 10), projectId });
    }

    res.json({ message: 'Xóa công việc thành công' });
  } catch (err) {
    console.error('Delete task error:', err);
    res.status(500).json({ error: 'Lỗi khi xóa công việc' });
  }
}

async function addChecklistItem(req, res) {
  try {
    const { id } = req.params;
    const { title } = req.body;
    if (!title) return res.status(400).json({ error: 'Vui lòng nhập tên đầu việc' });

    const result = await db.query(
      `INSERT INTO task_checklists (task_id, title, is_completed)
       VALUES ($1, $2, false) RETURNING *`,
      [id, title]
    );

    res.status(201).json({ item: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi khi thêm checklist' });
  }
}

async function toggleChecklistItem(req, res) {
  try {
    const { itemId } = req.params;
    const result = await db.query(
      `UPDATE task_checklists
       SET is_completed = NOT is_completed
       WHERE id = $1 RETURNING *`,
      [itemId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy checklist' });
    }

    const item = result.rows[0];

    // Auto calculate progress percentage based on checklist items
    const allItems = await db.query('SELECT is_completed FROM task_checklists WHERE task_id = $1', [item.task_id]);
    const total = allItems.rows.length;
    const done = allItems.rows.filter((i) => i.is_completed).length;
    const newProgress = Math.round((done / total) * 100);

    const taskUpdate = await db.query(
      `UPDATE tasks
       SET progress = $1, status = CASE WHEN $1 = 100 THEN 'DONE' ELSE status END
       WHERE id = $2 RETURNING *`,
      [newProgress, item.task_id]
    );

    res.json({ item, updatedTask: taskUpdate.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi khi cập nhật checklist' });
  }
}

async function deleteChecklistItem(req, res) {
  try {
    const { itemId } = req.params;
    await db.query(`DELETE FROM task_checklists WHERE id = $1`, [itemId]);
    res.json({ message: 'Xóa mục checklist thành công' });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi khi xóa checklist' });
  }
}

module.exports = {
  listTasksByProject,
  createTask,
  updateTask,
  deleteTask,
  addChecklistItem,
  toggleChecklistItem,
  deleteChecklistItem,
};
