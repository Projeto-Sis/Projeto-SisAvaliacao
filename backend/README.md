# Backend do motor de busca

API responsável por busca geográfica, validação, deduplicação, consolidação e revisão de anúncios. O motor é modular: a base local serve para testes, o Mercado Livre usa API oficial e os demais portais ficam cadastrados como fontes configuráveis até existir API, feed ou autorização compatível.

## Desenvolvimento

Requer Python 3.11 ou superior.

```bash
python -m venv .venv
source .venv/bin/activate
pip install -e '.[dev]'
fastapi dev app/main.py
```

A documentação interativa fica em `http://127.0.0.1:8000/docs`.

## Testes

Os testes do domínio não dependem do servidor:

```bash
python -m unittest discover -s tests -v
```

## Banco

A migração inicial está em `migrations/001_initial.sql` e requer PostgreSQL com PostGIS. Ela separa anúncios brutos, imóveis consolidados, preços, validações e aprovações.

Com Docker instalado:

```bash
docker compose up -d database
export SISAVALIA_DATABASE_URL=postgresql://sisavalia:sisavalia_local@127.0.0.1:5432/sisavalia
python -m app.db migrate
```

As migrações são registradas em `schema_migrations` e não são reaplicadas.

### Postgres.app no macOS

O ambiente local também foi validado com PostgreSQL 18 e PostGIS 3.6 do Postgres.app. A aplicação usa um usuário próprio e autenticação por senha:

```bash
export SISAVALIA_DATABASE_URL=postgresql://sisavalia:sisavalia_local@127.0.0.1:5432/sisavalia
python -m app.db migrate
```

A senha acima é exclusiva do desenvolvimento local e deve ser substituída por segredo seguro em produção.

## Busca local de teste

O endpoint `POST /api/v1/search-jobs/fixture` usa exclusivamente `fixtures/salvador_listings.json`; ele não acessa portais nem a internet. Sem `SISAVALIA_DATABASE_URL`, a resposta opera como prévia sem persistência. Com a variável configurada, anúncios e eventos de validação são gravados no PostGIS.

Para testar a tela, sirva o frontend em `http://127.0.0.1:4173` e abra:

```text
http://127.0.0.1:4173/?fixtureSearch=1
```

O modo de teste só pode ser ativado em `localhost` ou `127.0.0.1`. Ele nunca envia resultados diretamente à inferência.

## Revisão e aprovação

Cada busca persistida cria grupos de imóveis físicos e relaciona os anúncios duplicados. Os endpoints de revisão permitem:

- listar grupos pendentes em `GET /api/v1/search-jobs/{job_id}/review`;
- aprovar com notas e justificativa em `POST .../properties/{property_id}/approve`;
- rejeitar com justificativa em `POST .../properties/{property_id}/reject`;
- exportar somente aprovadas em `GET .../{job_id}/approved-samples`.

Toda decisão gera evento de auditoria. A tela só transfere uma amostra ao modelo atual após comando explícito do avaliador.

## Mercado Livre — API oficial

O endpoint `POST /api/v1/search-jobs/mercadolivre` consulta imóveis dentro da caixa geográfica correspondente ao raio solicitado. O motor aplica novamente o limite circular de até 5 km, normaliza os campos recebidos e envia os resultados ao mesmo fluxo de validação, deduplicação e aprovação.

Antes de usar, crie uma aplicação no [painel de desenvolvedores do Mercado Livre](https://developers.mercadolivre.com.br/pt_br/publicacao-de-produtos/crie-uma-aplicacao-no-mercado-livre), configure o callback HTTPS e conclua o fluxo [OAuth](https://developers.mercadolivre.com.br/pt_br/autenticacao-e-autorizacao). As credenciais da aplicação ficam somente no ambiente do backend:

```bash
export SISAVALIA_MELI_CLIENT_ID='id-da-aplicacao'
export SISAVALIA_MELI_CLIENT_SECRET='chave-secreta'
export SISAVALIA_MELI_REDIRECT_URI='https://caddie-hamster-raffle.ngrok-free.dev/api/v1/oauth/mercadolivre/callback'
export SISAVALIA_MELI_CATEGORY_ID='MLB1459'
```

Com o backend e o túnel ativos, abra `GET /api/v1/oauth/mercadolivre/start`. O backend valida `state`, usa PKCE, recebe o token pelo callback e o renova automaticamente. Nesta fase de desenvolvimento, access token e refresh token permanecem apenas na memória e uma nova autorização é necessária se o backend reiniciar. Em produção, eles deverão ser persistidos criptografados em um gerenciador de segredos.

No uso normal, execute `./scripts/start_backend.sh`. Esse inicializador sobe banco, geocodificação, CSV e fontes locais sem solicitar credenciais do Mercado Livre.

Use `./scripts/start_oauth_backend.sh` somente quando for consultar a fonte Mercado Livre. Nesse caso, em outro terminal execute também `./scripts/start_ngrok.sh`. Os inicializadores evitam salvar chaves e Client Secret no histórico do terminal e solicitam os valores de modo interativo e oculto.

O mesmo inicializador solicita opcionalmente a chave da API Google Maps Geocoding e a mantém apenas na memória do processo. Pressionar Enter sem informar a chave conserva o fallback de desenvolvimento.

O token e a chave secreta não devem ser colocados no frontend, versionados, salvos no banco de amostras nem enviados em mensagens. A variável `SISAVALIA_MELI_ACCESS_TOKEN` continua disponível apenas como alternativa temporária para testes controlados.

Para abrir a interface local com o seletor de fonte:

```text
http://127.0.0.1:4173/?searchEngine=1
```

O parâmetro antigo `?fixtureSearch=1` continua aceito para compatibilidade.

## Geocodificação do avaliando

O endpoint `POST /api/v1/geocode/address` recebe logradouro, número, bairro, cidade, UF e CEP e retorna latitude/longitude. A consulta é executada exclusivamente pelo backend.

O apoio cadastral do CEP segue esta ordem:

1. [BrasilAPI CEP v2](https://brasilapi.com.br/docs) como fonte principal para logradouro, bairro, município, UF, código IBGE e coordenadas quando disponíveis;
2. [ViaCEP](https://viacep.com.br/) como fallback cadastral quando a BrasilAPI estiver indisponível ou não retornar o dado necessário;
3. geocodificação do endereço completo (logradouro, número, bairro, município, UF e CEP) para obter ou confirmar latitude e longitude.

CEP e código IBGE validam o contexto territorial, mas não substituem o número do imóvel nem a geocodificação do endereço completo.

Sem configuração adicional, o backend usa Nominatim/OpenStreetMap como fallback de desenvolvimento. Para usar Google Maps Geocoding em produção, configure a chave apenas no backend:

```bash
export SISAVALIA_GOOGLE_MAPS_API_KEY='chave-restrita-do-google-cloud'
```

Quando essa variável estiver configurada, o backend consulta primeiro a API oficial do Google e mantém a chave fora do navegador. O avaliador deve conferir a posição e a precisão antes de usar o ponto como centro da busca.

## Fontes de portais gratuitos

O endpoint `GET /api/v1/search-sources` lista as fontes disponíveis na interface. OLX, ZAP Imóveis, Viva Real, QuintoAndar e Chaves na Mão já aparecem no seletor, mas ficam marcadas como `needs_authorization`.

Essa trava é intencional: o SISAVALIA não deve fazer scraping direto e não autorizado de portais, porque as amostras podem ser usadas em laudos e precisam de rastreabilidade, estabilidade e permissão de uso. Para ativar uma dessas fontes em produção, precisamos de pelo menos uma das alternativas abaixo:

- API oficial do portal;
- feed XML/CSV autorizado;
- contrato comercial permitindo coleta e armazenamento;
- provedor de dados que entregue esses anúncios com autorização e termos compatíveis.

Enquanto isso, ao tentar consultar um portal ainda não autorizado, o backend responde `501` com uma mensagem explicando que a fonte já está cadastrada, mas ainda precisa de acesso autorizado.

## Contexto territorial dos comparáveis

Toda busca usa a latitude e longitude do avaliando como centro e aplica o raio máximo no backend. Após validação e deduplicação, a resposta inclui um `regional_context` com distância mediana, menor e maior distância, mediana e faixa de preço por metro quadrado e indicadores por anéis de distância.

O índice relativo de cada anel compara sua mediana de preço unitário com a mediana geral da pesquisa. Ele é apenas um diagnóstico exploratório para apoiar a análise de microlocalização: não altera preços, não substitui variáveis do modelo inferencial e não dispensa a aprovação técnica das amostras.

## CSV autorizado — primeira base real

A fonte `CSV autorizado` permite importar uma base real obtida de forma regular: planilha de imobiliária parceira, exportação contratada, fornecedor de dados ou base própria. O arquivo é enviado ao backend e passa pelo mesmo pipeline das outras fontes:

1. normalização dos campos;
2. filtro por raio máximo de 5 km;
3. validação de consistência;
4. deduplicação;
5. revisão e aprovação manual.

Cabeçalhos aceitos incluem nomes em português e inglês. Campos mínimos:

- `preco` ou `valor`;
- `area`;
- `latitude`;
- `longitude`.

Campos recomendados:

- `codigo`;
- `fonte`;
- `url`;
- `endereco`;
- `tipo_imovel`;
- `operacao`;
- `quartos`;
- `suites`;
- `banheiros`;
- `vagas`;
- `condominio`.

Exemplo:

```csv
codigo;fonte;preco;area;latitude;longitude;tipo_imovel;operacao;quartos;banheiros;vagas;endereco
A-1;Parceiro Autorizado;750000;100;-12.9808;-38.4548;Apartamento;Venda;3;2;2;Rua Exemplo, 100
```
