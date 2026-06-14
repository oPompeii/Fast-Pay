# FastPay

> Plataforma de pagamentos e trading de criptomoedas

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Status](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)](https://github.com/oPompeii/Fast-Pay)
[![Node](https://img.shields.io/badge/Node-18+-brightgreen)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue)](https://www.typescriptlang.org/)

## 🚀 O Que É

FastPay é uma aplicação web para gerenciamento de pagamentos, trading de criptomoedas e investimentos digitais. Oferece uma experiência intuitiva com recursos como dashboard financeiro, AI Advisor e programa de afiliados.

## ✨ Features Principais

- 💰 **Gestão de Pagamentos** - Autenticação segura, dashboard e histórico de transações
- 📈 **Trading de Criptomoedas** - FastCoin com preços em tempo real
- 🤖 **AI Advisor** - Recomendações inteligentes com OpenAI
- 👥 **Programa de Afiliados** - Sistema de referência e comissões
- 📊 **Relatórios** - Exportação em PDF e Excel
- 17 **Páginas** totalmente implementadas

## 🛠️ Stack Tecnológico

| Camada | Tecnologia |
|--------|-----------|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS |
| **Backend** | Supabase (PostgreSQL, Auth, Real-time) |
| **IA** | OpenAI GPT-4 |
| **Exportação** | jsPDF, XLSX |

## 📦 Instalação

### Pré-requisitos
- Node.js 18+
- npm 9+
- Conta Supabase (gratuita)

### Setup Rápido

```bash
# Clone o repositório
git clone https://github.com/oPompeii/Fast-Pay.git
cd Fast-Pay

# Instale dependências
npm install

# Configure variáveis
cp .env.example .env.local
# Edite com suas credenciais Supabase

# Inicie desenvolvimento
npm run dev
```

Acesse: http://localhost:5173

## 🧪 Comandos

```bash
npm run dev      # Desenvolvimento
npm run build    # Build produção
npm run preview  # Preview build
npm run lint     # Verificar código
```

## 🚀 Deploy

### Vercel (Recomendado)
```bash
npm install -g vercel
vercel deploy
```

### Netlify
- Conecte seu repositório GitHub
- Build: `npm run build`
- Publish: `dist`

## 📁 Estrutura

```
src/
├── pages/         # 17 páginas
├── components/    # Componentes reutilizáveis
├── lib/          # Supabase, auth, utils
└── App.tsx       # Router principal
```

## 📊 Páginas Implementadas

| Categoria | Páginas |
|-----------|---------|
| **Auth** | Register, Login, AdminLogin |
| **Conta** | Dashboard, Settings, Withdraw, Transactions |
| **Trading** | BuyFastcoin, Packages, Earn |
| **IA** | AiAdvisor |
| **Social** | Affiliates, Invite |
| **Suporte** | Support, Tutorial, Terms, Notifications |

## 🔐 Segurança

- ✅ Autenticação JWT com Supabase
- ✅ Row Level Security (RLS)
- ✅ 100% TypeScript (type safety)
- ✅ 0 vulnerabilidades críticas
- ✅ Conformidade GDPR

## 📚 Documentação

Documentação completa em `./DOCS`:

- **GUIA_PRATICO.md** - Setup e deployment
- **QUICK_FIXES.md** - Otimizações rápidas
- **RELATORIO_CORRECOES.md** - Análise técnica
- **SUMARIO_EXECUTIVO.md** - Overview
- **ROADMAP.md** - Plano futuro

## 📄 Licença

MIT License - veja [LICENSE](LICENSE)

## 👨‍💼 Autor

**Pompei**
- GitHub: [@oPompeii](https://github.com/oPompeii)
- LinkedIn: [Seu Perfil](https://linkedin.com/in/matheus-pompei)

---
