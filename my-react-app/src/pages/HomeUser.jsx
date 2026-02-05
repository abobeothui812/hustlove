import { useState, useEffect } from 'react';
import { Heart, MessageCircle, Users, Sparkles, TrendingUp, Star, Crown, Zap, Calendar, MapPin, Briefcase, Gift } from 'lucide-react';
import FallingStarCanvas from '../components/FallingStarCanvas';

// Animated Gradient Blob


export default function Home() {
  const [user, setUser] = useState(null);
  const [stats] = useState({
    totalUsers: 12458,
    activeNow: 3247,
    matchesToday: 856,
    messagesExchanged: 45123
  });

  useEffect(() => {
    const userData = JSON.parse(sessionStorage.getItem('user') || '{}');
    setUser(userData);
  }, []);

  const features = [
    {
      icon: Heart,
      title: 'Smart Matching',
      description: 'AI tìm kiếm người phù hợp nhất với bạn',
      color: 'from-pink-500 to-rose-500'
    },
    {
      icon: MessageCircle,
      title: 'Chat Realtime',
      description: 'Nhắn tin nhanh chóng, không giới hạn',
      color: 'from-purple-500 to-indigo-500'
    },
    {
      icon: Users,
      title: 'Community',
      description: 'Kết nối với hàng nghìn người dùng',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Crown,
      title: 'Premium Features',
      description: 'Trải nghiệm cao cấp, không quảng cáo',
      color: 'from-amber-500 to-yellow-500'
    }
  ];

  const upcomingEvents = [
    {
      id: 1,
      title: 'Coffee Meetup 💕',
      date: '28 Nov, 2025',
      location: 'The Coffee House, Hà Nội',
      attendees: 24,
      image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400'
    },
    {
      id: 2,
      title: 'Speed Dating Night ⚡',
      date: '30 Nov, 2025',
      location: 'Highlands Coffee, HCM',
      attendees: 18,
      image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=400'
    },
    {
      id: 3,
      title: 'Movie Night 🎬',
      date: '2 Dec, 2025',
      location: 'CGV Vincom, Hà Nội',
      attendees: 32,
      image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-purple-900 to-black text-white overflow-hidden">
      <FallingStarCanvas />
      

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16 pt-8">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full px-6 py-2 mb-6">
            <Sparkles className="w-4 h-4 text-yellow-300" />
            <span className="text-sm">Welcome to the Future of Dating</span>
            <Sparkles className="w-4 h-4 text-yellow-300" />
          </div>
          
          <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-pink-300 via-purple-300 to-blue-300 bg-clip-text text-transparent">
            Find Your Perfect Match
          </h1>
          
          <p className="text-xl text-white/70 mb-8 max-w-2xl mx-auto">
            Kết nối với những người đặc biệt, chia sẻ niềm vui và tìm kiếm tình yêu đích thực
          </p>

          {!user?.id ? (
            <div className="flex gap-4 justify-center">
              <a
                href="/register"
                className="group px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full font-semibold text-lg hover:shadow-2xl hover:shadow-pink-500/50 transition-all duration-300 hover:scale-105"
              >
                Bắt đầu ngay
                <Zap className="inline w-5 h-5 ml-2 group-hover:animate-bounce" />
              </a>
              <a
                href="/login"
                className="px-8 py-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full font-semibold text-lg hover:bg-white/20 transition-all duration-300"
              >
                Đăng nhập
              </a>
            </div>
          ) : (
            <a
              href="/feed"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full font-semibold text-lg hover:shadow-2xl hover:shadow-pink-500/50 transition-all duration-300 hover:scale-105"
            >
              Khám phá ngay
              <Heart className="w-5 h-5" />
            </a>
          )}
        </div>

        {/* Live Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {[
            { label: 'Thành viên', value: stats.totalUsers.toLocaleString(), icon: Users, color: 'pink' },
            { label: 'Đang online', value: stats.activeNow.toLocaleString(), icon: Zap, color: 'green' },
            { label: 'Matches hôm nay', value: stats.matchesToday.toLocaleString(), icon: Heart, color: 'red' },
            { label: 'Tin nhắn', value: stats.messagesExchanged.toLocaleString(), icon: MessageCircle, color: 'blue' }
          ].map((stat, i) => (
            <div
              key={i}
              className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300 hover:scale-105"
            >
              <div className="flex items-center justify-between mb-2">
                <stat.icon className={`w-6 h-6 text-${stat.color}-400`} />
                <TrendingUp className="w-4 h-4 text-green-400" />
              </div>
              <div className="text-3xl font-bold mb-1">{stat.value}</div>
              <div className="text-sm text-white/60">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Features Grid */}
        <div className="mb-16">
          <h2 className="text-4xl font-bold text-center mb-12">
            Tại sao chọn chúng tôi?
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <div
                key={i}
                className="group bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 hover:bg-white/15 transition-all duration-300 hover:scale-105 hover:shadow-2xl"
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:rotate-12 transition-transform duration-300`}>
                  <feature.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-white/70 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-4xl font-bold">Sự kiện sắp tới</h2>
            <a href="/events" className="text-pink-400 hover:text-pink-300 flex items-center gap-2">
              Xem tất cả
              <Star className="w-5 h-5" />
            </a>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {upcomingEvents.map((event) => (
              <div
                key={event.id}
                className="group bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl overflow-hidden hover:bg-white/15 transition-all duration-300 hover:scale-105"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm px-3 py-1 rounded-full text-sm flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {event.attendees}
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-xl font-bold mb-3">{event.title}</h3>
                  <div className="space-y-2 text-sm text-white/70">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-pink-400" />
                      {event.date}
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-purple-400" />
                      {event.location}
                    </div>
                  </div>
                  <button className="w-full mt-4 bg-gradient-to-r from-pink-500 to-purple-500 py-2 rounded-lg font-semibold hover:shadow-lg hover:shadow-pink-500/50 transition-all duration-300">
                    Tham gia ngay
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Success Stories */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-12 text-center">
          <div className="flex justify-center mb-6">
            <div className="flex -space-x-4">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 border-4 border-black flex items-center justify-center text-white font-bold"
                >
                  {String.fromCharCode(65 + i)}
                </div>
              ))}
            </div>
          </div>
          <h2 className="text-3xl font-bold mb-4">
            Hơn 10,000+ cặp đôi đã tìm thấy nhau
          </h2>
          <p className="text-white/70 text-lg mb-6 max-w-2xl mx-auto">
            "Chúng tôi gặp nhau qua ứng dụng này và giờ đã đính hôn. Cảm ơn vì đã giúp chúng tôi tìm thấy tình yêu đích thực!" ❤️
          </p>
          <div className="flex justify-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-6 h-6 fill-yellow-400 text-yellow-400" />
            ))}
          </div>
        </div>

        {/* CTA Section */}
        {!user?.id && (
          <div className="mt-16 text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full px-6 py-2 mb-6">
              <Gift className="w-4 h-4 text-pink-400" />
              <span className="text-sm">Đăng ký ngay - Miễn phí mãi mãi</span>
            </div>
            <h2 className="text-4xl font-bold mb-4">
              Sẵn sàng tìm kiếm tình yêu?
            </h2>
            <p className="text-white/70 mb-8 text-lg">
              Hãy tham gia cộng đồng của chúng tôi và bắt đầu hành trình tìm kiếm nửa kia của bạn
            </p>
            <a
              href="/register"
              className="inline-flex items-center gap-2 px-10 py-5 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full font-bold text-xl hover:shadow-2xl hover:shadow-pink-500/50 transition-all duration-300 hover:scale-110"
            >
              Tạo tài khoản miễn phí
              <Heart className="w-6 h-6 animate-pulse" />
            </a>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 mt-20">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-white/60 text-sm">
            <div>© 2025 Dating App. All rights reserved.</div>
            <div className="flex gap-6">
              <a href="/about" className="hover:text-white transition">Về chúng tôi</a>
              <a href="/privacy" className="hover:text-white transition">Chính sách</a>
              <a href="/terms" className="hover:text-white transition">Điều khoản</a>
              <a href="/contact" className="hover:text-white transition">Liên hệ</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}