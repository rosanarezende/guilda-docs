# Formatos abertos dos registros da Guilda

Esta pasta publica os contratos de dados que permitem **ler, conservar, inspecionar e integrar registros sem executar o aplicativo proprietário**. O formato aberto separa o acesso à informação da disponibilidade do produto que a escreveu.

Os JSON Schemas, o manifesto e o validador independente são disponibilizados sob **[MIT](LICENSE)**. A [licença documental](../LICENSE) cobre os textos explicativos e os exemplos. Nenhuma dessas licenças abrange o código-fonte privado, o motor, o aplicativo desktop, os serviços ou as marcas da Guilda.

## O ciclo completo

```text
tese e objetivo de negócio
          ↓
iniciativa: problema, hipótese, referências e dúvidas
          ↓
triagem e decisão de ativação
          ↓
direção autorizada → plano → trabalhos e evidências
          ↓
resultado observado → veredito e nova deliberação

métrica + alvo + situação inicial + janela de observação
                   sustentam a medição
```

Uma proposta inicial é opcional: a iniciativa pode nascer por cadastro direto. O [cenário de primeiro valor](../examples/primeiro-valor/README.md) usa esse caminho e explicita a comparação de alternativas em sua investigação. Este pacote publica os formatos necessários ao cenário, sem pretender cobrir todos os registros possíveis do ecossistema.

## Contratos publicados

Os arquivos estão na pasta **[1.0.0](1.0.0/manifest.json)**. O manifesto associa cada exportação ao símbolo canônico, à revisão fixa da fonte e às impressões digitais dos arquivos.

| Registro | Contrato | Informação conservada |
| --- | --- | --- |
| Tese | [business-thesis](1.0.0/business-thesis.schema.json) | Enquadramento e oportunidades exploradas. |
| Objetivo | [business-objective](1.0.0/business-objective.schema.json) | Efeito pretendido, responsável, período e relações. |
| Métrica | [metric-definition](1.0.0/metric-definition.schema.json) | Unidade, fonte, agregação e procedimento reproduzível. |
| Alvo | [business-target](1.0.0/business-target.schema.json) | Objetivo, métrica, valor esperado, situação inicial e janela. |
| Iniciativa | [initiative](1.0.0/initiative.schema.json) | Problema, hipótese em contexto, condições, desconhecidos e referências. |
| Análise da iniciativa | [triage](1.0.0/triage.schema.json) | Histórico de análises, dúvidas, viabilidade e disposição. |
| Decisão de ativação | [activation-decision](1.0.0/activation-decision.schema.json) | Base examinada, escolha, justificativa e efeito declarado. |
| Direção autorizada — Intent | [intent](1.0.0/intent.schema.json) | Origem, enquadramento, objetivo e referências à métrica e ao alvo. |
| Plano — Breakdown | [breakdown](1.0.0/breakdown.schema.json) | Critérios, fases opcionais, trabalhos, dependências e rotas declaradas. |
| Escopo do trabalho | [work-brief](1.0.0/work-brief.schema.json) | `brief.yml`, com as variantes canônicas por tipo de trabalho. |
| Estado do trabalho | [work-state](1.0.0/work-state.schema.json) | `state.yml`: ciclo, topologia, tarefas, cursor e evidências. |
| Despachos | [work-dispatches](1.0.0/work-dispatches.schema.json) | `dispatches.yml`: decisões leves em lista só-acréscimo. |
| Índice de deliberações | [deliberation-ledger](1.0.0/deliberation-ledger.schema.json) | `deliberation.yml`: referências e disposição das QRDs. |
| Verificação da entrega | [delivery-verification](1.0.0/delivery-verification.schema.json) | Critérios examinados, revisão e referências de evidência. |
| Resultado observado | [outcome](1.0.0/outcome.schema.json) | Valor, fonte, janela e atestadores declarados. |
| Veredito do resultado | [outcome-verdict](1.0.0/outcome-verdict.schema.json) | Aceite, recusa ou necessidade de evidência, com justificativa. |

**QRD é um documento Markdown**, com cabeçalho YAML e as seções Q, R e D juntas. Seu [contrato documental](1.0.0/qrd.md) e seu índice são complementares; não existe aqui um JSON inventado para substituir o corpo da deliberação. A estrutura de [Work e evidence/](1.0.0/work-and-evidence.md) também é documentada.

## Versão e fidelidade à fonte

O pacote público tem versão `1.0.0`; os registros que já possuem `schemaVersion` conservam `guilda.governance/v1`. Brief, estado, despachos e índice de QRDs não ganham um campo de versão que o contrato original não possui. O catálogo do exemplo indica qual versão de schema utilizar para cada arquivo.

Os JSON Schemas foram exportados da revisão `e21899593afe4fd14dfd46e7c3cd2952f40be47c` da linha `main` da Guilda, com o conversor do Zod em modo de entrada e dialeto JSON Schema 2020-12. O manifesto registra os blobs de todas as fontes carregadas. A exportação não copia o código das funções nem depende da candidata de produto em andamento.

Os arquivos versionados devem ser preservados; uma revisão do pacote deve receber outra pasta de versão, seu manifesto e nota de compatibilidade. Novos formatos não são adicionados silenciosamente a uma versão já publicada. O aplicativo não precisa estar instalado para usar estes arquivos.

## Validar sem o produto privado

Com Node.js 22.18 ou superior:

```bash
npm ci
npm run check
```

Para conferir somente o formato de seus próprios registros:

```bash
npm run validate -- --schema schemas/1.0.0/intent.schema.json caminho/intent.yml
```

Outro validador compatível com JSON Schema 2020-12 também pode consumir os arquivos diretamente. O validador deste repositório usa Ajv e YAML, sem dependência da Guilda privada. Após instalar as dependências, a conferência é local; não envia registros a serviços externos.

## O que a prova cobre

A conferência pública verifica integridade dos schemas, estrutura dos exemplos, referências locais e revisionadas, índices das QRDs e o cálculo da medição sintética. Ela não concede poderes, não publica registros e não comprova operação do aplicativo, autenticidade das decisões ou causalidade no negócio.

Refinamentos de semântica não são convertidos automaticamente em JSON Schema. Os pontos afetados estão marcados com `$comment`; as regras complementares estão em [semantics.md](1.0.0/semantics.md). Além da prova pública, os exemplos desta exportação foram conferidos contra os validadores canônicos originais, incluindo seus refinamentos.

O compromisso de evitar dependência do fornecedor, neste pacote, é **a leitura e a auditoria independente dos registros publicados**. Não equivale a fornecer outra implementação do aplicativo ou a afirmar cobertura de formatos ainda não publicados.

Contratos de execução interna, resolução de autoridade, protocolos de publicação recuperável, credenciais, configuração privada do dispositivo e montagem interna do contexto do Cup não integram esta exportação. Referências de pessoa, evidência ou decisão presentes nos próprios registros continuam legíveis; elas não revelam os algoritmos que executam esses atos.

Referências técnicas: [conversão oficial do Zod](https://zod.dev/json-schema), [JSON Schema 2020-12](https://json-schema.org/draft/2020-12).
