import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, MessageSquare, Dumbbell, Salad,
  BookOpen, Moon, Brain, Camera, BarChart3, LogOut,
  Users, Shield, Zap, Menu, X, ChevronRight, Flame, CalendarDays, Crown,
} from 'lucide-react';
import { useState } from 'react';
import { usePushNotifications } from '../hooks/usePushNotifications';

const userNavSections = [
  {
    label: 'COACHING',
    items: [
      { to: '/dashboard',       icon: LayoutDashboard, label: 'Dashboard',     color: 'text-primary-400' },
      { to: '/chat',            icon: MessageSquare,   label: 'AI Coach',      color: 'text-purple-400' },
      { to: '/coaches',         icon: Users,           label: 'Find a Coach',  color: 'text-blue-400' },
      { to: '/coach-secretary', icon: Zap,             label: 'AI Secretary',  color: 'text-yellow-400' },
    ],
  },
  {
    label: 'TRAIN & TRACK',
    items: [
      { to: '/training',  icon: Dumbbell, label: 'Training',   color: 'text-orange-400' },
      { to: '/nutrition', icon: Salad,    label: 'Nutrition',  color: 'text-green-400' },
      { to: '/food-log',  icon: BookOpen, label: 'Food Log',   color: 'text-emerald-400' },
      { to: '/sleep',     icon: Moon,     label: 'Sleep',      color: 'text-indigo-400' },
      { to: '/mental',    icon: Brain,    label: 'Wellness',   color: 'text-pink-400' },
    ],
  },
  {
    label: 'COMMUNITY',
    items: [
      { to: '/community',   icon: Flame,        label: 'Community Feed',   color: 'text-orange-400' },
      { to: '/activities',  icon: CalendarDays, label: 'Group Activities', color: 'text-pink-400' },
    ],
  },
  {
    label: 'RESULTS',
    items: [
      { to: '/progress', icon: Camera,    label: 'Progress Photos', color: 'text-cyan-400' },
      { to: '/reports',  icon: BarChart3, label: 'Weekly Reports',  color: 'text-rose-400' },
    ],
  },
  {
    label: 'ACCOUNT',
    items: [
      { to: '/pricing', icon: Crown, label: 'Upgrade Plan', color: 'text-yellow-400' },
    ],
  },
];

const coachNavSections = [
  {
    label: 'COACH',
    items: [
      { to: '/coach-dashboard', icon: LayoutDashboard, label: 'Coach Dashboard', color: 'text-green-400' },
      { to: '/chat',            icon: MessageSquare,   label: 'AI Coach',         color: 'text-purple-400' },
    ],
  },
  {
    label: 'COMMUNITY',
    items: [
      { to: '/community',  icon: Flame,        label: 'Community Feed',   color: 'text-orange-400' },
      { to: '/activities', icon: CalendarDays, label: 'Group Activities', color: 'text-pink-400' },
    ],
  },
];

function FlixCoachLogo({ size = 'md' }) {
  const s = size === 'sm' ? { outer: 'w-8 h-8', icon: 14, sub: 'hidden' }
                          : { outer: 'w-10 h-10', icon: 18, sub: 'block' };
  return (
    <div className="flex items-center gap-3">
      <div className={`${s.outer} rounded-xl bg-gradient-to-br from-orange-500 via-primary-500 to-purple-600 flex items-center justify-center shadow-lg shadow-primary-900/40 flex-shrink-0`}>
        <Zap size={s.icon} className="text-white fill-white" />
      </div>
      <div>
        <p className="font-black text-white tracking-tight leading-none">
          Flix<span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-primary-400">Coach</span>
        </p>
        <p className={`${s.sub} text-xs text-gray-500 leading-none mt-0.5`}>AI Fitness Platform</p>
      </div>
    </div>
  );
}

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  usePushNotifications(user);

  const handleLogout = () => { logout(); navigate('/'); };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/5">
        <FlixCoachLogo />
      </div>

      {/* User card */}
      <div className="mx-3 my-3 p-3 rounded-xl bg-gradient-to-r from-primary-900/40 to-purple-900/20 border border-primary-800/20">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-primary-600 flex items-center justify-center text-sm font-black text-white flex-shrink-0 shadow-md">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-white truncate leading-tight">{user?.name}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                user?.role === 'admin' ? 'bg-yellow-400' :
                user?.role === 'coach' ? 'bg-green-400' : 'bg-primary-400'
              }`} />
              <p className="text-xs text-gray-400 capitalize truncate">{user?.role || 'Member'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Nav sections */}
      <nav className="flex-1 px-3 space-y-4 overflow-y-auto py-2">
        {(user?.role === 'coach' ? coachNavSections : userNavSections).map(({ label, items }) => (
          <div key={label}>
            <p className="text-xs font-bold text-gray-600 tracking-widest px-3 mb-1.5">{label}</p>
            <div className="space-y-0.5">
              {items.map(({ to, icon: Icon, label: itemLabel, color }) => (
                <NavLink key={to} to={to}
                  className={({ isActive }) =>
                    `group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150
                    ${isActive
                      ? 'bg-white/8 text-white border border-white/8 shadow-sm'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'}`
                  }
                  onClick={() => setSidebarOpen(false)}
                >
                  {({ isActive }) => (
                    <>
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all
                        ${isActive ? 'bg-white/10' : 'group-hover:bg-white/5'}`}>
                        <Icon size={15} className={isActive ? color : 'text-gray-500 group-hover:' + color.replace('text-', 'text-')} />
                      </div>
                      <span className="flex-1">{itemLabel}</span>
                      {isActive && <ChevronRight size={13} className="text-gray-500" />}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Admin link */}
      {user?.role === 'admin' && (
        <div className="px-3 pb-2">
          <NavLink to="/admin"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all
              ${isActive ? 'bg-yellow-900/30 text-yellow-300 border border-yellow-800/30' : 'bg-yellow-900/10 text-yellow-400 hover:bg-yellow-900/25 border border-yellow-900/20'}`}
            onClick={() => setSidebarOpen(false)}>
            <div className="w-7 h-7 rounded-lg bg-yellow-900/40 flex items-center justify-center">
              <Shield size={14} className="text-yellow-400" />
            </div>
            Admin Panel
          </NavLink>
        </div>
      )}

      {/* Logout */}
      <div className="p-3 border-t border-white/5">
        <button onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:text-red-400 hover:bg-red-900/10 transition-all group">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center group-hover:bg-red-900/20 transition-all">
            <LogOut size={15} />
          </div>
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-dark-900">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-62 flex-col bg-dark-800/70 border-r border-white/5 flex-shrink-0 backdrop-blur-xl" style={{ width: '248px' }}>
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-64 h-full bg-dark-800 border-r border-white/5 flex flex-col shadow-2xl">
            <button onClick={() => setSidebarOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg bg-dark-700 text-gray-400 hover:text-white z-10">
              <X size={18} />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile topbar */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-dark-800/80 border-b border-white/5 backdrop-blur-xl">
          <button onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-xl bg-dark-700 text-gray-400 hover:text-white transition-colors">
            <Menu size={20} />
          </button>
          <FlixCoachLogo size="sm" />
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-primary-600 flex items-center justify-center text-sm font-black text-white">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
