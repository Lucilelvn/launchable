import { type ReactNode, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Rocket, LogOut } from 'lucide-react';
import { getUser, login, logout, type User } from '../lib/auth';

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
  const [user, setUser] = useState<User | null>(getUser);
  const [showLogin, setShowLogin] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
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
    setShowMenu(false);
  }

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

          {/* Auth */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="flex items-center gap-2 cursor-pointer rounded-lg px-2 py-1 hover:bg-gray-100 transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-400 to-pink-400 flex items-center justify-center">
                  <span className="text-[10px] font-bold text-white">{user.initials}</span>
                </div>
                <span className="text-sm font-medium text-gray-700 hidden sm:block">{user.name}</span>
              </button>

              {showMenu ? (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                  <div className="absolute right-0 top-full mt-1 z-50 w-48 rounded-xl border border-gray-200 bg-white shadow-lg p-1">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      Log out
                    </button>
                  </div>
                </>
              ) : null}
            </div>
          ) : (
            <button
              onClick={() => setShowLogin(true)}
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
            >
              Login
            </button>
          )}
        </div>
      </nav>

      <div className={`${WIDTH_CLASS[width]} pb-12`}>
        {children}
      </div>

      {/* Login modal */}
      {showLogin ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowLogin(false)} />
          <div className="relative rounded-2xl bg-white border border-gray-200 p-8 max-w-sm w-full shadow-xl space-y-6">
            <div className="text-center space-y-2">
              <div className="mx-auto w-12 h-12 rounded-full bg-gradient-to-br from-orange-100 to-pink-100 flex items-center justify-center">
                <Rocket className="h-6 w-6 text-orange-500" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Welcome to Launchable</h2>
              <p className="text-sm text-gray-500">Enter your name to get started.</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-3">
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
      ) : null}
    </div>
  );
}
