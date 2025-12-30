import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Trade from "./pages/Trade";
import Landing from "./pages/Landing";
import Login from "./pages/Login";

import { buildSymbolMap } from "./utils/symbolMap";
import { useMarketStore } from "./store/marketStore";

export default function App() {
  const setSymbolMap = useMarketStore((s) => s.setSymbolMap);

  useEffect(() => {
    const initSymbolMap = async () => {
      // 1️⃣ 本地缓存
      try {
        const cached = JSON.parse(
          localStorage.getItem("symbolMap") || "{}"
        );
        if (Object.keys(cached).length > 0) {
          setSymbolMap(cached);
        }
      } catch {}

      // 2️⃣ CoinGecko
      try {
        const res = await fetch(
          "https://api.coingecko.com/api/v3/coins/markets" +
            "?vs_currency=usd" +
            "&order=market_cap_desc" +
            "&per_page=250" +
            "&page=1" +
            "&sparkline=false"
        );

        if (!res.ok) throw new Error("Failed to fetch CoinGecko markets");

        const coins = await res.json();
        const map = buildSymbolMap(coins);

        setSymbolMap(map);
        localStorage.setItem("symbolMap", JSON.stringify(map));

        console.log(
          "[symbolMap] 初始化完成",
          Object.keys(map).length,
          "个币种"
        );
      } catch (err) {
        console.error("[symbolMap] 初始化失败", err);
      }
    };

    initSymbolMap();
  }, [setSymbolMap]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/trade" element={<Trade />} />
      </Routes>
    </BrowserRouter>
  );
}
