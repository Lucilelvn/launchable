import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import ExplorePage from './pages/ExplorePage';
import AssessPage from './pages/AssessPage';
import ResultPage from './pages/ResultPage';
import RefinePage from './pages/RefinePage';
import IdeasPage from './pages/IdeasPage';
import SearchPage from './pages/SearchPage';
import ResourcesPage from './pages/ResourcesPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/explore" element={<ExplorePage />} />
        <Route path="/assess" element={<AssessPage />} />
        <Route path="/refine" element={<RefinePage />} />
        <Route path="/result" element={<ResultPage />} />
        <Route path="/ideas" element={<IdeasPage />} />
        <Route path="/ideas/starred" element={<IdeasPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/resources" element={<ResourcesPage />} />
      </Routes>
    </BrowserRouter>
  );
}
