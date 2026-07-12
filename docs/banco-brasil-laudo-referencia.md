# Referencia de laudo Banco do Brasil para o SISAVALIA

Este documento registra os aprendizados estruturais extraidos do arquivo
`Laudo Lapao.pdf`, usado apenas como referencia operacional de formato,
organizacao e campos tecnicos. Dados pessoais e identificadores sensiveis do
documento original nao devem ser reproduzidos no SISAVALIA.

## Objetivo da referencia

Alinhar a geracao de laudo do SISAVALIA ao padrao esperado em operacoes de
credito imobiliario do Banco do Brasil, especialmente quando o trabalho utiliza:

- metodo comparativo direto de dados de mercado;
- tratamento por estatistica inferencial;
- grau de fundamentacao;
- grau de precisao;
- memoria de calculo em formato auditavel;
- documentacao fotografica;
- mapa de localizacao.

## Estrutura principal observada

O laudo possui estrutura de formulario tecnico, com numeracao fixa de secoes e
forte uso de tabelas, campos objetivos e caixas de selecao.

### Cabecalho

Campos e elementos esperados:

- identificacao visual do Banco do Brasil;
- titulo do laudo de avaliacao;
- tipologia do bem, por exemplo casa, apartamento ou terreno;
- versao do formulario;
- aviso de uso interno, quando aplicavel;
- numero de controle interno ou ordem de servico;
- data da avaliacao;
- data da vistoria.

Implicacao para o SISAVALIA:

- criar template de cabecalho BB com cores institucionais e layout tabular;
- manter numero da OS e datas visiveis desde a primeira pagina;
- permitir configurar versao do formulario no cadastro do laudo.

### 1. Solicitacao

Campos observados:

- prefixo/departamento solicitante;
- numero da OS;
- data da OS;
- proponente;
- CPF/CNPJ do proponente;
- programa habitacional, quando houver;
- proposito da avaliacao;
- objetivo da avaliacao.

Implicacao para o SISAVALIA:

- vincular esta secao ao Modulo de Gestao/Controle de Demanda;
- trazer automaticamente OS, banco/cliente, proponente e objetivo quando a
  avaliacao nasce de uma demanda cadastrada.

### 2. Identificacao do imovel

Campos observados:

- endereco;
- numero;
- complemento;
- condominio/empreendimento;
- bairro/setor;
- cidade;
- UF;
- CEP;
- cartorio/oficio;
- matricula;
- data de emissao da matricula;
- observacoes.

Implicacao para o SISAVALIA:

- manter endereco estruturado;
- usar geocodificacao apenas como apoio, sem substituir a conferioria tecnica;
- preservar campos cartoriais para exportacao do laudo.

### 3. Micro-regiao do avaliando

Campos observados:

- uso predominante;
- padrao construtivo predominante;
- acesso;
- infraestrutura urbana;
- servicos publicos e comunitarios;
- indicacao de risco, alagamento ou restricoes ambientais.

Itens de infraestrutura aparecem em formato de checklist, incluindo temas como
agua, energia, telefone, iluminacao publica, drenagem, esgoto, pavimentacao,
gas, transporte, escola, comercio, saude, seguranca e coleta de lixo.

Implicacao para o SISAVALIA:

- criar bloco de checklist de micro-regiao;
- permitir preencher manualmente e/ou sugerir a partir da localizacao;
- transformar essas informacoes em texto tecnico para o laudo.

### 4. Terreno

Campos observados:

- area total;
- numero de frentes;
- testada;
- posicao na quadra;
- fracao ideal;
- topografia;
- superficie;
- cota em relacao ao greide;
- formato.

Implicacao para o SISAVALIA:

- separar dados do terreno dos dados da edificacao;
- permitir que a area de terreno e a area construida tenham papeis distintos
  no modelo, quando necessario.

### 5. Imovel avaliando

Campos observados:

- tipo de imovel;
- uso;
- posicao da edificacao no terreno;
- dormitorios;
- suites;
- total de dormitorios;
- banheiros sociais;
- lavabo;
- total de banheiros;
- padrao de acabamento;
- ocupacao;
- numero de pavimentos;
- estado de conservacao;
- idade aparente;
- localizacao;
- esquadrias;
- cobertura/telhado;
- teto;
- solucao de agua;
- solucao de esgoto;
- fechamento das paredes;
- implantacao;
- infraestrutura/equipamentos;
- areas averbadas e nao averbadas;
- vagas;
- coordenadas;
- comodos;
- infraestrutura de condominio, quando houver.

Implicacao para o SISAVALIA:

- manter suite e quarto como campos separados;
- calcular total de dormitorios sem perder a informacao de suites;
- separar area privativa, area comum, area averbada e area nao averbada;
- registrar latitude e longitude no laudo, quando disponiveis;
- manter padrao e conservacao como variaveis explicitamente justificadas.

### 6. Condicoes gerais e vistoria

Campos observados:

- correspondencia entre documentacao e vistoria;
- estabilidade e solidez aparentes;
- vicios construtivos aparentes;
- habitabilidade;
- fatores ambientais, climaticos ou de localizacao;
- fatores valorizantes;
- fatores restritivos/depreciativos;
- sistema construtivo inovador, quando aplicavel;
- data da vistoria;
- dados de contato/agendamento;
- historico de vistoria infrutifera, quando houver.

Implicacao para o SISAVALIA:

- criar checklist tecnico de vistoria;
- exigir justificativa quando alguma resposta critica for negativa;
- manter campo para historico de vistoria.

### 7. Avaliacao

Campos observados:

- metodologia;
- numero de dados utilizados;
- tratamento de dados;
- grau de fundamentacao;
- grau de precisao.

O exemplo observado utiliza:

- metodo comparativo direto de dados de mercado;
- estatistica inferencial;
- grau de fundamentacao II;
- grau de precisao III.

Implicacao para o SISAVALIA:

- exibir esses quatro pontos de forma destacada;
- mostrar o numero efetivo de amostras usadas apos rejeicoes;
- diferenciar amostras carregadas, amostras rejeitadas e amostras utilizadas.

### 8. Diagnostico de mercado

Campos observados:

- desempenho do mercado;
- numero de ofertas;
- liquidez e prazo provavel de venda;
- prazo efetivo de venda, quando informado.

Implicacao para o SISAVALIA:

- criar campos objetivos para diagnostico de mercado;
- permitir opcoes padronizadas, como baixo, medio, alto, normal, aquecido ou
  recessivo, conforme necessidade tecnica.

### 9. Manifestacao sobre garantia

Campo observado:

- indicacao se o bem pode ser aceito em garantia;
- justificativa quando a resposta for negativa.

Implicacao para o SISAVALIA:

- criar bloco proprio de conclusao de garantia;
- nao confundir valor de mercado com aceitacao automatica da garantia.

### 10. Resultados

Campos observados:

- valor de mercado total;
- valor por extenso;
- limite superior;
- limite inferior;
- area de referencia;
- valor unitario adotado;
- indicacao se foi adotado o valor medio;
- justificativa quando o valor adotado divergir do valor medio.

Implicacao para o SISAVALIA:

- preservar valor central inferido;
- preservar valor adotado;
- indicar se o valor adotado corresponde ao valor medio;
- se houver arbitramento dentro do campo permitido, exigir justificativa;
- apresentar intervalo de confianca ou resultado intervalar em destaque.

### 11. Unidades autonomas

Secao destinada a informacoes complementares de unidades autonomas incluidas na
transacao, quando aplicavel.

Implicacao para o SISAVALIA:

- deixar secao opcional para imoveis em condominio, vagas, unidades vinculadas
  ou dados cartorarios complementares.

### 12. Observacoes finais

Secao livre para ressalvas tecnicas.

Implicacao para o SISAVALIA:

- consolidar ressalvas de vistoria, documentacao, amostras, mercado e modelo.

### 13. Anexos

Itens observados:

- documentacao fornecida pelo banco;
- outros documentos que fundamentam o trabalho;
- modelo de estatistica inferencial.

Implicacao para o SISAVALIA:

- gerar lista de anexos automaticamente;
- incluir memoria inferencial como anexo ou secao final;
- permitir anexar fotos, mapa, planilha de amostras e documentos.

### 14. Memoria de calculo

Campos observados:

- equacao do modelo;
- atributos do avaliando;
- significancia das variaveis.

A equacao e exibida em linguagem direta, com a variavel dependente, os
coeficientes e as transformacoes aplicadas.

Implicacao para o SISAVALIA:

- gerar a equacao textual no estilo TS-SISREG/BB;
- mostrar variavel dependente;
- mostrar transformacoes;
- mostrar coeficientes;
- mostrar atributos do avaliando;
- mostrar significancia das variaveis;
- manter R2 ajustado, teste F, residuos, normalidade e aderencia nos relatorios
  tecnicos de apoio.

### Documentacao fotografica

O laudo possui pagina propria para fotos, iniciando por fachada principal e
vista da rua.

Implicacao para o SISAVALIA:

- reservar pagina fotografica;
- padronizar legendas;
- priorizar fachada, rua, ambientes internos, area externa, benfeitorias e
  elementos relevantes para padrao/conservacao.

### Mapa

O laudo possui pagina propria para mapa.

Implicacao para o SISAVALIA:

- gerar mapa a partir de latitude/longitude;
- manter alternativa manual quando nao houver API disponivel;
- documentar coordenadas usadas.

## Checklist de aderencia para o gerador de laudo SISAVALIA

Para aproximar o SISAVALIA do padrao Banco do Brasil, o gerador de laudo deve
conter:

- cabecalho BB ou cabecalho configuravel por banco/cliente;
- secoes numeradas de 1 a 14;
- formulario tabular;
- campos de OS integrados ao Controle de Demanda;
- micro-regiao com checklists;
- terreno separado do imovel;
- quartos e suites separados;
- banheiros sociais, lavabo e total de banheiros separados;
- padrao e conservacao justificados;
- condicoes gerais de vistoria;
- diagnostico de mercado;
- manifestacao sobre garantia;
- resultados com valor central, valor adotado, limites e valor unitario;
- memoria de calculo com equacao e significancia;
- pagina de fotografias;
- pagina de mapa;
- assinatura/responsaveis tecnicos configuraveis.

## Aplicacao imediata ao caso Castanhal

O caso Castanhal atualmente carregado no SISAVALIA ja atende a parte essencial
do bloco de avaliacao:

- metodo comparativo direto de dados de mercado;
- tratamento por estatistica inferencial;
- numero de dados utilizados apos saneamento;
- grau de fundamentacao;
- grau de precisao;
- resultado intervalar;
- valor central inferido;
- valor adotado;
- justificativa tecnica do valor adotado;
- memoria de calculo.

Os proximos aprimoramentos devem focar no formato de apresentacao do laudo:

1. criar template de laudo BB com secoes 1 a 14;
2. adicionar blocos de micro-regiao, terreno, vistoria e garantia;
3. incluir pagina fotografica padronizada;
4. incluir pagina de mapa;
5. exportar memoria de calculo no estilo tabular observado.
