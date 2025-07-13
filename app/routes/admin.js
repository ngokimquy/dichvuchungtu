const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// Giả lập danh sách tenant
let tenants = [
  { id: 'congty1', name: 'Công ty 1', active: true },
  { id: 'congty2', name: 'Công ty 2', active: true }
];

// Trang quản trị chính
router.get('/', auth, (req, res) => {
  res.send(`
    <html>
      <head><title>Admin Panel</title></head>
      <body style="font-family: Arial; margin: 40px;">
        <h2>Quản lý Tenant</h2>
        <ul>
          ${tenants.map(t => `<li>${t.name} (${t.id}) - ${t.active ? 'Hoạt động' : 'Vô hiệu'}</li>`).join('')}
        </ul>
        <p>(Chức năng thêm/sửa/xóa/kích hoạt sẽ bổ sung sau)</p>
      </body>
    </html>
  `);
});

module.exports = router;
