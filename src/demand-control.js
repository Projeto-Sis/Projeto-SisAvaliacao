(() => {
  "use strict";

  const panel = document.querySelector("#controle-demanda");
  if (!panel) return;
  const API_BASE_URL = window.SISAVALIA_API_BASE_URL
    ? String(window.SISAVALIA_API_BASE_URL).replace(/\/$/, "")
    : (["127.0.0.1", "localhost"].includes(window.location.hostname) ? "http://127.0.0.1:8000" : "");
  const API = `${API_BASE_URL}/api/v1/demand-control`;
  const form = document.querySelector("#demandForm");
  const message = document.querySelector("#demandFormMessage");
  const tableBody = document.querySelector("#demandTableBody");
  const bankSelect = document.querySelector("#demandBank");
  const engineerSelect = document.querySelector("#demandEngineer");
  const partnerSelect = document.querySelector("#demandPartner");
  const saveButton = document.querySelector("#saveDemandBtn");
  const cancelEditButton = document.querySelector("#cancelDemandEditBtn");
  const partnerForm = document.querySelector("#partnerForm");
  const engineerForm = document.querySelector("#engineerForm");
  const partnerMessage = document.querySelector("#partnerFormMessage");
  const engineerMessage = document.querySelector("#engineerFormMessage");
  const partnerRegistryList = document.querySelector("#partnerRegistryList");
  const engineerRegistryList = document.querySelector("#engineerRegistryList");
  const financialCanvas = document.querySelector("#financialMonthlyChart");
  const financialEmpty = document.querySelector("#financialChartEmpty");
  const evaluationDemandSearch = document.querySelector("#evaluationDemandSearch");
  const searchEvaluationDemandButton = document.querySelector("#searchEvaluationDemandBtn");
  const evaluationDemandMatches = document.querySelector("#evaluationDemandMatches");
  const evaluationDemandMessage = document.querySelector("#evaluationDemandMessage");
  const resetDemandsButton = document.querySelector("#resetDemandsBtn");
  const demandDrilldownPanel = document.querySelector("#demandDrilldownPanel");
  const demandDrilldownTitle = document.querySelector("#demandDrilldownTitle");
  const demandDrilldownSummary = document.querySelector("#demandDrilldownSummary");
  const demandDrilldownList = document.querySelector("#demandDrilldownList");
  const closeDemandDrilldownButton = document.querySelector("#closeDemandDrilldownBtn");
  const backendStatusCard = document.querySelector("#demandBackendStatus");
  const backendStatusTitle = document.querySelector("#demandBackendStatusTitle");
  const backendStatusText = document.querySelector("#demandBackendStatusText");
  const backendStatusHint = document.querySelector("#demandBackendStatusHint");
  const retryDemandBackendButton = document.querySelector("#retryDemandBackendBtn");
  const demandListSearch = document.querySelector("#demandListSearch");
  const demandFilterBank = document.querySelector("#demandFilterBank");
  const demandFilterStatus = document.querySelector("#demandFilterStatus");
  const demandFilterDeadline = document.querySelector("#demandFilterDeadline");
  const demandFilterPayment = document.querySelector("#demandFilterPayment");
  const clearDemandFiltersButton = document.querySelector("#clearDemandFiltersBtn");
  const demandFilterSummary = document.querySelector("#demandFilterSummary");
  const demandDetailPanel = document.querySelector("#demandDetailPanel");
  const demandDetailTitle = document.querySelector("#demandDetailTitle");
  const demandDetailSummary = document.querySelector("#demandDetailSummary");
  const demandDetailBody = document.querySelector("#demandDetailBody");
  const closeDemandDetailButton = document.querySelector("#closeDemandDetailBtn");
  const reportStartDate = document.querySelector("#reportStartDate");
  const reportEndDate = document.querySelector("#reportEndDate");
  const reportBank = document.querySelector("#reportBank");
  const reportStatus = document.querySelector("#reportStatus");
  const reportDeadline = document.querySelector("#reportDeadline");
  const reportPayment = document.querySelector("#reportPayment");
  const reportArt = document.querySelector("#reportArt");
  const reportSearch = document.querySelector("#reportSearch");
  const managementReportStatus = document.querySelector("#managementReportStatus");
  const managementReportPeriod = document.querySelector("#managementReportPeriod");
  const managementReportGeneratedAt = document.querySelector("#managementReportGeneratedAt");
  const managementReportCards = document.querySelector("#managementReportCards");
  const reportByBank = document.querySelector("#reportByBank");
  const reportByEngineer = document.querySelector("#reportByEngineer");
  const reportByPartner = document.querySelector("#reportByPartner");
  const reportCriticalIssues = document.querySelector("#reportCriticalIssues");
  const managementReportRows = document.querySelector("#managementReportRows");
  const refreshManagementReportButton = document.querySelector("#refreshManagementReportBtn");
  const printManagementReportButton = document.querySelector("#printManagementReportBtn");
  const clearManagementReportFiltersButton = document.querySelector("#clearManagementReportFiltersBtn");
  const productivityStartDate = document.querySelector("#productivityStartDate");
  const productivityEndDate = document.querySelector("#productivityEndDate");
  const productivityGroupBy = document.querySelector("#productivityGroupBy");
  const productivitySortBy = document.querySelector("#productivitySortBy");
  const productivitySearch = document.querySelector("#productivitySearch");
  const clearProductivityFiltersButton = document.querySelector("#clearProductivityFiltersBtn");
  const productivityStatus = document.querySelector("#productivityStatus");
  const productivityCards = document.querySelector("#productivityCards");
  const productivityRows = document.querySelector("#productivityRows");
  let demands = [];
  let visibleDemands = [];
  let financialItems = [];
  let evaluationSearchResults = [];
  let dashboardSummary = {};
  let editingDemandId = null;
  let backendOnline = false;
  const PAYMENT_STATUS_OPTIONS = ["Não realizado", "Pagamento realizado", "Parcial", "Cancelado", "Não se aplica"];

  function escapeHtml(value) {
    return String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
  }

  function money(value) {
    return Number(value || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  }

  function percent(value) {
    const number = Number(value || 0);
    return `${number.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`;
  }

  function formatDate(value) {
    if (!value) return "Não informado";
    const date = new Date(`${value}T12:00:00`);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString("pt-BR");
  }

  function normalize(value) {
    return String(value ?? "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim();
  }

  function isLocalHost() {
    return ["127.0.0.1", "localhost"].includes(window.location.hostname);
  }

  function backendTargetLabel() {
    return API_BASE_URL || window.location.origin;
  }

  function backendHelpMessage(error) {
    const detail = error?.message ? `Detalhe técnico: ${error.message}` : "";
    if (isLocalHost()) {
      return {
        title: "Backend local indisponível",
        text: `O SISAVALIA abriu a interface, mas a API não respondeu em ${backendTargetLabel()}.`,
        hint: `${detail} Inicie o backend no Terminal e clique em “Testar conexão”.`,
      };
    }
    return {
      title: "API do Render indisponível ou incompleta",
      text: "A página abriu, mas o Controle de Demanda não conseguiu conversar corretamente com o backend publicado.",
      hint: `${detail} Verifique o deploy no Render, a variável SISAVALIA_DATABASE_URL e se as migrações do PostgreSQL foram executadas.`,
    };
  }

  function setBackendStatus(state, title, text, hint = "") {
    if (!backendStatusCard) return;
    backendStatusCard.classList.remove("ok", "warn", "fail");
    backendStatusCard.classList.add(state);
    if (backendStatusTitle) backendStatusTitle.textContent = title;
    if (backendStatusText) backendStatusText.textContent = text;
    if (backendStatusHint) backendStatusHint.textContent = hint;
  }

  function setBackendDependentState(isOnline) {
    backendOnline = Boolean(isOnline);
    panel.classList.toggle("is-backend-offline", !backendOnline);
    [saveButton, resetDemandsButton, searchEvaluationDemandButton].filter(Boolean).forEach((button) => {
      button.disabled = !backendOnline;
    });
    [partnerForm, engineerForm].filter(Boolean).forEach((targetForm) => {
      const submit = targetForm.querySelector('button[type="submit"]');
      if (submit) submit.disabled = !backendOnline;
    });
  }

  async function request(path, options = {}) {
    const response = await fetch(`${API}${path}`, options);
    const body = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(body.detail || "Não foi possível acessar o Controle de Demanda.");
    return body;
  }

  function options(items, emptyLabel = "") {
    return `${emptyLabel ? `<option value="">${escapeHtml(emptyLabel)}</option>` : ""}${items.map((item) =>
      `<option value="${item.id}">${escapeHtml(item.name)}</option>`).join("")}`;
  }

  function populateDemandFilterBanks(items) {
    if (!demandFilterBank) return;
    demandFilterBank.innerHTML = options(items, "Todos os bancos");
    if (reportBank) reportBank.innerHTML = options(items, "Todos os bancos");
  }

  function statusOptions(values, selected) {
    return values.map((status) =>
      `<option value="${escapeHtml(status)}" ${status === selected ? "selected" : ""}>${escapeHtml(status)}</option>`
    ).join("");
  }

  function renderDashboard(data) {
    dashboardSummary = data || {};
    panel.querySelectorAll("[data-demand-metric]").forEach((element) => {
      element.textContent = Number(data[element.dataset.demandMetric] || 0).toLocaleString("pt-BR");
    });
    panel.querySelectorAll("[data-demand-money]").forEach((element) => {
      element.textContent = money(data[element.dataset.demandMoney]);
    });
  }

  function demandSearchText(item) {
    return normalize([
      item.os_number,
      String(item.os_number || "").slice(-4),
      item.final_os_number,
      item.proponent_cpf,
      item.proponent_name,
      item.bank_name,
      item.city,
      item.state_code,
      item.engineer_name,
      item.partner_name,
      item.demand_status,
      item.payment_status,
    ].filter(Boolean).join(" "));
  }

  function demandMatchesFilters(item) {
    const search = normalize(demandListSearch?.value || "");
    const bank = demandFilterBank?.value || "";
    const status = demandFilterStatus?.value || "";
    const deadline = demandFilterDeadline?.value || "";
    const payment = demandFilterPayment?.value || "";
    if (search && !demandSearchText(item).includes(search)) return false;
    if (bank && item.client_bank_id !== bank) return false;
    if (status && item.demand_status !== status) return false;
    if (deadline && item.deadline_status !== deadline) return false;
    if (payment && item.payment_status !== payment) return false;
    return true;
  }

  function updateDemandFilterSummary(total, shown) {
    if (!demandFilterSummary) return;
    const totalText = `${shown.toLocaleString("pt-BR")} de ${total.toLocaleString("pt-BR")} demanda(s) exibida(s).`;
    const hasFilter = Boolean(
      (demandListSearch?.value || "").trim()
      || demandFilterBank?.value
      || demandFilterStatus?.value
      || demandFilterDeadline?.value
      || demandFilterPayment?.value
    );
    demandFilterSummary.textContent = hasFilter ? `${totalText} Filtro ativo.` : totalText;
    demandFilterSummary.className = hasFilter ? "project-status warn" : "project-status";
  }

  function localDateString() {
    const date = new Date();
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
    return date.toISOString().slice(0, 10);
  }

  function quickActionButtons(item) {
    const actions = [];
    if (item.art_status !== "ART paga") {
      actions.push('<button type="button" class="table-action quick" data-quick-demand="' + item.id + '" data-quick-action="art_paid">ART paga</button>');
    }
    if (!item.delivered_to_engineer_at) {
      actions.push('<button type="button" class="table-action quick" data-quick-demand="' + item.id + '" data-quick-action="delivered_engineer">Entregue eng.</button>');
    }
    if (item.system_status !== "Concluída" || !item.system_finished_at) {
      actions.push('<button type="button" class="table-action quick" data-quick-demand="' + item.id + '" data-quick-action="system_finished">Finalizar sistema</button>');
    }
    if (item.payment_status !== "Pagamento realizado") {
      actions.push('<button type="button" class="table-action quick payment" data-quick-demand="' + item.id + '" data-quick-action="payment_done">Pagamento realizado</button>');
    }
    if (!actions.length) return '<span class="quick-actions-done">Fluxo principal concluído</span>';
    return actions.join("");
  }

  function demandFinancialSummary(item) {
    const serviceValue = Number(item.service_value || 0);
    const partnerFee = Number(item.partner_fee || 0);
    const artValue = Number(item.art_value || 0);
    const netValue = serviceValue - partnerFee - artValue;
    const partnerPercent = serviceValue > 0 ? (partnerFee / serviceValue) * 100 : 0;
    const artPercent = serviceValue > 0 ? (artValue / serviceValue) * 100 : 0;
    return { serviceValue, partnerFee, artValue, netValue, partnerPercent, artPercent };
  }

  function dateValue(value) {
    if (!value) return null;
    const date = new Date(`${value}T12:00:00`);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  function reportMatchesFilters(item) {
    const arrival = dateValue(item.arrival_date);
    const start = dateValue(reportStartDate?.value);
    const end = dateValue(reportEndDate?.value);
    const search = normalize(reportSearch?.value || "");
    if (start && arrival && arrival < start) return false;
    if (end && arrival && arrival > end) return false;
    if (reportBank?.value && item.client_bank_id !== reportBank.value) return false;
    if (reportStatus?.value && item.demand_status !== reportStatus.value) return false;
    if (reportDeadline?.value && item.deadline_status !== reportDeadline.value) return false;
    if (reportPayment?.value && item.payment_status !== reportPayment.value) return false;
    if (reportArt?.value && item.art_status !== reportArt.value) return false;
    if (search && !demandSearchText(item).includes(search)) return false;
    return true;
  }

  function reportFilteredDemands() {
    return demands.filter(reportMatchesFilters);
  }

  function reportTotals(items) {
    return items.reduce((summary, item) => {
      const financial = demandFinancialSummary(item);
      summary.total += 1;
      summary.overdue += item.deadline_status === "Fora do prazo" ? 1 : 0;
      summary.pendingArt += item.art_status === "Pendente" ? 1 : 0;
      summary.pendingPayment += ["Não realizado", "Parcial"].includes(item.payment_status) ? 1 : 0;
      summary.service += financial.serviceValue;
      summary.partner += financial.partnerFee;
      summary.art += financial.artValue;
      summary.net += financial.netValue;
      return summary;
    }, { total: 0, overdue: 0, pendingArt: 0, pendingPayment: 0, service: 0, partner: 0, art: 0, net: 0 });
  }

  function isFinishedDemand(item) {
    return ["Finalizada", "Entregue"].includes(item.demand_status)
      || item.system_status === "Concluída"
      || Boolean(item.system_finished_at);
  }

  function productivityMatchesFilters(item) {
    const arrival = dateValue(item.arrival_date);
    const start = dateValue(productivityStartDate?.value);
    const end = dateValue(productivityEndDate?.value);
    const search = normalize(productivitySearch?.value || "");
    if (start && arrival && arrival < start) return false;
    if (end && arrival && arrival > end) return false;
    if (search && !demandSearchText(item).includes(search)) return false;
    return true;
  }

  function productivityGroupLabel(item, groupBy) {
    const groups = {
      engineer: item.engineer_name || "Engenheiro não definido",
      partner: item.partner_name || "Parceiro não definido",
      bank: item.bank_name || "Banco não informado",
      city: [item.city, item.state_code].filter(Boolean).join("/") || "Cidade não informada",
      status: item.demand_status || "Situação não informada",
    };
    return groups[groupBy] || groups.engineer;
  }

  function productivityRowsFromDemands(items) {
    const groupBy = productivityGroupBy?.value || "engineer";
    const groups = new Map();
    items.forEach((item) => {
      const label = productivityGroupLabel(item, groupBy);
      const current = groups.get(label) || {
        label,
        count: 0,
        finished: 0,
        ontime: 0,
        overdue: 0,
        pendingArt: 0,
        pendingPayment: 0,
        service: 0,
        partner: 0,
        art: 0,
        net: 0,
        days: 0,
        daysCount: 0,
        examples: [],
      };
      const financial = demandFinancialSummary(item);
      const days = Number(item.days_execution ?? item.current_execution_days ?? 0);
      current.count += 1;
      current.finished += isFinishedDemand(item) ? 1 : 0;
      current.ontime += item.deadline_status === "Dentro do prazo" ? 1 : 0;
      current.overdue += item.deadline_status === "Fora do prazo" ? 1 : 0;
      current.pendingArt += item.art_status === "Pendente" ? 1 : 0;
      current.pendingPayment += ["Não realizado", "Parcial"].includes(item.payment_status) ? 1 : 0;
      current.service += financial.serviceValue;
      current.partner += financial.partnerFee;
      current.art += financial.artValue;
      current.net += financial.netValue;
      if (Number.isFinite(days) && days >= 0) {
        current.days += days;
        current.daysCount += 1;
      }
      if (current.examples.length < 4) current.examples.push(item.os_number);
      groups.set(label, current);
    });
    return Array.from(groups.values()).map((row) => ({
      ...row,
      completionRate: row.count ? (row.finished / row.count) * 100 : 0,
      ontimeRate: row.count ? (row.ontime / row.count) * 100 : 0,
      pendingTotal: row.pendingArt + row.pendingPayment + row.overdue,
      averageDays: row.daysCount ? row.days / row.daysCount : 0,
    }));
  }

  function sortProductivityRows(rows) {
    const sortBy = productivitySortBy?.value || "count";
    const sorters = {
      count: (a, b) => b.count - a.count || b.finished - a.finished || b.net - a.net,
      finished: (a, b) => b.finished - a.finished || b.ontimeRate - a.ontimeRate || b.count - a.count,
      ontime: (a, b) => b.ontimeRate - a.ontimeRate || b.finished - a.finished || a.overdue - b.overdue,
      net: (a, b) => b.net - a.net || b.count - a.count,
      service: (a, b) => b.service - a.service || b.count - a.count,
      pending: (a, b) => a.pendingTotal - b.pendingTotal || b.ontimeRate - a.ontimeRate || b.count - a.count,
    };
    return [...rows].sort(sorters[sortBy] || sorters.count);
  }

  function bestProductivity(rows, sorter, fallback = "—") {
    if (!rows.length) return fallback;
    return [...rows].sort(sorter)[0]?.label || fallback;
  }

  function renderProductivityCards(rows, items) {
    if (!productivityCards) return;
    const filtered = items.length;
    const totalFinished = items.filter(isFinishedDemand).length;
    const bestVolume = bestProductivity(rows, (a, b) => b.count - a.count || b.finished - a.finished);
    const bestDeadline = bestProductivity(rows.filter((row) => row.count > 0), (a, b) => b.ontimeRate - a.ontimeRate || b.finished - a.finished);
    const bestNet = bestProductivity(rows, (a, b) => b.net - a.net || b.count - a.count);
    const averageCycle = rows.reduce((total, row) => total + row.days, 0) / Math.max(rows.reduce((total, row) => total + row.daysCount, 0), 1);
    const cards = [
      ["OS filtradas", filtered.toLocaleString("pt-BR"), `${totalFinished.toLocaleString("pt-BR")} finalizada(s)/entregue(s)`],
      ["Maior volume", bestVolume, "Grupo com mais ordens de serviço"],
      ["Melhor pontualidade", bestDeadline, "Maior percentual dentro do prazo"],
      ["Maior valor livre", bestNet, "Resultado líquido estimado"],
      ["Prazo médio operacional", `${averageCycle.toLocaleString("pt-BR", { maximumFractionDigits: 1 })} dia(s)`, "Média das OS filtradas"],
    ];
    productivityCards.innerHTML = cards.map(([label, value, hint]) => `
      <article>
        <small>${escapeHtml(label)}</small>
        <strong>${escapeHtml(value)}</strong>
        <span>${escapeHtml(hint)}</span>
      </article>
    `).join("");
  }

  function renderProductivityRows(rows) {
    if (!productivityRows) return;
    if (!rows.length) {
      productivityRows.innerHTML = '<tr><td colspan="7">Nenhum dado de produtividade encontrado para os filtros atuais.</td></tr>';
      return;
    }
    productivityRows.innerHTML = rows.map((row) => `
      <tr>
        <td><strong>${escapeHtml(row.label)}</strong><small>Ex.: ${escapeHtml(row.examples.filter(Boolean).map((item) => `OS ${item}`).join(" · ") || "Sem OS")}</small></td>
        <td>${row.count.toLocaleString("pt-BR")}</td>
        <td><strong>${row.finished.toLocaleString("pt-BR")}</strong><small>${percent(row.completionRate)}</small></td>
        <td><strong>${row.ontime.toLocaleString("pt-BR")}</strong><small>${percent(row.ontimeRate)} · ${row.overdue.toLocaleString("pt-BR")} fora</small></td>
        <td>${row.averageDays.toLocaleString("pt-BR", { maximumFractionDigits: 1 })} dia(s)</td>
        <td>${row.pendingTotal.toLocaleString("pt-BR")}<small>ART: ${row.pendingArt.toLocaleString("pt-BR")} · Pgto: ${row.pendingPayment.toLocaleString("pt-BR")}</small></td>
        <td><strong>${money(row.service)}</strong><small>Livre: ${money(row.net)}</small></td>
      </tr>
    `).join("");
  }

  function renderProductivityPanel() {
    const items = demands.filter(productivityMatchesFilters);
    const rows = sortProductivityRows(productivityRowsFromDemands(items));
    renderProductivityCards(rows, items);
    renderProductivityRows(rows);
    if (productivityStatus) {
      const groupLabel = productivityGroupBy?.selectedOptions?.[0]?.textContent || "Engenheiro";
      productivityStatus.textContent = `${items.length.toLocaleString("pt-BR")} demanda(s) analisada(s), agrupadas por ${groupLabel.toLowerCase()}.`;
      productivityStatus.className = items.length ? "project-status ok" : "project-status warn";
    }
  }

  function clearProductivityFilters() {
    [productivityStartDate, productivityEndDate, productivitySearch].filter(Boolean).forEach((control) => { control.value = ""; });
    if (productivityGroupBy) productivityGroupBy.value = "engineer";
    if (productivitySortBy) productivitySortBy.value = "count";
    renderProductivityPanel();
  }

  function renderReportCards(summary) {
    if (!managementReportCards) return;
    const cards = [
      ["Demandas", summary.total.toLocaleString("pt-BR")],
      ["Fora do prazo", summary.overdue.toLocaleString("pt-BR")],
      ["ART pendente", summary.pendingArt.toLocaleString("pt-BR")],
      ["Pagamento pendente", summary.pendingPayment.toLocaleString("pt-BR")],
      ["Valor dos serviços", money(summary.service)],
      ["Honorários parceiros", money(summary.partner)],
      ["Valor das ARTs", money(summary.art)],
      ["Valor livre das OS", money(summary.net)],
    ];
    managementReportCards.innerHTML = cards.map(([label, value]) => `
      <article>
        <small>${escapeHtml(label)}</small>
        <strong>${escapeHtml(value)}</strong>
      </article>
    `).join("");
  }

  function groupedReport(items, keyFn) {
    const groups = new Map();
    items.forEach((item) => {
      const key = keyFn(item) || "Não informado";
      const current = groups.get(key) || { label: key, count: 0, service: 0, net: 0, pending: 0, overdue: 0 };
      const financial = demandFinancialSummary(item);
      current.count += 1;
      current.service += financial.serviceValue;
      current.net += financial.netValue;
      current.pending += ["Não realizado", "Parcial"].includes(item.payment_status) ? 1 : 0;
      current.overdue += item.deadline_status === "Fora do prazo" ? 1 : 0;
      groups.set(key, current);
    });
    return Array.from(groups.values()).sort((a, b) => b.count - a.count || b.service - a.service);
  }

  function renderGroupedReport(target, rows, emptyText) {
    if (!target) return;
    if (!rows.length) {
      target.innerHTML = `<div class="registry-empty">${escapeHtml(emptyText)}</div>`;
      return;
    }
    target.innerHTML = rows.map((row) => `
      <article>
        <div>
          <strong>${escapeHtml(row.label)}</strong>
          <small>${row.count.toLocaleString("pt-BR")} demanda(s) · ${row.overdue.toLocaleString("pt-BR")} fora do prazo · ${row.pending.toLocaleString("pt-BR")} pgto. pendente</small>
        </div>
        <span>${money(row.net)}</span>
      </article>
    `).join("");
  }

  function renderCriticalIssues(items) {
    if (!reportCriticalIssues) return;
    const issues = [
      { label: "Fora do prazo", items: items.filter((item) => item.deadline_status === "Fora do prazo") },
      { label: "ART pendente", items: items.filter((item) => item.art_status === "Pendente") },
      { label: "Pagamento pendente", items: items.filter((item) => ["Não realizado", "Parcial"].includes(item.payment_status)) },
      { label: "Sem engenheiro", items: items.filter((item) => !item.engineer_id) },
      { label: "Sem parceiro", items: items.filter((item) => !item.partner_id) },
    ].filter((issue) => issue.items.length);
    if (!issues.length) {
      reportCriticalIssues.innerHTML = '<div class="registry-empty">Nenhuma pendência crítica nos filtros atuais.</div>';
      return;
    }
    reportCriticalIssues.innerHTML = issues.map((issue) => `
      <article>
        <div>
          <strong>${escapeHtml(issue.label)}</strong>
          <small>${issue.items.slice(0, 4).map((item) => `OS ${item.os_number}`).join(" · ")}${issue.items.length > 4 ? " · ..." : ""}</small>
        </div>
        <span>${issue.items.length.toLocaleString("pt-BR")}</span>
      </article>
    `).join("");
  }

  function renderReportRows(items) {
    if (!managementReportRows) return;
    if (!items.length) {
      managementReportRows.innerHTML = '<tr><td colspan="7">Nenhuma demanda encontrada para os filtros do relatório.</td></tr>';
      return;
    }
    managementReportRows.innerHTML = items.map((item) => {
      const financial = demandFinancialSummary(item);
      return `
        <tr class="${item.deadline_status === "Fora do prazo" ? "demand-overdue" : ""}">
          <td><strong>${escapeHtml(formatDate(item.client_deadline))}</strong><small>${escapeHtml(item.deadline_status)}</small></td>
          <td>${escapeHtml(item.bank_name || "Não informado")}</td>
          <td><strong>${escapeHtml(item.os_number || "-")}</strong><small>${escapeHtml(item.proponent_name || "Proponente não informado")}</small></td>
          <td>${escapeHtml([item.city, item.state_code].filter(Boolean).join("/") || "Não informado")}</td>
          <td>${escapeHtml(item.engineer_name || "Eng. não definido")}<small>${escapeHtml(item.partner_name || "Parceiro não definido")}</small></td>
          <td>${escapeHtml(item.demand_status || "-")}<small>ART: ${escapeHtml(item.art_status || "-")} · Pgto: ${escapeHtml(item.payment_status || "-")}</small></td>
          <td><strong>${money(financial.serviceValue)}</strong><small>Livre: ${money(financial.netValue)}</small></td>
        </tr>`;
    }).join("");
  }

  function renderManagementReport() {
    const items = reportFilteredDemands();
    const summary = reportTotals(items);
    renderReportCards(summary);
    renderGroupedReport(reportByBank, groupedReport(items, (item) => item.bank_name), "Nenhum banco/cliente no relatório.");
    renderGroupedReport(reportByEngineer, groupedReport(items, (item) => item.engineer_name), "Nenhum engenheiro no relatório.");
    renderGroupedReport(reportByPartner, groupedReport(items, (item) => item.partner_name), "Nenhum parceiro no relatório.");
    renderCriticalIssues(items);
    renderReportRows(items);
    const startLabel = reportStartDate?.value ? formatDate(reportStartDate.value) : "início";
    const endLabel = reportEndDate?.value ? formatDate(reportEndDate.value) : "fim";
    if (managementReportPeriod) managementReportPeriod.textContent = `Período: ${startLabel} a ${endLabel}. Registros considerados: ${items.length.toLocaleString("pt-BR")}.`;
    if (managementReportGeneratedAt) managementReportGeneratedAt.textContent = `Gerado em ${new Date().toLocaleString("pt-BR")}`;
    if (managementReportStatus) {
      managementReportStatus.textContent = `${items.length.toLocaleString("pt-BR")} demanda(s) no relatório. Impressão/PDF disponível.`;
      managementReportStatus.className = items.length ? "project-status ok" : "project-status warn";
    }
  }

  function clearManagementReportFilters() {
    [reportStartDate, reportEndDate, reportBank, reportStatus, reportDeadline, reportPayment, reportArt, reportSearch]
      .filter(Boolean)
      .forEach((control) => { control.value = ""; });
    renderManagementReport();
  }

  function printManagementReport() {
    renderManagementReport();
    document.body.classList.add("printing-management-report");
    const cleanup = () => document.body.classList.remove("printing-management-report");
    window.addEventListener("afterprint", cleanup, { once: true });
    window.print();
    setTimeout(cleanup, 1200);
  }

  function renderDemandRows(items) {
    visibleDemands = items;
    if (!items.length) {
      tableBody.innerHTML = demands.length
        ? '<tr><td colspan="9">Nenhuma demanda encontrada com os filtros aplicados.</td></tr>'
        : '<tr><td colspan="9">Nenhuma demanda cadastrada.</td></tr>';
      updateDemandFilterSummary(demands.length, 0);
      return;
    }
    tableBody.innerHTML = items.map((item) => `
      <tr class="${item.deadline_status === "Fora do prazo" ? "demand-overdue" : ""}">
        <td><strong>${escapeHtml(item.client_deadline)}</strong><small>${escapeHtml(item.deadline_status)}</small></td>
        <td>${escapeHtml(item.bank_name)}</td>
        <td>${escapeHtml(item.os_number)}</td>
        <td>${escapeHtml(item.city)}/${escapeHtml(item.state_code)}</td>
        <td>${escapeHtml(item.engineer_name || "Não definido")}</td>
        <td>${escapeHtml(item.partner_name || "Não definido")}</td>
        <td>${escapeHtml(item.demand_status)}</td>
        <td class="${["Não realizado", "Parcial"].includes(item.payment_status) ? "demand-payment-pending" : ""}">
          <select class="table-status-select" data-update-payment="${item.id}" aria-label="Atualizar pagamento ao parceiro da OS ${escapeHtml(item.os_number)}">
            ${statusOptions(PAYMENT_STATUS_OPTIONS, item.payment_status)}
          </select>
        </td>
        <td>
          <div class="inline-actions">
            <button type="button" class="table-action" data-view-demand="${item.id}">Ver detalhes</button>
            <button type="button" class="table-action" data-edit-demand="${item.id}">Editar</button>
            <button type="button" class="table-action" data-create-evaluation="${item.id}">${item.evaluation_id ? "Abrir avaliação" : "Criar avaliação"}</button>
          </div>
          <div class="quick-actions" aria-label="Ações rápidas da OS ${escapeHtml(item.os_number)}">
            ${quickActionButtons(item)}
          </div>
        </td>
      </tr>`).join("");
    updateDemandFilterSummary(demands.length, items.length);
  }

  function applyDemandListFilters() {
    renderDemandRows(demands.filter(demandMatchesFilters));
  }

  function renderDemands(items) {
    demands = Array.isArray(items) ? items : [];
    applyDemandListFilters();
    renderProductivityPanel();
    renderManagementReport();
  }

  function demandPayloadFromItem(item, overrides = {}) {
    return {
      client_bank_id: item.client_bank_id,
      os_number: item.os_number,
      final_os_number: item.final_os_number || null,
      proponent_name: item.proponent_name || null,
      proponent_cpf: item.proponent_cpf || null,
      arrival_date: item.arrival_date,
      client_deadline: item.client_deadline || null,
      deadline_days: Number(item.deadline_days) || 7,
      service_value: item.service_value != null ? Number(item.service_value) : null,
      engineer_id: item.engineer_id || null,
      art_status: item.art_status || "Pendente",
      art_value: item.art_value != null ? Number(item.art_value) : null,
      partner_id: item.partner_id || null,
      partner_fee: item.partner_fee != null ? Number(item.partner_fee) : null,
      city: item.city,
      state_code: item.state_code,
      demand_status: item.demand_status || "Recebida",
      partner_status: item.partner_status || "Não definido",
      system_status: item.system_status || "Não iniciado",
      payment_status: item.payment_status || "Não realizado",
      delivered_to_engineer_at: item.delivered_to_engineer_at || null,
      system_finished_at: item.system_finished_at || null,
      evaluation_id: item.evaluation_id || null,
      notes: item.notes || null,
      ...overrides,
    };
  }

  function demandLabel(item) {
    return `${item.bank_name || "Banco não informado"} · OS ${item.os_number || "sem OS"}`;
  }

  function demandSubLabel(item) {
    const parts = [
      [item.city, item.state_code].filter(Boolean).join("/"),
      item.proponent_name ? `Proponente: ${item.proponent_name}` : "",
      item.client_deadline ? `Prazo: ${item.client_deadline}` : "",
      item.deadline_status || "",
      item.demand_status || "",
    ].filter(Boolean);
    return parts.join(" · ");
  }

  function detailField(label, value) {
    return `<div class="demand-detail-field"><small>${escapeHtml(label)}</small><strong>${escapeHtml(value || "Não informado")}</strong></div>`;
  }

  function detailMetric(label, value, tone = "") {
    return `<div class="demand-detail-metric ${escapeHtml(tone)}"><small>${escapeHtml(label)}</small><strong>${escapeHtml(value || "—")}</strong></div>`;
  }

  function statusPill(label, value, tone = "") {
    return `<span class="demand-status-pill ${escapeHtml(tone)}">${escapeHtml(label)}: ${escapeHtml(value || "Não informado")}</span>`;
  }

  function timelineStep(label, value, completed, detail = "") {
    return `
      <div class="demand-timeline-step ${completed ? "done" : "pending"}">
        <span aria-hidden="true"></span>
        <div>
          <strong>${escapeHtml(label)}</strong>
          <small>${escapeHtml(value || detail || (completed ? "Concluído" : "Pendente"))}</small>
        </div>
      </div>`;
  }

  function renderDemandTimeline(demand) {
    return `
      <div class="demand-detail-section span-3">
        <div class="demand-detail-section-heading">
          <span class="financial-kicker">Histórico operacional</span>
          <h4>Linha do tempo da OS</h4>
        </div>
        <div class="demand-timeline">
          ${timelineStep("Recebimento da demanda", formatDate(demand.arrival_date), Boolean(demand.arrival_date))}
          ${timelineStep("Prazo do cliente", formatDate(demand.client_deadline), Boolean(demand.client_deadline), `${Number(demand.deadline_days || 7)} dia(s)`)}
          ${timelineStep("ART regularizada", demand.art_status, demand.art_status === "ART paga" || demand.art_status === "Isento")}
          ${timelineStep("Parceiro definido", demand.partner_name, Boolean(demand.partner_id || demand.partner_name))}
          ${timelineStep("Entregue ao engenheiro", formatDate(demand.delivered_to_engineer_at), Boolean(demand.delivered_to_engineer_at))}
          ${timelineStep("Finalizada no sistema/banco", formatDate(demand.system_finished_at), Boolean(demand.system_finished_at))}
          ${timelineStep("Pagamento do parceiro", demand.payment_status, demand.payment_status === "Pagamento realizado" || demand.payment_status === "Não se aplica")}
        </div>
      </div>`;
  }

  function renderDemandDetail(demand) {
    if (!demand || !demandDetailPanel) return;
    const financial = demandFinancialSummary(demand);
    const paymentTone = demand.payment_status === "Pagamento realizado" || demand.payment_status === "Não se aplica" ? "ok" : "warn";
    const deadlineTone = demand.deadline_status === "Fora do prazo" ? "fail" : "ok";
    const artTone = demand.art_status === "ART paga" || demand.art_status === "Isento" ? "ok" : "warn";
    demandDetailTitle.textContent = `${demand.bank_name || "Banco não informado"} · OS ${demand.os_number || "sem número"}`;
    demandDetailSummary.textContent = demandSubLabel(demand) || "Dados principais da demanda selecionada.";
    demandDetailBody.innerHTML = `
      <div class="demand-detail-section span-3">
        <div class="demand-detail-section-heading">
          <span class="financial-kicker">Extrato financeiro</span>
          <h4>Composição da OS</h4>
        </div>
        <div class="demand-detail-metrics">
          ${detailMetric("Valor do serviço", money(financial.serviceValue), "main")}
          ${detailMetric("Honorário do parceiro", money(financial.partnerFee), "partner")}
          ${detailMetric("Valor da ART", money(financial.artValue), "art")}
          ${detailMetric("Valor líquido estimado", money(financial.netValue), financial.netValue >= 0 ? "ok" : "fail")}
          ${detailMetric("% do honorário", percent(financial.partnerPercent), "neutral")}
          ${detailMetric("% da ART", percent(financial.artPercent), "neutral")}
        </div>
        <div class="demand-status-row">
          ${statusPill("Pagamento", demand.payment_status, paymentTone)}
          ${statusPill("Prazo", demand.deadline_status, deadlineTone)}
          ${statusPill("ART", demand.art_status, artTone)}
        </div>
      </div>

      <div class="demand-detail-section span-3">
        <div class="demand-detail-section-heading">
          <span class="financial-kicker">Dados cadastrais</span>
          <h4>Identificação e responsáveis</h4>
        </div>
        <div class="demand-detail-grid">
          ${detailField("Banco / cliente", demand.bank_name)}
          ${detailField("Número da OS", demand.os_number)}
          ${detailField("Número final da OS", demand.final_os_number)}
          ${detailField("Proponente", demand.proponent_name)}
          ${detailField("CPF do proponente", demand.proponent_cpf)}
          ${detailField("Cidade / UF", [demand.city, demand.state_code].filter(Boolean).join("/"))}
          ${detailField("Engenheiro", demand.engineer_name)}
          ${detailField("Parceiro", demand.partner_name)}
          ${detailField("Prazo definido", formatDate(demand.client_deadline))}
          ${detailField("Situação", demand.demand_status)}
          ${detailField("Status do parceiro", demand.partner_status)}
          ${detailField("Status no sistema/banco", demand.system_status)}
        </div>
      </div>

      ${renderDemandTimeline(demand)}

      <div class="demand-detail-field span-3"><small>Observações</small><strong>${escapeHtml(demand.notes || "Sem observações")}</strong></div>
      <div class="inline-actions span-3">
        <button type="button" class="secondary-button" data-detail-edit="${demand.id}">Editar cadastro</button>
        <button type="button" class="primary-button" data-detail-create-evaluation="${demand.id}">${demand.evaluation_id ? "Abrir avaliação" : "Criar avaliação"}</button>
        <button type="button" class="secondary-button" data-detail-link-evaluation="${demand.id}">Vincular avaliação existente</button>
      </div>
    `;
    demandDetailPanel.hidden = false;
    demandDetailPanel.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function drilldownConfig(type) {
    const configs = {
      total: {
        title: "Total de demandas",
        description: "Todas as demandas cadastradas no Controle de Demanda.",
        dashboardKey: "total_demands",
        filter: () => true,
        value: (items) => `${items.length.toLocaleString("pt-BR")} demanda(s)`,
      },
      overdue: {
        title: "Demandas fora do prazo",
        description: "Demandas cujo prazo calculado já foi atingido ou ultrapassado e ainda não estão finalizadas.",
        dashboardKey: "overdue",
        filter: (item) => item.deadline_status === "Fora do prazo",
        value: (items) => `${items.length.toLocaleString("pt-BR")} demanda(s) fora do prazo`,
      },
      pending_art: {
        title: "ART pendente",
        description: "Demandas com status de ART marcado como pendente.",
        dashboardKey: "pending_art",
        filter: (item) => item.art_status === "Pendente",
        value: (items) => `${items.length.toLocaleString("pt-BR")} ART(s) pendente(s)`,
      },
      pending_payment: {
        title: "Pagamento pendente",
        description: "Demandas com pagamento não realizado ou parcial.",
        dashboardKey: "pending_payment",
        filter: (item) => ["Não realizado", "Parcial"].includes(item.payment_status),
        value: (items) => `${items.length.toLocaleString("pt-BR")} pagamento(s) pendente(s)`,
      },
      service_value: {
        title: "Valor dos serviços",
        description: "Composição do valor bruto dos serviços cadastrados.",
        dashboardMoneyKey: "total_service_value",
        filter: (item) => Number(item.service_value || 0) > 0,
        value: (items) => money(items.reduce((total, item) => total + Number(item.service_value || 0), 0)),
        lineValue: (item) => money(item.service_value),
      },
      partner_fees: {
        title: "Honorários de parceiros",
        description: "Composição dos honorários de parceiros vinculados às demandas.",
        dashboardMoneyKey: "total_partner_fees",
        filter: (item) => Number(item.partner_fee || 0) > 0,
        value: (items) => money(items.reduce((total, item) => total + Number(item.partner_fee || 0), 0)),
        lineValue: (item) => money(item.partner_fee),
      },
      art_values: {
        title: "Valor das ARTs",
        description: "Composição dos valores de ART informados manualmente nas demandas.",
        dashboardMoneyKey: "total_art_value",
        filter: (item) => Number(item.art_value || 0) > 0,
        value: (items) => money(items.reduce((total, item) => total + Number(item.art_value || 0), 0)),
        lineValue: (item) => money(item.art_value),
      },
      net_value: {
        title: "Valor livre das OS",
        description: "Valor dos serviços descontando honorários de parceiros e ARTs.",
        dashboardMoneyKey: "total_net_value",
        filter: (item) => Number(item.service_value || 0) > 0,
        value: (items) => money(items.reduce((total, item) => total + demandFinancialSummary(item).netValue, 0)),
        lineValue: (item) => money(demandFinancialSummary(item).netValue),
      },
    };
    return configs[type] || configs.total;
  }

  function renderDemandDrilldown(type) {
    const config = drilldownConfig(type);
    const source = Array.isArray(demands) ? demands : [];
    const items = source.filter(config.filter);
    const dashboardValue = config.dashboardMoneyKey
      ? money(dashboardSummary[config.dashboardMoneyKey])
      : `${Number(dashboardSummary[config.dashboardKey] || 0).toLocaleString("pt-BR")} registro(s)`;
    const summaryValue = source.length ? config.value(items) : dashboardValue;
    demandDrilldownTitle.textContent = config.title;
    demandDrilldownSummary.textContent = `${config.description} Total do indicador: ${summaryValue}.`;

    if (!source.length) {
      demandDrilldownList.innerHTML = '<div class="registry-empty">O resumo foi carregado, mas a lista detalhada ainda não respondeu. Recarregue após o deploy estabilizar; se persistir, verifique a rota de demandas no Render.</div>';
    } else if (!items.length) {
      demandDrilldownList.innerHTML = '<div class="registry-empty">Nenhum registro encontrado para este indicador.</div>';
    } else {
      demandDrilldownList.innerHTML = items.map((item) => `
        <div class="demand-drilldown-item">
          <div>
            <strong>${escapeHtml(demandLabel(item))}</strong>
            <small>${escapeHtml(demandSubLabel(item))}</small>
          </div>
          <span>${escapeHtml(config.lineValue ? config.lineValue(item) : item.payment_status || item.art_status || item.deadline_status || item.demand_status || "Detalhe")}</span>
        </div>`).join("");
    }
    panel.querySelectorAll("[data-demand-drilldown]").forEach((card) => {
      card.classList.toggle("active", card.dataset.demandDrilldown === type);
    });
    demandDrilldownPanel.hidden = false;
    demandDrilldownPanel.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function renderPartners(items) {
    const active = items.filter((item) => item.active);
    partnerRegistryList.innerHTML = active.length ? active.map((item) => `
      <div class="registry-item">
        <div><strong>${escapeHtml(item.name)}</strong><small>${escapeHtml([item.base_city, item.state_code].filter(Boolean).join("/\u200b") || "Localidade não informada")}${item.phone ? ` · ${escapeHtml(item.phone)}` : ""}</small></div>
        <span class="registry-state">ATIVO</span>
      </div>`).join("") : '<div class="registry-empty">Nenhum parceiro cadastrado.</div>';
  }

  function renderEngineers(items) {
    const active = items.filter((item) => item.active);
    engineerRegistryList.innerHTML = active.length ? active.map((item) => `
      <div class="registry-item">
        <div><strong>${escapeHtml(item.name)}</strong><small>${escapeHtml(item.professional_registration || "Registro não informado")}${item.base_state ? ` · ${escapeHtml(item.base_state)}` : ""}</small></div>
        <span class="registry-state">ATIVO</span>
      </div>`).join("") : '<div class="registry-empty">Nenhum engenheiro cadastrado.</div>';
  }

  function renderFinancialEvolution(items) {
    financialItems = items;
    const gross = items.reduce((total, item) => total + Number(item.gross_revenue || 0), 0);
    const net = items.reduce((total, item) => total + Number(item.estimated_net || 0), 0);
    const osCount = items.reduce((total, item) => total + Number(item.os_count || 0), 0);
    document.querySelector("#financialPeriodGross").textContent = money(gross);
    document.querySelector("#financialPeriodNet").textContent = money(net);
    document.querySelector("#financialPeriodOs").textContent = osCount.toLocaleString("pt-BR");
    const current = Number(items.at(-1)?.gross_revenue || 0);
    const previous = Number(items.at(-2)?.gross_revenue || 0);
    const change = previous > 0 ? ((current - previous) / previous) * 100 : null;
    const changeElement = document.querySelector("#financialMonthlyChange");
    changeElement.textContent = change === null ? "—" : `${change >= 0 ? "+" : ""}${change.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%`;
    changeElement.style.color = change === null ? "" : change >= 0 ? "var(--green)" : "var(--red)";
    financialEmpty.hidden = items.length > 0;
    drawFinancialChart(items);
  }

  function drawFinancialChart(items) {
    const canvas = financialCanvas;
    const context = canvas.getContext("2d");
    const width = Math.max(canvas.parentElement.clientWidth - 20, 320);
    const height = 300;
    const ratio = window.devicePixelRatio || 1;
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.clearRect(0, 0, width, height);
    if (!items.length) return;
    const margins = { top: 22, right: 20, bottom: 48, left: 64 };
    const chartWidth = width - margins.left - margins.right;
    const chartHeight = height - margins.top - margins.bottom;
    const maximum = Math.max(...items.flatMap((item) => [Number(item.gross_revenue || 0), Number(item.partner_fees || 0), Number(item.art_values || 0), Number(item.estimated_net || 0)]), 1);
    context.font = "11px Inter, Arial";
    context.lineWidth = 1;
    for (let index = 0; index <= 4; index += 1) {
      const y = margins.top + (chartHeight / 4) * index;
      const value = maximum * (1 - index / 4);
      context.strokeStyle = "#e5edf5";
      context.beginPath(); context.moveTo(margins.left, y); context.lineTo(width - margins.right, y); context.stroke();
      context.fillStyle = "#718096";
      context.textAlign = "right";
      context.fillText(value >= 1000 ? `R$ ${(value / 1000).toFixed(0)} mil` : `R$ ${value.toFixed(0)}`, margins.left - 8, y + 4);
    }
    const slot = chartWidth / items.length;
    const barWidth = Math.min(18, slot * 0.23);
    const points = [];
    items.forEach((item, index) => {
      const center = margins.left + slot * index + slot / 2;
      const grossValue = Number(item.gross_revenue || 0);
      const feeValue = Number(item.partner_fees || 0);
      const netValue = Number(item.estimated_net || 0);
      const grossHeight = (grossValue / maximum) * chartHeight;
      const feeHeight = (feeValue / maximum) * chartHeight;
      context.fillStyle = "#005eb8";
      context.fillRect(center - barWidth - 2, margins.top + chartHeight - grossHeight, barWidth, grossHeight);
      context.fillStyle = "#f28c18";
      context.fillRect(center + 2, margins.top + chartHeight - feeHeight, barWidth, feeHeight);
      points.push({ x: center, y: margins.top + chartHeight - (netValue / maximum) * chartHeight });
      const monthDate = new Date(`${item.month}T12:00:00`);
      context.fillStyle = "#52647a";
      context.textAlign = "center";
      context.fillText(monthDate.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" }).replace(" de ", "/"), center, height - 20);
    });
    context.strokeStyle = "#11a9d6";
    context.lineWidth = 3;
    context.beginPath();
    points.forEach((point, index) => index ? context.lineTo(point.x, point.y) : context.moveTo(point.x, point.y));
    context.stroke();
    points.forEach((point) => { context.fillStyle = "#fff"; context.strokeStyle = "#11a9d6"; context.lineWidth = 3; context.beginPath(); context.arc(point.x, point.y, 4, 0, Math.PI * 2); context.fill(); context.stroke(); });
  }

  function renderEvaluationDemandMatches(items) {
    evaluationSearchResults = items;
    evaluationDemandMatches.hidden = false;
    if (!items.length) {
      evaluationDemandMatches.innerHTML = '<div class="registry-empty">Nenhuma OS encontrada com esses dados.</div>';
      return;
    }
    evaluationDemandMatches.innerHTML = items.map((item) => `
      <div class="evaluation-demand-match">
        <div>
          <strong>${escapeHtml(item.bank_name)} · OS ${escapeHtml(item.os_number)}</strong>
          <small>${escapeHtml(item.city)}/${escapeHtml(item.state_code)} · Recebida em ${escapeHtml(item.arrival_date)} · ${escapeHtml(item.proponent_name || "Proponente não informado")} · ${escapeHtml(item.demand_status)}${item.evaluation_id ? " · avaliação vinculada" : ""}</small>
        </div>
        <button type="button" class="primary-button" data-use-demand="${item.id}">${item.evaluation_id ? "Abrir / usar OS" : "Criar avaliação"}</button>
      </div>`).join("");
  }

  function savedEvaluationsForDemand(demand) {
    if (!demand || !window.SISAVALIA?.findStoredProjectsByOs) return [];
    return window.SISAVALIA.findStoredProjectsByOs(demand.os_number);
  }

  function duplicateEvaluationReferences(demand) {
    const savedProjects = savedEvaluationsForDemand(demand);
    if (savedProjects.length || !demand?.evaluation_id) return savedProjects;
    return [{
      id: "",
      name: "Avaliação vinculada no Controle de Demanda",
      osNumber: demand.os_number,
      proponent: demand.proponent_name || "",
      city: demand.city || "",
      state: demand.state_code || "",
      updatedAt: "",
      sampleCount: 0,
      backendOnly: true,
    }];
  }

  function renderDuplicateEvaluationDecision(demand, savedProjects) {
    evaluationSearchResults = [demand];
    evaluationDemandMatches.hidden = false;
    const hasLocalProject = savedProjects.some((project) => project.id);
    evaluationDemandMatches.innerHTML = `
      <div class="evaluation-duplicate-card">
        <span class="financial-kicker">Possível duplicidade identificada</span>
        <h4>Já existe avaliação vinculada à OS ${escapeHtml(demand.os_number)}.</h4>
        <p>Escolha uma ação antes de preencher a avaliação. O SISAVALIA não substituirá dados automaticamente.</p>
        <div class="evaluation-duplicate-actions">
          <button type="button" class="secondary-button" data-evaluation-decision="verify" data-demand-id="${demand.id}">Verificar</button>
          <button type="button" class="primary-button" data-evaluation-decision="replace" data-demand-id="${demand.id}">Substituir</button>
          <button type="button" class="ghost-button" data-evaluation-decision="keep" data-demand-id="${demand.id}">Manter</button>
        </div>
        <div class="evaluation-duplicate-list" hidden>
          ${savedProjects.map((project) => `
            <article>
              <div>
                <strong>${escapeHtml(project.name)}</strong>
                <small>OS ${escapeHtml(project.osNumber || demand.os_number)} · ${escapeHtml([project.city, project.state].filter(Boolean).join("/") || "Local não informado")} · ${project.backendOnly ? "Registro vinculado no PostgreSQL" : `${Number(project.sampleCount || 0).toLocaleString("pt-BR")} amostra(s)`}</small>
              </div>
              ${project.id
                ? `<button type="button" class="table-action" data-open-project="${escapeHtml(project.id)}">Abrir para verificar</button>`
                : '<span class="registry-state">Sem projeto local</span>'}
            </article>
          `).join("")}
        </div>
      </div>`;
    evaluationDemandMessage.textContent = hasLocalProject
      ? `Existe avaliação salva com a OS ${demand.os_number}. Escolha: verificar, substituir ou manter.`
      : `Existe vínculo técnico no PostgreSQL para a OS ${demand.os_number}, mas nenhum rascunho local foi encontrado neste navegador. Você pode substituir para recriar o rascunho local.`;
    evaluationDemandMessage.className = "project-status warn";
  }

  function demandManagementNote(demand) {
    const financial = demandFinancialSummary(demand);
    return [
      "Origem: Controle de Demanda SISAVALIA.",
      `Banco/cliente: ${demand.bank_name || "não informado"}.`,
      `OS: ${demand.os_number || "não informada"}.`,
      demand.final_os_number ? `Número final da OS: ${demand.final_os_number}.` : "",
      demand.client_deadline ? `Prazo cliente: ${formatDate(demand.client_deadline)}.` : "",
      demand.engineer_name ? `Engenheiro: ${demand.engineer_name}.` : "",
      demand.partner_name ? `Parceiro: ${demand.partner_name}.` : "",
      financial.serviceValue ? `Valor da OS: ${money(financial.serviceValue)}.` : "",
      financial.partnerFee ? `Honorário parceiro: ${money(financial.partnerFee)}.` : "",
      financial.artValue ? `Valor ART: ${money(financial.artValue)}.` : "",
      demand.notes ? `Observações da demanda: ${demand.notes}` : "",
    ].filter(Boolean).join(" ");
  }

  function fillDemandFields(demand, preserveExisting = false) {
    const managementNote = demandManagementNote(demand);
    const mappings = {
      osNumber: demand.os_number,
      osDate: demand.arrival_date,
      proponent: demand.proponent_name,
      cpfCnpj: demand.proponent_cpf,
      city: demand.city,
      state: demand.state_code,
      propertyNotes: managementNote,
    };
    Object.entries(mappings).forEach(([id, fieldValue]) => {
      const field = document.querySelector(`#${id}`);
      if (!field || fieldValue == null) return;
      if (id === "propertyNotes" && preserveExisting && field.value.trim()) {
        if (!field.value.includes("Origem: Controle de Demanda SISAVALIA.")) {
          field.value = `${field.value.trim()}\n\n${fieldValue}`;
        }
        return;
      }
      if (!preserveExisting || !field.value) field.value = fieldValue;
    });
    const projectName = document.querySelector("#projectName");
    if (projectName && (!preserveExisting || !projectName.value.trim())) projectName.value = `${demand.bank_name} - OS ${demand.os_number}`;
    sessionStorage.setItem("sisavalia.activeDemandId", demand.id);
  }

  function saveEvaluationDraftFromDemand(demand, createNewDraft = true) {
    if (!window.SISAVALIA?.saveCurrentProject) return false;
    if (createNewDraft && window.SISAVALIA.state) {
      window.SISAVALIA.state.activeProjectId = null;
      window.SISAVALIA.state.projectDirty = true;
    }
    window.SISAVALIA.saveCurrentProject();
    const storedProjects = savedEvaluationsForDemand(demand);
    return storedProjects.length > 0;
  }

  async function registerEvaluationLink(demand, replaceExisting = false) {
    if (!backendOnline || !demand?.id) return;
    try {
      const projectPayload = window.SISAVALIA?.currentProjectData ? window.SISAVALIA.currentProjectData() : {};
      const result = await request(`/demands/${demand.id}/evaluation`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-SISAVALIA-User": "Admin" },
        body: JSON.stringify({
          name: `${demand.bank_name} - OS ${demand.os_number}`,
          project_payload: projectPayload,
          replace_existing: Boolean(replaceExisting),
        }),
      });
      const linkedId = result?.evaluation?.id || result?.demand?.evaluation_id;
      if (linkedId) {
        const localDemand = demands.find((item) => item.id === demand.id);
        if (localDemand) localDemand.evaluation_id = linkedId;
      }
    } catch (error) {
      evaluationDemandMessage.textContent = `Campos preenchidos, mas o vínculo no PostgreSQL não foi salvo: ${error.message}`;
      evaluationDemandMessage.className = "project-status warn";
    }
  }

  function useDemandInEvaluation(demand, options = {}) {
    const savedProjects = duplicateEvaluationReferences(demand);
    if (savedProjects.length && !options.confirmedReplacement) {
      renderDuplicateEvaluationDecision(demand, savedProjects);
      return;
    }
    fillDemandFields(demand, Boolean(options.preserveExisting));
    const savedDraft = saveEvaluationDraftFromDemand(demand, options.createNewDraft !== false);
    evaluationDemandMessage.textContent = savedDraft
      ? `Avaliação criada/vinculada à OS ${demand.os_number} de ${demand.bank_name}. Campos preenchidos e rascunho salvo em Projetos.`
      : `Avaliação vinculada à OS ${demand.os_number} de ${demand.bank_name}. Campos disponíveis preenchidos automaticamente.`;
    evaluationDemandMessage.className = "project-status ok";
    evaluationDemandMatches.hidden = true;
    location.hash = "os";
    registerEvaluationLink(demand, Boolean(options.confirmedReplacement));
    if (window.SISAVALIA?.updateAll) window.SISAVALIA.updateAll();
  }

  function openDemandInEvaluation(demand, preserveExisting = false) {
    if (!demand) return;
    useDemandInEvaluation(demand, { preserveExisting, createNewDraft: !preserveExisting });
  }

  async function quickUpdateDemand(demandId, overrides, control, successText = "Demanda atualizada com sucesso.") {
    const demand = demands.find((item) => item.id === demandId);
    if (!demand) return;
    if (!backendOnline) {
      message.textContent = "Controle de Demanda offline. Clique em “Testar conexão” antes de atualizar.";
      message.className = "project-status fail";
      if (control && "value" in control) control.value = demand.payment_status || "Não realizado";
      return;
    }
    const payload = demandPayloadFromItem(demand, overrides);
    if (control) control.disabled = true;
    message.textContent = "Atualizando demanda...";
    message.className = "project-status warn";
    try {
      await request(`/demands/${demand.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-SISAVALIA-User": "Admin" },
        body: JSON.stringify(payload),
      });
      message.textContent = successText;
      message.className = "project-status ok";
      await loadModule();
    } catch (error) {
      message.textContent = `${error.message} Não foi possível atualizar a demanda.`;
      message.className = "project-status fail";
      if (control && "value" in control) control.value = demand.payment_status || "Não realizado";
    } finally {
      if (control) control.disabled = false;
    }
  }

  function quickActionPayload(action) {
    const today = localDateString();
    const actions = {
      art_paid: {
        label: "ART marcada como paga.",
        overrides: { art_status: "ART paga" },
      },
      delivered_engineer: {
        label: "Demanda marcada como entregue ao engenheiro.",
        overrides: {
          delivered_to_engineer_at: today,
          demand_status: "Enviada ao engenheiro",
        },
      },
      system_finished: {
        label: "Demanda finalizada no sistema/banco.",
        overrides: {
          system_finished_at: today,
          system_status: "Concluída",
          demand_status: "Finalizada",
        },
      },
      payment_done: {
        label: "Pagamento ao parceiro marcado como realizado.",
        overrides: { payment_status: "Pagamento realizado" },
      },
    };
    return actions[action] || null;
  }

  async function searchDemandsForEvaluation() {
    if (!backendOnline) {
      evaluationDemandMessage.textContent = "Controle de Demanda offline. Clique em “Testar conexão” no módulo gerencial e tente novamente.";
      evaluationDemandMessage.className = "project-status fail";
      return;
    }
    const search = evaluationDemandSearch.value.trim();
    if (search.length < 2) {
      evaluationDemandMessage.textContent = "Digite ao menos dois caracteres para pesquisar.";
      evaluationDemandMessage.className = "project-status warn";
      return;
    }
    searchEvaluationDemandButton.disabled = true;
    evaluationDemandMessage.textContent = "Pesquisando ordens de serviço...";
    try {
      const result = await request(`/demands?limit=50&search=${encodeURIComponent(search)}`);
      renderEvaluationDemandMatches(result.items);
      evaluationDemandMessage.textContent = `${result.items.length} demanda(s) encontrada(s).`;
      evaluationDemandMessage.className = "project-status ok";
    } catch (error) {
      evaluationDemandMessage.textContent = `${error.message} Se a API de bancos funciona, aguarde o deploy concluir e tente novamente.`;
      evaluationDemandMessage.className = "project-status fail";
    } finally {
      searchEvaluationDemandButton.disabled = false;
    }
  }

  async function resetDemands() {
    if (!backendOnline) {
      message.textContent = "Controle de Demanda offline. Teste a conexão antes de limpar demandas.";
      message.className = "project-status fail";
      return;
    }
    const confirmation = window.prompt("Esta ação apagará as demandas e pagamentos de OS vinculados. Para confirmar, digite LIMPAR:");
    if (confirmation !== "LIMPAR") {
      message.textContent = "Limpeza cancelada. Nenhuma demanda foi apagada.";
      message.className = "project-status warn";
      return;
    }
    resetDemandsButton.disabled = true;
    message.textContent = "Limpando demandas cadastradas...";
    message.className = "project-status warn";
    try {
      const result = await request("/demands/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-SISAVALIA-User": "Admin" },
        body: JSON.stringify({ confirmation }),
      });
      demands = [];
      evaluationSearchResults = [];
      if (evaluationDemandMatches) evaluationDemandMatches.hidden = true;
      if (demandDrilldownPanel) demandDrilldownPanel.hidden = true;
      panel.querySelectorAll("[data-demand-drilldown]").forEach((card) => card.classList.remove("active"));
      message.textContent = `Controle de Demanda limpo: ${Number(result.deleted_demands || 0).toLocaleString("pt-BR")} demanda(s) e ${Number(result.deleted_payments || 0).toLocaleString("pt-BR")} pagamento(s) vinculados removidos.`;
      message.className = "project-status ok";
      finishEditing();
      await loadModule();
    } catch (error) {
      message.textContent = `${error.message} Não foi possível limpar as demandas.`;
      message.className = "project-status fail";
    } finally {
      resetDemandsButton.disabled = false;
    }
  }

  async function loadModule() {
    setBackendDependentState(false);
    setBackendStatus(
      "warn",
      "Verificando Controle de Demanda",
      "Testando acesso ao backend e ao PostgreSQL.",
      `Destino da API: ${backendTargetLabel()}`
    );
    try {
      const banks = await request("/client-banks");
      bankSelect.innerHTML = options(banks.items);
      populateDemandFilterBanks(banks.items);
      setBackendDependentState(true);
      setBackendStatus(
        "ok",
        "Controle de Demanda conectado",
        "Backend e lista de bancos responderam corretamente.",
        `Destino da API: ${backendTargetLabel()}`
      );

      const [engineers, partners, dashboard, demandList] = await Promise.allSettled([
        request("/engineers"), request("/partners"), request("/dashboard"), request("/demands"),
      ]);

      if (engineers.status === "fulfilled") {
        engineerSelect.innerHTML = options(engineers.value.items, "Não definido");
        renderEngineers(engineers.value.items);
      } else {
        engineerSelect.innerHTML = '<option value="">Não definido</option>';
        engineerRegistryList.innerHTML = '<div class="registry-empty">Não foi possível carregar engenheiros agora.</div>';
      }

      if (partners.status === "fulfilled") {
        partnerSelect.innerHTML = options(partners.value.items, "Não definido");
        renderPartners(partners.value.items);
      } else {
        partnerSelect.innerHTML = '<option value="">Não definido</option>';
        partnerRegistryList.innerHTML = '<div class="registry-empty">Não foi possível carregar parceiros agora.</div>';
      }

      if (dashboard.status === "fulfilled") {
        renderDashboard(dashboard.value);
      }

      if (demandList.status === "fulfilled") {
        renderDemands(demandList.value.items);
        if (demandList.value.warning) {
          tableBody.innerHTML = `<tr><td colspan="9">${escapeHtml(demandList.value.warning)}</td></tr>`;
        }
      } else {
        demands = [];
        visibleDemands = [];
        renderManagementReport();
        tableBody.innerHTML = '<tr><td colspan="9">Lista de demandas indisponível no momento. Cadastre uma nova demanda ou tente recarregar.</td></tr>';
      }

      try {
        const financial = await request("/financial/monthly?months=12");
        renderFinancialEvolution(financial.items);
      } catch (financialError) {
        financialEmpty.hidden = false;
        financialEmpty.textContent = "Reinicie o backend para carregar a evolução financeira mensal.";
      }
      const partialFailures = [engineers, partners, dashboard, demandList].filter((result) => result.status === "rejected").length + (demandList.status === "fulfilled" && demandList.value.warning ? 1 : 0);
      message.textContent = partialFailures
        ? "Bancos carregados. Algumas áreas auxiliares ainda não responderam; recarregue após o deploy estabilizar."
        : "Controle de Demanda conectado.";
      message.className = partialFailures ? "project-status warn" : "project-status ok";
      if (partialFailures) {
        setBackendStatus(
          "warn",
          "Controle de Demanda parcialmente carregado",
          "A API respondeu, mas uma ou mais listas auxiliares falharam.",
          "Você pode cadastrar se os bancos estiverem carregados; se algo não aparecer, clique em Testar conexão após alguns segundos."
        );
      }
    } catch (error) {
      bankSelect.innerHTML = '<option value="">Backend indisponível — reinicie para carregar bancos</option>';
      engineerSelect.innerHTML = '<option value="">Backend indisponível</option>';
      partnerSelect.innerHTML = '<option value="">Backend indisponível</option>';
      populateDemandFilterBanks([]);
      tableBody.innerHTML = '<tr><td colspan="9">Não foi possível carregar as demandas. Reinicie o backend e recarregue a página.</td></tr>';
      renderDashboard({});
      demands = [];
      visibleDemands = [];
      updateDemandFilterSummary(0, 0);
      renderProductivityPanel();
      renderManagementReport();
      if (demandDrilldownPanel) demandDrilldownPanel.hidden = true;
      if (demandDetailPanel) demandDetailPanel.hidden = true;
      const help = backendHelpMessage(error);
      setBackendDependentState(false);
      setBackendStatus("fail", help.title, help.text, help.hint);
      message.textContent = `${help.text} ${help.hint}`;
      message.className = "project-status fail";
    }
  }

  function value(id) {
    return document.querySelector(`#${id}`).value.trim();
  }

  function setValue(id, fieldValue) {
    const field = document.querySelector(`#${id}`);
    if (field) field.value = fieldValue ?? "";
  }

  function finishEditing() {
    editingDemandId = null;
    form.reset();
    setValue("demandDeadlineDays", "7");
    setValue("demandArrivalDate", new Date().toISOString().slice(0, 10));
    saveButton.textContent = "Cadastrar demanda";
    cancelEditButton.hidden = true;
  }

  function startEditingDemand(demand) {
    if (!demand) return;
    editingDemandId = demand.id;
    const mappings = {
      demandBank: demand.client_bank_id, demandOsNumber: demand.os_number,
      demandFinalOsNumber: demand.final_os_number, demandProponentName: demand.proponent_name,
      demandProponentCpf: demand.proponent_cpf, demandArrivalDate: demand.arrival_date,
      demandDeadlineDays: demand.deadline_days, demandDeadline: demand.client_deadline,
      demandServiceValue: demand.service_value, demandEngineer: demand.engineer_id,
      demandArtStatus: demand.art_status, demandArtValue: demand.art_value,
      demandPartner: demand.partner_id,
      demandPartnerFee: demand.partner_fee, demandCity: demand.city,
      demandState: demand.state_code, demandStatus: demand.demand_status,
      demandPartnerStatus: demand.partner_status, demandSystemStatus: demand.system_status,
      demandPaymentStatus: demand.payment_status, demandDeliveredToEngineer: demand.delivered_to_engineer_at,
      demandSystemFinished: demand.system_finished_at, demandNotes: demand.notes,
    };
    Object.entries(mappings).forEach(([id, fieldValue]) => setValue(id, fieldValue));
    saveButton.textContent = "Salvar alterações";
    cancelEditButton.hidden = false;
    form.closest("details").open = true;
    form.scrollIntoView({ behavior: "smooth", block: "start" });
    message.textContent = `Editando a OS ${demand.os_number}.`;
    message.className = "project-status";
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!backendOnline) {
      message.textContent = "Controle de Demanda offline. Clique em “Testar conexão” antes de cadastrar.";
      message.className = "project-status fail";
      return;
    }
    saveButton.disabled = true;
    message.textContent = editingDemandId ? "Salvando alterações..." : "Cadastrando demanda...";
    try {
      const previous = demands.find((item) => item.id === editingDemandId);
      const payload = {
        client_bank_id: value("demandBank"),
        os_number: value("demandOsNumber"),
        final_os_number: value("demandFinalOsNumber") || null,
        proponent_name: value("demandProponentName") || null,
        proponent_cpf: value("demandProponentCpf") || null,
        arrival_date: value("demandArrivalDate"),
        client_deadline: value("demandDeadline") || null,
        deadline_days: Number(value("demandDeadlineDays")) || 7,
        service_value: value("demandServiceValue") ? Number(value("demandServiceValue")) : null,
        engineer_id: value("demandEngineer") || null,
        art_status: value("demandArtStatus"),
        art_value: value("demandArtValue") ? Number(value("demandArtValue")) : null,
        partner_id: value("demandPartner") || null,
        partner_fee: value("demandPartnerFee") ? Number(value("demandPartnerFee")) : null,
        city: value("demandCity"),
        state_code: value("demandState").toUpperCase(),
        demand_status: value("demandStatus"),
        partner_status: value("demandPartnerStatus") || "Não definido",
        system_status: value("demandSystemStatus") || "Não iniciado",
        payment_status: value("demandPaymentStatus") || "Não realizado",
        delivered_to_engineer_at: value("demandDeliveredToEngineer") || null,
        system_finished_at: value("demandSystemFinished") || null,
        evaluation_id: previous?.evaluation_id || null,
        notes: value("demandNotes") || null,
      };
      await request(editingDemandId ? `/demands/${editingDemandId}` : "/demands", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-SISAVALIA-User": "Admin" },
        body: JSON.stringify(payload),
      });
      const wasEditing = Boolean(editingDemandId);
      finishEditing();
      message.textContent = wasEditing ? "Demanda atualizada com sucesso." : "Demanda cadastrada com sucesso.";
      message.className = "project-status ok";
      await loadModule();
    } catch (error) {
      message.textContent = error.message;
      message.className = "project-status fail";
    } finally {
      saveButton.disabled = false;
    }
  });

  partnerForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!backendOnline) {
      partnerMessage.textContent = "Backend offline. Teste a conexão antes de salvar parceiro.";
      partnerMessage.className = "project-status fail";
      return;
    }
    const submit = partnerForm.querySelector('button[type="submit"]');
    submit.disabled = true;
    partnerMessage.textContent = "Salvando parceiro...";
    try {
      const city = value("partnerCity");
      const state = value("partnerState").toUpperCase();
      await request("/partners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: value("partnerName"), person_type: value("partnerPersonType") || null,
          cpf_cnpj: value("partnerDocument") || null, base_city: city || null,
          state_code: state || null, served_locations: city ? [{ city, state_code: state }] : [],
          phone: value("partnerPhone") || null, email: value("partnerEmail") || null,
          pix: value("partnerPix") || null, bank: value("partnerBank") || null,
          agency: value("partnerAgency") || null, account: value("partnerAccount") || null,
          operation: value("partnerOperation") || null, account_holder: value("partnerAccountHolder") || null,
          notes: value("partnerNotes") || null, active: true,
        }),
      });
      partnerForm.reset();
      partnerMessage.textContent = "Parceiro cadastrado com sucesso.";
      partnerMessage.className = "project-status ok";
      await loadModule();
    } catch (error) {
      partnerMessage.textContent = error.message;
      partnerMessage.className = "project-status fail";
    } finally {
      submit.disabled = false;
    }
  });

  engineerForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!backendOnline) {
      engineerMessage.textContent = "Backend offline. Teste a conexão antes de salvar engenheiro.";
      engineerMessage.className = "project-status fail";
      return;
    }
    const submit = engineerForm.querySelector('button[type="submit"]');
    submit.disabled = true;
    engineerMessage.textContent = "Salvando engenheiro...";
    try {
      await request("/engineers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: value("engineerName"), professional_registration: value("engineerRegistration") || null,
          base_state: value("engineerState").toUpperCase() || null,
          phone: value("engineerPhone") || null, email: value("engineerEmail") || null,
          notes: value("engineerNotes") || null, active: true,
        }),
      });
      engineerForm.reset();
      engineerMessage.textContent = "Engenheiro cadastrado com sucesso.";
      engineerMessage.className = "project-status ok";
      await loadModule();
    } catch (error) {
      engineerMessage.textContent = error.message;
      engineerMessage.className = "project-status fail";
    } finally {
      submit.disabled = false;
    }
  });

  tableBody.addEventListener("click", (event) => {
    const viewButton = event.target.closest("[data-view-demand]");
    if (viewButton) {
      const demand = demands.find((item) => item.id === viewButton.dataset.viewDemand);
      renderDemandDetail(demand);
      return;
    }
    const editButton = event.target.closest("[data-edit-demand]");
    if (editButton) {
      const demand = demands.find((item) => item.id === editButton.dataset.editDemand);
      startEditingDemand(demand);
      return;
    }
    const quickButton = event.target.closest("[data-quick-demand]");
    if (quickButton) {
      const action = quickActionPayload(quickButton.dataset.quickAction);
      if (action) {
        quickUpdateDemand(quickButton.dataset.quickDemand, action.overrides, quickButton, action.label);
      }
      return;
    }
    const button = event.target.closest("[data-create-evaluation]");
    if (!button) return;
    const demand = demands.find((item) => item.id === button.dataset.createEvaluation);
    openDemandInEvaluation(demand, Boolean(demand?.evaluation_id));
  });

  tableBody.addEventListener("change", (event) => {
    const paymentSelect = event.target.closest("[data-update-payment]");
    if (!paymentSelect) return;
    quickUpdateDemand(paymentSelect.dataset.updatePayment, { payment_status: paymentSelect.value }, paymentSelect);
  });

  document.querySelector("#refreshDemandsBtn").addEventListener("click", loadModule);
  retryDemandBackendButton?.addEventListener("click", loadModule);
  resetDemandsButton.addEventListener("click", resetDemands);
  [demandListSearch, demandFilterBank, demandFilterStatus, demandFilterDeadline, demandFilterPayment].filter(Boolean).forEach((control) => {
    control.addEventListener("input", applyDemandListFilters);
    control.addEventListener("change", applyDemandListFilters);
  });
  clearDemandFiltersButton?.addEventListener("click", () => {
    [demandListSearch, demandFilterBank, demandFilterStatus, demandFilterDeadline, demandFilterPayment].filter(Boolean).forEach((control) => { control.value = ""; });
    applyDemandListFilters();
  });
  [reportStartDate, reportEndDate, reportBank, reportStatus, reportDeadline, reportPayment, reportArt, reportSearch].filter(Boolean).forEach((control) => {
    control.addEventListener("input", renderManagementReport);
    control.addEventListener("change", renderManagementReport);
  });
  [productivityStartDate, productivityEndDate, productivityGroupBy, productivitySortBy, productivitySearch].filter(Boolean).forEach((control) => {
    control.addEventListener("input", renderProductivityPanel);
    control.addEventListener("change", renderProductivityPanel);
  });
  clearProductivityFiltersButton?.addEventListener("click", clearProductivityFilters);
  refreshManagementReportButton?.addEventListener("click", renderManagementReport);
  clearManagementReportFiltersButton?.addEventListener("click", clearManagementReportFilters);
  printManagementReportButton?.addEventListener("click", printManagementReport);
  closeDemandDetailButton?.addEventListener("click", () => {
    if (demandDetailPanel) demandDetailPanel.hidden = true;
  });
  demandDetailPanel?.addEventListener("click", (event) => {
    const editButton = event.target.closest("[data-detail-edit]");
    if (editButton) {
      startEditingDemand(demands.find((item) => item.id === editButton.dataset.detailEdit));
      return;
    }
    const createButton = event.target.closest("[data-detail-create-evaluation]");
    if (createButton) {
      const demand = demands.find((item) => item.id === createButton.dataset.detailCreateEvaluation);
      openDemandInEvaluation(demand, Boolean(demand?.evaluation_id));
      return;
    }
    const linkButton = event.target.closest("[data-detail-link-evaluation]");
    if (linkButton) {
      const demand = demands.find((item) => item.id === linkButton.dataset.detailLinkEvaluation);
      const savedProjects = duplicateEvaluationReferences(demand);
      if (savedProjects.length) {
        renderDuplicateEvaluationDecision(demand, savedProjects);
        location.hash = "os";
      } else {
        message.textContent = `Nenhuma avaliação salva foi encontrada para a OS ${demand?.os_number || ""}.`;
        message.className = "project-status warn";
      }
    }
  });
  panel.querySelectorAll("[data-demand-drilldown]").forEach((card) => {
    card.addEventListener("click", () => renderDemandDrilldown(card.dataset.demandDrilldown));
    card.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        renderDemandDrilldown(card.dataset.demandDrilldown);
      }
    });
  });
  closeDemandDrilldownButton.addEventListener("click", () => {
    demandDrilldownPanel.hidden = true;
    panel.querySelectorAll("[data-demand-drilldown]").forEach((card) => card.classList.remove("active"));
  });
  cancelEditButton.addEventListener("click", () => {
    finishEditing();
    message.textContent = "Edição cancelada.";
    message.className = "project-status";
  });
  searchEvaluationDemandButton.addEventListener("click", searchDemandsForEvaluation);
  evaluationDemandSearch.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      searchDemandsForEvaluation();
    }
  });
  evaluationDemandMatches.addEventListener("click", (event) => {
    const decisionButton = event.target.closest("[data-evaluation-decision]");
    if (decisionButton) {
      const demand = evaluationSearchResults.find((item) => item.id === decisionButton.dataset.demandId);
      if (!demand) return;
      const decision = decisionButton.dataset.evaluationDecision;
      if (decision === "verify") {
        const list = evaluationDemandMatches.querySelector(".evaluation-duplicate-list");
        if (list) list.hidden = !list.hidden;
        evaluationDemandMessage.textContent = "Abra a avaliação existente para verificar antes de decidir.";
        evaluationDemandMessage.className = "project-status warn";
        return;
      }
      if (decision === "replace") {
        useDemandInEvaluation(demand, { confirmedReplacement: true, preserveExisting: false });
        evaluationDemandMessage.textContent = `Dados da OS ${demand.os_number} substituíram os campos disponíveis da avaliação atual. Revise e salve o projeto.`;
        evaluationDemandMessage.className = "project-status ok";
        return;
      }
      if (decision === "keep") {
        evaluationDemandMatches.hidden = true;
        evaluationDemandMessage.textContent = `Mantida a avaliação existente da OS ${demand.os_number}; nenhum campo foi alterado.`;
        evaluationDemandMessage.className = "project-status";
        return;
      }
    }
    const projectButton = event.target.closest("[data-open-project]");
    if (projectButton) {
      if (window.SISAVALIA?.openStoredProject) {
        window.SISAVALIA.openStoredProject(projectButton.dataset.openProject);
        evaluationDemandMessage.textContent = "Avaliação existente aberta para verificação.";
        evaluationDemandMessage.className = "project-status ok";
      }
      return;
    }
    const button = event.target.closest("[data-use-demand]");
    if (!button) return;
    const demand = evaluationSearchResults.find((item) => item.id === button.dataset.useDemand);
    if (demand) useDemandInEvaluation(demand);
  });

  document.querySelector("#demandArrivalDate").value = new Date().toISOString().slice(0, 10);
  window.addEventListener("resize", () => drawFinancialChart(financialItems));
  loadModule();
})();
