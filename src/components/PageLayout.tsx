import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Rocket } from 'lucide-react';

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

  function handleBack() {
    if (back === 'history') {
      navigate(-1);
    } else if (back) {
      navigate(back);
    }
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
        {actions ? (
          <div className="ml-auto flex items-center gap-4">
            {actions}
          </div>
        ) : null}
      </nav>

      <div className={`${WIDTH_CLASS[width]} pb-12`}>
        {children}
      </div>
    </div>
  );
}
