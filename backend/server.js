import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db.js';
import { configureCloudinary } from './config/cloudinary.js';
import routes from './routes/index.js';
import { errorHandler } from './middleware/error.middleware.js';

configureCloudinary();

const app = express();
const PORT = Number(process.env.PORT) || 5001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use(
  '/scorm-content',
  express.static(path.join(__dirname, 'uploads', 'scorm'), {
    etag: true,
    maxAge: '1h',
  })
);

app.use('/api', routes);

app.use(errorHandler);

async function bootstrap() {
  await connectDB();
  const server = app.listen(PORT, () => {
    console.log(`Server chạy tại http://localhost:${PORT}`);
  });
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(
        `Cổng ${PORT} đang được dùng (EADDRINUSE). Dừng tiến trình Node cũ hoặc đổi PORT trong .env`
      );
    }
    console.error(err);
    process.exit(1);
  });
}

bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
