import React, { useState } from 'react';
import { Sparkles, User, Lock, Mail, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AuthModal() {
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isRegister) {
        await register(email, password, fullName);
      } else {
        await login(email, password);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Có lỗi xảy ra, vui lòng thử lại');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (quickEmail, quickPassword) => {
    setError('');
    setLoading(true);
    try {
      await login(quickEmail, quickPassword);
    } catch (err) {
      setError(err.response?.data?.error || 'Lỗi đăng nhập nhanh');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden p-8 text-left">
        {/* Logo & Intro */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 mx-auto flex items-center justify-center shadow-lg shadow-indigo-500/20 mb-3 text-white">
            <Sparkles className="w-6 h-6 text-indigo-100" />
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">AI Project Management</h2>
          <p className="text-xs text-slate-400 mt-1">Đồ án Tốt nghiệp CNTT • Trường Đại học CNTT & TT Việt - Hàn</p>
        </div>

        {/* Quick Demo Login Bar */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3 mb-6">
          <p className="text-[11px] font-semibold text-indigo-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
            Đăng nhập nhanh 1-Click (Demo Tài khoản Nhóm)
          </p>
          <div className="grid grid-cols-1 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('dung.hoang@vku.udn.vn', 'password123')}
              className="w-full text-left bg-slate-800/80 hover:bg-slate-800 border border-slate-700 hover:border-indigo-500/50 rounded-xl px-3 py-2 text-xs text-slate-200 flex items-center justify-between transition cursor-pointer"
            >
              <div>
                <p className="font-semibold text-white">Hoàng Công Trí Dũng (22IT048)</p>
                <p className="text-[10px] text-slate-400">Vai trò: Project Leader</p>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-indigo-400" />
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('khang.dang@vku.udn.vn', 'password123')}
              className="w-full text-left bg-slate-800/80 hover:bg-slate-800 border border-slate-700 hover:border-indigo-500/50 rounded-xl px-3 py-2 text-xs text-slate-200 flex items-center justify-between transition cursor-pointer"
            >
              <div>
                <p className="font-semibold text-white">Đặng Trường Khang (22IT136)</p>
                <p className="text-[10px] text-slate-400">Vai trò: Full-stack Developer</p>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-indigo-400" />
            </button>
          </div>
        </div>

        <div className="relative flex py-2 items-center mb-4">
          <div className="flex-grow border-t border-slate-800"></div>
          <span className="flex-shrink mx-3 text-slate-500 text-[11px] uppercase tracking-wider font-semibold">
            hoặc đăng nhập bằng tài khoản
          </span>
          <div className="flex-grow border-t border-slate-800"></div>
        </div>

        {error && (
          <div className="bg-rose-950/40 border border-rose-500/40 text-rose-300 rounded-xl p-2.5 text-xs mb-4">
            {error}
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {isRegister && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Họ và tên</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Nguyễn Văn A"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@vku.udn.vn"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Mật khẩu</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl text-xs transition shadow-lg shadow-indigo-600/20 cursor-pointer mt-2"
          >
            {loading ? 'Đang xử lý...' : isRegister ? 'Tạo tài khoản' : 'Đăng nhập vào Hệ thống'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setError('');
            }}
            className="text-xs text-slate-400 hover:text-indigo-400 transition"
          >
            {isRegister ? 'Đã có tài khoản? Đăng nhập ngay' : 'Chưa có tài khoản? Đăng ký mới'}
          </button>
        </div>
      </div>
    </div>
  );
}
