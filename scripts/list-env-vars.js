#!/usr/bin/env node

/**
 * List All Environment Variables Used in the Project
 * 
 * Analisa o código-fonte e lista todas as variáveis de ambiente
 * referenciadas no projeto
 * 
 * Uso: node scripts/list-env-vars.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

const log = {
  header: (msg) => console.log(`\n${colors.bold}${colors.cyan}${msg}${colors.reset}`),
  section: (msg) => console.log(`\n${colors.blue}${msg}${colors.reset}`),
  item: (msg) => console.log(`  ${msg}`),
  table: (header, data) => {
    console.log(`\n${colors.bold}${header}${colors.reset}`);
    data.forEach((row) => console.log(`  ${row}`));
  },
};

function extractEnvVars() {
  try {
    // Buscar com ripgrep se disponível, caso contrário usar grep
    let output;
    try {
      output = execSync('grep -r "process\\.env\\." --include="*.ts" --include="*.tsx" --include="*.js" --include="*.mjs" src/ app/ lib/ components/ utils/ middleware* next.config* 2>/dev/null || true', { encoding: 'utf-8' });
    } catch (e) {
      output = '';
    }

    const envVars = new Map();
    const lines = output.split('\n').filter((line) => line.trim());

    lines.forEach((line) => {
      // Extrair padrão: process.env.VARIABLE_NAME
      const matches = line.match(/process\.env\.([A-Z_][A-Z0-9_]*)/g);
      if (matches) {
        matches.forEach((match) => {
          const varName = match.replace('process.env.', '');
          if (!envVars.has(varName)) {
            envVars.set(varName, []);
          }
          const file = line.split(':')[0];
          const fileList = envVars.get(varName);
          if (!fileList.includes(file)) {
            fileList.push(file);
          }
        });
      }
    });

    return envVars;
  } catch (error) {
    console.error('Erro ao extrair variáveis:', error.message);
    return new Map();
  }
}

function categorizeVars(envVars) {
  const categories = {
    'Supabase (Database & Auth)': [],
    'Google APIs': [],
    'Stripe (Payments)': [],
    'YouTube': [],
    'Storage & Cache': [],
    'Build & Deployment': [],
    'Security': [],
    'Vercel (Automatic)': [],
    'Other': [],
  };

  envVars.forEach((files, varName) => {
    if (varName.includes('SUPABASE')) {
      categories['Supabase (Database & Auth)'].push({ varName, files });
    } else if (
      varName.includes('GOOGLE') ||
      varName.includes('GENERATIVE') ||
      varName.includes('GEMINI')
    ) {
      categories['Google APIs'].push({ varName, files });
    } else if (varName.includes('STRIPE')) {
      categories['Stripe (Payments)'].push({ varName, files });
    } else if (varName.includes('YOUTUBE')) {
      categories['YouTube'].push({ varName, files });
    } else if (
      varName.includes('REDIS') ||
      varName.includes('KV_') ||
      varName.includes('BLOB')
    ) {
      categories['Storage & Cache'].push({ varName, files });
    } else if (
      varName.includes('TURBO') ||
      varName.includes('NX_') ||
      varName.includes('NODE_ENV')
    ) {
      categories['Build & Deployment'].push({ varName, files });
    } else if (
      varName.includes('SECRET') ||
      varName.includes('CSRF') ||
      varName.includes('SESSION')
    ) {
      categories['Security'].push({ varName, files });
    } else if (
      varName.includes('VERCEL') ||
      varName.includes('CI') ||
      varName.includes('PLAYWRIGHT')
    ) {
      categories['Vercel (Automatic)'].push({ varName, files });
    } else {
      categories['Other'].push({ varName, files });
    }
  });

  return categories;
}

function printReport(categories) {
  log.header('Environment Variables Usage Report');
  log.section(`Total de variáveis encontradas: ${
    Object.values(categories).reduce((sum, vars) => sum + vars.length, 0)
  }\n`);

  Object.entries(categories).forEach(([category, vars]) => {
    if (vars.length === 0) return;

    log.section(`${category} (${vars.length})`);
    vars.forEach(({ varName, files }) => {
      const fileList = files.map((f) => path.relative(process.cwd(), f)).join(', ');
      log.item(
        `${colors.green}${varName}${colors.reset} → ${colors.gray}${fileList}${colors.reset}`
      );
    });
  });

  log.header('Next Steps');
  log.item('1. Verifique ENVIRONMENT_VARIABLES_MAP.md para descrição completa');
  log.item('2. Execute: node scripts/validate-env.js para validar configuração');
  log.item('3. Atualize .env.local com valores necessários para desenvolvimento');
}

const envVars = extractEnvVars();
const categories = categorizeVars(envVars);
printReport(categories);
