import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRightIcon, CheckCircle2Icon, PlusIcon } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { Button } from '../components/Button';
import { Avatar } from '../components/Avatar';
import { PriorityTag } from '../components/PriorityTag';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { statuses } from '../data/taskMeta';
import { activity } from '../data/activity';
import { daysUntil, dueLabel, dueToneText, formatShortDate } from '../utils/date';

export function Dashboard() {
  const { project, tasks, members, getMember } = useWorkspace();
  const navigate = useNavigate();

  const total = tasks.length;
  const doneCount = tasks.filter((t) => t.status === 'done').length;
  const progress = total ? Math.round(tasks.reduce((sum, t) => sum + t.progress, 0) / total) : 0;
  const daysLeft = daysUntil(project.dueDate);
  const counts = statuses.map((s) => ({ ...s, count: tasks.filter((t) => t.status === s.id).length }));
  const attention = tasks.
  filter((t) => t.status !== 'done' && (daysUntil(t.dueDate) <= 2 || t.priority === 'urgent')).
  sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  const workload = members.map((m) => ({
    member: m,
    open: tasks.filter((t) => t.assigneeId === m.id && t.status !== 'done').length,
    done: tasks.filter((t) => t.assigneeId === m.id && t.status === 'done').length
  }));
  const maxOpen = Math.max(1, ...workload.map((w) => w.open));

  return (
    <div className="min-h-full">
      <PageHeader
        title={project.name}
        description={`Hạn chót ${formatShortDate(project.dueDate)} · ${members.length} thành viên`}
        actions={
        <Button onClick={() => navigate('/board')}>
            <PlusIcon className="h-4 w-4" aria-hidden="true" />
            Tạo công việc
          </Button>
        } />
      

      <div className="grid gap-6 px-5 py-6 lg:grid-cols-3 lg:px-8">
        <section className="rounded-xl border border-line bg-surface p-6 lg:col-span-2" aria-labelledby="progress-heading">
          <h2 id="progress-heading" className="text-sm font-medium text-ink-muted">
            Tiến độ dự án
          </h2>
          <p className="mt-2 text-5xl font-semibold tracking-tight text-ink tabular-nums">{progress}%</p>
          <p className="mt-2 text-sm text-ink-muted">
            {doneCount}/{total} công việc hoàn thành ·{' '}
            {daysLeft >= 0 ? `còn ${daysLeft} ngày đến hạn chót` : `trễ hạn ${-daysLeft} ngày`}
          </p>

          <div className="mt-6 flex h-2.5 gap-0.5 overflow-hidden rounded-full bg-subtle" aria-hidden="true">
            {counts.map(
              (s) =>
              s.count > 0 && <span key={s.id} className={s.dotClass} style={{ width: `${s.count / Math.max(total, 1) * 100}%` }} />
            )}
          </div>
          <dl className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {counts.map((s) =>
            <div key={s.id}>
                <dt className="flex items-center gap-2 text-xs text-ink-muted">
                  <span className={`h-2 w-2 rounded-full ${s.dotClass}`} aria-hidden="true" />
                  {s.label}
                </dt>
                <dd className="mt-1 text-lg font-semibold tabular-nums text-ink">{s.count}</dd>
              </div>
            )}
          </dl>
        </section>

        <section className="flex flex-col rounded-xl border border-line bg-surface" aria-labelledby="attention-heading">
          <div className="flex items-center justify-between px-5 pb-3 pt-5">
            <h2 id="attention-heading" className="text-sm font-semibold text-ink">
              Cần chú ý
            </h2>
            {attention.length > 0 &&
            <span className="rounded-full bg-danger-soft px-2 py-0.5 text-xs font-medium tabular-nums text-danger">
                {attention.length}
              </span>
            }
          </div>
          {attention.length === 0 ?
          <div className="flex flex-1 flex-col items-center justify-center px-5 pb-8 pt-4 text-center">
              <CheckCircle2Icon className="h-6 w-6 text-success" aria-hidden="true" />
              <p className="mt-2 text-sm text-ink-muted">Mọi việc đang đúng tiến độ.</p>
            </div> :

          <ul className="divide-y divide-line">
              {attention.map((t) => {
              const due = dueLabel(t.dueDate);
              return (
                <li key={t.id}>
                    <Link
                    to={`/board?task=${t.id}`}
                    className="flex items-center gap-3 px-5 py-3 transition-colors duration-150 hover:bg-subtle/60">
                    
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-ink">{t.title}</p>
                        <p className="mt-0.5 flex items-center gap-2 text-xs">
                          <span className="text-ink-faint">{t.code}</span>
                          <span className={dueToneText[due.tone]}>{due.label}</span>
                        </p>
                      </div>
                      <PriorityTag priority={t.priority} />
                      <Avatar member={getMember(t.assigneeId)} />
                    </Link>
                  </li>);

            })}
            </ul>
          }
          <Link
            to="/board"
            className="mt-auto flex items-center gap-1 border-t border-line px-5 py-3 text-sm font-medium text-accent hover:text-accent/80">
            
            Mở bảng công việc
            <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
          </Link>
        </section>

        <section className="rounded-xl border border-line bg-surface lg:col-span-2" aria-labelledby="workload-heading">
          <h2 id="workload-heading" className="px-5 pb-3 pt-5 text-sm font-semibold text-ink">
            Khối lượng theo thành viên
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[32rem] text-sm">
              <thead>
                <tr className="border-y border-line text-left text-xs text-ink-faint">
                  <th scope="col" className="px-5 py-2 font-medium">Thành viên</th>
                  <th scope="col" className="px-3 py-2 font-medium">Đang xử lý</th>
                  <th scope="col" className="w-2/5 px-3 py-2 font-medium">Mức tải</th>
                  <th scope="col" className="px-5 py-2 text-right font-medium">Đã xong</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {workload.map(({ member, open, done }) =>
                <tr key={member.id}>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar member={member} size="md" />
                        <div className="min-w-0">
                          <p className="truncate font-medium text-ink">{member.name}</p>
                          <p className="truncate text-xs text-ink-faint">{member.role}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 tabular-nums text-ink">{open}</td>
                    <td className="px-3 py-3">
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-subtle">
                        <div
                        className={`h-full rounded-full ${open >= 2 ? 'bg-warning' : 'bg-accent'}`}
                        style={{ width: `${open / maxOpen * 100}%` }} />
                      
                      </div>
                    </td>
                    <td className="px-5 py-3 text-right tabular-nums text-ink-muted">{done}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-xl border border-line bg-surface" aria-labelledby="activity-heading">
          <h2 id="activity-heading" className="px-5 pb-3 pt-5 text-sm font-semibold text-ink">
            Hoạt động gần đây
          </h2>
          <ol className="space-y-4 px-5 pb-5">
            {activity.map((a) => {
              const actor = getMember(a.actorId);
              return (
                <li key={a.id} className="flex gap-3">
                  <Avatar member={actor} />
                  <div className="min-w-0 text-sm">
                    <p className="text-ink-muted">
                      <span className="font-medium text-ink">{actor?.name}</span> {a.text}
                    </p>
                    <p className="mt-0.5 text-xs text-ink-faint">{a.time}</p>
                  </div>
                </li>);

            })}
          </ol>
        </section>
      </div>
    </div>);

}