import { useEffect, useRef, useState } from "react";
import { createChart } from "lightweight-charts";
import {
  connectFutureKline,
  getFutureKlines,
} from "../adapters/binanceAdapter";
import { useMarketStore } from "../store/marketStore";

const INTERVALS = [
  { key: "1m", label: "1分" },
  { key: "3m", label: "3分" },
  { key: "5m", label: "5分" },
  { key: "15m", label: "15分" },
  { key: "30m", label: "30分" },
  { key: "1h", label: "1小时" },
  { key: "2h", label: "2小时" },
  { key: "4h", label: "4小时" },
  { key: "6h", label: "6小时" },
  { key: "12h", label: "12小时" },
  { key: "1d", label: "1天" },
  { key: "3d", label: "3天" },
  { key: "1w", label: "1周" },
  { key: "1M", label: "1月" },
];

const MA_CONFIG = [
  { period: 7, color: "#f5a623" },
  { period: 25, color: "#e84393" },
  { period: 99, color: "#6c5ce7" },
];

function getLastMA(data, period) {
  if (data.length < period) return null;
  let sum = 0;
  for (let i = data.length - period; i < data.length; i++) {
    sum += data[i].close;
  }
  return sum / period;
}

function calcMA(data, period) {
  const result = [];
  for (let i = period - 1; i < data.length; i++) {
    let sum = 0;
    for (let j = i - period + 1; j <= i; j++) {
      sum += data[j].close;
    }
    result.push({
      time: data[i].time,
      value: sum / period,
    });
  }
  return result;
}

export default function KLineChart() {
  const containerRef = useRef(null);
  const legendRef = useRef(null);

  const chartRef = useRef(null);
  const candleRef = useRef(null);
  const volumeRef = useRef(null);
  const maRefs = useRef([]);
  const wsRef = useRef(null);

  const dataRef = useRef([]);
  const loadingRef = useRef(false);
  const noMoreHistoryRef = useRef(false);

  const { symbol } = useMarketStore();
  const [interval, setInterval] = useState("1m");

  useEffect(() => {
    if (!containerRef.current || !symbol) return;

    wsRef.current?.close();
    if (chartRef.current) {
      chartRef.current.remove();
    }

    dataRef.current = [];
    loadingRef.current = false;
    noMoreHistoryRef.current = false;
    maRefs.current = [];

    const chart = createChart(containerRef.current, {
      height: 520,
      layout: {
        background: { color: "#0b0e11" },
        textColor: "#d9d9d9",
      },
      grid: {
        vertLines: { color: "#1e2329" },
        horzLines: { color: "#1e2329" },
      },
      timeScale: {
        timeVisible: true,
        minBarSpacing: 6,
        rightOffset: 2,
        fixLeftEdge: true,
      },
      rightPriceScale: {
        scaleMargins: { top: 0.08, bottom: 0.28 },
      },
      crosshair: {
        mode: 0,
        vertLine: {
          color: "#2b3139",
          width: 1,
          style: 2,
          labelVisible: true,
        },
        horzLine: {
          color: "#2b3139",
          width: 1,
          style: 2,
          labelVisible: true,
        },
      },
      handleScroll: { mouseWheel: true, pressedMouseMove: true },
      handleScale: {
        mouseWheel: true,
        pinch: true,
        axisDoubleClickReset: true,
      },
    });

    chartRef.current = chart;

    candleRef.current = chart.addCandlestickSeries({
      priceLineVisible: false,
      lastValueVisible: false,
    });

    volumeRef.current = chart.addHistogramSeries({
      priceFormat: { type: "volume" },
      priceScaleId: "volume",
    });

    chart.priceScale("volume").applyOptions({
      scaleMargins: { top: 0.78, bottom: 0 },
    });

    maRefs.current = MA_CONFIG.map((cfg) =>
      chart.addLineSeries({
        color: cfg.color,
        lineWidth: 1,
        priceLineVisible: false,
        lastValueVisible: false,
        crosshairMarkerVisible: false,
        autoscaleInfoProvider: () => null,
      })
    );

    const handleCrosshairMove = (param) => {
      if (param.time && dataRef.current.length) {
        const time = Math.floor(param.time);
        const k =
          dataRef.current.find((d) => d.time === time) ||
          dataRef.current.reduce((prev, curr) =>
            Math.abs(curr.time - time) < Math.abs(prev.time - time)
              ? curr
              : prev
          );
        updateLegend(k);
      } else {
        updateLegend(null);
      }
    };
    chart.subscribeCrosshairMove(handleCrosshairMove);

    getFutureKlines(symbol, interval, 500).then((data) => {
      if (!data.length) return;
      dataRef.current = data.sort((a, b) => a.time - b.time);
      candleRef.current.setData(dataRef.current);
      volumeRef.current.setData(
        dataRef.current.map((k) => ({
          time: k.time,
          value: k.turnover,
          color: k.close >= k.open ? "#0ecb81" : "#f6465d",
        }))
      );
      MA_CONFIG.forEach((cfg, i) => {
        maRefs.current[i].setData(calcMA(dataRef.current, cfg.period));
      });
      chart.timeScale().scrollToPosition(0);
      updateLegend(null);
    });

    chart.timeScale().subscribeVisibleLogicalRangeChange(() => {});

    wsRef.current = connectFutureKline(symbol, interval, (k) => {
      const last = dataRef.current.at(-1);
      if (last && k.time === last.time) {
        dataRef.current[dataRef.current.length - 1] = k;
        candleRef.current.update(k);
      } else if (!last || k.time > last.time) {
        dataRef.current.push(k);
        candleRef.current.update(k);
      }

      volumeRef.current.update({
        time: k.time,
        value: k.turnover,
        color: k.close >= k.open ? "#0ecb81" : "#f6465d",
      });

      MA_CONFIG.forEach((cfg, i) => {
        const maValue = getLastMA(dataRef.current, cfg.period);
        if (maValue !== null) {
          maRefs.current[i].update({ time: k.time, value: maValue });
        }
      });

      updateLegend();
    });

    return () => {
      wsRef.current?.close();
      if (chartRef.current) {
        chart.unsubscribeCrosshairMove(handleCrosshairMove);
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, [symbol, interval]);

  /**
   * ✅ 唯一修改点在这里
   * - 悬停时：MA 随当前 K 线变化
   * - 非悬停：MA 显示最新值
   */
  function updateLegend(kline = null) {
    if (!legendRef.current) return;

    let html = "";
    let index = -1;

    if (kline) {
      index = dataRef.current.findIndex(d => d.time === kline.time);

      const change = ((kline.close - kline.open) / kline.open) * 100;
      const timeStr = new Date(kline.time * 1000)
        .toLocaleString("zh-CN", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        })
        .replace(/\//g, "-");

      html += `<div style="color:#d9d9d9;margin-bottom:4px;font-size:12px">
        ${timeStr} | 开 ${kline.open.toFixed(2)} | 高 ${kline.high.toFixed(
        2
      )} | 低 ${kline.low.toFixed(2)} | 收 ${kline.close.toFixed(2)} (${
        change >= 0 ? "+" : ""
      }${change.toFixed(2)}%)
      </div>`;
    }

    html += MA_CONFIG.map((cfg) => {
      let ma = null;

      if (index >= cfg.period - 1) {
        let sum = 0;
        for (let i = index - cfg.period + 1; i <= index; i++) {
          sum += dataRef.current[i].close;
        }
        ma = sum / cfg.period;
      } else if (!kline) {
        ma = getLastMA(dataRef.current, cfg.period);
      }

      return `<span style="color:${cfg.color};margin-right:12px">
        MA(${cfg.period}) ${ma ? ma.toFixed(2) : "--"}
      </span>`;
    }).join("");

    legendRef.current.innerHTML = html;
  }

  return (
    <div style={{ position: "relative" }}>
      <div style={{ padding: "6px 10px" }}>
        {INTERVALS.map((i) => (
          <button
            key={i.key}
            onClick={() => setInterval(i.key)}
            style={{
              marginRight: 12,
              color: interval === i.key ? "#f0b90b" : "#848e9c",
              background: "transparent",
              border: "none",
              cursor: "pointer",
            }}
          >
            {i.label}
          </button>
        ))}
      </div>

      <div
        ref={legendRef}
        style={{
          position: "absolute",
          top: 40,
          left: 12,
          fontSize: 12,
          zIndex: 10,
        }}
      />

      <div ref={containerRef} style={{ height: 520 }} />
    </div>
  );
}