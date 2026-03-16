import { type ReactNode } from 'react';
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
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useAuth } from '../hooks/useAuth';

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
  const { user, isLoading, signIn, signOut } = useAuth();
  const allIdeas = useQuery(api.ideas.list);
  const starredIdeas = useQuery(api.ideas.listStarred);
  const ideasCount = allIdeas?.length ?? 0;
  const starredCount = starredIdeas?.length ?? 0;

  function handleBack() {
    if (back === 'history') {
      navigate(-1);
    } else if (back) {
      navigate(back);
    }
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
            {isLoading ? null : (
              <button
                onClick={signIn}
                className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
              >
                Sign in
              </button>
            )}
          </div>
        </nav>

        <div className={`${WIDTH_CLASS[width]} pb-12`}>
          {children}
        </div>
      </div>
    );
  }

  // ---- Logged in: sidebar ----
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
              badge={ideasCount > 0 ? ideasCount : undefined}
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
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="w-8 h-8 rounded-full shrink-0"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-pink-400 flex items-center justify-center shrink-0">
                <span className="text-[11px] font-bold text-white">{user.initials}</span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
              <p className="text-[10px] text-gray-400">Free plan</p>
            </div>
            <button
              onClick={signOut}
              className="shrink-0 rounded-md p-1 hover:bg-gray-100 transition-colors cursor-pointer"
              title="Sign out"
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

        <div className="p-8">
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
