import { useState } from "react";
import { useMarketStore } from "../store/marketStore";
import CoinIcon from "./CoinIcon";
import SymbolList from "./SymbolList";

export default function SymbolTrigger() {
  const { symbol } = useMarketStore();
  const [open, setOpen] = useState(false);

  const base = symbol.replace("USDT", "");

  return (
    <div
      style={{ position: "relative" }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      {/* ===== 左上角：交易对（唯一） ===== */}
      <div
        style={{
          height: 48,
          display: "flex",
          alignItems: "center",
          padding: "0 12px",
          background: "#0b0e11",
          borderBottom: "1px solid #1e2329",
          cursor: "pointer",
          width: "fit-content",
        }}
      >
        <CoinIcon symbol={base} />
        <span style={{ marginLeft: 8, fontWeight: 600 }}>
          {base}/USDT
        </span>
        <span style={{ marginLeft: 6, fontSize: 12, color: "#848e9c" }}>
          永续
        </span>
      </div>

      {/* ===== hover 下拉交易对（Binance 风格） ===== */}
      {open && (
        <div
          style={{
            position: "absolute",
            top: 48,
            left: 0,
            width: 380,               // ✅ 只覆盖左侧
            background: "#0b0e11",
            border: "1px solid #1e2329",
            zIndex: 100,
            boxShadow: "0 8px 24px rgba(0,0,0,.4)",
          }}
        >
          {/* ❗不限制高度，不制造外层滚动条 */}
          <SymbolList onSelect={() => setOpen(false)} />
        </div>
      )}
    </div>
  );
}
