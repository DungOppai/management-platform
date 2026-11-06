import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  TrendingUp, 
  Users, 
  Layers,
  Award
} from 'lucide-react';
import api from '../services/api';

export default function DashboardView({ project }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      if (!project?.id) return;
      try {
        setLoading(true);
        const res = await api.get(`/dashboard/project/${project.id}`);
        setStats(res.data);
      } catch (err) {
        console.error('Failed to load dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, [project?.id]);

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-400 text-xs">
        Đang tổng hợp dữ liệu phân tích dashboard...
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6 text-left">
      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Tasks */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400">Tổng Công việc</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white mb-1 font-mono">{stats.totalTasks}</div>
          <span className="text-[11px] text-slate-500">Được phân bổ trong 4 cột trạng thái</span>
        </div>

        {/* Card 2: Average Progress */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400">Tiến độ Trung bình</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-400 mb-1 font-mono">
            {stats.averageProgress}%
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden mt-1">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all"
              style={{ width: `${stats.averageProgress}%` }}
            />
          </div>
        </div>

        {/* Card 3: On-time Completion Rate */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400">Tỷ lệ Đúng hạn</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-blue-400 mb-1 font-mono">
            {stats.onTimeRate}%
          </div>
          <span className="text-[11px] text-slate-500">Dựa trên tỷ lệ task hoàn thành trước hạn</span>
        </div>

        {/* Card 4: Overdue Tasks */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400">Công việc Quá hạn</span>
            <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className={`text-2xl font-bold font-mono mb-1 ${stats.overdueCount > 0 ? 'text-rose-400' : 'text-slate-200'}`}>
            {stats.overdueCount}
          </div>
          <span className="text-[11px] text-slate-500">Cần ưu tiên xử lý để tránh tắc nghẽn</span>
        </div>
      </div>

      {/* Grid: Status Distribution & Team Workload */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Phân bổ Trạng thái Công việc
            </h3>
            <span className="text-xs text-slate-500">Kanban Status</span>
          </div>

          <div className="space-y-3">
            {[
              { key: 'TODO', label: 'Chờ thực hiện (To Do)', color: 'bg-slate-500', count: stats.statusCounts.TODO },
              { key: 'IN_PROGRESS', label: 'Đang làm (In Progress)', color: 'bg-blue-500', count: stats.statusCounts.IN_PROGRESS },
              { key: 'REVIEW', label: 'Đang kiểm duyệt (Review)', color: 'bg-purple-500', count: stats.statusCounts.REVIEW },
              { key: 'DONE', label: 'Đã hoàn thành (Done)', color: 'bg-emerald-500', count: stats.statusCounts.DONE },
            ].map((item) => {
              const percent = stats.totalTasks > 0 ? Math.round((item.count / stats.totalTasks) * 100) : 0;
              return (
                <div key={item.key}>
                  <div className="flex justify-between items-center text-xs mb-1">
                    <span className="text-slate-300">{item.label}</span>
                    <span className="text-slate-400 font-mono">
                      {item.count} task ({percent}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className={`${item.color} h-full transition-all`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Priority Distribution */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Mức độ Ưu tiên (Priority Matrix)
            </h3>
            <span className="text-xs text-slate-500">Impact & Urgency</span>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="bg-rose-950/20 border border-rose-500/30 rounded-xl p-3 text-center">
              <span className="text-xs text-rose-300 font-semibold block mb-1">Khẩn cấp (Urgent)</span>
              <span className="text-xl font-bold text-rose-400 font-mono">{stats.priorityCounts.URGENT}</span>
            </div>
            <div className="bg-amber-950/20 border border-amber-500/30 rounded-xl p-3 text-center">
              <span className="text-xs text-amber-300 font-semibold block mb-1">Ưu tiên cao (High)</span>
              <span className="text-xl font-bold text-amber-400 font-mono">{stats.priorityCounts.HIGH}</span>
            </div>
            <div className="bg-blue-950/20 border border-blue-500/30 rounded-xl p-3 text-center">
              <span className="text-xs text-blue-300 font-semibold block mb-1">Bình thường (Medium)</span>
              <span className="text-xl font-bold text-blue-400 font-mono">{stats.priorityCounts.MEDIUM}</span>
            </div>
            <div className="bg-slate-800/40 border border-slate-700/40 rounded-xl p-3 text-center">
              <span className="text-xs text-slate-400 font-semibold block mb-1">Thấp (Low)</span>
              <span className="text-xl font-bold text-slate-300 font-mono">{stats.priorityCounts.LOW}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Member Performance & Contribution Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-400" />
            Đo lường Hiệu suất & Đóng góp Thành viên (Member Performance)
          </h3>
          <span className="text-xs text-indigo-400 font-mono">Đo lường tự động</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px]">
              <tr>
                <th className="px-4 py-3">Thành viên</th>
                <th className="px-4 py-3">Vai trò</th>
                <th className="px-4 py-3">Tổng Task giao</th>
                <th className="px-4 py-3">Đã hoàn thành</th>
                <th className="px-4 py-3">Tỷ lệ hoàn thành</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {stats.members?.map((m) => {
                const assigned = parseInt(m.assigned_count, 10) || 0;
                const done = parseInt(m.done_count, 10) || 0;
                const rate = assigned > 0 ? Math.round((done / assigned) * 100) : 0;

                return (
                  <tr key={m.id} className="hover:bg-slate-800/40">
                    <td className="px-4 py-3 font-medium text-slate-200">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 rounded-full bg-indigo-900/60 text-indigo-300 flex items-center justify-center font-bold text-[10px]">
                          {m.full_name?.charAt(0)}
                        </div>
                        <span>{m.full_name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-400 font-mono text-[11px]">{m.project_role}</td>
                    <td className="px-4 py-3 font-mono">{assigned}</td>
                    <td className="px-4 py-3 text-emerald-400 font-mono">{done}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-indigo-500 h-full rounded-full"
                            style={{ width: `${rate}%` }}
                          />
                        </div>
                        <span className="font-mono text-indigo-300 font-semibold">{rate}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
