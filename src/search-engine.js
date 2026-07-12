(() => {
  "use strict";

  const localHost = ["127.0.0.1", "localhost"].includes(window.location.hostname);
  const query = new URLSearchParams(window.location.search);
  const SEARCH_ENGINE_ENABLED = query.get("searchEngine") === "1" || query.get("fixtureSearch") === "1";
  const API_BASE_URL = window.SISAVALIA_API_BASE_URL
    ? String(window.SISAVALIA_API_BASE_URL).replace(/\/$/, "")
    : (localHost ? "http://127.0.0.1:8000" : "");
  const panel = document.querySelector("#busca");
  if (!panel) return;

  const radius = document.querySelector("#searchRadius");
  const source = document.querySelector("#searchSource");
  const transactionType = document.querySelector("#searchTransactionType");
  const summary = document.querySelector("#searchCriteriaSummary");
  const message = document.querySelector("#searchEngineMessage");
  const button = document.querySelector("#startSearchBtn");
  const statusPill = document.querySelector("#searchEngineStatusPill");
  const results = document.querySelector("#searchPreviewResults");
  const reviewer = document.querySelector("#searchReviewer");
  const csvFile = document.querySelector("#searchCsvFile");
  const csvFileLabel = document.querySelector("#searchCsvFileLabel");
  const assistedCollectionMessage = document.querySelector("#assistedCollectionMessage");
  const searchPortalButtons = document.querySelectorAll(".search-portal-button");
  const downloadSearchCsvTemplate = document.querySelector("#downloadSearchCsvTemplate");
  const captureListingUrl = document.querySelector("#captureListingUrl");
  const captureListingBtn = document.querySelector("#captureListingBtn");
  const urlCapturePreview = document.querySelector("#urlCapturePreview");
  const addCapturedListingBtn = document.querySelector("#addCapturedListingBtn");
  const downloadCapturedListingsBtn = document.querySelector("#downloadCapturedListingsBtn");
  const capturedListingsSummary = document.querySelector("#capturedListingsSummary");
  const captureFields = {
    source: document.querySelector("#captureSource"),
    price: document.querySelector("#capturePrice"),
    area: document.querySelector("#captureArea"),
    address: document.querySelector("#captureAddress"),
    latitude: document.querySelector("#captureLatitude"),
    longitude: document.querySelector("#captureLongitude"),
    bedrooms: document.querySelector("#captureBedrooms"),
    suites: document.querySelector("#captureSuites"),
    bathrooms: document.querySelector("#captureBathrooms"),
    parking_spaces: document.querySelector("#captureParking"),
  };
  const watchedFieldIds = ["address", "addressNumber", "neighborhood", "city", "state", "propertyType", "latitude", "longitude"];
  let searchSources = new Map([
    ["fixture", {
      id: "fixture",
      label: "Base local de teste",
      status: "ready",
      endpoint: "/api/v1/search-jobs/fixture",
      note: "Base fictícia usada apenas para testar validação, deduplicação e revisão.",
    }],
    ["mercadolivre", {
      id: "mercadolivre",
      label: "Mercado Livre (API oficial)",
      status: "ready",
      endpoint: "/api/v1/search-jobs/mercadolivre",
      note: "Usa OAuth e API oficial.",
    }],
    ["csv_upload", {
      id: "csv_upload",
      label: "CSV autorizado",
      status: "ready",
      endpoint: "/api/v1/search-jobs/csv",
      note: "Importa uma planilha real autorizada.",
      requires_file: true,
    }],
  ]);
  const capturedListings = [];
  const MINIMUM_COMPARABLE_PROPERTIES = 20;

  function fieldValue(id) {
    return document.querySelector(`#${id}`)?.value.trim() || "";
  }

  function currentCriteria() {
    const propertyTypes = {
      APARTAMENTO: "apartment",
      CASA: "house",
      TERRENO: "land",
      SALA: "office",
      LOJA: "store",
      GALPAO: "warehouse",
    };
    return {
      address: [fieldValue("address"), fieldValue("addressNumber"), fieldValue("neighborhood")].filter(Boolean).join(", "),
      city: fieldValue("city"),
      state: fieldValue("state").toUpperCase(),
      propertyType: propertyTypes[fieldValue("propertyType").toUpperCase()] || fieldValue("propertyType").toLowerCase(),
      latitude: Number(fieldValue("latitude")),
      longitude: Number(fieldValue("longitude")),
      radiusMeters: Number(radius.value),
      transactionType: transactionType.value,
      source: source.value,
    };
  }

  function money(value) {
    return Number(value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  }

  const portalDomains = {
    olx: "olx.com.br/imoveis",
    zap: "zapimoveis.com.br",
    vivareal: "vivareal.com.br",
    quintoandar: "quintoandar.com.br",
  };

  function assistedSearchUrl(portal) {
    const criteria = currentCriteria();
    const typeLabels = {
      apartment: "apartamento",
      house: "casa",
      land: "terreno",
      office: "sala comercial",
      store: "loja",
      warehouse: "galpão",
    };
    const operation = criteria.transactionType === "rent" ? "aluguel" : "venda";
    // No SISAVALIA, "quartos" representa somente dormitórios comuns.
    // Como os portais normalmente pesquisam pelo total de dormitórios,
    // somamos quartos comuns e suítes na expressão principal e mantemos
    // a quantidade de suítes como critério independente.
    const commonBedrooms = Number(fieldValue("bedrooms")) || 0;
    const suites = Number(fieldValue("suites")) || 0;
    const totalBedrooms = commonBedrooms + suites;
    const terms = [
      `site:${portalDomains[portal]}`,
      typeLabels[criteria.propertyType] || criteria.propertyType,
      operation,
      fieldValue("neighborhood"),
      criteria.city,
      criteria.state,
      totalBedrooms ? `${totalBedrooms} quartos` : "",
      suites ? `${suites} ${suites === 1 ? "suíte" : "suítes"}` : "",
    ].filter(Boolean).join(" ");
    return `https://www.google.com/search?q=${encodeURIComponent(terms)}`;
  }

  function openAssistedSearch(portal) {
    const criteria = currentCriteria();
    if (!criteria.city || criteria.state.length !== 2) {
      assistedCollectionMessage.textContent = "Informe primeiro a cidade e a UF do avaliando.";
      return;
    }
    window.open(assistedSearchUrl(portal), "_blank", "noopener,noreferrer");
    assistedCollectionMessage.textContent = "Pesquisa aberta. Confira endereço, distância e atualidade antes de registrar o anúncio.";
  }

  function downloadCollectionTemplate() {
    const rows = [
      ["codigo", "fonte", "url", "preco", "area", "latitude", "longitude", "endereco", "tipo_imovel", "operacao", "quartos", "suites", "banheiros", "vagas", "condominio", "unidade", "ativo"],
    ];
    const csv = rows.map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(";")).join("\n");
    const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "modelo-coleta-real-sisavalia.csv";
    link.click();
    URL.revokeObjectURL(url);
    assistedCollectionMessage.textContent = "Planilha vazia baixada. Inclua somente anúncios reais e mantenha a URL da fonte.";
  }

  function inferredSource(url) {
    const hostname = (() => {
      try { return new URL(url).hostname.toLowerCase(); } catch { return ""; }
    })();
    if (hostname.endsWith("olx.com.br")) return "OLX";
    if (hostname.endsWith("zapimoveis.com.br")) return "ZAP Imóveis";
    if (hostname.endsWith("vivareal.com.br")) return "Viva Real";
    if (hostname.endsWith("quintoandar.com.br")) return "QuintoAndar";
    return "";
  }

  function fillCaptureForm(data = {}) {
    Object.entries(captureFields).forEach(([key, input]) => {
      if (input) input.value = data[key] ?? "";
    });
    urlCapturePreview.hidden = false;
  }

  async function captureFromUrl() {
    const url = captureListingUrl.value.trim();
    const sourceName = inferredSource(url);
    if (!sourceName) {
      assistedCollectionMessage.textContent = "Cole uma URL HTTPS da OLX, ZAP, Viva Real ou QuintoAndar.";
      return;
    }
    captureListingBtn.disabled = true;
    assistedCollectionMessage.textContent = "Lendo somente os metadados públicos do anúncio...";
    try {
      const data = await apiRequest("/api/v1/listings/capture-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      fillCaptureForm(data);
      assistedCollectionMessage.textContent = "Metadados recebidos. Confira e complete todos os campos antes de confirmar.";
    } catch (error) {
      fillCaptureForm({ source: sourceName });
      assistedCollectionMessage.textContent = `${error.message} Complete os campos manualmente usando o anúncio aberto.`;
    } finally {
      captureListingBtn.disabled = false;
    }
  }

  function captureNumber(name) {
    const value = captureFields[name]?.value.trim();
    return value === "" ? null : Number(value);
  }

  function addCapturedListing() {
    const url = captureListingUrl.value.trim();
    const listing = {
      codigo: `CAP-${String(capturedListings.length + 1).padStart(3, "0")}`,
      fonte: captureFields.source.value.trim(),
      url,
      preco: captureNumber("price"),
      area: captureNumber("area"),
      latitude: captureNumber("latitude"),
      longitude: captureNumber("longitude"),
      endereco: captureFields.address.value.trim(),
      tipo_imovel: fieldValue("propertyType"),
      operacao: transactionType.value === "rent" ? "Locação" : "Venda",
      quartos: captureNumber("bedrooms"),
      suites: captureNumber("suites"),
      banheiros: captureNumber("bathrooms"),
      vagas: captureNumber("parking_spaces"),
      condominio: "",
      unidade: "",
      ativo: "sim",
    };
    const validCoordinates = Number.isFinite(listing.latitude) && Number.isFinite(listing.longitude)
      && listing.latitude >= -90 && listing.latitude <= 90
      && listing.longitude >= -180 && listing.longitude <= 180;
    if (!listing.fonte || !listing.url || !(listing.preco > 0) || !(listing.area > 0) || !validCoordinates) {
      assistedCollectionMessage.textContent = "Para confirmar, informe fonte, URL, preço, área, latitude e longitude válidos.";
      return;
    }
    const existingIndex = capturedListings.findIndex((item) => item.url === listing.url);
    if (existingIndex >= 0) capturedListings[existingIndex] = listing;
    else capturedListings.push(listing);
    const shortage = Math.max(0, MINIMUM_COMPARABLE_PROPERTIES - capturedListings.length);
    capturedListingsSummary.textContent = shortage
      ? `${capturedListings.length} anúncio(s) confirmado(s) — faltam ${shortage} para o mínimo`
      : `${capturedListings.length} anúncio(s) confirmado(s) — mínimo atingido`;
    downloadCapturedListingsBtn.disabled = false;
    assistedCollectionMessage.textContent = "Anúncio confirmado para a coleta. Ele ainda passará pela validação e deduplicação.";
  }

  function downloadCapturedListings() {
    if (!capturedListings.length) return;
    const headers = ["codigo", "fonte", "url", "preco", "area", "latitude", "longitude", "endereco", "tipo_imovel", "operacao", "quartos", "suites", "banheiros", "vagas", "condominio", "unidade", "ativo"];
    const rows = [headers, ...capturedListings.map((listing) => headers.map((header) => listing[header] ?? ""))];
    const csv = rows.map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(";")).join("\n");
    const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "coleta-real-sisavalia.csv";
    link.click();
    URL.revokeObjectURL(url);
    assistedCollectionMessage.textContent = "Coleta real baixada. Selecione CSV autorizado para validar as amostras no motor.";
  }

  async function apiRequest(path, options = {}) {
    const response = await fetch(`${API_BASE_URL}${path}`, options);
    if (!response.ok) {
      const failure = await response.json().catch(() => ({}));
      throw new Error(failure.detail || `API respondeu ${response.status}.`);
    }
    return response.json();
  }

  function sourceStatusLabel(status) {
    const labels = {
      ready: "pronta",
      needs_authorization: "precisa autorização",
      blocked: "bloqueada",
    };
    return labels[status] || status || "desconhecida";
  }

  async function loadSearchSources() {
    try {
      const data = await apiRequest("/api/v1/search-sources");
      searchSources = new Map((data.sources || []).map((item) => [item.id, item]));
      const selected = source.value;
      source.replaceChildren();
      searchSources.forEach((item) => {
        const option = document.createElement("option");
        option.value = item.id;
        option.textContent = `${item.label} — ${sourceStatusLabel(item.status)}`;
        source.appendChild(option);
      });
      if (searchSources.has(selected)) source.value = selected;
    } catch (error) {
      message.textContent = `Não foi possível carregar fontes configuradas: ${error.message}`;
    } finally {
      renderCriteria();
    }
  }

  function scoreControl(labelText) {
    const label = document.createElement("label");
    label.textContent = labelText;
    const select = document.createElement("select");
    [
      ["1", "1 — Baixo"],
      ["2", "2 — Médio"],
      ["3", "3 — Alto"],
    ].forEach(([value, text]) => {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = text;
      if (value === "2") option.selected = true;
      select.appendChild(option);
    });
    label.appendChild(select);
    return { label, select };
  }

  function setReviewCardStatus(card, status, statusLabel) {
    card.dataset.status = status;
    statusLabel.textContent = status === "approved" ? "Aprovada" : "Rejeitada";
    statusLabel.className = `search-review-status ${status}`;
    card.querySelectorAll("button, select, input").forEach((control) => {
      control.disabled = true;
    });
  }

  function reviewCard(jobId, group) {
    const card = document.createElement("article");
    card.className = "search-review-card";
    card.dataset.status = group.review_status;

    const heading = document.createElement("div");
    heading.className = "search-review-heading";
    const title = document.createElement("strong");
    title.textContent = group.address_text || group.source_name || "Imóvel sem endereço detalhado";
    const statusLabel = document.createElement("span");
    statusLabel.className = `search-review-status ${group.review_status}`;
    statusLabel.textContent = group.review_status === "approved"
      ? "Aprovada"
      : group.review_status === "rejected" ? "Rejeitada" : "Pendente";
    heading.append(title, statusLabel);

    const meta = document.createElement("div");
    meta.className = "search-review-meta";
    meta.textContent = [
      money(group.representative_price),
      `${Number(group.area).toLocaleString("pt-BR")} m²`,
      `${Number(group.distance_meters).toLocaleString("pt-BR")} m do avaliando`,
      `${group.listing_count} anúncio(s) agrupado(s)`,
      `${group.bedrooms ?? "?"} quarto(s)`,
    ].join(" • ");

    const scores = document.createElement("div");
    scores.className = "search-review-scores";
    const location = scoreControl("Localização");
    const standard = scoreControl("Padrão");
    const conservation = scoreControl("Conservação");
    scores.append(location.label, standard.label, conservation.label);

    const actions = document.createElement("div");
    actions.className = "search-review-actions";
    const reason = document.createElement("input");
    reason.className = "search-review-reason";
    reason.placeholder = "Justificativa técnica da decisão";
    reason.maxLength = 1000;
    const approve = document.createElement("button");
    approve.type = "button";
    approve.className = "primary-button";
    approve.textContent = "Aprovar amostra";
    const reject = document.createElement("button");
    reject.type = "button";
    reject.className = "ghost-button";
    reject.textContent = "Rejeitar";
    actions.append(reason, approve, reject);

    async function decide(action) {
      const reviewerName = reviewer.value.trim();
      if (reviewerName.length < 2 || reason.value.trim().length < 3) {
        message.textContent = "Informe o responsável e uma justificativa técnica antes de decidir.";
        return;
      }
      approve.disabled = true;
      reject.disabled = true;
      try {
        const payload = action === "approve"
          ? {
              location: Number(location.select.value),
              standard: Number(standard.select.value),
              conservation: Number(conservation.select.value),
              reason: reason.value.trim(),
              reviewer: reviewerName,
            }
          : { reason: reason.value.trim(), reviewer: reviewerName };
        await apiRequest(
          `/api/v1/search-jobs/${jobId}/properties/${group.property_id}/${action}`,
          { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) },
        );
        setReviewCardStatus(card, action === "approve" ? "approved" : "rejected", statusLabel);
        message.textContent = action === "approve"
          ? "Amostra aprovada e registrada. Ela ainda não entrou no modelo."
          : "Amostra rejeitada com justificativa registrada.";
      } catch (error) {
        approve.disabled = false;
        reject.disabled = false;
        message.textContent = `Falha ao registrar decisão: ${error.message}`;
      }
    }

    approve.addEventListener("click", () => decide("approve"));
    reject.addEventListener("click", () => decide("reject"));
    card.append(heading, meta, scores, actions);
    if (group.review_status !== "pending") setReviewCardStatus(card, group.review_status, statusLabel);
    return card;
  }

  async function renderReview(jobId, container) {
    const review = await apiRequest(`/api/v1/search-jobs/${jobId}/review`);
    const list = document.createElement("div");
    list.className = "search-review-list";
    review.groups.forEach((group) => list.appendChild(reviewCard(jobId, group)));
    container.appendChild(list);

    const importButton = document.createElement("button");
    importButton.type = "button";
    importButton.className = "secondary-button search-import-approved";
    importButton.textContent = "Importar amostras aprovadas para o modelo";
    importButton.addEventListener("click", async () => {
      try {
        const approved = await apiRequest(`/api/v1/search-jobs/${jobId}/approved-samples`);
        const imported = window.SISAVALIA?.importApprovedSamples(approved.samples) || 0;
        message.textContent = imported
          ? `${imported} amostra(s) aprovada(s) adicionada(s) ao modelo. Recalcule a inferência.`
          : "Nenhuma nova amostra aprovada disponível para importar.";
      } catch (error) {
        message.textContent = `Falha ao importar aprovadas: ${error.message}`;
      }
    });
    container.appendChild(importButton);
  }

  async function renderPreview(data) {
    results.hidden = false;
    results.replaceChildren();
    const heading = document.createElement("strong");
    heading.textContent = `${data.candidate_count} anúncio(s), representando ${data.property_count} imóvel(is)`;
    const detail = document.createElement("span");
    const groupedPrices = data.consolidated
      .map((group) => `Grupo ${group.group}: ${money(group.representative_price.price)}`)
      .join(" | ");
    detail.textContent = groupedPrices || "Nenhum comparável encontrado no raio definido.";
    const warning = document.createElement("small");
    warning.textContent = "Prévia isolada: os resultados não foram enviados para a inferência.";
    results.append(heading, detail, warning);
    if (data.sample_sufficiency) {
      const sufficiency = document.createElement("section");
      sufficiency.className = `search-sufficiency-alert ${data.sample_sufficiency.meets_minimum ? "sufficient" : "insufficient"}`;
      const sufficiencyTitle = document.createElement("strong");
      sufficiencyTitle.textContent = data.sample_sufficiency.meets_minimum
        ? "Quantidade mínima de comparáveis atingida"
        : "Alerta: quantidade mínima não atingida";
      const sufficiencyMessage = document.createElement("span");
      sufficiencyMessage.textContent = data.sample_sufficiency.message;
      sufficiency.append(sufficiencyTitle, sufficiencyMessage);
      results.appendChild(sufficiency);
    }
    if (data.regional_context) {
      const context = data.regional_context;
      const region = document.createElement("section");
      region.className = "search-region-context";
      const regionTitle = document.createElement("strong");
      regionTitle.textContent = "Leitura territorial preliminar";
      const metrics = document.createElement("div");
      metrics.className = "search-region-metrics";
      const metricValues = [
        ["Imóveis únicos", context.property_count],
        ["Mediana R$/m²", context.median_unit_price ? money(context.median_unit_price) : "—"],
        ["Distância mediana", context.median_distance_meters != null ? `${Number(context.median_distance_meters).toLocaleString("pt-BR")} m` : "—"],
        ["Faixa R$/m²", context.minimum_unit_price && context.maximum_unit_price
          ? `${money(context.minimum_unit_price)} a ${money(context.maximum_unit_price)}`
          : "—"],
      ];
      metricValues.forEach(([label, value]) => {
        const item = document.createElement("div");
        const caption = document.createElement("small");
        caption.textContent = label;
        const content = document.createElement("strong");
        content.textContent = String(value);
        item.append(caption, content);
        metrics.appendChild(item);
      });
      const bands = document.createElement("div");
      bands.className = "search-region-bands";
      (context.distance_bands || []).forEach((band) => {
        const item = document.createElement("span");
        const index = band.relative_price_index == null
          ? "índice —"
          : `índice ${(Number(band.relative_price_index) * 100).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}`;
        item.textContent = `${band.label}: ${band.property_count} imóvel(is), ${band.median_unit_price ? money(band.median_unit_price) + "/m²" : "sem mediana"}, ${index}`;
        bands.appendChild(item);
      });
      const note = document.createElement("small");
      note.textContent = context.method_note;
      region.append(regionTitle, metrics, bands, note);
      results.appendChild(region);
    }
    if (data.job_id) await renderReview(data.job_id, results);
  }

  async function startSearch() {
    const criteria = currentCriteria();
    const sourceConfig = searchSources.get(criteria.source) || searchSources.get("fixture");
    if (!sourceConfig?.endpoint) {
      message.textContent = "Fonte sem endpoint configurado no backend.";
      return;
    }
    button.disabled = true;
    message.textContent = `Consultando ${sourceConfig.label}...`;
    results.hidden = true;
    try {
      const subjectPayload = {
        latitude: criteria.latitude,
        longitude: criteria.longitude,
        municipality: criteria.city,
        state_code: criteria.state,
        property_type: criteria.propertyType,
        transaction_type: criteria.transactionType,
        bedrooms: Number(fieldValue("bedrooms")) || null,
        area: Number(fieldValue("builtArea")) || Number(fieldValue("landArea")) || null,
        suites: Number(fieldValue("suites")) || null,
        bathrooms: Number(fieldValue("bathrooms")) || null,
        parking_spaces: Number(fieldValue("parkingSpaces")) || null,
      };
      const data = sourceConfig.requires_file
        ? await apiRequest(sourceConfig.endpoint, {
            method: "POST",
            body: (() => {
              const form = new FormData();
              form.append("file", csvFile.files[0]);
              form.append("subject", JSON.stringify(subjectPayload));
              form.append("radius_meters", String(criteria.radiusMeters));
              return form;
            })(),
          })
        : await apiRequest(sourceConfig.endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              subject: subjectPayload,
              radius_meters: criteria.radiusMeters,
            }),
          });
      await renderPreview(data);
      message.textContent = `Busca em ${sourceConfig.label} concluída. Revise agrupamentos e preços antes de qualquer aprovação.`;
    } catch (error) {
      message.textContent = `Não foi possível executar a prévia: ${error.message}`;
    } finally {
      renderCriteria({ preserveMessage: true });
    }
  }

  function renderCriteria({ preserveMessage = false } = {}) {
    const criteria = currentCriteria();
    const sourceConfig = searchSources.get(criteria.source);
    const hasCoordinates = Number.isFinite(criteria.latitude)
      && Number.isFinite(criteria.longitude)
      && criteria.latitude >= -90
      && criteria.latitude <= 90
      && criteria.longitude >= -180
      && criteria.longitude <= 180
      && !(criteria.latitude === 0 && criteria.longitude === 0);
    const hasTerritory = criteria.city && criteria.state.length === 2;
    const needsFile = Boolean(sourceConfig?.requires_file);
    const hasRequiredFile = !needsFile || Boolean(csvFile?.files?.length);
    const place = [criteria.address, criteria.city, criteria.state].filter(Boolean).join(" — ") || "local não informado";
    if (csvFileLabel) csvFileLabel.hidden = !needsFile;
    const sourceLabel = sourceConfig?.label || criteria.source || "Fonte não informada";
    const statusText = sourceConfig ? ` (${sourceStatusLabel(sourceConfig.status)})` : "";
    summary.textContent = `${sourceLabel}${statusText} | ${criteria.propertyType || "Tipo não informado"} | ${place} | raio de ${criteria.radiusMeters / 1000} km`;

    button.disabled = !SEARCH_ENGINE_ENABLED || !hasCoordinates || !hasTerritory || !sourceConfig || !hasRequiredFile;
    if (preserveMessage) return;
    if (!SEARCH_ENGINE_ENABLED) {
      message.textContent = "A busca assistida só pode ser ativada no ambiente local autorizado.";
      return;
    }
    const sourceNote = sourceConfig?.note ? ` Fonte: ${sourceConfig.note}` : "";
    message.textContent = hasCoordinates && hasTerritory
      ? needsFile && !hasRequiredFile
        ? "Selecione um arquivo CSV autorizado antes de iniciar a busca."
        : `Critérios suficientes para criar um trabalho de busca.${sourceNote}`
      : "Informe município, UF, latitude e longitude válidos antes de buscar.";
  }

  panel.dataset.searchEngineEnabled = String(SEARCH_ENGINE_ENABLED);
  statusPill.textContent = SEARCH_ENGINE_ENABLED ? "Busca assistida ativa" : "Desativada por segurança";
  watchedFieldIds.forEach((id) => document.querySelector(`#${id}`)?.addEventListener("input", renderCriteria));
  window.addEventListener("sisavalia:subject-updated", renderCriteria);
  radius.addEventListener("change", renderCriteria);
  source.addEventListener("change", renderCriteria);
  csvFile?.addEventListener("change", renderCriteria);
  transactionType.addEventListener("change", renderCriteria);
  button.addEventListener("click", startSearch);
  searchPortalButtons.forEach((portalButton) => {
    portalButton.addEventListener("click", () => openAssistedSearch(portalButton.dataset.portal));
  });
  downloadSearchCsvTemplate?.addEventListener("click", downloadCollectionTemplate);
  captureListingBtn?.addEventListener("click", captureFromUrl);
  addCapturedListingBtn?.addEventListener("click", addCapturedListing);
  downloadCapturedListingsBtn?.addEventListener("click", downloadCapturedListings);
  loadSearchSources();
})();
