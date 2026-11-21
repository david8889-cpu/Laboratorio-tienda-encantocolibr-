/* Capa de medición GA4. Carga gtag.js solo con un ID real (G-...). */
(function () {
  var cfg = window.TIENDA_CONFIG || {};
  var ID = String(cfg.GA_MEASUREMENT_ID || "").trim();
  var DEBUG = cfg.DEBUG_MODE === true;
  var activo = /^G-[A-Z0-9]{4,}$/i.test(ID) && ID !== "G-XXXXXXXXXX";

  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };

  if (activo) {
    var s = document.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(ID);
    document.head.appendChild(s);
    gtag("js", new Date());
    if (DEBUG) gtag("config", ID, { debug_mode: true });
    else gtag("config", ID);
  }

  function registrar(nombre, params) {
    if (window.Monitor) window.Monitor.registrar(nombre, params);
  }
  function preparar(params) {
    var p = {};
    for (var k in (params || {})) p[k] = params[k];
    if (!p.currency) p.currency = "COP";
    return p;
  }

  /* Envía un evento (y lo muestra en el monitor). */
  function enviarEvento(nombre, params) {
    var p = preparar(params);
    registrar(nombre, p);
    if (activo) gtag("event", nombre, p);
  }

  /* Envía un evento y luego navega: event_callback + event_timeout 1000 ms + respaldo 1200 ms. */
  function enviarYNavegar(nombre, params, url) {
    var p = preparar(params), fin = false;
    function ir() { if (fin) return; fin = true; window.location.href = url; }
    registrar(nombre, p);
    if (!activo) { ir(); return; }
    p.event_callback = ir;
    p.event_timeout = 1000;
    gtag("event", nombre, p);
    setTimeout(ir, 1200);
  }

  /* Propiedad de usuario (user_properties). */
  function establecerPropiedadesUsuario(props) {
    if (activo) gtag("set", "user_properties", props);
    if (window.Monitor) window.Monitor.propiedades(props);
  }

  window.Analytics = {
    activo: activo, id: ID, debug: DEBUG,
    enviarEvento: enviarEvento, enviarYNavegar: enviarYNavegar,
    establecerPropiedadesUsuario: establecerPropiedadesUsuario
  };

  /* page_view: lo envía gtag('config') automáticamente; aquí solo se muestra en el monitor. */
  registrar("page_view", { page_title: document.title, page_location: location.pathname + location.search });
})();
