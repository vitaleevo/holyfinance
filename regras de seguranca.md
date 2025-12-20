# Regras de Segurança para Desenvolvimento

## 1. Autenticação e Autorização

### 1.1 Autenticação

**Regras:**

1. **Nunca Armazene Senhas em Texto Plano**
   - Use algoritmos de hash fortes (bcrypt, Argon2, scrypt)
   - Adicione salt único para cada senha
   - Mínimo de 10 rounds para bcrypt

2. **Implemente Políticas de Senha Fortes**
   - Mínimo 8 caracteres (recomendado 12+)
   - Exija combinação de letras, números e caracteres especiais
   - Bloqueie senhas comuns (use listas como "Have I Been Pwned")
   - Implemente verificação de força em tempo real

3. **Proteja Contra Força Bruta**
   - Rate limiting nas rotas de login
   - Bloqueio temporário após múltiplas tentativas falhas (3-5)
   - CAPTCHA após várias tentativas
   - Bloqueio progressivo (1min, 5min, 15min, 1h)

4. **Autenticação Multi-Fator (MFA)**
   - Ofereça MFA como opção (obrigatório para admins)
   - Suporte TOTP (Google Authenticator, Authy)
   - SMS como backup (menos seguro, mas melhor que nada)

5. **Gestão de Sessões**
   - Use tokens seguros e imprevisíveis
   - Defina tempo de expiração adequado (15-30min para apps sensíveis)
   - Implemente refresh tokens para sessões longas
   - Invalide sessões no logout
   - Limite sessões simultâneas por usuário

**Exemplos:**

```javascript
// ❌ NUNCA FAÇA ISSO
const usuario = {
  email: 'user@example.com',
  senha: 'minhasenha123' // Texto plano!
};

// ✅ CORRETO
import bcrypt from 'bcrypt';

async function criarUsuario(email, senha) {
  const saltRounds = 12;
  const senhaHash = await bcrypt.hash(senha, saltRounds);
  
  return {
    email,
    senhaHash // Armazene apenas o hash
  };
}

async function verificarSenha(senha, senhaHash) {
  return await bcrypt.compare(senha, senhaHash);
}
```

### 1.2 Autorização

**Regras:**

1. **Princípio do Menor Privilégio**
   - Usuários devem ter apenas permissões necessárias
   - Implemente RBAC (Role-Based Access Control)
   - Ou ABAC (Attribute-Based Access Control) para casos complexos

2. **Validação no Backend**
   - NUNCA confie apenas em validação frontend
   - Sempre valide permissões no servidor
   - Verifique autorização em TODA requisição

3. **Referências Diretas a Objetos**
   - Não exponha IDs internos sequenciais
   - Use UUIDs ou IDs não sequenciais
   - Sempre verifique se o usuário tem acesso ao recurso

4. **Tokens e Permissões**
   - Inclua permissões no token JWT (não sensível)
   - Valide escopo de permissões em cada endpoint
   - Tokens devem expirar

**Exemplos:**

```javascript
// ❌ INSEGURO - Não verifica permissões
app.delete('/api/usuarios/:id', async (req, res) => {
  await Usuario.delete(req.params.id);
  res.json({ sucesso: true });
});

// ✅ SEGURO - Verifica autorização
app.delete('/api/usuarios/:id', 
  autenticado, // Middleware de autenticação
  async (req, res) => {
    const { id } = req.params;
    const usuarioAtual = req.usuario;
    
    // Verifica se é admin ou o próprio usuário
    if (!usuarioAtual.isAdmin && usuarioAtual.id !== id) {
      return res.status(403).json({ 
        erro: 'Sem permissão' 
      });
    }
    
    await Usuario.delete(id);
    res.json({ sucesso: true });
  }
);
```

---

## 2. Injeção de Código (SQL, NoSQL, Command)

### 2.1 SQL Injection

**Regras:**

1. **SEMPRE Use Prepared Statements**
   - Nunca concatene SQL com input do usuário
   - Use parameterização em todas as queries
   - ORMs geralmente protegem, mas cuidado com raw queries

2. **Validação de Input**
   - Valide tipo, formato e tamanho
   - Use whitelist, não blacklist
   - Escape caracteres especiais quando necessário

3. **Princípio de Menor Privilégio no DB**
   - Usuário da aplicação não deve ser DBA
   - Limite permissões ao necessário (SELECT, INSERT, UPDATE)
   - Use diferentes usuários para diferentes operações

**Exemplos:**

```javascript
// ❌ VULNERÁVEL A SQL INJECTION
app.get('/usuarios', async (req, res) => {
  const nome = req.query.nome;
  const query = `SELECT * FROM usuarios WHERE nome = '${nome}'`;
  // Ataque: ?nome=' OR '1'='1
  const resultado = await db.query(query);
  res.json(resultado);
});

// ✅ SEGURO - Prepared Statement
app.get('/usuarios', async (req, res) => {
  const nome = req.query.nome;
  const query = 'SELECT * FROM usuarios WHERE nome = ?';
  const resultado = await db.query(query, [nome]);
  res.json(resultado);
});

// ✅ SEGURO - ORM
app.get('/usuarios', async (req, res) => {
  const nome = req.query.nome;
  const usuarios = await Usuario.findAll({
    where: { nome }
  });
  res.json(usuarios);
});
```

### 2.2 NoSQL Injection

**Regras:**

1. **Valide Tipos de Dados**
   - MongoDB: evite passar objetos diretamente
   - Converta para tipos esperados

2. **Sanitize Input**
   - Use bibliotecas de sanitização
   - Valide estrutura de objetos

**Exemplos:**

```javascript
// ❌ VULNERÁVEL
app.post('/login', async (req, res) => {
  const { email, senha } = req.body;
  // Ataque: { "email": { "$ne": null }, "senha": { "$ne": null } }
  const usuario = await Usuario.findOne({ email, senha });
});

// ✅ SEGURO
app.post('/login', async (req, res) => {
  const email = String(req.body.email);
  const senha = String(req.body.senha);
  
  const usuario = await Usuario.findOne({ email });
  if (usuario && await bcrypt.compare(senha, usuario.senhaHash)) {
    // Login bem-sucedido
  }
});
```

### 2.3 Command Injection

**Regras:**

1. **NUNCA Execute Comandos com Input do Usuário**
   - Evite exec(), eval(), system()
   - Se absolutamente necessário, valide rigorosamente

2. **Use APIs Nativas**
   - Prefira bibliotecas específicas a comandos shell
   - Exemplo: use fs.readFile() ao invés de exec('cat file')

**Exemplos:**

```javascript
// ❌ EXTREMAMENTE PERIGOSO
const { exec } = require('child_process');
app.get('/arquivo', (req, res) => {
  const arquivo = req.query.nome;
  exec(`cat ${arquivo}`, (err, stdout) => {
    // Ataque: ?nome=../../etc/passwd
    res.send(stdout);
  });
});

// ✅ SEGURO
const fs = require('fs').promises;
const path = require('path');

app.get('/arquivo', async (req, res) => {
  const arquivo = req.query.nome;
  
  // Valida nome do arquivo
  if (!/^[a-zA-Z0-9_-]+\.txt$/.test(arquivo)) {
    return res.status(400).json({ erro: 'Nome inválido' });
  }
  
  // Usa caminho seguro
  const caminhoSeguro = path.join(__dirname, 'arquivos', arquivo);
  
  try {
    const conteudo = await fs.readFile(caminhoSeguro, 'utf8');
    res.send(conteudo);
  } catch (err) {
    res.status(404).json({ erro: 'Arquivo não encontrado' });
  }
});
```

---

## 3. Cross-Site Scripting (XSS)

### 3.1 Tipos de XSS

**Stored XSS:** Script armazenado no banco
**Reflected XSS:** Script vem da URL/parâmetros
**DOM-based XSS:** Manipulação do DOM no cliente

**Regras:**

1. **Escape de Output**
   - Escape TODOS os dados do usuário antes de renderizar
   - Use bibliotecas de template que fazem escape automático
   - React/Vue/Angular fazem isso por padrão

2. **Content Security Policy (CSP)**
   - Implemente headers CSP restritivos
   - Bloqueie inline scripts
   - Whitelist de domínios confiáveis

3. **Sanitização de HTML**
   - Se precisa aceitar HTML, use biblioteca de sanitização (DOMPurify)
   - Remova tags e atributos perigosos
   - Nunca use innerHTML com dados não sanitizados

4. **HTTPOnly Cookies**
   - Cookies de sessão devem ter flag HttpOnly
   - Impede acesso via JavaScript

**Exemplos:**

```javascript
// ❌ VULNERÁVEL A XSS
app.get('/perfil', (req, res) => {
  const nome = req.query.nome;
  res.send(`<h1>Olá ${nome}</h1>`);
  // Ataque: ?nome=<script>alert('XSS')</script>
});

// ✅ SEGURO - Template engine com escape
app.get('/perfil', (req, res) => {
  const nome = req.query.nome;
  res.render('perfil', { nome }); // Handlebars/EJS fazem escape
});

// ✅ SEGURO - React (escape automático)
function Perfil({ nome }) {
  return <h1>Olá {nome}</h1>; // React escapa automaticamente
}

// ❌ PERIGOSO no React
function Perfil({ html }) {
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}

// ✅ SEGURO - Sanitização
import DOMPurify from 'dompurify';

function Perfil({ html }) {
  const htmlLimpo = DOMPurify.sanitize(html);
  return <div dangerouslySetInnerHTML={{ __html: htmlLimpo }} />;
}
```

**CSP Header:**

```javascript
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' https://cdn.trusted.com; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: https:; " +
    "font-src 'self' data:; " +
    "connect-src 'self' https://api.exemplo.com; " +
    "frame-ancestors 'none';"
  );
  next();
});
```

---

## 4. Cross-Site Request Forgery (CSRF)

**Regras:**

1. **Tokens CSRF**
   - Gere token único por sessão
   - Valide token em operações de mudança de estado (POST, PUT, DELETE)
   - Use bibliotecas (csurf para Express)

2. **SameSite Cookies**
   - Use atributo SameSite=Strict ou Lax
   - Impede envio de cookies em requisições cross-site

3. **Verificação de Origin/Referer**
   - Valide header Origin ou Referer
   - Apenas para camada adicional, não como única defesa

4. **Operações Idempotentes**
   - GET não deve modificar estado
   - Mudanças apenas em POST/PUT/DELETE

**Exemplos:**

```javascript
// ❌ VULNERÁVEL A CSRF
app.post('/transferir', autenticado, async (req, res) => {
  const { destino, valor } = req.body;
  await transferir(req.usuario.id, destino, valor);
  res.json({ sucesso: true });
});

// ✅ PROTEGIDO - CSRF Token
const csrf = require('csurf');
const csrfProtection = csrf({ cookie: true });

app.get('/formulario', csrfProtection, (req, res) => {
  res.render('transferencia', { csrfToken: req.csrfToken() });
});

app.post('/transferir', 
  autenticado, 
  csrfProtection, // Valida token
  async (req, res) => {
    const { destino, valor } = req.body;
    await transferir(req.usuario.id, destino, valor);
    res.json({ sucesso: true });
  }
);

// ✅ SameSite Cookie
app.use(session({
  secret: process.env.SESSION_SECRET,
  cookie: {
    httpOnly: true,
    secure: true, // HTTPS apenas
    sameSite: 'strict'
  }
}));
```

---

## 5. Segurança de Dados Sensíveis

### 5.1 Armazenamento

**Regras:**

1. **Criptografia em Repouso**
   - Dados sensíveis devem ser criptografados no banco
   - Use AES-256 ou superior
   - Gerencie chaves separadamente (AWS KMS, Azure Key Vault)

2. **Nunca Armazene**
   - Números completos de cartão de crédito
   - CVV de cartão
   - Senhas em texto plano
   - PINs

3. **Dados Pessoais (LGPD/GDPR)**
   - Minimize coleta de dados
   - Implemente direito ao esquecimento
   - Criptografe dados pessoais sensíveis
   - Anonimize dados em logs

**Exemplos:**

```javascript
const crypto = require('crypto');

// Criptografia de dados sensíveis
class CriptografiaService {
  constructor(chaveSecreta) {
    this.algoritmo = 'aes-256-gcm';
    this.chave = crypto.scryptSync(chaveSecreta, 'salt', 32);
  }
  
  criptografar(texto) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.algoritmo, this.chave, iv);
    
    let encrypted = cipher.update(texto, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex')
    };
  }
  
  descriptografar(encrypted, iv, authTag) {
    const decipher = crypto.createDecipheriv(
      this.algoritmo,
      this.chave,
      Buffer.from(iv, 'hex')
    );
    
    decipher.setAuthTag(Buffer.from(authTag, 'hex'));
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
}
```

### 5.2 Transmissão

**Regras:**

1. **HTTPS Obrigatório**
   - SEMPRE use HTTPS em produção
   - Redirecione HTTP para HTTPS
   - Use HSTS (HTTP Strict Transport Security)

2. **TLS Moderno**
   - Use TLS 1.2 ou 1.3
   - Desabilite protocolos antigos (SSL, TLS 1.0/1.1)
   - Use cifras fortes

3. **Certificados**
   - Use certificados válidos (Let's Encrypt é gratuito)
   - Configure renovação automática
   - Verifique cadeia de certificados

**Exemplos:**

```javascript
// Headers de segurança
app.use((req, res, next) => {
  // HSTS - Force HTTPS por 1 ano
  res.setHeader(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains; preload'
  );
  
  // Impede MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Proteção XSS do navegador
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Impede embedding em iframes
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Referrer Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  next();
});

// Redirecionar HTTP para HTTPS
app.use((req, res, next) => {
  if (req.header('x-forwarded-proto') !== 'https') {
    res.redirect(`https://${req.header('host')}${req.url}`);
  } else {
    next();
  }
});
```

---

## 6. Gestão de Segredos e Configurações

**Regras:**

1. **NUNCA Commite Segredos**
   - Adicione .env ao .gitignore
   - Use variáveis de ambiente
   - Revogue e recrie se expor acidentalmente

2. **Gestão de Segredos**
   - Use serviços de gestão (AWS Secrets Manager, HashiCorp Vault)
   - Rotação automática de credenciais
   - Acesso baseado em roles (IAM)

3. **Configurações por Ambiente**
   - Separe dev, staging, produção
   - Diferentes credenciais por ambiente
   - Nunca use produção em desenvolvimento

4. **Auditoria**
   - Log de acesso a segredos
   - Alertas para acessos anormais

**Exemplos:**

```javascript
// ❌ NUNCA FAÇA ISSO
const config = {
  dbPassword: 'senha123',
  apiKey: 'sk_live_1234567890',
  jwtSecret: 'meu-segredo'
};

// ✅ CORRETO - Variáveis de ambiente
require('dotenv').config();

const config = {
  dbPassword: process.env.DB_PASSWORD,
  apiKey: process.env.API_KEY,
  jwtSecret: process.env.JWT_SECRET
};

// Validação
if (!config.jwtSecret) {
  throw new Error('JWT_SECRET não configurado');
}
```

**.env (NÃO commitar):**
```
DB_PASSWORD=senha_super_secreta_123
API_KEY=sk_live_1234567890
JWT_SECRET=chave_jwt_aleatoria_longa
```

**.env.example (Commitar como template):**
```
DB_PASSWORD=
API_KEY=
JWT_SECRET=
```

---

## 7. Validação e Sanitização de Input

**Regras:**

1. **Valide TODO Input**
   - Tipo de dado
   - Formato esperado
   - Tamanho/comprimento
   - Range de valores

2. **Whitelist sobre Blacklist**
   - Defina o que É permitido
   - Não tente bloquear o que NÃO é permitido

3. **Validação em Múltiplas Camadas**
   - Frontend (UX)
   - Backend (segurança)
   - Banco de dados (integridade)

4. **Bibliotecas de Validação**
   - Use Joi, Yup, Zod, express-validator
   - Não reinvente a roda

**Exemplos:**

```javascript
// ❌ VALIDAÇÃO FRACA
app.post('/usuario', async (req, res) => {
  const { email, idade } = req.body;
  await Usuario.create({ email, idade });
});

// ✅ VALIDAÇÃO FORTE - Joi
const Joi = require('joi');

const esquemaUsuario = Joi.object({
  email: Joi.string()
    .email()
    .required()
    .max(255),
  
  idade: Joi.number()
    .integer()
    .min(18)
    .max(120)
    .required(),
  
  nome: Joi.string()
    .pattern(/^[a-zA-ZÀ-ÿ\s]+$/)
    .min(2)
    .max(100)
    .required(),
  
  telefone: Joi.string()
    .pattern(/^\+?[1-9]\d{1,14}$/)
    .optional()
});

app.post('/usuario', async (req, res) => {
  try {
    const dadosValidados = await esquemaUsuario.validateAsync(req.body);
    await Usuario.create(dadosValidados);
    res.json({ sucesso: true });
  } catch (erro) {
    res.status(400).json({ 
      erro: 'Dados inválidos', 
      detalhes: erro.details 
    });
  }
});

// ✅ VALIDAÇÃO - Zod (TypeScript friendly)
import { z } from 'zod';

const esquemaUsuario = z.object({
  email: z.string().email().max(255),
  idade: z.number().int().min(18).max(120),
  nome: z.string().regex(/^[a-zA-ZÀ-ÿ\s]+$/).min(2).max(100),
  telefone: z.string().regex(/^\+?[1-9]\d{1,14}$/).optional()
});

type Usuario = z.infer<typeof esquemaUsuario>;
```

---

## 8. Logging e Monitoramento

**Regras:**

1. **Log de Eventos de Segurança**
   - Tentativas de login (sucesso e falha)
   - Mudanças de permissões
   - Acesso a recursos sensíveis
   - Erros de autorização
   - Tentativas de injeção

2. **NUNCA Logue Dados Sensíveis**
   - Senhas
   - Tokens completos
   - Números de cartão
   - Dados pessoais completos

3. **Estrutura de Logs**
   - Timestamp
   - ID do usuário
   - IP/User-Agent
   - Ação realizada
   - Resultado (sucesso/falha)

4. **Monitoramento em Tempo Real**
   - Alertas para comportamentos anormais
   - Múltiplas falhas de login
   - Acessos fora do horário
   - Mudanças de privilégios

5. **Retenção e Conformidade**
   - Defina política de retenção
   - Logs imutáveis
   - Backup regular

**Exemplos:**

```javascript
const winston = require('winston');

// Configuração de logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ 
      filename: 'error.log', 
      level: 'error' 
    }),
    new winston.transports.File({ 
      filename: 'security.log',
      level: 'warn'
    })
  ]
});

// Middleware de logging de segurança
function logSeguranca(req, tipo, detalhes) {
  logger.warn({
    tipo,
    timestamp: new Date().toISOString(),
    usuario: req.usuario?.id || 'anonimo',
    ip: req.ip,
    userAgent: req.get('user-agent'),
    ...detalhes
  });
}

// ❌ NUNCA logue assim
logger.info(`Login: ${email} com senha ${senha}`);

// ✅ CORRETO
app.post('/login', async (req, res) => {
  const { email, senha } = req.body;
  const usuario = await Usuario.findOne({ email });
  
  if (!usuario || !await bcrypt.compare(senha, usuario.senhaHash)) {
    logSeguranca(req, 'LOGIN_FALHOU', {
      email, // Email é ok
      motivo: 'credenciais_invalidas'
    });
    
    return res.status(401).json({ erro: 'Credenciais inválidas' });
  }
  
  logSeguranca(req, 'LOGIN_SUCESSO', {
    usuarioId: usuario.id
  });
  
  res.json({ token: gerarToken(usuario) });
});

// Detecção de tentativas de injeção
app.use((req, res, next) => {
  const inputSuspeito = JSON.stringify(req.body).toLowerCase();
  
  const padroes = [
    /(\bunion\b.*\bselect\b)/i,
    /(\bor\b.*1\s*=\s*1)/i,
    /<script/i,
    /javascript:/i
  ];
  
  for (const padrao of padroes) {
    if (padrao.test(inputSuspeito)) {
      logSeguranca(req, 'TENTATIVA_INJECAO', {
        padrao: padrao.toString(),
        body: req.body // Para análise
      });
      
      return res.status(400).json({ erro: 'Input inválido' });
    }
  }
  
  next();
});
```

---

## 9. Dependências e Atualizações

**Regras:**

1. **Auditoria Regular**
   - Execute `npm audit` ou `yarn audit` regularmente
   - Configure CI/CD para falhar em vulnerabilidades críticas
   - Use ferramentas como Snyk, Dependabot

2. **Mantenha Dependências Atualizadas**
   - Aplique patches de segurança imediatamente
   - Atualize versões menores mensalmente
   - Teste antes de atualizar versões maiores

3. **Minimize Dependências**
   - Menos dependências = menor superfície de ataque
   - Avalie necessidade real de cada biblioteca
   - Prefira bibliotecas mantidas ativamente

4. **Lock Files**
   - Commite package-lock.json ou yarn.lock
   - Garante builds reproduzíveis
   - Evita ataques de supply chain

**Exemplos:**

```bash
# Auditoria de segurança
npm audit

# Corrigir vulnerabilidades automaticamente
npm audit fix

# Verificar dependências desatualizadas
npm outdated

# Atualizar com cuidado
npm update

# GitHub Actions - CI/CD
name: Security Audit
on: [push, pull_request]

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm ci
      - run: npm audit --audit-level=high
```

**package.json com versões seguras:**
```json
{
  "dependencies": {
    "express": "^4.18.0",
    "bcrypt": "^5.1.0"
  },
  "scripts": {
    "audit": "npm audit",
    "pretest": "npm audit"
  }
}
```

---

## 10. Rate Limiting e DDoS Protection

**Regras:**

1. **Implemente Rate Limiting**
   - Limite requisições por IP
   - Limites diferentes por endpoint
   - Mais restritivo em endpoints sensíveis (login, API)

2. **Proteção DDoS**
   - Use serviços de CDN (Cloudflare, AWS CloudFront)
   - Web Application Firewall (WAF)
   - Load balancer com proteção DDoS

3. **Throttling Progressivo**
   - Aumente delay entre requisições
   - Bloqueio temporário após limite excedido

**Exemplos:**

```javascript
const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');

// Rate limiting geral
const limitadorGeral = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // 100 requisições por janela
  message: 'Muitas requisições, tente novamente mais tarde',
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting para login (mais restritivo)
const limitadorLogin = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // Apenas 5 tentativas
  skipSuccessfulRequests: true, // Não conta requisições bem-sucedidas
  message: 'Muitas tentativas de login'
});

// Slow down progressivo
const slowDownLogin = slowDown({
  windowMs: 15 * 60 * 1000,
  delayAfter: 3, // Começa delay após 3 requisições
  delayMs: 500 // Aumenta 500ms a cada requisição
});

app.use('/api/', limitadorGeral);
app.post('/login', slowDownLogin, limitadorLogin, handleLogin);

// Rate limiting por usuário (após autenticação)
const limitePorUsuario = new Map();

function rateLimitUsuario(req, res, next) {
  const usuarioId = req.usuario.id;
  const agora = Date.now();
  const janela = 60000; // 1 minuto
  const maxRequisicoes = 60;
  
  if (!limitePorUsuario.has(usuarioId)) {
    limitePorUsuario.set(usuarioId, []);
  }
  
  const requisicoes = limitePorUsuario.get(usuarioId)
    .filter(timestamp => agora - timestamp < janela);
  
  if (requisicoes.length >= maxRequisicoes) {
    return res.status(429).json({ 
      erro: 'Rate limit excedido' 
    });
  }
  
  requisicoes.push(agora);
  limitePorUsuario.set(usuarioId, requisicoes);
  
  next();
}
```

---

## 11. Segurança de APIs

**Regras:**

1. **Versionamento**
   - Use versionamento de API (/api/v1/, /api/v2/)
   - Mantenha versões antigas por período de transição
   - Deprecie versões antigas gradualmente

2. **Autenticação de API**
   - Use API Keys ou OAuth 2.0
   - JWT para autenticação stateless
   - Tokens com tempo de expiração

3. **Documentação Segura**
   - Não exponha endpoints internos
   - Documente limites de rate
   - Exemplos sem dados reais

4. **CORS Configurado Corretamente**
   - Não use `Access-Control-Allow-Origin: *`
   - Liste explicitamente origens permitidas
   - Configure adequadamente credenciais

**Exemplos:**

```javascript
// CORS seguro
const cors = require('cors');

const corsOptions = {
  origin: function (origin, callback) {
    const whitelist = [
      'https://meusite.com',
      'https://app.meusite.com'
    ];
    
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Não permitido pelo CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// API Key authentication
function validarApiKey(req, res, next) {
  const apiKey = req.header('X-API-Key');
  
  if (!apiKey || !isValidApiKey(apiKey)) {
    return res.status(401).json({ erro: 'API Key inválida' });
  }
  
  req.cliente = getClienteByApiKey(apiKey);
  next();
}

app.use('/api/', validarApiKey);
```

---

## 12. Upload de Arquivos

**Regras:**

1. **Validação de Tipo**
   - Valide extensão E MIME type
   - Não confie apenas na extensão
   - Use whitelist de tipos permitidos

2. **Validação de Tamanho**
   - Limite tamanho máximo
   - Proteja contra zip bombs
   - Considere quota por usuário

3. **Armazenamento Seguro**
   - NUNCA salve na pasta web pública
   - Gere nomes únicos e aleatórios
   - Armazene em serviço de object storage (S3)

4. **Scan de Malware**
   - Escaneie arquivos enviados
   - Use ClamAV ou serviços cloud
   - Quarentena para arquivos suspeitos

5. **Metadados**
   - Remova metadados sensíveis (EXIF de fotos)
   - Valide dimensões de imagens
   - Reprocesse imagens (redimensionar remove metadados)

**Exemplos:**

```javascript
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const sharp = require('sharp');

// ❌ INSEGURO
const upload = multer({ dest: 'public/uploads/' });
app.post('/upload', upload.single('file'), (req, res) => {
  res.json({ arquivo: req.file.filename });
});

// ✅ SEGURO
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '/secure/uploads/') // Fora da pasta pública
  },
  filename: function (req, file, cb) {
    // Nome aleatório, não original do usuário
    const nomeUnico = crypto.randomBytes(16).toString('hex');
    const ext = path.extname(file.originalname);
    cb(null, nomeUnico + ext);
  }
});

const fileFilter = (req, file, cb) => {
  // Whitelist de tipos permitidos
  const tiposPermitidos = ['image/jpeg', 'image/png', 'image/gif'];
  
  if (tiposPermitidos.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de arquivo não permitido'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB máximo
    files: 1 // Apenas 1 arquivo por vez
  }
});

app.post('/upload', 
  autenticado,
  upload.single('imagem'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ erro: 'Nenhum arquivo enviado' });
      }
      
      // Reprocessar imagem (remove EXIF e valida)
      await sharp(req.file.path)
        .resize(1200, 1200, { fit: 'inside' })
        .jpeg({ quality: 80 })
        .toFile(req.file.path + '.processed');
      
      // Mover para armazenamento final (S3, etc)
      // await uploadToS3(req.file.path + '.processed');
      
      // Deletar arquivo temporário
      fs.unlinkSync(req.file.path);
      fs.unlinkSync(req.file.path + '.processed');
      
      res.json({ 
        sucesso: true,
        arquivo: req.file.filename 
      });
      
    } catch (erro) {
      res.status(500).json({ erro: 'Erro ao processar arquivo' });
    }
  }
);

// Servir arquivos de forma segura
app.get('/arquivo/:id', autenticado, async (req, res) => {
  const arquivo = await Arquivo.findById(req.params.id);
  
  // Verifica permissão
  if (arquivo.usuarioId !== req.usuario.id) {
    return res.status(403).json({ erro: 'Sem permissão' });
  }
  
  // Força download ao invés de renderizar
  res.download(arquivo.caminho, arquivo.nomeOriginal);
});
```

---

## 13. Segurança de Sessões e Tokens

**Regras:**

1. **JWT (JSON Web Tokens)**
   - Use algoritmos fortes (RS256, ES256)
   - Defina tempo de expiração curto
   - Implemente refresh tokens
   - Não armazene dados sensíveis no payload

2. **Armazenamento de Tokens**
   - Backend: HttpOnly cookies (melhor opção)
   - Frontend: sessionStorage (não localStorage para tokens de sessão)
   - Nunca em localStorage para dados críticos

3. **Invalidação de Tokens**
   - Blacklist para tokens revogados
   - Use Redis para armazenar blacklist
   - Limpe blacklist após expiração do token

4. **Refresh Tokens**
   - Tokens de longa duração em HttpOnly cookie
   - Rotação de refresh tokens
   - One-time use refresh tokens

**Exemplos:**

```javascript
const jwt = require('jsonwebtoken');
const redis = require('redis');
const redisClient = redis.createClient();

// Gerar tokens
function gerarTokens(usuario) {
  const accessToken = jwt.sign(
    { 
      id: usuario.id, 
      email: usuario.email,
      role: usuario.role 
    },
    process.env.JWT_SECRET,
    { 
      expiresIn: '15m', // Access token curto
      algorithm: 'HS256'
    }
  );
  
  const refreshToken = jwt.sign(
    { id: usuario.id },
    process.env.REFRESH_SECRET,
    { 
      expiresIn: '7d', // Refresh token mais longo
      algorithm: 'HS256'
    }
  );
  
  return { accessToken, refreshToken };
}

// Middleware de autenticação
async function autenticar(req, res, next) {
  try {
    // Token do header ou cookie
    const token = req.cookies.accessToken || 
                  req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ erro: 'Não autenticado' });
    }
    
    // Verifica se está na blacklist
    const blacklisted = await redisClient.get(`bl_${token}`);
    if (blacklisted) {
      return res.status(401).json({ erro: 'Token inválido' });
    }
    
    // Verifica token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = decoded;
    
    next();
  } catch (erro) {
    res.status(401).json({ erro: 'Token inválido' });
  }
}

// Login
app.post('/login', async (req, res) => {
  const { email, senha } = req.body;
  const usuario = await Usuario.findOne({ email });
  
  if (!usuario || !await bcrypt.compare(senha, usuario.senhaHash)) {
    return res.status(401).json({ erro: 'Credenciais inválidas' });
  }
  
  const { accessToken, refreshToken } = gerarTokens(usuario);
  
  // Armazena refresh token em HttpOnly cookie
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: true, // HTTPS apenas
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 dias
  });
  
  res.json({ accessToken });
});

// Refresh token
app.post('/refresh', async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    
    if (!refreshToken) {
      return res.status(401).json({ erro: 'Refresh token não encontrado' });
    }
    
    // Verifica se está na blacklist
    const blacklisted = await redisClient.get(`bl_${refreshToken}`);
    if (blacklisted) {
      return res.status(401).json({ erro: 'Token inválido' });
    }
    
    // Valida refresh token
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET);
    const usuario = await Usuario.findById(decoded.id);
    
    // Gera novos tokens
    const tokens = gerarTokens(usuario);
    
    // Invalida refresh token antigo (one-time use)
    await redisClient.setEx(
      `bl_${refreshToken}`, 
      7 * 24 * 60 * 60, // 7 dias
      'revoked'
    );
    
    // Envia novo refresh token
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });
    
    res.json({ accessToken: tokens.accessToken });
    
  } catch (erro) {
    res.status(401).json({ erro: 'Token inválido' });
  }
});

// Logout
app.post('/logout', autenticar, async (req, res) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  const refreshToken = req.cookies.refreshToken;
  
  // Adiciona à blacklist
  const decoded = jwt.decode(token);
  const tempoRestante = decoded.exp - Math.floor(Date.now() / 1000);
  
  await redisClient.setEx(`bl_${token}`, tempoRestante, 'revoked');
  if (refreshToken) {
    await redisClient.setEx(`bl_${refreshToken}`, 7 * 24 * 60 * 60, 'revoked');
  }
  
  res.clearCookie('refreshToken');
  res.json({ mensagem: 'Logout realizado' });
});
```

---

## 14. Conformidade e Regulamentações

### 14.1 LGPD (Lei Geral de Proteção de Dados)

**Regras:**

1. **Consentimento**
   - Obtenha consentimento claro e específico
   - Permita revogação fácil
   - Documente base legal para cada processamento

2. **Direitos dos Titulares**
   - Acesso aos dados
   - Correção de dados
   - Exclusão (direito ao esquecimento)
   - Portabilidade

3. **Minimização de Dados**
   - Colete apenas o necessário
   - Retenha apenas pelo tempo necessário
   - Anonimize quando possível

4. **Segurança**
   - Medidas técnicas adequadas
   - Criptografia de dados sensíveis
   - Resposta a incidentes

**Exemplos:**

```javascript
// API para direitos LGPD
app.get('/meus-dados', autenticado, async (req, res) => {
  const usuario = await Usuario.findById(req.usuario.id);
  const dados = {
    perfil: usuario.toJSON(),
    historico: await Historico.find({ usuarioId: usuario.id }),
    consentimentos: await Consentimento.find({ usuarioId: usuario.id })
  };
  
  res.json(dados);
});

app.delete('/excluir-conta', autenticado, async (req, res) => {
  const usuarioId = req.usuario.id;
  
  // Anonimizar ao invés de deletar (para integridade de dados)
  await Usuario.update(usuarioId, {
    email: `anonimo_${usuarioId}@deleted.local`,
    nome: 'Usuário Excluído',
    telefone: null,
    cpf: null,
    dataNascimento: null,
    deletedAt: new Date()
  });
  
  // Deletar dados não essenciais
  await Preferencias.delete({ usuarioId });
  await Sessoes.delete({ usuarioId });
  
  res.json({ mensagem: 'Conta excluída' });
});

// Registro de consentimento
app.post('/consentimento', autenticado, async (req, res) => {
  await Consentimento.create({
    usuarioId: req.usuario.id,
    tipo: 'marketing',
    consentido: true,
    timestamp: new Date(),
    ip: req.ip,
    userAgent: req.get('user-agent')
  });
  
  res.json({ sucesso: true });
});
```

---

## 15. Checklist de Segurança

### Antes de Ir para Produção

- [ ] HTTPS configurado e forçado
- [ ] Headers de segurança implementados
- [ ] CSP configurado
- [ ] CORS configurado corretamente
- [ ] Rate limiting implementado
- [ ] Validação de input em todos os endpoints
- [ ] Autenticação e autorização testadas
- [ ] Senhas armazenadas com hash forte
- [ ] Tokens com expiração adequada
- [ ] Logs de segurança configurados
- [ ] Secrets em variáveis de ambiente
- [ ] Dependências atualizadas e auditadas
- [ ] SQL/NoSQL injection protegido
- [ ] XSS protegido
- [ ] CSRF protegido
- [ ] Upload de arquivos validado
- [ ] Backup automático configurado
- [ ] Plano de resposta a incidentes
- [ ] Testes de penetração realizados
- [ ] Conformidade LGPD verificada

### Manutenção Regular

- [ ] Auditoria semanal de dependências
- [ ] Revisão mensal de logs de segurança
- [ ] Atualização trimestral de políticas
- [ ] Teste anual de recuperação de desastres
- [ ] Renovação de certificados SSL
- [ ] Rotação de credenciais

---

## 16. Recursos e Ferramentas

### Ferramentas de Segurança

**Análise de Código:**
- SonarQube
- ESLint com plugins de segurança
- Semgrep
- Snyk Code

**Análise de Dependências:**
- npm audit / yarn audit
- Snyk
- Dependabot (GitHub)
- WhiteSource

**Testes de Segurança:**
- OWASP ZAP
- Burp Suite
- Nikto
- SQLMap

**Monitoramento:**
- Sentry
- LogRocket
- DataDog
- New Relic

### Referências

- **OWASP Top 10**: https://owasp.org/www-project-top-ten/
- **OWASP Cheat Sheets**: https://cheatsheetseries.owasp.org/
- **CWE Top 25**: https://cwe.mitre.org/top25/
- **NIST Cybersecurity Framework**: https://www.nist.gov/cyberframework
- **LGPD**: https://www.gov.br/cidadania/pt-br/acesso-a-informacao/lgpd

---

## Conclusão

Segurança não é um destino, é uma jornada contínua. **Princípios fundamentais:**

1. **Defesa em Profundidade**: Múltiplas camadas de segurança
2. **Menor Privilégio**: Acesso mínimo necessário
3. **Falha Segura**: Falhas devem negar acesso, não conceder
4. **Não Confie, Verifique**: Valide tudo
5. **Simplifique**: Complexidade é inimiga da segurança

**Mantenha-se atualizado**, participe de comunidades de segurança e **sempre questione** suas decisões de implementação pensando em segurança.