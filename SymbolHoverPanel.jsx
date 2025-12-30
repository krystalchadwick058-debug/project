import { useState } from "react";
import { useMarketStore } from "../store/marketStore";
import CoinIcon from "./CoinIcon";
import SymbolList from "./SymbolList";

export default function SymbolHoverPanel() {
  const [open, setOpen] = useState(false);
  const { symbol } = useMarketStore();

  if (!symbol) return null;

  const base = symbol.replace("USDT", "");

  return (
    <div
      style={{
        position: "relative",
        zIndex: 30,
        width: "100%",
      }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      {/* ===== 顶部币种信息条（默认显示） ===== */}
      <div
        style={{
          height: 56,
          display: "flex",
          alignItems: "center",
          padding: "0 16px",
          background: "#0b0e11",
          borderBottom: "1px solid #1e2329",
          cursor: "pointer",
        }}
      >
        <CoinIcon symbol={base} />
        <div style={{ marginLeft: 10 }}>
          <div style={{ fontWeight: 600, fontSize: 14 }}>
            {base}
            <span style={{ color: "#848e9c" }}>/USDT 永续</span>
          </div>
          <div style={{ fontSize: 12, color: "#848e9c" }}>
            模拟交易
          </div>
        </div>
      </div>

      {/* ===== hover 悬浮交易对列表 ===== */}
      {open && (
        <div
          style={{
            position: "absolute",
            top: 56,
            right: 0,
            width: 920,
            height: 620,
            background: "#0b0e11",
            border: "1px solid #1e2329",
            boxShadow: "0 12px 32px rgba(0,0,0,.45)",
          }}
        >
          <SymbolList onSelect={() => setOpen(false)} />
        </div>
      )}
    </div>
  );
}
