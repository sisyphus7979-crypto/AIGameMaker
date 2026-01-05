import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Replicate from 'replicate';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { onRequest } from "firebase-functions/v2/https";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3001;

// 1. 미들웨어 설정 및 강력한 CORS 허용
app.use(cors({
  origin: true, // 모든 Origin 허용 및 Credential 허용 설정
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Replicate 초기화 안전 장치 (API 키가 없어도 서버가 죽지 않도록 처리)
let replicate = null;
try {
  if (process.env.REPLICATE_API_TOKEN) {
    replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN });
  } else {
    console.warn("[Server] Warning: REPLICATE_API_TOKEN is missing. Running in Mock Mode only.");
  }
} catch (err) {
  console.error("[Server] Replicate init failed:", err.message);
}

// Multer 설정
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }
});

// --- API 라우트 (정적 파일 서빙보다 먼저 배치하여 404 방지) ---

app.get('/api/health', (req, res) => res.json({ status: 'ok' })); // 서버 살아있는지 확인용 라우트 추가

app.post('/api/train', (req, res) => {
  upload.array('images')(req, res, async (err) => {
    if (err) {
      // Multer 에러 (용량 초과 등) 핸들링
      console.error("[Upload Error]", err);
      return res.status(400).json({ error: err.message === 'File too large' ? 'LIMIT_EXCEEDED_SERVER' : 'UPLOAD_FAILED' });
    }

    try {
      const { modelName, triggerWord } = req.body;
      const files = req.files;
      console.log(`[API] Train Request: ${modelName}, Files: ${files?.length}`);

      if (!files || files.length === 0) {
        return res.status(400).json({ error: "No images uploaded" });
      }

      // 실제 학습 로직 연동 가능 지점 (현재는 Mock 응답 유지)
      // 만약 replicate가 있고 실제 학습을 원한다면 여기에 로직 추가

      res.json({ trainingId: "mock-id-" + Date.now(), status: "starting" });
    } catch (error) {
      console.error("[API Error]", error);
      res.status(500).json({ error: error.message });
    }
  });
});

app.post('/api/generate', async (req, res) => {
  try {
    res.json({ url: "https://via.placeholder.com/1024" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/remove-bg', async (req, res) => {
  try {
    const { image } = req.body;
    res.json({ url: image });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/train/:id', async (req, res) => {
  res.json({ status: "succeeded", version: "mock-v1" });
});

// 정의되지 않은 모든 /api 요청에 대한 명시적 404 응답 (SPA 라우팅으로 넘어가지 않게 함)
app.all('/api/*', (req, res) => {
  res.status(404).json({ error: `API route not found: ${req.method} ${req.url}` });
});

// --- 프론트엔드 배포 설정 ---
const distPath = path.resolve(__dirname, 'dist');

// dist 폴더 존재 여부 확인
if (!fs.existsSync(distPath)) {
  console.error("CRITICAL: 'dist' folder not found! Ensure 'npm run build' was successful.");
}

// 그 외의 모든 요청만 정적 파일 및 SPA 라우팅으로 처리
app.use(express.static(distPath));

app.get('*', (req, res) => {
  // /api로 시작하는 요청은 위에서 이미 처리되었으므로 여기로 오면 안 됨
  const indexPath = path.join(distPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send("Application error: Build artifacts not found.");
  }
});


// Firebase Functions로 Express 앱 내보내기
// 'api'라는 이름이 firebase.json의 function 이름과 일치해야 합니다.
export const api = onRequest({
  memory: "1GiB",      // 이미지 처리를 위해 메모리 상향
  timeoutSeconds: 300, // 학습 등 긴 작업을 위해 시간 연장
  cors: true           // CORS 허용 설정
}, app);