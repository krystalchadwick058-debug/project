import fs from "fs";

const API = "https://fapi.binance.com/fapi/v1/exchangeInfo";

async function run() {
  const res = await fetch(API);
  const data = await res.json();

  const symbols = data.symbols
    .filter(
      (s) =>
        s.contractType === "PERPETUAL" &&
        s.quoteAsset === "USDT" &&
        s.status === "TRADING"
    )
    .map((s) => ({
      symbol: s.symbol,                // BTCUSDT
      base: s.baseAsset.toLowerCase(), // btc
      quote: s.quoteAsset,
    }))
    .sort((a, b) => a.symbol.localeCompare(b.symbol));

  fs.writeFileSync(
    "./binance_perpetual_symbols.json",
    JSON.stringify(symbols, null, 2)
  );

  console.log(`✅ 已生成 ${symbols.length} 个 USDT 永续合约`);
}

run().catch(console.error);
