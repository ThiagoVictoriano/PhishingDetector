let lastCheckedUrl = null;

document.addEventListener("mouseover", (event) => {
  const link = event.target.closest("a");
  if (link && link.href) {
    const url = link.href;
    if (url !== lastCheckedUrl) {
      lastCheckedUrl = url;
      browser.runtime.sendMessage({ type: "checkLink", url });
    }
  }
});