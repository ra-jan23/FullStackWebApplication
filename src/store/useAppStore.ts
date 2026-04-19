import { create } from 'zustand';

export type Page = 
  | 'home' 
  | 'login' 
  | 'register' 
  | 'dashboard' 
  | 'store' 
  | 'cart' 
  | 'highlights' 
  | 'tickets' 
  | 'analyze' 
  | 'match-center';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AppState {
  currentPage: Page;
  user: User | null;
  token: string | null;
  cartCount: number;
  isLoading: boolean;
  searchQuery: string;

  setCurrentPage: (page: Page) => void;
  login: (user: User, token: string) => void;
  logout: () => void;
  setCartCount: (count: number) => void;
  setLoading: (loading: boolean) => void;
  hydrateAuth: () => void;
  setSearchQuery: (query: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentPage: 'home',
  user: null,
  token: null,
  cartCount: 0,
  isLoading: true,
  searchQuery: '',

  setCurrentPage: (page) => set({ currentPage: page }),
  
  login: (user, token) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('pv_token', token);
      localStorage.setItem('pv_user', JSON.stringify(user));
    }
    set({ user, token, isLoading: false });
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('pv_token');
      localStorage.removeItem('pv_user');
    }
    set({ user: null, token: null, currentPage: 'home' });
  },

  setCartCount: (count) => set({ cartCount: count }),
  setLoading: (loading) => set({ isLoading: loading }),
  setSearchQuery: (query) => set({ searchQuery: query }),

  hydrateAuth: () => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('pv_token');
      const userStr = localStorage.getItem('pv_user');
      if (token && userStr) {
        try {
          const user = JSON.parse(userStr);
          set({ user, token, isLoading: false });
        } catch {
          set({ isLoading: false });
        }
      } else {
        set({ isLoading: false });
      }
    }
  },
}));
