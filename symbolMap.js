// src/utils/symbolMap.js
export function buildSymbolMap(coins) {
  const map = {};

  for (const c of coins) {
    const sym = c.symbol.toUpperCase();
    const img = c.image; // ✅ 使用 image 字段
    if (img && !map[sym]) map[sym] = img;
  }

  // ===== 币安合约特殊币种补丁 =====
  map["1000PEPE"] = map["PEPE"];
  map["1000SHIB"] = map["SHIB"];
  map["LUNA2"] = map["LUNA"] || map["TERRA"];
  map["ETHW"] = map["ETH"];
  map["BCHSV"] = map["BSV"];
  map["BTCDOM"] = map["BTC"];

  return map;
}
