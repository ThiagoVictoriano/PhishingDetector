document.getElementById("openOptions").addEventListener("click", () => {
  console.log("Botão Configurações clicado!");
  try {
    browser.tabs.create({ url: browser.runtime.getURL("options.html") });
    console.log("options.html aberto diretamente.");
  } catch (error) {
    console.error("Erro ao abrir options.html:", error);
  }
});