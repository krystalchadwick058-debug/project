import { useEffect, useMemo, useRef, useState } from "react";
import { FixedSizeList as List } from "react-window";
import {
  getAll24hTickers,
  getFundingRates,
  connectFutureTickers,
} from "../adapters/binanceAdapter";
import { useMarketStore } from "../store/marketStore";
import CoinIcon from "./CoinIcon";

export default function SymbolList({ onSelect }) {
  const [tickers, setTickers] = useState([]);
  const [funding, setFunding] = useState({});
  const [search, setSearch] = useState("");

  // 默认按成交额排序（USDT）
  const [sortKey, setSortKey] = useState("turnover");
  const [sortOrder, setSortOrder] = useState("desc");

  const listRef = useRef(null);
  const { symbol: currentSymbol, setSymbol } = useMarketStore();

  /* 初始 REST */
  useEffect(() => {
    getAll24hTickers().then((d) =>
      setTickers(d.filter((t) => t.symbol.endsWith("USDT")))
    );

    getFundingRates().then((d) => {
      const map = {};
      d.forEach((f) => (map[f.symbol] = Number(f.fundingRate)));
      setFunding(map);
    });
  }, []);

  /* 行情 WS */
  useEffect(() => {
    const conn = connectFutureTickers((data) => {
      setTickers((prev) => {
        const map = {};
        prev.forEach((p) => (map[p.symbol] = p));

        data.forEach((t) => {
          if (t.symbol.endsWith("USDT")) {
            map[t.symbol] = {
              ...map[t.symbol],
              symbol: t.symbol,
              lastPrice: t.price,
              priceChangePercent: t.priceChangePercent,
              turnover: t.turnover, // ⭐ 成交额（USDT）
            };
          }
        });

        return Object.values(map);
      });
    });

    return () => conn.close();
  }, []);

  const toggleSort = (key) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("desc");
    }
  };

  const list = useMemo(() => {
    const symbolMap = JSON.parse(localStorage.getItem("symbolMap") || "{}");

    let filtered = tickers
      .filter((t) =>
        t.symbol.toLowerCase().includes(search.toLowerCase())
      )
      .filter((t) => {
        const base = t.symbol.replace("USDT", "");
        const price = Number(t.lastPrice);
        if (!price || price <= 0) return false;
        if (!symbolMap[base]) return false;
        return true;
      });

    filtered = [...filtered].sort((a, b) => {
      let av = 0;
      let bv = 0;

      if (sortKey === "price") {
        av = Number(a.lastPrice);
        bv = Number(b.lastPrice);
      }
      if (sortKey === "change") {
        av = Number(a.priceChangePercent);
        bv = Number(b.priceChangePercent);
      }
      if (sortKey === "funding") {
        av = funding[a.symbol] ?? 0;
        bv = funding[b.symbol] ?? 0;
      }
      if (sortKey === "turnover") {
        av = Number(a.turnover);
        bv = Number(b.turnover);
      }

      return sortOrder === "asc" ? av - bv : bv - av;
    });

    return filtered;
  }, [tickers, search, sortKey, sortOrder, funding]);

  const Row = ({ index, style }) => {
    const t = list[index];
    if (!t) return null;

    const base = t.symbol.replace("USDT", "");
    const up = Number(t.priceChangePercent) >= 0;
    const active = t.symbol === currentSymbol;

    return (
      <div
        style={{
          ...style,
          display: "flex",
          width: "100%",
          boxSizing: "border-box",
          overflow: "hidden",
          alignItems: "center",
          padding: "10px 14px",
          fontSize: 13,
          background: active ? "#1e2329" : "#0b0e11",
          borderBottom: "1px solid #1e2329",
        }}
      >
        {/* 交易对 */}
        <div
          onClick={() => {
            setSymbol(t.symbol);
            setSearch("");
            onSelect?.();
          }}
          style={{
            width: 480,
            display: "flex",
            alignItems: "center",
            gap: 10,
            cursor: "pointer",
          }}
        >
          <CoinIcon symbol={base} />
          <div>
            <div style={{ fontWeight: 600 }}>
              {base}
              <span style={{ color: "#848e9c" }}>/USDT 永续</span>
            </div>
          </div>
        </div>

        <div
          style={{
            width: 140,
            textAlign: "right",
            color: up ? "#0ecb81" : "#f6465d",
          }}
        >
          {Number(t.lastPrice).toFixed(4)}
        </div>

        <div
          style={{
            width: 140,
            textAlign: "right",
            color: up ? "#0ecb81" : "#f6465d",
          }}
        >
          {Number(t.priceChangePercent).toFixed(2)}%
        </div>

        <div
          style={{
            width: 160,
            textAlign: "right",
            color: "#848e9c",
          }}
        >
          {Number(t.turnover).toLocaleString()}
        </div>

        <div
          style={{
            width: 140,
            textAlign: "right",
            color: "#848e9c",
          }}
        >
          {((funding[t.symbol] ?? 0) * 100).toFixed(4)}%
        </div>
      </div>
    );
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* 搜索 */}
      <div style={{ padding: 8 }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="搜索交易对"
          style={{
            width: "100%",
            padding: "6px 10px",
            background: "#2b3139",
            border: "none",
            borderRadius: 4,
            color: "#fff",
            outline: "none",
          }}
        />
      </div>

      {/* 表头 */}
      <div
        style={{
          display: "flex",
          padding: "8px 14px",
          fontSize: 12,
          color: "#848e9c",
          borderBottom: "1px solid #1e2329",
        }}
      >
        <div style={{ width: 360, paddingLeft: 50 }}>交易对</div>

        <div
          style={{ width: 140, textAlign: "right", cursor: "pointer" }}
          onClick={() => toggleSort("price")}
        >
          最新价 {sortKey === "price" ? (sortOrder === "asc" ? "↑" : "↓") : ""}
        </div>

        <div
          style={{ width: 140, textAlign: "right", cursor: "pointer" }}
          onClick={() => toggleSort("change")}
        >
          24h涨跌 {sortKey === "change" ? (sortOrder === "asc" ? "↑" : "↓") : ""}
        </div>

        <div
          style={{ width: 160, textAlign: "right", cursor: "pointer" }}
          onClick={() => toggleSort("turnover")}
        >
          成交额 {sortKey === "turnover" ? (sortOrder === "asc" ? "↑" : "↓") : ""}
        </div>

        <div
          style={{ width: 140, textAlign: "right", cursor: "pointer" }}
          onClick={() => toggleSort("funding")}
        >
          资金费率 {sortKey === "funding" ? (sortOrder === "asc" ? "↑" : "↓") : ""}
        </div>
      </div>

      <div style={{ flex: 1, overflowX: "hidden" }}>
        <List
          ref={listRef}
          height={window.innerHeight - 160}
          itemCount={list.length}
          itemSize={64}
          width="100%"
        >
          {Row}
        </List>
      </div>
    </div>
  );
}
