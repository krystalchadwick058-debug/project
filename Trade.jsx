import { useState, useCallback, useEffect } from "react";
import SymbolTrigger from "../components/SymbolTrigger";
import KLineChart from "../components/KLineChart";
import OrderPanel from "../components/order/OrderPanel";
import MarketInfo from "../components/MarketInfo";
import PositionsTable from "../components/PositionsTable";

export const getMaintenanceMarginRate = (notional) => {
  if (notional <= 50000) return 0.004;
  if (notional <= 250000) return 0.005;
  if (notional <= 1000000) return 0.01;
  return 0.025;
};

export const calculateLiquidationPrice = (side, entryPrice, leverage, size) => {
  const notional = entryPrice * size;
  const mmr = getMaintenanceMarginRate(notional);
  if (side === 'LONG') {
    return entryPrice * (1 - 1 / leverage + mmr);
  } else {
    return entryPrice * (1 + 1 / leverage - mmr);
  }
};

export default function Trade() {
  const [positions, setPositions] = useState(() => {
    const saved = localStorage.getItem('positions');
    return saved ? JSON.parse(saved) : [];
  });

  const [currentPrice, setCurrentPrice] = useState(null);
  const [markPrice, setMarkPrice] = useState(null);
  const [priceLoaded, setPriceLoaded] = useState(false);

  useEffect(() => {
    const user = localStorage.getItem('currentUser');
    if (!user) {
      const demoUser = {
        username: 'demo',
        name: '演示员工',
        limitU: 5000,
        symbol: 'BTCUSDT'
      };
      localStorage.setItem('currentUser', JSON.stringify(demoUser));
    }

    const loadRealPrice = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
        const symbol = (user.symbol || 'BTCUSDT').replace(/[^a-zA-Z0-9]/g, '');
        
        const priceRes = await fetch(`http://localhost:3001/api/price/${symbol}`);
        if (!priceRes.ok) throw new Error('Failed to fetch last price');
        const priceData = await priceRes.json();
        setCurrentPrice(priceData.price);

        const markRes = await fetch(`http://localhost:3001/api/mark-price/${symbol}`);
        if (!markRes.ok) throw new Error('Failed to fetch mark price');
        const markData = await markRes.json();
        setMarkPrice(markData.price);

      } catch (err) {
        console.error('❌ 无法加载行情价格:', err);
        alert('⚠️ 无法连接币安行情，请检查网络');
      } finally {
        setPriceLoaded(true);
      }
    };

    loadRealPrice();
  }, []);

  const submitOrderToBackend = async (order) => {
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (!user.username) {
      alert('❌ 未登录，请先登录员工账户');
      return null;
    }

    if (!order.price || order.price <= 0) {
      alert('❌ 价格无效，请等待行情加载完成');
      return null;
    }

    try {
      const res = await fetch('http://localhost:3001/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...order, username: user.username })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || '提交失败');
      }
      return await res.json();
    } catch (err) {
      alert('❌ 下单失败: ' + err.message);
      console.error('下单错误:', err);
      return null;
    }
  };

  const handleOrderFilled = useCallback(async (order) => {
    if (!order.quantity || order.quantity <= 0) {
      alert('❌ 数量必须大于 0');
      return;
    }
    if (!order.price || order.price <= 0) {
      alert('❌ 价格无效');
      return;
    }

    const result = await submitOrderToBackend(order);
    if (!result?.success) return;

    if (result.position) {
      let markPriceValue = result.position.entryPrice; // 默认使用开仓价
      try {
        // ✅ 修复：使用完整后端地址
        const markPriceRes = await fetch(`http://localhost:3001/api/mark-price/${result.position.symbol}`);
        if (markPriceRes.ok) {
          const markPriceData = await markPriceRes.json();
          markPriceValue = markPriceData.price;
        } else {
          console.warn('Mark Price 请求失败，使用 entryPrice 作为 fallback');
        }
      } catch (err) {
        console.warn('获取 Mark Price 出错，使用 entryPrice:', err);
      }

      const enhancedPosition = {
        ...result.position,
        markPrice: parseFloat(markPriceValue.toFixed(2)),
        notional: result.position.size * markPriceValue,
      };
      setPositions(prev => [...prev, enhancedPosition]);
      alert('✅ 下单成功！');
    }
  }, []);

  // 实时更新 PnL（基于 Mark Price）
  useEffect(() => {
    if (markPrice === null) return;
    setPositions(prev =>
      prev.map(pos => {
        const pnl = pos.side === 'LONG'
          ? (markPrice - pos.entryPrice) * pos.size * pos.leverage
          : (pos.entryPrice - markPrice) * pos.size * pos.leverage;
        const pnlRate = pos.margin ? (pnl / pos.margin) * 100 : 0;
        return {
          ...pos,
          markPrice: parseFloat(markPrice.toFixed(2)),
          pnl: parseFloat(pnl.toFixed(2)),
          pnlRate: parseFloat(pnlRate.toFixed(2)),
        };
      })
    );
  }, [markPrice]);

  useEffect(() => {
    localStorage.setItem('positions', JSON.stringify(positions));
  }, [positions]);

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 20,
          padding: "8px 14px",
          borderBottom: "1px solid #1e2329",
          background: "#0b0e11",
        }}
      >
        <SymbolTrigger />
        <MarketInfo inline price={currentPrice} />
      </div>

      <div style={{ flex: 1, display: "flex" }}>
        <div style={{ flex: 1 }}>
          <KLineChart price={currentPrice} />
        </div>
        <div style={{ width: 360 }}>
          {priceLoaded && currentPrice !== null ? (
            <OrderPanel
              onOrderFilled={handleOrderFilled}
              currentPrice={currentPrice}
              calculateLiquidationPrice={calculateLiquidationPrice}
            />
          ) : (
            <div style={{
              height: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              color: '#888',
              fontSize: '14px'
            }}>
              加载行情中...
            </div>
          )}
        </div>
      </div>

      <div style={{ height: 220, borderTop: "1px solid #1e2329" }}>
        <PositionsTable
          positions={positions}
          currentPrice={currentPrice}
          markPrice={markPrice}
          setPositions={setPositions}
        />
      </div>
    </div>
  );
}