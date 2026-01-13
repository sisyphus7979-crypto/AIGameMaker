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
  // Firebase Functions 환경 변수에서 직접 가져오거나, 
  // 사용자님이 등록한 replicate.key를 시스템 환경변수로 연결해야 합니다.
  const REPLICATE_TOKEN = process.env.REPLICATE_API_TOKEN || "r8_D21odOesSY9lkKGksxAcQH8m6dlvOwh1aCffv"; // 직접 주입하여 확실하게 작동 보장

  if (REPLICATE_TOKEN) {
    replicate = new Replicate({ auth: REPLICATE_TOKEN });
    console.log("[Server] Replicate initialized successfully.");
  } else {
    console.warn("[Server] Warning: REPLICATE_API_TOKEN is missing.");
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
  if (!replicate) {
    console.error("[API Error] Replicate not initialized. Check REPLICATE_API_TOKEN.");
    return res.status(500).json({ error: "Image generation service is not configured on the server." });
  }

  try {
    const { prompt, style } = req.body;

    let modelId = '';
    let input = {
      prompt: prompt,
      width: 512,
      height: 640,
    };

    if (style.startsWith('custom_')) {
      const [version, trigger] = style.replace('custom_', '').split('|');
      modelId = version;
      input.prompt = `${trigger}, ${prompt}`;
    } else {
      switch (style) {
        case 'anime_v1':
          modelId = 'cagliostrolab/animagine-xl-3.0:54907958f2c375631b1ba4192b950666060d5a37330c6c21e3f7c3270923f545';
          input.prompt = `${prompt}, anime artwork, anime style, key visual, vibrant, studio anime, highly detailed`;
          input.negative_prompt = 'low quality, normal quality, lowres, polar lowres, bad anatomy, bad hands, text, error, missing fingers, extra digit, fewer digits, cropped, worst quality, jpeg artifacts, signature, watermark, username, blurry';
          break;
        case 'pixel_art':
          modelId = 'nerdyrodent/dreamlike-pixelart-diffusion-v1-0:df73919e996d19c356f7036495b642a66e07a6110e5d0343a850125868f02919';
          input.prompt = `pixelart, ${prompt}`;
          break;
        case 'realistic':
          modelId = 'stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b';
          input.prompt = `photorealistic, ${prompt}, 8k, highly detailed, sharp focus`;
          break;
        case 'watercolor':
          modelId = 'tst/watercolor:36d1733649633e6f5412f1702f37e4465de8f4604a43b7642f654b684877e8a9';
          input.prompt = `${prompt}, watercolor painting`;
          break;
        case 'fantasy_rpg':
          modelId = 'stablediffusionapi/dark-fantasy-gothic:b71a4f28030c6a5af58bba819e9171f65349e5480746f3647413d0c9f1604085';
          input.prompt = `${prompt}, dark fantasy, gothic, detailed, intricate`;
          break;
        default:
          modelId = 'stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b';
      }
    }
    
    console.log(`[API Generate] Running model ${modelId} with prompt: "${input.prompt}"`);
    const output = await replicate.run(modelId, { input });

    if (!output || !Array.isArray(output) || output.length === 0) {
      throw new Error("Replicate API did not return a valid image.");
    }
    
    res.json({ url: output[0] });
  } catch (error) {
    console.error("[API Error /api/generate]", error);
    res.status(500).json({ error: error.message || "Failed to generate image." });
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
