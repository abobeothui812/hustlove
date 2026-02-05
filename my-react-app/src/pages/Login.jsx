
import { useState } from "react";
import axios from "axios";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const API_URL = import.meta.env.VITE_API_URL;

  // Get redirect destination from location state (set by ProtectedRoute)
  const from = location.state?.from?.pathname || "/feed";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setIsLoading(true);

    try {
      const res = await axios.post(`${API_URL}/api/auth/login`, form, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });

      const { user, accessToken } = res.data;

      if (!user || (!user.id && !user._id)) {
        setMessage("Lỗi: Server không trả về đầy đủ thông tin user");
        return;
      }

      // Use AuthContext login - handles storage and normalization
      const loggedInUser = login(user, accessToken);

      // Redirect based on profile completion
      if (!loggedInUser.isProfileComplete) {
        navigate("/complete-profile", { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    } catch (err) {
      console.error("Lỗi đăng nhập:", err);
      
      if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
        const errorMessages = err.response.data.errors.map(e => e.msg).join(", ");
        setMessage(errorMessages);
      } else {
        setMessage(err.response?.data?.message || "Lỗi kết nối tới server!");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-rose-50 via-pink-100 to-purple-50">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 -left-16 h-72 w-72 rounded-full bg-rose-200/40 blur-3xl" />
        <div className="absolute top-20 right-20 h-80 w-80 rounded-full bg-purple-200/40 blur-3xl" />
        <div className="absolute bottom-10 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-pink-200/40 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.85),transparent_60%)]" />
      </div>

      <div className="flex min-h-screen items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg rounded-[2.5rem] border border-rose-100/70 bg-white/80 p-10 shadow-2xl shadow-rose-200/60 backdrop-blur">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 inline-flex items-center gap-3 rounded-full bg-rose-50 px-5 py-2 text-sm font-medium text-rose-500">
              <Sparkles className="h-4 w-4" />
              HUSTLove
            </div>
            <h1 className="text-3xl font-bold text-slate-900">Chào mừng đến với nơi kết nối Bách khoa</h1>
            <p className="mt-2 text-sm text-slate-600">
              Đăng nhập để tiếp tục câu chuyện học thuật và cảm xúc của riêng bạn.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">Email HUST</label>
              <input
                type="email"
                placeholder="nhan.van@hust.edu.vn"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                autoComplete="email"
                className="w-full rounded-full border border-rose-100 bg-white/80 px-5 py-3 text-sm text-slate-700 shadow-inner shadow-rose-100/40 transition focus:border-rose-300 focus:ring-2 focus:ring-rose-200 focus:outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">Mật khẩu</label>
              <input
                type="password"
                placeholder="Nhập mật khẩu của bạn"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                autoComplete="current-password"
                className="w-full rounded-full border border-rose-100 bg-white/80 px-5 py-3 text-sm text-slate-700 shadow-inner shadow-rose-100/40 transition focus:border-rose-300 focus:ring-2 focus:ring-rose-200 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-full bg-gradient-to-r from-rose-400 via-orange-200 to-pink-300 px-6 py-3 text-base font-semibold text-slate-900 shadow-lg shadow-rose-200/70 transition hover:scale-[1.01] hover:shadow-rose-200/100 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>

            {/* Google sign-in removed — only HUST email allowed */}

            <div className="flex items-center justify-between text-sm">
              <Link to="/forgot-password" className="font-semibold text-teal-500 hover:text-teal-400">
                Quên mật khẩu?
              </Link>
              <p className="text-slate-600">
                Chưa có tài khoản?{" "}
                <Link to="/register" className="font-semibold text-teal-500 hover:text-teal-400">
                  Đăng ký
                </Link>
              </p>
            </div>

            {message && (
              <p className="rounded-full bg-rose-50/90 px-4 py-2 text-center text-sm text-rose-500">
                {message}
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
