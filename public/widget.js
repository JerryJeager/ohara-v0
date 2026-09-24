(function () {
  const script = document.currentScript;
  const websiteId = script.getAttribute("data-website-id");

  if (!websiteId) {
    console.error("Chat widget: missing data-website-id");
    return;
  }

  let iframe = null;

  function openChat() {
    if (iframe) return; // already open

    iframe = document.createElement("iframe");
    iframe.src = `http://localhost:3000/widget?websiteId=${websiteId}`;
    iframe.style.cssText = `
      position: fixed; bottom: 90px; right: 20px;
      width: 380px; height: 550px; border: none;
      border-radius: 12px; z-index: 999999;
      box-shadow: 0 4px 24px rgba(0,0,0,0.15);
    `;
    document.body.appendChild(iframe);
    bubble.style.display = "none";
  }

  const bubble = document.createElement("button");
  bubble.innerHTML = "💬";
  bubble.style.cssText = `
    position: fixed; bottom: 20px; right: 20px;
    width: 56px; height: 56px; border-radius: 50%;
    border: none; cursor: pointer; z-index: 999999;
  `;
  bubble.onclick = openChat;
  document.body.appendChild(bubble);

  window.addEventListener("message", (event) => {
    if (event.origin !== "http://localhost:3000") return;
    if (event.data.type === "resize" && iframe) {
      iframe.style.width = event.data.width;
      iframe.style.height = event.data.height;
    }
  });
})();