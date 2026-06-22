# Plano Técnico: Integração OpenShorts → Unoduno

**Documento:** Arquitetura técnica, stacks, implementação  
**Público:** Tech Lead, Backend/Frontend/DevOps Engineers  
**Data:** 2026-06-22

---

## 1. Arquitetura Sistema

### 1.1 Visão Geral (High-Level)

```
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND (Vercel)                      │
│  Next.js 16 + React 19 + Tailwind CSS + Framer Motion     │
│  - Landing page (existente)                                │
│  - Dashboard (existente: analyze, transcrever, etc)       │
│  - NEW: Clip Generator UI                                 │
│  - NEW: AI Shorts Wizard                                  │
│  - NEW: YouTube Studio                                    │
└──────────────────┬──────────────────────────────────────────┘
                   │ HTTPS/WebSocket
        ┌──────────▼──────────┐
        │  ORCHESTRATION API  │
        │  (Next.js Handlers) │
        │  - Auth (Clerk)     │
        │  - Job management   │
        │  - Rate limiting    │
        └──────────┬──────────┘
    ┌───────────────┼───────────────┐
    │               │               │
    │      Sync     │     Async     │
    │   (< 5sec)    │   (> 5sec)    │
    │               │               │
    ▼               ▼               ▼
  YouTube    Job Queue        Processing
   API      (Supabase)        Backend
 (Fast)     (Bull/Celery)    (Python)
           
   └─────────┬─────────┬─────────┘
             │         │
   ┌─────────▼─────────▼──────────┐
   │   DATA LAYER (Supabase)      │
   │ - Users, projects, jobs      │
   │ - Metrics, analytics         │
   └──────────┬────────────────────┘
              │
   ┌──────────▼──────────┐
   │  STORAGE (S3)       │
   │ - Clips (private)   │
   │ - Gallery (public)  │
   │ - Avatars           │
   └─────────────────────┘
```

### 1.2 Componentes Detalhados

#### A. Frontend (Vercel - Existente + New)

**Stack:**
```typescript
// package.json
{
  "dependencies": {
    "next": "16",
    "react": "19",
    "@vercel/analytics": "1.6.1",
    "@clerk/nextjs": "6.12.0",
    "framer-motion": "12.40.0",
    "zustand": "^4.x", // NEW - state management para jobs
    "swr": "^2.x", // NEW - polling status jobs
    // ... existing
  }
}
```

**Diretórios Novos:**
```
app/dashboard/
├─ video-generator/          [NEW]
│  ├─ clip/
│  │  ├─ page.tsx            (Upload + Gallery)
│  │  ├─ [jobId]/            (Job details + Preview)
│  │  └─ components/
│  │     ├─ UploadZone.tsx
│  │     ├─ ClipGallery.tsx
│  │     └─ JobMonitor.tsx
│  ├─ ai-shorts/             [NEW]
│  │  ├─ page.tsx            (Wizard steps)
│  │  ├─ [jobId]/            (Results)
│  │  └─ components/
│  │     ├─ WizardStep1.tsx
│  │     ├─ WizardStep2.tsx
│  │     └─ ResultsView.tsx
│  └─ youtube-studio/        [NEW]
│     ├─ page.tsx
│     └─ components/
│        ├─ ThumbnailGen.tsx
│        └─ TitleSuggestions.tsx
```

#### B. API Layer (Next.js Server Actions)

**Endpoints Novos:**
```typescript
// app/api/videos/
POST   /api/videos/clip/upload         (multer + file validation)
GET    /api/videos/clip/status/:jobId  (real-time status)
POST   /api/videos/ai-shorts           (start generation)
GET    /api/videos/gallery             (list user clips)
POST   /api/videos/publish             (social distribution)

// app/api/admin/
GET    /api/admin/jobs                 (monitoring)
POST   /api/admin/jobs/:id/cancel      (stop processing)
```

**Middleware:**
```typescript
// middleware.ts - Rate limiting + auth
export const middleware = async (req: NextRequest) => {
  // Auth check
  const user = await auth();
  
  // Rate limiting per endpoint
  const limit = {
    '/api/videos/clip/upload': 5,      // 5 clips/day
    '/api/videos/ai-shorts': 2,        // 2 AI shorts/day
  };
  
  // Check credits
  const credits = await db.query.credits
    .findFirst({ where: eq(users.id, user.id) });
  
  if (credits.balance < estimatedCost) {
    return NextResponse.json({ error: 'Insufficient credits' }, 
      { status: 402 });
  }
};
```

#### C. Processing Backend (Python FastAPI)

**Stack & Container:**
```dockerfile
FROM python:3.11-slim

# System dependencies
RUN apt-get update && apt-get install -y \
    ffmpeg \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgomp1

# Python packages
COPY requirements.txt .
RUN pip install -r requirements.txt

# App
COPY . /app
WORKDIR /app

# Non-root user
RUN useradd -m appuser
USER appuser

CMD ["python", "-m", "uvicorn", "main:app", \
     "--host", "0.0.0.0", "--port", "8000", \
     "--workers", "4"]
```

**requirements.txt:**
```
fastapi==0.115.0
uvicorn==0.32.0
pydantic==2.8.0
google-genai==0.9.0
faster-whisper==1.0.3
opencv-python==4.11.0.86
mediapipe==0.10.17
ultralytics==8.3.51
pyscenedetect==0.7
ffmpeg-python==0.2.1
pillow==11.2.0
httpx==0.28.1
boto3==1.36.45
pydantic-settings==2.5.0
```

**Estrutura:**
```
backend/
├─ main.py                    (FastAPI app)
├─ config.py                  (Environment config)
├─ models/
│  ├─ __init__.py
│  ├─ clip.py                (Clip schemas)
│  ├─ job.py                 (Job tracking)
│  └─ video.py               (Video models)
├─ services/
│  ├─ __init__.py
│  ├─ transcription.py       (Whisper)
│  ├─ scene_detection.py     (PySceneDetect)
│  ├─ analysis.py            (Gemini API)
│  ├─ video_processing.py    (FFmpeg)
│  ├─ cropping.py            (9:16 reframing)
│  ├─ subtitles.py           (ASS generation)
│  └─ storage.py             (S3 upload)
├─ api/
│  ├─ __init__.py
│  ├─ health.py              (GET /health)
│  ├─ clips.py               (POST /clips/analyze)
│  ├─ jobs.py                (GET /jobs/:id)
│  └─ webhooks.py            (Supabase events)
├─ utils/
│  ├─ __init__.py
│  ├─ logger.py
│  ├─ errors.py
│  └─ decorators.py
├─ Dockerfile
├─ docker-compose.yml
├─ requirements.txt
└─ tests/
```

#### D. Job Queue (Celery + Redis)

**Setup:**
```python
# backend/celery_config.py
from celery import Celery

app = Celery(
    'unoduno',
    broker='redis://redis:6379/0',
    backend='redis://redis:6379/1',
    include=[
        'backend.tasks.clip_generation',
        'backend.tasks.ai_shorts',
        'backend.tasks.youtube_studio',
    ]
)

# Task configuration
app.conf.update(
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='UTC',
    enable_utc=True,
    task_track_started=True,
    task_time_limit=30 * 60,  # 30 minutes max
    task_soft_time_limit=25 * 60,  # 25 minutes warning
)
```

**Tasks:**
```python
# backend/tasks/clip_generation.py
from celery import shared_task
from .services import transcribe, analyze, extract_clips

@shared_task(bind=True, max_retries=3)
def process_clip_generation(self, job_id: str):
    try:
        job = fetch_job(job_id)
        
        # Step 1: Transcribe
        job.update_status('transcribing')
        transcript = transcribe(job.video_path)
        
        # Step 2: Analyze moments
        job.update_status('analyzing')
        moments = analyze(transcript)
        
        # Step 3: Extract clips
        job.update_status('extracting')
        clips = extract_clips(job.video_path, moments)
        
        # Step 4: Generate subtitles
        job.update_status('subtitling')
        for clip in clips:
            generate_subtitles(clip)
        
        # Step 5: Upload to S3
        job.update_status('uploading')
        for clip in clips:
            upload_s3(clip)
        
        job.update_status('completed')
        notify_user(job.user_id, f"Clips ready!")
        
    except Exception as exc:
        job.update_status('failed', error=str(exc))
        self.retry(exc=exc, countdown=60)
```

#### E. Database (Supabase PostgreSQL)

**Schema Novo:**
```sql
-- Video jobs table
CREATE TABLE jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    job_type ENUM('clip_generation', 'ai_shorts', 'youtube_studio') NOT NULL,
    status ENUM('pending', 'processing', 'completed', 'failed', 'cancelled') NOT NULL,
    input_data JSONB NOT NULL,
    output_data JSONB,
    error_message TEXT,
    estimated_cost DECIMAL(10, 4),
    actual_cost DECIMAL(10, 4),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP,
    INDEX idx_user_created (user_id, created_at DESC),
    INDEX idx_status_user (status, user_id)
);

-- Clips table
CREATE TABLE clips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT,
    description TEXT,
    thumbnail_url TEXT,
    video_url TEXT NOT NULL,
    duration INTEGER, -- seconds
    width INTEGER,
    height INTEGER,
    format TEXT DEFAULT 'mp4',
    file_size BIGINT,
    views INTEGER DEFAULT 0,
    shares INTEGER DEFAULT 0,
    is_public BOOLEAN DEFAULT FALSE,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    INDEX idx_user_created (user_id, created_at DESC),
    INDEX idx_public (is_public, created_at DESC)
);

-- AI Shorts generations
CREATE TABLE ai_shorts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_url TEXT,
    product_description TEXT,
    script TEXT,
    actor_prompt TEXT,
    actor_image_url TEXT,
    video_url TEXT NOT NULL,
    voiceover_language ENUM('en', 'es') DEFAULT 'en',
    voiceover_voice ENUM('male', 'female') DEFAULT 'male',
    quality ENUM('low_cost', 'premium') DEFAULT 'low_cost',
    cost DECIMAL(10, 4),
    social_published_to JSONB, -- { "tiktok": true, "instagram": true }
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    INDEX idx_user_created (user_id, created_at DESC)
);

-- Social publishing history
CREATE TABLE social_publishes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    video_id UUID, -- references clips or ai_shorts
    platform ENUM('tiktok', 'instagram', 'youtube') NOT NULL,
    post_id TEXT,
    post_url TEXT,
    scheduled_for TIMESTAMP,
    published_at TIMESTAMP,
    status ENUM('scheduled', 'published', 'failed') NOT NULL,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    INDEX idx_user_platform_created (user_id, platform, created_at DESC)
);

-- Usage tracking
CREATE TABLE usage_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    job_id UUID REFERENCES jobs(id),
    action ENUM('upload', 'analyze', 'generate', 'publish') NOT NULL,
    cost DECIMAL(10, 4),
    created_at TIMESTAMP DEFAULT NOW(),
    INDEX idx_user_date (user_id, created_at DESC)
);
```

#### F. Storage (AWS S3)

**Buckets:**
```
unoduno-videos-prod/
├─ /clips/                        (Private - users' generated clips)
│  ├─ {user_id}/
│  │  ├─ {job_id}/
│  │  │  ├─ clip_1.mp4
│  │  │  ├─ clip_1_thumb.jpg
│  │  │  ├─ metadata.json
│  │  │  └─ subtitles.vtt
│  │  └─ ...
├─ /ai-shorts/                    (Private - AI generated videos)
│  └─ {user_id}/{job_id}/
├─ /gallery/                      (Public - gallery display)
│  ├─ videos/
│  ├─ avatars/
│  └─ index.html                 (SEO page)
└─ /uploads/                      (Temp - user uploads, auto-purge 24h)
```

**S3 Policy:**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::unoduno-videos-prod/gallery/*"
    },
    {
      "Effect": "Allow",
      "Principal": {"AWS": "arn:aws:iam::123456789:root"},
      "Action": ["s3:*"],
      "Resource": "arn:aws:s3:::unoduno-videos-prod/*"
    }
  ]
}
```

---

## 2. Fluxos de Dados (Data Flow)

### 2.1 Clip Generation Flow

```
USER UPLOAD
    ↓
┌─────────────────────────────────────────────────────────┐
│ 1. VALIDATION (Next.js)                                 │
│    - File format check (video only)                     │
│    - File size check (< 2GB)                            │
│    - Upload to S3 /uploads/                             │
└─────────────────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────────────────┐
│ 2. JOB CREATION (Next.js → Supabase)                   │
│    - Create job record (status: pending)               │
│    - Calculate estimated cost                           │
│    - Deduct credits (or queue if insufficient)          │
│    - Return jobId to frontend                           │
└─────────────────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────────────────┐
│ 3. ASYNC PROCESSING (Celery Task)                      │
│    a) Transcription                                     │
│       - Download S3 video                               │
│       - Run Whisper                                     │
│       - Save timestamps + text                          │
│    b) Scene Detection                                   │
│       - PySceneDetect on video                          │
│       - Identify scene boundaries                       │
│    c) Viral Analysis (Gemini)                           │
│       - Send transcript + scenes → Gemini              │
│       - Get 3-15 viral moments (time ranges)           │
│    d) Clip Extraction                                   │
│       - FFmpeg extract clips                            │
│       - 9:16 reframing (face tracking)                 │
│       - Add subtitles (ASS format)                      │
│    e) Upload Results                                    │
│       - Save to S3 /clips/{user_id}/                   │
│       - Update DB (clips table)                         │
│    f) Completion                                        │
│       - Update job status: completed                    │
│       - Calculate actual cost                           │
│       - Trigger webhook to frontend                     │
└─────────────────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────────────────┐
│ 4. FRONTEND POLLING (React SWR)                         │
│    - Every 2 seconds: GET /api/videos/status/:jobId    │
│    - Update progress bar                                │
│    - Show clips as they complete                        │
│    - Allow download/preview                             │
│    - Option to publish (Upload-Post)                    │
└─────────────────────────────────────────────────────────┘
```

### 2.2 AI Shorts Flow

```
PRODUCT URL OR DESCRIPTION
    ↓
┌─────────────────────────────────────────────────────────┐
│ 1. INPUT ANALYSIS (Gemini)                              │
│    - Web scraping if URL                                │
│    - Research product benefits                          │
│    - Market positioning                                 │
│    - Target audience                                    │
└─────────────────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────────────────┐
│ 2. SCRIPT GENERATION (Gemini)                           │
│    - Hook (3 sec)                                       │
│    - Problem (10 sec)                                   │
│    - Solution (15 sec)                                  │
│    - CTA (5 sec)                                        │
│    - Format for TikTok/Reels                            │
└─────────────────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────────────────┐
│ 3. ACTOR GENERATION (Flux 2 Pro)                        │
│    - Generate portrait from prompt                      │
│    - Or use existing avatar                             │
│    - Save to gallery                                    │
└─────────────────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────────────────┐
│ 4. VOICEOVER (ElevenLabs)                               │
│    - TTS from script                                    │
│    - Language: EN/ES                                    │
│    - Voice: Male/Female                                 │
│    - Save WAV file                                      │
└─────────────────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────────────────┐
│ 5. VIDEO SYNTHESIS                                       │
│    LOW COST:  Hailuo 2.3 Fast + VEED Lipsync          │
│    PREMIUM:   Kling Avatar v2                           │
│    - Generate talking head video                        │
│    - Lip-sync with voiceover                            │
│    - Duration: 30-60 sec                                │
└─────────────────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────────────────┐
│ 6. B-ROLL GENERATION (Flux)                             │
│    - Generate 3-5 images from script                    │
│    - Apply Ken Burns effect                             │
│    - Add transitions                                    │
└─────────────────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────────────────┐
│ 7. COMPOSITION (FFmpeg)                                 │
│    - Main video (talking head)                          │
│    - B-roll overlay                                     │
│    - Voiceover audio                                    │
│    - Hook text overlay                                  │
│    - Add subtitles (ASS)                                │
│    - Output: 1080x1920 (9:16)                           │
│    - Format: MP4 H.264                                  │
└─────────────────────────────────────────────────────────┘
    ↓
┌─────────────────────────────────────────────────────────┐
│ 8. UPLOAD + GALLERY                                     │
│    - Save to S3 /ai-shorts/                            │
│    - Create SEO gallery page                            │
│    - Generate thumbnail                                 │
│    - Index in search                                    │
└─────────────────────────────────────────────────────────┘
```

---

## 3. Implementação Step-by-Step

### Phase 1: Setup Infraestrutura (Week 1)

```bash
# 1. Create AWS resources
aws ec2 create-instance --instance-type t3.xlarge \
  --image-id ami-0c55b159cbfafe1f0 \
  --key-name unoduno-prod

# 2. Setup Docker + Docker Compose
scp docker-compose.yml root@processing-server:/opt/unoduno/
ssh root@processing-server "cd /opt/unoduno && docker-compose up -d"

# 3. Setup Supabase tables
supabase push  # Apply migrations

# 4. Create S3 buckets
aws s3 mb s3://unoduno-videos-prod
aws s3api put-bucket-versioning \
  --bucket unoduno-videos-prod \
  --versioning-configuration Status=Enabled

# 5. Setup Redis
docker run -d -p 6379:6379 redis:7-alpine

# 6. Setup env variables
cat > .env.processing << EOF
GEMINI_API_KEY=xxx
FAL_KEY=xxx
ELEVENLABS_KEY=xxx
AWS_ACCESS_KEY_ID=xxx
AWS_SECRET_ACCESS_KEY=xxx
SUPABASE_URL=xxx
SUPABASE_SERVICE_KEY=xxx
EOF
```

### Phase 2: Backend Implementation (Weeks 2-3)

```bash
# File structure
mkdir -p backend/{services,api,tasks,utils,tests}

# Core services
touch backend/services/{transcription,scene_detection,analysis,video_processing}.py
touch backend/api/{health,clips,jobs,webhooks}.py
touch backend/tasks/{clip_generation,ai_shorts}.py

# Tests
touch backend/tests/{test_transcription,test_video_processing}.py

# Deploy to server
docker-compose build --no-cache
docker-compose up -d
```

### Phase 3: Frontend Components (Week 4)

```typescript
// New components
// app/dashboard/video-generator/clip/components/UploadZone.tsx
// app/dashboard/video-generator/clip/components/JobMonitor.tsx
// app/dashboard/video-generator/ai-shorts/components/WizardStep1.tsx

// API handlers
// app/api/videos/clip/upload.ts
// app/api/videos/clip/status/[jobId].ts
// app/api/videos/publish.ts
```

---

## 4. Deployment & Monitoring

### Docker Compose Setup

```yaml
# docker-compose.yml
version: '3.9'

services:
  fastapi:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - GEMINI_API_KEY=${GEMINI_API_KEY}
      - FAL_KEY=${FAL_KEY}
      - REDIS_URL=redis://redis:6379
    depends_on:
      - redis
      - postgres
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  celery_worker:
    build: ./backend
    command: celery -A celery_config worker --loglevel=info --concurrency=2
    environment:
      - CELERY_BROKER_URL=redis://redis:6379/0
      - CELERY_RESULT_BACKEND=redis://redis:6379/1
    depends_on:
      - redis
      - postgres
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    restart: unless-stopped

  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_PASSWORD=postgres
      - POSTGRES_DB=unoduno
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  redis_data:
  postgres_data:
```

### Monitoring & Logging

```python
# backend/monitoring.py
import logging
from pythonjsonlogger import jsonlogger

# JSON logging for better parsing
logHandler = logging.FileHandler('app.log')
formatter = jsonlogger.JsonFormatter()
logHandler.setFormatter(formatter)
logger = logging.getLogger()
logger.addHandler(logHandler)

# Sentry for error tracking
import sentry_sdk
sentry_sdk.init(
    dsn="https://xxx@sentry.io/xxx",
    traces_sample_rate=0.1,
)

# Prometheus metrics
from prometheus_client import Counter, Histogram
job_duration = Histogram('job_duration_seconds', 'Job processing time')
job_errors = Counter('job_errors_total', 'Total job errors')
```

---

## 5. API Contracts

### Upload Clip

```
POST /api/videos/clip/upload

Request:
{
  "file": File,
  "title": "My Podcast Episode",
  "tags": ["podcast", "ai"]
}

Response (202 Accepted):
{
  "jobId": "uuid",
  "status": "pending",
  "estimatedDuration": "5-10 minutes",
  "estimatedCost": 0.08,
  "statusUrl": "/api/videos/clip/status/{jobId}"
}
```

### Poll Job Status

```
GET /api/videos/clip/status/{jobId}

Response:
{
  "jobId": "uuid",
  "status": "analyzing",  // pending → transcribing → analyzing → extracting → uploading → completed
  "progress": 45,         // 0-100
  "clips": [
    {
      "id": "clip_1",
      "duration": 30,
      "thumbnail": "https://s3.../thumb.jpg",
      "preview": "https://s3.../preview.mp4",
      "startTime": "00:05:30",
      "endTime": "00:06:00"
    }
  ],
  "completedAt": null,
  "error": null
}
```

### Publish to Social

```
POST /api/videos/publish

Request:
{
  "clipId": "uuid",
  "platforms": ["tiktok", "instagram"],
  "scheduledFor": "2026-06-30T10:00:00Z"
}

Response:
{
  "publishId": "uuid",
  "clips": [
    {
      "platform": "tiktok",
      "postId": "xxx",
      "postUrl": "https://...",
      "publishedAt": "2026-06-30T10:00:00Z"
    }
  ]
}
```

---

## 6. Checklist de Implementação

### Backend
- [ ] FastAPI setup + routes
- [ ] Whisper integration
- [ ] PySceneDetect integration
- [ ] Gemini API calls
- [ ] FFmpeg video processing
- [ ] S3 upload
- [ ] Celery task queue
- [ ] Error handling + retries
- [ ] Logging + monitoring
- [ ] Docker + docker-compose
- [ ] Unit tests (>80% coverage)
- [ ] Load testing (100+ concurrent jobs)

### Frontend
- [ ] Upload component
- [ ] Job polling + SWR
- [ ] Gallery view
- [ ] AI Shorts wizard
- [ ] YouTube Studio UI
- [ ] Real-time progress
- [ ] Download/preview
- [ ] Mobile responsive
- [ ] Dark mode (neon green theme)
- [ ] Accessibility (WCAG AA)

### Database
- [ ] Schema creation
- [ ] Migrations setup
- [ ] Indexes optimization
- [ ] RLS policies
- [ ] Backup strategy

### Deployment
- [ ] EC2 instance
- [ ] SSL certificate
- [ ] Load balancer
- [ ] Auto-scaling group
- [ ] Monitoring alerts
- [ ] Backup & recovery plan

### Testing
- [ ] Unit tests (90%+)
- [ ] Integration tests
- [ ] E2E tests
- [ ] Performance tests
- [ ] Load tests
- [ ] Security audit

---

## 7. Próximas Ações

1. **Week 1:** Aprovação + Setup infraestrutura
2. **Week 2-3:** Backend core + integration
3. **Week 4:** Frontend + integration
4. **Week 5:** Testing + optimization
5. **Week 6:** Deployment + monitoring
6. **Week 7:** Beta testing + refinement
7. **Week 8+:** Launch + iterate

**Contato Tech Lead:** Para kickoff meeting
