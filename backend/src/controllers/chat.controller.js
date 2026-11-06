const db = require('../config/db');

async function listMessages(req, res) {
  try {
    const { projectId } = req.params;
    const limit = parseInt(req.query.limit, 10) || 50;

    const result = await db.query(
      `SELECT m.*, u.full_name as sender_name, u.email as sender_email, u.avatar_url as sender_avatar
       FROM chat_messages m
       LEFT JOIN users u ON m.sender_id = u.id
       WHERE m.project_id = $1
       ORDER BY m.created_at ASC
       LIMIT $2`,
      [projectId, limit]
    );

    const messages = result.rows.map((m) => {
      let meta = m.metadata;
      if (typeof meta === 'string') {
        try {
          meta = JSON.parse(meta);
        } catch {}
      }
      return { ...m, metadata: meta };
    });

    res.json({ messages });
  } catch (err) {
    console.error('List messages error:', err);
    res.status(500).json({ error: 'Lỗi khi tải lịch sử chat' });
  }
}

async function sendMessage(req, res) {
  try {
    const { projectId } = req.params;
    const { content, messageType, metadata } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Nội dung tin nhắn không được để trống' });
    }

    let metaJson = null;
    let metaObj = metadata || null;
    if (metadata) {
      metaJson = typeof metadata === 'string' ? metadata : JSON.stringify(metadata);
      if (typeof metadata === 'string') {
        try { metaObj = JSON.parse(metadata); } catch {}
      }
    }

    const result = await db.query(
      `INSERT INTO chat_messages (project_id, sender_id, content, message_type, metadata)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [projectId, req.user.id, content.trim(), messageType || 'TEXT', metaJson]
    );

    const message = result.rows[0];
    const fullMessage = {
      ...message,
      metadata: metaObj,
      sender_name: req.user.full_name,
      sender_email: req.user.email,
    };

    if (req.io) {
      req.io.to(`project_${projectId}`).emit('new_message', fullMessage);
    }

    res.status(201).json({ message: fullMessage });
  } catch (err) {
    console.error('Send message error:', err);
    res.status(500).json({ error: 'Lỗi khi gửi tin nhắn' });
  }
}

module.exports = {
  listMessages,
  sendMessage,
};
