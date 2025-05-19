
function calcularScore(data) {
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

browser.webRequest.onBeforeRequest.addListener(
  async function(details) {
    try {
      const res = await fetch("https://seu-backend.com/check_url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: details.url })
      });

      const result = await res.json();
      const score = calcularScore(result);

      if (score >= 7) {
        browser.notifications.create({
          type: "basic",
          title: "🚨 Site de phishing detectado!",
          message: `Bloqueado: ${details.url}`,
          iconUrl: "icons/icon.png"
        });

        return { cancel: true };
      } else if (score >= 4) {
        browser.notifications.create({
          type: "basic",
          title: "⚠️ Site suspeito",
          message: `Acesse com cautela: ${details.url}`,
          iconUrl: "icons/icon.png"
        });

        return { cancel: false };
      }

      return { cancel: false };
    } catch (error) {
      console.error("Erro ao verificar a URL:", error);
      return { cancel: false };
    }
  },
  { urls: ["<all_urls>"] },
  ["blocking"]
);
