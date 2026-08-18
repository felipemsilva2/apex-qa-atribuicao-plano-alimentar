# Atribuição de plano alimentar pela biblioteca

Neste fluxo eu acompanhei a atribuição de um modelo alimentar para uma aluna. A dúvida principal era simples: ao trocar o plano, o anterior realmente deixa de ficar ativo?

## O que eu conferi

- seleção de um modelo alimentar salvo na biblioteca;
- revisão e renomeação da ficha antes da confirmação;
- criação da nova dieta para a aluna;
- bloqueio da revisão sem modelo selecionado;
- comportamento esperado quando a desativação do plano atual é recusada.

## Cenários

| ID | Cenário | Resultado esperado |
| --- | --- | --- |
| QA-040 | Atribuir um modelo alimentar da biblioteca | A nova dieta é criada e fica ativa; o plano anterior passa a ficar pausado |
| QA-041 | Avançar sem selecionar um modelo alimentar | “Revisar” permanece bloqueado e nenhuma gravação é enviada |
| QA-042 | Falha ao desativar o plano atual | O plano anterior continua ativo, nenhum plano novo é criado e o diálogo permanece aberto |

O passo a passo que usei está em [`docs/cenarios.md`](docs/cenarios.md).

## O que aconteceu no teste

Encontrei uma divergência no fluxo positivo: a nova dieta é criada, mas o plano anterior não é desativado. No final, a tela mostra duas dietas como “Dieta ativa”.

Mantive o teste apontando essa falha. Assim o problema continua reproduzível até a correção, em vez de transformar o comportamento atual em regra.

## Como rodei

O roteiro está em [`cypress/e2e/coach-assign-meal-plan.cy.ts`](cypress/e2e/coach-assign-meal-plan.cy.ts). As respostas do backend são simuladas, então a execução não altera uma conta real.

Com o painel rodando em `http://localhost:8080`:

```bash
npx cypress run --spec cypress/e2e/coach-assign-meal-plan.cy.ts --browser chrome --headless
```

Na última execução, 1 cenário passou e 2 registraram a divergência.

## Evidência

[Vídeo da execução](evidencias/coach-assign-meal-plan.cy.ts.mp4)

## Acompanhamento

- [Issue pública no GitHub](https://github.com/felipemsilva2/apex-qa-atribuicao-plano-alimentar/issues/1)
- [Issue no Linear — APE-16](https://linear.app/lupet/issue/APE-16/plano-alimentar-anterior-nao-e-desativado-ao-atribuir-novo-modelo)

## Próximo passo

Depois do ajuste, vou rodar os três cenários de novo. Também vale criar um caso de rollback se a cópia do plano ou das refeições falhar depois da desativação.
