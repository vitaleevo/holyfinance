# Regras Anti-Alucinação para IA em Desenvolvimento

## 1. **NUNCA Invente APIs ou Bibliotecas**
- ❌ NÃO crie imports de bibliotecas que não existem
- ❌ NÃO invente métodos de frameworks (ex: `.magicMethod()` que não existe)
- ✅ Use APENAS APIs documentadas e verificadas
- ✅ Se não souber se algo existe, PERGUNTE ao desenvolvedor
- ✅ Declare explicitamente quando não tiver certeza: "Não tenho certeza se esta biblioteca suporta X"

## 2. **Mantenha o Escopo Mínimo**
- ❌ NÃO adicione "features extras" não solicitadas
- ❌ NÃO crie classes/funções "que podem ser úteis no futuro"
- ✅ Implemente APENAS o que foi explicitamente pedido
- ✅ Resista à tentação de "melhorar" código que não foi mencionado
- ✅ Se identificar uma melhoria, SUGIRA primeiro, não implemente

## 3. **YAGNI - You Aren't Gonna Need It**
```python
# ❌ ERRADO - Código especulativo
class UserService:
    def get_user(self, id): pass
    def update_user(self, id, data): pass
    def delete_user(self, id): pass  # Não foi pedido!
    def export_users_to_csv(self): pass  # Não foi pedido!
    def send_welcome_email(self): pass  # Não foi pedido!

# ✅ CORRETO - Apenas o necessário
class UserService:
    def get_user(self, id):
        return self.repository.find_by_id(id)
```

## 4. **Não Mude a Lógica de Negócio Sem Permissão**
- ❌ NÃO altere validações existentes
- ❌ NÃO mude regras de cálculo
- ❌ NÃO reinterprete requisitos
- ✅ Se a lógica parecer estranha, PERGUNTE antes de mudar
- ✅ Mantenha exatamente o comportamento atual a menos que seja explicitamente pedido para mudá-lo

## 5. **Evite Over-Engineering**
```python
# ❌ ERRADO - Complexidade desnecessária
class UserFactoryBuilder:
    def __init__(self):
        self.strategies = []
    
    def add_strategy(self, strategy): pass
    def build_factory(self): pass

class UserCreationStrategy(ABC): pass
class SimpleUserStrategy(UserCreationStrategy): pass

# ✅ CORRETO - Simples e direto
class User:
    def __init__(self, name, email):
        self.name = name
        self.email = email
```

## 6. **POO: Apenas Quando Faz Sentido**
- ❌ NÃO crie classes para tudo
- ❌ NÃO force padrões de design onde não são necessários
- ✅ Use classes quando há estado e comportamento relacionados
- ✅ Use funções simples para operações stateless
- ✅ Prefira composição simples a hierarquias complexas

```python
# ❌ ERRADO - POO forçado
class EmailValidator:
    def validate(self, email):
        return '@' in email

validator = EmailValidator()
validator.validate(email)

# ✅ CORRETO - Função simples
def is_valid_email(email):
    return '@' in email
```

## 7. **Não Crie Abstrações Prematuras**
- ❌ NÃO crie interfaces/abstrações "para futura extensibilidade"
- ❌ NÃO extraia código em classes separadas sem motivo claro
- ✅ Espere ter 3+ casos de uso antes de criar abstração
- ✅ Mantenha código inline até que duplicação justifique extração

## 8. **Valide Suas Suposições**
- ❌ NÃO assuma que variáveis existem no escopo
- ❌ NÃO assuma tipos de dados sem verificar
- ❌ NÃO assuma que imports estão disponíveis
- ✅ Verifique o código existente antes de referenciar algo
- ✅ Se não viu a definição, NÃO use

## 9. **Mantenha Consistência com o Código Existente**
```python
# Se o código existente usa:
def get_user_by_id(user_id):
    pass

# ❌ NÃO crie inconsistentemente:
class UserFetcher:
    def retrieve_user_entity(self, identifier):
        pass

# ✅ Siga o mesmo padrão:
def get_order_by_id(order_id):
    pass
```

## 10. **Não Invente Configurações ou Constantes**
- ❌ NÃO crie variáveis de ambiente que não existem
- ❌ NÃO assuma constantes mágicas
- ✅ Use APENAS configurações que você viu no código
- ✅ Pergunte onde buscar configurações se não souber

## 11. **Checklist Antes de Gerar Código**
Pergunte-se:
- [ ] Este código foi EXPLICITAMENTE solicitado?
- [ ] Estou usando APENAS APIs que sei que existem?
- [ ] Estou mantendo o mesmo nível de complexidade do código existente?
- [ ] Estou mudando APENAS o que foi pedido?
- [ ] Esta abstração é realmente necessária AGORA?
- [ ] Estou seguindo os padrões do código existente?

## 12. **Sinais de Alerta - Pare e Revise**
Se você estiver:
- Criando mais de 3 classes novas para uma tarefa simples
- Implementando padrões de design complexos (Factory, Strategy, Builder) sem pedido explícito
- Adicionando funcionalidades "que vão ser úteis"
- Mudando estrutura de dados existente sem motivo claro
- Criando hierarquias de herança profundas
- Usando imports que nunca viu no projeto

**→ PARE. Reavalie. Simplifique.**

## 13. **Declarações de Incerteza**
Sempre que não tiver 100% de certeza, USE:
```python
# Incerto se esta biblioteca tem este método
# Desenvolvedor: confirme se .find_one() existe em sua versão do SQLAlchemy
user = session.find_one(User, id=user_id)
```

## 14. **Regra de Ouro**
> **"O código mais confiável é aquele que não existe. O segundo mais confiável é o mais simples possível que funciona."**

---

## Exemplo Prático: Do Errado ao Certo

### ❌ CÓDIGO ALUCINADO
```python
# Inventa biblioteca
from magic_validator import SuperValidator

# Over-engineering
class UserServiceFactory:
    @staticmethod
    def create_service(strategy='default'):
        if strategy == 'default':
            return DefaultUserService()
        return AdvancedUserService()

class AbstractUserService(ABC):
    @abstractmethod
    def process(self): pass

# Feature não pedida
class DefaultUserService(AbstractUserService):
    def process(self): pass
    def send_notification(self): pass  # Extra!
    def log_analytics(self): pass  # Extra!
```

### ✅ CÓDIGO FUNCIONAL E SIMPLES
```python
# Usa apenas bibliotecas conhecidas do projeto
from models import User

# Implementa apenas o pedido
def get_user(user_id):
    """Busca usuário por ID."""
    return User.query.filter_by(id=user_id).first()
```

---

**Princípio Final**: Quando em dúvida entre fazer algo "esperto" ou algo simples, SEMPRE escolha o simples. A simplicidade é a sofisticação máxima.