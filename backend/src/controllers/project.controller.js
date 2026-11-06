const db = require('../config/db');

async function listProjects(req, res) {
  try {
    const result = await db.query(
      `SELECT p.*, u.full_name as owner_name,
       (SELECT COUNT(*) FROM tasks WHERE project_id = p.id) as task_count,
       (SELECT COUNT(*) FROM tasks WHERE project_id = p.id AND status = 'DONE') as done_task_count,
       (SELECT COUNT(*) FROM project_members WHERE project_id = p.id) as member_count
       FROM projects p
       LEFT JOIN users u ON p.owner_id = u.id
       ORDER BY p.updated_at DESC`
    );
    res.json({ projects: result.rows });
  } catch (err) {
    console.error('List projects error:', err);
    res.status(500).json({ error: 'Lỗi khi lấy danh sách dự án' });
  }
}

async function getProjectById(req, res) {
  try {
    const { id } = req.params;
    const projRes = await db.query(
      `SELECT p.*, u.full_name as owner_name, u.email as owner_email
       FROM projects p
       LEFT JOIN users u ON p.owner_id = u.id
       WHERE p.id = $1`,
      [id]
    );

    if (projRes.rows.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy dự án' });
    }

    const membersRes = await db.query(
      `SELECT pm.project_role, pm.joined_at, u.id, u.full_name, u.email, u.avatar_url
       FROM project_members pm
       JOIN users u ON pm.user_id = u.id
       WHERE pm.project_id = $1
       ORDER BY pm.joined_at ASC`,
      [id]
    );

    res.json({
      project: projRes.rows[0],
      members: membersRes.rows,
    });
  } catch (err) {
    console.error('Get project error:', err);
    res.status(500).json({ error: 'Lỗi khi lấy thông tin dự án' });
  }
}

async function createProject(req, res) {
  try {
    const { title, code, description } = req.body;
    if (!title || !code) {
      return res.status(400).json({ error: 'Vui lòng cung cấp tên và mã dự án' });
    }

    const projCode = code.toUpperCase().trim();
    const existing = await db.query('SELECT id FROM projects WHERE code = $1', [projCode]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Mã dự án đã tồn tại, vui lòng chọn mã khác' });
    }

    const result = await db.query(
      `INSERT INTO projects (code, title, description, owner_id)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [projCode, title, description || '', req.user.id]
    );

    const project = result.rows[0];

    // Add creator as OWNER
    await db.query(
      `INSERT INTO project_members (project_id, user_id, project_role)
       VALUES ($1, $2, $3)`,
      [project.id, req.user.id, 'OWNER']
    );

    res.status(201).json({ message: 'Tạo dự án thành công', project });
  } catch (err) {
    console.error('Create project error:', err);
    res.status(500).json({ error: 'Lỗi khi tạo dự án mới' });
  }
}

async function addMember(req, res) {
  try {
    const { id } = req.params;
    const { email, role } = req.body;

    const userRes = await db.query('SELECT id, full_name, email FROM users WHERE email = $1', [email]);
    if (userRes.rows.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy người dùng với email này' });
    }

    const userToAdd = userRes.rows[0];

    await db.query(
      `INSERT INTO project_members (project_id, user_id, project_role)
       VALUES ($1, $2, $3)
       ON CONFLICT (project_id, user_id) 
       DO UPDATE SET project_role = EXCLUDED.project_role`,
      [id, userToAdd.id, role || 'MEMBER']
    );

    res.json({ message: 'Thêm thành viên thành công', member: userToAdd });
  } catch (err) {
    console.error('Add member error:', err);
    res.status(500).json({ error: 'Lỗi khi thêm thành viên' });
  }
}

module.exports = {
  listProjects,
  getProjectById,
  createProject,
  addMember,
};
