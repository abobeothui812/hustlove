import { useState, useEffect, useContext, useCallback } from 'react';
import { SocketContext } from '../contexts';
import { Users, Zap, Heart, MessageCircle, MapPin, Sparkles, TrendingUp, Clock } from "lucide-react";

export default function Feed() {
  const [activeFeed, setActiveFeed] = useState('OnlineUsers');
  const newSocket = useContext(SocketContext);
  const API_URL = import.meta.env.VITE_API_URL;

  const [stats, setStats] = useState({
    OnlineUsers: 0,
    newPosts: 0,
    matchesToday: 0,
    messagesExchanged: 0,
  });

  const [feedData, setFeedData] = useState({
    OnlineUsers: [],
    newPosts: [],
    matchesToday: [],
    messagesExchanged: [],
  });

  // ✅ Socket connection và listen online users count
useEffect(() => {
  if (!newSocket) return;

  const handleOnlineUsersCount = (count) => {
    console.log("👥 Online users:", count);
    setStats(prev => ({ ...prev, OnlineUsers: count }));
  };

  newSocket.on("online_users_count", handleOnlineUsersCount);

  return () => {
    newSocket.off("online_users_count", handleOnlineUsersCount);
  };
}, [newSocket]);

// ✅ Fetch initial data
useEffect(() => {
  fetchStats();
  fetchFeedData(activeFeed);
}, [activeFeed, fetchFeedData, fetchStats]);

const fetchStats = useCallback(async () => {
  try {
    const response = await fetch(`${API_URL}/api/stats`);
    const data = await response.json();
    setStats(prev => ({
      ...prev,
      newPosts: data.newPosts || 0,
      matchesToday: data.matchesToday || 0,
      messagesExchanged: data.messagesExchanged || 0,
    }));
  } catch (error) {
    console.error("❌ Error fetching stats:", error);
  }
}, [API_URL]);

const fetchFeedData = useCallback(async (feedType) => {
  try {
    let endpoint = '';
    switch(feedType) {
      case 'OnlineUsers':
        endpoint = '/api/users/online';
        break;
      case 'newPosts':
        endpoint = '/api/posts/recent';
        break;
      case 'matchesToday':
        endpoint = '/api/matches/today';
        break;
      case 'messagesExchanged':
        endpoint = '/api/messages/recent';
        break;
    }
    
    const response = await fetch(`${API_URL}${endpoint}`);
    const data = await response.json();
    setFeedData(prev => ({ ...prev, [feedType]: data }));
  } catch (error) {
    console.error(`❌ Error fetching ${feedType}:`, error);
  }
}, [API_URL]);

  const statItems = [
    { label: 'Online Users', value: stats.OnlineUsers.toLocaleString(), icon: Users, gradient: 'from-pink-500 to-rose-500', feedKey: 'OnlineUsers' },
    { label: 'New Posts', value: stats.newPosts.toLocaleString(), icon: Zap, gradient: 'from-green-500 to-emerald-500', feedKey: 'newPosts' },
    { label: 'Matches Today', value: stats.matchesToday.toLocaleString(), icon: Heart, gradient: 'from-red-500 to-pink-500', feedKey: 'matchesToday' },
    { label: 'Messages', value: stats.messagesExchanged.toLocaleString(), icon: MessageCircle, gradient: 'from-blue-500 to-cyan-500', feedKey: 'messagesExchanged' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{animationDelay: '4s'}}></div>
      </div>

      <div className="relative z-10 p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent mb-2">
            Live Activity Feed
          </h1>
          <p className="text-white/60 text-lg">Real-time connections happening now</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {statItems.map((stat) => (
            <div
              key={stat.label}
              onClick={() => setActiveFeed(stat.feedKey)}
              className={`relative group cursor-pointer transition-all duration-300 hover:scale-105 ${
                activeFeed === stat.feedKey ? 'scale-105' : ''
              }`}
            >
              <div className={`absolute inset-0 bg-gradient-to-r ${stat.gradient} rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity`}></div>
              <div className="relative bg-slate-800/90 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all">
                <stat.icon className="w-12 h-12 text-white mb-3" />
                <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-sm text-white/60">{stat.label}</div>
                {activeFeed === stat.feedKey && (
                  <div className="absolute top-2 right-2">
                    <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Active Feed Content */}
        <div className="space-y-6">
          {/* Online Users Feed */}
          {activeFeed === 'OnlineUsers' && feedData.OnlineUsers.map((user) => (
            <div
              key={user.id}
              className="group bg-slate-800/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 hover:border-purple-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/20"
            >
              <div className="flex flex-col md:flex-row gap-6">
                {/* Avatar Section */}
                <div className="flex flex-col items-center md:items-start space-y-3">
                  <div className="relative">
                    <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-pink-500 via-purple-500 to-blue-500 flex items-center justify-center text-white text-4xl font-bold shadow-xl">
                      {user.image}
                    </div>
                    {user.online && (
                      <div className="absolute -bottom-2 -right-2 bg-green-500 border-4 border-slate-800 rounded-full w-8 h-8 flex items-center justify-center">
                        <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                      </div>
                    )}
                  </div>
                  <div className="text-center md:text-left">
                    <h3 className="text-2xl font-bold text-white">{user.name}</h3>
                    <p className="text-purple-300 text-sm">{user.age} years old</p>
                    <div className="flex items-center gap-1 text-white/60 text-sm mt-1 justify-center md:justify-start">
                      <MapPin className="w-4 h-4" />
                      <span>{user.location}</span>
                    </div>
                  </div>
                </div>

                {/* Info Section */}
                <div className="flex-1 flex flex-col justify-center space-y-4">
                  <div className="bg-slate-900/50 rounded-2xl p-4 border border-white/5">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-5 h-5 text-purple-400" />
                      <span className="text-white/80 font-semibold">About</span>
                    </div>
                    <div className="overflow-hidden">
                      <div className="flex animate-marquee">
                        <span className="text-white/70 mr-20">{user.bio}</span>
                        <span className="text-white/70 mr-20">{user.bio}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-pink-500/50 flex items-center justify-center gap-2">
                      <Heart className="w-5 h-5" />
                      Connect
                    </button>
                    <button className="flex-1 bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 border border-white/20 hover:border-white/30 flex items-center justify-center gap-2">
                      <MessageCircle className="w-5 h-5" />
                      Chat
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* New Posts Feed */}
          {activeFeed === 'newPosts' && feedData.newPosts.map((post) => (
            <div
              key={post.id}
              className="bg-slate-800/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 hover:border-green-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-green-500/20"
            >
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white text-2xl font-bold">
                  {post.author[0]}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-bold text-white">{post.title}</h3>
                    <div className="flex items-center gap-2 text-white/60 text-sm">
                      <Clock className="w-4 h-4" />
                      {post.time}
                    </div>
                  </div>
                  <p className="text-white/70 mb-3">by {post.author}</p>
                  <div className="flex items-center gap-2 text-pink-400">
                    <Heart className="w-5 h-5 fill-current" />
                    <span className="font-semibold">{post.likes} likes</span>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Matches Today Feed */}
          {activeFeed === 'matchesToday' && feedData.matchesToday.map((match) => (
            <div
              key={match.id}
              className="bg-slate-800/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 hover:border-red-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-red-500/20"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Heart className="w-16 h-16 text-red-500 fill-current animate-pulse" />
                    <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-yellow-400" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-1">{match.match}</h3>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-white/60 text-sm">
                        <Clock className="w-4 h-4" />
                        {match.time}
                      </div>
                      <div className="px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-full text-green-400 text-sm font-semibold">
                        {match.compatibility} Match
                      </div>
                    </div>
                  </div>
                </div>
                <TrendingUp className="w-8 h-8 text-green-400" />
              </div>
            </div>
          ))}

          {/* Messages Feed */}
          {activeFeed === 'messagesExchanged' && feedData.messagesExchanged.map((message) => (
            <div
              key={message.id}
              className="bg-slate-800/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 hover:border-blue-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/20"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-xl font-bold">
                  {message.from[0]}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="text-white font-semibold">{message.from}</span>
                      <span className="text-white/40 mx-2">→</span>
                      <span className="text-white/70">{message.to}</span>
                    </div>
                    <div className="flex items-center gap-1 text-white/60 text-sm">
                      <Clock className="w-4 h-4" />
                      {message.time}
                    </div>
                  </div>
                  <div className="bg-slate-900/50 rounded-xl p-4 border border-white/5">
                    <p className="text-white/90">{message.content}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Marquee Animation */}
     <style>
      {`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 20s linear infinite;
        }
      `}
      </style>

    </div>
  );
}