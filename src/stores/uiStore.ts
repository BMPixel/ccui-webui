import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PermissionRequest } from '@/types';

interface UIStore {
  // Sidebar state
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;

  // Theme
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
  toggleDarkMode: () => void;

  // Permission dialog
  permissionDialogOpen: boolean;
  currentPermissionRequest: PermissionRequest | null;
  setPermissionDialog: (open: boolean, request?: PermissionRequest) => void;

  // New conversation modal
  newConversationModalOpen: boolean;
  setNewConversationModalOpen: (open: boolean) => void;

  // JSON viewer state
  jsonViewerExpanded: Record<string, boolean>;
  toggleJsonViewer: (messageId: string) => void;

  // Mobile responsiveness
  isMobile: boolean;
  setIsMobile: (mobile: boolean) => void;

  // Loading states
  loadingStates: Record<string, boolean>;
  setLoading: (key: string, loading: boolean) => void;

  // Toast notifications
  toasts: Array<{
    id: string;
    title: string;
    description?: string;
    type: 'success' | 'error' | 'warning' | 'info';
    duration?: number;
  }>;
  addToast: (toast: Omit<UIStore['toasts'][0], 'id'>) => void;
  removeToast: (id: string) => void;
}

export const useUIStore = create<UIStore>()(
  persist(
    (set, get) => ({
      // Sidebar
      sidebarOpen: true,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

      // Theme
      darkMode: false,
      setDarkMode: (dark) => {
        set({ darkMode: dark });
        // Apply dark mode class to document
        if (typeof document !== 'undefined') {
          if (dark) {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        }
      },
      toggleDarkMode: () => {
        const newDarkMode = !get().darkMode;
        get().setDarkMode(newDarkMode);
      },

      // Permission dialog
      permissionDialogOpen: false,
      currentPermissionRequest: null,
      setPermissionDialog: (open, request) => set({
        permissionDialogOpen: open,
        currentPermissionRequest: request || null
      }),

      // New conversation modal
      newConversationModalOpen: false,
      setNewConversationModalOpen: (open) => set({ newConversationModalOpen: open }),

      // JSON viewer
      jsonViewerExpanded: {},
      toggleJsonViewer: (messageId) => set((state) => ({
        jsonViewerExpanded: {
          ...state.jsonViewerExpanded,
          [messageId]: !state.jsonViewerExpanded[messageId]
        }
      })),

      // Mobile
      isMobile: false,
      setIsMobile: (mobile) => set({ isMobile: mobile }),

      // Loading states
      loadingStates: {},
      setLoading: (key, loading) => set((state) => ({
        loadingStates: {
          ...state.loadingStates,
          [key]: loading
        }
      })),

      // Toasts
      toasts: [],
      addToast: (toast) => {
        const id = Math.random().toString(36).substr(2, 9);
        set((state) => ({
          toasts: [...state.toasts, { ...toast, id }]
        }));
        
        // Auto-remove toast after duration
        setTimeout(() => {
          get().removeToast(id);
        }, toast.duration || 5000);
      },
      removeToast: (id) => set((state) => ({
        toasts: state.toasts.filter(toast => toast.id !== id)
      })),
    }),
    {
      name: 'ccui-ui-store',
      partialize: (state) => ({
        sidebarOpen: state.sidebarOpen,
        darkMode: state.darkMode,
      }),
    }
  )
); 