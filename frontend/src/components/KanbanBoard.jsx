import React from 'react';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  User, 
  CheckSquare, 
  ChevronRight, 
  ChevronLeft, 
  Trash2, 
  Edit3,
  Calendar
} from 'lucide-react';

const COLUMNS = [
  { id: 'TODO', title: 'Chờ thực hiện (To Do)', color: 'border-slate-700 bg-slate-900/50' },
  { id: 'IN_PROGRESS', title: 'Đang thực hiện (In Progress)', color: 'border-blue-900/60 bg-blue-950/20' },
  { id: 'REVIEW', title: 'Đang xét duyệt (Review & QA)', color: 'border-purple-900/60 bg-purple-950/20' },
  { id: 'DONE', title: 'Đã hoàn thành (Done)', color: 'border-emerald-900/60 bg-emerald-950/20' },
];

const PRIORITY_BADGES = {
  URGENT: { label: 'Khẩn cấp', color: 'bg-rose-500/20 text-rose-400 border-rose-500/30' },
  HIGH: { label: 'Ưu tiên cao', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  MEDIUM: { label: 'Bình thường', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  LOW: { label: 'Thấp', color: 'bg-slate-500/20 text-slate-400 border-slate-500/30' },
};

export default function KanbanBoard({ tasks, onUpdateTask, onEditTask, onDeleteTask }) {
  const getNextStatus = (current) => {
    if (current === 'TODO') return 'IN_PROGRESS';
    if (current === 'IN_PROGRESS') return 'REVIEW';
    if (current === 'REVIEW') return 'DONE';
    return null;
  };

  const getPrevStatus = (current) => {
    if (current === 'DONE') return 'REVIEW';
    if (current === 'REVIEW') return 'IN_PROGRESS';
    if (current === 'IN_PROGRESS') return 'TODO';
    return null;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 max-w-7xl mx-auto">
      {COLUMNS.map((col) => {
        const columnTasks = tasks.filter((t) => t.status === col.id);

        return (
          <div
            key={col.id}
            className={`flex flex-col rounded-xl border ${col.color} p-3 min-h-[500px] shadow-sm`}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-xs tracking-wider uppercase text-slate-300">
                  {col.title}
                </span>
                <span className="bg-slate-800 text-slate-400 text-xs px-2 py-0.5 rounded-full font-mono">
                  {columnTasks.length}
                </span>
              </div>
            </div>

            {/* Tasks Container */}
            <div className="space-y-3 flex-1 overflow-y-auto pr-1">
              {columnTasks.length === 0 ? (
                <div className="h-32 border border-dashed border-slate-800 rounded-lg flex items-center justify-center text-xs text-slate-600">
                  Không có công việc nào
                </div>
              ) : (
                columnTasks.map((task) => {
                  const isOverdue =
                    task.due_date && new Date(task.due_date) < new Date() && task.status !== 'DONE';
                  const priority = PRIORITY_BADGES[task.priority] || PRIORITY_BADGES.MEDIUM;
                  const completedChecklists =
                    task.checklists?.filter((c) => c.is_completed).length || 0;
                  const totalChecklists = task.checklists?.length || 0;

                  return (
                    <div
                      key={task.id}
                      className="group bg-slate-800/90 hover:bg-slate-800 border border-slate-700/80 hover:border-indigo-500/50 rounded-xl p-3.5 shadow-md hover:shadow-indigo-500/10 transition-all text-left"
                    >
                      {/* Priority & Actions */}
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded border ${priority.color}`}
                        >
                          {priority.label}
                        </span>

                        <div className="flex items-center space-x-1 opacity-80 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => onEditTask(task)}
                            className="p-1 hover:text-indigo-400 text-slate-400 transition cursor-pointer"
                            title="Sửa công việc"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteTask(task.id)}
                            className="p-1 hover:text-rose-400 text-slate-400 transition cursor-pointer"
                            title="Xóa công việc"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Title */}
                      <h4
                        onClick={() => onEditTask(task)}
                        className="font-medium text-slate-200 text-sm leading-snug hover:text-indigo-300 cursor-pointer mb-1.5"
                      >
                        {task.title}
                      </h4>

                      {/* Description preview */}
                      {task.description && (
                        <p className="text-xs text-slate-400 line-clamp-2 mb-3">
                          {task.description}
                        </p>
                      )}

                      {/* Progress bar */}
                      <div className="mb-3">
                        <div className="flex justify-between items-center text-[11px] text-slate-400 mb-1">
                          <span>Tiến độ</span>
                          <span className="font-mono text-indigo-400 font-semibold">
                            {task.progress}%
                          </span>
                        </div>
                        <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 ${
                              task.progress === 100
                                ? 'bg-emerald-500'
                                : task.progress > 50
                                ? 'bg-indigo-500'
                                : 'bg-amber-500'
                            }`}
                            style={{ width: `${task.progress}%` }}
                          />
                        </div>
                      </div>

                      {/* Metadata: Checklist, Due date & Assignee */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-700/60 text-xs text-slate-400">
                        <div className="flex items-center space-x-2">
                          {totalChecklists > 0 && (
                            <div className="flex items-center space-x-1 text-[11px] bg-slate-900/60 px-1.5 py-0.5 rounded border border-slate-700">
                              <CheckSquare className="w-3 h-3 text-slate-400" />
                              <span>
                                {completedChecklists}/{totalChecklists}
                              </span>
                            </div>
                          )}

                          {task.due_date && (
                            <div
                              className={`flex items-center space-x-1 text-[11px] px-1.5 py-0.5 rounded border ${
                                isOverdue
                                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                                  : 'bg-slate-900/60 text-slate-400 border-slate-700'
                              }`}
                            >
                              <Calendar className="w-3 h-3" />
                              <span>{task.due_date.slice(5, 10)}</span>
                            </div>
                          )}
                        </div>

                        {/* Assignee Avatar */}
                        <div className="flex items-center space-x-1">
                          <div
                            className="w-6 h-6 rounded-full bg-indigo-950 border border-indigo-500/40 flex items-center justify-center text-[10px] font-bold text-indigo-300"
                            title={task.assignee_name || 'Chưa gán'}
                          >
                            {task.assignee_name ? task.assignee_name.charAt(0) : '?'}
                          </div>
                        </div>
                      </div>

                      {/* Move Status Controls */}
                      <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-700/40">
                        {getPrevStatus(col.id) ? (
                          <button
                            onClick={() => onUpdateTask(task.id, { status: getPrevStatus(col.id) })}
                            className="flex items-center text-[11px] text-slate-400 hover:text-slate-200 transition cursor-pointer"
                          >
                            <ChevronLeft className="w-3.5 h-3.5" />
                            <span>Lùi</span>
                          </button>
                        ) : (
                          <div />
                        )}

                        {getNextStatus(col.id) && (
                          <button
                            onClick={() => onUpdateTask(task.id, { status: getNextStatus(col.id) })}
                            className="flex items-center text-[11px] font-medium text-indigo-400 hover:text-indigo-300 transition cursor-pointer"
                          >
                            <span>Tiến</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
