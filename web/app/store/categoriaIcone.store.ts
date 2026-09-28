// stores/categoriaIcone.store.ts

import { create } from "zustand";
import { persist } from "zustand/middleware";

type CategoriaIconeStore = {
  icones: Record<number, string>;

  definirIcone: (categoriaId: number, icone: string) => void;

  obterIcone: (categoriaId: number) => string | undefined;
};

export const useCategoriaIconeStore = create<CategoriaIconeStore>()(
  persist(
    (set, get) => ({
      icones: {},

      definirIcone: (categoriaId, icone) => {
        set((state) => ({
          icones: {
            ...state.icones,
            [categoriaId]: icone,
          },
        }));
      },

      obterIcone: (categoriaId) => {
        return get().icones[categoriaId];
      },
    }),
    {
      name: "categoria-icones",
    }
  )
);