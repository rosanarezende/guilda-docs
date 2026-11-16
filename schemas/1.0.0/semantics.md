# Estrutura, relações e validade semântica

Os JSON Schemas são exportações estruturais dos contratos canônicos, em modo de entrada. Conservam campos, literais, uniões, enums, padrões e limites representáveis pelo conversor. Não substituem as condições do domínio que dependem de conteúdo, cronologia ou outros arquivos.

Os pontos com refinamentos não convertidos estão marcados nos próprios schemas por `$comment`. `nodesWithCustomRefinements`, no manifesto, informa quantos pontos foram encontrados por exportação. Não foram substituídos silenciosamente por uma definição manual concorrente.

## Regras complementares de leitura e auditoria

| Família | O que conferir além da estrutura |
| --- | --- |
| Textos normalizados | Conteúdo não vazio, bordas, normalização NFC, controles e caracteres invisíveis. A prosa tem regra própria para preservar escritas legítimas; identidade e referência têm regra mais estrita. |
| Referências revisionadas | Resolver namespace, tipo, identidade e revisão exata. A revisão é número publicado ou digest; `latest`, `HEAD` e `main` não nomeiam uma revisão imutável do registro. |
| Iniciativa | Referência anexa declara caminho ou URL. O caminho local fica em `references/`, sem caminho absoluto, segmentos vazios, `.` ou `..` e sem barras invertidas. A hipótese do exemplo é conteúdo contextual, não campo criado na Intent. |
| Triagem | A ordem das revisões é só-acréscimo; `base-revision` não decresce e precisa corresponder à iniciativa examinada. A revisão vigente é a última entrada. |
| Ativação | Promover exige elegibilidade satisfeita e efeito de materializar a direção. Rejeitar ou devolver para trabalho não carrega esse efeito. Conferir os hashes da iniciativa e da análise examinadas. |
| Intent | Preservar origem e decisão de ativação. Métrica e alvo, quando declarados, resolvem revisões existentes. `paused` declara data e trabalho planejado como gatilho; retomar continua ato humano. |
| Breakdown | Identidades de critérios, fases, rotas e trabalhos não se duplicam. Referências precisam resolver, e dependências não podem formar ciclos. Fases, quando presentes, cobrem os critérios e trabalhos declarados sem fases implícitas; a ordem respeita dependências. Rotas se vinculam à definição revisionada e à prova correspondente. |
| Brief | O tipo do trabalho escolhe a variante de brief. Verificação imediata de valor declara sinal e critério; diferida declara janela e acompanhamento; inaplicável declara justificativa. |
| Estado | Combinação de tipo, status e fase precisa ser válida. Cursor resolve nó, checkpoint e tarefa existentes e não permanece numa etapa encerrada enquanto a execução segue ativa. Nó concluído não contém tarefa inacabada. |
| Histórico no estado | Papéis antigos, `note` de tarefa e `dispatch-log` incorporado têm limites de leitura do acervo, não são atalhos para novos registros. Trabalho vivo usa notas só-acréscimo e despachos em arquivo próprio. Datas das notas existem no calendário e não decrescem na parte civil; texto não é normalizado silenciosamente. |
| Revisões registradas no estado | Referência de execução e bloco de execução não coexistem como duas contas. Dispensa de revisão e registro de dispensa precisam concordar; identificadores históricos têm limites de acervo. Esses são dados persistidos do usuário, não o protocolo interno que os executa. |
| Despachos | Data e prefixo do identificador concordam; datas não decrescem. Responsável é humano. Desde 2026-08-22, declarar nó resolvido e a escolha da pessoa, sem substituí-la por narrativa do executor. As palavras reconhecidas pela guarda de narrativa atual são em português. |
| QRD e índice | Q/R/D permanecem juntas; o índice aponta para o arquivo e conserva a disposição. Aberta ou em pesquisa declara alvo bloqueado ou caráter consultivo com motivo. Retirada tem justificativa; superada identifica sucessora. Decidida precisa de registro de decisão, embora o leitor canônico preserve um limite histórico de aceitação de índice com referência nula. |
| Métrica e alvo | Procedimento precisa ser reproduzível. Situação inicial não medida declara motivo; não se preenche zero para suprir ausência. O valor atual do alvo é derivado do resultado válido. |
| Resultado observado | Datas existem e a janela é ordenada. O instante observado cai dentro da janela, inclusive seus limites. Atestadores não se repetem. Fontes, evidências e alvo resolvem revisões existentes; sua autenticidade e adequação exigem exame próprio. |
| Verificação e veredito | Verificação imediata de valor tem evidência; diferida tem acompanhamento; inaplicável tem motivo. Veredito é decisão sobre o resultado, distinta de concluir tarefas, atingir uma meta ou comprovar causalidade. |

As combinações de ciclo do estado são: entrega e manutenção passam por rascunho, execução e verificação antes de fechado; experimento inclui desenho, execução do experimento e avaliação; incidente inclui declaração, mitigação, estabilização, resolução e revisão; investigação tem enquadramento, execução e fechamento. Os valores exatos admitidos estão nos enums do schema, e as combinações canônicas são discriminadas na tabela abaixo.

| Tipo | Pares `status/phase` admitidos |
| --- | --- |
| `delivery` | `draft/shaping`, `draft/ready`, `active/executing`, `active/verifying`, `done/closed` |
| `maintenance` | `draft/scoping`, `draft/ready`, `active/executing`, `active/verifying`, `done/closed` |
| `experiment` | `draft/designing`, `draft/ready`, `active/designing`, `active/ready`, `active/running`, `active/evaluating`, `done/closed` |
| `incident` | `active/declared`, `active/mitigating`, `active/stabilized`, `active/resolving`, `active/reviewing`, `done/closed` |
| `exploration` | `draft/shaping`, `active/executing`, `done/closed` |

## Alcance do validador público

O comando sem argumentos confere este pacote e seu cenário: hashes, formas, resolução das referências, bases da ativação, correspondência dos trabalhos e do índice de QRDs, janelas e cálculo do CSV. Não implementa todos os refinamentos ou todas as regras de um workspace arbitrário. `--schema` confere a estrutura de um arquivo próprio, sem presumir a existência de suas fontes externas.

As regras acima permitem que ferramentas independentes complementem a auditoria. O código dos validadores originais, os mecanismos de autorização e os protocolos de escrita permanecem privados. A compatibilidade estrutural não é prova de aceite operacional.
