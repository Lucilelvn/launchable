import { useNavigate } from 'react-router-dom';
import PageLayout from '../components/PageLayout';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <PageLayout
      width="medium"
      actions={
        <button
          onClick={() => navigate('/assess')}
          className="text-sm font-medium bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors cursor-pointer"
        >
          Get Started
        </button>
      }
    >
      {/* Hero */}
      <div className="pt-20 pb-16 text-center">
        <h1 className="text-5xl sm:text-6xl font-bold tracking-tight leading-tight">
          Go from feeling to{' '}
          <br className="hidden sm:block" />
          something{' '}
          <span className="bg-gradient-to-r from-orange-400 via-pink-400 to-pink-300 bg-clip-text text-transparent">
            launchable
          </span>
        </h1>

        <p className="mt-6 text-lg text-gray-500 max-w-xl mx-auto leading-relaxed">
          You saw the demo. You want in. Launchable turns what's in your
          head into a prompt you can paste into any AI build tool in minutes.
        </p>

        {/* Cards */}
        <div className="grid gap-6 sm:grid-cols-2 mt-14 max-w-4xl mx-auto items-stretch">
          <button
            onClick={() => navigate('/assess')}
            className="group rounded-2xl border border-gray-200 bg-white p-8 text-center hover:border-orange-300 hover:shadow-lg hover:shadow-orange-100/50 transition-all cursor-pointer"
          >
            <h2 className="text-xl font-bold">You have an idea</h2>
            <p className="mt-3 text-sm text-gray-500 leading-relaxed">
              Drop in your concept. Get an honest score, 3 smarter mutations,
              and a build-ready prompt.
            </p>
            <span className="inline-block mt-5 text-sm font-semibold rounded-full px-5 py-2 transition-all border border-orange-200 bg-gradient-to-r from-orange-400 to-pink-400 bg-clip-text text-transparent group-hover:text-white group-hover:bg-clip-padding group-hover:border-transparent group-hover:shadow-md group-hover:shadow-orange-200/50">
              Assess your idea
            </span>
          </button>

          <button
            onClick={() => navigate('/explore')}
            className="group rounded-2xl border border-gray-200 bg-white p-8 text-center hover:border-pink-300 hover:shadow-lg hover:shadow-pink-100/50 transition-all cursor-pointer"
          >
            <h2 className="text-xl font-bold">You don't know where to start</h2>
            <p className="mt-3 text-sm text-gray-500 leading-relaxed">
              A few smart questions about your life, work, and frustrations
              and we'll surface something worth building.
            </p>
            <span className="inline-block mt-5 text-sm font-semibold rounded-full px-5 py-2 transition-all border border-pink-200 bg-gradient-to-r from-pink-400 to-orange-400 bg-clip-text text-transparent group-hover:text-white group-hover:bg-clip-padding group-hover:border-transparent group-hover:shadow-md group-hover:shadow-pink-200/50">
              Let's find your idea
            </span>
          </button>
        </div>
      </div>
    </PageLayout>
  );
}
