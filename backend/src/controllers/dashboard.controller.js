const db = require('../config/db');

async function getProjectDashboardStats(req, res) {
  try {
    const { projectId } = req.params;

    const taskStatsRes = await db.query(
      `SELECT status, priority, due_date, progress, assignee_id
       FROM tasks
       WHERE project_id = $1`,
      [projectId]
    );

    const tasks = taskStatsRes.rows;
    const totalTasks = tasks.length;
    const now = new Date();

    const statusCounts = { TODO: 0, IN_PROGRESS: 0, REVIEW: 0, DONE: 0 };
    const priorityCounts = { LOW: 0, MEDIUM: 0, HIGH: 0, URGENT: 0 };
    let overdueCount = 0;
    let onTimeDoneCount = 0;
    let totalProgressSum = 0;

    tasks.forEach((t) => {
      if (statusCounts[t.status] !== undefined) statusCounts[t.status]++;
      if (priorityCounts[t.priority] !== undefined) priorityCounts[t.priority]++;
      totalProgressSum += t.progress || 0;

      const isOverdue = t.due_date && new Date(t.due_date) < now;
      if (isOverdue && t.status !== 'DONE') {
        overdueCount++;
      } else if (t.status === 'DONE') {
        onTimeDoneCount++;
      }
    });

    const averageProgress = totalTasks > 0 ? Math.round(totalProgressSum / totalTasks) : 0;
    const onTimeRate = totalTasks > 0 ? Math.round((onTimeDoneCount / totalTasks) * 100) : 100;

    // Member distribution
    const membersRes = await db.query(
      `SELECT u.id, u.full_name, u.email, pm.project_role,
        (SELECT COUNT(*) FROM tasks WHERE project_id = $1 AND assignee_id = u.id) as assigned_count,
        (SELECT COUNT(*) FROM tasks WHERE project_id = $1 AND assignee_id = u.id AND status = 'DONE') as done_count
       FROM project_members pm
       JOIN users u ON pm.user_id = u.id
       WHERE pm.project_id = $1`,
      [projectId]
    );

    res.json({
      totalTasks,
      averageProgress,
      onTimeRate,
      overdueCount,
      statusCounts,
      priorityCounts,
      members: membersRes.rows,
    });
  } catch (err) {
    console.error('Dashboard stats error:', err);
    res.status(500).json({ error: 'Lỗi khi lấy dữ liệu thống kê dashboard' });
  }
}

module.exports = {
  getProjectDashboardStats,
};
