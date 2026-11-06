const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const { JWT_SECRET } = require('../middleware/auth');

async function register(req, res) {
  try {
    const { email, password, full_name } = req.body;
    if (!email || !password || !full_name) {
      return res.status(400).json({ error: 'Vui lòng cung cấp email, mật khẩu và họ tên' });
    }

    const existing = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Email này đã được sử dụng' });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const result = await db.query(
      `INSERT INTO users (email, password_hash, full_name, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, full_name, role, created_at`,
      [email, password_hash, full_name, 'MEMBER']
    );

    const user = result.rows[0];
    const token = jwt.sign(
      { id: user.id, email: user.email, full_name: user.full_name, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({ message: 'Đăng ký thành công', token, user });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Lỗi server khi đăng ký' });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Vui lòng nhập email và mật khẩu' });
    }

    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Email hoặc mật khẩu không đúng' });
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Email hoặc mật khẩu không đúng' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, full_name: user.full_name, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Đăng nhập thành công',
      token,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        avatar_url: user.avatar_url,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Lỗi server khi đăng nhập' });
  }
}

async function getMe(req, res) {
  try {
    const result = await db.query('SELECT id, email, full_name, role, avatar_url, created_at FROM users WHERE id = $1', [
      req.user.id,
    ]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy người dùng' });
    }
    res.json({ user: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi khi lấy thông tin người dùng' });
  }
}

async function getAllUsers(req, res) {
  try {
    const result = await db.query('SELECT id, email, full_name, role, avatar_url FROM users ORDER BY full_name ASC');
    res.json({ users: result.rows });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi khi lấy danh sách thành viên' });
  }
}

module.exports = {
  register,
  login,
  getMe,
  getAllUsers,
};
