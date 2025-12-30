import { useState } from "react";
import SymbolList from "./SymbolList";
import KLineChart from "./KLineChart";
import MarketInfo from "./MarketInfo";

export default function MarketLayout() {
  const [open, setOpen] = useState(false);

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        overflow: "hidden",
        background: "#0b0e11",
      }}
    >
      {/* 左侧交易对列表 */}
      <div
        style={{
          width: open ? 320 : 0,
          transition: "width .2s",
          overflow: "hidden",
          background: "#0b0e11",
          flexShrink: 0,
          borderRight: "1px solid #1e2329",
        }}
      >
        <SymbolList onSelect={() => setOpen(false)} />
      </div>

      {/* 右侧主区域 */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* 顶部行情信息栏（图片最上面那一条） */}
        <MarketInfo onToggleSymbolList={() => setOpen(v => !v)} />

        {/* K线区域 */}
        <div style={{ flex: 1 }}>
          <KLineChart />
        </div>
      </div>
    </div>
  );
}
