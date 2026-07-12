# Motor de busca de amostras — arquitetura inicial

## Objetivo

Adicionar ao SISAVALIA uma pesquisa nacional de ofertas imobiliárias sem permitir que dados coletados alimentem diretamente a inferência estatística.

## Princípio de segurança

O motor trabalha em seis estágios independentes:

1. `coletada`: resposta original preservada, sem interpretação;
2. `normalizada`: campos convertidos para o contrato SISAVALIA;
3. `agrupada`: anúncios provavelmente referentes ao mesmo imóvel são relacionados;
4. `validada`: regras automáticas executadas e registradas;
5. `aprovada`: decisão humana explícita do avaliador;
6. `publicada`: amostra disponibilizada para a inferência.

Nenhum conector de portal possui permissão para escrever diretamente em `approved_samples`.

A publicação exige duas ações humanas separadas: primeiro aprovar ou rejeitar o grupo consolidado; depois importar explicitamente as amostras aprovadas para o projeto em edição. Essa separação impede que a simples execução de uma busca altere o modelo estatístico.

## Componentes

```text
Frontend SISAVALIA
       |
       v
API FastAPI ---- PostgreSQL + PostGIS
       |
       +---- fila de trabalhos (fase posterior)
       |
       +---- conectores autorizados por fonte
       |
       +---- normalização / validação / deduplicação
```

O frontend atual continua estático durante a implantação. O backend é um serviço separado no mesmo repositório e será publicado somente após a configuração do banco e da autenticação.

## Contrato de amostra versão 2

Os seis campos atuais continuam válidos: `source`, `price`, `area`, `location`, `standard` e `conservation`. O backend acrescenta metadados, sem alterar os cálculos existentes:

```json
{
  "schema_version": 2,
  "sample_id": "uuid",
  "source": "Portal autorizado",
  "source_url": "https://fonte.exemplo/anuncio/123",
  "source_reference": "123",
  "price": 690000,
  "area": 92.4,
  "location": 2,
  "standard": 2,
  "conservation": 2,
  "property_type": "apartment",
  "transaction_type": "sale",
  "bedrooms": 3,
  "suites": 1,
  "bathrooms": 2,
  "parking_spaces": 2,
  "latitude": -12.9801,
  "longitude": -38.4602,
  "location_precision": "street",
  "validation_status": "pending_review",
  "validation_score": 82,
  "duplicate_group_id": "uuid",
  "collected_at": "2026-06-28T15:00:00Z",
  "last_seen_at": "2026-06-28T15:00:00Z"
}
```

Ao enviar uma amostra aprovada para o modelo atual, o adaptador usa somente os seis campos legados. Os metadados permanecem associados para auditoria.

## Regras iniciais de deduplicação

A identidade do imóvel não depende do preço. São avaliados:

- referência idêntica na mesma fonte;
- fotografias com impressões digitais coincidentes;
- endereço e unidade;
- distância entre coordenadas, considerando a precisão declarada;
- condomínio;
- diferença relativa de área;
- quartos, suítes, banheiros e vagas;
- similaridade textual do endereço.

Resultados possíveis:

- `automatic`: evidência forte suficiente para agrupamento automático;
- `review`: possível duplicidade, exige decisão humana;
- `distinct`: evidência insuficiente; anúncios permanecem separados.

O valor representativo é escolhido apenas entre anúncios ativos, recentes e minimamente confiáveis. Entre preços públicos simultaneamente vigentes, adota-se o menor, com revisão obrigatória quando a divergência superar 10%.

## Fronteiras operacionais

- raio máximo inicial: 5 km;
- a busca calcula distância de cada imóvel ao avaliando e resume preços unitários por anéis territoriais;
- índices relativos de distância são diagnósticos exploratórios e não fatores automáticos de homogeneização;
- a precisão do ponto deve ser exibida ao avaliador;
- endereço de bairro ou município não pode ser tratado como ponto exato;
- o CEP pode auxiliar no preenchimento automático de endereço e coordenadas quando o serviço retornar latitude/longitude, mas o avaliador deve conferir a posição antes da busca;
- anúncios antigos permanecem no histórico, mas não entram automaticamente na seleção;
- toda correção, rejeição e aprovação gera um evento auditável;
- nome e telefone de pessoa física não fazem parte do contrato mínimo.

## Etapas de implantação

1. Executar o backend e o banco localmente.
2. Calibrar as regras com dados fictícios e amostras previamente conhecidas.
3. Conector oficial do Mercado Livre e fluxo OAuth validados; falta liberar a permissão funcional de busca e concluir a primeira consulta real controlada.
4. OLX, ZAP Imóveis, Viva Real, QuintoAndar e Chaves na Mão foram cadastrados como fontes configuráveis, mas permanecem em estado `needs_authorization` até existir API, feed ou autorização contratual compatível com uso técnico em avaliação.
5. Operar em modo sombra: coletar e comparar, sem publicar na inferência.
6. Medir falsos positivos e falsos negativos da deduplicação.
7. Liberar aprovação manual e, somente depois, integração com o modelo.
