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
  let demands = [];
  let financialItems = [];
  let evaluationSearchResults = [];
  let editingDemandId = null;

  function escapeHtml(value) {
    return String(value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
  }

  function money(value) {
    return Number(value || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
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

  function renderDashboard(data) {
    panel.querySelectorAll("[data-demand-metric]").forEach((element) => {
      element.textContent = Number(data[element.dataset.demandMetric] || 0).toLocaleString("pt-BR");
    });
    panel.querySelectorAll("[data-demand-money]").forEach((element) => {
      element.textContent = money(data[element.dataset.demandMoney]);
    });
  }

  function renderDemands(items) {
    demands = items;
    if (!items.length) {
      tableBody.innerHTML = '<tr><td colspan="9">Nenhuma demanda cadastrada.</td></tr>';
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
        <td class="${["Não realizado", "Parcial"].includes(item.payment_status) ? "demand-payment-pending" : ""}">${escapeHtml(item.payment_status)}</td>
        <td><div class="inline-actions"><button type="button" class="table-action" data-edit-demand="${item.id}">Editar</button><button type="button" class="table-action" data-create-evaluation="${item.id}">${item.evaluation_id ? "Abrir avaliação" : "Criar avaliação"}</button></div></td>
      </tr>`).join("");
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
    const maximum = Math.max(...items.flatMap((item) => [Number(item.gross_revenue || 0), Number(item.partner_fees || 0), Number(item.estimated_net || 0)]), 1);
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
          <small>${escapeHtml(item.city)}/${escapeHtml(item.state_code)} · Recebida em ${escapeHtml(item.arrival_date)} · ${escapeHtml(item.demand_status)}</small>
        </div>
        <button type="button" class="primary-button" data-use-demand="${item.id}">Usar nesta avaliação</button>
      </div>`).join("");
  }

  function useDemandInEvaluation(demand) {
    const mappings = {
      osNumber: demand.os_number,
      osDate: demand.arrival_date,
      city: demand.city,
      state: demand.state_code,
      propertyNotes: demand.notes,
    };
    Object.entries(mappings).forEach(([id, fieldValue]) => {
      const field = document.querySelector(`#${id}`);
      if (field && fieldValue != null) field.value = fieldValue;
    });
    const projectName = document.querySelector("#projectName");
    if (projectName) projectName.value = `${demand.bank_name} - OS ${demand.os_number}`;
    sessionStorage.setItem("sisavalia.activeDemandId", demand.id);
    evaluationDemandMessage.textContent = `Avaliação vinculada à OS ${demand.os_number} de ${demand.bank_name}. Campos disponíveis preenchidos automaticamente.`;
    evaluationDemandMessage.className = "project-status ok";
    evaluationDemandMatches.hidden = true;
    if (window.SISAVALIA?.updateAll) window.SISAVALIA.updateAll();
  }

  async function searchDemandsForEvaluation() {
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
      evaluationDemandMessage.textContent = error.message;
      evaluationDemandMessage.className = "project-status fail";
    } finally {
      searchEvaluationDemandButton.disabled = false;
    }
  }

  async function loadModule() {
    try {
      const banks = await request("/client-banks");
      bankSelect.innerHTML = options(banks.items);
      saveButton.disabled = false;

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
      } else {
        tableBody.innerHTML = '<tr><td colspan="9">Lista de demandas indisponível no momento. Cadastre uma nova demanda ou tente recarregar.</td></tr>';
      }

      try {
        const financial = await request("/financial/monthly?months=12");
        renderFinancialEvolution(financial.items);
      } catch (financialError) {
        financialEmpty.hidden = false;
        financialEmpty.textContent = "Reinicie o backend para carregar a evolução financeira mensal.";
      }
      const partialFailures = [engineers, partners, dashboard, demandList].filter((result) => result.status === "rejected").length;
      message.textContent = partialFailures
        ? "Bancos carregados. Algumas áreas auxiliares ainda não responderam; recarregue após o deploy estabilizar."
        : "Controle de Demanda conectado.";
      message.className = partialFailures ? "project-status warn" : "project-status ok";
    } catch (error) {
      bankSelect.innerHTML = '<option value="">Backend indisponível — reinicie para carregar bancos</option>';
      engineerSelect.innerHTML = '<option value="">Backend indisponível</option>';
      partnerSelect.innerHTML = '<option value="">Backend indisponível</option>';
      tableBody.innerHTML = '<tr><td colspan="9">Não foi possível carregar as demandas. Reinicie o backend e recarregue a página.</td></tr>';
      saveButton.disabled = true;
      message.textContent = `${error.message} Reinicie o backend e recarregue o SISAVALIA.`;
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

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    saveButton.disabled = true;
    message.textContent = editingDemandId ? "Salvando alterações..." : "Cadastrando demanda...";
    try {
      const previous = demands.find((item) => item.id === editingDemandId);
      const payload = {
        client_bank_id: value("demandBank"),
        os_number: value("demandOsNumber"),
        final_os_number: value("demandFinalOsNumber") || null,
        arrival_date: value("demandArrivalDate"),
        client_deadline: value("demandDeadline") || null,
        deadline_days: Number(value("demandDeadlineDays")) || 7,
        service_value: value("demandServiceValue") ? Number(value("demandServiceValue")) : null,
        engineer_id: value("demandEngineer") || null,
        art_status: value("demandArtStatus"),
        partner_id: value("demandPartner") || null,
        partner_fee: value("demandPartnerFee") ? Number(value("demandPartnerFee")) : null,
        city: value("demandCity"),
        state_code: value("demandState").toUpperCase(),
        demand_status: value("demandStatus"),
        partner_status: previous?.partner_status || "Não definido",
        system_status: previous?.system_status || "Não iniciado",
        payment_status: previous?.payment_status || "Não realizado",
        delivered_to_engineer_at: previous?.delivered_to_engineer_at || null,
        system_finished_at: previous?.system_finished_at || null,
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
    const editButton = event.target.closest("[data-edit-demand]");
    if (editButton) {
      const demand = demands.find((item) => item.id === editButton.dataset.editDemand);
      if (!demand) return;
      editingDemandId = demand.id;
      const mappings = {
        demandBank: demand.client_bank_id, demandOsNumber: demand.os_number,
        demandFinalOsNumber: demand.final_os_number, demandArrivalDate: demand.arrival_date,
        demandDeadlineDays: demand.deadline_days, demandDeadline: demand.client_deadline,
        demandServiceValue: demand.service_value, demandEngineer: demand.engineer_id,
        demandArtStatus: demand.art_status, demandPartner: demand.partner_id,
        demandPartnerFee: demand.partner_fee, demandCity: demand.city,
        demandState: demand.state_code, demandStatus: demand.demand_status, demandNotes: demand.notes,
      };
      Object.entries(mappings).forEach(([id, fieldValue]) => setValue(id, fieldValue));
      saveButton.textContent = "Salvar alterações";
      cancelEditButton.hidden = false;
      form.closest("details").open = true;
      form.scrollIntoView({ behavior: "smooth", block: "start" });
      message.textContent = `Editando a OS ${demand.os_number}.`;
      message.className = "project-status";
      return;
    }
    const button = event.target.closest("[data-create-evaluation]");
    if (!button) return;
    const demand = demands.find((item) => item.id === button.dataset.createEvaluation);
    if (!demand) return;
    const mappings = { osNumber: demand.os_number, osDate: demand.arrival_date, city: demand.city, state: demand.state_code };
    Object.entries(mappings).forEach(([id, fieldValue]) => {
      const field = document.querySelector(`#${id}`);
      if (field && !field.value) field.value = fieldValue || "";
    });
    const projectName = document.querySelector("#projectName");
    if (projectName && !projectName.value.trim()) projectName.value = `${demand.bank_name} - OS ${demand.os_number}`;
    sessionStorage.setItem("sisavalia.activeDemandId", demand.id);
    location.hash = "os";
  });

  document.querySelector("#refreshDemandsBtn").addEventListener("click", loadModule);
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
    const button = event.target.closest("[data-use-demand]");
    if (!button) return;
    const demand = evaluationSearchResults.find((item) => item.id === button.dataset.useDemand);
    if (demand) useDemandInEvaluation(demand);
  });

  document.querySelector("#demandArrivalDate").value = new Date().toISOString().slice(0, 10);
  window.addEventListener("resize", () => drawFinancialChart(financialItems));
  loadModule();
})();
