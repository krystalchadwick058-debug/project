// src/components/ClosePositionModal.jsx
import { useState, useEffect } from 'react';

export default function ClosePositionModal({
  position,
  onConfirm,
  onCancel,
}) {
  const [orderType, setOrderType] = useState('LIMIT');
  const [price, setPrice] = useState(null);
  const [percent, setPercent] = useState(100);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const amount = (position.size * percent) / 100;

  // ✅ 封装拉取最新价格的函数
  const fetchLatestPrice = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`/api/close-price/${position.symbol}`);
      if (!response.ok) throw new Error('Failed to fetch close price');
      const data = await response.json();
      const latestPrice = parseFloat(data.price);
      if (isNaN(latestPrice) || latestPrice <= 0) throw new Error('Invalid price');
      setPrice(latestPrice);
    } catch (err) {
      console.error('平仓价格获取失败:', err);
      setError('无法获取最新价格，请重试');
      setPrice(null);
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ 组件挂载时拉取一次
  useEffect(() => {
    fetchLatestPrice();
  }, [position.symbol]);

  // ✅ 切换到 LIMIT 时，重新拉取最新价格（关键修复！）
  useEffect(() => {
    if (orderType === 'LIMIT') {
      fetchLatestPrice();
    }
  }, [orderType]);

  const handleConfirm = () => {
    if (price === null) {
      alert('❌ 价格未加载，请稍后重试');
      return;
    }
    if (amount <= 0) {
      alert('❌ 平仓数量必须大于 0');
      return;
    }

    const closeOrder = {
      symbol: position.symbol,
      side: position.side === 'LONG' ? 'SHORT' : 'LONG',
      price: price,
      quantity: amount,
      leverage: position.leverage,
      timestamp: Date.now(),
    };

    onConfirm(closeOrder);
  };

  const isConfirmDisabled = price === null || amount <= 0;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: 'rgba(0,0,0,0.6)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
    }}>
      <div style={{
        background: '#0b0e11',
        padding: '20px',
        borderRadius: '8px',
        width: '400px',
        color: '#fff',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h3 style={{ margin: 0 }}>平仓 {position.symbol}</h3>
          <button onClick={onCancel} style={{
            background: 'none',
            border: 'none',
            color: '#848e9c',
            cursor: 'pointer',
            fontSize: '20px'
          }}>×</button>
        </div>

        {error && (
          <div style={{ color: '#f6465d', fontSize: '12px', marginBottom: '12px' }}>
            {error}
          </div>
        )}

        {/* 订单类型切换 */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
          <button
            onClick={() => setOrderType('LIMIT')}
            style={{
              flex: 1,
              padding: '8px',
              background: orderType === 'LIMIT' ? '#1e2329' : 'transparent',
              border: '1px solid #1e2329',
              color: '#fff',
              cursor: 'pointer',
              borderRadius: '4px'
            }}
          >
            限价
          </button>
          <button
            onClick={() => setOrderType('MARKET')}
            style={{
              flex: 1,
              padding: '8px',
              background: orderType === 'MARKET' ? '#1e2329' : 'transparent',
              border: '1px solid #1e2329',
              color: '#fff',
              cursor: 'pointer',
              borderRadius: '4px'
            }}
          >
            市价
          </button>
        </div>

        {/* 限价价格输入 */}
        {orderType === 'LIMIT' && (
          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
              <label style={{ fontSize: '12px' }}>平仓价格</label>
              <button
                onClick={fetchLatestPrice}
                disabled={isLoading}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#f0b90b',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  fontSize: '11px'
                }}
              >
                {isLoading ? '刷新中...' : '🔄 刷新'}
              </button>
            </div>
            <input
              type="number"
              step="0.01"
              value={price || ''}
              onChange={(e) => setPrice(parseFloat(e.target.value) || null)}
              style={{
                width: '100%',
                padding: '8px',
                background: '#1e2329',
                border: '1px solid #343a40',
                color: '#fff',
                borderRadius: '4px'
              }}
            />
          </div>
        )}

        {/* 平仓比例 */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px' }}>
            平仓比例: {percent}%
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={percent}
            onChange={(e) => setPercent(parseInt(e.target.value))}
            style={{
              width: '100%',
              accentColor: '#f0b90b'
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', fontSize: '12px' }}>
            <span>0%</span>
            <span>100%</span>
          </div>
        </div>

        <button
          onClick={() => setPercent(100)}
          style={{
            width: '100%',
            padding: '8px',
            background: '#343a40',
            color: '#f0b90b',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginBottom: '16px'
          }}
        >
          全部平仓
        </button>

        {/* 底部按钮 */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1,
              padding: '8px',
              background: 'transparent',
              border: '1px solid #343a40',
              color: '#fff',
              cursor: 'pointer',
              borderRadius: '4px'
            }}
          >
            取消
          </button>
          <button
            onClick={handleConfirm}
            disabled={isConfirmDisabled}
            style={{
              flex: 1,
              padding: '8px',
              background: isConfirmDisabled ? '#555' : '#f6465d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isConfirmDisabled ? 'not-allowed' : 'pointer'
            }}
          >
            确认平仓
          </button>
        </div>
      </div>
    </div>
  );
}