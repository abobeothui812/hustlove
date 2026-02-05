import { Routes, Route, useNavigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Landing from "./pages/Landing";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import CompleteProfile from "./pages/CompleteProfile";
import PhotoManagement from "./pages/PhotoManagement";
import OpeningMoveOnboarding from "./pages/OpeningMoveOnboarding";
import Messenger from "./pages/Messenger";
import LibraryInvite from './pages/LibraryInvite';
import Community from "./pages/Community";
import Chat from "./pages/Chat";
import YourCrush from './pages/YourCrush';
import { io } from "socket.io-client";
import { useState, useEffect, useCallback } from "react";
import { SocketContext } from "./contexts";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import ProtectedRoute, { PublicRoute } from "./components/ProtectedRoute";
import axios from "./utils/axiosConfig";

const BlankPage = () => <div className="min-h-screen bg-white pt-24" />;

/**
 * AppContent - Contains all app logic that needs auth context
 */
function AppContent() {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const API_URL = import.meta.env.VITE_API_URL;

  // Listen for session expiration from axios interceptor
  useEffect(() => {
    const handleSessionExpired = () => {
      logout();
      setSocket(null);
      navigate('/login');
    };

    window.addEventListener('sessionExpired', handleSessionExpired);
    return () => window.removeEventListener('sessionExpired', handleSessionExpired);
  }, [navigate, logout]);

  // Socket connection management
  useEffect(() => {
    if (!user?.id) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    const newSocket = io(API_URL, { withCredentials: true });

    newSocket.on("connect", () => {
      newSocket.emit("set_user", { userId: user.id });
      // Also emit server-expected auth/join events
      try { newSocket.emit('user:join', user.id); } catch {}
      try { newSocket.emit('auth_user', { userId: user.id }); } catch {}
      try { newSocket.emit('auth_notification', { userId: user.id }); } catch {}
      try { newSocket.emit('join_conversations', user.id); } catch {}
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user?.id, API_URL]);

  // Fetch notifications on app load
  useEffect(() => {
    if (!user?.id || !API_URL) return;

    const fetchNotifications = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/notifications?userId=${user.id}&limit=20`);
        if (res.data.success) {
          setNotifications(res.data.data);
          const unread = res.data.data.filter(n => !n.isRead).length;
          setUnreadCount(unread);
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    fetchNotifications();
  }, [user?.id, API_URL]);

  // Listen to socket notifications
  useEffect(() => {
    if (!socket) return;
    
    const handleMutualNavigate = ({ conversationId, matchId }) => {
      try {
        const id = matchId || conversationId;
        if (id) navigate(`/messenger/${encodeURIComponent(String(id))}`);
        else navigate('/messenger');
      } catch (e) {
        console.error('Failed to navigate to messenger on mutual_match', e);
      }
    };
    socket.on('mutual_match', handleMutualNavigate);

    const handleNewNotification = ({ notification }) => {
      setNotifications(prev => [notification, ...prev]);
      if (!notification.isRead) {
        setUnreadCount(prev => prev + 1);
      }
    };
    socket.on("new_notification", handleNewNotification);

    const handleNewMessageForNotif = (payload) => {
      try {
        const message = payload?.message || payload;
        if (!message) return;

        // Ignore messages sent by ourselves
        if (user?.id && (String(message.senderId) === String(user.id))) {
          return;
        }

        const senderName = message.senderName || message.sender?.name || message.fromName || message.from?.name || 'Ai đó';
        const preview = (message.content || '').slice(0, 120);

        const notif = {
          _id: `m-${Date.now()}`,
          type: 'message',
          content: `${senderName}: ${preview}`,
          createdAt: new Date().toISOString(),
          isRead: false,
          meta: {
            conversationId: payload.conversationId || message.conversationId || message.chatRoomId
          }
        };

        setNotifications(prev => [notif, ...prev]);
        setUnreadCount(prev => prev + 1);
      } catch (e) {
        console.error('Error handling new_message for notif', e);
      }
    };
    socket.on('new_message', handleNewMessageForNotif);

    return () => {
      socket.off("new_notification", handleNewNotification);
      socket.off('new_message', handleNewMessageForNotif);
      socket.off('mutual_match', handleMutualNavigate);
    };
  }, [socket, user?.id, navigate]);

  return (
    <SocketContext.Provider value={{ socket, notifications, unreadCount, setNotifications, setUnreadCount }}>
      <Navbar socket={socket} unreadCount={unreadCount} />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        
        {/* Protected routes - require authentication */}
        <Route path="/feed" element={<ProtectedRoute requireProfile><Home /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/profile/manage-photos" element={<ProtectedRoute><PhotoManagement /></ProtectedRoute>} />
        <Route path="/chat" element={<ProtectedRoute requireProfile><Chat /></ProtectedRoute>} />
        <Route path="/messenger" element={<ProtectedRoute requireProfile><Messenger /></ProtectedRoute>} />
        <Route path="/messenger/:id" element={<ProtectedRoute requireProfile><Messenger /></ProtectedRoute>} />
        <Route path="/library-invite" element={<ProtectedRoute requireProfile><LibraryInvite /></ProtectedRoute>} />
        <Route path="/your-crush" element={<ProtectedRoute requireProfile><YourCrush /></ProtectedRoute>} />
        <Route path="/community" element={<ProtectedRoute requireProfile><Community /></ProtectedRoute>} />
        
        {/* Onboarding routes - require auth but not complete profile */}
        <Route path="/complete-profile" element={<ProtectedRoute><CompleteProfile /></ProtectedRoute>} />
        <Route path="/onboarding/photo-upload" element={<ProtectedRoute><PhotoManagement /></ProtectedRoute>} />
        <Route path="/onboarding/opening-move" element={<ProtectedRoute><OpeningMoveOnboarding onComplete={() => { window.location.href = '/feed'; }} /></ProtectedRoute>} />
        
        {/* Fallback */}
        <Route path="/home" element={<BlankPage />} />
      </Routes>
    </SocketContext.Provider>
  );
}

/**
 * App - Root component wrapped with AuthProvider
 */
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;