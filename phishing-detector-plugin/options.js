document.addEventListener("DOMContentLoaded", async () => {
  const blockEnabledInput = document.getElementById("blockEnabled");
  const suspiciousThresholdInput = document.getElementById("suspiciousThreshold");
  const dangerousThresholdInput = document.getElementById("dangerousThreshold");
  const whitelistInput = document.getElementById("whitelist");
  const saveButton = document.getElementById("save");
  const resetButton = document.getElementById("reset");
  const status = document.getElementById("status");

  // Carrega configurações
  const { settings } = await browser.storage.local.get("settings");
  if (settings) {
    blockEnabledInput.checked = settings.blockEnabled;
    suspiciousThresholdInput.value = settings.suspiciousThreshold;
    dangerousThresholdInput.value = settings.dangerousThreshold;
    whitelistInput.value = settings.whitelist.join("\n");
  }

  saveButton.addEventListener("click", async () => {
    const suspiciousThreshold = parseInt(suspiciousThresholdInput.value);
    const dangerousThreshold = parseInt(dangerousThresholdInput.value);
    const whitelist = whitelistInput.value.split("\n").map(s => s.trim()).filter(s => s);

    if (suspiciousThreshold >= dangerousThreshold) {
      status.textContent = "Error: Suspicious threshold must be less than dangerous threshold.";
      status.classList.remove("success");
      return;
    }

    await browser.storage.local.set({
      settings: {
        blockEnabled: blockEnabledInput.checked,
        suspiciousThreshold,
        dangerousThreshold,
        whitelist
      }
    });
    status.textContent = "Settings saved!";
    status.classList.add("success");
    setTimeout(() => {
      status.textContent = "";
      status.classList.remove("success");
    }, 2000);
  });

  resetButton.addEventListener("click", async () => {
    await browser.storage.local.set({
      settings: {
        blockEnabled: false,
        suspiciousThreshold: 4,
        dangerousThreshold: 7,
        whitelist: []
      }
    });
    blockEnabledInput.checked = false;
    suspiciousThresholdInput.value = 4;
    dangerousThresholdInput.value = 7;
    whitelistInput.value = "";
    status.textContent = "Settings reset to defaults!";
    status.classList.add("success");
    setTimeout(() => {
      status.textContent = "";
      status.classList.remove("success");
    }, 2000);
  });
});