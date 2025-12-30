// mock-db.js - 模拟员工数据库（开发阶段）

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

// 导出操作方法（供服务端路由使用）
module.exports = {
  getEmployees: () => employees,
  getEmployee: (username) => employees.find(e => e.username === username),
  addEmployee: (emp) => {
    if (employees.some(e => e.username === emp.username)) {
      return false;
    }
    employees.push(emp);
    return true;
  },
  updateEmployee: (username, updates) => {
    const idx = employees.findIndex(e => e.username === username);
    if (idx === -1) return false;
    employees[idx] = { ...employees[idx], ...updates };
    return true;
  },
  deleteEmployee: (username) => {
    const len = employees.length;
    employees = employees.filter(e => e.username !== username);
    return employees.length < len;
  }
};