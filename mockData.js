// 模拟交易对列表
export const symbols = [
  { symbol: 'BTC/USDT', base: 'BTC', quote: 'USDT' },
  { symbol: 'ETH/USDT', base: 'ETH', quote: 'USDT' },
  { symbol: 'SOL/USDT', base: 'SOL', quote: 'USDT' },
  { symbol: 'XRP/USDT', base: 'XRP', quote: 'USDT' },
  { symbol: 'DOGE/USDT', base: 'DOGE', quote: 'USDT' },
];

// 初始价格（用于模拟跳动）
export const initialPrices = {
  'BTC/USDT': 62000,
  'ETH/USDT': 3400,
  'SOL/USDT': 170,
  'XRP/USDT': 0.52,
  'DOGE/USDT': 0.15,
};

// 模拟持仓
export const mockPositions = [
  { symbol: 'BTC/USDT', size: 0.5, entryPrice: 60000, markPrice: 62000, pnl: 1000, side: 'LONG' },
  { symbol: 'ETH/USDT', size: 2.0, entryPrice: 3300, markPrice: 3400, pnl: 200, side: 'LONG' },
];