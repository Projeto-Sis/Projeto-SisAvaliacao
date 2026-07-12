# Referencia operacional TS-SISREG para aprimoramento do SISAVALIA

Este documento registra apenas informacoes observadas de forma passiva no instalador
`TS-Setup (1.7.3).msi`, sem execucao do instalador, sem engenharia reversa de
codigo e sem tentativa de burlar licenca ou protecao. O objetivo e orientar a
aderencia operacional do SISAVALIA ao fluxo de trabalho usado em laudos para
credito imobiliario.

## Identificacao do instalador analisado

- Produto: TS-Sisreg
- Versao: 1.7.3
- Fabricante: Tecsys Engenharia LTDA
- Tipo: Windows Installer / MSI
- Criado com: Windows Installer XML Toolset 3.14
- Data indicada no MSI: 16/06/2025

## Estrutura documental e operacional identificada

O instalador indica que o TS-Sisreg possui uma arquitetura orientada por modelos,
templates e arquivos de configuracao. Foram identificados os seguintes grupos:

### Programa e atualizacao

- `TS-Sisreg.exe`
- `TS-Update.exe`
- `UpdUpdate.exe`
- Registro em `Software\TS-Sisreg`
- Endereco de atualizacao no dominio da Tecsys

### Manual e ajuda

- `TS-Sisreg.pdf`
- `TS-Sisreg.HLP`
- Atalho "Manual de instrucao do TS-Sisreg"

### Relatorios

- `relatorio_dados.rtf`
- `relatorio_avaliacao.rtf`
- `relatorio_completo.rtf`
- `relatorio_aderencia.rtf`

### Configuracoes e variaveis

- `ts-sisreg.conf`
- `Variaveis.tsv`
- `Conf_relatorios`

### Modelos e exemplos

O instalador associa a extensao `.tsr` ao TS-Sisreg e inclui modelos/exemplos,
indicando que o fluxo e fortemente baseado em arquivos de modelo:

- `Salas.tsr`
- `Casas.tsr`
- `Lotes.tsr`
- `Locacoes.tsr`
- `Lojas.tsr`
- `Anexo.tsr`
- `Interacao.tsr`
- `Apto-Suite.tsr`
- `Casas-geral.tsr`
- `Sobrados.tsr`
- `Lotes-StaMaria.tsr`
- `Conjuntos.tsr`
- Pastas ou grupos de exemplos: `Basico`, `Avancado`, `ExemplosTS`

## Aprendizados para o SISAVALIA

### 1. Separar claramente dados, avaliacao, completo e aderencia

O TS-Sisreg aparenta trabalhar com relatorios separados para:

- dados;
- avaliacao;
- relatorio completo;
- aderencia.

No SISAVALIA, isso recomenda manter o laudo estruturado em blocos exportaveis,
com uma memoria de calculo e uma pagina/aba propria de aderencia observado x
calculado.

### 2. Tratar variaveis como catalogo configuravel

A existencia de `Variaveis.tsv` sugere um cadastro/tabulacao de variaveis. No
SISAVALIA, devemos evoluir para um catalogo editavel contendo:

- nome da variavel;
- tipo: quantitativa, dicotomica, proxy, codigo alocado;
- transformacoes permitidas: x, ln(x), 1/x etc.;
- regra de preenchimento;
- regra de justificativa no laudo;
- exigencia de micronumerosidade, quando aplicavel.

### 3. Criar modelos por tipo de imovel

Os arquivos `.tsr` por tipologia indicam que o TS-Sisreg opera com modelos de
partida para casas, apartamentos/suites, lotes, lojas, salas, conjuntos e
locacoes. No SISAVALIA, recomenda-se criar predefinicoes por tipologia:

- Casa;
- Apartamento;
- Terreno/lote;
- Loja;
- Sala comercial;
- Conjunto comercial;
- Locacao.

Cada predefinicao deve sugerir variaveis, transformacoes e campos obrigatorios.

### 4. Manter memoria de calculo completa

Para aderencia ao fluxo TS-SISREG/Banco do Brasil, a memoria do SISAVALIA deve
sempre explicitar:

- equacao do modelo;
- variavel dependente;
- variaveis independentes;
- transformacoes;
- coeficientes;
- numero de dados utilizados;
- numero de variaveis independentes;
- R2 ajustado;
- significancia dos regressores;
- teste F global;
- intervalo de confianca de 80%;
- grau de fundamentacao;
- grau de precisao;
- amostras utilizadas;
- amostras rejeitadas e motivo, quando houver;
- justificativa de valor adotado quando diferente do valor central inferido.

### 5. Reforcar a responsabilidade tecnica

O texto de licenca observado no instalador ressalta que modelos, bancos de
dados, formas de uso, informacoes e parametros sao definidos pelo cliente, e que
os trabalhos devem ser conferidos e analisados pelo responsavel. No SISAVALIA,
isso confirma a necessidade de manter avisos e checklist de revisao tecnica.

## Implicacoes imediatas para o caso Castanhal

Para o caso atualmente carregado no SISAVALIA:

- o uso de `Area` e `Padrao` como variaveis independentes e coerente com um
  modelo simples e auditavel;
- a memoria deve preservar o valor central inferido e o valor adotado;
- o enquadramento do Padrao 3 deve estar documentado por vistoria fotografica;
- a aderencia observado x calculado deve permanecer exportavel;
- nao se deve tratar o valor adotado como extrapolacao quando o avaliando esta
  contido nas fronteiras das variaveis amostrais.

## Proximos materiais desejaveis

Para aprendizado operacional mais preciso, sem violar propriedade intelectual,
seria ideal analisar:

1. `TS-Sisreg.pdf` extraido da pasta instalada ou enviado diretamente;
2. `Variaveis.tsv`;
3. um relatorio completo gerado pelo TS-Sisreg em PDF/RTF;
4. um arquivo `.tsr` de exemplo preenchido;
5. prints das telas de configuracao do modelo e de enquadramento normativo.

## Referencia complementar de laudo Banco do Brasil

Tambem foi criada uma referencia especifica para o formato de laudo observado
em operacoes do Banco do Brasil:

- `docs/banco-brasil-laudo-referencia.md`

Essa referencia deve ser usada em conjunto com este documento. Enquanto este
arquivo orienta a logica operacional inspirada no TS-SISREG, o documento do
Banco do Brasil orienta a apresentacao final do laudo, incluindo secoes,
campos, memoria de calculo, fotos, mapa e resultado intervalar.

## Aprendizado extraido do manual do usuario

Arquivo analisado: `TS-Sisreg.pdf`.

O manual analisado e da versao 1.2.3, mas e operacionalmente relevante para
entender a filosofia do TS-Sisreg. O conteudo foi usado apenas como referencia de
fluxo, sem reproducao extensiva de texto proprietario.

### Fluxo geral do TS-Sisreg

O fluxo operacional descrito no manual segue a sequencia:

1. criacao/configuracao de arquivo `.tsr`;
2. definicao das variaveis do modelo;
3. importacao ou digitacao dos dados da amostra;
4. calculo das equacoes;
5. analise de consistencia;
6. selecao/aplicacao da equacao;
7. teste das hipoteses;
8. analise de residuos e outliers;
9. aderencia observado x calculado;
10. matriz de correlacoes;
11. projecao de valores do avaliando;
12. geracao dos relatorios.

### Propriedades do modelo

O TS-Sisreg trabalha com uma janela de propriedades do modelo contendo, pelo
menos:

- nome do modelo;
- autor;
- tipologia;
- data de criacao;
- numero de casas decimais;
- observacoes do modelo;
- definicao das variaveis;
- escolha da variavel dependente.

Implicacao para o SISAVALIA: criar um bloco "Propriedades do Modelo" separado
da tela do avaliando, para documentar nome, autor, tipologia e parametros de
calculo.

### Definicao das variaveis

O manual reforca que cada variavel deve possuir:

- nome;
- tipo;
- expectativa de crescimento da variavel dependente;
- casas decimais;
- descricao;
- escala de medicao;
- indicacao de variavel dependente, quando aplicavel.

Implicacao para o SISAVALIA: nosso cadastro de variaveis deve evoluir para
registrar a hipotese esperada de comportamento. Exemplo: area tende a reduzir o
valor unitario; padrao tende a aumentar o valor unitario.

### Banco de variaveis

O TS-Sisreg possui banco de variaveis predefinidas e editaveis pelo operador.

Implicacao para o SISAVALIA: criar um banco de variaveis com configuracoes
padrao por tipologia, incluindo transformacoes recomendadas e descricao tecnica.

### Importacao de dados

O manual recomenda que a planilha importada tenha:

- dados e variaveis em celulas sequenciais;
- valores numericos sem textos nas variaveis;
- informacoes completas de fonte e endereco.

Implicacao para o SISAVALIA: o importador de amostras deve validar a estrutura
do arquivo antes de calcular, exigindo fonte, endereco/link, preco, area e variaveis
numericas.

### Operacao e transformacao de variaveis

O TS-Sisreg permite criar variaveis derivadas a partir de operacoes matematicas.
O proprio manual cita a criacao de valor unitario pela divisao de valor total por
area.

Implicacao para o SISAVALIA: manter e ampliar variaveis calculadas, por exemplo:

- valor unitario;
- area equivalente;
- relacoes binarias/dicotomicas;
- fatores derivados para modelos especificos.

### Calculo e transformacoes

O manual descreve transformacoes dirigidas e automaticas. Entre as transformacoes
citadas estao `1/x` e `ln(x)`. O sistema tambem avalia a possibilidade matematica
da transformacao e a coerencia com a NBR.

Implicacao para o SISAVALIA: ampliar a selecao de transformacoes alem de `x` e
`ln(x)`, incluindo pelo menos `1/x`, raiz e potencia quando tecnicamente aplicavel.

### Metodo simplificado e ranking de equacoes

O TS-Sisreg pode calcular varias equacoes e armazenar as melhores por ordem de
coeficiente de determinacao, permitindo ao operador escolher outra equacao com
resultados estatisticos mais consistentes.

Implicacao para o SISAVALIA: criar futuramente um "comparador de modelos",
listando combinacoes de variaveis/transformacoes por:

- R2 ajustado;
- significancia dos regressores;
- teste F;
- normalidade dos residuos;
- outliers;
- multicolinearidade;
- amplitude do intervalo de confianca;
- grau de fundamentacao;
- grau de precisao.

### Analise de consistencia

Antes do calculo, o TS-Sisreg recomenda analisar a consistencia dos dados,
especialmente quando houver codigo alocado ou variaveis dicotomicas, para evitar
micronumerosidade.

Implicacao para o SISAVALIA: manter a prevalidacao de micronumerosidade e
exibir alertas antes do calculo, nao apenas depois.

### Teste das hipoteses

O manual descreve uma verificacao entre a hipotese definida para a variavel e o
comportamento calculado na equacao, usando tambem o teste t de Student.

Implicacao para o SISAVALIA: incluir coluna "hipotese esperada" e sinalizar se o
sinal/forma do coeficiente confirmou ou contrariou a expectativa tecnica.

### Residuos, outliers e dados desconsiderados

O TS-Sisreg dedica modulos especificos a residuos e outliers, permitindo
identificar dados problematicos e desconsidera-los, com perda/recalculo dos
resultados estatisticos.

Implicacao para o SISAVALIA: exigir motivo tecnico para rejeicao/desconsideracao
de amostras, mantendo trilha de auditoria e recalculo automatico.

### Aderencia

O TS-Sisreg trata aderencia como relatorio proprio, relacionando valores
observados e calculados, residuos e distribuicao de frequencia.

Implicacao para o SISAVALIA: manter grafico observado x calculado, tabela de
residuos e relatorio de aderencia como anexo exportavel.

### Correlacoes

O manual diferencia correlacao isolada e correlacao parcial entre variaveis.

Implicacao para o SISAVALIA: a matriz atual de correlacoes deve evoluir para
mostrar tambem leitura parcial/condicional, ou ao menos destacar multicolinearidade
com criterio claro.

### Projecao de valores

O manual e especialmente importante neste ponto. A projecao exibe:

- valor do avaliando para cada variavel;
- minimo, maximo e media da amostra;
- controle de extrapolacao;
- valor calculado por moda, mediana ou media;
- limites minimo e maximo do intervalo de confianca;
- campo de arbitrio de 15% para mais ou para menos;
- valor arbitrado/adotado;
- grafico de insercao do avaliando dentro da amostra.

Observacao tecnica relevante: o manual deixa claro que o campo de arbitrio de
15% nao tem relacao com os valores do intervalo de confianca. Eles sao controles
distintos.

Implicacao para o SISAVALIA: criar no modulo Modelo/Laudo um bloco explicito:

- Valor central inferido;
- IC 80% inferior/superior;
- Campo de arbitrio inferior/superior (central ±15%);
- Valor adotado;
- justificativa do valor adotado;
- indicacao se o adotado esta dentro do IC 80%;
- indicacao se o adotado esta dentro do campo de arbitrio.

### Relatorios

O TS-Sisreg organiza relatorios em:

- aderencia;
- correlacoes;
- resultados;
- sintetico;
- projetar;
- dados;
- exportacao Excel dos dados.

O relatorio sintetico e descrito como central para o modelo, pois contem equacao,
resultados estatisticos, coeficientes e descricao das variaveis.

Implicacao para o SISAVALIA: separar melhor os anexos do laudo:

- Anexo de dados/amostras;
- Anexo sintetico do modelo;
- Anexo de projecao do avaliando;
- Anexo de aderencia;
- Anexo de correlacoes;
- Anexo de residuos/outliers.

## Ajuste recomendado para o caso Castanhal

No caso Castanhal, o valor adotado de R$ 340.000,00 deve ser defendido como:

- inferior ao valor central inferido de R$ 346.765,03;
- contido no IC 80%;
- contido no campo de arbitrio de ±15%;
- sustentado pelo Padrao 3 do avaliando, justificado por vistoria fotografica;
- sem uso de extrapolacao, pois Area e Padrao estao dentro das fronteiras
  amostrais.
