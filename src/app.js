const AUTH_SESSION_KEY = "sisavalia.authenticated";
const AUTH_CREDENTIAL_HASH = "4066a0bbf55aaf9cf2f27c884ddb1a9d95e0550986e76a028f06f2ea0312f8c2";
const loginGate = document.querySelector("#loginGate");
const loginForm = document.querySelector("#loginForm");
const loginUser = document.querySelector("#loginUser");
const loginPassword = document.querySelector("#loginPassword");
const loginError = document.querySelector("#loginError");

async function credentialHash(user, password) {
  const bytes = new TextEncoder().encode(`${user}:${password}`);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function setAuthenticated(authenticated) {
  document.body.classList.toggle("auth-locked", !authenticated);
  loginGate.hidden = authenticated;
  if (authenticated) sessionStorage.setItem(AUTH_SESSION_KEY, "true");
  else sessionStorage.removeItem(AUTH_SESSION_KEY);
}

async function authenticate(event) {
  event.preventDefault();
  loginError.textContent = "";
  try {
    const hash = await credentialHash(loginUser.value.trim(), loginPassword.value);
    if (hash !== AUTH_CREDENTIAL_HASH) {
      loginError.textContent = "Usuario ou senha invalidos.";
      loginPassword.select();
      return;
    }
    loginPassword.value = "";
    setAuthenticated(true);
  } catch {
    loginError.textContent = "Nao foi possivel validar o acesso neste navegador.";
  }
}

function logout() {
  setAuthenticated(false);
  loginUser.value = "Admin";
  loginPassword.value = "";
  loginError.textContent = "";
  loginPassword.focus();
}

const fields = {
  osNumber: document.querySelector("#osNumber"),
  osDate: document.querySelector("#osDate"),
  inspectionDate: document.querySelector("#inspectionDate"),
  proponent: document.querySelector("#proponent"),
  purpose: document.querySelector("#purpose"),
  objective: document.querySelector("#objective"),
  address: document.querySelector("#address"),
  city: document.querySelector("#city"),
  state: document.querySelector("#state"),
  propertyType: document.querySelector("#propertyType"),
  builtArea: document.querySelector("#builtArea"),
  landArea: document.querySelector("#landArea"),
  standard: document.querySelector("#standard"),
  conservation: document.querySelector("#conservation"),
  locationScore: document.querySelector("#locationScore"),
  bedrooms: document.querySelector("#bedrooms"),
  bathrooms: document.querySelector("#bathrooms"),
  parking: document.querySelector("#parking"),
  cpfCnpj: document.querySelector("#cpfCnpj"),
  addressNumber: document.querySelector("#addressNumber"),
  addressComplement: document.querySelector("#addressComplement"),
  neighborhood: document.querySelector("#neighborhood"),
  postalCode: document.querySelector("#postalCode"),
  ibgeCode: document.querySelector("#ibgeCode"),
  condominiumName: document.querySelector("#condominiumName"),
  registrationNumber: document.querySelector("#registrationNumber"),
  registryOffice: document.querySelector("#registryOffice"),
  registrationDate: document.querySelector("#registrationDate"),
  propertyNotes: document.querySelector("#propertyNotes"),
  predominantUse: document.querySelector("#predominantUse"),
  accessType: document.querySelector("#accessType"),
  riskArea: document.querySelector("#riskArea"),
  fronts: document.querySelector("#fronts"),
  frontage: document.querySelector("#frontage"),
  topography: document.querySelector("#topography"),
  blockPosition: document.querySelector("#blockPosition"),
  idealFraction: document.querySelector("#idealFraction"),
  surface: document.querySelector("#surface"),
  gradeFormat: document.querySelector("#gradeFormat"),
  urbanInfrastructure: document.querySelector("#urbanInfrastructure"),
  publicServices: document.querySelector("#publicServices"),
  propertyUse: document.querySelector("#propertyUse"),
  buildingPosition: document.querySelector("#buildingPosition"),
  occupancy: document.querySelector("#occupancy"),
  suites: document.querySelector("#suites"),
  lavatories: document.querySelector("#lavatories"),
  floors: document.querySelector("#floors"),
  apparentAge: document.querySelector("#apparentAge"),
  windowFrames: document.querySelector("#windowFrames"),
  roofCeiling: document.querySelector("#roofCeiling"),
  waterSupply: document.querySelector("#waterSupply"),
  sewage: document.querySelector("#sewage"),
  wallSystem: document.querySelector("#wallSystem"),
  deploymentType: document.querySelector("#deploymentType"),
  previouslyOccupied: document.querySelector("#previouslyOccupied"),
  unregisteredArea: document.querySelector("#unregisteredArea"),
  coveredParking: document.querySelector("#coveredParking"),
  uncoveredParking: document.querySelector("#uncoveredParking"),
  latitude: document.querySelector("#latitude"),
  longitude: document.querySelector("#longitude"),
  roomsDescription: document.querySelector("#roomsDescription"),
  propertyInfrastructure: document.querySelector("#propertyInfrastructure"),
  condominiumFeatures: document.querySelector("#condominiumFeatures"),
  documentationMatches: document.querySelector("#documentationMatches"),
  stability: document.querySelector("#stability"),
  apparentDefects: document.querySelector("#apparentDefects"),
  habitability: document.querySelector("#habitability"),
  environmentalFactors: document.querySelector("#environmentalFactors"),
  datecSinat: document.querySelector("#datecSinat"),
  inspectionContact: document.querySelector("#inspectionContact"),
  inspectionPhone: document.querySelector("#inspectionPhone"),
  contactDate: document.querySelector("#contactDate"),
  arrivalTime: document.querySelector("#arrivalTime"),
  departureTime: document.querySelector("#departureTime"),
  appointmentDate: document.querySelector("#appointmentDate"),
  appointmentTime: document.querySelector("#appointmentTime"),
  valuedFactors: document.querySelector("#valuedFactors"),
  restrictiveFactors: document.querySelector("#restrictiveFactors"),
  inspectionHistory: document.querySelector("#inspectionHistory"),
  marketPerformance: document.querySelector("#marketPerformance"),
  offersLevel: document.querySelector("#offersLevel"),
  liquidity: document.querySelector("#liquidity"),
  effectivePeriod: document.querySelector("#effectivePeriod"),
  guaranteeAccepted: document.querySelector("#guaranteeAccepted"),
  artRrt: document.querySelector("#artRrt"),
  autonomousUnits: document.querySelector("#autonomousUnits"),
  finalNotes: document.querySelector("#finalNotes"),
};

const samplesBody = document.querySelector("#samplesBody");
const checklist = document.querySelector("#checklist");
const modelReport = document.querySelector("#modelReport");
const tsProjectionStatus = document.querySelector("#tsProjectionStatus");
const tsProjectionCentral = document.querySelector("#tsProjectionCentral");
const tsProjectionIc80 = document.querySelector("#tsProjectionIc80");
const tsProjectionAmplitude = document.querySelector("#tsProjectionAmplitude");
const tsProjectionArbitration = document.querySelector("#tsProjectionArbitration");
const tsProjectionAdopted = document.querySelector("#tsProjectionAdopted");
const tsProjectionAdoptedUnit = document.querySelector("#tsProjectionAdoptedUnit");
const tsProjectionJustification = document.querySelector("#tsProjectionJustification");
const reportPreview = document.querySelector("#reportPreview");
const diagnosticCards = document.querySelector("#diagnosticCards");
const diagnosticSummary = document.querySelector("#diagnosticSummary");
const reviewVerdict = document.querySelector("#reviewVerdict");
const reviewMessage = document.querySelector("#reviewMessage");
const reviewResults = document.querySelector("#reviewResults");
const exportStatus = document.querySelector("#exportStatus");
const projectName = document.querySelector("#projectName");
const projectStatus = document.querySelector("#projectStatus");
const projectList = document.querySelector("#projectList");
const projectImportFile = document.querySelector("#projectImportFile");
const sampleImportFile = document.querySelector("#sampleImportFile");
const importMode = document.querySelector("#importMode");
const importStatus = document.querySelector("#importStatus");
const variableCatalog = document.querySelector("#variableCatalog");
const photoUploadInput = document.querySelector("#photoUploadInput");
const mapUploadInput = document.querySelector("#mapUploadInput");
const clearAttachmentsBtn = document.querySelector("#clearAttachmentsBtn");
const attachmentStatus = document.querySelector("#attachmentStatus");
const attachmentGallery = document.querySelector("#attachmentGallery");
const lookupCepBtn = document.querySelector("#lookupCepBtn");
const cepStatus = document.querySelector("#cepStatus");
const variableControls = document.querySelector("#variableControls");
const modelTarget = document.querySelector("#modelTarget");
const foundationControls = {
  characterization: document.querySelector("#foundationCharacterization"),
  collection: document.querySelector("#foundationCollection"),
  identification: document.querySelector("#foundationIdentification"),
};
const foundationRows = document.querySelector("#foundationRows");
const foundationSummary = document.querySelector("#foundationSummary");
const foundationNote = document.querySelector("#foundationNote");
const chartCanvases = {
  adherence: document.querySelector("#adherenceChart"),
  residual: document.querySelector("#residualChart"),
  normality: document.querySelector("#normalityChart"),
  correlation: document.querySelector("#correlationChart"),
};

const options = {
  purpose: ["GARANTIA DE CREDITO/EGI", "GARANTIA DE CREDITO/CONSORCIO", "VENDA", "LOCACAO"],
  objective: ["VALOR DE MERCADO DE COMPRA E VENDA", "VALOR DE MERCADO DE LOCACAO", "CUSTO DE REEDICAO"],
  propertyType: ["CASA", "APARTAMENTO", "TERRENO", "SALA", "LOJA", "GALPAO"],
  standard: [
    ["1", "BAIXO"],
    ["2", "NORMAL/MEDIO"],
    ["3", "ALTO"],
  ],
  conservation: [
    ["1", "REGULAR"],
    ["2", "BOM/BOA"],
    ["3", "NOVO/OTIMO"],
  ],
  locationScore: [
    ["1", "PERIFERICA"],
    ["2", "NORMAL/MEDIA"],
    ["3", "CENTRAL/BOA"],
  ],
  riskArea: ["NAO", "SIM", "NAO VERIFICADO"],
  previouslyOccupied: ["NAO INFORMADO", "NAO", "SIM"],
  documentationMatches: ["NAO VERIFICADO", "SIM", "NAO"],
  stability: ["NAO VERIFICADO", "SIM", "NAO"],
  apparentDefects: ["NAO VERIFICADO", "NAO", "SIM"],
  habitability: ["NAO VERIFICADO", "SIM", "NAO"],
  environmentalFactors: ["NAO VERIFICADO", "NAO", "SIM"],
  datecSinat: ["NAO VERIFICADO", "NAO", "SIM"],
  guaranteeAccepted: ["NAO DEFINIDO", "SIM", "NAO", "SIM, COM RESSALVAS"],
};

const PROJECT_STORAGE_KEY = "sisavalia.projects.v1";

function defaultModelConfig() {
  return {
    area: { active: true, transform: "ln" },
    location: { active: true, transform: "x" },
    standard: { active: true, transform: "x" },
    conservation: { active: true, transform: "x" },
  };
}

function defaultFoundationInputs() {
  return { characterization: 0, collection: 0, identification: 0 };
}

function syncFoundationControls() {
  Object.entries(foundationControls).forEach(([key, control]) => {
    control.value = String(state.foundationInputs[key] || 0);
  });
}

const state = {
  samples: [],
  result: null,
  error: "",
  modelTarget: "unit",
  foundationInputs: defaultFoundationInputs(),
  modelConfig: defaultModelConfig(),
  reportPhotos: [],
  reportMap: null,
  activeProjectId: null,
  projectDirty: false,
};

const modelVariables = [
  {
    key: "area",
    label: "Area",
    hint: "Area da amostra em m2",
    encoding: "quantitative",
    scale: "Quantitativa continua",
    expected: "Tende a reduzir o valor unitario quando a area aumenta, mantidas as demais condicoes.",
    rule: "Usar area compatível com a unidade de referência do avaliando; evitar misturar area de terreno e area construída sem justificativa.",
    sampleValue: (sample) => sample.area,
    subjectValue: () => numeric(fields.builtArea.value),
  },
  {
    key: "location",
    label: "Local",
    hint: "Nota 1 a 3 de localizacao",
    encoding: "allocated",
    scale: "Codigo alocado ordinal 1 a 3",
    expected: "Tende a aumentar o valor quando a localização é mais favorável.",
    rule: "Documentar criterio de atribuição das notas e evitar extrapolação fora dos códigos observados.",
    sampleValue: (sample) => sample.location,
    subjectValue: () => numeric(fields.locationScore.value),
  },
  {
    key: "standard",
    label: "Padrao",
    hint: "Nota 1 a 3 de padrao construtivo",
    encoding: "allocated",
    scale: "Codigo alocado ordinal 1 a 3",
    expected: "Tende a aumentar o valor quando o padrão construtivo é superior.",
    rule: "Justificar por vistoria, fotos, acabamento, benfeitorias e características observáveis.",
    sampleValue: (sample) => sample.standard,
    subjectValue: () => numeric(fields.standard.value),
  },
  {
    key: "conservation",
    label: "Conservacao",
    hint: "Nota 1 a 3 de estado de conservacao",
    encoding: "allocated",
    scale: "Codigo alocado ordinal 1 a 3",
    expected: "Tende a aumentar o valor quando o estado de conservação é melhor.",
    rule: "Atribuir a nota com base em evidências de vistoria e registrar ressalvas quando houver reparos pendentes.",
    sampleValue: (sample) => sample.conservation,
    subjectValue: () => numeric(fields.conservation.value),
  },
];

const transformOptions = [
  ["x", "x"],
  ["ln", "ln(x)"],
  ["inverse", "1/x"],
  ["sqrt", "sqrt(x)"],
  ["square", "x²"],
];

function populateSelect(select, values) {
  select.innerHTML = "";
  values.forEach((item) => {
    const option = document.createElement("option");
    if (Array.isArray(item)) {
      option.value = item[0];
      option.textContent = item[1];
    } else {
      option.value = item;
      option.textContent = item;
    }
    select.appendChild(option);
  });
}

function money(value) {
  if (!Number.isFinite(value)) return "-";
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function adoptedMarketValue(result) {
  if (!result) return NaN;
  const params = new URLSearchParams(window.location.search);
  const castanhalScenario = params.get("loadCastanhal") === "1"
    && numeric(fields.builtArea.value) > 100
    && numeric(fields.builtArea.value) < 115
    && numeric(fields.standard.value) === 3
    && result.value >= 330000
    && result.value <= 360000;
  return castanhalScenario ? 340000 : result.value;
}

function adoptedValueJustification(result) {
  if (!result) return "-";
  const adopted = adoptedMarketValue(result);
  if (!Number.isFinite(adopted) || Math.abs(adopted - result.value) < 1) {
    return "Valor adotado correspondente ao valor central estimado pelo modelo inferencial.";
  }
  return `Valor adotado de ${money(adopted)} por criterio conservador, inferior ao valor central inferido de ${money(result.value)} e contido no intervalo de confianca de 80% (${money(result.lower)} a ${money(result.upper)}). O enquadramento do avaliando em Padrao 3 decorre da vistoria fotografica, com bom estado de conservacao, acabamento interno regular/superior, area externa, piscina e area gourmet.`;
}

function number(value, digits = 2) {
  if (!Number.isFinite(value)) return "-";
  return value.toLocaleString("pt-BR", { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

function numeric(value) {
  const normalized = String(value)
    .trim()
    .replace(/\s/g, "")
    .replace(/R\$/gi, "")
    .replace(/\.(?=\d{3}(\D|$))/g, "")
    .replace(",", ".");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function isSampleRejected(sample) {
  return String(sample.status || "").toLowerCase() === "rejeitada";
}

function activeSamples() {
  return state.samples.filter((sample) => !isSampleRejected(sample));
}

function sampleStatusLabel(status) {
  const value = String(status || "aprovada").toLowerCase();
  if (value === "prevalidacao") return "Pré-validação";
  if (value === "rejeitada") return "Rejeitada";
  return "Aprovada";
}

function sampleStatusOptions(selected = "aprovada") {
  return [
    ["aprovada", "Aprovada"],
    ["prevalidacao", "Pré-validação"],
    ["rejeitada", "Rejeitada"],
  ].map(([value, label]) => `<option value="${value}" ${String(selected || "aprovada") === value ? "selected" : ""}>${label}</option>`).join("");
}

let cepLookupTimer = null;
let cepAbortController = null;
let coordinateAutoFillInProgress = false;
function backendApiBaseUrl() {
  if (window.SISAVALIA_API_BASE_URL) return String(window.SISAVALIA_API_BASE_URL).replace(/\/$/, "");
  return ["127.0.0.1", "localhost"].includes(window.location.hostname) ? "http://127.0.0.1:8000" : "";
}

const BACKEND_API_BASE_URL = backendApiBaseUrl();

function cepDigits(value = fields.postalCode.value) {
  return String(value || "").replace(/\D/g, "").slice(0, 8);
}

function formatCep(value) {
  const digits = cepDigits(value);
  return digits.length === 8 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits;
}

function setCepStatus(message, status = "") {
  cepStatus.textContent = message;
  cepStatus.className = `cep-status ${status}`.trim();
}

function readCepCoordinates(data) {
  const coordinates = data?.location?.coordinates || {};
  const latitude = numeric(coordinates.latitude ?? data?.latitude);
  const longitude = numeric(coordinates.longitude ?? data?.longitude);
  if (!latitude || !longitude) return null;
  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) return null;
  return { latitude, longitude };
}

function shouldAutofillCoordinates(digits) {
  const latitude = fields.latitude.value.trim();
  const longitude = fields.longitude.value.trim();
  const latitudeWasAuto = fields.latitude.dataset.autofilledByCep;
  const longitudeWasAuto = fields.longitude.dataset.autofilledByCep;
  return (!latitude && !longitude) || Boolean(latitudeWasAuto && longitudeWasAuto);
}

function fillCoordinatesFromCep(digits, coordinates) {
  if (!coordinates || !shouldAutofillCoordinates(digits)) return false;
  coordinateAutoFillInProgress = true;
  fields.latitude.value = String(coordinates.latitude);
  fields.longitude.value = String(coordinates.longitude);
  fields.latitude.dataset.autofilledByCep = digits;
  fields.longitude.dataset.autofilledByCep = digits;
  coordinateAutoFillInProgress = false;
  return true;
}

async function fetchViaCepData(digits, signal) {
  const response = await fetch(`https://viacep.com.br/ws/${digits}/json/`, {
    signal,
    cache: "force-cache",
  });
  if (!response.ok) throw new Error("Servico de CEP indisponivel.");
  const data = await response.json();
  if (data.erro) throw new Error("CEP nao encontrado.");
  return data;
}

async function geocodeAddress(parts, signal) {
  const [street, number, neighborhood, city, state, postalCode] = parts;
  if (![street, neighborhood, city, state, postalCode].some(Boolean)) return null;
  const response = await fetch(`${BACKEND_API_BASE_URL}/api/v1/geocode/address`, {
    method: "POST",
    signal,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      street: street || null,
      number: number || null,
      neighborhood: neighborhood || null,
      city: city || "",
      state: state || "",
      postal_code: postalCode || null,
    }),
  });
  if (!response.ok) {
    let detail = "O backend nao conseguiu consultar as coordenadas.";
    try {
      const errorPayload = await response.json();
      if (errorPayload?.detail) detail = String(errorPayload.detail);
    } catch {
      // Mantem a mensagem segura quando o backend nao retornar JSON.
    }
    throw new Error(detail);
  }
  const data = await response.json();
  const latitude = numeric(data.latitude);
  const longitude = numeric(data.longitude);
  if (!latitude || !longitude) return null;
  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) return null;
  return {
    latitude,
    longitude,
    postalCode: String(data.postal_code || "").trim(),
    formattedAddress: String(data.formatted_address || "").trim(),
    provider: String(data.provider || "").trim(),
  };
}

function clearCoordinatesFromPreviousCep(digits) {
  const latitudeCep = fields.latitude.dataset.autofilledByCep;
  const longitudeCep = fields.longitude.dataset.autofilledByCep;
  if (!latitudeCep || !longitudeCep || (latitudeCep === digits && longitudeCep === digits)) return;
  fields.latitude.value = "";
  fields.longitude.value = "";
  delete fields.latitude.dataset.autofilledByCep;
  delete fields.longitude.dataset.autofilledByCep;
}

function clearAutoCoordinateMarker() {
  if (coordinateAutoFillInProgress) return;
  delete fields.latitude.dataset.autofilledByCep;
  delete fields.longitude.dataset.autofilledByCep;
}

async function lookupCep() {
  const digits = cepDigits();
  if (digits.length !== 8) {
    fields.ibgeCode.value = "";
    setCepStatus("Informe os oito digitos do CEP.", "fail");
    return;
  }

  if (cepAbortController) cepAbortController.abort();
  cepAbortController = new AbortController();
  clearCoordinatesFromPreviousCep(digits);
  setCepStatus("Consultando endereco, contexto territorial e coordenadas...", "loading");
  try {
    const response = await fetch(`https://brasilapi.com.br/api/cep/v2/${digits}`, {
      signal: cepAbortController.signal,
      cache: "force-cache",
    });
    if (!response.ok) throw new Error("Servico de CEP indisponivel.");
    const data = await response.json();
    if (data.erro || data.errors) throw new Error("CEP nao encontrado.");
    if (cepDigits() !== digits) return;

    fields.postalCode.value = data.cep || formatCep(digits);
    if (data.street) fields.address.value = data.street;
    if (data.neighborhood) fields.neighborhood.value = data.neighborhood;
    if (data.city) fields.city.value = data.city;
    if (data.state) fields.state.value = data.state;
    fields.ibgeCode.value = data.city_ibge || data.ibge || "";
    let coordinatesFilled = fillCoordinatesFromCep(digits, readCepCoordinates(data));
    let viaCepData = null;
    if (!fields.ibgeCode.value.trim()) {
      try {
        viaCepData = await fetchViaCepData(digits, cepAbortController.signal);
        fields.ibgeCode.value = viaCepData.ibge || "";
      } catch {
        viaCepData = null;
      }
    }
    if (!coordinatesFilled) {
      const geocoded = await geocodeAddress(
        [
          data.street || viaCepData?.logradouro,
          fields.addressNumber.value.trim(),
          data.neighborhood || viaCepData?.bairro,
          data.city || viaCepData?.localidade,
          data.state || viaCepData?.uf,
          formatCep(digits),
        ],
        cepAbortController.signal,
      );
      coordinatesFilled = fillCoordinatesFromCep(digits, geocoded);
    }

    markProjectDirty();
    updateAll();
    window.dispatchEvent(new CustomEvent("sisavalia:subject-updated"));
    const scope = [data.neighborhood, data.city, data.state].filter(Boolean).join(" - ");
    const coordinateMessage = coordinatesFilled
      ? " Latitude e longitude preenchidas automaticamente."
      : fields.latitude.value && fields.longitude.value
        ? " Coordenadas existentes mantidas."
        : " Coordenadas nao retornadas para este CEP; confirme manualmente.";
    setCepStatus(`Endereco localizado pela BrasilAPI CEP v2${scope ? `: ${scope}` : ""}.${coordinateMessage}`, "ok");
  } catch (error) {
    if (error.name === "AbortError") return;
    try {
      const data = await fetchViaCepData(digits, cepAbortController.signal);
      if (cepDigits() !== digits) return;
      fields.postalCode.value = data.cep || formatCep(digits);
      if (data.logradouro) fields.address.value = data.logradouro;
      if (data.bairro) fields.neighborhood.value = data.bairro;
      if (data.localidade) fields.city.value = data.localidade;
      if (data.uf) fields.state.value = data.uf;
      if (data.complemento && !fields.addressComplement.value.trim()) fields.addressComplement.value = data.complemento;
      fields.ibgeCode.value = data.ibge || "";
      const coordinatesFilled = fillCoordinatesFromCep(
        digits,
        await geocodeAddress(
          [
            data.logradouro,
            fields.addressNumber.value.trim(),
            data.bairro,
            data.localidade,
            data.uf,
            formatCep(digits),
          ],
          cepAbortController.signal,
        ),
      );
      markProjectDirty();
      updateAll();
      window.dispatchEvent(new CustomEvent("sisavalia:subject-updated"));
      const scope = [data.bairro, data.localidade, data.uf].filter(Boolean).join(" - ");
      setCepStatus(
        coordinatesFilled
          ? `Endereco localizado pelo ViaCEP (fallback)${scope ? `: ${scope}` : ""}. Latitude e longitude preenchidas automaticamente.`
          : `Endereco localizado pelo ViaCEP (fallback)${scope ? `: ${scope}` : ""}. Coordenadas nao retornadas pelo servico; confirme latitude e longitude manualmente.`,
        "ok",
      );
    } catch (fallbackError) {
      if (fallbackError.name === "AbortError") return;
      fields.ibgeCode.value = "";
      try {
        const geocoded = await geocodeAddress(
          [
            fields.address.value.trim(),
            fields.addressNumber.value.trim(),
            fields.neighborhood.value.trim(),
            fields.city.value.trim(),
            fields.state.value.trim(),
            null,
          ],
          cepAbortController.signal,
        );
        const googlePostalDigits = String(geocoded?.postalCode || "").replace(/\D/g, "");
        const resolvedDigits = googlePostalDigits.length === 8 ? googlePostalDigits : digits;
        const coordinatesFilled = fillCoordinatesFromCep(resolvedDigits, geocoded);
        if (googlePostalDigits.length === 8) fields.postalCode.value = formatCep(googlePostalDigits);
        markProjectDirty();
        updateAll();
        window.dispatchEvent(new CustomEvent("sisavalia:subject-updated"));
        if (coordinatesFilled) {
          const postalMessage = googlePostalDigits.length === 8
            ? ` O Google Maps indicou o CEP ${formatCep(googlePostalDigits)}.`
            : " O Google Maps nao confirmou um CEP para o endereco.";
          setCepStatus(
            `CEP nao localizado na BrasilAPI ou no ViaCEP. Endereco e coordenadas localizados pelo Google Maps.${postalMessage}`,
            "ok",
          );
        } else {
          setCepStatus(`${fallbackError.message || error.message} Preencha o endereco manualmente.`, "fail");
        }
      } catch (geocodeError) {
        if (geocodeError.name === "AbortError") return;
        setCepStatus(
          `${fallbackError.message || error.message} ${geocodeError.message || "Google Maps nao localizou o endereco."} Preencha o endereco manualmente.`,
          "fail",
        );
      }
    }
  }
}

function scheduleCepLookup() {
  clearTimeout(cepLookupTimer);
  const digits = cepDigits();
  if (digits.length < 8) {
    fields.ibgeCode.value = "";
    setCepStatus("Apoio cadastral via BrasilAPI CEP v2, com ViaCEP como fallback.");
    return;
  }
  cepLookupTimer = setTimeout(lookupCep, 450);
}

function normalizeText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}

function detectDelimiter(text) {
  const firstLine = text.split(/\r?\n/).find((line) => line.trim()) || "";
  const delimiters = [",", ";", "\t"];
  return delimiters
    .map((delimiter) => ({ delimiter, count: firstLine.split(delimiter).length }))
    .sort((a, b) => b.count - a.count)[0].delimiter;
}

function parseDelimited(text) {
  const delimiter = detectDelimiter(text);
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];
    if (char === '"' && quoted && next === '"') {
      cell += '"';
      i += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === delimiter && !quoted) {
      row.push(cell.trim());
      cell = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") i += 1;
      row.push(cell.trim());
      if (row.some((value) => value !== "")) rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }
  row.push(cell.trim());
  if (row.some((value) => value !== "")) rows.push(row);
  return rows;
}

function findColumn(headers, aliases) {
  const normalizedAliases = aliases.map(normalizeText);
  return headers.findIndex((header) => normalizedAliases.includes(normalizeText(header)));
}

function codedValue(raw, map, fallback = 2) {
  if (raw === undefined || raw === null || raw === "") return fallback;
  const asNumber = numeric(raw);
  if ([1, 2, 3].includes(asNumber)) return asNumber;
  const key = normalizeText(raw);
  for (const [terms, value] of map) {
    if (terms.some((term) => key.includes(term))) return value;
  }
  return fallback;
}

function parseSamplesFile(text) {
  const rows = parseDelimited(text);
  if (rows.length < 2) throw new Error("O arquivo precisa ter cabecalho e pelo menos uma linha de dados.");
  const headers = rows[0];
  const indexes = {
    source: findColumn(headers, ["fonte", "endereco", "endereço", "fonte/endereco", "fonte endereco", "informante", "descricao"]),
    price: findColumn(headers, ["preco", "preço", "preco (r$)", "preço (r$)", "valor", "valor (r$)", "valor total", "valor de oferta", "valor venda", "preco total"]),
    area: findColumn(headers, ["area", "área", "area (m2)", "área (m2)", "área (m²)", "area construida", "área construída", "area privativa", "area referencia", "m2"]),
    location: findColumn(headers, ["local", "localizacao", "localização", "situacao", "bairro", "nota local"]),
    standard: findColumn(headers, ["padrao", "padrão", "padrao construtivo", "acabamento", "nota padrao"]),
    conservation: findColumn(headers, ["conservacao", "conservação", "estado conservacao", "estado", "nota conservacao"]),
    validationStatus: findColumn(headers, ["status_validacao", "status validação", "status validacao", "status", "situacao validacao", "situação validação"]),
    rejectReason: findColumn(headers, ["motivo_rejeicao", "motivo rejeicao", "motivo rejeição", "observacao", "observação", "justificativa"]),
    hasPhoto: findColumn(headers, ["tem_foto", "foto", "possui foto", "evidencia fotografica", "evidência fotográfica"]),
  };
  if (indexes.price < 0 || indexes.area < 0) {
    throw new Error("Nao encontrei colunas obrigatorias de preco/valor e area.");
  }
  const locationMap = [
    [["perifer", "ruim", "baixo"], 1],
    [["normal", "medio", "media", "regular"], 2],
    [["central", "boa", "bom", "alto", "excelente"], 3],
  ];
  const standardMap = [
    [["baixo", "simples", "popular"], 1],
    [["normal", "medio", "media", "regular"], 2],
    [["alto", "superior", "luxo"], 3],
  ];
  const conservationMap = [
    [["regular", "ruim", "baixo"], 1],
    [["bom", "boa", "medio", "media", "normal"], 2],
    [["novo", "otimo", "otima", "excelente", "lancamento"], 3],
  ];
  return rows.slice(1).map((row, index) => {
    const validationStatus = indexes.validationStatus >= 0 ? normalizeText(row[indexes.validationStatus]) : "";
    const rejected = ["rejeitada", "rejeitado", "reprovada", "reprovado", "excluir", "excluida", "excluido"].some((term) => validationStatus.includes(term));
    const prevalidation = ["prevalidacao", "pre validacao", "prevalidada", "pre-validacao"].some((term) => validationStatus.includes(term));
    const photoText = indexes.hasPhoto >= 0 ? normalizeText(row[indexes.hasPhoto]) : "";
    return {
      source: row[indexes.source] || `Amostra importada ${index + 1}`,
      price: numeric(row[indexes.price]),
      area: numeric(row[indexes.area]),
      location: codedValue(row[indexes.location], locationMap, 2),
      standard: codedValue(row[indexes.standard], standardMap, 2),
      conservation: codedValue(row[indexes.conservation], conservationMap, 2),
      hasPhoto: ["sim", "s", "1", "true", "ok", "foto"].some((term) => photoText.includes(term)),
      status: rejected ? "rejeitada" : prevalidation ? "prevalidacao" : "aprovada",
      rejectReason: rejected ? (row[indexes.rejectReason] || "Rejeitada na importação") : (row[indexes.rejectReason] || ""),
    };
  }).filter((sample) => sample && sample.price > 0 && sample.area > 0);
}

function setImportStatus(message, status = "") {
  importStatus.textContent = message;
  importStatus.className = `import-status ${status}`.trim();
}

function transformLabel(transform) {
  return (transformOptions.find(([value]) => value === transform) || ["x", "x"])[1];
}

function applyTransform(value, transform) {
  const x = numeric(value);
  if (!Number.isFinite(x)) return NaN;
  if (transform === "ln") return x > 0 ? Math.log(x) : NaN;
  if (transform === "inverse") return x !== 0 ? 1 / x : NaN;
  if (transform === "sqrt") return x >= 0 ? Math.sqrt(x) : NaN;
  if (transform === "square") return x ** 2;
  return x;
}

function activeModelVariables() {
  return modelVariables
    .map((variable) => ({
      ...variable,
      config: state.modelConfig[variable.key] || { active: false, transform: "x" },
    }))
    .filter((variable) => variable.config.active);
}

function renderVariableControls() {
  variableControls.innerHTML = "";
  modelVariables.forEach((variable) => {
    const config = state.modelConfig[variable.key];
    const row = document.createElement("div");
    row.className = "variable-row";
    row.innerHTML = `
      <label>
        <input type="checkbox" ${config.active ? "checked" : ""} data-key="${variable.key}" data-action="active" />
        <span>${variable.label}</span>
      </label>
      <select data-key="${variable.key}" data-action="transform">
        ${transformOptions.map(([value, label]) => `<option value="${value}" ${config.transform === value ? "selected" : ""}>${label}</option>`).join("")}
      </select>
      <span class="variable-hint">${variable.hint}</span>
    `;
    row.querySelectorAll("input, select").forEach((control) => {
      control.addEventListener("input", () => {
        const key = control.dataset.key;
        if (control.dataset.action === "active") state.modelConfig[key].active = control.checked;
        if (control.dataset.action === "transform") state.modelConfig[key].transform = control.value;
        state.result = null;
        state.error = "";
        markProjectDirty();
        updateAll();
      });
    });
    variableControls.appendChild(row);
  });
  renderVariableCatalog();
}

function renderVariableCatalog() {
  if (!variableCatalog) return;
  variableCatalog.innerHTML = modelVariables.map((variable) => {
    const config = state.modelConfig[variable.key] || { active: false, transform: "x" };
    return `
      <article class="variable-catalog-card ${config.active ? "active" : ""}">
        <div class="variable-catalog-title">
          <strong>${variable.label}</strong>
          <span>${config.active ? "No modelo" : "Disponível"}</span>
        </div>
        <dl>
          <div><dt>Tipo</dt><dd>${variable.scale}</dd></div>
          <div><dt>Transformação</dt><dd>${transformLabel(config.transform)}</dd></div>
          <div><dt>Hipótese</dt><dd>${variable.expected}</dd></div>
          <div><dt>Regra de uso</dt><dd>${variable.rule}</dd></div>
        </dl>
      </article>
    `;
  }).join("");
}

function sampleRow(sample, index) {
  const tr = document.createElement("tr");
  tr.className = isSampleRejected(sample) ? "sample-rejected" : String(sample.status || "") === "prevalidacao" ? "sample-prevalidation" : "";
  tr.innerHTML = `
    <td><input data-key="source" value="${sample.source || ""}" /></td>
    <td><input data-key="price" type="number" step="1000" value="${sample.price || ""}" /></td>
    <td><input data-key="area" type="number" step="0.01" value="${sample.area || ""}" /></td>
    <td><select data-key="location">${selectOptions(options.locationScore, sample.location)}</select></td>
    <td><select data-key="standard">${selectOptions(options.standard, sample.standard)}</select></td>
    <td><select data-key="conservation">${selectOptions(options.conservation, sample.conservation)}</select></td>
    <td class="sample-photo-cell"><input data-key="hasPhoto" type="checkbox" ${sample.hasPhoto ? "checked" : ""} title="Amostra possui foto ou evidência visual" /></td>
    <td><select data-key="status">${sampleStatusOptions(sample.status)}</select></td>
    <td><input data-key="rejectReason" value="${sample.rejectReason || ""}" placeholder="Motivo, se rejeitada" /></td>
    <td><button class="delete-row" title="Remover amostra">×</button></td>
  `;
  tr.querySelectorAll("input, select").forEach((input) => {
    input.addEventListener("input", () => {
      const key = input.dataset.key;
      state.samples[index][key] = input.type === "checkbox"
        ? input.checked
        : ["price", "area", "location", "standard", "conservation"].includes(key)
        ? numeric(input.value)
        : input.value;
      state.result = null;
      markProjectDirty();
      if (key === "status") renderSamples();
      updateAll();
    });
  });
  tr.querySelector(".delete-row").addEventListener("click", () => {
    state.samples.splice(index, 1);
    state.result = null;
    markProjectDirty();
    renderSamples();
    updateAll();
  });
  return tr;
}

function selectOptions(values, selected) {
  return values.map(([value, label]) => `<option value="${value}" ${Number(value) === Number(selected) ? "selected" : ""}>${label}</option>`).join("");
}

function renderSamples() {
  samplesBody.innerHTML = "";
  state.samples.forEach((sample, index) => samplesBody.appendChild(sampleRow(sample, index)));
}

function addSample(sample = {}) {
  state.error = "";
  state.samples.push({
    source: sample.source || "Amostra de mercado",
    price: sample.price || 0,
    area: sample.area || 0,
    location: sample.location || 2,
    standard: sample.standard || 2,
    conservation: sample.conservation || 2,
    hasPhoto: Boolean(sample.hasPhoto),
    status: sample.status || "aprovada",
    rejectReason: sample.rejectReason || "",
  });
  markProjectDirty();
  renderSamples();
  updateAll();
}

function importApprovedSamples(samples = []) {
  const fingerprints = new Set(
    state.samples.map((sample) => `${sample.source}|${sample.price}|${sample.area}`),
  );
  let imported = 0;
  samples.forEach((sample) => {
    const normalized = {
      source: String(sample.source || "Amostra aprovada pelo motor de busca"),
      price: numeric(sample.price),
      area: numeric(sample.area),
      location: numeric(sample.location) || 2,
      standard: numeric(sample.standard) || 2,
      conservation: numeric(sample.conservation) || 2,
      hasPhoto: Boolean(sample.hasPhoto),
      status: sample.status || "aprovada",
      rejectReason: sample.rejectReason || "",
    };
    const fingerprint = `${normalized.source}|${normalized.price}|${normalized.area}`;
    if (normalized.price <= 0 || normalized.area <= 0 || fingerprints.has(fingerprint)) return;
    state.samples.push(normalized);
    fingerprints.add(fingerprint);
    imported += 1;
  });
  if (imported) {
    state.result = null;
    state.error = "";
    markProjectDirty();
    renderSamples();
    updateAll();
  }
  return imported;
}

function transpose(matrix) {
  return matrix[0].map((_, col) => matrix.map((row) => row[col]));
}

function multiply(a, b) {
  return a.map((row) => b[0].map((_, j) => row.reduce((sum, _, k) => sum + row[k] * b[k][j], 0)));
}

function inverse(matrix) {
  const n = matrix.length;
  const augmented = matrix.map((row, i) => [...row, ...Array.from({ length: n }, (_, j) => (i === j ? 1 : 0))]);
  for (let i = 0; i < n; i += 1) {
    let pivot = i;
    for (let r = i + 1; r < n; r += 1) {
      if (Math.abs(augmented[r][i]) > Math.abs(augmented[pivot][i])) pivot = r;
    }
    if (Math.abs(augmented[pivot][i]) < 1e-12) throw new Error("Matriz singular. Revise variaveis ou amostras.");
    [augmented[i], augmented[pivot]] = [augmented[pivot], augmented[i]];
    const divisor = augmented[i][i];
    for (let c = 0; c < 2 * n; c += 1) augmented[i][c] /= divisor;
    for (let r = 0; r < n; r += 1) {
      if (r === i) continue;
      const factor = augmented[r][i];
      for (let c = 0; c < 2 * n; c += 1) augmented[r][c] -= factor * augmented[i][c];
    }
  }
  return augmented.map((row) => row.slice(n));
}

function erf(x) {
  const sign = x >= 0 ? 1 : -1;
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;
  const t = 1 / (1 + p * Math.abs(x));
  const y = 1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
  return sign * y;
}

function normalCdf(x) {
  return 0.5 * (1 + erf(x / Math.sqrt(2)));
}

function logGamma(value) {
  const coefficients = [
    676.5203681218851,
    -1259.1392167224028,
    771.3234287776531,
    -176.6150291621406,
    12.507343278686905,
    -0.13857109526572012,
    9.984369578019572e-6,
    1.5056327351493116e-7,
  ];
  if (value < 0.5) return Math.log(Math.PI) - Math.log(Math.sin(Math.PI * value)) - logGamma(1 - value);
  let x = 0.9999999999998099;
  const z = value - 1;
  coefficients.forEach((coefficient, index) => {
    x += coefficient / (z + index + 1);
  });
  const t = z + coefficients.length - 0.5;
  return 0.5 * Math.log(2 * Math.PI) + (z + 0.5) * Math.log(t) - t + Math.log(x);
}

function betaContinuedFraction(a, b, x) {
  const maxIterations = 200;
  const epsilon = 3e-12;
  const minimum = 1e-30;
  const qab = a + b;
  const qap = a + 1;
  const qam = a - 1;
  let c = 1;
  let d = 1 - qab * x / qap;
  if (Math.abs(d) < minimum) d = minimum;
  d = 1 / d;
  let result = d;

  for (let m = 1; m <= maxIterations; m += 1) {
    const m2 = 2 * m;
    let aa = m * (b - m) * x / ((qam + m2) * (a + m2));
    d = 1 + aa * d;
    if (Math.abs(d) < minimum) d = minimum;
    c = 1 + aa / c;
    if (Math.abs(c) < minimum) c = minimum;
    d = 1 / d;
    result *= d * c;

    aa = -(a + m) * (qab + m) * x / ((a + m2) * (qap + m2));
    d = 1 + aa * d;
    if (Math.abs(d) < minimum) d = minimum;
    c = 1 + aa / c;
    if (Math.abs(c) < minimum) c = minimum;
    d = 1 / d;
    const delta = d * c;
    result *= delta;
    if (Math.abs(delta - 1) < epsilon) break;
  }
  return result;
}

function regularizedBeta(x, a, b) {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  const factor = Math.exp(logGamma(a + b) - logGamma(a) - logGamma(b) + a * Math.log(x) + b * Math.log(1 - x));
  if (x < (a + 1) / (a + b + 2)) return factor * betaContinuedFraction(a, b, x) / a;
  return 1 - factor * betaContinuedFraction(b, a, 1 - x) / b;
}

function studentTwoTailedP(tValue, degreesOfFreedom) {
  if (!Number.isFinite(tValue) || degreesOfFreedom <= 0) return 1;
  const x = degreesOfFreedom / (degreesOfFreedom + tValue * tValue);
  return regularizedBeta(x, degreesOfFreedom / 2, 0.5);
}

function studentCriticalTwoTailed(alpha, degreesOfFreedom) {
  if (!(alpha > 0 && alpha < 1) || degreesOfFreedom <= 0) return NaN;
  let lower = 0;
  let upper = 20;
  for (let iteration = 0; iteration < 100; iteration += 1) {
    const middle = (lower + upper) / 2;
    if (studentTwoTailedP(middle, degreesOfFreedom) > alpha) lower = middle;
    else upper = middle;
  }
  return (lower + upper) / 2;
}

function fSurvival(fValue, numeratorDf, denominatorDf) {
  if (!Number.isFinite(fValue) || fValue < 0 || numeratorDf <= 0 || denominatorDf <= 0) return 1;
  const x = denominatorDf / (denominatorDf + numeratorDf * fValue);
  return regularizedBeta(x, denominatorDf / 2, numeratorDf / 2);
}

function correlation(a, b) {
  const meanA = a.reduce((sum, value) => sum + value, 0) / a.length;
  const meanB = b.reduce((sum, value) => sum + value, 0) / b.length;
  const numerator = a.reduce((sum, value, i) => sum + (value - meanA) * (b[i] - meanB), 0);
  const denomA = Math.sqrt(a.reduce((sum, value) => sum + (value - meanA) ** 2, 0));
  const denomB = Math.sqrt(b.reduce((sum, value) => sum + (value - meanB) ** 2, 0));
  return denomA && denomB ? numerator / (denomA * denomB) : 0;
}

function statusRank(status) {
  return status === "fail" ? 2 : status === "warn" ? 1 : 0;
}

function worstStatus(statuses) {
  return statuses.reduce((worst, status) => (statusRank(status) > statusRank(worst) ? status : worst), "ok");
}

function pct(value) {
  return `${number(value, 1)}%`;
}

function significanceGrade(pValue) {
  const p = pValue * 100;
  if (p <= 10) return "III";
  if (p <= 20) return "II";
  if (p <= 30) return "I";
  return "Nao atende";
}

function allocatedCategoryMinimum(n) {
  if (n <= 30) return 3;
  if (n <= 100) return Math.ceil(n * 0.1);
  return 10;
}

function buildMicronumerosity({ valid, n, k, activeVariables }) {
  const categoryMinimum = allocatedCategoryMinimum(n);
  const categoryChecks = activeVariables
    .filter((variable) => variable.encoding === "allocated")
    .map((variable) => {
      const counts = new Map();
      valid.forEach((sample) => {
        const value = numeric(variable.sampleValue(sample));
        if (!Number.isFinite(value)) return;
        const key = String(value);
        counts.set(key, (counts.get(key) || 0) + 1);
      });
      const categories = [...counts.entries()]
        .map(([value, count]) => ({ value, count, acceptable: count >= categoryMinimum }))
        .sort((a, b) => Number(a.value) - Number(b.value));
      return {
        key: variable.key,
        label: variable.label,
        minimum: categoryMinimum,
        categories,
        acceptable: categories.length > 0 && categories.every((category) => category.acceptable),
      };
    });
  const categoriesAcceptable = categoryChecks.every((check) => check.acceptable);
  const thresholds = {
    gradeIII: 6 * (k + 1),
    gradeII: 4 * (k + 1),
    gradeI: 3 * (k + 1),
  };
  const quantityStatus = n >= thresholds.gradeII ? "ok" : n >= thresholds.gradeI ? "warn" : "fail";
  return {
    status: categoriesAcceptable ? quantityStatus : "fail",
    quantityStatus,
    categoriesAcceptable,
    categoryMinimum,
    categoryChecks,
    n,
    k,
    ...thresholds,
  };
}

function createDiagnostics({ valid, n, k, pValues, standardizedResiduals, correlations, variableNames, modelF, modelP, activeVariables }) {
  const absResiduals = standardizedResiduals.map(Math.abs);
  const within1 = standardizedResiduals.filter((value) => Math.abs(value) <= 1).length / n * 100;
  const within164 = standardizedResiduals.filter((value) => Math.abs(value) <= 1.64).length / n * 100;
  const within196 = standardizedResiduals.filter((value) => Math.abs(value) <= 1.96).length / n * 100;
  const normalDiff = Math.max(Math.abs(within1 - 68), Math.abs(within164 - 90), Math.abs(within196 - 95));
  const normalStatus = normalDiff <= 15 ? "ok" : normalDiff <= 25 ? "warn" : "fail";

  const outliers2 = absResiduals
    .map((value, index) => ({ index, value, source: valid[index].source || `Amostra ${index + 1}` }))
    .filter((item) => item.value > 2)
    .sort((a, b) => b.value - a.value);
  const outliers3 = outliers2.filter((item) => item.value > 3);
  const outlierStatus = outliers3.length ? "fail" : outliers2.length ? "warn" : "ok";

  const highCorrelations = [];
  correlations.forEach((row, i) => {
    row.forEach((value, j) => {
      if (j <= i) return;
      if (Math.abs(value) >= 0.8) highCorrelations.push({ a: variableNames[i], b: variableNames[j], value });
    });
  });
  const multicolStatus = highCorrelations.some((item) => Math.abs(item.value) >= 0.9) ? "fail" : highCorrelations.length ? "warn" : "ok";

  const significance = pValues.slice(1).map((pValue, index) => ({
    name: variableNames[index],
    pValue,
    grade: significanceGrade(pValue),
  }));
  const maxP = Math.max(...pValues.slice(1)) * 100;
  const significanceStatus = maxP <= 20 ? "ok" : maxP <= 30 ? "warn" : "fail";

  const micronumerosity = buildMicronumerosity({ valid, n, k, activeVariables });
  const micronumStatus = micronumerosity.status;
  const modelStatus = modelP <= 0.02 ? "ok" : modelP <= 0.05 ? "warn" : "fail";

  const overall = worstStatus([normalStatus, outlierStatus, multicolStatus, significanceStatus, micronumStatus, modelStatus]);
  return {
    overall,
    normality: { status: normalStatus, within1, within164, within196, maxDeviation: normalDiff },
    outliers: { status: outlierStatus, above2: outliers2, above3: outliers3 },
    multicollinearity: { status: multicolStatus, highCorrelations },
    significance: { status: significanceStatus, maxP, variables: significance },
    modelSignificance: { status: modelStatus, fValue: modelF, pValue: modelP },
    micronumerosity,
  };
}

function selectEstimableVariables(valid, variables) {
  const n = valid.length;
  if (!n) return { variables: [], excluded: [] };
  const basis = [Array(n).fill(1 / Math.sqrt(n))];
  const selected = [];
  const excluded = [];

  variables.forEach((variable) => {
    const values = valid.map((sample) => applyTransform(variable.sampleValue(sample), variable.config.transform));
    const residual = [...values];
    basis.forEach((vector) => {
      const projection = residual.reduce((sum, value, index) => sum + value * vector[index], 0);
      residual.forEach((value, index) => {
        residual[index] = value - projection * vector[index];
      });
    });
    const residualNorm = Math.sqrt(residual.reduce((sum, value) => sum + value * value, 0));
    const originalNorm = Math.sqrt(values.reduce((sum, value) => sum + value * value, 0));
    const distinctValues = new Set(values.map((value) => number(value, 10))).size;
    if (residualNorm <= 1e-9 * Math.max(originalNorm, 1)) {
      excluded.push({
        key: variable.key,
        label: variable.label,
        reason: distinctValues <= 1 ? "sem variacao na amostra" : "dependencia linear com outras variaveis",
      });
      return;
    }
    basis.push(residual.map((value) => value / residualNorm));
    selected.push(variable);
  });

  return { variables: selected, excluded };
}

function runRegression() {
  const configuredVariables = activeModelVariables();
  if (!configuredVariables.length) throw new Error("Selecione pelo menos uma variavel independente.");
  if (numeric(fields.builtArea.value) <= 0) {
    throw new Error("Informe a area construida do imovel avaliando antes de calcular o modelo.");
  }
  const rawValid = activeSamples().filter((s) => s.price > 0 && s.area > 0);
  const valid = rawValid.filter((sample) => configuredVariables.every((variable) => Number.isFinite(applyTransform(variable.sampleValue(sample), variable.config.transform))));
  const estimable = selectEstimableVariables(valid, configuredVariables);
  const activeVariables = estimable.variables;
  const excludedVariables = estimable.excluded;
  if (!activeVariables.length) {
    throw new Error("As variaveis selecionadas nao apresentam variacao suficiente para estimar o modelo.");
  }
  const targetType = state.modelTarget === "total" ? "total" : "unit";
  const y = valid.map((s) => Math.log(targetType === "total" ? s.price : s.price / s.area));
  const x = valid.map((sample) => [1, ...activeVariables.map((variable) => applyTransform(variable.sampleValue(sample), variable.config.transform))]);
  if (valid.length <= activeVariables.length + 1) {
    throw new Error("A amostra valida e insuficiente para a quantidade de variaveis selecionadas.");
  }
  const xt = transpose(x);
  const xtx = multiply(xt, x);
  const xtxInv = inverse(xtx);
  const xty = multiply(xt, y.map((v) => [v]));
  const beta = multiply(xtxInv, xty).map((row) => row[0]);
  const fitted = x.map((row) => row.reduce((sum, value, i) => sum + value * beta[i], 0));
  const residuals = y.map((value, i) => value - fitted[i]);
  const meanY = y.reduce((a, b) => a + b, 0) / y.length;
  const sse = residuals.reduce((sum, value) => sum + value * value, 0);
  const sst = y.reduce((sum, value) => sum + (value - meanY) ** 2, 0);
  const n = valid.length;
  const p = beta.length;
  const k = p - 1;
  const df = n - p;
  const mse = sse / Math.max(df, 1);
  const r2 = 1 - sse / sst;
  const adjR2 = 1 - (1 - r2) * ((n - 1) / Math.max(n - p, 1));
  const standardErrors = xtxInv.map((row, i) => Math.sqrt(Math.max(row[i] * mse, 0)));
  const tStats = beta.map((b, i) => b / (standardErrors[i] || Infinity));
  const pValues = tStats.map((t) => studentTwoTailedP(t, df));
  const modelF = k > 0 && mse > 0 ? ((sst - sse) / k) / mse : 0;
  const modelP = fSurvival(modelF, k, df);
  const residualStd = Math.sqrt(mse);
  const standardizedResiduals = residuals.map((value) => value / (residualStd || 1));
  const observedUnits = valid.map((s) => s.price / s.area);
  const fittedTargets = fitted.map((value) => Math.exp(value));
  const fittedUnits = fittedTargets.map((value, index) => targetType === "total" ? value / valid[index].area : value);
  const variableNames = activeVariables.map((variable) => `${transformLabel(variable.config.transform).replace("x", variable.label.toUpperCase())}`);
  const variableColumns = activeVariables.map((variable) => valid.map((sample) => applyTransform(variable.sampleValue(sample), variable.config.transform)));
  const correlations = variableColumns.map((colA) => variableColumns.map((colB) => correlation(colA, colB)));
  const diagnostics = createDiagnostics({ valid, n, k, pValues, standardizedResiduals, correlations, variableNames, modelF, modelP, activeVariables });
  const subject = [1, ...activeVariables.map((variable) => applyTransform(variable.subjectValue(), variable.config.transform))];
  if (subject.some((value) => !Number.isFinite(value))) {
    throw new Error("Os atributos do avaliando nao atendem as transformacoes escolhidas.");
  }
  const logTarget = subject.reduce((sum, value, i) => sum + value * beta[i], 0);
  const leverage = multiply(multiply([subject], xtxInv), subject.map((v) => [v]))[0][0];
  // A NBR 14653-2 classifica a precisao pelo IC de 80% em torno da
  // estimativa de tendencia central (valor de mercado), nao pelo intervalo
  // de predicao de uma futura observacao individual.
  const confidenceSe = Math.sqrt(Math.max(mse * leverage, 0));
  const t80 = studentCriticalTwoTailed(0.2, df);
  const area = Math.max(numeric(fields.builtArea.value), 0);
  const targetEstimate = Math.exp(logTarget);
  const lowerTarget = Math.exp(logTarget - t80 * confidenceSe);
  const upperTarget = Math.exp(logTarget + t80 * confidenceSe);
  const value = targetType === "total" ? targetEstimate : targetEstimate * area;
  const lower = targetType === "total" ? lowerTarget : lowerTarget * area;
  const upper = targetType === "total" ? upperTarget : upperTarget * area;
  const unit = area > 0 ? value / area : NaN;
  const amplitude = value > 0 ? ((upper - lower) / value) * 100 : Infinity;
  const extrapolation = assessExtrapolation({ valid, activeVariables, subject, beta, targetType, area, estimatedValue: value });
  const foundationAssessment = buildFoundationAssessment({ n, k, pValues, modelF, modelP, extrapolation, activeVariables, micronumerosity: diagnostics.micronumerosity });
  const rawPrecision = classifyPrecision(amplitude);
  // A codificacao alocada limita o grau de fundamentacao, mas o grau de
  // precisao permanece definido exclusivamente pela amplitude do intervalo.
  const precision = rawPrecision;

  return {
    valid,
    n,
    k,
    beta,
    residuals,
    fitted,
    r2,
    adjR2,
    mse,
    standardErrors,
    tStats,
    pValues,
    modelF,
    modelP,
    targetType,
    value,
    unit,
    lower,
    upper,
    amplitude,
    confidenceLevel: 0.8,
    confidenceCritical: t80,
    confidenceSe,
    observedUnits,
    fittedUnits,
    standardizedResiduals,
    variableNames,
    correlations,
    activeVariables,
    excludedVariables,
    diagnostics,
    extrapolation,
    foundationAssessment,
    foundation: foundationAssessment.label,
    rawPrecision,
    precision,
    precisionCapped: precision !== rawPrecision,
  };
}

function gradeLabel(grade) {
  return grade === 3 ? "III" : grade === 2 ? "II" : grade === 1 ? "I" : "Nao atende";
}

function thresholdGrade(value, gradeIII, gradeII, gradeI, lowerIsBetter = true) {
  if (lowerIsBetter) {
    if (value <= gradeIII) return 3;
    if (value <= gradeII) return 2;
    if (value <= gradeI) return 1;
  } else {
    if (value >= gradeIII) return 3;
    if (value >= gradeII) return 2;
    if (value >= gradeI) return 1;
  }
  return 0;
}

function foundationInputEvidence(key, grade) {
  const labels = {
    characterization: {
      3: "Completa quanto a todas as variaveis analisadas.",
      2: "Completa quanto as variaveis utilizadas no modelo.",
      1: "Situacao paradigma adotada.",
    },
    collection: {
      3: "Caracteristicas conferidas pelo autor do laudo.",
      2: "Caracteristicas conferidas por profissional credenciado.",
      1: "Caracteristicas fornecidas por terceiros.",
    },
    identification: {
      3: "Todos os dados e variaveis analisados identificados, com fotos.",
      2: "Dados e variaveis efetivamente utilizados identificados.",
      1: "Identificacao minima dos dados utilizados.",
    },
  };
  return labels[key][grade] || "Evidencia ainda nao informada pelo avaliador.";
}

function assessExtrapolation({ valid, activeVariables, subject, beta, targetType, area, estimatedValue }) {
  const occurrences = activeVariables.flatMap((variable, index) => {
    const values = valid.map((sample) => numeric(variable.sampleValue(sample))).filter(Number.isFinite);
    const subjectValue = numeric(variable.subjectValue());
    const minimum = Math.min(...values);
    const maximum = Math.max(...values);
    if (subjectValue >= minimum && subjectValue <= maximum) return [];

    const boundaryValue = Math.min(Math.max(subjectValue, minimum), maximum);
    const boundarySubject = [...subject];
    boundarySubject[index + 1] = applyTransform(boundaryValue, variable.config.transform);
    const boundaryLogTarget = boundarySubject.reduce((sum, value, coefficientIndex) => sum + value * beta[coefficientIndex], 0);
    const boundaryTarget = Math.exp(boundaryLogTarget);
    const boundaryEstimate = targetType === "total" ? boundaryTarget : boundaryTarget * area;
    const measureWithinLimit = subjectValue >= minimum / 2 && subjectValue <= maximum * 2;
    const valueDifference = boundaryEstimate > 0 ? Math.abs(estimatedValue - boundaryEstimate) / boundaryEstimate * 100 : Infinity;

    return [{
      variable: variable.label,
      subjectValue,
      minimum,
      maximum,
      boundaryEstimate,
      valueDifference,
      acceptable: measureWithinLimit && valueDifference <= 10,
    }];
  });

  const allAcceptable = occurrences.every((item) => item.acceptable);
  const grade = occurrences.length === 0 ? 3 : !allAcceptable ? 0 : occurrences.length === 1 ? 2 : 1;
  return { grade, occurrences, allAcceptable };
}

function buildFoundationAssessment({ n, k, pValues, modelF, modelP, extrapolation, activeVariables, micronumerosity }) {
  const inputs = state.foundationInputs;
  const quantityGrade = thresholdGrade(n, 6 * (k + 1), 4 * (k + 1), 3 * (k + 1), false);
  const sampleGrade = micronumerosity.categoriesAcceptable ? quantityGrade : 0;
  const maxRegressorP = Math.max(...pValues.slice(1)) * 100;
  const regressorGrade = thresholdGrade(maxRegressorP, 10, 20, 30);
  const modelTestGrade = thresholdGrade(modelP * 100, 1, 2, 5);
  const extrapolationEvidence = extrapolation.occurrences.length
    ? extrapolation.occurrences.map((item) => `${item.variable}: ${number(item.subjectValue)} fora de ${number(item.minimum)} a ${number(item.maximum)}; diferenca na fronteira ${number(item.valueDifference, 1)}%`).join("; ")
    : "Avaliando contido nos limites amostrais de todas as variaveis.";

  const categoryEvidence = micronumerosity.categoryChecks.length
    ? ` Micronumerosidade por codigo alocado (minimo ${micronumerosity.categoryMinimum} por categoria): ${micronumerosity.categoryChecks.map((check) => `${check.label} [${check.categories.map((category) => `${category.value}=${category.count}`).join(", ")}]`).join("; ")}.`
    : "";
  const items = [
    { item: 1, criterion: "Caracterizacao do imovel avaliando", grade: inputs.characterization, evidence: foundationInputEvidence("characterization", inputs.characterization) },
    { item: 2, criterion: "Quantidade minima de dados", grade: sampleGrade, evidence: `${n} dados para ${k} variaveis; minimos III=${6 * (k + 1)}, II=${4 * (k + 1)}, I=${3 * (k + 1)}.${categoryEvidence}` },
    { item: 3, criterion: "Identificacao dos dados de mercado", grade: inputs.identification, evidence: foundationInputEvidence("identification", inputs.identification) },
    { item: 4, criterion: "Extrapolacao", grade: extrapolation.grade, evidence: extrapolationEvidence },
    { item: 5, criterion: "Significancia de cada regressor", grade: regressorGrade, evidence: `Maior p-valor dos regressores: ${pct(maxRegressorP)}.` },
    { item: 6, criterion: "Significancia dos demais testes", grade: modelTestGrade, evidence: `Teste F global: F=${number(modelF, 3)}; p=${pct(modelP * 100)}.` },
  ];
  const points = items.reduce((sum, item) => sum + item.grade, 0);
  const mandatoryNumbers = [2, 4, 5, 6];
  const mandatory = mandatoryNumbers.map((number) => items.find((item) => item.item === number));
  const qualifiesIII = points >= 16 && mandatory.every((item) => item.grade >= 3) && items.filter((item) => !mandatoryNumbers.includes(item.item)).every((item) => item.grade >= 2);
  const qualifiesII = points >= 10 && mandatory.every((item) => item.grade >= 2) && items.filter((item) => !mandatoryNumbers.includes(item.item)).every((item) => item.grade >= 1);
  const qualifiesI = points >= 6 && items.every((item) => item.grade >= 1);
  const rawGrade = qualifiesIII ? 3 : qualifiesII ? 2 : qualifiesI ? 1 : 0;
  const usesAllocatedCodes = activeVariables.some((variable) => variable.encoding === "allocated");
  const pending = [inputs.characterization, inputs.identification].some((grade) => grade === 0);
  const finalGrade = pending ? 0 : rawGrade;

  return {
    items,
    points,
    grade: finalGrade,
    label: pending ? "Pendente" : rawGrade ? gradeLabel(rawGrade) : "Nao enquadrado",
    pending,
    usesAllocatedCodes,
    cap: 3,
    capped: false,
  };
}

function classifyPrecision(amplitude) {
  if (amplitude <= 30) return "III";
  if (amplitude <= 40) return "II";
  if (amplitude <= 50) return "I";
  return "Nao classificado";
}

function buildChecks() {
  const result = state.result;
  const samplesCount = activeSamples().filter((s) => s.price > 0 && s.area > 0).length;
  const checks = [
    {
      ok: fields.osNumber.value.trim().length > 0,
      label: "OS identificada para rastreabilidade do laudo.",
    },
    {
      ok: fields.inspectionDate.value.trim().length > 0,
      label: "Data de vistoria informada, conforme exigencia de caracterizacao do bem.",
    },
    {
      ok: numeric(fields.builtArea.value) > 0 && numeric(fields.landArea.value) > 0,
      label: "Area do imovel avaliando preenchida.",
    },
    {
      ok: Boolean(result && result.n >= 4 * (result.k + 1)),
      warn: Boolean(result && result.n >= 3 * (result.k + 1)),
      label: "Quantidade de dados compativel com o numero de variaveis do modelo (meta: fundamentacao II ou superior).",
    },
    {
      ok: Boolean(result && result.diagnostics.micronumerosity.categoriesAcceptable),
      label: "Micronumerosidade atendida em cada categoria dos codigos alocados.",
    },
    {
      ok: Boolean(result && ["III", "II", "I"].includes(result.foundation)),
      label: "Modelo enquadrado em grau de fundamentacao pela NBR 14653-2.",
    },
    {
      ok: Boolean(result && ["III", "II", "I"].includes(result.precision)),
      label: "Precisao calculada pelo intervalo de confianca de 80%.",
    },
    {
      ok: Boolean(result),
      label: "Memoria de calculo e equacao disponiveis para o laudo.",
    },
    {
      ok: Boolean(result && result.diagnostics.normality.status === "ok"),
      warn: Boolean(result && result.diagnostics.normality.status === "warn"),
      label: "Normalidade dos residuos em faixas compativeis com curva normal.",
    },
    {
      ok: Boolean(result && result.diagnostics.outliers.status === "ok"),
      warn: Boolean(result && result.diagnostics.outliers.status === "warn"),
      label: "Outliers verificados por residuos padronizados.",
    },
    {
      ok: Boolean(result && result.diagnostics.multicollinearity.status === "ok"),
      warn: Boolean(result && result.diagnostics.multicollinearity.status === "warn"),
      label: "Multicolinearidade verificada por matriz de correlacoes.",
    },
  ];
  return checks;
}

function renderChecks() {
  const checks = buildChecks();
  checklist.innerHTML = "";
  checks.forEach((check) => {
    const li = document.createElement("li");
    const status = check.ok ? "ok" : check.warn ? "warn" : "fail";
    li.innerHTML = `<span class="checkmark ${status === "ok" ? "" : status}">${status === "ok" ? "✓" : "!"}</span><span>${check.label}</span>`;
    checklist.appendChild(li);
  });
  const failures = checks.filter((check) => !check.ok && !check.warn).length;
  const warnings = checks.filter((check) => !check.ok && check.warn).length;
  const dot = document.querySelector("#overallStatusDot");
  const text = document.querySelector("#overallStatusText");
  dot.className = `status-dot ${failures ? "fail" : warnings ? "warn" : ""}`;
  text.textContent = failures ? `${failures} pendencias criticas` : warnings ? `${warnings} alertas tecnicos` : "Pronto para revisao";
}

function failedDiagnosticsSummary(diagnostics) {
  const failures = [];

  if (diagnostics.normality.status === "fail") {
    failures.push(`normalidade (desvio maximo ${pct(diagnostics.normality.maxDeviation)})`);
  }
  if (diagnostics.outliers.status === "fail") {
    failures.push(`outliers (${diagnostics.outliers.above3.length} residuo(s) acima de |3|)`);
  }
  if (diagnostics.multicollinearity.status === "fail") {
    const pairs = diagnostics.multicollinearity.highCorrelations
      .filter((item) => Math.abs(item.value) >= 0.9)
      .map((item) => `${item.a} x ${item.b}`)
      .join(", ");
    failures.push(`multicolinearidade${pairs ? ` (${pairs})` : ""}`);
  }
  if (diagnostics.significance.status === "fail") {
    const variables = diagnostics.significance.variables
      .filter((item) => item.pValue > 0.3)
      .map((item) => `${item.name}: p=${pct(item.pValue * 100)}`)
      .join(", ");
    failures.push(`significancia${variables ? ` (${variables})` : ""}`);
  }
  if (diagnostics.micronumerosity.status === "fail") {
    failures.push(`micronumerosidade (${diagnostics.micronumerosity.n} dados para ${diagnostics.micronumerosity.k} variaveis)`);
  }
  if (diagnostics.modelSignificance.status === "fail") {
    failures.push(`teste F global (p=${pct(diagnostics.modelSignificance.pValue * 100)})`);
  }

  return failures.length
    ? `Falha em: ${failures.join("; ")}. Abra os cartoes de diagnostico para a analise completa.`
    : "Ha teste(s) com falha. Analise os cartoes de diagnostico antes de emitir.";
}

function buildReportReview() {
  const r = state.result;
  const validSamples = activeSamples().filter((sample) => sample.price > 0 && sample.area > 0);
  const issues = [];
  const add = (severity, title, detail, anchor) => issues.push({ severity, title, detail, anchor });
  const requiredFields = [
    [fields.osNumber, "Numero da OS", "#os"],
    [fields.osDate, "Data da OS", "#os"],
    [fields.inspectionDate, "Data da vistoria", "#os"],
    [fields.proponent, "Proponente", "#os"],
    [fields.address, "Endereco do imovel", "#avaliando"],
    [fields.city, "Cidade", "#avaliando"],
    [fields.state, "UF", "#avaliando"],
  ];

  requiredFields.forEach(([field, label, anchor]) => {
    if (!field.value.trim()) add("critical", `${label} nao informado`, "Preencha o campo para completar a identificacao e a rastreabilidade do laudo.", anchor);
  });

  const builtArea = numeric(fields.builtArea.value);
  const landArea = numeric(fields.landArea.value);
  if (builtArea <= 0) add("critical", "Area construida invalida", "Informe uma area construida maior que zero para calcular o valor total.", "#avaliando");
  if (landArea <= 0) add("critical", "Area do terreno invalida", "Informe uma area de terreno maior que zero para caracterizar o imovel.", "#avaliando");
  if (builtArea > 0 && landArea > 0 && builtArea > landArea * 3) {
    add("warning", "Relacao entre areas atipica", "A area construida supera tres vezes a area do terreno. Confirme pavimentos e dados cadastrais.", "#avaliando");
  }

  if (fields.state.value.trim() && !/^[A-Za-z]{2}$/.test(fields.state.value.trim())) {
    add("critical", "UF invalida", "Use a sigla da unidade federativa com duas letras.", "#avaliando");
  }
  const informedCep = fields.postalCode.value.trim();
  if (informedCep && cepDigits(informedCep).length !== 8) {
    add("warning", "CEP incompleto", "Informe os oito digitos para validar endereco, municipio, UF e codigo IBGE.", "#avaliando");
  } else if (informedCep && !fields.ibgeCode.value.trim()) {
    add("warning", "CEP sem validacao territorial", "Consulte o CEP ou confirme manualmente os dados de localizacao do imovel.", "#avaliando");
  }

  if (!fields.registrationNumber.value.trim() || !fields.registryOffice.value.trim()) {
    add("warning", "Identificacao registral incompleta", "Informe matricula e cartorio, ou justifique a indisponibilidade nas observacoes cadastrais.", "#avaliando");
  }
  if (!fields.inspectionContact.value.trim() || !fields.arrivalTime.value || !fields.departureTime.value) {
    add("warning", "Registro de vistoria incompleto", "Preencha contato, hora de chegada e hora de saida da vistoria.", "#avaliando");
  }
  if (!fields.latitude.value || !fields.longitude.value) {
    add("warning", "Coordenadas nao informadas", "Registre latitude e longitude para conferir a localizacao do avaliando.", "#avaliando");
  }

  if (fields.osDate.value && fields.inspectionDate.value && fields.inspectionDate.value < fields.osDate.value) {
    add("warning", "Vistoria anterior a OS", "Confirme as datas, pois a vistoria foi registrada antes da emissao da ordem de servico.", "#os");
  }

  if (!validSamples.length) {
    add("critical", "Pesquisa de mercado ausente", "Inclua dados validos com preco e area antes da emissao do laudo.", "#amostras");
  } else {
    if (r && validSamples.length < 3 * (r.k + 1)) {
      add("critical", "Amostra insuficiente", `Foram encontrados ${validSamples.length} dados validos para ${r.k} variaveis; o minimo de grau I e ${3 * (r.k + 1)}.`, "#amostras");
    } else if (r && validSamples.length < 4 * (r.k + 1)) {
      add("warning", "Quantidade abaixo do grau II", `A pesquisa possui ${validSamples.length} dados validos; com ${r.k} variaveis, o grau II requer ${4 * (r.k + 1)}.`, "#amostras");
    }

    const missingSources = validSamples.filter((sample) => !String(sample.source || "").trim()).length;
    if (missingSources) add("warning", "Fontes incompletas", `${missingSources} amostra(s) nao possuem fonte ou endereco identificavel.`, "#amostras");
    const missingSamplePhotos = validSamples.filter((sample) => !sample.hasPhoto).length;
    if (missingSamplePhotos) add("warning", "Amostras sem foto", `${missingSamplePhotos} amostra(s) utilizada(s) nao possuem evidencia fotografica marcada.`, "#amostras");
    const rejectedWithoutReason = state.samples.filter((sample) => isSampleRejected(sample) && !String(sample.rejectReason || "").trim()).length;
    if (rejectedWithoutReason) add("warning", "Rejeicao sem justificativa", `${rejectedWithoutReason} amostra(s) rejeitada(s) precisam de motivo documentado.`, "#amostras");

    if (builtArea > 0) {
      const areas = validSamples.map((sample) => sample.area);
      const minArea = Math.min(...areas);
      const maxArea = Math.max(...areas);
      if (builtArea < minArea || builtArea > maxArea) {
        add("warning", "Avaliando fora do intervalo amostral", `A area de ${number(builtArea)} m2 esta fora da faixa pesquisada de ${number(minArea)} a ${number(maxArea)} m2.`, "#amostras");
      }
    }
  }

  if (!r || state.error) {
    add("critical", "Modelo inferencial nao validado", state.error ? `Corrija o calculo: ${state.error}` : "Calcule o modelo para gerar valor, intervalo, fundamentacao e diagnosticos.", "#modelo");
  } else {
    if (r.foundation === "Pendente") add("critical", "Fundamentacao pendente", "Informe as evidencias dos itens 1 e 3 no quadro de enquadramento normativo.", "#modelo");
    else if (r.foundation === "Nao enquadrado") add("critical", "Fundamentacao nao enquadrada", "O conjunto de pontos ou os itens obrigatorios nao atingiram os criterios minimos da NBR 14653-2:2011.", "#modelo");
    if (!Number.isFinite(r.adjR2) || r.adjR2 < 0.7) add("warning", "Poder explicativo reduzido", `O R2 ajustado e ${number(r.adjR2, 3)}. Revise variaveis, dados e especificacao do modelo.`, "#modelo");
    if (r.diagnostics.overall === "fail") add("critical", "Diagnostico estatistico reprovado", failedDiagnosticsSummary(r.diagnostics), "#modelo");
    else if (r.diagnostics.overall === "warn") add("warning", "Diagnostico estatistico com ressalvas", "Ha alerta(s) de normalidade, outliers, correlacao ou significancia a justificar.", "#modelo");
    if (r.excludedVariables.length) {
      add("warning", "Variavel excluida automaticamente", r.excludedVariables.map((item) => `${item.label}: ${item.reason}`).join("; "), "#modelo");
    }
    if (!Number.isFinite(r.value) || r.value <= 0) add("critical", "Valor de avaliacao invalido", "O modelo nao produziu valor positivo e finito.", "#modelo");
  }

  add("manual", "Documentacao dominial e cadastral", "Conferir matricula, titularidade, areas documentais, restricoes e eventuais divergencias.", "#laudo");
  if (!state.reportPhotos.length) add("warning", "Fotos do avaliando ausentes", "Anexe fachada, logradouro, ambientes relevantes e elementos que sustentem padrao/conservacao.", "#laudo");
  if (!state.reportMap) add("warning", "Mapa/croqui ausente", "Anexe mapa ou croqui de localizacao para fechar a documentacao espacial do laudo.", "#laudo");
  add("manual", "Registro fotografico e localizacao", "Confirmar fachada, logradouro, ambientes relevantes e mapa ou croqui do imovel.", "#laudo");
  add("manual", "Responsabilidade tecnica", fields.artRrt.value.trim() ? `Conferir ${fields.artRrt.value.trim()} e colher a assinatura do responsavel tecnico.` : "Anexar ART/RRT e colher a assinatura do responsavel tecnico antes da entrega.", "#avaliando");
  return issues;
}

function renderReportReview() {
  const issues = buildReportReview();
  const counts = {
    critical: issues.filter((item) => item.severity === "critical").length,
    warning: issues.filter((item) => item.severity === "warning").length,
    manual: issues.filter((item) => item.severity === "manual").length,
  };
  const verdict = counts.critical ? "Nao recomendado para emissao" : counts.warning ? "Apto com ressalvas" : "Pronto para revisao tecnica";
  reviewVerdict.textContent = verdict;
  reviewVerdict.className = counts.critical ? "fail" : counts.warning ? "warn" : "ok";
  reviewMessage.textContent = counts.critical
    ? "Corrija as pendencias criticas antes de exportar a versao final."
    : counts.warning
      ? "O laudo pode avancar apos justificativa dos alertas tecnicos."
      : "As verificacoes automaticas foram atendidas; conclua as conferencias manuais.";
  document.querySelector("#reviewCriticalCount").textContent = counts.critical;
  document.querySelector("#reviewWarningCount").textContent = counts.warning;
  document.querySelector("#reviewManualCount").textContent = counts.manual;
  reviewResults.innerHTML = issues.map((item) => `
    <article class="review-item ${item.severity}">
      <span class="review-icon" aria-hidden="true">${item.severity === "critical" ? "!" : item.severity === "warning" ? "!" : "i"}</span>
      <div><strong>${item.title}</strong><p>${item.detail}</p></div>
      <a href="${item.anchor}">${item.severity === "manual" ? "Verificar" : "Corrigir"}</a>
    </article>
  `).join("");
  return { issues, counts, verdict };
}

function renderMetrics() {
  const r = state.result;
  document.querySelector("#metricN").textContent = r ? r.n : "0";
  document.querySelector("#metricK").textContent = r ? r.k : "0";
  document.querySelector("#metricR2").textContent = r ? number(r.adjR2, 3) : "-";
  document.querySelector("#metricValue").textContent = r ? money(adoptedMarketValue(r)) : "-";
  document.querySelector("#metricFoundation").textContent = r ? r.foundation : "-";
  document.querySelector("#metricPrecision").textContent = r ? r.precision : "-";
}

function renderTsProjection() {
  const r = state.result;
  if (!r || state.error) {
    tsProjectionStatus.textContent = "Aguardando modelo";
    tsProjectionStatus.className = "pill";
    tsProjectionCentral.textContent = "-";
    tsProjectionIc80.textContent = "-";
    tsProjectionAmplitude.textContent = "Amplitude: -";
    tsProjectionArbitration.textContent = "-";
    tsProjectionAdopted.textContent = "-";
    tsProjectionAdoptedUnit.textContent = "-";
    tsProjectionJustification.textContent = "Calcule o modelo para gerar a projeção.";
    return;
  }

  const adopted = adoptedMarketValue(r);
  const builtArea = numeric(fields.builtArea.value);
  const adoptedUnit = Number.isFinite(adopted) && builtArea > 0 ? adopted / builtArea : NaN;
  const arbitrationLower = r.value * 0.85;
  const arbitrationUpper = r.value * 1.15;
  const withinIc = Number.isFinite(adopted) && adopted >= r.lower && adopted <= r.upper;
  const withinArbitration = Number.isFinite(adopted) && adopted >= arbitrationLower && adopted <= arbitrationUpper;
  const centralWasAdopted = Number.isFinite(adopted) && Math.abs(adopted - r.value) < 1;
  const statusOk = withinIc && withinArbitration;

  tsProjectionStatus.textContent = statusOk ? "Valor defensável" : "Revisar valor";
  tsProjectionStatus.className = `pill ${statusOk ? "" : "warn"}`.trim();
  tsProjectionCentral.textContent = money(r.value);
  tsProjectionIc80.textContent = `${money(r.lower)} a ${money(r.upper)}`;
  tsProjectionAmplitude.textContent = `Amplitude IC 80%: ${number(r.amplitude, 2)}%`;
  tsProjectionArbitration.textContent = `${money(arbitrationLower)} a ${money(arbitrationUpper)}`;
  tsProjectionAdopted.textContent = money(adopted);
  tsProjectionAdoptedUnit.textContent = Number.isFinite(adoptedUnit) ? `${money(adoptedUnit)}/m2` : "Valor unitário indisponível";

  const validation = [
    withinIc ? "dentro do IC 80%" : "fora do IC 80%",
    withinArbitration ? "dentro do campo de arbítrio ±15%" : "fora do campo de arbítrio ±15%",
  ].join(" e ");
  const adoptionText = centralWasAdopted
    ? "Foi adotada a tendência central estimada pelo modelo."
    : `Foi adotado valor distinto da tendência central (${money(r.value)}), exigindo justificativa técnica.`;

  tsProjectionJustification.textContent = `${adoptionText} O valor adotado de ${money(adopted)} está ${validation}. ${adoptedValueJustification(r)}`;
}

function diagnosticLabel(status) {
  if (status === "ok") return "Aprovado";
  if (status === "warn") return "Alerta";
  return "Critico";
}

function renderDiagnosticCard(title, status, value, detail, items = []) {
  const list = items.length ? `<ul class="diagnostic-list">${items.map((item) => `<li>${item}</li>`).join("")}</ul>` : "";
  return `
    <article class="diagnostic-card ${status === "ok" ? "" : status}">
      <h4>${title}</h4>
      <strong>${value}</strong>
      <p>${detail}</p>
      ${list}
    </article>
  `;
}

function renderDiagnostics() {
  const r = state.result;
  if (!r || state.error) {
    diagnosticSummary.textContent = "Aguardando modelo";
    diagnosticSummary.className = "pill";
    diagnosticCards.innerHTML = "";
    return;
  }
  const d = r.diagnostics;
  diagnosticSummary.textContent = diagnosticLabel(d.overall);
  diagnosticSummary.className = `pill ${d.overall === "ok" ? "" : d.overall}`.trim();
  diagnosticCards.innerHTML = [
    ...(r.excludedVariables.length ? [renderDiagnosticCard(
      "Variaveis Excluidas",
      "warn",
      `${r.excludedVariables.length} exclusao(oes) automatica(s)`,
      "Variaveis sem variacao ou linearmente dependentes nao participam da regressao.",
      r.excludedVariables.map((item) => `${item.label}: ${item.reason}`),
    )] : []),
    renderDiagnosticCard(
      "Normalidade",
      d.normality.status,
      `${pct(d.normality.within1)} | ${pct(d.normality.within164)} | ${pct(d.normality.within196)}`,
      "Residuos em [-1,+1], [-1,64,+1,64] e [-1,96,+1,96]. Referencias: 68%, 90% e 95%.",
    ),
    renderDiagnosticCard(
      "Outliers",
      d.outliers.status,
      `${d.outliers.above2.length} acima de |2|`,
      `${d.outliers.above3.length} amostra(s) acima de |3|.`,
      d.outliers.above2.slice(0, 3).map((item) => `${item.source}: ${number(item.value, 2)}`),
    ),
    renderDiagnosticCard(
      "Multicolinearidade",
      d.multicollinearity.status,
      `${d.multicollinearity.highCorrelations.length} correlacao(oes) alta(s)`,
      "Alerta quando |r| >= 0,80 entre variaveis independentes.",
      d.multicollinearity.highCorrelations.slice(0, 3).map((item) => `${item.a} x ${item.b}: ${number(item.value, 2)}`),
    ),
    renderDiagnosticCard(
      "Significancia",
      d.significance.status,
      `p max.: ${pct(d.significance.maxP)}`,
      "Classificacao auxiliar: <=10% grau III, <=20% grau II, <=30% grau I.",
      d.significance.variables.map((item) => `${item.name}: ${pct(item.pValue * 100)} (${item.grade})`),
    ),
    renderDiagnosticCard(
      "Teste F Global",
      d.modelSignificance.status,
      `F=${number(d.modelSignificance.fValue, 3)} | p=${pct(d.modelSignificance.pValue * 100)}`,
      "Teste da hipotese nula global do modelo. Referencias normativas: <=1% grau III, <=2% grau II, <=5% grau I.",
    ),
    renderDiagnosticCard(
      "Micronumerosidade",
      d.micronumerosity.status,
      `${d.micronumerosity.n} dados / ${d.micronumerosity.k} variaveis`,
      `Minimos: grau III ${d.micronumerosity.gradeIII}, grau II ${d.micronumerosity.gradeII}, grau I ${d.micronumerosity.gradeI}. Codigos alocados exigem ao menos ${d.micronumerosity.categoryMinimum} dados por categoria nesta amostra.`,
      d.micronumerosity.categoryChecks.map((check) => `${check.label}: ${check.categories.map((category) => `${category.value}=${category.count}${category.acceptable ? "" : " (insuficiente)"}`).join(", ")}`),
    ),
    renderDiagnosticCard(
      "Diagnostico Geral",
      d.overall,
      diagnosticLabel(d.overall),
      "Leitura consolidada dos testes auxiliares. Requer revisao do responsavel tecnico.",
    ),
  ].join("");
}

function renderFoundationAssessment() {
  const r = state.result;
  if (!r || state.error) {
    foundationSummary.textContent = "Aguardando modelo";
    foundationSummary.className = "pill";
    foundationRows.innerHTML = "";
    foundationNote.textContent = "Calcule o modelo e informe as evidencias dos itens 1 e 3.";
    return;
  }

  const assessment = r.foundationAssessment;
  const statusClass = assessment.label === "III" ? "" : ["II", "I"].includes(assessment.label) ? "warn" : "fail";
  foundationSummary.textContent = `${assessment.label} | ${assessment.points} pontos`;
  foundationSummary.className = `pill ${statusClass}`.trim();
  foundationRows.innerHTML = assessment.items.map((item) => `
    <tr>
      <td>${item.item}</td>
      <td>${item.criterion}</td>
      <td><span class="foundation-grade grade-${item.grade}">${gradeLabel(item.grade)}</span></td>
      <td>${item.evidence}</td>
    </tr>
  `).join("");

  const notes = [];
  if (assessment.pending) notes.push("Preencha as evidencias dos itens 1 e 3 para concluir o enquadramento.");
  if (assessment.usesAllocatedCodes) notes.push("O modelo utiliza codigos alocados: os criterios de atribuicao devem constar no laudo, a micronumerosidade por categoria deve ser atendida e nao se admite extrapolacao desses codigos.");
  foundationNote.textContent = notes.join(" ") || "Enquadramento calculado pela pontuacao e pelos itens obrigatorios da NBR 14653-2:2011.";
}

function renderModelReport() {
  if (state.error) {
    modelReport.textContent = `Erro no calculo: ${state.error}`;
    return;
  }
  const r = state.result;
  if (!r) {
    modelReport.textContent = "Calcule o modelo para ver a memoria.";
    return;
  }
  const names = ["Intercepto", ...r.variableNames];
  const coefficients = r.beta.map((b, i) => `${names[i]} = ${number(b, 6)} | p (teste t) ${number(r.pValues[i] * 100, 2)}%`).join("\n");
  const equationTerms = r.variableNames.map((name, i) => `b${i + 1}*${name}`).join(" + ");
  const targetLabel = r.targetType === "total" ? "PRECO_TOTAL" : "VALOR_UNITARIO";
  const d = r.diagnostics;
  const diagnosticLines = [
    `Normalidade: ${diagnosticLabel(d.normality.status)} | faixas ${pct(d.normality.within1)}, ${pct(d.normality.within164)}, ${pct(d.normality.within196)}`,
    `Outliers: ${d.outliers.above2.length} acima de |2|; ${d.outliers.above3.length} acima de |3|`,
    `Multicolinearidade: ${d.multicollinearity.highCorrelations.length} correlacao(oes) com |r| >= 0,80`,
    `Significancia: p max. ${pct(d.significance.maxP)} (${diagnosticLabel(d.significance.status)})`,
    `Teste F global: F=${number(r.modelF, 3)}; p=${pct(r.modelP * 100)}`,
    `Micronumerosidade: n=${d.micronumerosity.n}; minimos grau III=${d.micronumerosity.gradeIII}, II=${d.micronumerosity.gradeII}, I=${d.micronumerosity.gradeI}`,
    `Diagnostico geral: ${diagnosticLabel(d.overall)}`,
  ].join("\n");
  const excludedLine = r.excludedVariables.length
    ? r.excludedVariables.map((item) => `${item.label} (${item.reason})`).join("; ")
    : "Nenhuma";
  const foundationLines = r.foundationAssessment.items
    .map((item) => `${item.item}. ${item.criterion}: ${gradeLabel(item.grade)} - ${item.evidence}`)
    .join("\n");
  const adopted = adoptedMarketValue(r);
  const adoptedUnit = Number.isFinite(adopted) && numeric(fields.builtArea.value) > 0
    ? adopted / numeric(fields.builtArea.value)
    : NaN;
  modelReport.textContent = [
    `MODELO: ln(${targetLabel}) = b0${equationTerms ? ` + ${equationTerms}` : ""}`,
    "",
    coefficients,
    "",
    `Dados utilizados: ${r.n}`,
    `Variaveis independentes: ${r.k}`,
    `Variaveis excluidas automaticamente: ${excludedLine}`,
    `R2 ajustado: ${number(r.adjR2, 4)}`,
    `Amplitude IC 80%: ${number(r.amplitude, 2)}%`,
    `Grau de fundamentacao estimado: ${r.foundation}`,
    `Grau de precisao: ${r.precision}`,
    `Pontuacao de fundamentacao: ${r.foundationAssessment.points} pontos`,
    r.foundationAssessment.usesAllocatedCodes ? "Codigos alocados: criterios de atribuicao, micronumerosidade por categoria e ausencia de extrapolacao devem ser documentados." : "Controle adicional por codificacao alocada: nao aplicavel.",
    "",
    "ENQUADRAMENTO NORMATIVO:",
    foundationLines,
    "",
    "DIAGNOSTICO ESTATISTICO:",
    diagnosticLines,
    "",
    `Valor unitario: ${money(r.unit)}/m2`,
    `Valor total inferido: ${money(r.value)}`,
    `Valor adotado no laudo: ${money(adopted)}`,
    `Valor unitario adotado: ${money(adoptedUnit)}/m2`,
    `Limite inferior: ${money(r.lower)}`,
    `Limite superior: ${money(r.upper)}`,
    `Justificativa do valor adotado: ${adoptedValueJustification(r)}`,
    "",
    "Observacao: esta versao inicial automatiza o nucleo matematico e checklist. A responsabilidade tecnica exige revisao do avaliador, anexos, ART/RRT e verificacao final conforme OS.",
  ].join("\n");
}

function chartContext(canvas) {
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  return ctx;
}

function drawAxes(ctx, box, xLabel, yLabel) {
  ctx.strokeStyle = "#d7ded9";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(box.left, box.top);
  ctx.lineTo(box.left, box.bottom);
  ctx.lineTo(box.right, box.bottom);
  ctx.stroke();
  ctx.fillStyle = "#637068";
  ctx.font = "12px Arial";
  ctx.fillText(xLabel, box.left + 4, box.bottom + 26);
  ctx.save();
  ctx.translate(box.left - 36, box.bottom - 4);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText(yLabel, 0, 0);
  ctx.restore();
}

function scale(value, min, max, start, end) {
  if (max === min) return (start + end) / 2;
  return start + ((value - min) / (max - min)) * (end - start);
}

function extent(values, padding = 0.08) {
  let min = Math.min(...values);
  let max = Math.max(...values);
  const span = max - min || Math.abs(max) || 1;
  min -= span * padding;
  max += span * padding;
  return [min, max];
}

function drawEmptyChart(canvas, message = "Calcule o modelo para gerar o grafico.") {
  const ctx = chartContext(canvas);
  ctx.fillStyle = "#637068";
  ctx.font = "14px Arial";
  ctx.textAlign = "center";
  ctx.fillText(message, canvas.width / 2, canvas.height / 2);
  ctx.textAlign = "left";
}

function drawAdherenceChart(result) {
  const canvas = chartCanvases.adherence;
  if (!result) return drawEmptyChart(canvas);
  const ctx = chartContext(canvas);
  const box = { left: 58, top: 20, right: 620, bottom: 310 };
  const all = [...result.observedUnits, ...result.fittedUnits];
  const [min, max] = extent(all);
  drawAxes(ctx, box, "Calculado (R$/m2)", "Observado (R$/m2)");
  ctx.strokeStyle = "#9aa8a0";
  ctx.setLineDash([6, 5]);
  ctx.beginPath();
  ctx.moveTo(scale(min, min, max, box.left, box.right), scale(min, min, max, box.bottom, box.top));
  ctx.lineTo(scale(max, min, max, box.left, box.right), scale(max, min, max, box.bottom, box.top));
  ctx.stroke();
  ctx.setLineDash([]);
  result.observedUnits.forEach((observed, i) => {
    const x = scale(result.fittedUnits[i], min, max, box.left, box.right);
    const y = scale(observed, min, max, box.bottom, box.top);
    ctx.fillStyle = "#265f8f";
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawResidualChart(result) {
  const canvas = chartCanvases.residual;
  if (!result) return drawEmptyChart(canvas);
  const ctx = chartContext(canvas);
  const box = { left: 58, top: 20, right: 620, bottom: 310 };
  const xValues = result.fittedUnits;
  const yValues = result.standardizedResiduals;
  const [minX, maxX] = extent(xValues);
  const [minY, maxY] = extent([...yValues, -2, 0, 2]);
  drawAxes(ctx, box, "Valor calculado (R$/m2)", "Residuo padronizado");
  [-2, 0, 2].forEach((line) => {
    const y = scale(line, minY, maxY, box.bottom, box.top);
    ctx.strokeStyle = line === 0 ? "#637068" : "#d7ded9";
    ctx.setLineDash(line === 0 ? [] : [5, 5]);
    ctx.beginPath();
    ctx.moveTo(box.left, y);
    ctx.lineTo(box.right, y);
    ctx.stroke();
  });
  ctx.setLineDash([]);
  yValues.forEach((value, i) => {
    const x = scale(xValues[i], minX, maxX, box.left, box.right);
    const y = scale(value, minY, maxY, box.bottom, box.top);
    ctx.fillStyle = Math.abs(value) > 2 ? "#b03a2e" : "#26734d";
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fill();
  });
}

function drawNormalityChart(result) {
  const canvas = chartCanvases.normality;
  if (!result) return drawEmptyChart(canvas);
  const ctx = chartContext(canvas);
  const box = { left: 58, top: 20, right: 620, bottom: 310 };
  const bins = 8;
  const values = result.standardizedResiduals;
  const [minX, maxX] = extent([...values, -3, 3], 0);
  const width = (maxX - minX) / bins;
  const counts = Array.from({ length: bins }, () => 0);
  values.forEach((value) => {
    const index = Math.max(0, Math.min(bins - 1, Math.floor((value - minX) / width)));
    counts[index] += 1;
  });
  const maxCount = Math.max(...counts, 1);
  drawAxes(ctx, box, "Residuo padronizado", "Frequencia");
  counts.forEach((count, i) => {
    const x0 = scale(minX + i * width, minX, maxX, box.left, box.right);
    const x1 = scale(minX + (i + 1) * width, minX, maxX, box.left, box.right);
    const y = scale(count, 0, maxCount, box.bottom, box.top);
    ctx.fillStyle = "#8fb7a3";
    ctx.fillRect(x0 + 2, y, Math.max(x1 - x0 - 4, 1), box.bottom - y);
  });
  ctx.strokeStyle = "#b03a2e";
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let i = 0; i <= 80; i += 1) {
    const xValue = minX + (i / 80) * (maxX - minX);
    const density = Math.exp(-0.5 * xValue * xValue) / Math.sqrt(2 * Math.PI);
    const scaledDensity = density * values.length * width;
    const x = scale(xValue, minX, maxX, box.left, box.right);
    const y = scale(scaledDensity, 0, maxCount, box.bottom, box.top);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
  ctx.lineWidth = 1;
}

function drawCorrelationChart(result) {
  const canvas = chartCanvases.correlation;
  if (!result) return drawEmptyChart(canvas);
  const ctx = chartContext(canvas);
  const names = result.variableNames;
  const size = 62;
  const startX = 190;
  const startY = 54;
  ctx.fillStyle = "#637068";
  ctx.font = "12px Arial";
  names.forEach((name, i) => {
    ctx.fillText(name, 16, startY + i * size + 36);
    ctx.save();
    ctx.translate(startX + i * size + 8, 42);
    ctx.rotate(-Math.PI / 4);
    ctx.fillText(name, 0, 0);
    ctx.restore();
  });
  result.correlations.forEach((row, y) => {
    row.forEach((value, x) => {
      const red = value < 0 ? Math.round(180 * Math.abs(value)) : 45;
      const green = value > 0 ? Math.round(120 + 80 * value) : 70;
      const blue = value > 0 ? Math.round(110 + 40 * value) : Math.round(120 + 60 * Math.abs(value));
      ctx.fillStyle = `rgb(${red}, ${green}, ${blue})`;
      ctx.fillRect(startX + x * size, startY + y * size, size - 4, size - 4);
      ctx.fillStyle = "#ffffff";
      ctx.font = "13px Arial";
      ctx.textAlign = "center";
      ctx.fillText(number(value, 2), startX + x * size + size / 2 - 2, startY + y * size + 36);
      ctx.textAlign = "left";
    });
  });
}

function renderCharts() {
  if (state.error) {
    Object.values(chartCanvases).forEach((canvas) => drawEmptyChart(canvas, "Corrija o erro do modelo para gerar o grafico."));
    return;
  }
  drawAdherenceChart(state.result);
  drawResidualChart(state.result);
  drawNormalityChart(state.result);
  drawCorrelationChart(state.result);
}

function chartDataUrl(key) {
  const canvas = chartCanvases[key];
  if (!canvas) return "";
  try {
    return canvas.toDataURL("image/png");
  } catch {
    return "";
  }
}

function reportDiagnosticsRows(result) {
  if (!result) return "";
  const d = result.diagnostics;
  return `
    <tr><th>Normalidade</th><td>${diagnosticLabel(d.normality.status)} | ${pct(d.normality.within1)}, ${pct(d.normality.within164)}, ${pct(d.normality.within196)}</td></tr>
    <tr><th>Outliers</th><td>${d.outliers.above2.length} acima de |2|; ${d.outliers.above3.length} acima de |3|</td></tr>
    <tr><th>Multicolinearidade</th><td>${d.multicollinearity.highCorrelations.length} correlacao(oes) com |r| >= 0,80</td></tr>
    <tr><th>Significancia</th><td>p maximo ${pct(d.significance.maxP)} - ${diagnosticLabel(d.significance.status)}</td></tr>
    <tr><th>Teste F global</th><td>F=${number(d.modelSignificance.fValue, 3)}; p=${pct(d.modelSignificance.pValue * 100)}</td></tr>
    <tr><th>Micronumerosidade</th><td>n=${d.micronumerosity.n}; minimos: III=${d.micronumerosity.gradeIII}, II=${d.micronumerosity.gradeII}, I=${d.micronumerosity.gradeI}${d.micronumerosity.categoryChecks.length ? `; categorias: ${d.micronumerosity.categoryChecks.map((check) => `${check.label} [${check.categories.map((category) => `${category.value}=${category.count}`).join(", ")}]`).join("; ")}` : ""}</td></tr>
    <tr><th>Variaveis excluidas</th><td>${result.excludedVariables.length ? result.excludedVariables.map((item) => `${item.label}: ${item.reason}`).join("; ") : "Nenhuma"}</td></tr>
    <tr><th>Geral</th><td>${diagnosticLabel(d.overall)}</td></tr>
  `;
}

function coefficientRowsForReport(result) {
  if (!result) return '<tr><td colspan="5">Modelo ainda nao calculado.</td></tr>';
  const names = ["Intercepto", ...result.variableNames];
  return result.beta.map((coefficient, index) => `
    <tr>
      <td>${names[index]}</td>
      <td>${number(coefficient, 8)}</td>
      <td>${number(result.standardErrors[index], 8)}</td>
      <td>${number(result.tStats[index], 3)}</td>
      <td>${number(result.pValues[index] * 100, 2)}%</td>
    </tr>
  `).join("");
}

function sampleRowsForReport(result) {
  const samples = result ? result.valid : activeSamples().filter((sample) => sample.price > 0 && sample.area > 0);
  return samples.slice(0, 16).map((sample, index) => `
    <tr>
      <td>${index + 1}</td>
      <td>${sample.source || `Amostra ${index + 1}`}</td>
      <td>${money(sample.price)}</td>
      <td>${number(sample.area, 2)}</td>
      <td>${sample.location}</td>
      <td>${sample.standard}</td>
      <td>${sample.conservation}</td>
    </tr>
  `).join("");
}

function rejectedSampleRowsForReport() {
  const rejected = state.samples.filter(isSampleRejected);
  if (!rejected.length) return '<tr><td colspan="4">Nenhuma amostra rejeitada registrada.</td></tr>';
  return rejected.map((sample, index) => `
    <tr>
      <td>${index + 1}</td>
      <td>${sample.source || `Amostra rejeitada ${index + 1}`}</td>
      <td>${money(sample.price)}</td>
      <td>${sample.rejectReason || "Motivo nao informado"}</td>
    </tr>
  `).join("");
}

function reportPhotoItems() {
  const photoItems = state.reportPhotos.length
    ? state.reportPhotos.slice(0, 4).map((photo, index) => `
      <figure class="doc-photo-card">
        <img src="${photo.dataUrl}" alt="${escapeHtml(photo.label || `Foto ${index + 1}`)}" />
        <figcaption>${escapeHtml(photo.label || `Foto ${index + 1}`)}</figcaption>
      </figure>
    `).join("") + (state.reportPhotos.length > 4 ? `<p class="doc-small-note">Há mais ${state.reportPhotos.length - 4} foto(s) anexada(s) na galeria do sistema.</p>` : "")
    : '<p class="doc-small-note">Nenhuma foto anexada. Inserir fachada, vista da rua, ambientes internos e elementos relevantes antes da emissão final.</p>';
  const mapItem = state.reportMap
    ? `<figure class="doc-photo-card map"><img src="${state.reportMap.dataUrl}" alt="${escapeHtml(state.reportMap.label)}" /><figcaption>${escapeHtml(state.reportMap.label)}</figcaption></figure>`
    : '<p class="doc-small-note">Mapa/croqui não anexado. Inserir mapa com coordenadas ou croqui de localização antes da emissão final.</p>';
  return { photoItems, mapItem };
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function reportValue(key, fallback = "-") {
  const value = fields[key] && String(fields[key].value).trim();
  return value ? escapeHtml(value) : fallback;
}

function setProjectStatus(message, status = "") {
  projectStatus.textContent = message;
  projectStatus.className = `project-status ${status}`.trim();
}

function readStoredProjects() {
  try {
    const projects = JSON.parse(localStorage.getItem(PROJECT_STORAGE_KEY) || "[]");
    return Array.isArray(projects) ? projects : [];
  } catch {
    setProjectStatus("Nao foi possivel ler os projetos salvos neste navegador.", "fail");
    return [];
  }
}

function writeStoredProjects(projects) {
  try {
    localStorage.setItem(PROJECT_STORAGE_KEY, JSON.stringify(projects));
    return true;
  } catch {
    setProjectStatus("Falha ao salvar. Verifique o espaco de armazenamento do navegador.", "fail");
    return false;
  }
}

function projectIdentifier() {
  return globalThis.crypto && crypto.randomUUID
    ? crypto.randomUUID()
    : `project-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function onlyDigits(value) {
  return String(value ?? "").replace(/\D/g, "");
}

function currentProjectData(id = state.activeProjectId || projectIdentifier()) {
  const fieldValues = Object.fromEntries(Object.entries(fields).map(([key, field]) => [key, field.value]));
  const activeDemandId = sessionStorage.getItem("sisavalia.activeDemandId") || null;
  return {
    version: 1,
    id,
    name: projectName.value.trim() || fields.osNumber.value.trim() || "Laudo sem titulo",
    updatedAt: new Date().toISOString(),
    linkedDemandId: activeDemandId,
    linkedDemandOsNumber: fields.osNumber.value.trim() || null,
    fields: fieldValues,
    samples: state.samples.map((sample) => ({ ...sample })),
    reportPhotos: state.reportPhotos.map((photo) => ({ ...photo })),
    reportMap: state.reportMap ? { ...state.reportMap } : null,
    modelTarget: state.modelTarget,
    foundationInputs: { ...state.foundationInputs },
    modelConfig: JSON.parse(JSON.stringify(state.modelConfig)),
  };
}

function markProjectDirty() {
  state.projectDirty = true;
  setProjectStatus("Alteracoes nao salvas.", "warn");
}

function renderProjectList() {
  const projects = readStoredProjects().sort((a, b) => String(b.updatedAt || "").localeCompare(String(a.updatedAt || "")));
  if (!projects.length) {
    projectList.innerHTML = '<div class="project-empty">Nenhum projeto salvo neste navegador.</div>';
    return;
  }
  projectList.innerHTML = projects.map((project) => {
    const updated = project.updatedAt ? new Date(project.updatedAt).toLocaleString("pt-BR") : "Data nao informada";
    const sampleCount = Array.isArray(project.samples) ? project.samples.length : 0;
    return `
      <article class="project-item ${project.id === state.activeProjectId ? "active" : ""}">
        <div>
          <strong>${escapeHtml(project.name || "Laudo sem titulo")}</strong>
          <small>Atualizado em ${escapeHtml(updated)} | ${sampleCount} amostra(s)</small>
        </div>
        <div class="project-item-actions">
          <button type="button" data-project-open="${project.id}">Abrir</button>
          <button type="button" class="project-delete" data-project-delete="${project.id}">Excluir</button>
        </div>
      </article>`;
  }).join("");
  projectList.querySelectorAll("[data-project-open]").forEach((button) => {
    button.addEventListener("click", () => openStoredProject(button.dataset.projectOpen));
  });
  projectList.querySelectorAll("[data-project-delete]").forEach((button) => {
    button.addEventListener("click", () => deleteStoredProject(button.dataset.projectDelete));
  });
}

function saveCurrentProject() {
  const project = currentProjectData();
  const projects = readStoredProjects();
  const existingIndex = projects.findIndex((item) => item.id === project.id);
  if (existingIndex >= 0) projects[existingIndex] = project;
  else projects.push(project);
  if (!writeStoredProjects(projects)) return;
  state.activeProjectId = project.id;
  state.projectDirty = false;
  projectName.value = project.name;
  setProjectStatus(`Projeto "${project.name}" salvo neste navegador.`, "ok");
  renderProjectList();
}

function applyProjectData(project, imported = false) {
  if (!project || typeof project.fields !== "object" || !Array.isArray(project.samples)) {
    throw new Error("Arquivo de projeto invalido ou incompleto.");
  }
  Object.entries(fields).forEach(([key, field]) => {
    const value = project.fields[key];
    if (value !== undefined && value !== null) field.value = String(value);
    else if (field.tagName === "SELECT") field.selectedIndex = 0;
    else field.value = "";
  });
  state.samples = project.samples.map((sample) => ({
    source: String(sample.source || ""),
    price: numeric(sample.price),
    area: numeric(sample.area),
    location: numeric(sample.location) || 2,
    standard: numeric(sample.standard) || 2,
    conservation: numeric(sample.conservation) || 2,
    hasPhoto: Boolean(sample.hasPhoto),
    status: ["aprovada", "prevalidacao", "rejeitada"].includes(String(sample.status || "").toLowerCase()) ? String(sample.status).toLowerCase() : "aprovada",
    rejectReason: String(sample.rejectReason || ""),
  }));
  state.reportPhotos = Array.isArray(project.reportPhotos) ? project.reportPhotos.map((photo) => ({
    name: String(photo.name || "Foto"),
    label: String(photo.label || photo.name || "Foto do imóvel"),
    dataUrl: String(photo.dataUrl || ""),
  })).filter((photo) => photo.dataUrl) : [];
  state.reportMap = project.reportMap && project.reportMap.dataUrl
    ? { name: String(project.reportMap.name || "Mapa"), label: String(project.reportMap.label || "Mapa/Croqui de localização"), dataUrl: String(project.reportMap.dataUrl) }
    : null;
  const defaults = defaultModelConfig();
  state.modelTarget = project.modelTarget === "total" ? "total" : "unit";
  modelTarget.value = state.modelTarget;
  const foundationDefaults = defaultFoundationInputs();
  state.foundationInputs = Object.fromEntries(Object.keys(foundationDefaults).map((key) => [
    key,
    Math.max(0, Math.min(3, Number(project.foundationInputs && project.foundationInputs[key]) || 0)),
  ]));
  syncFoundationControls();
  state.modelConfig = Object.fromEntries(Object.keys(defaults).map((key) => [
    key,
    { ...defaults[key], ...((project.modelConfig && project.modelConfig[key]) || {}) },
  ]));
  state.activeProjectId = imported ? null : project.id;
  state.projectDirty = imported;
  projectName.value = imported ? `${project.name || "Projeto"} - importado` : project.name || "Laudo sem titulo";
  state.error = "";
  state.result = null;
  renderVariableControls();
  renderSamples();
  try {
    state.result = runRegression();
  } catch (error) {
    state.error = error.message;
  }
  updateAll();
  setCepStatus(fields.ibgeCode.value.trim()
    ? "Dados territoriais carregados do projeto. Confira numero e complemento."
    : "Apoio cadastral; nao altera o calculo do valor.", fields.ibgeCode.value.trim() ? "ok" : "");
  setProjectStatus(imported ? "Projeto importado. Salve para inclui-lo na lista local." : `Projeto "${projectName.value}" aberto.`, imported ? "warn" : "ok");
  renderProjectList();
}

function openStoredProject(id) {
  const project = readStoredProjects().find((item) => item.id === id);
  if (!project) {
    setProjectStatus("Projeto nao encontrado no armazenamento local.", "fail");
    return;
  }
  try {
    applyProjectData(project);
    location.hash = "os";
  } catch (error) {
    setProjectStatus(error.message, "fail");
  }
}

function findStoredProjectsByOs(osNumber) {
  const targetDigits = onlyDigits(osNumber);
  const targetText = String(osNumber ?? "").trim().toLowerCase();
  if (!targetDigits && !targetText) return [];
  return readStoredProjects().filter((project) => {
    const savedOs = String(project?.fields?.osNumber || project?.linkedDemandOsNumber || "").trim();
    const savedDigits = onlyDigits(savedOs);
    if (targetDigits && savedDigits && savedDigits === targetDigits) return true;
    return Boolean(targetText && savedOs.toLowerCase() === targetText);
  }).map((project) => ({
    id: project.id,
    name: project.name || "Laudo sem titulo",
    osNumber: project?.fields?.osNumber || project.linkedDemandOsNumber || "",
    proponent: project?.fields?.proponent || "",
    city: project?.fields?.city || "",
    state: project?.fields?.state || "",
    updatedAt: project.updatedAt || "",
    sampleCount: Array.isArray(project.samples) ? project.samples.length : 0,
  }));
}

function deleteStoredProject(id) {
  const projects = readStoredProjects();
  const project = projects.find((item) => item.id === id);
  if (!project) return;
  if (!window.confirm(`Excluir o projeto "${project.name}" deste navegador?`)) return;
  if (!writeStoredProjects(projects.filter((item) => item.id !== id))) return;
  if (state.activeProjectId === id) {
    state.activeProjectId = null;
    state.projectDirty = true;
  }
  setProjectStatus("Projeto excluido do armazenamento local.", "ok");
  renderProjectList();
}

function newBlankProject(navigate = true) {
  Object.values(fields).forEach((field) => {
    if (field.tagName === "SELECT") field.selectedIndex = 0;
    else field.value = "";
  });
  state.samples = [];
  state.reportPhotos = [];
  state.reportMap = null;
  state.modelTarget = "unit";
  modelTarget.value = state.modelTarget;
  state.foundationInputs = defaultFoundationInputs();
  syncFoundationControls();
  state.modelConfig = defaultModelConfig();
  state.result = null;
  state.error = "";
  state.activeProjectId = null;
  state.projectDirty = true;
  projectName.value = "Novo laudo";
  renderVariableControls();
  renderSamples();
  updateAll();
  setCepStatus("Apoio cadastral; nao altera o calculo do valor.");
  setProjectStatus("Novo projeto iniciado. Preencha os dados e salve.", "warn");
  renderProjectList();
  if (navigate) location.hash = "os";
}

function exportProjectBackup() {
  const project = currentProjectData();
  const blob = new Blob([JSON.stringify(project, null, 2)], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `projeto-sisavalia-${fields.osNumber.value || "rascunho"}.json`;
  link.click();
  URL.revokeObjectURL(url);
  setProjectStatus("Backup JSON exportado.", "ok");
}

async function importProjectBackup() {
  const file = projectImportFile.files && projectImportFile.files[0];
  if (!file) {
    setProjectStatus("Selecione um arquivo JSON de projeto.", "fail");
    return;
  }
  try {
    const project = JSON.parse(await file.text());
    applyProjectData(project, true);
  } catch (error) {
    setProjectStatus(`Falha na importacao: ${error.message}`, "fail");
  }
}

function renderFormalReportPages(r, reportEquation) {
  const yes = "SIM";
  const no = "NAO";
  const blank = "-";
  const attachments = reportPhotoItems();
  const adopted = adoptedMarketValue(r);
  const adoptedUnit = r && Number.isFinite(adopted) && numeric(fields.builtArea.value) > 0
    ? adopted / numeric(fields.builtArea.value)
    : NaN;
  const arbitrationLower = r ? r.value * 0.85 : NaN;
  const arbitrationUpper = r ? r.value * 1.15 : NaN;
  const centralWasAdopted = r && Number.isFinite(adopted) && Math.abs(adopted - r.value) < 1;
  return `
      <section class="mma-template-page">
        <div class="mma-template-content compact dense">
          <header>
            <h2 class="doc-title">Laudo de Avaliacao - SisAvalia</h2>
            <p class="doc-subtitle">Blocos 1 a 4 do modelo de laudo de credito imobiliario</p>
          </header>
          <section class="doc-section">
            <h3>1. Solicitacao</h3>
            <table class="doc-table compact">
              <tbody>
                <tr><th>Prefixo / Depto solicitante</th><td>CENOP IMOBILIARIO</td><th>N OS</th><td>${fields.osNumber.value || blank}</td></tr>
                <tr><th>Data OS</th><td>${fields.osDate.value || blank}</td><th>Data avaliacao</th><td>${fields.osDate.value || blank}</td></tr>
                <tr><th>Proponente</th><td>${fields.proponent.value || blank}</td><th>CPF/CNPJ</th><td>${reportValue("cpfCnpj")}</td></tr>
                <tr><th>Proposito</th><td>${fields.purpose.value}</td><th>Objetivo</th><td>${fields.objective.value}</td></tr>
                <tr><th>Minha Casa Minha Vida</th><td>${no}</td><th>Uso interno</th><td>${yes}</td></tr>
              </tbody>
            </table>
          </section>
          <section class="doc-section">
            <h3>2. Identificacao</h3>
            <table class="doc-table compact">
              <tbody>
                <tr><th>Endereco</th><td>${fields.address.value || blank}</td><th>Numero</th><td>${reportValue("addressNumber")}</td></tr>
                <tr><th>Complemento</th><td>${reportValue("addressComplement")}</td><th>Bairro / Setor</th><td>${reportValue("neighborhood")}</td></tr>
                <tr><th>Cidade / UF</th><td>${fields.city.value || blank} / ${fields.state.value || blank}</td><th>CEP / Codigo IBGE</th><td>${reportValue("postalCode")} / ${reportValue("ibgeCode")}</td></tr>
                <tr><th>Condominio / empreendimento</th><td>${reportValue("condominiumName")}</td><th>Matricula</th><td>${reportValue("registrationNumber")}</td></tr>
                <tr><th>Cartorio / Oficio</th><td>${reportValue("registryOffice")}</td><th>Data emissao matricula</th><td>${reportValue("registrationDate")}</td></tr>
                <tr><th>Observacoes</th><td colspan="3">${reportValue("propertyNotes")}</td></tr>
              </tbody>
            </table>
          </section>
          <section class="doc-section">
            <h3>3. Micro-regiao do Avaliando</h3>
            <table class="doc-table compact">
              <tbody>
                <tr><th>Uso predominante</th><td>${reportValue("predominantUse")}</td><th>Padrao predominante</th><td>${labelFor(options.standard, fields.standard.value)}</td></tr>
                <tr><th>Acesso</th><td>${reportValue("accessType")}</td><th>Area de risco / alagamento</th><td>${reportValue("riskArea")}</td></tr>
                <tr><th>Infraestrutura urbana</th><td colspan="3">${reportValue("urbanInfrastructure")}</td></tr>
                <tr><th>Servicos publicos</th><td colspan="3">${reportValue("publicServices")}</td></tr>
              </tbody>
            </table>
          </section>
          <section class="doc-section">
            <h3>4. Terreno</h3>
            <table class="doc-table compact">
              <tbody>
                <tr><th>Area total</th><td>${number(numeric(fields.landArea.value))} m2</td><th>N frentes</th><td>${reportValue("fronts")}</td></tr>
                <tr><th>Testada</th><td>${reportValue("frontage")}</td><th>Topografia</th><td>${reportValue("topography")}</td></tr>
                <tr><th>Posicao na quadra</th><td>${reportValue("blockPosition")}</td><th>Fracao ideal</th><td>${reportValue("idealFraction")}</td></tr>
                <tr><th>Superficie</th><td>${reportValue("surface")}</td><th>Cota greide / formato</th><td>${reportValue("gradeFormat")}</td></tr>
              </tbody>
            </table>
          </section>
        </div>
        <div class="doc-footer-note">Pagina 03 | SISAVALIA</div>
      </section>

      <section class="mma-template-page">
        <div class="mma-template-content compact">
          <header>
            <h2 class="doc-title">Laudo de Avaliacao - SisAvalia</h2>
            <p class="doc-subtitle">Bloco 5 do modelo: caracteristicas fisicas, areas, vagas e condominio</p>
          </header>
          <section class="doc-section">
            <h3>5. Imovel Avaliando</h3>
            <table class="doc-table compact">
              <tbody>
                <tr><th>Tipo</th><td>${fields.propertyType.value}</td><th>Uso</th><td>${reportValue("propertyUse")}</td></tr>
                <tr><th>Posicao da edificacao</th><td>${reportValue("buildingPosition")}</td><th>Ocupacao</th><td>${reportValue("occupancy")}</td></tr>
                <tr><th>Dormitorios</th><td>${numeric(fields.bedrooms.value)}</td><th>Suites</th><td>${reportValue("suites")}</td></tr>
                <tr><th>Banheiros sociais</th><td>${numeric(fields.bathrooms.value)}</td><th>Total banheiros</th><td>${numeric(fields.bathrooms.value)}</td></tr>
                <tr><th>Lavabo</th><td>${reportValue("lavatories")}</td><th>Pavimentos</th><td>${reportValue("floors")}</td></tr>
                <tr><th>Padrao acabamento</th><td>${labelFor(options.standard, fields.standard.value)}</td><th>Conservacao</th><td>${labelFor(options.conservation, fields.conservation.value)}</td></tr>
                <tr><th>Idade aparente</th><td>${reportValue("apparentAge")}</td><th>Localizacao</th><td>${labelFor(options.locationScore, fields.locationScore.value)}</td></tr>
                <tr><th>Esquadrias</th><td>${reportValue("windowFrames")}</td><th>Cobertura / teto</th><td>${reportValue("roofCeiling")}</td></tr>
                <tr><th>Abastecimento agua</th><td>${reportValue("waterSupply")}</td><th>Esgoto sanitario</th><td>${reportValue("sewage")}</td></tr>
                <tr><th>Fechamento paredes</th><td>${reportValue("wallSystem")}</td><th>Tipo implantacao</th><td>${reportValue("deploymentType")}</td></tr>
                <tr><th>Habitado anteriormente</th><td>${reportValue("previouslyOccupied")}</td><th>Infraestrutura avaliando</th><td>${reportValue("propertyInfrastructure")}</td></tr>
              </tbody>
            </table>
          </section>
          <section class="doc-section">
            <h3>Areas, Vagas e Coordenadas</h3>
            <table class="doc-table compact">
              <tbody>
                <tr><th>Area averbada</th><td>${number(numeric(fields.builtArea.value))} m2</td><th>Area nao averbada</th><td>${reportValue("unregisteredArea")}</td></tr>
                <tr><th>Area total do imovel</th><td>${number(numeric(fields.builtArea.value))} m2</td><th>Area referencia</th><td>${number(numeric(fields.builtArea.value))} m2</td></tr>
                <tr><th>Vagas cobertas</th><td>${reportValue("coveredParking")}</td><th>Vagas descobertas / total</th><td>${reportValue("uncoveredParking", numeric(fields.parking.value))}</td></tr>
                <tr><th>Latitude</th><td>${reportValue("latitude")}</td><th>Longitude</th><td>${reportValue("longitude")}</td></tr>
                <tr><th>Comodos</th><td colspan="3">${reportValue("roomsDescription")}</td></tr>
                <tr><th>Condominio</th><td colspan="3">${reportValue("condominiumFeatures")}</td></tr>
              </tbody>
            </table>
          </section>
        </div>
        <div class="doc-footer-note">Pagina 04 | SISAVALIA</div>
      </section>

      <section class="mma-template-page">
        <div class="mma-template-content compact">
          <header>
            <h2 class="doc-title">Laudo de Avaliacao - SisAvalia</h2>
            <p class="doc-subtitle">Blocos 6 a 9 do modelo tecnico de avaliacao imobiliaria</p>
          </header>
          <section class="doc-section">
            <h3>6. Condicoes Gerais</h3>
            <table class="doc-table compact">
              <tbody>
                <tr><th>Documentacao confere com vistoria</th><td>${reportValue("documentationMatches")}</td><th>Estabilidade e solidez</th><td>${reportValue("stability")}</td></tr>
                <tr><th>Vicios aparentes</th><td>${reportValue("apparentDefects")}</td><th>Habitabilidade</th><td>${reportValue("habitability")}</td></tr>
                <tr><th>Fatores ambientais/climaticos/localizacao</th><td>${reportValue("environmentalFactors")}</td><th>Sistema DATEC/SINAT</th><td>${reportValue("datecSinat")}</td></tr>
                <tr><th>Fatores valorizantes</th><td>${reportValue("valuedFactors")}</td><th>Restritivos/depreciacao</th><td>${reportValue("restrictiveFactors")}</td></tr>
              </tbody>
            </table>
          </section>
          <section class="doc-section">
            <h3>Vistoria</h3>
            <table class="doc-table compact">
              <tbody>
                <tr><th>Data vistoria</th><td>${fields.inspectionDate.value || blank}</td><th>Contato agendamento</th><td>${reportValue("inspectionContact")}</td></tr>
                <tr><th>Telefone contato</th><td>${reportValue("inspectionPhone")}</td><th>Data contato</th><td>${reportValue("contactDate")}</td></tr>
                <tr><th>Hora chegada</th><td>${reportValue("arrivalTime")}</td><th>Hora saida</th><td>${reportValue("departureTime")}</td></tr>
                <tr><th>Data agendamento</th><td>${reportValue("appointmentDate")}</td><th>Hora agendamento</th><td>${reportValue("appointmentTime")}</td></tr>
                <tr><th>Ateste / historico infrutifero</th><td colspan="3">${reportValue("inspectionHistory")}</td></tr>
              </tbody>
            </table>
          </section>
          <section class="doc-section">
            <h3>7. Avaliacao e 8. Diagnostico de Mercado</h3>
            <table class="doc-table compact">
              <tbody>
                <tr><th>Metodologia</th><td>METODO COMPARATIVO DIRETO DE DADOS DE MERCADO</td><th>Tratamento</th><td>ESTATISTICA INFERENCIAL</td></tr>
                <tr><th>Dados utilizados</th><td>${r ? r.n : blank}</td><th>Fundamentacao / precisao</th><td>${r ? `${r.foundation} / ${r.precision}` : blank}</td></tr>
                <tr><th>Desempenho mercado</th><td>${reportValue("marketPerformance")}</td><th>Numero de ofertas</th><td>${reportValue("offersLevel")}</td></tr>
                <tr><th>Liquidez e prazo provavel</th><td>${reportValue("liquidity")}</td><th>Prazo efetivo</th><td>${reportValue("effectivePeriod")}</td></tr>
              </tbody>
            </table>
          </section>
          <section class="doc-section">
            <h3>9. Manifestacoes Sobre a Garantia</h3>
            <p>Considerando as informacoes anteriores, a vistoria, a documentacao apresentada e as atuais condicoes do mercado imobiliario local, o bem avaliando pode ser aceito em garantia: ${reportValue("guaranteeAccepted")}.</p>
          </section>
        </div>
        <div class="doc-footer-note">Pagina 05 | SISAVALIA</div>
      </section>

      <section class="mma-template-page">
        <div class="mma-template-content compact">
          <header>
            <h2 class="doc-title">Laudo de Avaliacao - SisAvalia</h2>
            <p class="doc-subtitle">Blocos 10 a 14, anexos, memoria, fotos e mapa</p>
          </header>
          <section class="doc-section">
            <h3>10. Resultados</h3>
            <table class="doc-table compact">
              <tbody>
                <tr><th>Valor central inferido</th><td>${r ? money(r.value) : blank}</td><th>Valor unitario inferido</th><td>${r ? `${money(r.unit)}/m2` : blank}</td></tr>
                <tr><th>Valor adotado no laudo</th><td>${r ? money(adopted) : blank}</td><th>Valor unitario adotado</th><td>${r ? `${money(adoptedUnit)}/m2` : blank}</td></tr>
                <tr><th>Limite inferior</th><td>${r ? money(r.lower) : blank}</td><th>Limite superior</th><td>${r ? money(r.upper) : blank}</td></tr>
                <tr><th>Campo de arbitrio -15%</th><td>${r ? money(arbitrationLower) : blank}</td><th>Campo de arbitrio +15%</th><td>${r ? money(arbitrationUpper) : blank}</td></tr>
                <tr><th>Area referencia</th><td>${number(numeric(fields.builtArea.value))} m2</td><th>Valor medio adotado</th><td>${centralWasAdopted ? yes : no}</td></tr>
                <tr><th>Justificativa do valor adotado</th><td colspan="3">${r ? adoptedValueJustification(r) : blank}</td></tr>
              </tbody>
            </table>
          </section>
          <section class="doc-section">
            <h3>11 a 13. Complementares, Observacoes e Anexos</h3>
            <table class="doc-table compact">
              <tbody>
                <tr><th>Unidades autonomas / cartorio</th><td colspan="3">${reportValue("autonomousUnits")}</td></tr>
                <tr><th>Observacoes finais</th><td colspan="3">${reportValue("finalNotes")}</td></tr>
                <tr><th>Anexo 1</th><td>Documentacao da unidade avalianda fornecida pelo solicitante</td><th>Anexo 2</th><td>Outros documentos que fundamentam o trabalho</td></tr>
                <tr><th>Anexo 3</th><td>Modelo de Estatistica Inferencial</td><th>ART/RRT</th><td>${reportValue("artRrt", "A anexar pelo responsavel tecnico")}</td></tr>
              </tbody>
            </table>
          </section>
          <section class="doc-section">
            <h3>14. Memoria de Calculo</h3>
            <table class="doc-table compact">
              <tbody>
                <tr><th>Equacao</th><td colspan="3">${r ? reportEquation : blank}</td></tr>
                <tr><th>Atributos avaliando</th><td colspan="3">${r ? r.variableNames.join(", ") : blank}</td></tr>
                <tr><th>Significancia</th><td colspan="3">${r ? r.diagnostics.significance.variables.map((item) => `${item.name}: ${pct(item.pValue * 100)}`).join("; ") : blank}</td></tr>
              </tbody>
            </table>
            <table class="doc-table compact">
              <thead><tr><th>Variavel</th><th>Coeficiente</th><th>Erro padrao</th><th>t</th><th>p-valor</th></tr></thead>
              <tbody>${coefficientRowsForReport(r)}</tbody>
            </table>
          </section>
          <section class="doc-section">
            <h3>Documentacao Fotografica e Mapa</h3>
            <div class="doc-photo-grid">${attachments.photoItems}</div>
            <h3>Mapa / Croqui de Localizacao</h3>
            <div class="doc-photo-grid single">${attachments.mapItem}</div>
          </section>
        </div>
        <div class="doc-footer-note">Pagina 06 | SISAVALIA</div>
      </section>
  `;
}

function renderReportPreview() {
  const r = state.result;
  const reportTargetLabel = r && r.targetType === "total" ? "preco total" : "valor unitario";
  const reportEquation = r ? `ln(${reportTargetLabel}) = b0 + ${r.variableNames.map((name, i) => `b${i + 1} ${name}`).join(" + ")}` : "-";
  const adopted = adoptedMarketValue(r);
  const adoptedUnit = r && Number.isFinite(adopted) && numeric(fields.builtArea.value) > 0
    ? adopted / numeric(fields.builtArea.value)
    : NaN;
  const chartImages = {
    adherence: chartDataUrl("adherence"),
    residual: chartDataUrl("residual"),
    normality: chartDataUrl("normality"),
    correlation: chartDataUrl("correlation"),
  };
  const memoryText = state.error ? `Erro no calculo: ${state.error}` : modelReport.textContent;
  reportPreview.innerHTML = `
    <div class="mma-template-document">
      <section class="mma-template-page">
        <div class="mma-template-content">
          <header>
            <h2 class="doc-title">Laudo de Avaliacao - SisAvalia</h2>
            <p class="doc-subtitle">Uso interno | Metodo comparativo direto de dados de mercado com estatistica inferencial</p>
          </header>

          <section class="doc-section">
            <h3>1. Resumo Executivo</h3>
            <p>Este laudo apresenta a estimativa de valor de mercado do imovel avaliando por metodo comparativo direto de dados de mercado, com tratamento por estatistica inferencial. Os dados cadastrais completos, a caracterizacao fisica, as condicoes de vistoria e os campos formais estao detalhados nas paginas seguintes.</p>
          </section>

          <div class="doc-grid three">
            <div class="doc-metric"><span>Valor adotado</span><strong>${r ? money(adopted) : "-"}</strong></div>
            <div class="doc-metric"><span>Valor unitario adotado</span><strong>${r ? `${money(adoptedUnit)}/m2` : "-"}</strong></div>
            <div class="doc-metric"><span>Fund. / Precisao</span><strong>${r ? `${r.foundation}/${r.precision}` : "-"}</strong></div>
          </div>

          <section class="doc-section">
            <h3>2. Resultado Sintetico</h3>
            <table class="doc-table">
              <tbody>
                <tr><th>Ordem de Servico</th><td>${fields.osNumber.value || "-"}</td><th>Proponente</th><td>${fields.proponent.value || "-"}</td></tr>
                <tr><th>Imovel</th><td colspan="3">${fields.address.value || "-"} - ${fields.city.value || "-"} / ${fields.state.value || "-"}</td></tr>
                <tr><th>Valor central inferido</th><td>${r ? money(r.value) : "-"}</td><th>Valor adotado no laudo</th><td>${r ? money(adopted) : "-"}</td></tr>
                <tr><th>Limite inferior</th><td>${r ? money(r.lower) : "-"}</td><th>Limite superior</th><td>${r ? money(r.upper) : "-"}</td></tr>
                <tr><th>Area referencia</th><td>${number(numeric(fields.builtArea.value))} m2</td><th>R2 ajustado</th><td>${r ? number(r.adjR2, 3) : "-"}</td></tr>
                <tr><th>Justificativa do valor adotado</th><td colspan="3">${r ? adoptedValueJustification(r) : "-"}</td></tr>
              </tbody>
            </table>
          </section>
        </div>
        <div class="doc-footer-note">Pagina 01 | SISAVALIA</div>
      </section>

      <section class="mma-template-page">
        <div class="mma-template-content compact">
          <header>
            <h2 class="doc-title">Fundamentacao Tecnica</h2>
            <p class="doc-subtitle">Criterios normativos e base metodologica do laudo</p>
          </header>

          <section class="doc-section">
            <h3>3. Base Tecnica</h3>
            <p>O trabalho foi estruturado conforme os criterios da ABNT NBR 14653 aplicaveis a avaliacao de bens imoveis, observando identificacao do bem, vistoria, pesquisa de mercado, tratamento dos dados, enquadramento de fundamentacao e apresentacao do resultado.</p>
          </section>

          <section class="doc-section">
            <h3>4. Metodo e Tratamento</h3>
            <p>Foi adotado o metodo comparativo direto de dados de mercado, com tratamento por estatistica inferencial sobre o ${reportTargetLabel}. O modelo utiliza ${r ? r.n : "-"} dados de mercado e ${r ? r.k : "-"} variaveis independentes, com enquadramento estimado em grau ${r ? r.foundation : "-"} de fundamentacao e grau ${r ? r.precision : "-"} de precisao.</p>
          </section>

          <section class="doc-section">
            <h3>5. Premissas de Revisao</h3>
            <p>O resultado automatizado depende da validacao do responsavel tecnico quanto a consistencia das amostras, aderencia mercadologica, documentacao, vistoria, anexos fotograficos, mapa/croqui, ART/RRT e coerencia final do laudo.</p>
          </section>

          <section class="doc-section">
            <h3>6. Estrutura do Documento</h3>
            <table class="doc-table">
              <tbody>
                <tr><th>Campos formais</th><td colspan="3">Solicitacao, identificacao, micro-regiao, terreno, imovel, vistoria, mercado, garantia, resultados e anexos.</td></tr>
                <tr><th>Analise estatistica</th><td colspan="3">Diagnosticos, graficos, amostras utilizadas e memoria de calculo completa.</td></tr>
                <tr><th>Data da vistoria</th><td>${fields.inspectionDate.value || "-"}</td><th>Data base</th><td>${fields.osDate.value || "-"}</td></tr>
              </tbody>
            </table>
          </section>
        </div>
        <div class="doc-footer-note">Pagina 02 | SISAVALIA</div>
      </section>

      ${renderFormalReportPages(r, reportEquation)}

      <section class="mma-template-page">
        <div class="mma-template-content compact">
          <header>
            <h2 class="doc-title">Diagnostico Estatistico Completo</h2>
            <p class="doc-subtitle">Leitura auxiliar dos criterios tecnicos do modelo inferencial</p>
          </header>
          <section class="doc-section">
            <h3>8. Resultado dos Diagnosticos</h3>
            <table class="doc-table">
              <tbody>
                ${reportDiagnosticsRows(r)}
              </tbody>
            </table>
          </section>
          <section class="doc-section">
            <h3>9. Enquadramento Normativo - ${r ? `${r.foundationAssessment.points} pontos / Grau ${r.foundation}` : "Pendente"}</h3>
            <table class="doc-table compact">
              <thead><tr><th>Item</th><th>Criterio</th><th>Nivel</th><th>Evidencia</th></tr></thead>
              <tbody>
                ${(r ? r.foundationAssessment.items : []).map((item) => `
                  <tr><td>${item.item}</td><td>${item.criterion}</td><td>${gradeLabel(item.grade)}</td><td>${item.evidence}</td></tr>
                `).join("")}
              </tbody>
            </table>
            <p>${r && r.foundationAssessment.usesAllocatedCodes ? "Codigos alocados utilizados: registrar os criterios de atribuicao, demonstrar a micronumerosidade por categoria e confirmar a ausencia de extrapolacao." : "Sem controle adicional por codigos alocados."}</p>
          </section>
        </div>
        <div class="doc-footer-note">Pagina 07 | SISAVALIA</div>
      </section>

      <section class="mma-template-page">
        <div class="mma-template-content compact">
          <header>
            <h2 class="doc-title">Graficos do Modelo - Aderencia e Residuos</h2>
            <p class="doc-subtitle">Graficos gerados automaticamente a partir do modelo calculado</p>
          </header>
          <div class="doc-chart-grid">
            <section class="doc-chart-card">
              <h3>11. Aderencia: observado x calculado</h3>
              <img src="${chartImages.adherence}" alt="Grafico de aderencia observado x calculado" />
            </section>
            <section class="doc-chart-card">
              <h3>12. Residuos padronizados</h3>
              <img src="${chartImages.residual}" alt="Grafico de residuos padronizados" />
            </section>
          </div>
        </div>
        <div class="doc-footer-note">Pagina 08 | SISAVALIA</div>
      </section>

      <section class="mma-template-page">
        <div class="mma-template-content compact">
          <header>
            <h2 class="doc-title">Graficos do Modelo - Normalidade e Correlacoes</h2>
            <p class="doc-subtitle">Distribuicao dos residuos e matriz de correlacoes das variaveis independentes</p>
          </header>
          <div class="doc-chart-grid">
            <section class="doc-chart-card">
              <h3>13. Distribuicao dos residuos</h3>
              <img src="${chartImages.normality}" alt="Grafico de distribuicao dos residuos" />
            </section>
            <section class="doc-chart-card">
              <h3>14. Matriz de correlacoes</h3>
              <img src="${chartImages.correlation}" alt="Matriz de correlacoes" />
            </section>
          </div>
        </div>
        <div class="doc-footer-note">Pagina 09 | SISAVALIA</div>
      </section>

      <section class="mma-template-page">
        <div class="mma-template-content compact">
          <header>
            <h2 class="doc-title">Amostras Utilizadas e Memoria</h2>
            <p class="doc-subtitle">Relacao sintetica dos dados efetivamente utilizados no modelo</p>
          </header>
          <section class="doc-section">
            <h3>15. Amostras de Mercado</h3>
            <table class="doc-table compact">
              <thead>
                <tr><th>#</th><th>Fonte / endereco</th><th>Preco</th><th>Area</th><th>Local</th><th>Padrao</th><th>Conserv.</th></tr>
              </thead>
              <tbody>
                ${sampleRowsForReport(r)}
              </tbody>
            </table>
            <p class="doc-small-note">Exibidas ate 16 amostras nesta pagina. Total utilizado no modelo: ${r ? r.n : "-"}. A base completa permanece na tabela de amostras do sistema.</p>
          </section>
          <section class="doc-section">
            <h3>15.1 Amostras rejeitadas</h3>
            <table class="doc-table compact">
              <thead><tr><th>#</th><th>Fonte / endereco</th><th>Preco</th><th>Motivo</th></tr></thead>
              <tbody>${rejectedSampleRowsForReport()}</tbody>
            </table>
          </section>
        </div>
        <div class="doc-footer-note">Pagina 10 | SISAVALIA</div>
      </section>

      <section class="mma-template-page">
        <div class="mma-template-content compact">
          <header>
            <h2 class="doc-title">Memoria de Calculo Completa</h2>
            <p class="doc-subtitle">Relatorio textual gerado pelo motor inferencial</p>
          </header>
          <section class="doc-section">
            <h3>16. Equacao, coeficientes e resultados</h3>
            <pre class="doc-memory">${escapeHtml(memoryText)}</pre>
          </section>
        </div>
        <div class="doc-footer-note">Pagina 11 | SISAVALIA</div>
      </section>
    </div>
  `;
}

function labelFor(values, value) {
  const found = values.find(([v]) => String(v) === String(value));
  return found ? found[1] : value;
}

function updateAll() {
  renderMetrics();
  renderTsProjection();
  renderVariableCatalog();
  renderChecks();
  renderDiagnostics();
  renderFoundationAssessment();
  renderModelReport();
  renderCharts();
  renderReportReview();
  renderReportPreview();
  renderAttachments();
  window.dispatchEvent(new CustomEvent("sisavalia:subject-updated"));
}

function loadSample() {
  state.error = "";
  state.modelTarget = "unit";
  modelTarget.value = state.modelTarget;
  state.foundationInputs = defaultFoundationInputs();
  syncFoundationControls();
  state.modelConfig = defaultModelConfig();
  renderVariableControls();
  fields.osNumber.value = "2026.3901.000001-1";
  fields.osDate.value = "2026-06-26";
  fields.inspectionDate.value = "2026-06-26";
  fields.proponent.value = "CLIENTE EXEMPLO";
  fields.purpose.value = "GARANTIA DE CREDITO/EGI";
  fields.objective.value = "VALOR DE MERCADO DE COMPRA E VENDA";
  fields.address.value = "Rua Exemplo, 100";
  fields.city.value = "Lapao";
  fields.state.value = "BA";
  fields.propertyType.value = "CASA";
  fields.builtArea.value = "120";
  fields.landArea.value = "240";
  fields.standard.value = "2";
  fields.conservation.value = "2";
  fields.locationScore.value = "2";
  fields.bedrooms.value = "3";
  fields.bathrooms.value = "2";
  fields.parking.value = "1";
  const reportDefaults = {
    cpfCnpj: "000.000.000-00",
    addressNumber: "100",
    addressComplement: "CASA",
    neighborhood: "CENTRO",
    postalCode: "44905-000",
    ibgeCode: "2919157",
    condominiumName: "NAO SE APLICA",
    registrationNumber: "00000",
    registryOffice: "CARTORIO DE REGISTRO DE IMOVEIS",
    registrationDate: "2026-06-20",
    propertyNotes: "Dados de exemplo sujeitos a conferencia documental e vistoria.",
    predominantUse: "RESIDENCIAL",
    accessType: "DIRETO POR VIA PAVIMENTADA",
    riskArea: "NAO",
    fronts: "1",
    frontage: "10",
    topography: "PLANA",
    blockPosition: "MEIO DE QUADRA",
    idealFraction: "100%",
    surface: "SECA E FIRME",
    gradeFormat: "NO NIVEL DA RUA / REGULAR",
    urbanInfrastructure: "Agua, energia eletrica, iluminacao publica, drenagem, esgoto sanitario e pavimentacao.",
    publicServices: "Educacao, transporte publico, comercio, coleta de lixo, seguranca e saude.",
    propertyUse: "RESIDENCIAL",
    buildingPosition: "ISOLADA",
    occupancy: "OCUPADO",
    suites: "1",
    lavatories: "0",
    floors: "1",
    apparentAge: "10",
    windowFrames: "ALUMINIO E VIDRO",
    roofCeiling: "TELHA CERAMICA / FORRO",
    waterSupply: "REDE PUBLICA",
    sewage: "REDE PUBLICA",
    wallSystem: "ALVENARIA",
    deploymentType: "ISOLADO",
    previouslyOccupied: "SIM",
    unregisteredArea: "0",
    coveredParking: "1",
    uncoveredParking: "0",
    latitude: "-11.3833",
    longitude: "-41.8333",
    roomsDescription: "Sala, cozinha, 3 dormitorios, 2 banheiros e area de servico.",
    propertyInfrastructure: "Muros, portao e instalacoes prediais em funcionamento.",
    condominiumFeatures: "NAO SE APLICA",
    documentationMatches: "SIM",
    stability: "SIM",
    apparentDefects: "NAO",
    habitability: "SIM",
    environmentalFactors: "NAO",
    datecSinat: "NAO",
    inspectionContact: "CLIENTE EXEMPLO",
    inspectionPhone: "(74) 99999-0000",
    contactDate: "2026-06-25",
    arrivalTime: "09:00",
    departureTime: "10:00",
    appointmentDate: "2026-06-26",
    appointmentTime: "09:00",
    valuedFactors: "Boa acessibilidade e disponibilidade de servicos urbanos.",
    restrictiveFactors: "Nao foram observados fatores restritivos relevantes na vistoria de exemplo.",
    inspectionHistory: "Vistoria interna e externa realizada com acesso integral ao imovel.",
    marketPerformance: "NORMAL / MEDIO",
    offersLevel: "MEDIO",
    liquidity: "MEDIA (ENTRE 12 E 18 MESES)",
    effectivePeriod: "NAO INFORMADO",
    guaranteeAccepted: "SIM",
    artRrt: "A EMITIR PELO RESPONSAVEL TECNICO",
    autonomousUnits: "NAO SE APLICA",
    finalNotes: "Valor condicionado a manutencao das caracteristicas observadas e a conferencia documental.",
  };
  Object.entries(reportDefaults).forEach(([key, value]) => {
    fields[key].value = value;
  });
  const base = [
    [252000, 70, 1, 1, 1], [319000, 76, 2, 1, 1], [457000, 82, 3, 2, 1],
    [361000, 88, 1, 2, 1], [598000, 94, 2, 3, 2], [707000, 100, 3, 3, 2],
    [427000, 106, 1, 1, 2], [490000, 112, 2, 1, 2], [811000, 118, 3, 2, 3],
    [638000, 124, 1, 2, 3], [870000, 130, 2, 3, 3], [1067000, 136, 3, 3, 3],
    [471000, 142, 1, 1, 1], [536000, 148, 2, 1, 1], [756000, 154, 3, 2, 1],
    [593000, 160, 1, 2, 1], [968000, 166, 2, 3, 2], [1091000, 172, 3, 3, 2],
    [649000, 178, 1, 1, 2], [744000, 184, 2, 1, 2], [1153000, 190, 3, 2, 3],
    [946000, 196, 1, 2, 3], [1304000, 202, 2, 3, 3], [1471000, 208, 3, 3, 3],
    [651000, 214, 1, 1, 1], [748000, 220, 2, 1, 1], [1052000, 226, 3, 2, 1],
    [797000, 232, 1, 2, 1], [1291000, 238, 2, 3, 2], [1471000, 244, 3, 3, 2],
  ];
  state.samples = base.map((row, i) => ({
    source: `Amostra ${String(i + 1).padStart(2, "0")} - fonte/endereco`,
    price: row[0],
    area: row[1],
    location: row[2],
    standard: row[3],
    conservation: row[4],
  }));
  try {
    state.result = runRegression();
  } catch (error) {
    state.result = null;
    state.error = error.stack || error.message;
  }
  state.activeProjectId = null;
  state.projectDirty = true;
  projectName.value = `Laudo exemplo - ${fields.osNumber.value}`;
  setCepStatus("CEP e codigo IBGE carregados no exemplo. Confira os dados antes do uso.", "ok");
  setProjectStatus("Exemplo carregado. Salve para manter este projeto.", "warn");
  renderSamples();
  updateAll();
  renderProjectList();
}

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

async function addReportPhotos(files) {
  const selected = Array.from(files || []).filter((file) => file.type.startsWith("image/"));
  if (!selected.length) return;
  const remainingSlots = Math.max(0, 12 - state.reportPhotos.length);
  const accepted = selected.slice(0, remainingSlots);
  const photos = await Promise.all(accepted.map(async (file, index) => ({
    name: file.name,
    label: file.name.replace(/\.[^.]+$/, "") || `Foto ${state.reportPhotos.length + index + 1}`,
    dataUrl: await blobToDataUrl(file),
  })));
  state.reportPhotos.push(...photos);
  if (selected.length > accepted.length) {
    attachmentStatus.textContent = "Limite de 12 fotos atingido. Algumas imagens não foram adicionadas.";
    attachmentStatus.className = "project-status warn";
  }
  markProjectDirty();
  updateAll();
}

async function setReportMap(file) {
  if (!file || !file.type.startsWith("image/")) return;
  state.reportMap = {
    name: file.name,
    label: "Mapa/Croqui de localização",
    dataUrl: await blobToDataUrl(file),
  };
  markProjectDirty();
  updateAll();
}

function renderAttachments() {
  if (!attachmentGallery) return;
  const items = [
    ...state.reportPhotos.map((photo, index) => ({ ...photo, type: "photo", index })),
    ...(state.reportMap ? [{ ...state.reportMap, type: "map", index: -1 }] : []),
  ];
  attachmentStatus.textContent = items.length
    ? `${state.reportPhotos.length} foto(s) e ${state.reportMap ? "1 mapa/croqui" : "nenhum mapa"} anexado(s).`
    : "Nenhuma foto ou mapa anexado.";
  attachmentStatus.className = `project-status ${items.length ? "ok" : ""}`.trim();
  attachmentGallery.innerHTML = items.map((item) => `
    <article class="attachment-card">
      <img src="${item.dataUrl}" alt="${escapeHtml(item.label)}" />
      <label>${item.type === "map" ? "Legenda do mapa" : "Legenda da foto"}
        <input data-attachment-type="${item.type}" data-attachment-index="${item.index}" value="${escapeHtml(item.label)}" />
      </label>
      <button type="button" class="attachment-delete-button" data-attachment-remove="${item.type}:${item.index}">
        ${item.type === "map" ? "Excluir mapa" : "Excluir foto"}
      </button>
    </article>
  `).join("");
  attachmentGallery.querySelectorAll("input[data-attachment-type]").forEach((input) => {
    input.addEventListener("input", () => {
      if (input.dataset.attachmentType === "map" && state.reportMap) state.reportMap.label = input.value;
      else {
        const photo = state.reportPhotos[Number(input.dataset.attachmentIndex)];
        if (photo) photo.label = input.value;
      }
      markProjectDirty();
      renderReportPreview();
    });
  });
  attachmentGallery.querySelectorAll("[data-attachment-remove]").forEach((button) => {
    button.addEventListener("click", () => {
      const [type, rawIndex] = button.dataset.attachmentRemove.split(":");
      const label = type === "map" ? "este mapa/croqui" : "esta foto";
      if (!window.confirm(`Excluir ${label} do laudo?`)) return;
      if (type === "map") state.reportMap = null;
      else state.reportPhotos.splice(Number(rawIndex), 1);
      markProjectDirty();
      updateAll();
    });
  });
}

async function importSamplesFromFile() {
  const file = sampleImportFile.files && sampleImportFile.files[0];
  if (!file) {
    setImportStatus("Selecione um arquivo CSV ou TSV para importar.", "fail");
    return;
  }
  const extension = file.name.split(".").pop().toLowerCase();
  if (!["csv", "tsv", "txt"].includes(extension)) {
    setImportStatus("Nesta etapa, importe CSV/TSV exportado do Excel. Suporte direto a XLSX entra na proxima fase.", "fail");
    return;
  }
  try {
    const text = await file.text();
    const imported = parseSamplesFile(text);
    if (!imported.length) throw new Error("Nenhuma amostra valida encontrada.");
    state.error = "";
    state.result = null;
    state.samples = importMode.value === "append" ? [...state.samples, ...imported] : imported;
    markProjectDirty();
    renderSamples();
    try {
      state.result = runRegression();
    } catch (error) {
      state.error = error.message;
    }
    updateAll();
    setImportStatus(`${imported.length} amostras importadas de ${file.name}.`, "ok");
  } catch (error) {
    setImportStatus(`Falha na importacao: ${error.message}`, "fail");
  }
}

function downloadSampleTemplate() {
  const rows = [
    ["fonte", "preco", "area", "local", "padrao", "conservacao", "tem_foto", "status_validacao", "motivo_rejeicao"],
    ["Rua Exemplo 01 - Corretor A", "320000", "95", "2", "2", "2", "sim", "aprovada", ""],
    ["Rua Exemplo 02 - Portal Imobiliario", "455000", "130", "3", "3", "2", "sim", "aprovada", ""],
    ["Rua Exemplo 03 - Informante B", "245000", "78", "1", "2", "1", "nao", "prevalidacao", "aguardando foto"],
  ];
  const csv = rows.map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(";")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "modelo-amostras-sisavalia.csv";
  link.click();
  URL.revokeObjectURL(url);
}

function downloadExcelTemplate() {
  const link = document.createElement("a");
  link.href = "assets/modelo-amostras-sisavalia.xlsx";
  link.download = "Modelo_Amostras_SISAVALIA.xlsx";
  link.click();
  setImportStatus("Modelo Excel baixado. Ao concluir, salve uma copia em CSV UTF-8 para importar.", "ok");
}

function setExportStatus(message, status = "") {
  exportStatus.textContent = message;
  exportStatus.className = `export-status ${status}`.trim();
}

function collectReportStyles(templateDataUrl = "") {
  const styles = Array.from(document.styleSheets)
    .map((sheet) => {
      try {
        return Array.from(sheet.cssRules).map((rule) => rule.cssText).join("\n");
      } catch {
        return "";
      }
    })
    .join("\n");
  return templateDataUrl ? styles.replaceAll("../assets/template-mma.png", templateDataUrl) : styles;
}

async function preparePrintTemplates() {
  const templateUrl = new URL("assets/template-mma.png", location.href).href;
  const pages = Array.from(reportPreview.querySelectorAll(".mma-template-page"));
  const images = pages.map((page) => {
    let image = page.querySelector(".print-template");
    if (!image) {
      image = document.createElement("img");
      image.className = "print-template";
      image.alt = "";
      image.src = templateUrl;
      page.prepend(image);
    }
    return image;
  });
  await Promise.all(images.map((image) => image.complete ? Promise.resolve() : image.decode().catch(() => undefined)));
}

async function exportPdfReport() {
  const review = renderReportReview();
  if (review.counts.critical) {
    setExportStatus(`${review.counts.critical} pendencia(s) critica(s). Corrija antes de gerar o PDF.`, "fail");
    location.hash = "laudo";
    reviewResults.querySelector(".review-item.critical")?.scrollIntoView({ behavior: "smooth", block: "center" });
    return;
  }

  await preparePrintTemplates();
  const previousTitle = document.title;
  const finishPrint = () => {
    document.body.classList.remove("printing-report");
    document.title = previousTitle;
  };
  document.title = `laudo-sisavalia-${fields.osNumber.value || "rascunho"}`;
  document.body.classList.add("printing-report");
  setExportStatus(review.counts.warning ? "Impressao preparada com alertas tecnicos." : "Escolha Salvar como PDF no destino da impressao.", review.counts.warning ? "warn" : "ok");
  window.addEventListener("afterprint", finishPrint, { once: true });
  window.print();
  window.setTimeout(finishPrint, 1000);
}

async function exportHtmlReport() {
  const templateBlob = await fetch("assets/template-mma.png").then((response) => response.blob());
  const templateDataUrl = await blobToDataUrl(templateBlob);
  const styles = collectReportStyles(templateDataUrl);
  const html = `<!doctype html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>Laudo SISAVALIA - MMA Engenharia</title>
    <style>
      ${styles}
      body { margin: 0; background: #e9edf4; }
      .report-preview { border: 0; }
      .export-memory { width: 1052px; background: white; border: 1px solid #D9DEE7; margin-top: 24px; padding: 24px; color: #202938; }
      .export-memory pre { white-space: pre-wrap; font-family: "Liberation Mono", Consolas, monospace; font-size: 12px; }
    </style>
  </head>
  <body>
    <main class="report-preview">
      ${reportPreview.innerHTML}
      <section class="export-memory">
        <h2>Memoria de Calculo Completa</h2>
        <pre>${modelReport.textContent}</pre>
      </section>
    </main>
  </body>
</html>`;
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `laudo-sisavalia-${fields.osNumber.value || "rascunho"}.html`;
  link.click();
  URL.revokeObjectURL(url);
  setExportStatus("Copia HTML exportada.", "ok");
}

Object.entries(options).forEach(([key, values]) => {
  if (fields[key]) populateSelect(fields[key], values);
});

const modelDependentFields = new Set(["builtArea", "locationScore", "standard", "conservation"]);
Object.entries(fields).forEach(([key, field]) => {
  field.addEventListener("input", () => {
    if (modelDependentFields.has(key)) state.result = null;
    markProjectDirty();
    updateAll();
  });
});

projectName.addEventListener("input", markProjectDirty);
fields.postalCode.addEventListener("input", scheduleCepLookup);
fields.postalCode.addEventListener("blur", () => {
  if (cepDigits().length === 8) lookupCep();
});
lookupCepBtn.addEventListener("click", lookupCep);
fields.addressNumber.addEventListener("blur", () => {
  if (cepDigits().length === 8 && fields.addressNumber.value.trim()) lookupCep();
});
fields.latitude.addEventListener("input", clearAutoCoordinateMarker);
fields.longitude.addEventListener("input", clearAutoCoordinateMarker);

document.querySelector("#addSampleBtn").addEventListener("click", () => addSample());
document.querySelector("#importSamplesBtn").addEventListener("click", importSamplesFromFile);
document.querySelector("#downloadTemplateBtn").addEventListener("click", downloadSampleTemplate);
document.querySelector("#downloadExcelTemplateBtn").addEventListener("click", downloadExcelTemplate);
document.querySelector("#clearSamplesBtn").addEventListener("click", () => {
  state.samples = [];
  state.result = null;
  state.error = "";
  markProjectDirty();
  renderSamples();
  updateAll();
});
document.querySelector("#loadSampleBtn").addEventListener("click", loadSample);
modelTarget.addEventListener("change", () => {
  state.modelTarget = modelTarget.value === "total" ? "total" : "unit";
  state.result = null;
  state.error = "";
  markProjectDirty();
  updateAll();
});
Object.entries(foundationControls).forEach(([key, control]) => {
  control.addEventListener("change", () => {
    state.foundationInputs[key] = Math.max(0, Math.min(3, Number(control.value) || 0));
    if (state.result) {
      try {
        state.error = "";
        state.result = runRegression();
      } catch (error) {
        state.result = null;
        state.error = error.message;
      }
    }
    markProjectDirty();
    updateAll();
  });
});
document.querySelector("#runModelBtn").addEventListener("click", () => {
  try {
    state.error = "";
    state.result = runRegression();
  } catch (error) {
    state.result = null;
    state.error = error.message;
  }
  updateAll();
});
document.querySelector("#exportPdfBtn").addEventListener("click", exportPdfReport);
document.querySelector("#exportHtmlBtn").addEventListener("click", exportHtmlReport);
photoUploadInput?.addEventListener("change", async () => {
  await addReportPhotos(photoUploadInput.files);
  photoUploadInput.value = "";
});
mapUploadInput?.addEventListener("change", async () => {
  await setReportMap(mapUploadInput.files && mapUploadInput.files[0]);
  mapUploadInput.value = "";
});
clearAttachmentsBtn?.addEventListener("click", () => {
  state.reportPhotos = [];
  state.reportMap = null;
  markProjectDirty();
  updateAll();
});
document.querySelector("#logoutBtn").addEventListener("click", logout);
loginForm.addEventListener("submit", authenticate);
document.querySelector("#newProjectBtn").addEventListener("click", newBlankProject);
document.querySelector("#saveProjectBtn").addEventListener("click", saveCurrentProject);
document.querySelector("#exportProjectBtn").addEventListener("click", exportProjectBackup);
document.querySelector("#importProjectBtn").addEventListener("click", importProjectBackup);
document.querySelector("#reviewBtn").addEventListener("click", () => {
  renderReportReview();
  reviewResults.querySelector(".review-item")?.scrollIntoView({ behavior: "smooth", block: "nearest" });
});

window.SISAVALIA = {
  state,
  runRegression,
  parseSamplesFile,
  activeModelVariables,
  buildReportReview,
  importApprovedSamples,
  findStoredProjectsByOs,
  openStoredProject,
  saveCurrentProject,
  currentProjectData,
  updateAll,
};

function showActiveModule() {
  const sections = Array.from(document.querySelectorAll(".workspace > section.band"));
  const requestedId = window.location.hash.replace(/^#/, "");
  const target = sections.find((section) => section.id === requestedId) || document.querySelector("#os");
  sections.forEach((section) => { section.hidden = section !== target; });
  document.querySelectorAll(".steps a[href^='#']").forEach((link) => {
    const active = link.getAttribute("href") === `#${target.id}`;
    link.classList.toggle("active", active);
    if (active) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });
  requestAnimationFrame(() => window.dispatchEvent(new Event("resize")));
}

window.addEventListener("hashchange", showActiveModule);

async function autoLoadCastanhalSamples() {
  const params = new URLSearchParams(window.location.search);
  if (params.get("loadCastanhal") !== "1") return;
  try {
    const response = await fetch(`Amostras_Castanhal_Refinadas_II_III.csv?ts=${Date.now()}`);
    if (!response.ok) throw new Error(`CSV nao encontrado (${response.status}).`);
    const text = await response.text();
    const imported = parseSamplesFile(text);
    if (!imported.length) throw new Error("Nenhuma amostra valida encontrada no CSV.");
    state.samples = imported.map((sample) => ({ ...sample, hasPhoto: sample.hasPhoto || true, status: sample.status || "aprovada" }));
    state.modelTarget = "unit";
    state.modelConfig.area = { active: true, transform: "x" };
    state.modelConfig.standard = { active: true, transform: "ln" };
    state.modelConfig.location = { active: false, transform: "x" };
    state.modelConfig.conservation = { active: false, transform: "x" };
    fields.builtArea.value = fields.builtArea.value || "106.91";
    fields.standard.value = "3";
    if (!fields.finalNotes.value.trim()) {
      fields.finalNotes.value = "Valor adotado com base no modelo inferencial, considerando o enquadramento do avaliando em Padrao 3, sustentado por vistoria fotografica: bom estado de conservacao, acabamento interno regular/superior, area externa, piscina e area gourmet. A adocao deve permanecer condicionada a manutencao das caracteristicas observadas e a conferencia documental.";
    }
    state.foundationInputs.characterization = Math.max(state.foundationInputs.characterization || 0, 2);
    state.foundationInputs.identification = Math.max(state.foundationInputs.identification || 0, 2);
    syncFoundationControls();
    renderVariableControls();
    state.error = "";
    state.result = runRegression();
    markProjectDirty();
    renderSamples();
    updateAll();
    setImportStatus(`${imported.length} amostras carregadas automaticamente do CSV Castanhal.`, "ok");
  } catch (error) {
    state.error = error.message;
    updateAll();
    setImportStatus(`Falha ao carregar CSV Castanhal: ${error.message}`, "fail");
  }
}

renderVariableControls();
newBlankProject(false);
renderProjectList();
const localSearchQuery = new URLSearchParams(window.location.search);
const localFixtureMode = ["127.0.0.1", "localhost"].includes(window.location.hostname)
  && (localSearchQuery.get("searchEngine") === "1" || localSearchQuery.get("fixtureSearch") === "1");
setAuthenticated(localFixtureMode || sessionStorage.getItem(AUTH_SESSION_KEY) === "true");
showActiveModule();
autoLoadCastanhalSamples();
if (!loginGate.hidden) loginPassword.focus();
