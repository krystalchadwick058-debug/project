import { useMarketStore } from "../store/marketStore";

export default function CoinIcon({ symbol, size = 22 }) {
  const rawSymbol = (symbol || "").toUpperCase().trim();

  // ✅ 从 zustand 读取（响应式）
  const symbolMap = useMarketStore((s) => s.symbolMap);

  const src = symbolMap[rawSymbol] || "/coin-placeholder.svg";

  return (
    <img
      src={src}
      alt={rawSymbol}
      width={size}
      height={size}
      loading="lazy"
      style={{
        borderRadius: "50%",
        background: "#2b3139",
        display: "block",
        flexShrink: 0,
      }}
      onError={(e) => {
        const fallback =
          window.location.origin + "/coin-placeholder.svg";
        if (e.currentTarget.src !== fallback) {
          e.currentTarget.src = "/coin-placeholder.svg";
        }
      }}
    />
  );
}
