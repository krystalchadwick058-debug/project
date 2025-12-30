import { createContext, useContext, useState, useMemo } from "react";

const TradeContext = createContext(null);

export function TradeProvider({ children }) {
  const [positions, setPositions] = useState([]);

  // 模拟实时价格（你以后可换成 websocket）
  const [markPrice, setMarkPrice] = useState(42120);

  // 下单 = 创建仓位
  function openPosition({
    symbol,
    side,
    price,
    quantity,
    leverage = 20,
    marginType = "逐仓",
  }) {
    setPositions((prev) => [
      ...prev,
      {
        id: Date.now(),
        symbol,
        side,
        leverage,
        marginType,
        quantity,
        entryPrice: price,
        markPrice: price,
      },
    ]);
  }

  // 实时更新盈亏（0 延迟）
  const computedPositions = useMemo(() => {
    return positions.map((p) => {
      const pnl =
        p.side === "LONG"
          ? (markPrice - p.entryPrice) * p.quantity
          : (p.entryPrice - markPrice) * p.quantity;

      return {
        ...p,
        markPrice,
        pnl,
        pnlRate: (pnl / (p.entryPrice * p.quantity)) * 100,
        liquidationPrice:
          p.side === "LONG"
            ? p.entryPrice * 0.95
            : p.entryPrice * 1.05,
      };
    });
  }, [positions, markPrice]);

  return (
    <TradeContext.Provider
      value={{
        openPosition,
        positions: computedPositions,
        markPrice,
        setMarkPrice,
      }}
    >
      {children}
    </TradeContext.Provider>
  );
}

export function useTrade() {
  return useContext(TradeContext);
}
