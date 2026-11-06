import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import {
  AlertTriangleIcon,
  CopyIcon,
  MessageSquareTextIcon,
  RefreshCwIcon,
  SparklesIcon,
  UsersIcon,
  BotIcon
} from "lucide-react";
import { PageHeader } from "../components/PageHeader";
import { Button } from "../components/Button";
import { useWorkspace } from "../contexts/WorkspaceContext";
import { assistantActions, assistantReports as defaultReports } from "../data/assistantReports";
import { AssistantActionId, AssistantReport, ReportItem } from "../types/project";
import api from "../services/api";

type RunState = 'idle' | 'loading' | 'ready';

const actionIcons: Record<AssistantActionId, React.ComponentType<{ className?: string }>> = {
  standup: UsersIcon,
  bottlenecks: AlertTriangleIcon,
  catchup: MessageSquareTextIcon
};

const toneDot: Record<NonNullable<ReportItem['tone']>, string> = {
  danger: 'bg-danger',
  warning: 'bg-warning',
  success: 'bg-success',
  neutral: 'bg-ink-faint'
};

export function Assistant() {
  const { project, tasks } = useWorkspace();
  const [active, setActive] = useState<AssistantActionId>('standup');
  const [reports, setReports] = useState<Record<AssistantActionId, AssistantReport>>(defaultReports);
  const [runs, setRuns] = useState<Record<AssistantActionId, RunState>>({
    standup: 'idle',
    bottlenecks: 'idle',
    catchup: 'idle'
  });

  const run = async (id: AssistantActionId) => {
    setRuns((r) => ({ ...r, [id]: 'loading' }));

    try {
      if (id === 'standup') {
        const res = await api.post('/ai/standup-report', { projectId: project.id });
        if (res.data?.report) {
          const raw = res.data.report;
          const doneTasks = tasks.filter((t) => t.status === 'done');
          const activeTasks = tasks.filter((t) => t.status === 'in_progress');
          const overdueTasks = tasks.filter((t) => new Date(t.dueDate) < new Date() && t.status !== 'done');

          const newReport: AssistantReport = {
            title: `Báo cáo standup dự án ${project.name}`,
            summary: raw.summary || `Đã tổng hợp tiến độ tự động dựa trên ${tasks.length} công việc.`,
            basis: `Phân tích bởi ${raw.generatedBy || 'AI Engine'} · ${tasks.length} công việc`,
            sections: [
              {
                heading: `Hạng mục đã hoàn thành (${doneTasks.length})`,
                items: doneTasks.length > 0
                  ? doneTasks.map((t) => ({ label: t.code, text: t.title, tone: 'success' }))
                  : [{ text: 'Chưa có công việc nào hoàn thành 100% trong kỳ này.', tone: 'neutral' }]
              },
              {
                heading: `Điểm nghẽn & Cần chú ý (${overdueTasks.length} trễ hạn)`,
                items: overdueTasks.length > 0
                  ? overdueTasks.map((t) => ({ label: t.code, text: `${t.title} (Hạn ${t.dueDate})`, tone: 'danger' }))
                  : [{ text: 'Tuyệt vời! Không có công việc nào bị quá hạn.', tone: 'success' }]
              },
              {
                heading: `Đang triển khai (${activeTasks.length})`,
                items: activeTasks.map((t) => ({
                  label: t.code,
                  text: `${t.title} (${t.progress}%)`,
                  tone: t.priority === 'urgent' ? 'danger' : 'warning'
                }))
              }
            ]
          };

          setReports((prev) => ({ ...prev, standup: newReport }));
        }
      } else if (id === 'bottlenecks') {
        const res = await api.get(`/ai/bottlenecks/${project.id}`);
        if (res.data?.analysis) {
          const a = res.data.analysis;
          const newReport: AssistantReport = {
            title: 'Phân tích Điểm nghẽn & Khối lượng Công việc',
            summary: a.recommendation,
            basis: `Phát hiện ${a.overdueCount} việc quá hạn · ${a.overloadedMembers?.length || 0} thành viên quá tải`,
            sections: [
              {
                heading: 'Công việc quá hạn cần giải phóng',
                items: (a.overdueTasks || []).map((t: any) => ({
                  label: `Task #${t.id}`,
                  text: `${t.title} (Hạn: ${t.dueDate ? t.dueDate.slice(0, 10) : 'N/A'}, Phụ trách: ${t.assigneeName || 'Chưa gán'})`,
                  tone: 'danger'
                }))
              },
              {
                heading: 'Thành viên có nguy cơ quá tải',
                items: (a.overloadedMembers || []).map((m: any) => ({
                  label: m.fullName,
                  text: `Đang giữ ${m.activeTasks} task (${m.urgentTasks} task gấp, ${m.overdueTasks} quá hạn)`,
                  tone: 'warning'
                }))
              },
              {
                heading: 'Đề xuất phân bổ từ AI',
                items: [
                  { text: 'Điều chuyển các việc TODO của thành viên quá tải sang các thành viên còn thời gian trống.', tone: 'success' },
                  { text: 'Tập trung hoàn thành các thẻ In Progress trước khi mở thêm thẻ mới.', tone: 'success' }
                ]
              }
            ]
          };
          setReports((prev) => ({ ...prev, bottlenecks: newReport }));
        }
      } else if (id === 'catchup') {
        const res = await api.get(`/ai/chat-catchup/${project.id}`);
        if (res.data?.summary) {
          const newReport: AssistantReport = {
            title: 'Tóm tắt Thảo luận Gần nhất',
            summary: res.data.summary,
            basis: 'Trích xuất tự động từ tin nhắn phòng chat',
            sections: [
              {
                heading: 'Nội dung cốt lõi',
                items: [
                  { text: 'Các thành viên thảo luận về phân bổ công việc và cập nhật tiến độ.', tone: 'neutral' },
                  { text: 'Bấm nút "Tạo việc" ở khung chat để AI đưa ngay thẻ lên bảng Kanban.', tone: 'success' }
                ]
              }
            ]
          };
          setReports((prev) => ({ ...prev, catchup: newReport }));
        }
      }
    } catch (err) {
      console.warn('AI run error, using local template report:', err);
    } finally {
      setRuns((r) => ({ ...r, [id]: 'ready' }));
    }
  };

  const action = assistantActions.find((a) => a.id === active) ?? assistantActions[0];
  const report = reports[active];
  const state = runs[active];
  const Icon = actionIcons[active];

  const copy = async () => {
    const plain = [
      report.title,
      report.summary,
      ...report.sections.flatMap((s) => [
        s.heading,
        ...s.items.map((i) => `- ${i.label ? `${i.label}: ` : ''}${i.text}`)
      ])
    ].join('\n');
    try {
      await navigator.clipboard.writeText(plain);
      toast.success('Đã sao chép báo cáo');
    } catch {
      toast.error('Không thể sao chép, hãy thử lại');
    }
  };

  return (
    <div className="min-h-full">
      <PageHeader
        title="Trợ lý AI"
        description={`Phân tích nhanh tình hình ${project.name} từ công việc và thảo luận`}
      />

      <div className="grid gap-6 px-5 py-6 lg:grid-cols-[17rem_1fr] lg:px-8">
        <nav aria-label="Loại phân tích">
          <ul className="flex gap-2 overflow-x-auto lg:flex-col lg:gap-1">
            {assistantActions.map((a) => {
              const ActionIcon = actionIcons[a.id];
              const selected = a.id === active;
              return (
                <li key={a.id} className="shrink-0 lg:shrink">
                  <button
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setActive(a.id)}
                    className={`flex w-full items-start gap-3 rounded-lg border px-3 py-3 text-left transition-colors duration-150 ${
                      selected ? 'border-line bg-surface shadow-sm' : 'border-transparent hover:bg-subtle'
                    }`}
                  >
                    <ActionIcon
                      className={`mt-0.5 h-4 w-4 shrink-0 ${selected ? 'text-accent' : 'text-ink-faint'}`}
                      aria-hidden="true"
                    />
                    <span className="min-w-0">
                      <span className="block whitespace-nowrap text-sm font-medium text-ink">
                        {a.title}
                      </span>
                      <span className="mt-0.5 hidden text-xs leading-relaxed text-ink-muted lg:block">
                        {a.description}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <section
          className="min-h-[28rem] rounded-xl border border-line bg-surface"
          aria-live="polite"
          aria-busy={state === 'loading'}
        >
          <AnimatePresence mode="wait" initial={false}>
            {state === 'idle' && (
              <motion.div
                key={`${active}-idle`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="flex h-full min-h-[28rem] flex-col items-center justify-center px-6 text-center"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-accent-soft text-accent">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <h2 className="mt-4 text-base font-semibold text-ink">{action.title}</h2>
                <p className="mt-1 max-w-sm text-sm text-ink-muted">{action.description}</p>
                <Button className="mt-5" onClick={() => run(active)}>
                  <SparklesIcon className="h-4 w-4" aria-hidden="true" />
                  Tạo báo cáo với AI
                </Button>
              </motion.div>
            )}

            {state === 'loading' && (
              <motion.div
                key={`${active}-loading`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="p-6"
              >
                <p className="flex items-center gap-2 text-sm text-ink-muted">
                  <SparklesIcon className="h-4 w-4 animate-pulse text-accent" aria-hidden="true" />
                  AI đang phân tích dữ liệu dự án…
                </p>
                <div className="mt-6 space-y-3" aria-hidden="true">
                  <div className="h-5 w-1/3 animate-pulse rounded bg-subtle" />
                  <div className="h-4 w-5/6 animate-pulse rounded bg-subtle" />
                  <div className="h-4 w-2/3 animate-pulse rounded bg-subtle" />
                  <div className="h-4 w-3/4 animate-pulse rounded bg-subtle" />
                </div>
              </motion.div>
            )}

            {state === 'ready' && (
              <motion.article
                key={`${active}-ready`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
              >
                <header className="flex flex-col gap-3 border-b border-line px-6 py-5 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h2 className="text-base font-semibold text-ink">{report.title}</h2>
                    <p className="mt-1 text-xs text-ink-faint">{report.basis}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="secondary" size="sm" onClick={copy}>
                      <CopyIcon className="h-3.5 w-3.5" aria-hidden="true" />
                      Sao chép
                    </Button>
                    <Button variant="secondary" size="sm" onClick={() => run(active)}>
                      <RefreshCwIcon className="h-3.5 w-3.5" aria-hidden="true" />
                      Phân tích lại
                    </Button>
                  </div>
                </header>
                <div className="px-6 py-5">
                  <p className="text-[15px] leading-relaxed text-ink">{report.summary}</p>
                  <div className="mt-6 space-y-6">
                    {report.sections.map((section) => (
                      <section key={section.heading}>
                        <h3 className="text-sm font-semibold text-ink">{section.heading}</h3>
                        <ul className="mt-2 space-y-2">
                          {section.items.map((item, i) => (
                            <li key={i} className="flex gap-3 text-sm leading-relaxed">
                              <span
                                className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${
                                  toneDot[item.tone ?? 'neutral']
                                }`}
                                aria-hidden="true"
                              />
                              <p className="text-ink-muted">
                                {item.label && (
                                  <span className="font-medium text-ink">{item.label}: </span>
                                )}
                                {item.text}
                              </p>
                            </li>
                          ))}
                        </ul>
                      </section>
                    ))}
                  </div>
                </div>
              </motion.article>
            )}
          </AnimatePresence>
        </section>
      </div>
    </div>
  );
}
