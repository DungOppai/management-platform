/**
 * AI Service for Project Management Platform
 * 
 * Supports:
 * 1. Google Gemini API (if GEMINI_API_KEY is configured)
 * 2. OpenAI API (if OPENAI_API_KEY is configured)
 * 3. Smart Rule-based Local Engine (Fallback / Offline mode, 0 cost, no AWS dependency)
 * 4. Extensible to AWS Bedrock Claude when deploying to AWS later.
 */

async function callExternalLLM(prompt, systemInstruction = '') {
  const geminiKey = process.env.GEMINI_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  if (geminiKey) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: `${systemInstruction}\n\n${prompt}` }],
            },
          ],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 1500,
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return text;
      }
    } catch (err) {
      console.warn('Gemini API call failed, falling back to local engine:', err.message);
    }
  }

  if (openaiKey) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${openaiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemInstruction },
            { role: 'user', content: prompt },
          ],
          temperature: 0.3,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return data.choices?.[0]?.message?.content;
      }
    } catch (err) {
      console.warn('OpenAI API call failed, falling back to local engine:', err.message);
    }
  }

  return null; // Signals to use Local Smart Engine
}

/**
 * 1. Extract Task from Chat Message (Chat-to-Task 1-Click)
 */
async function extractTaskFromMessage(messageText, projectMembers = []) {
  const memberList = projectMembers.map((m) => `${m.full_name} (ID: ${m.id})`).join(', ');
  const systemInstruction = `Bạn là trợ lý AI quản lý dự án. Hãy trích xuất nội dung tin nhắn thành một công việc (task).
Danh sách thành viên: [${memberList}].
Trả về duy nhất định dạng JSON thuần không markdown:
{
  "title": "Tiêu đề ngắn gọn của task",
  "description": "Chi tiết công việc trích từ tin nhắn",
  "priority": "LOW" | "MEDIUM" | "HIGH" | "URGENT",
  "suggested_assignee_id": number | null,
  "suggested_due_date": "YYYY-MM-DD" | null,
  "estimated_tags": ["tag1", "tag2"]
}`;

  const prompt = `Tin nhắn cần bóc tách: "${messageText}"`;
  const llmResult = await callExternalLLM(prompt, systemInstruction);

  if (llmResult) {
    try {
      const cleanJson = llmResult.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleanJson);
    } catch (e) {
      console.warn('Error parsing LLM JSON output for task extraction:', e);
    }
  }

  // --- LOCAL ENGINE FALLBACK ---
  const lower = messageText.toLowerCase();
  let priority = 'MEDIUM';
  if (lower.includes('gấp') || lower.includes('ngay lập tức') || lower.includes('urgent') || lower.includes('lỗi nặng')) {
    priority = 'URGENT';
  } else if (lower.includes('quan trọng') || lower.includes('sớm') || lower.includes('ưu tiên') || lower.includes('trước')) {
    priority = 'HIGH';
  }

  // Guess assignee from member names
  let suggestedAssignee = null;
  for (const m of projectMembers) {
    const firstName = m.full_name.split(' ').pop().toLowerCase();
    if (lower.includes(firstName) || lower.includes(m.full_name.toLowerCase())) {
      suggestedAssignee = m.id;
      break;
    }
  }

  // Guess deadline (tomorrow, or 3 days)
  const today = new Date();
  let dueDays = 3;
  if (lower.includes('hôm nay') || lower.includes('tối nay')) dueDays = 0;
  else if (lower.includes('ngày mai') || lower.includes('tối mai')) dueDays = 1;
  else if (lower.includes('thứ') || lower.includes('tuần này')) dueDays = 4;
  else if (lower.includes('tuần tới') || lower.includes('tuần sau')) dueDays = 7;

  const dueDateObj = new Date(today.getTime() + dueDays * 86400000);
  const suggestedDueDate = dueDateObj.toISOString().slice(0, 10);

  // Clean title
  let title = messageText.replace(/^(ơi|nhờ|em|anh|chị|bạn)\s+/i, '');
  if (title.length > 80) {
    title = title.slice(0, 77) + '...';
  }

  return {
    title: title.charAt(0).toUpperCase() + title.slice(1),
    description: `Tạo tự động từ thảo luận nhóm: "${messageText}"`,
    priority,
    suggested_assignee_id: suggestedAssignee,
    suggested_due_date: suggestedDueDate,
    estimated_tags: ['Từ phòng Chat', priority.toLowerCase()],
  };
}

/**
 * 2. Generate Proactive Standup & Progress Report
 */
async function generateStandupReport(project, tasks, members) {
  const taskSummary = tasks.map((t) => ({
    title: t.title,
    status: t.status,
    priority: t.priority,
    progress: t.progress,
    assignee: t.assignee_name || 'Chưa gán',
    dueDate: t.due_date,
    isOverdue: t.due_date && new Date(t.due_date) < new Date() && t.status !== 'DONE',
  }));

  const systemInstruction = `Bạn là Trợ lý AI Đánh giá Tiến độ Dự án (Proactive Project Management Evaluator).
Hãy tổng hợp báo cáo tiến độ tuần / standup dựa trên dữ liệu dự án.
Phân tích theo 3 phần rõ ràng:
1. Các hạng mục đã hoàn thành (Achievements)
2. Điểm nghẽn, các task có nguy cơ trễ hạn hoặc rủi ro (Blockers & Overdue Risks)
3. Danh sách công việc cần ưu tiên hành động ngay (Actionable Next Steps)
Giọng văn chuyên nghiệp, súc tích, mang tính hỗ trợ ra quyết định. Định dạng Markdown.`;

  const prompt = `Dự án: ${project.title} (${project.code})
Danh sách công việc hiện tại:
${JSON.stringify(taskSummary, null, 2)}`;

  const llmResult = await callExternalLLM(prompt, systemInstruction);
  if (llmResult) {
    return {
      summary: `Báo cáo đánh giá tiến độ do AI tổng hợp cho dự án ${project.title}`,
      markdownContent: llmResult,
      generatedBy: 'Cloud LLM Engine (Gemini / Claude)',
    };
  }

  // --- LOCAL ENGINE FALLBACK ---
  const doneTasks = tasks.filter((t) => t.status === 'DONE');
  const inProgressTasks = tasks.filter((t) => t.status === 'IN_PROGRESS');
  const overdueTasks = tasks.filter((t) => t.due_date && new Date(t.due_date) < new Date() && t.status !== 'DONE');
  const urgentTasks = tasks.filter((t) => (t.priority === 'URGENT' || t.priority === 'HIGH') && t.status !== 'DONE');

  const total = tasks.length || 1;
  const overallProgress = Math.round(tasks.reduce((sum, t) => sum + (t.progress || 0), 0) / total);

  const markdownContent = `### 📊 Báo cáo Đánh giá Tiến độ Dự án: **${project.title}**
*Thời điểm tổng hợp: ${new Date().toLocaleString('vi-VN')}*
*Tiến độ trung bình toàn dự án:* **${overallProgress}%**

---

#### 1. 🏆 Hạng mục đã hoàn thành (${doneTasks.length} việc)
${
  doneTasks.length > 0
    ? doneTasks.map((t) => `- ✅ **${t.title}** (Phụ trách: ${t.assignee_name || 'N/A'}) - Tiến độ: 100%`).join('\n')
    : '_Chưa có công việc nào hoàn thành 100% trong chu kỳ này._'
}

#### 2. ⚠️ Điểm nghẽn & Cảnh báo rủi ro tiến độ (${overdueTasks.length} việc quá hạn / ${urgentTasks.length} việc gấp)
${
  overdueTasks.length > 0
    ? overdueTasks.map((t) => `- 🚨 **[QUÁ HẠN] ${t.title}** (Hạn: ${t.due_date}, Người phụ trách: ${t.assignee_name || 'Chưa gán'}, Hiện đạt: ${t.progress}%)`).join('\n')
    : '- 🎉 Tuyệt vời! Hiện không có công việc nào bị quá hạn.'
}
${
  urgentTasks.length > 0
    ? '\n**Các công việc ưu tiên cao đang chạy:**\n' +
      urgentTasks.map((t) => `- 🔥 **[${t.priority}] ${t.title}** (Hiện đạt: ${t.progress}%, Phụ trách: ${t.assignee_name || 'Chưa gán'})`).join('\n')
    : ''
}

#### 3. 🎯 Đề xuất hành động tiếp theo cho Nhóm (AI Actionable Steps)
- **Tập trung nguồn lực:** Giải quyết dứt điểm các công việc đang ở trạng thái \`IN_PROGRESS\` (${inProgressTasks.length} việc) trước khi mở thêm task mới.
- **Tái phân bổ công việc:** Rà soát lại khối lượng công việc của thành viên đang gánh nhiều task ưu tiên \`HIGH\` / \`URGENT\`.
- **Review chất lượng:** Tổ chức rà soát ngắn (15 phút) các công việc chuẩn bị bàn giao hoặc chuyển sang \`REVIEW\`.
`;

  return {
    summary: `Báo cáo phân tích tiến độ tự động (Đạt ${overallProgress}% - ${doneTasks.length}/${tasks.length} task)`,
    markdownContent,
    generatedBy: 'Smart Local AI Engine',
  };
}

/**
 * 3. Proactive Bottleneck & Overload Detection
 */
async function detectBottlenecks(project, tasks, members) {
  // Analyze member workload
  const memberWorkload = {};
  members.forEach((m) => {
    memberWorkload[m.id] = {
      memberId: m.id,
      fullName: m.full_name,
      totalAssigned: 0,
      activeTasks: 0,
      urgentTasks: 0,
      overdueTasks: 0,
    };
  });

  const now = new Date();
  const overdueList = [];

  tasks.forEach((t) => {
    if (t.assignee_id && memberWorkload[t.assignee_id]) {
      const w = memberWorkload[t.assignee_id];
      w.totalAssigned += 1;
      if (t.status !== 'DONE') {
        w.activeTasks += 1;
        if (t.priority === 'URGENT' || t.priority === 'HIGH') w.urgentTasks += 1;
        if (t.due_date && new Date(t.due_date) < now) {
          w.overdueTasks += 1;
          overdueList.push(t);
        }
      }
    }
  });

  const overloadedMembers = Object.values(memberWorkload).filter(
    (w) => w.activeTasks >= 3 || w.urgentTasks >= 2
  );

  return {
    overdueCount: overdueList.length,
    overdueTasks: overdueList.map((t) => ({
      id: t.id,
      title: t.title,
      dueDate: t.due_date,
      assigneeName: t.assignee_name,
      progress: t.progress,
    })),
    overloadedMembers,
    workloadBreakdown: Object.values(memberWorkload),
    recommendation:
      overloadedMembers.length > 0
        ? `Phát hiện ${overloadedMembers.length} thành viên có dấu hiệu quá tải công việc (nhiều hơn 3 task active hoặc >=2 task gấp). Nên điều chuyển bớt các việc TODO sang thành viên khác.`
        : 'Khối lượng công việc giữa các thành viên đang được phân bổ tương đối cân bằng.',
  };
}

/**
 * 4. Chat Catch-up Summarizer
 */
async function summarizeChat(messages) {
  if (!messages || messages.length === 0) {
    return 'Chưa có tin nhắn thảo luận nào trong kênh này.';
  }

  const chatTranscript = messages
    .map((m) => `${m.sender_name || 'Thành viên'}: ${m.content}`)
    .join('\n');

  const systemInstruction = `Bạn là Trợ lý AI tổng hợp thảo luận dự án.
Hãy tóm tắt ngắn gọn cuộc trò chuyện sau thành 3-5 ý cốt lõi nhất:
- Vấn đề chính được bàn bạc
- Quyết định đã chốt
- Ai cần làm gì tiếp theo`;

  const prompt = `Lịch sử chat:\n${chatTranscript}`;
  const llmResult = await callExternalLLM(prompt, systemInstruction);

  if (llmResult) return llmResult;

  // Local engine fallback
  const count = messages.length;
  const recentMessages = messages.slice(-5);
  return `📌 **Tóm tắt nhanh (${count} tin nhắn gần nhất):**
- Thảo luận xoay quanh các đầu việc chính của dự án và phân công nhiệm vụ.
- Các nội dung trọng tâm gần nhất:
${recentMessages.map((m) => `  * **${m.sender_name}**: "${m.content.slice(0, 70)}${m.content.length > 70 ? '...' : ''}"`).join('\n')}
- **Đề xuất:** Bấm vào tin nhắn để chuyển thành thẻ công việc trên bảng Kanban nếu đã chốt việc.`;
}

module.exports = {
  extractTaskFromMessage,
  generateStandupReport,
  detectBottlenecks,
  summarizeChat,
};
