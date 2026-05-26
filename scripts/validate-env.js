#!/usr/bin/env node

/**
 * Environment Variables Validator
 * 
 * Valida se todas as variáveis de ambiente necessárias estão configuradas
 * para o ambiente atual (development | production | test)
 * 
 * Uso: node scripts/validate-env.js
 */

const fs = require('fs');
const path = require('path');

// Cores para output no terminal
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};

const log = {
  error: (msg) => console.log(`${colors.red}✗ ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✓ ${msg}${colors.reset}`),
  warn: (msg) => console.log(`${colors.yellow}⚠ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ ${msg}${colors.reset}`),
  header: (msg) => console.log(`\n${colors.cyan}${msg}${colors.reset}`),
};

// Variáveis obrigatórias por ambiente
const REQUIRED_VARS = {
  development: [
    'NEXT_PUBLIC_SITE_URL',
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  ],
  production: [
    'NODE_ENV',
    'SESSION_SECRET',
    'CSRF_SECRET',
    'GOOGLE_GENERATIVE_AI_API_KEY',
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'NEXT_PUBLIC_SITE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
  ],
  test: [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  ],
};

// Variáveis recomendadas por ambiente
const RECOMMENDED_VARS = {
  development: [
    'GOOGLE_GENERATIVE_AI_API_KEY',
    'YOUTUBE_API_KEY',
    'STRIPE_SECRET_KEY',
  ],
  production: [
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'YOUTUBE_API_KEY',
    'REDIS_URL',
    'BLOB_READ_WRITE_TOKEN',
  ],
};

// Variáveis perigosas (nunca devem ser expostas publicamente)
const DANGEROUS_PATTERNS = {
  NEXT_PUBLIC_SESSION_SECRET: 'Session secret deve ser SERVER-ONLY',
  NEXT_PUBLIC_CSRF_SECRET: 'CSRF secret deve ser SERVER-ONLY',
  NEXT_PUBLIC_STRIPE_SECRET_KEY: 'Stripe secret deve ser SERVER-ONLY',
  NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY: 'Service role deve ser SERVER-ONLY',
};

function loadEnvFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      return {};
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    const vars = {};

    content.split('\n').forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;

      const [key, ...valueParts] = trimmed.split('=');
      if (key) {
        vars[key] = valueParts.join('=').replace(/^["']|["']$/g, '');
      }
    });

    return vars;
  } catch (error) {
    console.error(`Erro ao ler ${filePath}:`, error.message);
    return {};
  }
}

function validateEnvironment() {
  const env = process.env.NODE_ENV || 'development';
  log.header(`Validando Variáveis de Ambiente [${env}]`);

  // Carregar variáveis dos arquivos
  const envExample = loadEnvFile(path.join(process.cwd(), '.env.example'));
  const envLocal = loadEnvFile(path.join(process.cwd(), '.env.local'));
  const envVercelProd = loadEnvFile(path.join(process.cwd(), '.env.vercel.prod'));

  // Mesclar com process.env (com prioridade para process.env)
  const allVars = {
    ...envExample,
    ...envLocal,
    ...envVercelProd,
    ...process.env,
  };

  let hasErrors = false;
  let hasWarnings = false;

  // 1. Validar variáveis obrigatórias
  log.header('1. Verificando Variáveis Obrigatórias');
  const required = REQUIRED_VARS[env] || REQUIRED_VARS.development;

  required.forEach((varName) => {
    const value = allVars[varName];
    if (!value || value === 'your-value-here' || value.includes('xxx')) {
      log.error(`${varName} não configurada ou incompleta`);
      hasErrors = true;
    } else {
      log.success(`${varName}`);
    }
  });

  // 2. Validar variáveis recomendadas
  log.header('2. Verificando Variáveis Recomendadas');
  const recommended = RECOMMENDED_VARS[env] || [];

  recommended.forEach((varName) => {
    const value = allVars[varName];
    if (!value) {
      log.warn(`${varName} não configurada (recomendada)`);
      hasWarnings = true;
    } else {
      log.success(`${varName}`);
    }
  });

  // 3. Validar padrões perigosos
  log.header('3. Verificando Padrões de Segurança');
  Object.entries(DANGEROUS_PATTERNS).forEach(([dangerVar, reason]) => {
    if (allVars[dangerVar]) {
      log.error(`${dangerVar} encontrada! ${reason}`);
      hasErrors = true;
    } else {
      log.success(`${dangerVar} não configurada (correto)`);
    }
  });

  // 4. Validar formato de valores críticos
  log.header('4. Validando Formatos de Valores Críticos');
  
  if (allVars.SESSION_SECRET && allVars.SESSION_SECRET.length < 32) {
    log.error(`SESSION_SECRET deve ter no mínimo 32 caracteres (atual: ${allVars.SESSION_SECRET.length})`);
    hasErrors = true;
  } else if (allVars.SESSION_SECRET) {
    log.success('SESSION_SECRET tem comprimento adequado');
  }

  if (allVars.CSRF_SECRET && allVars.CSRF_SECRET.length < 32) {
    log.error(`CSRF_SECRET deve ter no mínimo 32 caracteres (atual: ${allVars.CSRF_SECRET.length})`);
    hasErrors = true;
  } else if (allVars.CSRF_SECRET) {
    log.success('CSRF_SECRET tem comprimento adequado');
  }

  // 5. Resumo
  log.header('Resumo da Validação');
  
  if (hasErrors) {
    log.error('Validação FALHOU - Existem erros críticos');
    process.exit(1);
  } else if (hasWarnings) {
    log.warn('Validação PASSOU com avisos - Recomenda-se configurar variáveis recomendadas');
    process.exit(0);
  } else {
    log.success('Validação PASSOU - Todas as variáveis obrigatórias estão configuradas');
    process.exit(0);
  }
}

// Executar validação
validateEnvironment();
