import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import HomeownerOnboarding from './pages/onboarding/HomeownerOnboarding';
import ContractorOnboarding from './pages/onboarding/ContractorOnboarding';
import SupplierOnboarding from './pages/onboarding/SupplierOnboarding';
import HomeownerDashboard from './pages/dashboard/HomeownerDashboard';
import HomeownerProject from './pages/dashboard/HomeownerProject';
import ContractorDashboard from './pages/dashboard/ContractorDashboard';
import SupplierDashboard from './pages/dashboard/SupplierDashboard';
import ProfileDetail from './pages/ProfileDetail';
import MyProjects from './pages/MyProjects';
import SavedMatches from './pages/SavedMatches';
import Messages from './pages/Messages';
import ProjectRoom from './pages/ProjectRoom';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={<Auth />} />

        {/* Onboarding */}
        <Route path="/onboarding/homeowner" element={<HomeownerOnboarding />} />
        <Route path="/onboarding/contractor" element={<ContractorOnboarding />} />
        <Route path="/onboarding/supplier" element={<SupplierOnboarding />} />

        {/* Dashboards */}
        <Route path="/dashboard/homeowner" element={<HomeownerDashboard />} />
        <Route path="/dashboard/homeowner/:projectId" element={<HomeownerProject />} />
        <Route path="/dashboard/contractor" element={<ContractorDashboard />} />
        <Route path="/dashboard/supplier" element={<SupplierDashboard />} />

        {/* Sub-pages */}
        <Route path="/projects" element={<MyProjects />} />
        <Route path="/project/:id/room" element={<ProjectRoom />} />
        <Route path="/saved" element={<SavedMatches />} />
        <Route path="/messages" element={<Messages />} />

        {/* Profiles */}
        <Route path="/profile/:type/:id" element={<ProfileDetail />} />
      </Routes>
    </Router>
  );
}

export default App;
