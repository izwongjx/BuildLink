import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Old onboarding route replaced by in-app project creation wizard.
export default function HomeownerOnboarding() {
  const navigate = useNavigate();
  useEffect(() => { navigate('/dashboard/homeowner', { replace: true }); }, [navigate]);
  return null;
}
