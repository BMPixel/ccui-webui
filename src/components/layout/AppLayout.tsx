import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useUIStore } from '@/stores/uiStore';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { cn } from '@/utils/cn';

export const AppLayout = () => {
  const { sidebarOpen, isMobile, setIsMobile, toggleSidebar } = useUIStore();

  // Handle mobile detection
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, [setIsMobile]);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={cn(
          "bg-white border-r border-gray-200 transition-all duration-300 flex-shrink-0",
          isMobile ? "fixed inset-y-0 left-0 z-50 w-80" : "relative w-80",
          isMobile && !sidebarOpen && "-translate-x-full"
        )}
      >
        <Sidebar />
      </aside>

      {/* Mobile overlay backdrop */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={toggleSidebar}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
}; 