require('dotenv').config();
const express = require('express');
const { MongoClient } = require('mongodb');
const Minio = require('minio');
const adminRouter = require('./routes/admin');

const app = express();
const port = process.env.PORT || 3000;

async function checkMongoDB() {
  try {
    const client = new MongoClient(process.env.MONGODB_URI, { useUnifiedTopology: true });
    await client.connect();
    await client.db().admin().ping();
    await client.close();
    return 'MongoDB: Kết nối tahihihihành công';
  } catch (err) {
    return 'MongoDB: Kết nối thất bại - ' + err.message;
  }
}

async function checkMinIO() {
  try {
    const minioClient = new Minio.Client({
      endPoint: process.env.MINIO_ENDPOINT,
      port: parseInt(process.env.MINIO_PORT, 10),
      useSSL: process.env.MINIO_USE_SSL === 'true',
      accessKey: process.env.MINIO_ACCESS_KEY,
      secretKey: process.env.MINIO_SECRET_KEY,
    });
    await minioClient.listBuckets();
    return 'MinIO: Kết nối thành công';
  } catch (err) {
    return 'MinIO: Kết nối thất bại - ' + err.message;
  }
}

// Middleware lấy subdomain
function getSubdomain(req) {
  const host = req.headers.host;
  if (!host) return null;
  const parts = host.split('.');
  if (parts.length < 3) return null; // ví dụ: congty1.yourdomain.com
  return parts[0];
}

// Danh sách tenant mẫu
const tenants = {
  tenant1: { name: 'Công ty Kim Cương 1' },
  tenant2: { name: 'Công ty Kim Cương 2' },
  default: { name: 'Trang chủ Kim Cương Xanh' }
};

// Trang chủ cho tenant
app.get('/', async (req, res) => {
  const subdomain = getSubdomain(req) || 'default';
  const tenant = tenants[subdomain] || tenants['default'];
  console.log(`Truy cập tenant: ${subdomain} - ${tenant.name}`);
  res.send(`
    <html>
      <head>
        <title>Welcome ${tenant.name}</title>
        <style>
          body { font-family: Arial, sans-serif; background: #f0f4f8; margin: 0; padding: 0; }
          .container { max-width: 500px; margin: 80px auto; background: #fff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); padding: 40px; text-align: center; }
          h1 { color: #2a7be4; margin-bottom: 16px; }
          .subdomain { font-size: 1.5em; color: #1abc9c; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Welcome!</h1>
          <div>Chào mừng bạn đến với website của:</div>
          <div class="subdomain">${tenant.name}</div>
          <div style="margin-top:24px; color:#888;">Subdomain: ${subdomain}.kimcuongxanh.com</div>
        </div>
      </body>
    </html>
  `);
});

// Route admin
app.use('/admin', adminRouter);

app.listen(port, () => {
  console.log(`Server đang chạy tại http://localhost:${port}`);
});