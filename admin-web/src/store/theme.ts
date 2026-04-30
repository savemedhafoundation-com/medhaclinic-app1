import { create } from 'zustand';

type ThemeStore = {
  mode: 'light' | 'dark';
  toggle: () => void;
};

export const useThemeStore = create<ThemeStore>(set => ({
  mode: (localStorage.getItem('medha-admin-theme') as 'light' | 'dark' | null) ?? 'light',
  toggle: () =>
    set(state => {
      const next = state.mode === 'dark' ? 'light' : 'dark';
      localStorage.setItem('medha-admin-theme', next);
      return { mode: next };
    }),
}));
