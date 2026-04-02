import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PaletteMode } from '@mui/material';

type UiState = {
  colorMode: PaletteMode;
  setColorMode: (mode: PaletteMode) => void;
  toggleColorMode: () => void;
  mobileNavOpen: boolean;
  setMobileNavOpen: (open: boolean) => void;
};

export const useUiStore = create<UiState>()(
  persist(
    set => ({
      colorMode: 'light',
      setColorMode: mode => set({ colorMode: mode }),
      toggleColorMode: () =>
        set(state => ({
          colorMode: state.colorMode === 'light' ? 'dark' : 'light',
        })),
      mobileNavOpen: false,
      setMobileNavOpen: open => set({ mobileNavOpen: open }),
    }),
    {
      name: 'medha-admin-ui',
      partialize: state => ({
        colorMode: state.colorMode,
      }),
    }
  )
);
