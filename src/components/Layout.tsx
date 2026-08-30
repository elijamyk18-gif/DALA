import { ReactNode } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { FloatingChatButton } from './FloatingChatButton';
import { MobileTabBar } from './MobileTabBar';
import { MobileHeader } from './MobileHeader';

interface LayoutProps {
  children?: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 overflow-x-hidden">
      <Navbar />
      <MobileHeader />
      <main className="flex-grow w-full max-w-[100vw] pb-16 md:pb-0">
        {children || <Outlet />}
      </main>
      <Footer />
      <MobileTabBar />
      <FloatingChatButton />
    </div>
  );
}