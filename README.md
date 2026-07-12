# SISAVALIA

Sistema inicial para avaliacao imobiliaria por inferencia estatistica, orientado ao fluxo de laudos tecnicos do SisAvalia e aos requisitos da ABNT NBR 14653.

## Como abrir

Abra `index.html` no navegador.

O sistema inicia com um laudo em branco. O botao `↻` na barra superior carrega dados ficticios apenas para demonstracao e testes.

## Publicacao no Render

O repositorio inclui `render.yaml` para publicar o SISAVALIA como um unico servico
Python/FastAPI no Render. Esse servico entrega a interface web e as APIs internas
no mesmo dominio publico, evitando chamadas para `127.0.0.1` em producao.

No painel do Render, use `New > Blueprint`, conecte o repositorio GitHub e
confirme o servico `sisavalia-mma` e o banco `sisavalia-db`. A variavel
`SISAVALIA_GOOGLE_MAPS_API_KEY` deve ser preenchida manualmente no Render e nunca
versionada no GitHub.

## Escopo desta primeira versao

- Cadastro de Ordem de Servico.
- Cadastro completo e editavel do imovel avaliando, documentacao, terreno, edificacao, vistoria, mercado e conclusao.
- Campos principais do avaliando para quartos, suites, banheiros e vagas.
- Consulta automatica de CEP para preencher logradouro, bairro, municipio, UF e codigo IBGE, sem interferencia direta no valor calculado.
- Cadastro manual de amostras de mercado.
- Importacao de amostras por CSV/TSV exportado do Excel.
- Saneamento de amostras com status `aprovada`, `pré-validação` ou `rejeitada`, motivo de rejeição e controle de evidência fotográfica.
- Regressao linear multipla sobre `ln(valor unitario)`.
- Selecao de variaveis independentes e transformacoes (`x`, `ln(x)`, `1/x`, `sqrt(x)`, `x²`).
- Catalogo técnico de variáveis com tipo, hipótese esperada e regra de uso.
- Diagnostico estatistico auxiliar: normalidade, outliers, multicolinearidade, significancia, micronumerosidade e status geral.
- Exclusao controlada e registrada de variaveis sem variacao ou com dependencia linear exata, evitando falha por matriz singular.
- Calculo de valor unitario, valor total, intervalo de confianca de 80% e graus estimados.
- Painel `Projeção TS-SISREG` com valor central, IC 80%, campo de arbitrio de 15%, valor adotado e justificativa.
- Upload local de fotos do avaliando e mapa/croqui para compor a documentacao fotografica do laudo.
- Checklist inicial ABNT/SisAvalia.
- Revisao automatica do laudo com pendencias criticas, alertas tecnicos, conferencias manuais e atalhos de correcao.
- Previa completa e exportacao do laudo em PDF A4 ou HTML no template MMA, incluindo campos do modelo SisAvalia, resultados, diagnosticos, graficos, amostras e memoria de calculo.
- Gestao local de projetos com salvar, abrir, excluir e backup/importacao em JSON.
- Tela inicial de acesso administrativo com sessao por aba e identidade visual MMA.

## Base documental lida

Os textos extraidos dos PDFs ficam em `tmp/pdfs/extracted/` para consulta durante o desenvolvimento.

## Proximos passos tecnicos

- Suporte direto a arquivos `.xlsx`.
- Ampliar as variaveis importadas: endereco, telefone, data, coordenadas, quartos, suites, vagas, idade e fotos.
- Implementar ART/RRT, anexos fotograficos e mapa/croqui.
- Persistir projetos, anexos e laudos em banco de dados no ambiente de producao.

## Motor de busca de amostras (fundacao)

O repositorio possui uma fundacao isolada em `backend/` para validacao, deduplicacao e consolidacao de ofertas. A arquitetura e o contrato de dados estao documentados em `docs/motor-de-busca-arquitetura.md`.

O motor possui um conector modular para a API oficial do Mercado Livre. A consulta real só é habilitada com credencial OAuth no backend, e nenhuma oferta coletada entra automaticamente na inferência: validação, deduplicação e aprovação humana continuam obrigatórias.

Os testes das regras puras podem ser executados sem iniciar o servidor:

```bash
cd backend
PYTHONPATH=. python -m unittest discover -s tests -v
```

O backend inclui um ambiente PostgreSQL/PostGIS por Docker Compose, um conector local com ofertas fictícias e o conector oficial do Mercado Livre. Ambos retornam resultados pendentes de aprovação humana.

## Importacao de amostras

Na secao `Amostras de Mercado`, use `Modelo CSV` para baixar uma planilha-base. O importador aceita CSV/TSV com as colunas:

O comando `Modelo Excel` baixa uma planilha `.xlsx` formatada e validada com essas mesmas seis colunas. Depois do preenchimento, salve uma copia como `CSV UTF-8` para importar no sistema.

- `fonte`
- `preco`
- `area`
- `local`
- `padrao`
- `conservacao`
- `tem_foto` opcional
- `status_validacao` opcional: `aprovada`, `prevalidacao` ou `rejeitada`
- `motivo_rejeicao` opcional

Os campos `local`, `padrao` e `conservacao` aceitam notas `1`, `2` ou `3`, ou textos como `periferica`, `normal`, `central`, `baixo`, `medio`, `alto`, `regular`, `bom` e `novo`.

Amostras marcadas como `rejeitada` permanecem documentadas, mas nao entram na regressao.

## Modelo inferencial

Na secao `Modelo Inferencial`, o painel `Variaveis e Transformacoes` permite ativar/desativar cada variavel independente e escolher a escala usada no modelo:

- `x`
- `ln(x)`
- `1/x`
- `sqrt(x)`
- `x²`

O seletor `Variavel dependente` permite escolher entre:

- `ln(valor unitario)`, isto e, `ln(preco / area)`;
- `ln(preco total)`, mantendo valor total e valor unitario derivados na memoria e no laudo.

A escolha e salva no projeto. Projetos antigos sem essa configuracao continuam abrindo no modo de valor unitario.

O painel `Catalogo tecnico das variaveis` mostra tipo, transformacao, hipotese esperada e regra de uso de cada variavel, facilitando a defesa tecnica do modelo.

O painel `Projecao TS-SISREG` separa tendencia central, intervalo de confianca de 80%, campo de arbitrio de 15%, valor adotado e justificativa. Quando o valor adotado diverge da tendencia central, o laudo indica que o valor medio nao foi adotado.

## Diagnostico estatistico

O painel `Diagnostico Estatistico` apresenta leitura auxiliar do modelo:

- normalidade dos residuos por faixas aproximadas de 68%, 90% e 95%;
- outliers por residuos padronizados acima de `|2|` e `|3|`;
- multicolinearidade por correlacoes entre variaveis independentes com `|r| >= 0,80`;
- significancia das variaveis pelo teste t de Student com os graus de liberdade do modelo;
- significancia global pelo teste F de Snedecor;
- micronumerosidade por minimos de grau I, II e III;
- diagnostico geral consolidado.

Esses indicadores apoiam a revisao tecnica, mas nao substituem a responsabilidade do avaliador.

## Enquadramento normativo

O quadro `Enquadramento Normativo` aplica os seis itens da tabela de fundamentacao e os limites da tabela de precisao da NBR 14653-2:2011. Os itens 2, 4, 5 e 6 sao calculados pelo sistema; os itens 1 e 3 exigem declaracao de evidencia pelo responsavel tecnico. A conferencia da coleta permanece registrada como controle complementar, mas nao integra a pontuacao normativa.

O grau global considera pontuacao, itens obrigatorios, extrapolacao, teste t e teste F. Quando Local, Padrao ou Conservacao participam como codigos alocados, o sistema verifica a micronumerosidade de cada categoria (para `n <= 30`, pelo menos tres dados por categoria). Os criterios de atribuicao devem ser explicitados no laudo e nao se admite extrapolacao desses codigos. A precisao e classificada separadamente pela amplitude do intervalo de confianca de 80%: grau III ate 30%, grau II ate 40% e grau I ate 50%. Projetos antigos ficam com o enquadramento `Pendente` ate que as evidencias manuais sejam informadas.

## Revisao automatica do laudo

Na secao `Previa do Laudo`, o sistema consolida verificacoes cadastrais, coerencia de datas e areas, quantidade e identificacao das amostras, extrapolacao da area, enquadramento, poder explicativo, diagnosticos e validade do resultado. O parecer e atualizado durante o preenchimento e separa itens criticos, alertas e verificacoes que dependem do responsavel tecnico.

Fotos do avaliando e mapa/croqui podem ser anexados na propria secao do laudo. Os anexos sao preservados no backup local do projeto e aparecem na documentacao fotografica do preview/exportacao.

## Campos do laudo

Na secao `Imovel Avaliando`, os grupos expansiveis permitem editar os campos formais exibidos nas paginas do laudo. Alteracoes cadastrais e descritivas atualizam a previa sem apagar o modelo. Alteracoes em area construida, localizacao, padrao ou conservacao invalidam o resultado anterior e exigem novo calculo.

O campo `CEP`, em `Identificacao e documentacao`, consulta o servico ViaCEP ao completar oito digitos. Os dados retornados permanecem editaveis para conferencia do avaliador e servem somente como apoio cadastral e territorial.

## Exportacao em PDF

O comando `Gerar PDF` executa a revisao automatica, bloqueia laudos com pendencias criticas e abre o dialogo de impressao com somente as 11 paginas do laudo. Selecione o destino `Salvar como PDF`; o papel A4, as margens zeradas, a paginacao e o template MMA sao aplicados automaticamente. O comando `Exportar HTML` permanece disponivel como copia digital independente.

## Documentacao operacional

- `docs/checklist-producao-github-render.md`: roteiro de commit, push, Render, variaveis de ambiente, banco e seguranca.
- `docs/validacao-normativa-e-testes.md`: roteiro de testes para inferencia, amostras, anexos, laudo e gestao.
- `docs/banco-brasil-laudo-referencia.md`: referencia de estrutura de laudo Banco do Brasil.
- `docs/ts-sisreg-referencia-operacional.md`: referencia operacional inspirada no fluxo TS-SISREG.

## Projetos salvos

Na secao `Projetos Salvos`, informe um nome e use `Salvar projeto`. O armazenamento local preserva todos os campos, amostras e configuracoes do modelo neste navegador. O comando `Abrir` restaura o projeto e recalcula o modelo; `Exportar backup` gera um arquivo JSON, que pode ser recuperado por `Importar projeto` em outro navegador ou computador.

## Controle de acesso

O sistema possui bloqueio inicial de sessao com usuario administrativo. A credencial e validada por hash no navegador e a sessao termina ao usar `Sair` ou fechar a aba. Por se tratar de um site estatico, esse mecanismo e uma barreira de acesso basica; protecao de dados sensiveis em ambiente de producao requer autenticacao em servidor.
