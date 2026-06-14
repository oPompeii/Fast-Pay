# 🚀 Guia Prático - Fast-Pay

## Quick Start (Primeiros Passos)

### 1. Setup Inicial

```bash
# Clonar o repositório
git clone seu-repo
cd Fast-Pay-Fixed

# Instalar dependências
npm install

# Criar arquivo de variáveis de ambiente
cp .env.example .env.local
```

### 2. Configurar `.env.local`

```env
# Supabase
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anonima

# OpenAI (para AI Advisor)
VITE_OPENAI_API_KEY=sk-...

# Outros
VITE_API_URL=http://localhost:5173
```

### 3. Rodar em Desenvolvimento

```bash
# Terminal 1: Vite dev server
npm run dev
# Acessa em http://localhost:5173

# Terminal 2: Supabase local (opcional)
supabase start
```

---

## 🎯 Melhorias Imediatas

### #1: Implementar Code Splitting (CRÍTICO)

**Arquivo:** `vite.config.ts`

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Separar bibliotecas pesadas
          'vendor-ai': ['openai'],
          'vendor-export': ['jspdf', 'jspdf-autotable', 'xlsx'],
          'vendor-canvas': ['html2canvas'],
          
          // Separar páginas por feature
          'page-auth': ['./src/pages/Register', './src/pages/Login'],
          'page-admin': ['./src/pages/AdminDashboard', './src/pages/AdminLogin'],
          'page-trading': ['./src/pages/BuyFastcoin', './src/pages/Packages'],
          'page-ai': ['./src/pages/AiAdvisor'],
        }
      }
    },
    chunkSizeWarningLimit: 600
  }
})
```

**Resultado Esperado:**
- Antes: 1 arquivo de 1,357 KB
- Depois: 6-8 arquivos de ~200-300 KB cada
- Ganho: Carregamento inicial 3x mais rápido

---

### #2: Lazy Loading de Rotas

**Arquivo:** `src/App.tsx`

Trocar imports estáticos:
```typescript
// ❌ Antes (carrega tudo)
import Dashboard from './pages/Dashboard';
import AiAdvisor from './pages/AiAdvisor';

// ✅ Depois (carrega sob demanda)
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const AiAdvisor = React.lazy(() => import('./pages/AiAdvisor'));
```

E envolver as rotas com Suspense:
```typescript
import { Suspense } from 'react';
import Loading from './components/Loading'; // já existe!

<Suspense fallback={<Loading />}>
  <Routes>
    <Route path="/dashboard" element={<Dashboard />} />
    <Route path="/ai-advisor" element={<AiAdvisor />} />
  </Routes>
</Suspense>
```

---

### #3: Otimizar Imagens

```bash
# Instalar sharp para optimização
npm install -D vite-plugin-compression

# No vite.config.ts
import compression from 'vite-plugin-compression';

export default defineConfig({
  plugins: [
    react(),
    compression({
      algorithm: 'gzip',
      ext: '.gz'
    })
  ]
})
```

---

### #4: Adicionar Service Worker (PWA)

```bash
npm install -D vite-plugin-pwa

# No vite.config.ts
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      strategies: 'injectManifest',
      manifest: {
        name: 'FastPay',
        short_name: 'FastPay',
        theme_color: '#000000'
      }
    })
  ]
})
```

---

## 🧪 Testes

### Adicionar Jest + React Testing Library

```bash
npm install -D jest @testing-library/react @testing-library/jest-dom ts-jest
```

**Arquivo:** `jest.config.js`

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.ts?(x)', '**/?(*.)+(spec|test).ts?(x)'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
};
```

**Exemplo de teste:**

```typescript
// src/pages/__tests__/Login.test.tsx
import { render, screen } from '@testing-library/react';
import Login from '../Login';

describe('Login', () => {
  it('renders login form', () => {
    render(<Login />);
    expect(screen.getByText(/login/i)).toBeInTheDocument();
  });
});
```

```bash
npm test
```

---

## 🔒 Segurança

### Checklist de Segurança

- [ ] Variáveis sensíveis NO `.env.local` (não commitar)
- [ ] Supabase RLS (Row Level Security) configurado
- [ ] Rate limiting em APIs
- [ ] CORS configurado corretamente
- [ ] Helmet.js para headers de segurança
- [ ] Validação de input em formulários
- [ ] XSS protection (Tailwind não gera inline styles perigosos)

### Adicionar Rate Limiting (Frontend)

```typescript
// src/lib/rateLimit.ts
class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private limit = 10; // requisições
  private window = 60000; // 1 minuto

  isAllowed(key: string): boolean {
    const now = Date.now();
    const userRequests = this.requests.get(key) || [];
    
    const recent = userRequests.filter(t => now - t < this.window);
    
    if (recent.length >= this.limit) {
      return false;
    }
    
    this.requests.set(key, [...recent, now]);
    return true;
  }
}

export const rateLimiter = new RateLimiter();
```

---

## 📦 Deploy

### Deploy na Vercel (Recomendado)

```bash
# 1. Instalar Vercel CLI
npm install -g vercel

# 2. Deploy
vercel

# 3. Configurar variáveis de ambiente na dashboard Vercel
```

**Arquivo:** `vercel.json`

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "env": {
    "VITE_SUPABASE_URL": "@supabase_url",
    "VITE_SUPABASE_ANON_KEY": "@supabase_key",
    "VITE_OPENAI_API_KEY": "@openai_key"
  }
}
```

### GitHub Actions (CI/CD)

**Arquivo:** `.github/workflows/deploy.yml`

```yaml
name: Build and Deploy

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - run: npm install
      - run: npm run lint
      - run: npm run build
      
      - name: Deploy to Vercel
        uses: vercel/action@v4
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

---

## 📊 Monitoramento

### Adicionar Analytics

```bash
npm install posthog-js
```

**Em `src/main.tsx`:**

```typescript
import posthog from 'posthog-js'

posthog.init(import.meta.env.VITE_POSTHOG_KEY, {
  api_host: import.meta.env.VITE_POSTHOG_URL,
  loaded: (ph) => {
    window.posthog = ph
  }
})
```

### Adicionar Sentry para Error Tracking

```bash
npm install @sentry/react
```

```typescript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  tracesSampleRate: 1.0,
});
```

---

## 🐛 Troubleshooting

### Erro: "Cannot find module"

```bash
rm -rf node_modules package-lock.json
npm install
```

### Erro: Port 5173 já está em uso

```bash
# Linux/Mac
lsof -i :5173
kill -9 <PID>

# Windows
netstat -ano | findstr :5173
taskkill /PID <PID> /F
```

### Supabase Connection Issues

```bash
# Testar conexão
curl https://seu-projeto.supabase.co/rest/v1/

# Verificar chaves
echo "VITE_SUPABASE_URL=$VITE_SUPABASE_URL"
echo "VITE_SUPABASE_ANON_KEY=$VITE_SUPABASE_ANON_KEY"
```

### Performance Lenta

```bash
# Analisar bundle
npm install -D rollup-plugin-visualizer

# No vite.config.ts
import { visualizer } from 'rollup-plugin-visualizer';

plugins: [
  react(),
  visualizer({ open: true })
]

# Rodar build
npm run build
# Abre visualização do bundle
```

---

## 📚 Referências Rápidas

### Comandos Essenciais

```bash
npm run dev       # Iniciar desenvolvimento
npm run build     # Build para produção
npm run preview   # Visualizar build
npm run lint      # Verificar código
npm test          # Rodar testes
npm audit         # Verificar vulnerabilidades
npm audit fix     # Corrigir vulnerabilidades
```

### Estrutura de Pastas

```
src/
├── pages/              # 17 páginas completas
├── components/         # Componentes reutilizáveis
├── lib/               # Lógica e utilitários
│   ├── supabase.ts   # Configuração Supabase
│   ├── auth.ts       # Autenticação
│   └── utils.ts      # Funções helper
├── App.tsx           # Roteador principal
├── main.tsx          # Entry point
└── index.css         # Estilos globais
```

---

**Última Atualização:** 14 de junho de 2026  
**Status:** ✅ Pronto para produção (com otimizações recomendadas)
