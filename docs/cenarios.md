# Cenários de teste — atribuição de plano alimentar pela biblioteca

## QA-040 — atribuir um modelo alimentar

**Pré-condição:** coach autenticado, modelo alimentar disponível e plano ativo para a aluna.

1. Abrir o perfil da aluna na aba “Dieta”.
2. Selecionar “Atribuir”.
3. Escolher “Plano alimentar equilibrado”.
4. Avançar para a revisão e alterar o nome para “Plano alimentar - Marina”.
5. Confirmar a atribuição.

**Esperado:** o plano atual é desativado, uma cópia independente é criada com o nome informado e a nova dieta aparece como ativa. O modelo da biblioteca continua disponível.

**Resultado observado:** a cópia é criada, mas o plano atual continua ativo. A tela mostra duas dietas ligadas.

## QA-041 — bloquear avanço sem modelo

**Pré-condição:** janela “Atribuir plano” aberta na opção “Nutrição”.

1. Não escolher nenhum modelo.
2. Conferir o botão “Revisar”.

**Esperado:** o botão permanece desabilitado e nenhuma chamada de desativação ou criação é enviada.

## QA-042 — recusar a desativação do plano atual

**Pré-condição:** aluna com um plano ativo e backend recusando a atualização por permissão.

1. Escolher um modelo da biblioteca.
2. Avançar para a revisão e confirmar a atribuição.

**Esperado:** a tentativa de desativação é feita, o plano atual continua ativo, nenhum novo plano é criado e o diálogo permanece aberto.

**Resultado observado:** nenhuma tentativa de desativação é enviada antes da busca do modelo. O cenário fica registrado como falha de regra.

## Próxima cobertura

Após corrigir a troca do plano ativo, ainda será necessário validar rollback quando a desativação passa, mas a cópia do plano ou das refeições falha depois.
