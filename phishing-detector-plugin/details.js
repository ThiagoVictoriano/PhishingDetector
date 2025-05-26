document.addEventListener("DOMContentLoaded", async () => {
    const urlElement = document.getElementById("url");
    const analysisList = document.getElementById("analysis-list");
    const closeButton = document.getElementById("closeDetails");
  
    // Obtém os dados da URL
    const urlParams = new URLSearchParams(window.location.search);
    const notificationId = urlParams.get("id");
    const { analysisData } = await browser.storage.local.get("analysisData");
  
    if (analysisData && analysisData[notificationId]) {
      const data = analysisData[notificationId];
      urlElement.textContent = data.url;
  
      const items = [
        { label: "In OpenPhish", value: data.is_in_openphish, risk: data.is_in_openphish ? "unsafe" : "safe", score: 4 },
        { label: "Number Substitution", value: data.has_number_substitution, risk: data.has_number_substitution ? "unsafe" : "safe", score: 2 },
        { label: "Special Characters", value: data.has_special_characters, risk: data.has_special_characters ? "unsafe" : "safe", score: 1 },
        { label: "Domain Age Suspicious", value: data.domain_age?.is_suspicious || false, risk: data.domain_age?.is_suspicious ? "unsafe" : "safe", score: 2 },
        { label: "Uses Dynamic DNS", value: data.uses_dynamic_dns, risk: data.uses_dynamic_dns ? "unsafe" : "safe", score: 3 },
        { label: "SSL Suspicious", value: data.ssl_info?.is_suspicious || false, risk: data.ssl_info?.is_suspicious ? "unsafe" : "safe", score: 2 },
        { label: "Redirects Suspicious", value: data.redirects?.is_suspicious || false, risk: data.redirects?.is_suspicious ? "unsafe" : "safe", score: 2 },
        { label: "Brand Similarity Suspicious", value: data.brand_similarity?.is_suspicious || false, risk: data.brand_similarity?.is_suspicious ? "unsafe" : "safe", score: 3 },
        { label: "Content Analysis Suspicious", value: data.content_analysis?.is_suspicious || false, risk: data.content_analysis?.is_suspicious ? "unsafe" : "safe", score: 3 }
      ];
  
      items.forEach(item => {
        const li = document.createElement("li");
        li.textContent = `${item.label}: ${item.value ? "Yes" : "No"} (${item.risk}, +${item.score} points)`;
        li.className = item.risk;
        analysisList.appendChild(li);
      });
    } else {
      urlElement.textContent = "Dados não encontrados.";
      analysisList.textContent = "Nenhum dado de análise disponível.";
    }
  
    closeButton.addEventListener("click", () => {
      window.close();
    });
  });