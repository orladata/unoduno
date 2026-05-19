-- Tabela de Vídeos/Processamentos (Apenas Metadados)
CREATE TABLE public.processed_videos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    youtube_url TEXT NOT NULL,
    video_id VARCHAR(50) NOT NULL UNIQUE,
    title VARCHAR(255),
    status VARCHAR(20) DEFAULT 'processing', -- 'processing', 'completed', 'failed'
    -- Referências exclusivas para os buckets do Vercel Blob
    transcription_blob_url TEXT, 
    script_blob_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.processed_videos ENABLE ROW LEVEL SECURITY;

-- Política de RLS: O usuário só pode ver seus próprios processamentos
CREATE POLICY "Usuários podem ver seus próprios vídeos" 
ON public.processed_videos
FOR SELECT
USING (auth.uid() = user_id);

-- Política de RLS: O Service Role ou Server (com chaves seguras) pode inserir/atualizar
-- Como a inserção e atualização será feita pela Route Handler no Next.js (servidor) 
-- usando a SUPABASE_SERVICE_ROLE_KEY, ela fará o bypass automático do RLS, 
-- não sendo estritamente necessário criar políticas INSERT para usuários autenticados via client-side.
-- Contudo, adicionaremos uma para leitura do próprio user:

CREATE INDEX idx_videos_user_id ON public.processed_videos(user_id);
CREATE INDEX idx_videos_video_id ON public.processed_videos(video_id);
