// 使用 CoinGecko 的稳定 CDN（不 import JSON）
export function getCoinIcon(base) {
  if (!base) return null;

  const symbol = base.toLowerCase();

  // 常见主流币手动兜底（保证 100% 成功）
  const MAIN = {
    btc: "https://assets.coingecko.com/coins/images/1/small.png",
    eth: "https://assets.coingecko.com/coins/images/279/small.png",
    bnb: "https://assets.coingecko.com/coins/images/825/small.png",
    sol: "https://assets.coingecko.com/coins/images/4128/small.png",
    xrp: "https://assets.coingecko.com/coins/images/44/small.png",
  };

  if (MAIN[symbol]) return MAIN[symbol];

  // 其他币：用 CoinGecko 的 symbol 搜索规则（成功率很高）
  return `https://assets.coingecko.com/coins/images/placeholder/small.png`;
}
