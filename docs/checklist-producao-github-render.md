# Checklist de producao - GitHub, Render e persistencia

Este documento registra o caminho recomendado para levar o SISAVALIA do ambiente
local para producao, sem expor credenciais e mantendo rastreabilidade tecnica.

## 1. Antes do commit

- Executar `git status` e revisar arquivos alterados.
- Verificar se `.env`, tokens, chaves Google, Mercado Livre, ngrok ou senhas nao
  foram adicionados ao versionamento.
- Manter versionados apenas:
  - codigo-fonte;
  - migrations;
  - documentacao;
  - testes;
  - exemplos anonimizados.
- Nao versionar:
  - `.venv`;
  - `backend/.local`;
  - banco local;
  - arquivos com dados pessoais;
  - laudos reais com CPF/CNPJ sem anonimizar.

## 2. Commit e push para o GitHub

Comandos recomendados:

```bash
cd "/Users/macbook/Documents/Motor de Busca  SISAVALIA/SISAVALIA"
git status
git add .
git commit -m "Prepara SISAVALIA para producao no Render"
git push
```

Se a branch ainda nao estiver vinculada:

```bash
git push -u origin main
```

ou, se o repositorio usar `master`:

```bash
git push -u origin master
```

## 3. Publicacao no Render

O arquivo `render.yaml` publica o SISAVALIA como um unico servico Python/FastAPI.
Esse servico entrega:

- a interface web do SISAVALIA;
- as APIs internas do motor de busca, geocodificacao e controle de demanda;
- as migracoes do banco antes da subida do servidor.

No Render:

1. Acesse o painel do Render.
2. Use `New > Blueprint`.
3. Conecte o repositorio `MMAEngenhariaX/SISAVALIA`.
4. Confirme o Blueprint detectado pelo arquivo `render.yaml`.
5. O Render deve criar:
   - servico web `sisavalia-mma`;
   - banco PostgreSQL `sisavalia-db`.
6. Informe manualmente a variavel sensivel:
   - `SISAVALIA_GOOGLE_MAPS_API_KEY`.

Essa chave nunca deve ser gravada no GitHub.

## 4. Variaveis de ambiente no Render

Configurar no painel do Render, nunca no codigo:

- `SISAVALIA_DATABASE_URL`: gerada automaticamente pelo banco do Blueprint;
- `SISAVALIA_GOOGLE_MAPS_API_KEY`: preencher manualmente;
- `SISAVALIA_ENV=production`;
- `SISAVALIA_ENABLE_FIXTURE_CONNECTOR=false`;
- credenciais OAuth somente se o conector correspondente estiver ativo futuramente.

## 5. Banco de dados

Ambiente recomendado:

- desenvolvimento local: PostgreSQL local;
- producao: PostgreSQL gerenciado no Render ou Supabase.

Dados que devem ser persistidos:

- demandas/OS;
- engenheiros;
- parceiros;
- pagamentos;
- amostras;
- status e motivo de rejeicao das amostras;
- anexos fotograficos e mapa/croqui;
- configuracoes do modelo;
- resultado inferencial calculado;
- historico de alteracoes.

Observacao: atualmente parte dos projetos/laudos ainda usa armazenamento local do
navegador. Para uso externo completo, o proximo passo e persistir tambem projetos,
anexos e laudos no backend.

## 6. Armazenamento de anexos

Para producao, evitar gravar imagens grandes diretamente no banco.

Opcao recomendada:

- armazenar arquivo em bucket/servico de objetos;
- gravar no banco apenas URL, legenda, tipo de anexo e metadados.

Em ambiente local, o SISAVALIA pode trabalhar com `dataUrl` em backup JSON, mas
isso deve ser tratado como solucao temporaria.

## 7. Validacao pos-deploy

Depois do deploy:

1. abrir frontend;
2. conferir conexao com backend;
3. cadastrar uma demanda;
4. cadastrar avaliando;
5. importar amostras;
6. rejeitar uma amostra com motivo;
7. rodar inferencia;
8. anexar fotos e mapa;
9. gerar laudo/HTML/PDF;
10. validar se os dados permanecem apos recarregar.

## 8. Segurança minima

- Revisar CORS.
- Impedir upload de arquivos executaveis.
- Limitar tamanho de anexos.
- Validar extensao e MIME de imagens.
- Aplicar autenticacao real antes de uso externo.
- Criar rotina de backup do banco.
