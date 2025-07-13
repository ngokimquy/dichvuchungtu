const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { MongoClient } = require('mongodb');

// Lấy kết nối MongoDB từ biến môi trường
const mongoUri = process.env.MONGODB_URI;

// Trang quản trị chính: hiển thị danh sách tenants
router.get('/', auth, async (req, res) => {
  let tenants = [];
  try {
    const client = new MongoClient(mongoUri, { useUnifiedTopology: true });
    await client.connect();
    tenants = await client.db().collection('tenants').find().toArray();
    await client.close();
  } catch (err) {
    return res.send('Lỗi kết nối MongoDB: ' + err.message);
  }
  res.send(`
    <html>
      <head>
        <title>Admin Panel</title>
        <style>
          body { font-family: Arial, sans-serif; background: #f0f4f8; margin: 0; }
          .container { max-width: 800px; margin: 40px auto; background: #fff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); padding: 40px; }
          h2 { color: #2a7be4; margin-bottom: 24px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
          th, td { padding: 12px 8px; border-bottom: 1px solid #eee; text-align: left; }
          th { background: #f7f7f7; }
          .active { color: #1abc9c; font-weight: bold; }
          .inactive { color: #e74c3c; font-weight: bold; }
          .actions button { margin-right: 8px; padding: 6px 12px; border: none; border-radius: 4px; background: #2a7be4; color: #fff; cursor: pointer; }
          .actions button.inactive { background: #e74c3c; }
          form { margin-top: 32px; }
          input, select { padding: 8px; margin-right: 8px; border-radius: 4px; border: 1px solid #ccc; }
          button[type=submit] { background:#1abc9c;color:#fff;padding:8px 16px;border:none;border-radius:6px;cursor:pointer; }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>Quản lý Tenant</h2>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Tên</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              ${tenants.map(t => `
                <tr>
                  <td>${t.id}</td>
                  <td>${t.name}</td>
                  <td class="${t.active ? 'active' : 'inactive'}">${t.active ? 'Hoạt động' : 'Vô hiệu'}</td>
                  <td class="actions">
                    <button>Sửa</button>
                    <button class="inactive">${t.active ? 'Vô hiệu hóa' : 'Kích hoạt'}</button>
                    <button class="inactive">Xóa</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <form method="POST" action="/admin/add">
            <input name="id" placeholder="ID tenant" required />
            <input name="name" placeholder="Tên tenant" required />
            <select name="active">
              <option value="true">Hoạt động</option>
              <option value="false">Vô hiệu</option>
            </select>
            <button type="submit">Thêm Tenant mới</button>
          </form>
        </div>
      </body>
    </html>
  `);
});

// Xử lý thêm tenant mới
router.post('/add', auth, express.urlencoded({ extended: true }), async (req, res) => {
  const { id, name, active } = req.body;
  try {
    const client = new MongoClient(mongoUri, { useUnifiedTopology: true });
    await client.connect();
    await client.db().collection('tenants').insertOne({ id, name, active: active === 'true' });
    await client.close();
    res.redirect('/admin');
  } catch (err) {
    res.send('Lỗi khi thêm tenant: ' + err.message);
  }
});

module.exports = router;
