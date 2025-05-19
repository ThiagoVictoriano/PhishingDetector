document.getElementById("closeTab").addEventListener("click", (event) => {
      event.preventDefault();
      try {
        window.close();
        console.log("Aba fechada com sucesso.");
      } catch (error) {
        console.error("Erro ao fechar a aba:", error);
        // Alternativa: redirecionar para about:blank
        window.location.href = "about:blank";
      }
    });