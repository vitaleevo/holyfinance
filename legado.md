# Regras para IA Trabalhar com Código Legado

Aqui estão diretrizes essenciais para trabalhar com código legado de forma segura:

## 1. **Entenda Antes de Modificar**
- Leia e analise todo o código relacionado antes de fazer qualquer mudança
- Identifique dependências, chamadas de função e efeitos colaterais
- Pergunte sobre o contexto e objetivo do código se algo não estiver claro
- Nunca assuma que código "feio" está errado - pode haver razões históricas importantes

## 2. **Mudanças Incrementais e Isoladas**
- Faça uma alteração por vez, nunca múltiplas modificações simultâneas
- Mantenha commits pequenos e bem documentados
- Teste cada mudança antes de prosseguir para a próxima
- Se possível, use feature flags para mudanças maiores

## 3. **Preserve Comportamento Existente**
- Mantenha a mesma interface pública (assinaturas de funções, APIs)
- Não altere valores de retorno esperados sem confirmação explícita
- Respeite convenções e padrões já estabelecidos no código
- Documente qualquer breaking change claramente

## 4. **Teste Extensivamente**
- Execute todos os testes existentes antes e depois de cada mudança
- Crie testes para código que não tem cobertura antes de modificá-lo
- Teste casos extremos e fluxos de erro
- Faça testes manuais em ambientes de staging quando apropriado

## 5. **Documente Tudo**
- Comente o porquê das mudanças, não apenas o que foi mudado
- Mantenha um changelog das alterações realizadas
- Documente qualquer comportamento não-óbvio descoberto
- Preserve comentários existentes que contenham conhecimento de negócio

## 6. **Evite Refatorações Ambiciosas**
- Resista à tentação de "reescrever tudo"
- Refatore apenas o necessário para a tarefa atual
- Não misture refatoração com mudanças de funcionalidade
- Prefira melhorias graduais a grandes reestruturações

## 7. **Mantenha Compatibilidade**
- Não remova código aparentemente não usado sem investigação profunda
- Mantenha suporte a configurações e parâmetros legados quando possível
- Use padrões de deprecação adequados antes de remover funcionalidades
- Considere que pode haver integrações externas não documentadas

## 8. **Questione e Comunique**
- Sempre pergunte quando não tiver certeza sobre o impacto de uma mudança
- Comunique riscos potenciais antes de implementar mudanças arriscadas
- Busque revisão de código de pessoas familiarizadas com o sistema
- Documente decisões técnicas importantes

## 9. **Tenha um Plano de Rollback**
- Mantenha a capacidade de reverter mudanças rapidamente
- Documente como desfazer cada alteração significativa
- Faça backup ou tags de versões estáveis
- Implemente mudanças em horários que permitam monitoramento

## 10. **Respeite o Código Existente**
- Assuma que desenvolvedores anteriores eram competentes e tinham boas razões
- Procure entender decisões de design antes de julgá-las
- Preserve otimizações existentes que você não entende completamente
- Mantenha consistência com o estilo do código existente

---

**Princípio Fundamental**: Em código legado, é melhor fazer nada do que quebrar algo que funciona. Quando em dúvida, peça orientação antes de proceder.