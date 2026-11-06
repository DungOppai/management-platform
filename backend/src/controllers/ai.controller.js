const db = require('../config/db');
const aiService = require('../services/ai.service');

async function extractTaskFromChat(req, res) {
  try {
    const { projectId, messageText } = req.body;
    if (!messageText) {
      return res.status(400).json({ error: 'Thiếu nội dung tin nhắn cần bóc tách' });
    }

    let members = [];
    if (projectId) {
      const mRes = await db.query(
        `SELECT u.id, u.full_name, u.email
         FROM project_members pm
         JOIN users u ON pm.user_id = u.id
         WHERE pm.project_id = $1`,
        [projectId]
      );
      members = mRes.rows;
    }

    const taskData = await aiService.extractTaskFromMessage(messageText, members);
    res.json({ extractedTask: taskData });
  } catch (err) {
    console.error('Extract task AI error:', err);
    res.status(500).json({ error: 'Lỗi khi bóc tách công việc từ tin nhắn' });
  }
}

async function generateStandup(req, res) {
  try {
    const { projectId } = req.body;
    if (!projectId) return res.status(400).json({ error: 'Thiếu projectId' });

    const pRes = await db.query('SELECT * FROM projects WHERE id = $1', [projectId]);
    if (pRes.rows.length === 0) return res.status(404).json({ error: 'Không tìm thấy dự án' });
    const project = pRes.rows[0];

    const tRes = await db.query(
      `SELECT t.*, u.full_name as assignee_name
       FROM tasks t
       LEFT JOIN users u ON t.assignee_id = u.id
       WHERE t.project_id = $1`,
      [projectId]
    );

    const mRes = await db.query(
      `SELECT u.id, u.full_name, u.email
       FROM project_members pm
       JOIN users u ON pm.user_id = u.id
       WHERE pm.project_id = $1`,
      [projectId]
    );

    const report = await aiService.generateStandupReport(project, tRes.rows, mRes.rows);

    // Save report to database
    await db.query(
      `INSERT INTO ai_reports (project_id, report_type, summary, content, created_by)
       VALUES ($1, $2, $3, $4, $5)`,
      [projectId, 'STANDUP', report.summary, JSON.stringify(report), req.user.id]
    );

    res.json({ report });
  } catch (err) {
    console.error('Generate standup error:', err);
    res.status(500).json({ error: 'Lỗi khi tổng hợp báo cáo tiến độ' });
  }
}

async function detectBottlenecks(req, res) {
  try {
    const { projectId } = req.params;
    const pRes = await db.query('SELECT * FROM projects WHERE id = $1', [projectId]);
    if (pRes.rows.length === 0) return res.status(404).json({ error: 'Không tìm thấy dự án' });

    const tRes = await db.query(
      `SELECT t.*, u.full_name as assignee_name
       FROM tasks t
       LEFT JOIN users u ON t.assignee_id = u.id
       WHERE t.project_id = $1`,
      [projectId]
    );

    const mRes = await db.query(
      `SELECT u.id, u.full_name, u.email
       FROM project_members pm
       JOIN users u ON pm.user_id = u.id
       WHERE pm.project_id = $1`,
      [projectId]
    );

    const analysis = await aiService.detectBottlenecks(pRes.rows[0], tRes.rows, mRes.rows);
    res.json({ analysis });
  } catch (err) {
    console.error('Detect bottlenecks error:', err);
    res.status(500).json({ error: 'Lỗi khi phân tích điểm nghẽn dự án' });
  }
}

async function summarizeChat(req, res) {
  try {
    const { projectId } = req.params;
    const msgRes = await db.query(
      `SELECT m.*, u.full_name as sender_name
       FROM chat_messages m
       LEFT JOIN users u ON m.sender_id = u.id
       WHERE m.project_id = $1
       ORDER BY m.created_at DESC
       LIMIT 40`,
      [projectId]
    );

    const messages = msgRes.rows.reverse();
    const summary = await aiService.summarizeChat(messages);

    res.json({ summary });
  } catch (err) {
    console.error('Summarize chat error:', err);
    res.status(500).json({ error: 'Lỗi khi tóm tắt chat' });
  }
}

module.exports = {
  extractTaskFromChat,
  generateStandup,
  detectBottlenecks,
  summarizeChat,
};
