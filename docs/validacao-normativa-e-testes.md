# Validacao normativa e roteiro de testes do SISAVALIA

Este roteiro orienta os testes do SISAVALIA para uso tecnico em avaliacoes pelo
metodo comparativo direto de dados de mercado, com tratamento inferencial.

## 1. Testes do modelo inferencial

Validar automaticamente:

- quantidade minima de amostras por quantidade de variaveis;
- rejeicao de amostras marcadas como `rejeitada`;
- recalculo quando uma amostra e reativada;
- calculo do valor central inferido;
- calculo do intervalo de confianca de 80%;
- calculo da amplitude do intervalo;
- verificacao do campo de arbitrio de 15%;
- valor unitario adotado;
- R2 ajustado;
- teste F global;
- significancia das variaveis;
- residuos padronizados;
- alertas de outliers;
- multicolinearidade.

## 2. Testes de amostras

Validar:

- importacao CSV com colunas novas e antigas;
- reconhecimento de `status_validacao`;
- reconhecimento de `tem_foto`;
- amostra rejeitada nao entra na inferencia;
- motivo de rejeicao aparece no laudo;
- amostra sem foto gera alerta;
- duplicidades devem ser sinalizadas em etapa futura.

## 3. Testes de anexos

Validar:

- upload de fotos;
- upload de mapa/croqui;
- edicao de legenda;
- remocao de anexo;
- persistencia em backup local;
- exibicao no preview do laudo;
- exibicao na exportacao HTML/PDF.

## 4. Testes de laudo

Validar:

- valor central e valor adotado aparecem separadamente;
- IC 80% aparece com limites inferior e superior;
- campo de arbitrio aparece no resultado;
- quando valor adotado diverge da tendencia central, o campo "valor medio
  adotado" deve indicar `NAO`;
- justificativa do valor adotado aparece no laudo;
- memoria de calculo lista coeficientes, erro padrao, t e p-valor;
- amostras utilizadas e rejeitadas aparecem separadas.

## 5. Testes do Modulo de Gestao

Validar:

- cadastro de demanda;
- cadastro de parceiro;
- cadastro de engenheiro;
- vinculo da demanda com avaliacao;
- status de pagamento;
- status de ART;
- filtros e painel financeiro;
- persistencia no banco quando em ambiente de producao.

## 6. Criterios tecnicos minimos antes de emitir

Antes de emitir um laudo:

- conferir dados da OS;
- conferir endereco, CEP, cidade, UF e coordenadas;
- conferir matricula/cartorio quando aplicavel;
- conferir vistoria, fotos e mapa;
- revisar todas as amostras;
- justificar rejeicoes;
- revisar diagnosticos estatisticos;
- revisar grau de fundamentacao e precisao;
- anexar ART/RRT;
- salvar backup do projeto;
- gerar PDF final e revisar visualmente.
