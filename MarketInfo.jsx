import { useEffect, useState, useRef } from "react";
import {
  getAll24hTickers,
  getFundingRates,
  connectFutureTickers,
} from "../adapters/binanceAdapter";
import { useMarketStore } from "../store/marketStore";

export default function MarketInfo({ inline = false }) {
  const { symbol } = useMarketStore();

  const [ticker, setTicker] = useState(null);
  const [funding, setFunding] = useState(null);
  const [now, setNow] = useState(Date.now());

  const fundingLoadingRef = useRef(false);

  /* ===== 本地时钟 ===== */
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  /* ===== 初始化行情 & 资金费率 ===== */
  useEffect(() => {
    setTicker(null);
    setFunding(null);

    getAll24hTickers().then((list) => {
      const t = list.find((i) => i.symbol === symbol);
      if (t) setTicker(t);
    });

    fetchFunding(symbol, setFunding);
  }, [symbol]);

  /* ===== 行情 WS ===== */
  useEffect(() => {
    const ws = connectFutureTickers((list) => {
      const t = list.find((i) => i.symbol === symbol);
      if (t) {
        setTicker((prev) => (prev ? { ...prev, ...t } : t));
      }
    });

    return () => ws.close();
  }, [symbol]);

  /* ===== 资金费率到期刷新 ===== */
  useEffect(() => {
    if (!funding) return;

    const remain = funding.nextFundingTime - now;
    if (remain <= 0 && !fundingLoadingRef.current) {
      fundingLoadingRef.current = true;
      fetchFunding(symbol, setFunding).finally(() => {
        fundingLoadingRef.current = false;
      });
    }
  }, [now, funding, symbol]);

  if (!ticker) return null;

  const rise = ticker.priceChangePercent >= 0;

  const fundingRemain =
    funding && funding.nextFundingTime
      ? Math.max(0, funding.nextFundingTime - now)
      : 0;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 18,
        fontSize: 12,
        background: "transparent",
      }}
    >
      {/* 最新价 */}
      <div>
        <div
          style={{
            fontSize: 22,
            fontWeight: 600,
            color: rise ? "#0ecb81" : "#f6465d",
          }}
        >
          {ticker.price}
        </div>
        <div style={{ color: rise ? "#0ecb81" : "#f6465d" }}>
          {ticker.priceChangePercent.toFixed(2)}%
        </div>
      </div>

      <Item label="24h 高" value={ticker.high} />
      <Item label="24h 低" value={ticker.low} />
      <Item label="24h 成交额" value={ticker.turnover.toLocaleString()} />

      {funding && (
        <>
          <Item label="标记价格" value={funding.markPrice} />
          <Item
            label="资金费率"
            value={(funding.fundingRate * 100).toFixed(4) + "%"}
          />
          <Item label="倒计时" value={formatMs(fundingRemain)} />
        </>
      )}
    </div>
  );
}

/* ===== 拉取资金费率 ===== */
async function fetchFunding(symbol, setFunding) {
  const list = await getFundingRates();
  const f = list.find((i) => i.symbol === symbol);
  if (!f) return;

  f.nextFundingTime = Number(f.nextFundingTime);
  setFunding(f);
}

/* ===== 子组件 ===== */
function Item({ label, value }) {
  return (
    <div>
      <div style={{ color: "#848e9c" }}>{label}</div>
      <div style={{ color: "#d9d9d9" }}>{value}</div>
    </div>
  );
}

function formatMs(ms) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const h = String(Math.floor(s / 3600)).padStart(2, "0");
  const m = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
  const sec = String(s % 60).padStart(2, "0");
  return `${h}:${m}:${sec}`;
}
