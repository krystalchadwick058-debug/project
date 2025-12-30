import { useOrderEngine } from './useOrderEngine';
import { exchangeRules } from './exchangeRules';

import OrderTabs from './OrderTabs';
import OrderForm from './OrderForm';
import AmountSlider from './AmountSlider';
import OrderOptions from './OrderOptions';
import OrderActions from './OrderActions';
import OrderInfo from './OrderInfo';

import styles from './order.module.css';

// ✅ 新增：只读 OrderHeader（无交互）
function ReadOnlyOrderHeader({ marginType, leverage }) {
  return (
    <div className={styles.orderHeader}>
      <div>{marginType === 'cross' ? '全仓' : '逐仓'}</div>
      <div>{leverage}x</div>
      <div>S</div>
    </div>
  );
}

export default function OrderPanel({ onOrderFilled, currentPrice = 60000, calculateLiquidationPrice }) {
  const currentUser = JSON.parse(localStorage.getItem('currentUser')) || {};
  const limitU = parseFloat(currentUser.limitU) || 5000;
  const userSymbol = (currentUser.symbol || 'BTCUSDT').replace('/', '');
  const safeCurrentPrice = Math.max(0.01, parseFloat(currentPrice) || 60000);

  const engine = useOrderEngine({
    symbol: userSymbol,
    availableMargin: limitU,
    limitU,
    rules: exchangeRules,
    currentPrice: safeCurrentPrice,
    calculateLiquidationPrice
  });

  const handleOrderSuccess = (side) => {
    try {
      // 🔁 兜底 1: 确保 amount > 0
      let amount = engine.state.amount;
      if (amount <= 0) {
        amount = engine.maxAmount;
        if (!amount || amount <= 0) {
          alert('❌ 可用保证金不足或价格未加载，请稍候...');
          return;
        }
      }

      // 🔁 兜底 2: 确保 price > 0
      const executionPrice =
        engine.state.orderType === 'MARKET'
          ? safeCurrentPrice
          : (engine.state.price > 0 ? engine.state.price : safeCurrentPrice);

      // 🔁 兜底 3: 确保 leverage 是正数
      const leverage = Math.max(1, engine.state.leverage);

      const order = {
        symbol: userSymbol,
        side,
        price: parseFloat(executionPrice.toFixed(2)),
        quantity: parseFloat(amount.toFixed(4)),
        leverage: parseInt(leverage),
        timestamp: Date.now(),
      };

      // ✅ 防守：再次校验
      if (!order.price || order.price <= 0) {
        alert('❌ 价格无效，请检查行情是否加载');
        return;
      }
      if (!order.quantity || order.quantity <= 0) {
        alert('❌ 数量无效，请调整滑块');
        return;
      }

      onOrderFilled?.(order);
    } catch (err) {
      console.error('下单构造失败:', err);
      alert('❌ 系统错误：' + (err.message || '请刷新重试'));
    }
  };

  return (
    <div className={styles.orderPanel}>
      {/* ✅ 使用只读 Header，彻底避免 silent error */}
      <ReadOnlyOrderHeader
        marginType={engine.state.marginType}
        leverage={engine.state.leverage}
      />

      <OrderTabs
        value={engine.state.orderType}
        onChange={v => engine.setState(s => ({ ...s, orderType: v }))}
      />

      <OrderForm engine={engine} />

      <div style={{ textAlign: 'center', marginBottom: '4px', fontSize: '12px', color: '#aaa' }}>
        {engine.state.percent.toFixed(0)}%
      </div>

      <AmountSlider
        percent={engine.state.percent}
        onChange={engine.setPercent}
      />

      <OrderOptions
        reduceOnly={engine.state.reduceOnly}
        onReduceOnly={v => engine.setState(s => ({ ...s, reduceOnly: v }))}
      />

      <OrderActions
        onBuy={() => handleOrderSuccess('LONG')}
        onSell={() => handleOrderSuccess('SHORT')}
      />

      <OrderInfo
        availableMargin={limitU}
        maxAmount={engine.maxAmount}
        liquidationPrice={engine.previewLiquidationPrice}
      />
    </div>
  );
}