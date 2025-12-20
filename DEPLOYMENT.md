# Guia de Deploy HolyFinanças

Este guia detalha os passos necessários para realizar o deploy do projeto no GitHub e Vercel.

## 1. GitHub
1. Crie um novo repositório no GitHub.
2. Inicialize o git localmente (se não estiver): `git init`.
3. Adicione os arquivos: `git add .`.
4. Faça o primeiro commit: `git commit -m "Initial commit - Project Ready"`.
5. Adicione o repositório remoto: `git remote add origin https://github.com/seu-usuario/holyfinance.git`.
6. Suba para o GitHub: `git push -u origin main`.

## 2. Convex (Produção)
Antes do Vercel, você deve configurar o deployment de produção do Convex:
1. Acesse o [Convex Dashboard](https://dashboard.convex.dev).
2. Vá em **Settings** -> **Environment Variables**.
3. Adicione a variável `ENCRYPTION_KEY` com um valor aleatório de 32 caracteres. (Importante para a segurança das senhas de e-mail).

## 3. Vercel
1. No Vercel, clique em **Add New** -> **Project**.
2. Importe o repositório `holyfinance`.
3. Em **Environment Variables**, adicione:
   - `NEXT_PUBLIC_CONVEX_URL`: Pegue no dashboard do Convex (clique em "Copy URL").
   - `CONVEX_DEPLOY_KEY`: Pegue no dashboard do Convex em **Settings** -> **Deployment Key**.
4. Clique em **Deploy**.

## 4. Pós-Deploy
Após o deploy, verifique se:
- O login e cadastro funcionam.
- As notificações de e-mail são enviadas corretamente (após configurar o SMTP nas configurações do app).
- O sistema de família está isolando os dados corretamente.
