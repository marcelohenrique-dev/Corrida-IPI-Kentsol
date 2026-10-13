const HEADERS = [
  "Data de inscrição",
  "Nome completo",
  "WhatsApp",
  "Cidade",
  "Possui piscina",
  "Intenção de uso do prêmio",
  "Interesse em outras soluções",
  "Aceitou o regulamento",
  "Ciente da Política de Privacidade",
  "Aceitou contato comercial",
  "Versão da política"
];

const POOL_ANSWERS = [
  "Sim, tenho piscina",
  "Não tenho, mas conheço alguém que possui",
  "Estou construindo"
];

const PRIZE_INTENTIONS = [
  "Instalar na minha piscina",
  "Presentear ou indicar alguém que tenha piscina"
];

const PRODUCT_INTERESTS = [
  "Aquecimento solar para banho (Boiler)",
  "Pressurização de água",
  "Trocadores de calor para piscina",
  "Nenhuma no momento"
];

function doPost(event) {
  try {
    const registration = validateRegistration(event);
    const lock = LockService.getScriptLock();
    if (!lock.tryLock(10000)) {
      throw new Error("A planilha está ocupada. Tente novamente.");
    }

    try {
      const sheet = getResponseSheet();
      ensureHeaders(sheet);
      sheet.appendRow([
        new Date(),
        safeCell(registration.name),
        safeCell(registration.whatsapp),
        safeCell(registration.city),
        safeCell(registration.pool),
        safeCell(registration.intention),
        safeCell(registration.interests.join(", ")),
        true,
        true,
        registration.marketingConsent,
        "sorteio-ipi-2026-minuta"
      ]);
    } finally {
      lock.releaseLock();
    }

    return responsePage(
      "Inscrição enviada",
      "Recebemos sua inscrição no sorteio Kentsol. Boa sorte!",
      false
    );
  } catch (error) {
    console.error(error && error.stack ? error.stack : error);
    return responsePage(
      "Não foi possível concluir a inscrição",
      "Nenhuma confirmação foi registrada. Tente novamente mais tarde ou entre em contato com a Kentsol pelo WhatsApp (17) 3312-0964.",
      true
    );
  }
}

function validateRegistration(event) {
  if (!event || !event.parameter || !event.parameters) {
    throw new Error("Dados do formulário ausentes.");
  }

  const fields = event.parameter;
  const interests = event.parameters.interesses || [];
  const name = textValue(fields.nome, 120);
  const whatsapp = textValue(fields.whatsapp, 24);
  const city = textValue(fields.cidade, 100);
  const pool = textValue(fields.piscina, 80);
  const intention = textValue(fields.usoPremio, 100);

  if (fields.website) {
    throw new Error("Solicitação inválida.");
  }
  if (name.length < 3 || ![10, 11].includes(whatsapp.replace(/\D/g, "").length) || city.length < 2) {
    throw new Error("Dados obrigatórios inválidos.");
  }
  if (!POOL_ANSWERS.includes(pool) || !PRIZE_INTENTIONS.includes(intention)) {
    throw new Error("Resposta obrigatória inválida.");
  }
  if (fields.regulationAccepted !== "on" || fields.privacyAccepted !== "on") {
    throw new Error("As autorizações obrigatórias estão ausentes.");
  }
  if (
    interests.length > PRODUCT_INTERESTS.length ||
    interests.some(function (interest) { return !PRODUCT_INTERESTS.includes(interest); }) ||
    (interests.includes("Nenhuma no momento") && interests.length > 1)
  ) {
    throw new Error("Seleção de interesses inválida.");
  }

  return {
    name: name,
    whatsapp: whatsapp,
    city: city,
    pool: pool,
    intention: intention,
    interests: interests,
    marketingConsent: fields.marketingConsent === "Sim"
  };
}

function textValue(value, maxLength) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
}

function safeCell(value) {
  const text = String(value);
  return /^[=+\-@]/.test(text) ? "'" + text : text;
}

function getResponseSheet() {
  const properties = PropertiesService.getScriptProperties();
  const spreadsheetId = properties.getProperty("SPREADSHEET_ID");
  const tabId = Number(properties.getProperty("SHEET_TAB_ID"));

  if (!spreadsheetId || !Number.isInteger(tabId)) {
    throw new Error("Configure SPREADSHEET_ID e SHEET_TAB_ID nas propriedades do script.");
  }

  const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  const sheet = spreadsheet.getSheets().find(function (candidate) {
    return candidate.getSheetId() === tabId;
  });
  if (!sheet) {
    throw new Error("A aba configurada da planilha não foi encontrada.");
  }
  return sheet;
}

function ensureHeaders(sheet) {
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    return;
  }

  const currentHeaders = sheet.getRange(1, 1, 1, HEADERS.length).getDisplayValues()[0];
  if (HEADERS.some(function (header, index) { return currentHeaders[index] !== header; })) {
    throw new Error("A aba selecionada não está vazia e seus cabeçalhos não correspondem aos do formulário.");
  }
}

function responsePage(title, message, isError) {
  const color = isError ? "#8B241D" : "#205B2B";
  const background = isError ? "#FFF2F1" : "#EFF8F1";
  const escapedTitle = escapeHtml(title);
  const escapedMessage = escapeHtml(message);
  const html = [
    "<!doctype html><html lang=\"pt-BR\"><meta charset=\"utf-8\">",
    "<meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">",
    "<title>", escapedTitle, " | Sorteio Kentsol</title>",
    "<style>body{margin:0;padding:24px;background:#F3F6F8;color:#172A38;font:17px/1.55 Arial,sans-serif}",
    "main{max-width:620px;margin:8vh auto;padding:28px;background:#fff;border:1px solid #DCE4EA;border-radius:8px}",
    "h1{color:#012F50;font-size:1.8rem}.message{padding:16px;border-radius:5px;color:", color, ";background:", background, "}</style>",
    "<main><p>Kentsol · Corrida IPI 2026</p><h1>", escapedTitle, "</h1>",
    "<p class=\"message\">", escapedMessage, "</p>",
    "<p>Se necessário, volte à página do sorteio para tentar novamente.</p></main></html>"
  ].join("");
  return HtmlService.createHtmlOutput(html);
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, function (character) {
    return {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    }[character];
  });
}
