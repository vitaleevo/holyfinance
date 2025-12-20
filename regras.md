# Princípios de Desenvolvimento de Software

## DRY (Don't Repeat Yourself)

**Definição:** Não se repita. Cada pedaço de conhecimento deve ter uma representação única, não ambígua e autoritativa dentro de um sistema.

### Regras Completas:

1. **Evite Duplicação de Código**
   - Se você está copiando e colando código, provavelmente está violando DRY
   - Extraia código duplicado para funções, classes ou módulos reutilizáveis

2. **Abstraia Lógica Comum**
   - Identifique padrões repetitivos na sua base de código
   - Crie abstrações apropriadas (funções, classes, componentes)
   - Use herança, composição ou mixins quando apropriado

3. **Centralize Configurações e Constantes**
   - Mantenha valores mágicos em um único lugar
   - Use arquivos de configuração ou variáveis de ambiente
   - Evite hardcoding de valores repetidos

4. **Documente Uma Vez**
   - Mantenha documentação em um único local autoritativo
   - Use geração automática de documentação quando possível
   - Evite duplicar informações em comentários

5. **Não Seja Excessivo**
   - DRY não significa "nunca repetir nada"
   - Às vezes, duplicação é melhor que abstração prematura
   - Considere o contexto: código similar não é sempre código duplicado

### Exemplos:

**❌ Violando DRY:**
```javascript
function calcularDescontoCliente(preco) {
  return preco * 0.9;
}

function calcularDescontoFuncionario(preco) {
  return preco * 0.9;
}
```

**✅ Seguindo DRY:**
```javascript
function calcularDesconto(preco, percentual = 0.1) {
  return preco * (1 - percentual);
}
```

---

## KISS (Keep It Simple, Stupid)

**Definição:** Mantenha as coisas simples. Simplicidade deve ser um objetivo chave no design, e complexidade desnecessária deve ser evitada.

### Regras Completas:

1. **Prefira Soluções Simples**
   - Escolha a solução mais simples que resolve o problema
   - Não engenheirize demais (over-engineering)
   - "Simples" não significa "simplista" ou "incompleto"

2. **Escreva Código Legível**
   - Use nomes descritivos e claros
   - Evite truques desnecessários ou código "inteligente demais"
   - Priorize clareza sobre concisão extrema

3. **Reduza Complexidade Cognitiva**
   - Limite a quantidade de coisas que você precisa manter em mente
   - Quebre problemas complexos em partes menores
   - Use funções pequenas com responsabilidades únicas

4. **Evite Otimização Prematura**
   - Faça funcionar primeiro, otimize depois (se necessário)
   - Meça antes de otimizar
   - "Premature optimization is the root of all evil" - Donald Knuth

5. **Minimize Dependências**
   - Use bibliotecas apenas quando realmente necessário
   - Evite adicionar frameworks pesados para problemas simples
   - Considere o custo de manutenção de cada dependência

6. **Documente o "Porquê", Não o "O Quê"**
   - Código simples é auto-explicativo
   - Explique decisões não-óbvias
   - Documente trade-offs e contexto

### Exemplos:

**❌ Violando KISS (complexidade desnecessária):**
```javascript
const resultado = array.reduce((acc, curr) => 
  [...acc, ...(curr % 2 === 0 ? [curr * 2] : [])], []);
```

**✅ Seguindo KISS:**
```javascript
const resultado = array
  .filter(num => num % 2 === 0)
  .map(num => num * 2);
```

---

## YAGNI (You Aren't Gonna Need It)

**Definição:** Você não vai precisar disso. Não adicione funcionalidade até que seja realmente necessária.

### Regras Completas:

1. **Implemente Apenas o Necessário**
   - Foque nos requisitos atuais, não em "possíveis" requisitos futuros
   - Não adicione features "por precaução"
   - Trabalhe de forma incremental

2. **Evite Generalização Prematura**
   - Não crie abstrações antes de ter 3+ casos de uso
   - Espere até que padrões reais apareçam
   - É mais fácil generalizar depois do que simplificar depois

3. **Não Antecipe Necessidades**
   - Não construa infraestrutura "para quando precisarmos"
   - Não adicione configurações "que podem ser úteis"
   - Não crie hooks ou extensibilidade "só por garantia"

4. **Refatore Quando Necessário**
   - É normal adicionar funcionalidade depois
   - Refatoração é parte do processo
   - Código simples é mais fácil de refatorar

5. **Custo Real de Código Extra**
   - Todo código tem custo de manutenção
   - Aumenta complexidade e superfície de bugs
   - Pode confundir outros desenvolvedores

6. **Exceções Válidas**
   - Segurança e performance crítica podem justificar código preventivo
   - Logging e observabilidade são investimentos válidos
   - Casos de borda conhecidos devem ser tratados

### Exemplos:

**❌ Violando YAGNI:**
```javascript
class Usuario {
  constructor(nome, email) {
    this.nome = nome;
    this.email = email;
    this.telefone = null; // "Pode precisar no futuro"
    this.endereco = null; // "Pode precisar no futuro"
    this.avatar = null;   // "Pode precisar no futuro"
  }
  
  // Métodos que ninguém está usando ainda
  enviarSMS() { /* ... */ }
  validarEndereco() { /* ... */ }
}
```

**✅ Seguindo YAGNI:**
```javascript
class Usuario {
  constructor(nome, email) {
    this.nome = nome;
    this.email = email;
  }
}
// Adicione campos e métodos quando realmente precisar
```

---

## Feature-Based Folder Structure

**Definição:** Organize seu código por features/funcionalidades do negócio, não por tipos técnicos.

### Regras Completas:

1. **Estrutura por Domínio**
   - Agrupe arquivos por feature, não por tipo (controllers, models, etc.)
   - Cada feature deve ser relativamente independente
   - Facilita encontrar todo código relacionado a uma funcionalidade

2. **Organização Típica**
```
src/
├── features/
│   ├── autenticacao/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── types/
│   │   ├── utils/
│   │   └── index.ts
│   ├── produtos/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── types/
│   │   └── index.ts
│   └── carrinho/
│       ├── components/
│       ├── hooks/
│       ├── services/
│       └── index.ts
├── shared/
│   ├── components/
│   ├── hooks/
│   ├── utils/
│   └── types/
└── app/
```

3. **Princípios de Organização**
   - Código compartilhado vai em `/shared` ou `/common`
   - Cada feature exporta sua API pública via `index.ts`
   - Features não devem importar diretamente de outras features (use a API pública)
   - Mantenha features o mais isoladas possível

4. **Granularidade**
   - Features não devem ser muito grandes (máx. 10-15 arquivos)
   - Se crescer muito, divida em sub-features
   - Balance entre muitas pastas pequenas e poucas pastas grandes

5. **Colocalização**
   - Mantenha testes próximos ao código testado
   - Estilos específicos de componentes no mesmo diretório
   - Arquivos relacionados devem estar próximos

6. **Vantagens**
   - Escalabilidade: adicionar features não afeta estrutura existente
   - Manutenibilidade: mudanças ficam contidas
   - Entendimento: estrutura reflete o domínio do negócio
   - Remoção: deletar uma feature é mais fácil

### Exemplo Comparativo:

**❌ Estrutura Técnica (evitar):**
```
src/
├── components/
│   ├── LoginForm.tsx
│   ├── ProductCard.tsx
│   ├── CartItem.tsx
│   └── UserProfile.tsx
├── hooks/
│   ├── useAuth.ts
│   ├── useProducts.ts
│   └── useCart.ts
├── services/
│   ├── authService.ts
│   ├── productService.ts
│   └── cartService.ts
└── types/
    ├── auth.ts
    ├── product.ts
    └── cart.ts
```

**✅ Estrutura por Features:**
```
src/
├── features/
│   ├── auth/
│   │   ├── components/
│   │   │   ├── LoginForm.tsx
│   │   │   └── UserProfile.tsx
│   │   ├── hooks/
│   │   │   └── useAuth.ts
│   │   ├── services/
│   │   │   └── authService.ts
│   │   ├── types/
│   │   │   └── auth.ts
│   │   └── index.ts
│   ├── products/
│   │   ├── components/
│   │   │   └── ProductCard.tsx
│   │   ├── hooks/
│   │   │   └── useProducts.ts
│   │   ├── services/
│   │   │   └── productService.ts
│   │   └── index.ts
│   └── cart/
│       ├── components/
│       │   └── CartItem.tsx
│       ├── hooks/
│       │   └── useCart.ts
│       ├── services/
│       │   └── cartService.ts
│       └── index.ts
└── shared/
    ├── components/
    ├── hooks/
    └── utils/
```

---

## Separation of Concerns (SoC)

**Definição:** Separação de Responsabilidades. Cada módulo/classe/função deve ter uma única responsabilidade bem definida e não deve se preocupar com detalhes de outras responsabilidades.

### Regras Completas:

1. **Princípio da Responsabilidade Única (SRP)**
   - Cada unidade de código deve ter apenas uma razão para mudar
   - "Uma classe deve ter apenas uma responsabilidade"
   - Funções devem fazer apenas uma coisa

2. **Separação em Camadas**
   - **Apresentação (UI):** Apenas exibição e interação do usuário
   - **Lógica de Negócio:** Regras e processamento do domínio
   - **Acesso a Dados:** Comunicação com banco de dados ou APIs
   - Camadas não devem misturar responsabilidades

3. **Arquitetura em Camadas Típica**
```
┌─────────────────────────────────┐
│   Presentation Layer (UI)       │ ← Componentes, Views
├─────────────────────────────────┤
│   Business Logic Layer          │ ← Services, Use Cases
├─────────────────────────────────┤
│   Data Access Layer             │ ← Repositories, APIs
└─────────────────────────────────┘
```

4. **Regras de Dependência**
   - Camadas superiores podem depender de camadas inferiores
   - Camadas inferiores NÃO devem depender de superiores
   - Use inversão de dependência quando necessário

5. **Separação por Tipo de Lógica**
   - **Validação:** Separada da lógica de negócio
   - **Formatação:** Separada dos dados brutos
   - **Transformação:** Isolada em funções puras
   - **Side Effects:** Isolados e controlados

6. **Exemplos de Separação**
   - HTML separado de CSS separado de JavaScript
   - Componentes de UI separados de lógica de estado
   - Queries de banco separadas de regras de negócio
   - Configuração separada de implementação

7. **Benefícios**
   - Facilita testes (pode testar cada camada isoladamente)
   - Melhora manutenibilidade
   - Permite reutilização de código
   - Facilita trabalho em equipe
   - Reduz acoplamento

8. **Padrões Relacionados**
   - MVC (Model-View-Controller)
   - MVVM (Model-View-ViewModel)
   - Clean Architecture
   - Hexagonal Architecture (Ports and Adapters)

### Exemplos:

**❌ Violando SoC (tudo misturado):**
```javascript
function processarPedido(pedidoId) {
  // Validação
  if (!pedidoId) throw new Error('ID inválido');
  
  // Busca de dados
  const pedido = fetch(`/api/pedidos/${pedidoId}`);
  
  // Lógica de negócio
  const desconto = pedido.total > 100 ? 0.1 : 0;
  const totalComDesconto = pedido.total * (1 - desconto);
  
  // Atualização de UI
  document.getElementById('total').innerText = `R$ ${totalComDesconto}`;
  
  // Persistência
  fetch(`/api/pedidos/${pedidoId}`, {
    method: 'PUT',
    body: JSON.stringify({ total: totalComDesconto })
  });
  
  // Notificação
  alert('Pedido processado!');
}
```

**✅ Seguindo SoC (responsabilidades separadas):**
```javascript
// Camada de Validação
function validarPedidoId(id) {
  if (!id) throw new Error('ID inválido');
  return true;
}

// Camada de Dados
class PedidoRepository {
  async buscar(id) {
    return await fetch(`/api/pedidos/${id}`).then(r => r.json());
  }
  
  async atualizar(id, dados) {
    return await fetch(`/api/pedidos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(dados)
    });
  }
}

// Camada de Lógica de Negócio
class PedidoService {
  constructor(repository) {
    this.repository = repository;
  }
  
  calcularDesconto(total) {
    return total > 100 ? 0.1 : 0;
  }
  
  async processar(pedidoId) {
    validarPedidoId(pedidoId);
    
    const pedido = await this.repository.buscar(pedidoId);
    const desconto = this.calcularDesconto(pedido.total);
    const totalComDesconto = pedido.total * (1 - desconto);
    
    await this.repository.atualizar(pedidoId, { 
      total: totalComDesconto 
    });
    
    return { total: totalComDesconto };
  }
}

// Camada de Apresentação
class PedidoUI {
  constructor(service) {
    this.service = service;
  }
  
  atualizarTotal(valor) {
    document.getElementById('total').innerText = `R$ ${valor}`;
  }
  
  mostrarNotificacao(mensagem) {
    alert(mensagem);
  }
  
  async processarPedido(pedidoId) {
    try {
      const resultado = await this.service.processar(pedidoId);
      this.atualizarTotal(resultado.total);
      this.mostrarNotificacao('Pedido processado!');
    } catch (erro) {
      this.mostrarNotificacao(`Erro: ${erro.message}`);
    }
  }
}
```

---

## Aplicando Todos os Princípios Juntos

### Exemplo Completo de Arquitetura

```
src/
├── features/
│   └── pedidos/
│       ├── components/           # UI (SoC)
│       │   ├── PedidoCard.tsx
│       │   └── PedidoLista.tsx
│       ├── hooks/                # Lógica de estado (SoC)
│       │   └── usePedidos.ts
│       ├── services/             # Lógica de negócio (SoC + DRY)
│       │   └── pedidoService.ts
│       ├── repositories/         # Acesso a dados (SoC)
│       │   └── pedidoRepository.ts
│       ├── types/                # Definições (DRY)
│       │   └── pedido.types.ts
│       ├── utils/                # Utilitários (DRY + KISS)
│       │   └── calcularDesconto.ts
│       └── index.ts              # API pública
└── shared/                       # Código compartilhado (DRY)
    ├── components/
    ├── hooks/
    └── utils/
```

### Checklist de Qualidade

Ao escrever código, pergunte-se:

- **DRY:** Estou repetindo esta lógica em outro lugar?
- **KISS:** Esta é a solução mais simples que funciona?
- **YAGNI:** Estou realmente precisando disto agora?
- **Feature-Based:** Este arquivo está no lugar certo?
- **SoC:** Esta função/classe tem apenas uma responsabilidade?

---

## Conclusão

Estes princípios não são regras absolutas, mas **diretrizes** que ajudam a criar código mais:

- ✅ Manutenível
- ✅ Testável
- ✅ Escalável
- ✅ Legível
- ✅ Robusto

Use bom senso e adapte estes princípios ao contexto do seu projeto. Às vezes, quebrar uma regra é a decisão correta, mas você deve saber **por que** está quebrando e quais são as consequências.