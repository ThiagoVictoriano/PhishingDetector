const urlCache = new Map();
const notifiedTabs = new Set();

// Configurações padrão
const defaultSettings = {
  blockEnabled: false,
  suspiciousThreshold: 4,
  dangerousThreshold: 7,
  whitelist: []
};

// Função de debounce
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

function calcularScore(data, settings) {
  let score = 0;
  if (data.is_in_openphish) score += 4;
  if (data.has_number_substitution) score += 2;
  if (data.has_special_characters) score += 1;
  if (data.domain_age && data.domain_age.is_suspicious) score += 2;
  if (data.uses_dynamic_dns) score += 3;
  if (data.ssl_info && data.ssl_info.is_suspicious) score += 2;
  if (data.redirects && data.redirects.is_suspicious) score += 2;
  if (data.brand_similarity && data.brand_similarity.is_suspicious) score += 3;
  if (data.content_analysis && data.content_analysis.is_suspicious) score += 3;
  return score;
}

// Log inicial para confirmar carregamento
console.log("🟢 Background script iniciado.");

// Notificação de instalação
browser.runtime.onInstalled.addListener(() => {
  console.log("🧩 Plugin instalado.");
  browser.notifications.create({
    type: "basic",
    title: "Phishing Detector",
    message: "Extensão ativada com sucesso! Configure nas opções.",
    iconUrl: "icons/icon.png"
  });
  // Inicializa configurações padrão
  browser.storage.local.set({ settings: defaultSettings });
});

// Verifica se a URL está na whitelist
async function isWhitelisted(url) {
  const { settings } = await browser.storage.local.get("settings");
  const whitelist = settings?.whitelist || [];
  const extracted = url.match(/^(?:https?:\/\/)?(?:[^@\n]+@)?([^:\/\n?]+)/i);
  const domain = extracted ? extracted[1] : url;
  return whitelist.some((entry) => domain.includes(entry));
}

// Função de verificação de URL
const checkUrl = debounce(async (details, isEmailLink = false) => {
  const url = details.url;
  const tabId = details.tabId;

  // Ignora URLs na whitelist
  if (await isWhitelisted(url)) {
    console.log("✅ URL na whitelist:", url);
    return;
  }

  // Para links de e-mails, evita notificações duplicadas
  if (isEmailLink && notifiedTabs.has(tabId)) {
    console.log("🔔 Notificação já exibida para link de e-mail na aba:", tabId);
    return;
  }

  // Verifica cache
  if (urlCache.has(url)) {
    console.log("🔄 Cache hit para URL:", url);
    const cachedResult = urlCache.get(url);
    await processResult(cachedResult, url, tabId, isEmailLink);
    return;
  }

  try {
    const response = await fetch("http://localhost:8000/checkurl", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: url })
    });

    if (!response.ok) {
      console.warn("⚠️ Erro na resposta do backend:", response.status);
      return;
    }

    const result = await response.json();
    urlCache.set(url, result);
    await processResult(result, url, tabId, isEmailLink);

    // Limpa cache após 5 minutos
    setTimeout(() => urlCache.delete(url), 1000 * 60 * 5);
  } catch (err) {
    console.error("❌ Erro ao verificar URL:", err);
  }
}, 1000);

// Processa o resultado da análise
async function processResult(result, url, tabId, isEmailLink) {
  const { settings } = await browser.storage.local.get("settings");
  const suspiciousThreshold = settings?.suspiciousThreshold ?? defaultSettings.suspiciousThreshold;
  const dangerousThreshold = settings?.dangerousThreshold ?? defaultSettings.dangerousThreshold;
  const blockEnabled = settings?.blockEnabled ?? defaultSettings.blockEnabled;
  const score = calcularScore(result, settings);

  console.log("📊 Score de risco:", score, "URL:", url);

  // Gera um ID único para a notificação
  const notificationId = `phishing-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  if (score >= dangerousThreshold) {
    console.warn("🚨 Site PERIGOSO detectado:", url);
    if (!isEmailLink) {
      browser.notifications.create(notificationId, {
        type: "basic",
        title: "🚨 Site de phishing detectado!",
        message: `Este site foi marcado como perigoso:\n${url}`,
        iconUrl: "icons/icon.png"
      });
      if (blockEnabled && tabId !== -1) {
        browser.tabs.update(tabId, { url: browser.runtime.getURL("blocked.html") });
      }
    } else {
      browser.notifications.create(notificationId, {
        type: "basic",
        title: "🚨 Link perigoso!",
        message: `O link pode ser phishing:\n${url}`,
        iconUrl: "icons/icon.png"
      });
      notifiedTabs.add(tabId);
      setTimeout(() => notifiedTabs.delete(tabId), 1000 * 60 * 5);
    }
  } else if (score >= suspiciousThreshold) {
    console.log("⚠️ Site suspeito:", url);
    if (!isEmailLink) {
      browser.notifications.create(notificationId, {
        type: "basic",
        title: "⚠️ Site suspeito",
        message: `Este site pode ser suspeito:\n${url}`,
        iconUrl: "icons/icon.png"
      });
    } else {
      browser.notifications.create(notificationId, {
        type: "basic",
        title: "⚠️ Link suspeito",
        message: `O link pode ser suspeito:\n${url}`,
        iconUrl: "icons/icon.png"
      });
      notifiedTabs.add(tabId);
      setTimeout(() => notifiedTabs.delete(tabId), 1000 * 60 * 5);
    }
  } else {
    console.log("✅ Site seguro:", url);
    // Notificação para sites seguros, independentemente de isEmailLink
    browser.notifications.create(notificationId, {
      type: "basic",
      title: "✅ Site seguro",
      message: `Este site foi considerado seguro:\n${url}`,
      iconUrl: "icons/icon.png"
    });
    if (isEmailLink) {
      notifiedTabs.add(tabId);
      setTimeout(() => notifiedTabs.delete(tabId), 1000 * 60 * 5);
    }
  }

  // Armazena os dados da análise temporariamente
  const analysisData = await browser.storage.local.get("analysisData");
  await browser.storage.local.set({
    analysisData: {
      ...analysisData.analysisData,
      [notificationId]: { url, ...result }
    }
  });

  // Limpa os dados após 5 minutos
  setTimeout(async () => {
    try {
      const updatedData = await browser.storage.local.get("analysisData");
      if (updatedData.analysisData && updatedData.analysisData[notificationId]) {
        delete updatedData.analysisData[notificationId];
        await browser.storage.local.set({ analysisData: updatedData.analysisData });
        console.log("🗑️ Dados de análise removidos para notificação:", notificationId);
      }
    } catch (err) {
      console.error("❌ Erro ao limpar dados de análise:", err);
    }
  }, 1000 * 60 * 5);
}

// Escuta cliques nas notificações
browser.notifications.onClicked.addListener(async (notificationId) => {
  // Abre a página de detalhes
  browser.windows.create({
    url: browser.runtime.getURL(`details.html?id=${notificationId}`),
    type: "popup",
    width: 650,
    height: 500
  });
  // Fecha a notificação após o clique
  browser.notifications.clear(notificationId);
});

// Escuta requisições web
browser.webRequest.onCompleted.addListener(
  (details) => {
    console.log("🌐 Requisição web detectada:", details.url);
    checkUrl(details, false);
  },
  { urls: ["<all_urls>"], types: ["main_frame"] }
);

// Escuta mensagens do content script
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "checkLink") {
    console.log("📧 Mensagem de link de e-mail recebida:", message.url);
    checkUrl({ url: message.url, tabId: sender.tab.id }, true);
  }
});

// Limpa notificações quando a aba é fechada
browser.tabs.onRemoved.addListener((tabId) => {
  console.log("🗑️ Aba fechada, removendo do notifiedTabs:", tabId);
  notifiedTabs.delete(tabId);
});