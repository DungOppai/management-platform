import React, { useState } from 'react';
import { 
  Bot, 
  Sparkles, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle2, 
  Copy, 
  Check, 
  UserX, 
  FileText, 
  Flame,
  ArrowRight
} from 'lucide-react';
import api from '../services/api';

export default function AICommandCenter({ project }) {
  const [activeTab, setActiveTab] = useState('standup');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Standup state
  const [standupReport, setStandupReport] = useState(null);

  // Bottleneck state
  const [bottleneckData, setBottleneckData] = useState(null);

  // Chat catchup state
  const [chatSummary, setChatSummary] = useState(null);

  const handleGenerateStandup = async () => {
    if (!project?.id) return;
    setLoading(true);
    try {
      const res = await api.post('/ai/standup-report', { projectId: project.id });
      setStandupReport(res.data.report);
    } catch (err) {
      console.error('Standup generation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDetectBottlenecks = async () => {
    if (!project?.id) return;
    setLoading(true);
    try {
      const res = await api.get(`/ai/bottlenecks/${project.id}`);
      setBottleneckData(res.data.analysis);
    } catch (err) {
      console.error('Bottlenecks error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChatCatchup = async () => {
    if (!project?.id) return;
    setLoading(true);
    try {
      const res = await api.get(`/ai/chat-catchup/${project.id}`);
      setChatSummary(res.data.summary);
    } catch (err) {
      console.error('Chat catchup error:', err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-4 text-left">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-violet-900/60 via-indigo-900/50 to-slate-900 border border-indigo-500/30 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="inline-flex items-center space-x-2 bg-indigo-500/20 border border-indigo-400/30 px-3 py-1 rounded-full text-indigo-300 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Trung tâm Trợ lý AI Đánh giá Tiến độ (AI Evaluator)</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight mb-2">
            Phân tích Dữ liệu Vận hành & Cảnh báo Sớm Tiến độ Dự án
          </h2>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Thay vì chỉ viết văn bản thông thường, mô hình AI đọc trực tiếp dữ liệu công việc, % hoàn thành và lịch sử thảo luận để tự động xuất báo cáo standup, nhận diện thành viên quá tải và cảnh báo các nguy cơ trễ hạn.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => {
            setActiveTab('standup');
            if (!standupReport) handleGenerateStandup();
          }}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
            activeTab === 'standup'
              ? 'bg-indigo-600 text-white shadow-lg'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Báo cáo Standup & Tiến độ</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('bottleneck');
            if (!bottleneckData) handleDetectBottlenecks();
          }}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
            activeTab === 'bottleneck'
              ? 'bg-indigo-600 text-white shadow-lg'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Flame className="w-4 h-4 text-amber-400" />
          <span>Điểm nghẽn & Rủi ro Quá tải</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('catchup');
            if (!chatSummary) handleChatCatchup();
          }}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
            activeTab === 'catchup'
              ? 'bg-indigo-600 text-white shadow-lg'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Bot className="w-4 h-4 text-violet-400" />
          <span>Tóm tắt Chat (Catch-up)</span>
        </button>
      </div>

      {/* Tab 1: Standup Report */}
      {activeTab === 'standup' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-200">
                Báo cáo Tiến độ Định kỳ do AI Đánh giá
              </h3>
              <p className="text-xs text-slate-400">
                {standupReport?.generatedBy || 'Sẵn sàng kích hoạt'}
              </p>
            </div>

            <div className="flex items-center space-x-2">
              {standupReport?.markdownContent && (
                <button
                  onClick={() => copyToClipboard(standupReport.markdownContent)}
                  className="flex items-center space-x-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs px-3 py-1.5 rounded-lg border border-slate-700 transition"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Đã sao chép' : 'Sao chép Markdown'}</span>
                </button>
              )}

              <button
                onClick={handleGenerateStandup}
                disabled={loading}
                className="flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-1.5 rounded-lg transition disabled:opacity-50"
              >
                {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                <span>{standupReport ? 'Phân tích lại' : 'Tạo Báo cáo Ngay'}</span>
              </button>
            </div>
          </div>

          {loading ? (
            <div className="py-16 text-center text-slate-400 text-xs flex flex-col items-center justify-center space-y-3">
              <RefreshCw className="w-8 h-8 animate-spin text-indigo-400" />
              <p>AI đang tổng hợp dữ liệu tiến độ từ các thẻ task và tính toán rủi ro...</p>
            </div>
          ) : standupReport ? (
            <div className="prose prose-invert max-w-none text-xs text-slate-300 whitespace-pre-line leading-relaxed bg-slate-950/60 p-5 rounded-xl border border-slate-800/80 font-sans">
              {standupReport.markdownContent}
            </div>
          ) : (
            <div className="py-16 text-center text-slate-500 text-xs">
              <FileText className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p>Bấm nút "Tạo Báo cáo Ngay" để AI quét toàn bộ task của dự án và lập báo cáo.</p>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Bottlenecks & Overload */}
      {activeTab === 'bottleneck' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-semibold text-slate-200">
                Phát hiện Điểm nghẽn Dự án & Nguy cơ Quá tải
              </h3>
              <p className="text-xs text-slate-400">
                Phân tích tải công việc thực tế của từng thành viên
              </p>
            </div>
            <button
              onClick={handleDetectBottlenecks}
              disabled={loading}
              className="flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-1.5 rounded-lg transition disabled:opacity-50"
            >
              {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
              <span>Quét lại dữ liệu</span>
            </button>
          </div>

          {loading ? (
            <div className="py-12 text-center text-slate-400 text-xs flex flex-col items-center">
              <RefreshCw className="w-8 h-8 animate-spin text-indigo-400 mb-2" />
              <p>Đang kiểm tra rủi ro quá tải...</p>
            </div>
          ) : bottleneckData ? (
            <div className="space-y-5">
              {/* AI Recommendation Alert */}
              <div className={`p-4 rounded-xl border text-xs leading-relaxed flex items-start space-x-3 ${
                bottleneckData.overloadedMembers.length > 0
                  ? 'bg-amber-950/40 border-amber-500/40 text-amber-200'
                  : 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
              }`}>
                {bottleneckData.overloadedMembers.length > 0 ? (
                  <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                ) : (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <h4 className="font-semibold mb-1">Đánh giá từ AI:</h4>
                  <p>{bottleneckData.recommendation}</p>
                </div>
              </div>

              {/* Overloaded Members Cards */}
              {bottleneckData.overloadedMembers.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <UserX className="w-4 h-4 text-rose-400" />
                    Thành viên đang có nguy cơ quá tải ({bottleneckData.overloadedMembers.length})
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {bottleneckData.overloadedMembers.map((m) => (
                      <div key={m.memberId} className="bg-slate-800/80 border border-rose-500/30 rounded-xl p-3.5">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-semibold text-slate-200 text-xs">{m.fullName}</span>
                          <span className="bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] px-2 py-0.5 rounded font-semibold">
                            Cần giảm tải
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 space-y-1">
                          <p>• Task đang chạy: <span className="text-slate-200 font-semibold">{m.activeTasks}</span></p>
                          <p>• Task mức độ Khẩn cấp/Cao: <span className="text-rose-400 font-semibold">{m.urgentTasks}</span></p>
                          <p>• Task đã quá hạn: <span className="text-amber-400 font-semibold">{m.overdueTasks}</span></p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Workload Breakdown Table */}
              <div>
                <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Bảng tổng hợp Khối lượng Công việc (Team Workload)
                </h4>
                <div className="overflow-x-auto border border-slate-800 rounded-xl">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-950/80 text-slate-400 uppercase text-[10px]">
                      <tr>
                        <th className="px-4 py-2.5">Thành viên</th>
                        <th className="px-4 py-2.5">Tổng được giao</th>
                        <th className="px-4 py-2.5">Đang làm</th>
                        <th className="px-4 py-2.5">Task Gấp</th>
                        <th className="px-4 py-2.5">Quá hạn</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-slate-300">
                      {bottleneckData.workloadBreakdown.map((w) => (
                        <tr key={w.memberId} className="hover:bg-slate-800/40">
                          <td className="px-4 py-2.5 font-medium text-slate-200">{w.fullName}</td>
                          <td className="px-4 py-2.5">{w.totalAssigned}</td>
                          <td className="px-4 py-2.5">{w.activeTasks}</td>
                          <td className="px-4 py-2.5 text-amber-400">{w.urgentTasks}</td>
                          <td className="px-4 py-2.5 text-rose-400">{w.overdueTasks}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-slate-500 text-xs">
              <p>Chưa có dữ liệu phân tích.</p>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Chat Catch-up */}
      {activeTab === 'catchup' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-200">
                Tóm tắt Tin nhắn Thảo luận bị nhỡ (Chat Catch-up)
              </h3>
              <p className="text-xs text-slate-400">
                Giúp thành viên vào sau nắm ngay các quyết định quan trọng
              </p>
            </div>
            <button
              onClick={handleChatCatchup}
              disabled={loading}
              className="flex items-center space-x-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-1.5 rounded-lg transition disabled:opacity-50"
            >
              {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              <span>Tóm tắt lại</span>
            </button>
          </div>

          {loading ? (
            <div className="py-12 text-center text-slate-400 text-xs flex flex-col items-center">
              <RefreshCw className="w-8 h-8 animate-spin text-indigo-400 mb-2" />
              <p>AI đang đọc qua các tin nhắn gần nhất và rút ra các điểm chính...</p>
            </div>
          ) : chatSummary ? (
            <div className="bg-slate-950/70 border border-slate-800 p-5 rounded-xl text-xs text-slate-300 whitespace-pre-line leading-relaxed font-sans">
              {chatSummary}
            </div>
          ) : (
            <div className="py-12 text-center text-slate-500 text-xs">
              <p>Bấm nút "Tóm tắt lại" để AI phân tích tin nhắn phòng chat.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
