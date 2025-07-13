require('dotenv').config();
const express = require('express');
const { MongoClient } = require('mongodb');
const Minio = require('minio');

const app = express();
const port = process.env.PORT || 3000;

async function checkMongoDB() {
  try {
    const client = new MongoClient(process.env.MONGODB_URI, { useUnifiedTopology: true });
    await client.connect();
    await client.db().admin().ping();
    await client.close();
    return 'MongoDB: Kết nối thành công';
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

app.get('/', async (req, res) => {
  const mongoStatus = await checkMongoDB();
  const minioStatus = await checkMinIO();
  res.send(`
    <html>
      <head><title>Kết nối dịch vụ</title></head>
      <body style="font-family: Arial; margin: 40px;">
        <h2>Kết quả kiểm tra kết nối</h2>
        <ul>
          <li>${mongoStatus}</li>
          <li>${minioStatus}</li>
        </ul>
      </body>
    </html>
  `);
});

app.listen(port, () => {
  console.log(`Server đang chạy tại http://localhost:${port}`);
});