import React, { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2Icon, SparklesIcon, ShieldCheckIcon } from 'lucide-react';
import { BrandMark } from '../components/BrandMark';
import { Button } from '../components/Button';
import api from '../services/api';

type Mode = 'login' | 'register';

const inputClass =
  'mt-1.5 h-10 w-full rounded-lg border bg-surface px-3 text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-accent/40';

export function Login() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('dung.hoang@vku.udn.vn');
  const [password, setPassword] = useState('password123');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const handleQuickLogin = async (quickEmail: string, quickPass: string) => {
    setSubmitting(true);
    setAuthError(null);
    try {
      const res = await api.post('/auth/login', { email: quickEmail, password: quickPass });
      if (res.data?.token) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        navigate('/');
      }
    } catch (err: any) {
      setAuthError(err.response?.data?.error || 'Không thể đăng nhập. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (mode === 'register' && !name.trim()) next.name = 'Vui lòng nhập họ và tên';
    if (!/^\S+@\S+\.\S+$/.test(email)) next.email = 'Email không hợp lệ';
    if (password.length < 6) next.password = 'Mật khẩu cần ít nhất 6 ký tự';
    setErrors(next);
    if (Object.keys(next).length) return;

    setSubmitting(true);
    setAuthError(null);

    try {
      if (mode === 'login') {
        const res = await api.post('/auth/login', { email, password });
        if (res.data?.token) {
          localStorage.setItem('token', res.data.token);
          localStorage.setItem('user', JSON.stringify(res.data.user));
          navigate('/');
        }
      } else {
        const res = await api.post('/auth/register', { email, password, full_name: name });
        if (res.data?.token) {
          localStorage.setItem('token', res.data.token);
          localStorage.setItem('user', JSON.stringify(res.data.user));
          navigate('/');
        }
      }
    } catch (err: any) {
      setAuthError(err.response?.data?.error || 'Lỗi xác thực, vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-canvas px-4 py-12">
      <div className="w-full max-w-sm">
        <BrandMark />
        <h1 className="mt-8 text-2xl font-semibold tracking-tight text-ink">
          {mode === 'login' ? 'Chào mừng trở lại' : 'Tạo tài khoản'}
        </h1>
        <p className="mt-1.5 text-sm text-ink-muted">
          Nền tảng Quản lý dự án tích hợp Trợ lý AI và Docker.
        </p>

        {/* 1-Click Quick Demo Login for VKU Thesis */}
        <div className="mt-6 rounded-xl border border-accent/30 bg-accent-soft/40 p-3">
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-accent mb-2">
            <ShieldCheckIcon className="h-4 w-4" />
            Đăng nhập nhanh 1-Click (Demo VKU)
          </p>
          <div className="space-y-1.5">
            <button
              type="button"
              disabled={submitting}
              onClick={() => handleQuickLogin('dung.hoang@vku.udn.vn', 'password123')}
              className="flex w-full items-center justify-between rounded-lg border border-line bg-surface px-3 py-2 text-left text-xs text-ink transition-colors hover:bg-subtle"
            >
              <div>
                <span className="block font-semibold">Hoàng Công Trí Dũng (22IT048)</span>
                <span className="text-[11px] text-ink-faint">Trưởng nhóm (Project Leader)</span>
              </div>
              <SparklesIcon className="h-3.5 w-3.5 text-accent" />
            </button>

            <button
              type="button"
              disabled={submitting}
              onClick={() => handleQuickLogin('khang.dang@vku.udn.vn', 'password123')}
              className="flex w-full items-center justify-between rounded-lg border border-line bg-surface px-3 py-2 text-left text-xs text-ink transition-colors hover:bg-subtle"
            >
              <div>
                <span className="block font-semibold">Đặng Trường Khang (22IT136)</span>
                <span className="text-[11px] text-ink-faint">Phát triển Full-stack</span>
              </div>
              <SparklesIcon className="h-3.5 w-3.5 text-accent" />
            </button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 rounded-lg bg-subtle p-1" role="tablist" aria-label="Chế độ">
          {(['login', 'register'] as Mode[]).map((m) => (
            <button
              key={m}
              type="button"
              role="tab"
              aria-selected={mode === m}
              onClick={() => {
                setMode(m);
                setErrors({});
                setAuthError(null);
              }}
              className={`h-8 rounded-md text-sm font-medium transition-colors duration-150 ${
                mode === m ? 'bg-surface text-ink shadow-sm' : 'text-ink-muted hover:text-ink'
              }`}
            >
              {m === 'login' ? 'Đăng nhập' : 'Đăng ký'}
            </button>
          ))}
        </div>

        {authError && (
          <div className="mt-4 rounded-lg bg-danger-soft p-2.5 text-xs text-danger">
            {authError}
          </div>
        )}

        <form onSubmit={submit} noValidate className="mt-4 space-y-4">
          {mode === 'register' && (
            <Field id="name" label="Họ và tên" error={errors.name}>
              <input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nguyễn Văn A"
                aria-invalid={!!errors.name}
                className={`${inputClass} ${errors.name ? 'border-danger' : 'border-line'}`}
              />
            </Field>
          )}

          <Field id="email" label="Email" error={errors.email}>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={!!errors.email}
              className={`${inputClass} ${errors.email ? 'border-danger' : 'border-line'}`}
            />
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
              className={`${inputClass} ${errors.password ? 'border-danger' : 'border-line'}`}
            />
          </Field>

          <Button type="submit" className="h-10 w-full" disabled={submitting}>
            {submitting && <Loader2Icon className="h-4 w-4 animate-spin" aria-hidden="true" />}
            {mode === 'login' ? 'Đăng nhập' : 'Tạo tài khoản'}
          </Button>
        </form>
      </div>
    </main>
  );
}

function Field({
  id,
  label,
  error,
  children
}: {
  id: string;
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="text-xs font-medium text-ink-muted">
          {label}
        </label>
        {error && (
          <span id={`${id}-error`} className="text-xs text-danger">
            {error}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}
