import { type ReactNode, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  Rocket,
  LogOut,
  Home,
  Search,
  BookOpen,
  Lightbulb,
  Star,
} from 'lucide-react';
import { getUser, login, logout, type User } from '../lib/auth';
import { getSavedIdeas } from '../lib/ideas';

interface PageLayoutProps {
  children: ReactNode;
  back?: string | 'history';
  actions?: ReactNode;
  width?: 'narrow' | 'medium' | 'wide';
}

const WIDTH_CLASS = {
  narrow: 'max-w-2xl mx-auto px-6',
  medium: 'max-w-3xl mx-auto px-6',
  wide: 'w-[min(90%,1200px)] mx-auto',
} as const;

export default function PageLayout({ children, back, actions, width = 'wide' }: PageLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<User | null>(getUser);
  const [showLogin, setShowLogin] = useState(false);
  const [nameInput, setNameInput] = useState('');

  function handleBack() {
    if (back === 'history') {
      navigate(-1);
    } else if (back) {
      navigate(back);
    }
  }

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!nameInput.trim()) return;
    const u = login(nameInput);
    setUser(u);
    setShowLogin(false);
    setNameInput('');
  }

  function handleLogout() {
    logout();
    setUser(null);
  }

  // ---- Logged out: top nav ----
  if (!user) {
    return (
      <div className="min-h-screen bg-white">
        <nav className="flex items-center gap-3 px-6 py-4 max-w-6xl mx-auto">
          {back ? (
            <button
              onClick={handleBack}
              className="rounded-lg p-2 hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4 text-gray-500" />
            </button>
          ) : null}
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 cursor-pointer"
          >
            <div className="rounded-full bg-gradient-to-br from-orange-400 to-pink-400 p-1.5">
              <Rocket className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="font-bold">Launchable</span>
          </button>
          <div className="ml-auto flex items-center gap-4">
            {actions}
            <button
              onClick={() => setShowLogin(true)}
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
            >
              Login
            </button>
          </div>
        </nav>

        <div className={`${WIDTH_CLASS[width]} pb-12`}>
          {children}
        </div>

        <LoginModal
          open={showLogin}
          onClose={() => setShowLogin(false)}
          nameInput={nameInput}
          setNameInput={setNameInput}
          onSubmit={handleLogin}
        />
      </div>
    );
  }

  // ---- Logged in: sidebar ----
  const ideas = getSavedIdeas();
  const starredCount = ideas.filter((i) => i.starred).length;

  return (
    <div className="min-h-screen bg-white flex">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 border-r border-gray-100 flex flex-col h-screen sticky top-0">
        {/* Logo */}
        <div className="px-5 py-5">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 cursor-pointer"
          >
            <div className="rounded-full bg-gradient-to-br from-orange-400 to-pink-400 p-1.5">
              <Rocket className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="font-bold">Launchable</span>
          </button>
        </div>

        {/* Main nav */}
        <nav className="px-3 space-y-0.5">
          <SidebarLink icon={Home} label="Home" path="/" current={location.pathname} onClick={() => navigate('/')} />
          <SidebarLink icon={Search} label="Search" path="/search" current={location.pathname} onClick={() => navigate('/search')} />
          <SidebarLink icon={BookOpen} label="Resources" path="/resources" current={location.pathname} onClick={() => navigate('/resources')} />
        </nav>

        {/* Ideas section */}
        <div className="mt-6 px-3">
          <p className="px-3 mb-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Ideas</p>
          <nav className="space-y-0.5">
            <SidebarLink
              icon={Lightbulb}
              label="All Ideas"
              path="/ideas"
              current={location.pathname}
              onClick={() => navigate('/ideas')}
              badge={ideas.length > 0 ? ideas.length : undefined}
            />
            <SidebarLink
              icon={Star}
              label="Starred"
              path="/ideas/starred"
              current={location.pathname}
              onClick={() => navigate('/ideas/starred')}
              badge={starredCount > 0 ? starredCount : undefined}
            />
          </nav>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* User footer */}
        <div className="border-t border-gray-100 px-3 py-3">
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-pink-400 flex items-center justify-center shrink-0">
              <span className="text-[11px] font-bold text-white">{user.initials}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
              <p className="text-[10px] text-gray-400">Free plan</p>
            </div>
            <button
              onClick={handleLogout}
              className="shrink-0 rounded-md p-1 hover:bg-gray-100 transition-colors cursor-pointer"
              title="Log out"
            >
              <LogOut className="h-3.5 w-3.5 text-gray-400" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0">
        {/* Contextual top bar (back button + actions) */}
        {back || actions ? (
          <div className="flex items-center gap-3 px-6 py-4">
            {back ? (
              <button
                onClick={handleBack}
                className="rounded-lg p-2 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4 text-gray-500" />
              </button>
            ) : null}
            {actions ? (
              <div className="ml-auto flex items-center gap-4">
                {actions}
              </div>
            ) : null}
          </div>
        ) : null}

        <div className={`${WIDTH_CLASS[width]} pb-12`}>
          {children}
        </div>
      </main>
    </div>
  );
}

// ---- Sidebar link ----

function SidebarLink({
  icon: Icon,
  label,
  path,
  current,
  onClick,
  badge,
}: {
  icon: typeof Home;
  label: string;
  path: string;
  current: string;
  onClick: () => void;
  badge?: number;
}) {
  const isActive = current === path;

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors cursor-pointer ${
        isActive
          ? 'bg-orange-50 text-orange-600 font-medium'
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
      }`}
    >
      <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-orange-500' : 'text-gray-400'}`} />
      <span className="flex-1 text-left">{label}</span>
      {badge !== undefined ? (
        <span className={`text-[10px] font-bold rounded-full px-1.5 py-0.5 min-w-[1.25rem] text-center ${
          isActive ? 'bg-orange-100 text-orange-500' : 'bg-gray-100 text-gray-400'
        }`}>
          {badge}
        </span>
      ) : null}
    </button>
  );
}

// ---- Login modal ----

function LoginModal({
  open,
  onClose,
  nameInput,
  setNameInput,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  nameInput: string;
  setNameInput: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative rounded-2xl bg-white border border-gray-200 p-8 max-w-sm w-full shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 rounded-full bg-gradient-to-br from-orange-100 to-pink-100 flex items-center justify-center">
            <Rocket className="h-6 w-6 text-orange-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Welcome to Launchable</h2>
          <p className="text-sm text-gray-500">Enter your name to get started.</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-3">
          <input
            type="text"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            placeholder="Your name"
            autoFocus
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100"
          />
          <button
            type="submit"
            disabled={!nameInput.trim()}
            className="w-full rounded-xl bg-gradient-to-r from-orange-400 to-pink-400 px-4 py-3 text-sm font-semibold text-white hover:from-orange-500 hover:to-pink-500 transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer shadow-sm"
          >
            Continue
          </button>
        </form>
      </div>
    </div>
  );
}
