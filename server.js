// server.js - 统一后端服务（员工账号系统 + 币安双价格代理）

const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3001;

let employees = [
  {
    username: 'demo',
    name: '演示员工',
    password: '123456',
    hireDate: '2024-01-01',
    status: '在职',
    linked: true,
    direction: '正',
    limitU: 5000
  }
];

let orders = [];

// 强平价计算函数（与币安一致）
function getMaintenanceMarginRate(notional) {
  if (notional <= 50000) return 0.004;
  if (notional <= 250000) return 0.005;
  if (notional <= 1000000) return 0.01;
  return 0.025;
}

function calculateLiquidationPrice(side, entryPrice, leverage, size) {
  const notional = entryPrice * size;
  const mmr = getMaintenanceMarginRate(notional);
  if (side === 'LONG') {
    return entryPrice * (1 - 1 / leverage + mmr);
  } else {
    return entryPrice * (1 + 1 / leverage - mmr);
  }
}

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ======================
// 行情代理 1：获取最新成交价（Last Price）- 用于下单/平仓委托价格
// ======================
app.get('/api/price/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const cleanSymbol = symbol.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    
    if (!cleanSymbol) {
      return res.status(400).json({ error: 'Invalid symbol format' });
    }

    // ✅ 使用 ticker/price 获取 Last Price（币安下单默认价）
    const url = `https://fapi.binance.com/fapi/v1/ticker/price?symbol=${cleanSymbol}`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`Binance ticker/price API returned ${response.status}`);
    }

    const data = await response.json();
    const lastPrice = parseFloat(data.price);
    
    if (isNaN(lastPrice) || lastPrice <= 0) {
      throw new Error('Invalid lastPrice from Binance');
    }

    res.json({ price: lastPrice });
  } catch (err) {
    console.error('获取币安 Last Price 失败:', err.message);
    res.status(500).json({ error: 'Failed to fetch Binance Last Price' });
  }
});

// ======================
// 行情代理 2：获取标记价格（Mark Price）- 用于强平、盈亏计算
// ======================
app.get('/api/mark-price/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const cleanSymbol = symbol.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    
    if (!cleanSymbol) {
      return res.status(400).json({ error: 'Invalid symbol format' });
    }

    // ✅ 使用 premiumIndex 获取 Mark Price（币安强平/盈亏依据）
    const url = `https://fapi.binance.com/fapi/v1/premiumIndex?symbol=${cleanSymbol}`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`Binance premiumIndex API returned ${response.status}`);
    }

    const data = await response.json();
    const markPrice = parseFloat(data.markPrice);
    
    if (isNaN(markPrice) || markPrice <= 0) {
      throw new Error('Invalid markPrice from Binance');
    }

    res.json({ price: markPrice });
  } catch (err) {
    console.error('获取币安 Mark Price 失败:', err.message);
    res.status(500).json({ error: 'Failed to fetch Binance Mark Price' });
  }
});

// ======================
// 行情代理 3：平仓时专用价格（Last Price）- 与下单一致
// ======================
app.get('/api/close-price/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const cleanSymbol = symbol.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    
    if (!cleanSymbol) {
      return res.status(400).json({ error: 'Invalid symbol format' });
    }

    const url = `https://fapi.binance.com/fapi/v1/ticker/price?symbol=${cleanSymbol}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Binance close-price API error: ${response.status}`);
    }

    const data = await response.json();
    const lastPrice = parseFloat(data.price);
    if (isNaN(lastPrice) || lastPrice <= 0) {
      throw new Error('Invalid lastPrice');
    }

    res.json({ price: lastPrice });
  } catch (err) {
    console.error('平仓价格获取失败:', err.message);
    res.status(500).json({ error: 'Failed to fetch close price' });
  }
});

// ...（其余代码完全不变：员工系统、订单、强平计算等）

// ======================
// 工具函数、员工登录、订单提交、管理 API 等保持原样
// ======================

function getBeijingTodayStartUTC() {
  const now = new Date();
  const beijingNow = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Shanghai" }));
  beijingNow.setHours(0, 0, 0, 0);
  return beijingNow.getTime() - (8 * 3600 * 1000);
}

// ======================
// 员工登录
// ======================
app.post('/internal/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: '账号和密码不能为空' });
  }

  const emp = employees.find(e => e.username === username);
  if (!emp) return res.status(401).json({ error: '账号不存在' });
  if (emp.password !== password) return res.status(401).json({ error: '密码错误' });
  if (emp.status !== '在职' && emp.status !== '试用期') {
    return res.status(403).json({ error: '账号状态异常，无法登录' });
  }

  res.json({ 
    success: true, 
    user: { 
      username: emp.username, 
      name: emp.name,
      limitU: emp.limitU,
      direction: emp.direction,
      linked: emp.linked
    } 
  });
});

// ======================
// 员工提交订单（校验 limitU + 返回真实仓位）
// ======================
app.post('/orders', (req, res) => {
  const { username, symbol, side, price, quantity, leverage, timestamp } = req.body;

  if (!username || !symbol || !side || price == null || quantity == null || leverage == null) {
    return res.status(400).json({ error: '订单参数不完整' });
  }

  const emp = employees.find(e => e.username === username);
  if (!emp || (emp.status !== '在职' && emp.status !== '试用期')) {
    return res.status(403).json({ error: '无权下单' });
  }

  const notional = price * quantity;
  const requiredMargin = notional / leverage;

  if (requiredMargin > emp.limitU) {
    return res.status(400).json({ 
      error: `保证金不足：可用 ${emp.limitU}U，需求 ${requiredMargin.toFixed(2)}U`
    });
  }

  const liquidationPrice = calculateLiquidationPrice(side, price, leverage, quantity);
  const margin = requiredMargin;

  const orderRecord = {
    username,
    symbol,
    side,
    price,
    quantity,
    leverage,
    timestamp: timestamp || Date.now()
  };
  orders.push(orderRecord);

  const position = {
    id: Date.now(),
    symbol,
    side,
    entryPrice: price,
    size: quantity,
    leverage,
    liquidationPrice: parseFloat(liquidationPrice.toFixed(2)),
    margin: parseFloat(margin.toFixed(2)),
    pnl: 0,
    pnlRate: 0,
    currentPrice: price,
    timestamp: orderRecord.timestamp,
    username
  };

  res.json({ success: true, position });
});

// ======================
// 管理端：获取订单（按北京时间分组）
// ======================
app.get('/internal/admin/orders', (req, res) => {
  const { username } = req.query;
  let userOrders = orders;
  if (username) {
    userOrders = orders.filter(o => o.username === username);
  }

  const todayStartUTC = getBeijingTodayStartUTC();
  const today = userOrders.filter(o => o.timestamp >= todayStartUTC);
  const history = userOrders.filter(o => o.timestamp < todayStartUTC);

  today.sort((a, b) => b.timestamp - a.timestamp);
  history.sort((a, b) => b.timestamp - a.timestamp);

  res.json({ today, history });
});

// ======================
// 员工管理 API
// ======================
app.get('/internal/admin/employees', (req, res) => {
  res.json(employees);
});

app.post('/internal/admin/employees', (req, res) => {
  const { username, name, password, hireDate, status } = req.body;
  if (!username || !name || !password || !hireDate || !status) {
    return res.status(400).json({ error: '所有字段必填' });
  }
  if (employees.some(e => e.username === username)) {
    return res.status(409).json({ error: '员工账户已存在' });
  }

  employees.push({
    username,
    name,
    password,
    hireDate,
    status,
    linked: true,
    direction: '正',
    limitU: 0
  });

  res.status(201).json({ success: true });
});

app.put('/internal/admin/employees/:username', (req, res) => {
  const { username } = req.params;
  const updates = req.body;
  const idx = employees.findIndex(e => e.username === username);
  if (idx === -1) return res.status(404).json({ error: '员工不存在' });

  employees[idx] = { ...employees[idx], ...updates };
  res.json({ success: true });
});

app.delete('/internal/admin/employees/:username', (req, res) => {
  const { username } = req.params;
  const len = employees.length;
  employees = employees.filter(e => e.username !== username);
  orders = orders.filter(o => o.username !== username);
  if (employees.length === len) {
    return res.status(404).json({ error: '员工不存在' });
  }
  res.json({ success: true });
});

app.patch('/internal/admin/employees/:username/config', (req, res) => {
  const { username } = req.params;
  const { direction, limitU, linked } = req.body;
  const emp = employees.find(e => e.username === username);
  if (!emp) return res.status(404).json({ error: '员工不存在' });

  if (direction !== undefined) emp.direction = direction;
  if (limitU !== undefined) emp.limitU = limitU;
  if (linked !== undefined) emp.linked = linked;

  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`✅ 后端运行: http://localhost:${PORT}`);
  console.log(`- 下单价格源: 币安 Last Price (ticker/price)`);
  console.log(`- 强平/盈亏价格源: 币安 Mark Price (premiumIndex)`);
  console.log(`- 平仓价格源: 币安 Last Price (ticker/price)`);
  console.log(`- 管理端: http://localhost:${PORT}/admin.html`);
});