import { useState, useMemo, useEffect } from 'react';

export function useOrderEngine({
  symbol = 'BTCUSDT',
  availableMargin = 0,
  limitU = 0,
  rules = {},
  currentPrice = 0,
  calculateLiquidationPrice
}) {
  const rule = rules[symbol] || {};
  const defaultLeverage = Math.max(1, parseInt(rule.defaultLeverage) || 10);

  const [state, setState] = useState({
    marginType: 'cross',
    leverage: defaultLeverage,
    orderType: 'LIMIT',
    price: null,
    amount: 0,
    percent: 0,
    reduceOnly: false,
  });

  // ✅ 更健壮的价格选择
  const priceForCalc = Math.max(
    0.01,
    state.orderType === 'LIMIT' && typeof state.price === 'number' && state.price > 0
      ? state.price
      : currentPrice
  );

  const maxAmountByLimit = useMemo(() => {
    return limitU > 0 ? limitU / priceForCalc : 0;
  }, [limitU, priceForCalc]);

  const maxAmountByMargin = useMemo(() => {
    const lev = Math.max(1, state.leverage);
    return availableMargin > 0 ? (availableMargin * lev) / priceForCalc : 0;
  }, [availableMargin, state.leverage, priceForCalc]);

  const maxAmount = useMemo(() => {
    const val = Math.min(maxAmountByMargin, maxAmountByLimit);
    return isFinite(val) && val > 0 ? parseFloat(val.toFixed(4)) : 0;
  }, [maxAmountByMargin, maxAmountByLimit]);

  const previewLiquidationPrice = useMemo(() => {
    if (!calculateLiquidationPrice || state.amount <= 0 || priceForCalc <= 0) return null;
    return calculateLiquidationPrice(
      'LONG',
      priceForCalc,
      Math.max(1, state.leverage),
      state.amount
    );
  }, [state.amount, state.leverage, priceForCalc, calculateLiquidationPrice]);

  const setPercent = (p) => {
    const safeP = Math.min(100, Math.max(0, parseFloat(p) || 0));
    let amount = 0;
    if (maxAmount > 0) {
      amount = parseFloat((maxAmount * safeP / 100).toFixed(4));
    }
    setState(s => ({ ...s, percent: safeP, amount }));
  };

  const setAmount = (v) => {
    const safeV = Math.max(0, parseFloat(v) || 0);
    let percent = 0;
    if (maxAmount > 0) {
      percent = Math.min(100, (safeV / maxAmount) * 100);
    }
    setState(s => ({ ...s, amount: safeV, percent }));
  };

  // ✅ 自动填充 price（仅 LIMIT）
  useEffect(() => {
    if (currentPrice > 0 && state.orderType === 'LIMIT' && (state.price === null || state.price <= 0)) {
      setState(s => ({ ...s, price: currentPrice }));
    }
  }, [currentPrice, state.orderType]);

  // ✅ 防止 amount 超限
  useEffect(() => {
    if (state.amount > maxAmount) {
      setState(s => ({ ...s, amount: maxAmount, percent: 100 }));
    }
  }, [maxAmount]);

  return {
    state,
    setState,
    maxAmount,
    previewLiquidationPrice,
    setPercent,
    setAmount,
  };
}