# Guilda

**Pessoas decidem. O sistema apoia.**

A **Guilda** é um produto *local-first* de governança de trabalho e decisão que conecta objetivos de negócio ao que os repositórios de um workspace realmente oferecem e precisam.

Em vez de tratar governança como burocracia ou prender o conhecimento do time em um SaaS fechado, a Guilda estrutura a relação entre estratégia, contexto técnico, deliberação humana e evidências verificáveis — mantendo os registros oficiais sob controle de quem usa, versionados em Git.

> **Site oficial e visão do fluxo:** [guilda.pages.dev](https://guilda.pages.dev)

---

## Por que a Guilda existe

Mesmo quando equipes implementam código mais rápido com apoio de Inteligência Artificial, produto, liderança e engenharia continuam precisando responder a perguntas críticas antes e depois da entrega:

- **Contexto:** Já existe alguma capacidade nos nossos repositórios que atende parte desta necessidade? Qual time responde por ela?
- **Maturidade:** Essa capacidade está disponível em produção, planejada ou apenas descrita em documentação?
- **Dependências:** O que depende de outros repositórios ou precisa ser investigado antes de assumir um prazo?
- **Decisão:** Por que escolhemos esta alternativa e descartamos outras?
- **Comprovação:** A entrega técnica terminou, mas há evidência de funcionamento e resultado observado de negócio?

A Guilda organiza esse ciclo de ponta a ponta para apoiar **stakeholders, gestores, produto e engenharia**, usando IA como assistência contextual revisável — nunca como substituta da autoridade humana.

---

## O Ciclo de Negócio e o Grafo Declarativo

A Guilda separa responsabilidades ao longo do ciclo de vida de uma iniciativa:

```text
Objetivo de negócio
        │
        ▼
Contexto e capacidades dos repositórios
        │
        ▼
[ Intent ] ────────► Direção autorizada, propósito e métricas
        │
        ▼
[ Breakdown ] ─────► Grafo revisionado de fases, critérios de saída e dependências
        │
        ▼
[ Work ] ──────────► Entrega materializada na raiz responsável:
        │            • brief.yml (escopo e promessa técnica)
        │            • state.yml (ciclo de vida e checkpoints)
        │            • dispatches.yml (decisões e deliberações humanas — QRDs)
        │            • evidence/ (provas físicas e duráveis da entrega)
        ▼
[ Outcome ] ───────► Observação posterior dos resultados e revisão da aposta
```

### Princípios Fundamentais

1. **Uma fonte responsável para cada informação:** Quadros e mapas são projeções derivadas dos registros canônicos — não existem múltiplas versões concorrentes do progresso.
2. **Proposta não é decisão:** Sugestões geradas por assistência de IA (como o assistente contextual **Cup**) permanecem rascunhos revisáveis; nenhuma IA concede permissão, autoriza trabalho ou aprova entregas sozinha.
3. **Separação entre código, registros e dispositivo:** Os registros compartilhados de governança vivem versionados em Git; caminhos locais, preferências e credenciais permanecem privados no dispositivo do usuário.
4. **Duas escalas de adoção:**
   - **Modo Compacto (`_governance`):** Governança local para uso individual ou pequenos grupos em um repositório.
   - **Workspace Central (`_governance-workspace`):** Coordenação multi-repositório com mapeamento de dependências entre domínios e resolução situada de autoridade (*Authority*).

---

## Arquitetura das Quatro Responsabilidades

A engenharia da Guilda é estruturada para garantir que regras de negócio, contratos e autoridade nunca fiquem acoplados à interface visual:

```text
┌─────────────────────────────────────────────────────────┐
│                     Guilda Kernel                       │
│   Conceitos, ontologia, regras e contratos puros        │
│   (YAML ──► Zod ──► TypeScript & JSON Schema)           │
└────────────────────────────┬────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────┐
│                    Guilda Framework                     │
│   Capacidades públicas e Ports & Adapters reutilizáveis │
└──────────────┬───────────────────────────┬──────────────┘
               │                           │
               ▼                           ▼
┌────────────────────────────┐ ┌──────────────────────────┐
│        Guilda Flow         │ │    Guilda Governance     │
│   CLI para terminal e      │ │  App Desktop local-first │
│   automação operacional    │ │  (React, TS, Tauri/Rust) │
└────────────────────────────┘ └──────────────────────────┘
```

- **Kernel:** Define o significado comum das entidades (*Intent*, *Breakdown*, *Work*, *Authority*, *Evidence*, *Outcome*) e gera schemas tipados para diferentes linguagens.
- **Framework:** Implementa as operações públicas e isola regras de domínio dos efeitos de sistema de arquivos, Git e cofres de credenciais nativos.
- **Flow & Governance Desktop:** São consumidores irmãos do Framework — o aplicativo desktop oferece experiência visual sem depender da CLI como backend.

---

## Estado Atual do Projeto

A Guilda é um produto autoral em desenvolvimento ativo (com foco inicial em **Windows** e **Linux**):

- **Capacidades já integradas na base:** Cadastro e reabertura de iniciativas no aplicativo, preparação assistida e revisável de direção e plano (**Cup**), consulta e publicação de descrições oficiais dos repositórios, resolução situada de autoridade e protocolo de publicação recuperável em arquivos.
- **Frentes em evolução:** Consolidação da jornada conjunta de compreensão do workspace, comparação de prioridades entre iniciativas e acompanhamento completo de resultados (*outcomes*).
- **Origem:** Evoluiu a partir da investigação de governança de engenharia iniciada no framework open-source [ai-guidelines](https://github.com/rosanarezende/ai-guidelines).

---

## Modelo de Ecossistema e Licenciamento

A Guilda adota o modelo **Open-Format & Local-First** combinado com distribuição proprietária:

- **Formato Aberto (*Open-Format*):** Os schemas, contratos de dados e a documentação técnica reunidos neste repositório (`guilda-docs`) são abertos para assegurar transparência, auditabilidade e **zero *vendor lock-in*** — seus registros no Git permanecem legíveis e sob seu controle independentemente do aplicativo.
- **Aplicação e Motor (*Proprietary Binaries*):** O motor de execução e o aplicativo desktop são desenvolvidos em repositório privado e serão distribuídos como binários compilados:
  - **Uso Individual (PF) e Modo Compacto:** Gratuito para uso pessoal, estudos e pequenos grupos colaborando via Git.
  - **Uso Corporativo (PJ) e Multi-Repositório:** Licenciamento comercial voltado a equipes e organizações, sem exigir hospedagem de dados em SaaS externo.
  - **Enterprise Source License:** Disponível sob contrato específico para empresas que precisem auditar ou adaptar o código-fonte internamente.

---

## Autoria e Contato

Idealizado e mantido por **Rosana Rezende** — Engenheira de Software com experiência em Full Stack, Growth Engineering (PLG) e Governança de IA, além de trajetória prévia de 10 anos no Direito Corporativo e MBA em Negócios Digitais pela FGV.

- **Produto:** [guilda.pages.dev](https://guilda.pages.dev)
- **Projeto irmão (Open Source):** [github.com/rosanarezende/ai-guidelines](https://github.com/rosanarezende/ai-guidelines)
- **Portfólio:** [rosanarezende.com](https://rosanarezende.com)
- **LinkedIn:** [linkedin.com/in/rosanarezende](https://linkedin.com/in/rosanarezende)
