# HolyFinanças - Gestão Financeira Pessoal

HolyFinanças é uma aplicação moderna de gestão financeira pessoal construída com Next.js, Convex e Tailwind CSS.

## 🚀 Tecnologias

- **Frontend**: Next.js (App Router), React, Tailwind CSS 4.0
- **Backend/Database**: Convex (Real-time database)
- **Autenticação**: Custom Token Auth com Convex
- **Notificações**: Sistema de e-mail via SMTP (Nodemailer)
- **UI/UX**: Design premium com suporte a modo escuro/claro e notificações toast

## 📦 Como rodar localmente

1. **Clone o repositório**:
   ```bash
   git clone https://github.com/seu-usuario/holyfinance.git
   cd holyfinance
   ```

2. **Instale as dependências**:
   ```bash
   npm install
   ```

3. **Configure o Convex**:
   ```bash
   npx convex dev
   ```

4. **Rodar o projeto**:
   ```bash
   npm run dev
   ```

## 🛠️ Configuração de Variáveis de Ambiente

As seguintes variáveis devem ser configuradas no Vercel e no ambiente Convex:

### Frontend (Vercel)
- `NEXT_PUBLIC_CONVEX_URL`: URL do seu deployment Convex.

### Backend (Convex Dashboard)
- `ENCRYPTION_KEY`: Uma chave aleatória de 32 caracteres para encriptar senhas de e-mail.

## 🚀 Deploy no Vercel

1. Conecte seu repositório GitHub ao Vercel.
2. Configure as variáveis de ambiente mencionadas acima.
3. Certifique-se de configurar o **Convex Integration** no Vercel ou adicione manualmente a variável `CONVEX_DEPLOY_KEY`.
