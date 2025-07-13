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

// Trang chủ cho tenant
app.get('/', async (req, res) => {
  const subdomain = getSubdomain(req) || 'default';
  const mongoStatus = await checkMongoDB();
  const minioStatus = await checkMinIO();
  res.send(`
    <html>
      <head><title>Kết nối dịch vụ</title></head>
      <body style="font-family: Arial; margin: 40px;">
        <h2>Chào mừng bạn đến với trang của <span style="color:blue">${subdomain}</span></h2>
        <h3>Kết quả kiểm tra kết nối</h3>
        <ul>
          <li>${mongoStatus}</li>
          <li>${minioStatus}</li>
        </ul>
      </body>
    </html>
  `);
});

// Route admin
app.use('/admin', adminRouter);

app.listen(port, () => {
  console.log(`Server đang chạy tại http://localhost:${port}`);
});