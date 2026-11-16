# QRD: pergunta, raciocínio e decisão

Uma QRD conserva a pergunta deliberativa (**Q — Question**), os fatos e as alternativas (**R — Reasoning/Research**) e a decisão humana (**D — Decision**) no mesmo arquivo Markdown. A casa física é `deliberations/` de um trabalho concreto. Iniciativa e direção podem ser assuntos relacionados; não substituem esse contêiner.

O cabeçalho do molde canônico possui `artifact: qrd`, `id`, `mode: choice`, `status` e `subject`. O índice `deliberation.yml`, validado por [deliberation-ledger.schema.json](deliberation-ledger.schema.json), conserva referências, estado e relações, sem duplicar Q/R/D.

```markdown
---
artifact: qrd
id: QRD-EXEMPLO-001
mode: choice
status: open
subject: work:delivery/exemplo
---

# QRD-EXEMPLO-001 — Pergunta a examinar

## Q — Question

Qual escolha precisa ser feita e por quê?

## R — Reasoning/Research

Fatos, fontes, alternativas legítimas, custos e riscos.

## D — Decision

Pendente de decisão humana.
```

Quando houver decisão, D registra suas palavras, data e responsável, com o alcance e os limites aplicáveis. Uma sugestão da IA permanece em R até a decisão humana. Nova escolha que supera outra conserva a referência e o alcance; o documento anterior permanece como história.

Este molde é documental, não um JSON Schema do corpo Markdown. O validador público confere cabeçalho, presença e ordem das seções e correspondência com o índice no exemplo; ele não julga a legitimidade do raciocínio nem autentica a pessoa.

[QRD fictícia preenchida](../../examples/primeiro-valor/works/medicao-primeiro-valor/deliberations/qrd-rever-aposta.md).
