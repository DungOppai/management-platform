import React, { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2Icon } from 'lucide-react';
import { BrandMark } from '../components/BrandMark';
import { Button } from '../components/Button';

type Mode = 'login' | 'register';

const inputClass =
'mt-1.5 h-10 w-full rounded-lg border bg-surface px-3 text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-accent/40';

export function Login() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('minhanh@vku.udn.vn');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (mode === 'register' && !name.trim()) next.name = 'Vui lòng nhập họ và tên';
    if (!/^\S+@\S+\.\S+$/.test(email)) next.email = 'Email không hợp lệ';
    if (password.length < 6) next.password = 'Mật khẩu cần ít nhất 6 ký tự';
    setErrors(next);
    if (Object.keys(next).length) return;
    setSubmitting(true);
    window.setTimeout(() => navigate('/'), 700);
  };

  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-canvas px-4 py-12">
      <div className="w-full max-w-sm">
        <BrandMark />
        <h1 className="mt-8 text-2xl font-semibold tracking-tight text-ink">
          {mode === 'login' ? 'Chào mừng trở lại' : 'Tạo tài khoản'}
        </h1>
        <p className="mt-1.5 text-sm text-ink-muted">Quản lý dự án và công việc nhóm cùng trợ lý AI.</p>

        <div className="mt-6 grid grid-cols-2 rounded-lg bg-subtle p-1" role="tablist" aria-label="Chế độ">
          {(['login', 'register'] as Mode[]).map((m) =>
          <button
            key={m}
            type="button"
            role="tab"
            aria-selected={mode === m}
            onClick={() => {
              setMode(m);
              setErrors({});
            }}
            className={`h-8 rounded-md text-sm font-medium transition-colors duration-150 ${
            mode === m ? 'bg-surface text-ink shadow-sm' : 'text-ink-muted hover:text-ink'}`
            }>
            
              {m === 'login' ? 'Đăng nhập' : 'Đăng ký'}
            </button>
          )}
        </div>

        <form onSubmit={submit} noValidate className="mt-6 space-y-4">
          {mode === 'register' &&
          <Field id="name" label="Họ và tên" error={errors.name}>
              <input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nguyễn Văn A"
              aria-invalid={!!errors.name}
              className={`${inputClass} ${errors.name ? 'border-danger' : 'border-line'}`} />
            
            </Field>
          }
          <Field id="email" label="Email" error={errors.email}>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={!!errors.email}
              className={`${inputClass} ${errors.email ? 'border-danger' : 'border-line'}`} />
            
          </Field>
          <Field id="password" label="Mật khẩu" error={errors.password}>
            <input
              id="password"
              type="password"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ít nhất 6 ký tự"
              aria-invalid={!!errors.password}
              className={`${inputClass} ${errors.password ? 'border-danger' : 'border-line'}`} />
            
          </Field>
          <Button type="submit" className="h-10 w-full" disabled={submitting}>
            {submitting && <Loader2Icon className="h-4 w-4 animate-spin" aria-hidden="true" />}
            {mode === 'login' ? 'Đăng nhập' : 'Tạo tài khoản'}
          </Button>
        </form>

        <p className="mt-10 text-center text-xs text-ink-faint">Đồ án tốt nghiệp · VKU</p>
      </div>
    </main>);

}

function Field({ id, label, error, children }: {id: string;label: string;error?: string;children: React.ReactNode;}) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium text-ink">
        {label}
      </label>
      {children}
      {error &&
      <p className="mt-1.5 text-xs text-danger" role="alert">
          {error}
        </p>
      }
    </div>);

}