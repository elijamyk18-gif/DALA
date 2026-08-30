import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useMobile } from './useMobile';
import { useAuth } from '@/contexts/AuthContext';

export function useMobileRedirect() {
  const isMobile = useMobile();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (isMobile && location.pathname === '/' && !user) {
      navigate('/login', { replace: true });
    }
  }, [isMobile, location.pathname, navigate, user, loading]);
}