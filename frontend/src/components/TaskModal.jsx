import React, { useState, useEffect } from 'react';
import { 
  X, 
  Calendar, 
  User, 
  Flag, 
  ListTodo, 
  Plus, 
  Trash2, 
  Sparkles,
  CheckCircle2
} from 'lucide-react';

export default function TaskModal({ 
  isOpen, 
  onClose, 
  onSave, 
  initialData = null, 
  members = [] 
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('TODO');
  const [priority, setPriority] = useState('MEDIUM');
  const [progress, setProgress] = useState(0);
  const [dueDate, setDueDate] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [checklists, setChecklists] = useState([]);
  const [newChecklistText, setNewChecklistText] = useState('');

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setDescription(initialData.description || '');
      setStatus(initialData.status || 'TODO');
      setPriority(initialData.priority || 'MEDIUM');
      setProgress(initialData.progress || 0);
      setDueDate(initialData.due_date ? initialData.due_date.slice(0, 10) : (initialData.suggested_due_date || ''));
      setAssigneeId(initialData.assignee_id || initialData.suggested_assignee_id || '');
      setChecklists(initialData.checklists ? initialData.checklists.map((c) => c.title || c) : []);
    } else {
      setTitle('');
      setDescription('');
      setStatus('TODO');
      setPriority('MEDIUM');
      setProgress(0);
      setDueDate('');
      setAssigneeId('');
      setChecklists([]);
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleAddChecklist = (e) => {
    e.preventDefault();
    if (!newChecklistText.trim()) return;
    setChecklists([...checklists, newChecklistText.trim()]);
    setNewChecklistText('');
  };

  const handleRemoveChecklist = (idx) => {
    setChecklists(checklists.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      id: initialData?.id,
      title: title.trim(),
      description: description.trim(),
      status,
      priority,
      progress: parseInt(progress, 10) || 0,
      dueDate: dueDate || null,
      assigneeId: assigneeId ? parseInt(assigneeId, 10) : null,
      checklists,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-slate-100 text-sm">
              {initialData?.id ? 'Chỉnh sửa Công việc' : 'Tạo Thẻ Công việc Mới'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 text-left">
          {/* Title */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Tiêu đề công việc <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ví dụ: Xây dựng API xác thực JWT"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Mô tả chi tiết</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mô tả yêu cầu, tiêu chí hoàn thành của task..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
            />
          </div>

          {/* Priority & Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Mức độ ưu tiên</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
              >
                <option value="LOW">Thấp (Low)</option>
                <option value="MEDIUM">Bình thường (Medium)</option>
                <option value="HIGH">Ưu tiên cao (High)</option>
                <option value="URGENT">Khẩn cấp (Urgent)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Trạng thái</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
              >
                <option value="TODO">To Do (Chờ thực hiện)</option>
                <option value="IN_PROGRESS">In Progress (Đang làm)</option>
                <option value="REVIEW">Review (Kiểm thử)</option>
                <option value="DONE">Done (Hoàn thành)</option>
              </select>
            </div>
          </div>

          {/* Assignee & Due Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Người phụ trách</label>
              <select
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
              >
                <option value="">-- Chưa gán ai --</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.full_name} ({m.email})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Hạn chót (Deadline)</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
              >
              </input>
            </div>
          </div>

          {/* Progress Slider (Multi-dimensional progress tracking) */}
          <div>
            <div className="flex justify-between items-center text-xs font-medium text-slate-300 mb-1">
              <span>Tiến độ hoàn thành</span>
              <span className="font-mono text-indigo-400 font-bold">{progress}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={progress}
              onChange={(e) => setProgress(e.target.value)}
              className="w-full accent-indigo-500 cursor-pointer"
            />
          </div>

          {/* Checklist items */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1">
              <ListTodo className="w-3.5 h-3.5 text-indigo-400" />
              <span>Đầu việc con (Checklist)</span>
            </label>

            <div className="flex items-center space-x-2 mb-2">
              <input
                type="text"
                value={newChecklistText}
                onChange={(e) => setNewChecklistText(e.target.value)}
                placeholder="Thêm mục checklist..."
                className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={handleAddChecklist}
                className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center space-x-1 transition"
              >
                <Plus className="w-3 h-3" />
                <span>Thêm</span>
              </button>
            </div>

            {checklists.length > 0 && (
              <div className="space-y-1.5 max-h-28 overflow-y-auto pr-1">
                {checklists.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between bg-slate-800/60 border border-slate-700/60 rounded-lg px-3 py-1.5 text-xs text-slate-200"
                  >
                    <span>{item}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveChecklist(idx)}
                      className="text-slate-500 hover:text-rose-400 transition"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit buttons */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-xl text-xs font-semibold shadow-md transition"
            >
              {initialData?.id ? 'Lưu thay đổi' : 'Tạo công việc'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
