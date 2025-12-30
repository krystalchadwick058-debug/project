// src/components/order/OrderForm.jsx
import PriceInput from './PriceInput';
import StopPriceInput from './StopPriceInput';
import AmountInput from './AmountInput';

export default function OrderForm({ engine }) {
  const { state, setState } = engine;

  const handlePriceChange = (v) => {
    // ✅ 安全转换：非数字或 <=0 时，不更新（或设为 0，但前端会拦截）
    const num = parseFloat(v);
    if (isNaN(num) || num <= 0) {
      // 可选：保留空字符串（UI 显示为空），但 engine 内部应有兜底
      // 这里我们仍然传递原始值，由 useOrderEngine 防御
      setState(s => ({ ...s, price: v }));
    } else {
      setState(s => ({ ...s, price: num }));
    }
  };

  const handleStopPriceChange = (v) => {
    const num = parseFloat(v);
    if (isNaN(num) || num <= 0) {
      setState(s => ({ ...s, stopPrice: v }));
    } else {
      setState(s => ({ ...s, stopPrice: num }));
    }
  };

  const handleAmountChange = (v) => {
    const num = parseFloat(v);
    if (isNaN(num) || num < 0) {
      setState(s => ({ ...s, amount: v }));
    } else {
      setState(s => ({ ...s, amount: num }));
    }
  };

  return (
    <>
      {state.orderType === 'STOP' && (
        <StopPriceInput
          value={state.stopPrice}
          onChange={handleStopPriceChange}
        />
      )}

      {state.orderType !== 'MARKET' && (
        <PriceInput
          value={state.price}
          onChange={handlePriceChange}
        />
      )}

      <AmountInput
        value={state.amount}
        onChange={handleAmountChange}
      />
    </>
  );
}