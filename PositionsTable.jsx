import { useState } from "react";

const TABS = [
  { key: "positions", label: "仓位" },
  { key: "openOrders", label: "当前委托" },
  { key: "orderHistory", label: "历史委托" },
  { key: "tradeHistory", label: "历史成交" },
  { key: "fundFlow", label: "资金流水" },
  { key: "positionHistory", label: "仓位历史记录" },
];

export default function PositionsTable({
  positions = [],
  openOrders = [],
  orderHistory = [],
  tradeHistory = [],
  fundFlow = [],
  positionHistory = [],
  // ✅ 新增必要 props
  currentPrice = 60000,
  setPositions,
}) {
  const [activeTab, setActiveTab] = useState("positions");

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* ================= Tab Header ================= */}
      <div
        style={{
          display: "flex",
          gap: 20,
          padding: "10px 14px 0",
          borderBottom: "1px solid #1e2329",
          fontSize: 13,
          color: "#848e9c",
        }}
      >
        {TABS.map(tab => {
          const active = activeTab === tab.key;
          return (
            <div
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                paddingBottom: 8,
                cursor: "pointer",
                color: active ? "#eaecef" : "#848e9c",
                borderBottom: active
                  ? "2px solid #f0b90b"
                  : "2px solid transparent",
              }}
            >
              {tab.label}
              {tab.key === "positions" && `(${positions.length})`}
            </div>
          );
        })}
      </div>

      {/* ================= 内容区 ================= */}
      <div
        style={{
          flex: 1,
          overflow: "auto",
          padding: "8px 12px",
          color: "#eaecef",
        }}
      >
        {activeTab === "positions" && (
          <PositionsContent
            positions={positions}
            currentPrice={currentPrice}
            setPositions={setPositions}
          />
        )}

        {activeTab === "openOrders" && (
          <EmptyPlaceholder text="当前没有委托" />
        )}

        {activeTab === "orderHistory" && (
          <EmptyPlaceholder text="暂无历史委托" />
        )}

        {activeTab === "tradeHistory" && (
          <EmptyPlaceholder text="暂无历史成交" />
        )}

        {activeTab === "fundFlow" && (
          <EmptyPlaceholder text="暂无资金流水" />
        )}

        {activeTab === "positionHistory" && (
          <EmptyPlaceholder text="暂无仓位历史记录" />
        )}
      </div>
    </div>
  );
}

/* ================= 平仓模态框（内联组件） ================= */

function ClosePositionModal({ position, currentPrice, onConfirm, onCancel }) {
  const [orderType, setOrderType] = useState('LIMIT');
  const [price, setPrice] = useState(currentPrice);
  const [percent, setPercent] = useState(100);

  // 限制 percent 范围
  const safePercent = Math.min(100, Math.max(0, parseInt(percent) || 0));
  const amount = (position.size * safePercent) / 100;

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
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px' }}>平仓价格</label>
            <input
              type="number"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(parseFloat(e.target.value))}
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
            平仓比例: {safePercent}%
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={safePercent}
            onChange={(e) => setPercent(e.target.value)}
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

        {/* 全部平仓按钮 */}
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

        {/* 操作按钮 */}
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
            onClick={() => onConfirm({
              symbol: position.symbol,
              side: position.side === 'LONG' ? 'SHORT' : 'LONG',
              price: orderType === 'MARKET' ? currentPrice : price,
              quantity: amount,
              leverage: position.leverage,
              timestamp: Date.now(),
            })}
            disabled={amount <= 0}
            style={{
              flex: 1,
              padding: '8px',
              background: amount > 0 ? '#f6465d' : '#555',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: amount > 0 ? 'pointer' : 'not-allowed'
            }}
          >
            确认平仓
          </button>
        </div>
      </div>
    </div>
  );
}

/* ================= 仓位表（币安风格） ================= */

function PositionsContent({ positions, currentPrice, setPositions }) {
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState(null);

  if (positions.length === 0) {
    return <EmptyPlaceholder text="当前没有持仓" />;
  }

  const handleOpenClose = (pos) => {
    setSelectedPosition(pos);
    setShowCloseModal(true);
  };

  const handleConfirmClose = async (closeOrder) => {
    try {
      const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
      if (!user.username) {
        alert('❌ 未登录，请先登录员工账户');
        return;
      }

      const res = await fetch('http://localhost:3001/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...closeOrder, username: user.username })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || '平仓失败');
      }

      // ✅ 成功后：从列表中移除该仓位（模拟全平仓）
      // 如需支持部分平仓，需更新 size 而非移除
      setPositions(prev => prev.filter(p => p.id !== selectedPosition.id));

      alert('✅ 平仓成功！');
      setShowCloseModal(false);
      setSelectedPosition(null);

    } catch (err) {
      alert('❌ 平仓失败: ' + err.message);
      console.error('平仓错误:', err);
    }
  };

  return (
    <div style={{ fontSize: '12px', color: '#eaecef' }}>
      {/* 表头 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '80px 60px 80px 80px 60px 80px 90px 80px 80px 1fr',
        padding: '8px 0',
        borderBottom: '1px solid #1e2329',
        color: '#848e9c',
        fontWeight: 'bold'
      }}>
        <div>合约</div>
        <div>方向</div>
        <div>开仓价</div>
        <div>标记价</div>
        <div>杠杆</div>
        <div>仓位价值</div>
        <div>未实现盈亏</div>
        <div>盈亏率</div>
        <div>强平价</div>
        <div>操作</div>
      </div>

      {positions.map((p, i) => {
        const isLong = p.side === "LONG";
        const pnlColor = p.pnl >= 0 ? "#0ecb81" : "#f6465d";

        return (
          <div
            key={p.id || i}
            style={{
              display: 'grid',
              gridTemplateColumns: '80px 60px 80px 80px 60px 80px 90px 80px 80px 1fr',
              padding: '10px 0',
              borderBottom: '1px solid #1e2329',
              alignItems: 'center'
            }}
          >
            <div>{p.symbol}</div>
            <div style={{ color: isLong ? "#0ecb81" : "#f6465d" }}>
              {isLong ? "多" : "空"}
            </div>
            <div>{p.entryPrice?.toFixed(2) || '--'}</div>
            <div>{p.markPrice?.toFixed(2) || '--'}</div>
            <div>{p.leverage}x</div>
            <div>{p.notional?.toFixed(2) || '--'}</div>
            <div style={{ color: pnlColor }}>{p.pnl?.toFixed(2) || '0.00'}</div>
            <div style={{ color: pnlColor }}>{p.pnlRate?.toFixed(2) || '0.00'}%</div>
            <div>{p.liquidationPrice?.toFixed(2) || '--'}</div>
            <div>
              <button
                onClick={() => handleOpenClose(p)}
                style={{
                  background: '#f6465d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '4px 8px',
                  fontSize: '11px',
                  cursor: 'pointer'
                }}
              >
                平仓
              </button>
            </div>
          </div>
        );
      })}

      {/* 平仓模态框 */}
      {showCloseModal && selectedPosition && (
        <ClosePositionModal
          position={selectedPosition}
          currentPrice={currentPrice}
          onConfirm={handleConfirmClose}
          onCancel={() => {
            setShowCloseModal(false);
            setSelectedPosition(null);
          }}
        />
      )}
    </div>
  );
}

/* ================= 空态占位 ================= */

function EmptyPlaceholder({ text }) {
  return (
    <div
      style={{
        padding: "32px 0",
        textAlign: "center",
        fontSize: 13,
        color: "#848e9c",
      }}
    >
      {text}
    </div>
  );
}