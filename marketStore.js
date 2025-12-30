import { create } from "zustand";

export const useMarketStore = create((set) => ({
  symbol: "BTCUSDT",
  favorites: new Set(),

  // ✅ 新增：symbolMap（响应式）
  symbolMap: {},

  setSymbol: (symbol) => set({ symbol }),

  setSymbolMap: (symbolMap) => set({ symbolMap }),

  toggleFavorite: (symbol) =>
    set((state) => {
      const next = new Set(state.favorites);
      if (next.has(symbol)) {
        next.delete(symbol);
      } else {
        next.add(symbol);
      }
      return { favorites: next };
    }),
}));
