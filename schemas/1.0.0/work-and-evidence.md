# Trabalho e estrutura de evidências

Um Work conserva escopo, andamento e decisões em artefatos com papéis diferentes:

```text
works/<id>/
├── brief.yml             escopo, objetivo e condições de entrega
├── state.yml             ciclo, topologia, tarefas e cursor
├── dispatches.yml        decisões leves, só-acréscimo
├── deliberation.yml      índice das QRDs
├── deliberations/
│   └── qrd-<assunto>.md  Q, R e D juntas
└── evidence/
    ├── <documento>.md    explicação humana e limites
    ├── <dados>.csv       material que permite conferir a observação
    └── verification.yml  verificação da entrega, quando aplicável
```

`brief.yml` usa [work-brief.schema.json](work-brief.schema.json), `state.yml` usa [work-state.schema.json](work-state.schema.json) e `dispatches.yml` usa [work-dispatches.schema.json](work-dispatches.schema.json). O índice usa [deliberation-ledger.schema.json](deliberation-ledger.schema.json). A verificação de entrega usa [delivery-verification.schema.json](delivery-verification.schema.json).

Os registros são progressivos: despacho e deliberação surgem quando há o respectivo ato; a árvore não obriga a criar arquivos vazios. Em trabalho vivo, os despachos ficam no arquivo próprio, não em uma segunda lista dentro do estado. Formas históricas mantidas no schema servem à leitura do acervo e têm restrições explicadas em [semantics.md](semantics.md).

**`evidence/` é uma estrutura documental, não um envelope universal.** Seus arquivos podem ser relatórios, dados, imagens e outras provas adequadas à entrega. As referências devem permitir encontrar a fonte e a revisão examinada. Uma contagem de arquivos não comprova completude ou qualidade.

No exemplo, o CSV é identificado no catálogo por `namespace`, `kind`, `id` e revisão igual ao SHA-256 de seus bytes. Esse catálogo associa referências aos anexos do exercício; não cria um novo registro de domínio nem substitui o resolvedor do produto. A verificação da entrega e o resultado observado têm registros distintos.

Estes schemas não publicam protocolos internos de gravação, custódia ou recuperação. Uma cópia local de evidências continua sujeita às suas condições de origem: formato válido não autentica autoria nem comprova uma execução real.
