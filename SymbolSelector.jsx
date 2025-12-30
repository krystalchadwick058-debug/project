import { useState } from "react";
import { useMarketStore } from "../store/marketStore";

const SYMBOLS = ["BTCUSDT", "ETHUSDT", "BNBUSDT", "SOLUSDT"];

export default function SymbolSelector() {
  const { symbol, setSymbol } = useMarketStore();
  const [open, setOpen] = useState(false);

  return (
    <div
      style={{ position: "relative" }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      {/* 当前交易对 */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          cursor: "pointer",
          fontWeight: 600,
          fontSize: 16,
        }}
      >
        {symbol}
        <span style={{ marginLeft: 6, fontSize: 12 }}>▼</span>
      </div>

      {/* 下拉列表 */}
      {open && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            marginTop: 6,
            background: "#1e2329",
            border: "1px solid #2b3139",
            borderRadius: 6,
            zIndex: 1000,
            minWidth: 120,
          }}
        >
          {SYMBOLS.map((s) => (
            <div
              key={s}
              onClick={() => {
                setSymbol(s);
                setOpen(false);
              }}
              style={{
                padding: "8px 12px",
                cursor: "pointer",
                color: s === symbol ? "#f0b90b" : "#eaecef",
                background:
                  s === symbol ? "rgba(240,185,11,0.1)" : "transparent",
              }}
            >
              {s}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
