const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgrespassword123@localhost:5432/pm_ai_db';

let pool = null;
let useLocalFallback = false;

// In-memory / persistent mock store if PostgreSQL is offline
const memoryStore = {
  users: [],
  projects: [],
  project_members: [],
  tasks: [],
  task_checklists: [],
  chat_messages: [],
  ai_reports: [],
  seq: { users: 1, projects: 1, project_members: 1, tasks: 1, task_checklists: 1, chat_messages: 1, ai_reports: 1 }
};

// Seed demo data for memory store
async function seedMemoryStore() {
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash('password123', salt);

  const u1 = {
    id: memoryStore.seq.users++,
    email: 'dung.hoang@vku.udn.vn',
    password_hash: hash,
    full_name: 'Hoàng Công Trí Dũng',
    role: 'LEADER',
    avatar_url: null,
    created_at: new Date()
  };
  const u2 = {
    id: memoryStore.seq.users++,
    email: 'khang.dang@vku.udn.vn',
    password_hash: hash,
    full_name: 'Đặng Trường Khang',
    role: 'DEVELOPER',
    avatar_url: null,
    created_at: new Date()
  };
  memoryStore.users.push(u1, u2);

  const p1 = {
    id: memoryStore.seq.projects++,
    code: 'VKU-DATN',
    title: 'Nền tảng Quản lý Dự án Tích hợp AI',
    description: 'Đồ án tốt nghiệp 22GIT: Quản lý công việc thông minh, tích hợp chat thời gian thực và trợ lý đánh giá tiến độ AI',
    owner_id: u1.id,
    created_at: new Date(),
    updated_at: new Date()
  };
  memoryStore.projects.push(p1);

  memoryStore.project_members.push(
    { id: memoryStore.seq.project_members++, project_id: p1.id, user_id: u1.id, project_role: 'LEADER', joined_at: new Date() },
    { id: memoryStore.seq.project_members++, project_id: p1.id, user_id: u2.id, project_role: 'DEVELOPER', joined_at: new Date() }
  );

  const tomorrow = new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 10);
  const nextWeek = new Date(Date.now() + 86400000 * 7).toISOString().slice(0, 10);
  const pastDay = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

  const t1 = {
    id: memoryStore.seq.tasks++,
    project_id: p1.id,
    title: 'Thiết kế giao diện Kanban và Dark Mode',
    description: 'Xây dựng các cột trạng thái To Do, In Progress, Review, Done với thanh % trượt',
    status: 'DONE',
    priority: 'MEDIUM',
    progress: 100,
    due_date: pastDay,
    creator_id: u1.id,
    assignee_id: u2.id,
    created_at: new Date(),
    updated_at: new Date()
  };

  const t2 = {
    id: memoryStore.seq.tasks++,
    project_id: p1.id,
    title: 'Tích hợp tính năng Chat-to-Task 1-Click',
    description: 'Cho phép bấm vào tin nhắn trong phòng chat để bóc tách thành công việc trực tiếp',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    progress: 65,
    due_date: tomorrow,
    creator_id: u1.id,
    assignee_id: u2.id,
    created_at: new Date(),
    updated_at: new Date()
  };

  const t3 = {
    id: memoryStore.seq.tasks++,
    project_id: p1.id,
    title: 'Xây dựng module AI Đánh giá Tiến độ & Rủi ro',
    description: 'Tự động tổng hợp báo cáo standup, nhận diện task trễ hạn và các nút thắt cổ chai',
    status: 'IN_PROGRESS',
    priority: 'URGENT',
    progress: 40,
    due_date: tomorrow,
    creator_id: u1.id,
    assignee_id: u1.id,
    created_at: new Date(),
    updated_at: new Date()
  };

  const t4 = {
    id: memoryStore.seq.tasks++,
    project_id: p1.id,
    title: 'Đóng gói Docker Compose & Viết tài liệu báo cáo',
    description: 'Chuẩn bị Dockerfile, docker-compose.yml và tài liệu hướng dẫn vận hành',
    status: 'TODO',
    priority: 'HIGH',
    progress: 10,
    due_date: nextWeek,
    creator_id: u1.id,
    assignee_id: u1.id,
    created_at: new Date(),
    updated_at: new Date()
  };

  memoryStore.tasks.push(t1, t2, t3, t4);

  memoryStore.task_checklists.push(
    { id: memoryStore.seq.task_checklists++, task_id: t2.id, title: 'Bắt sự kiện hover và click trên tin nhắn', is_completed: true },
    { id: memoryStore.seq.task_checklists++, task_id: t2.id, title: 'API trích xuất thông tin task từ text', is_completed: true },
    { id: memoryStore.seq.task_checklists++, task_id: t2.id, title: 'Popup xác nhận và gán deadline tự động', is_completed: false }
  );

  memoryStore.chat_messages.push(
    { id: memoryStore.seq.chat_messages++, project_id: p1.id, sender_id: u1.id, content: 'Chào mừng nhóm đến với hệ thống Quản lý Dự án Tích hợp AI!', message_type: 'TEXT', metadata: null, created_at: new Date(Date.now() - 3600000) },
    { id: memoryStore.seq.chat_messages++, project_id: p1.id, sender_id: u1.id, content: 'Khang ơi, hoàn thiện nốt popup 1-Click Chat-to-Task trước tối mai nhé!', message_type: 'TEXT', metadata: null, created_at: new Date(Date.now() - 1800000) },
    { id: memoryStore.seq.chat_messages++, project_id: p1.id, sender_id: u2.id, content: 'Dạ em đang xử lý modal xác nhận và đồng bộ Socket.io cho phần này rồi anh!', message_type: 'TEXT', metadata: null, created_at: new Date() }
  );

  console.log('⚡ Initialized Fast Local Database Storage with demo accounts and tasks!');
}

async function initDB() {
  try {
    pool = new Pool({
      connectionString,
      connectionTimeoutMillis: 2000,
    });
    
    // Test connection
    const client = await pool.connect();
    console.log('✅ Connected to PostgreSQL database!');

    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'MEMBER',
        avatar_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS projects (
        id SERIAL PRIMARY KEY,
        code VARCHAR(50) UNIQUE NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        owner_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS project_members (
        id SERIAL PRIMARY KEY,
        project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        project_role VARCHAR(50) DEFAULT 'MEMBER',
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(project_id, user_id)
      );

      CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        status VARCHAR(50) DEFAULT 'TODO',
        priority VARCHAR(50) DEFAULT 'MEDIUM',
        progress INTEGER DEFAULT 0,
        due_date DATE,
        creator_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        assignee_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS task_checklists (
        id SERIAL PRIMARY KEY,
        task_id INTEGER REFERENCES tasks(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        is_completed BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS chat_messages (
        id SERIAL PRIMARY KEY,
        project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
        sender_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        content TEXT NOT NULL,
        message_type VARCHAR(50) DEFAULT 'TEXT',
        metadata JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS ai_reports (
        id SERIAL PRIMARY KEY,
        project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
        report_type VARCHAR(50) NOT NULL,
        summary TEXT NOT NULL,
        content JSONB,
        created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Check seed
    const userRes = await client.query('SELECT COUNT(*) FROM users');
    if (parseInt(userRes.rows[0].count, 10) === 0) {
      console.log('Seeding PostgreSQL with demo data...');
      const salt = await bcrypt.genSalt(10);
      const hash1 = await bcrypt.hash('password123', salt);
      const hash2 = await bcrypt.hash('password123', salt);

      const user1 = await client.query(
        `INSERT INTO users (email, password_hash, full_name, role)
         VALUES ($1, $2, $3, $4) RETURNING id`,
        ['dung.hoang@vku.udn.vn', hash1, 'Hoàng Công Trí Dũng', 'LEADER']
      );
      const user2 = await client.query(
        `INSERT INTO users (email, password_hash, full_name, role)
         VALUES ($1, $2, $3, $4) RETURNING id`,
        ['khang.dang@vku.udn.vn', hash2, 'Đặng Trường Khang', 'DEVELOPER']
      );

      const pRes = await client.query(
        `INSERT INTO projects (code, title, description, owner_id)
         VALUES ($1, $2, $3, $4) RETURNING id`,
        ['VKU-DATN', 'Nền tảng Quản lý Dự án Tích hợp AI', 'Đồ án tốt nghiệp 22GIT: Quản lý công việc thông minh, tích hợp chat thời gian thực và trợ lý đánh giá tiến độ AI', user1.rows[0].id]
      );

      await client.query(
        `INSERT INTO project_members (project_id, user_id, project_role)
         VALUES ($1, $2, 'LEADER'), ($1, $3, 'DEVELOPER')`,
        [pRes.rows[0].id, user1.rows[0].id, user2.rows[0].id]
      );
    }
    client.release();
    useLocalFallback = false;
  } catch (err) {
    console.warn('⚠️ PostgreSQL is not reachable at localhost:5432 (' + err.message + ')');
    console.log('🔄 Automatically switching to Local Fast Database Engine for offline development!');
    useLocalFallback = true;
    await seedMemoryStore();
  }
}

// Emulate simple SQL queries for the Local In-Memory Store
async function mockQuery(sql, params = []) {
  const s = sql.trim();
  const lower = s.toLowerCase();

  // 1. SELECT * FROM users WHERE email = $1
  if (lower.includes('from users where email =')) {
    const email = params[0];
    const user = memoryStore.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    return { rows: user ? [user] : [] };
  }

  // 2. SELECT ... FROM users WHERE id = $1
  if (lower.includes('from users where id =')) {
    const id = parseInt(params[0], 10);
    const user = memoryStore.users.find(u => u.id === id);
    return { rows: user ? [user] : [] };
  }

  // 3. SELECT ... FROM users ORDER BY
  if (lower.includes('from users order by')) {
    return { rows: [...memoryStore.users] };
  }

  // 4. INSERT INTO users
  if (lower.startsWith('insert into users')) {
    const user = {
      id: memoryStore.seq.users++,
      email: params[0],
      password_hash: params[1],
      full_name: params[2],
      role: params[3] || 'MEMBER',
      avatar_url: null,
      created_at: new Date()
    };
    memoryStore.users.push(user);
    return { rows: [user] };
  }

  // 5. SELECT projects
  if (lower.includes('from projects p') || lower.includes('from projects where')) {
    if (lower.includes('where p.id =') || lower.includes('where id =')) {
      const id = parseInt(params[0], 10);
      const p = memoryStore.projects.find(proj => proj.id === id);
      if (!p) return { rows: [] };
      const owner = memoryStore.users.find(u => u.id === p.owner_id);
      return { rows: [{ ...p, owner_name: owner?.full_name, owner_email: owner?.email }] };
    }
    if (lower.includes('where code =')) {
      const code = params[0];
      const p = memoryStore.projects.find(proj => proj.code === code);
      return { rows: p ? [p] : [] };
    }
    const list = memoryStore.projects.map(p => {
      const owner = memoryStore.users.find(u => u.id === p.owner_id);
      const task_count = memoryStore.tasks.filter(t => t.project_id === p.id).length;
      const done_task_count = memoryStore.tasks.filter(t => t.project_id === p.id && t.status === 'DONE').length;
      const member_count = memoryStore.project_members.filter(pm => pm.project_id === p.id).length;
      return { ...p, owner_name: owner?.full_name, task_count, done_task_count, member_count };
    });
    return { rows: list };
  }

  // 6. Project Members
  if (lower.includes('from project_members pm')) {
    const projId = parseInt(params[0], 10);
    const members = memoryStore.project_members
      .filter(pm => pm.project_id === projId)
      .map(pm => {
        const u = memoryStore.users.find(user => user.id === pm.user_id);
        const assigned_count = memoryStore.tasks.filter(t => t.project_id === projId && t.assignee_id === u?.id).length;
        const done_count = memoryStore.tasks.filter(t => t.project_id === projId && t.assignee_id === u?.id && t.status === 'DONE').length;
        return {
          id: u?.id,
          full_name: u?.full_name,
          email: u?.email,
          avatar_url: u?.avatar_url,
          project_role: pm.project_role,
          joined_at: pm.joined_at,
          assigned_count,
          done_count
        };
      });
    return { rows: members };
  }

  // 7. Tasks
  if (lower.includes('from tasks t') || lower.includes('from tasks where')) {
    const projId = parseInt(params[0], 10);
    const tasks = memoryStore.tasks
      .filter(t => t.project_id === projId)
      .map(t => {
        const assignee = memoryStore.users.find(u => u.id === t.assignee_id);
        const creator = memoryStore.users.find(u => u.id === t.creator_id);
        return {
          ...t,
          assignee_name: assignee?.full_name || null,
          assignee_avatar: assignee?.avatar_url || null,
          creator_name: creator?.full_name || null
        };
      });
    return { rows: tasks };
  }

  // Checklists
  if (lower.includes('from task_checklists where task_id = any')) {
    const ids = params[0];
    const items = memoryStore.task_checklists.filter(c => ids.includes(c.task_id));
    return { rows: items };
  }
  if (lower.includes('from task_checklists where task_id = $1')) {
    const taskId = parseInt(params[0], 10);
    return { rows: memoryStore.task_checklists.filter(c => c.task_id === taskId) };
  }
  if (lower.startsWith('insert into task_checklists')) {
    const item = {
      id: memoryStore.seq.task_checklists++,
      task_id: parseInt(params[0], 10),
      title: params[1],
      is_completed: false
    };
    memoryStore.task_checklists.push(item);
    return { rows: [item] };
  }
  if (lower.startsWith('update task_checklists')) {
    const itemId = parseInt(params[0], 10);
    const item = memoryStore.task_checklists.find(c => c.id === itemId);
    if (item) item.is_completed = !item.is_completed;
    return { rows: item ? [item] : [] };
  }

  // Create Task
  if (lower.startsWith('insert into tasks')) {
    const task = {
      id: memoryStore.seq.tasks++,
      project_id: parseInt(params[0], 10),
      title: params[1],
      description: params[2],
      status: params[3] || 'TODO',
      priority: params[4] || 'MEDIUM',
      progress: parseInt(params[5], 10) || 0,
      due_date: params[6] || null,
      creator_id: params[7],
      assignee_id: params[8] || null,
      created_at: new Date(),
      updated_at: new Date()
    };
    memoryStore.tasks.push(task);
    return { rows: [task] };
  }

  // Update Task
  if (lower.startsWith('update tasks')) {
    const taskId = parseInt(params[params.length - 1], 10);
    const task = memoryStore.tasks.find(t => t.id === taskId);
    if (task) {
      if (sql.includes('status =')) {
        const match = sql.match(/status\s*=\s*\$(\d+)/i);
        if (match) task.status = params[parseInt(match[1], 10) - 1];
      }
      if (sql.includes('progress =')) {
        const match = sql.match(/progress\s*=\s*\$(\d+)/i);
        if (match) task.progress = params[parseInt(match[1], 10) - 1];
        if (task.progress === 100) task.status = 'DONE';
      }
      if (sql.includes('title =')) {
        const match = sql.match(/title\s*=\s*\$(\d+)/i);
        if (match) task.title = params[parseInt(match[1], 10) - 1];
      }
      if (sql.includes('description =')) {
        const match = sql.match(/description\s*=\s*\$(\d+)/i);
        if (match) task.description = params[parseInt(match[1], 10) - 1];
      }
      if (sql.includes('priority =')) {
        const match = sql.match(/priority\s*=\s*\$(\d+)/i);
        if (match) task.priority = params[parseInt(match[1], 10) - 1];
      }
      if (sql.includes('due_date =')) {
        const match = sql.match(/due_date\s*=\s*\$(\d+)/i);
        if (match) task.due_date = params[parseInt(match[1], 10) - 1];
      }
      if (sql.includes('assignee_id =')) {
        const match = sql.match(/assignee_id\s*=\s*\$(\d+)/i);
        if (match) task.assignee_id = params[parseInt(match[1], 10) - 1];
      }
      task.updated_at = new Date();
    }
    return { rows: task ? [task] : [] };
  }

  // Delete Task
  if (lower.startsWith('delete from tasks')) {
    const id = parseInt(params[0], 10);
    const idx = memoryStore.tasks.findIndex(t => t.id === id);
    if (idx !== -1) {
      const removed = memoryStore.tasks.splice(idx, 1)[0];
      return { rows: [removed] };
    }
    return { rows: [] };
  }

  // Chat Messages
  if (lower.includes('from chat_messages m')) {
    const projId = parseInt(params[0], 10);
    const msgs = memoryStore.chat_messages
      .filter(m => m.project_id === projId)
      .map(m => {
        const sender = memoryStore.users.find(u => u.id === m.sender_id);
        return {
          ...m,
          sender_name: sender?.full_name || 'Thành viên',
          sender_email: sender?.email || '',
          sender_avatar: sender?.avatar_url || null
        };
      });
    return { rows: msgs };
  }

  if (lower.startsWith('insert into chat_messages')) {
    const msg = {
      id: memoryStore.seq.chat_messages++,
      project_id: parseInt(params[0], 10),
      sender_id: params[1],
      content: params[2],
      message_type: params[3] || 'TEXT',
      metadata: params[4] || null,
      created_at: new Date()
    };
    memoryStore.chat_messages.push(msg);
    return { rows: [msg] };
  }

  // AI Reports
  if (lower.startsWith('insert into ai_reports')) {
    const report = {
      id: memoryStore.seq.ai_reports++,
      project_id: parseInt(params[0], 10),
      report_type: params[1],
      summary: params[2],
      content: params[3],
      created_by: params[4],
      created_at: new Date()
    };
    memoryStore.ai_reports.push(report);
    return { rows: [report] };
  }

  return { rows: [] };
}

module.exports = {
  pool,
  query: async (text, params) => {
    if (useLocalFallback || !pool) {
      return mockQuery(text, params);
    }
    try {
      return await pool.query(text, params);
    } catch (err) {
      console.warn('Postgres query error, falling back to local store:', err.message);
      return mockQuery(text, params);
    }
  },
  initDB,
};
