# Atribuição de plano alimentar pela biblioteca

Registro dos testes que fiz no painel do coach para atribuir um modelo alimentar a uma aluna.
O foco foi conferir a troca do plano ativo sem deixar duas dietas ligadas ao mesmo tempo.

## O que foi coberto

- seleção de um modelo alimentar salvo na biblioteca;
- revisão e renomeação da ficha antes da confirmação;
- criação da nova dieta para a aluna;
- bloqueio da revisão sem modelo selecionado;
- comportamento esperado quando a desativação do plano atual é recusada.

## Casos

| ID | Cenário | Resultado esperado |
| --- | --- | --- |
| QA-040 | Atribuir um modelo alimentar da biblioteca | A nova dieta é criada e fica ativa; o plano anterior passa a ficar pausado |
| QA-041 | Avançar sem selecionar um modelo alimentar | “Revisar” permanece bloqueado e nenhuma gravação é enviada |
| QA-042 | Falha ao desativar o plano atual | O plano anterior continua ativo, nenhum plano novo é criado e o diálogo permanece aberto |

O passo a passo está em [`docs/cenarios.md`](docs/cenarios.md).

## Resultado da execução

O cenário de validação encontrou uma divergência: a nova dieta é criada, mas o plano anterior não é desativado. A tela termina com duas dietas marcadas como “Dieta ativa”.

Esse resultado foi mantido no teste porque ele representa a regra de negócio esperada e deixa o problema reproduzível para a correção.

## Teste automatizado

O roteiro está em [`cypress/e2e/coach-assign-meal-plan.cy.ts`](cypress/e2e/coach-assign-meal-plan.cy.ts).
As respostas do backend são simuladas para que a execução não altere dados reais.

Com o painel rodando em `http://localhost:8080`:

```bash
npx cypress run --spec cypress/e2e/coach-assign-meal-plan.cy.ts --browser chrome --headless
```

Última execução: 1 cenário aprovado e 2 cenários apontando a divergência da regra.

## Evidência

[Vídeo da execução](evidencias/coach-assign-meal-plan.cy.ts.mp4)

## Próximo passo

Depois da correção, a mesma suíte deve voltar a passar com os três cenários. Em seguida, vale cobrir rollback caso a cópia do plano ou das refeições falhe depois da desativação.
