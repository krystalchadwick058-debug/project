// src/adapters/binanceAdapter.js
// Binance USDT-M Futures Adapter
// 所有统计一律【按成交额（USDT）】

const FUTURE_WS = "wss://fstream.binance.com/ws";
const FUTURE = "https://fapi.binance.com";

/* ================= REST ================= */

/**
 * U 本位合约 24h 行情（按成交额）
 */
export async function getAll24hTickers() {
  const res = await fetch(`${FUTURE}/fapi/v1/ticker/24hr`);
  const data = await res.json();

  return data.map((t) => ({
    symbol: t.symbol,
    price: +t.lastPrice,
    priceChangePercent: +t.priceChangePercent,

    turnover: +t.quoteVolume, // ⭐ 成交额（USDT）

    high: +t.highPrice,
    low: +t.lowPrice,
  }));
}

/**
 * U 本位合约资金费率
 */
export async function getFundingRates() {
  const res = await fetch(`${FUTURE}/fapi/v1/premiumIndex`);
  const data = await res.json();

  return data.map((f) => ({
    symbol: f.symbol,
    markPrice: +f.markPrice,
    fundingRate: +f.lastFundingRate,
    nextFundingTime: f.nextFundingTime,
  }));
}

/**
 * U 本位合约 K 线（按成交额）
 */
export async function getFutureKlines(symbol, interval, limit = 500) {
  const res = await fetch(
    `${FUTURE}/fapi/v1/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`
  );
  const data = await res.json();

  return data.map((k) => ({
    time: k[0] / 1000,
    open: +k[1],
    high: +k[2],
    low: +k[3],
    close: +k[4],

    turnover: +k[7], // ⭐ 成交额（USDT）
  }));
}

/* ================= WebSocket ================= */

/**
 * U 本位合约 K 线 WS（按成交额）
 */
export function connectFutureKline(symbol, interval, onMessage) {
  let ws;
  let heartbeat;
  let closed = false;

  const connect = () => {
    if (closed) return;

    const stream = `${symbol.toLowerCase()}@kline_${interval}`;
    ws = new WebSocket(`${FUTURE_WS}/${stream}`);

    ws.onopen = () => {
      heartbeat = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ ping: Date.now() }));
        }
      }, 30000);
    };

    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (!data?.k) return;

      const k = data.k;

      onMessage({
        time: k.t / 1000,
        open: +k.o,
        high: +k.h,
        low: +k.l,
        close: +k.c,

        turnover: +k.q, // ⭐ 成交额（USDT）
        isClosed: k.x,
      });
    };

    ws.onerror = () => ws.close();

    ws.onclose = () => {
      clearInterval(heartbeat);
      if (!closed) setTimeout(connect, 2000);
    };
  };

  connect();

  return {
    close() {
      closed = true;
      clearInterval(heartbeat);
      ws?.close();
    },
  };
}

/**
 * U 本位合约全市场行情 WS（按成交额）
 */
export function connectFutureTickers(onMessage) {
  let ws;
  let closed = false;

  const connect = () => {
    if (closed) return;

    ws = new WebSocket(`${FUTURE_WS}/!ticker@arr`);

    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);

      onMessage(
        data.map((t) => ({
          symbol: t.s,
          price: +t.c,
          priceChangePercent: +t.P,

          turnover: +t.q, // ⭐ 成交额（USDT）
        }))
      );
    };

    ws.onerror = () => ws.close();

    ws.onclose = () => {
      if (!closed) setTimeout(connect, 2000);
    };
  };

  connect();

  return {
    close() {
      closed = true;
      ws?.close();
    },
  };
}