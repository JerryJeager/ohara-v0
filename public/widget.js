;(function () {
  var script = document.currentScript
  var websiteId = script && script.getAttribute('data-website-id')
  var widgetUrl = script && script.getAttribute('data-widget-url')

  if (!websiteId) {
    console.error('Ohara: missing data-website-id')
    return
  }

  var baseUrl = widgetUrl || new URL(script.src).origin
  var iframe = null
  var bubble = document.createElement('button')
  bubble.type = 'button'
  bubble.setAttribute('aria-label', 'Open Ohara chat')
  bubble.innerHTML = '<span aria-hidden="true">✦</span>'
  bubble.style.cssText = 'position:fixed;right:24px;bottom:24px;width:56px;height:56px;border:0;border-radius:50%;background:#232322;color:#fff;box-shadow:0 10px 30px rgba(0,0,0,.2);font:600 22px system-ui;cursor:pointer;z-index:2147483647;transition:transform .2s ease'
  bubble.onmouseenter = function () { bubble.style.transform = 'scale(1.06)' }
  bubble.onmouseleave = function () { bubble.style.transform = 'scale(1)' }

  function closeChat() {
    if (iframe) iframe.remove()
    iframe = null
    bubble.style.display = 'flex'
    bubble.style.alignItems = 'center'
    bubble.style.justifyContent = 'center'
  }

  function openChat() {
    if (iframe) return
    iframe = document.createElement('iframe')
    iframe.title = 'Ohara AI support chat'
    iframe.src = baseUrl + '/widget?websiteId=' + encodeURIComponent(websiteId)
    iframe.allow = 'clipboard-write'
    iframe.style.cssText = 'position:fixed;right:24px;bottom:24px;width:min(390px,calc(100vw - 24px));height:min(680px,calc(100vh - 24px));border:0;border-radius:24px;box-shadow:0 24px 80px rgba(32,30,26,.22);z-index:2147483646;background:#fbfaf8'
    document.body.appendChild(iframe)
    bubble.style.display = 'none'
  }

  bubble.onclick = openChat
  document.body.appendChild(bubble)

  window.addEventListener('message', function (event) {
    if (!iframe || event.source !== iframe.contentWindow) return
    if (event.data && event.data.type === 'ohara-close') closeChat()
  })
})()
