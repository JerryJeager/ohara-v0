(function () {
  var script = document.currentScript;
  var websiteId = script && script.getAttribute("data-website-id");
  var widgetUrl = script && script.getAttribute("data-widget-url");
  var PROD_API = "https://ohara-be-production.up.railway.app/api/v1";
  var LOCAL_API = "http://localhost:8080/api/v1";

  var scriptOrigin = new URL(script.src).origin;
  var isLocal = /localhost|127\.0\.0\.1/.test(scriptOrigin);
  var apiUrl =
    script.getAttribute("data-api-url") || (isLocal ? LOCAL_API : PROD_API);

  if (!websiteId) {
    console.error("Ohara: missing data-website-id");
    return;
  }

  var baseUrl = widgetUrl || new URL(script.src).origin;
  var logoUrl = new URL("/ohara-logo.png", baseUrl).toString();
  var iframe = null;
  var bubble = document.createElement("button");
  bubble.type = "button";
  bubble.setAttribute("aria-label", "Open Ohara chat");
  bubble.innerHTML =
    '<span style="display:flex;align-items:center;justify-content:center;width:38px;height:38px;border-radius:50%;background:#f2f0ec;overflow:hidden;box-sizing:border-box"><img src="' +
    logoUrl +
    '" alt="Ohara logo" style="display:block;width:100%;height:100%;object-fit:cover;border-radius:50%" /></span>';
  bubble.style.cssText =
    "position:fixed;right:24px;bottom:24px;width:56px;height:56px;padding:8px;border:0;border-radius:50%;background:#232322;box-shadow:0 10px 30px rgba(0,0,0,.2);cursor:pointer;z-index:2147483647;transition:transform .2s ease;display:flex;align-items:center;justify-content:center";
  bubble.onmouseenter = function () {
    bubble.style.transform = "scale(1.06)";
  };
  bubble.onmouseleave = function () {
    bubble.style.transform = "scale(1)";
  };

  function closeChat() {
    if (iframe) iframe.remove();
    iframe = null;
    bubble.style.display = "flex";
    bubble.style.alignItems = "center";
    bubble.style.justifyContent = "center";
  }

  function openChat() {
    if (iframe) return;
    iframe = document.createElement("iframe");
    iframe.title = "Ohara AI support chat";
    iframe.referrerPolicy = "origin";
    // iframe.src = baseUrl + '/widget?websiteId=' + encodeURIComponent(websiteId)
    iframe.src =
      apiUrl + "/websites/" + encodeURIComponent(websiteId) + "/widget";
    iframe.allow = "clipboard-write";
    iframe.style.cssText =
      "position:fixed;right:24px;bottom:24px;width:min(390px,calc(100vw - 24px));height:min(680px,calc(100vh - 24px));border:0;border-radius:24px;box-shadow:0 24px 80px rgba(32,30,26,.22);z-index:2147483646;background:#fbfaf8";
    document.body.appendChild(iframe);
    bubble.style.display = "none";
  }

  bubble.onclick = openChat;
  document.body.appendChild(bubble);

  window.addEventListener("message", function (event) {
    if (!iframe || event.source !== iframe.contentWindow) return;
    if (event.data && event.data.type === "ohara-close") closeChat();
  });
})();
