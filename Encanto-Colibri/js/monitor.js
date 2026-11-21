/* Monitor de eventos: ayuda didáctica. Muestra lo que la tienda envía a GA4. */
(function () {
  var K_EV = "ec_eventos", K_OR = "ec_origen", K_UP = "ec_userprops", K_OCULTO = "ec_monitor_oculto";
  var MAX = 12;

  function leer(store, k, def) { try { var v = JSON.parse(store.getItem(k)); return v === null ? def : v; } catch (e) { return def; } }
  function escribir(store, k, v) { try { store.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function hora() { var d = new Date(); return pad(d.getHours()) + ":" + pad(d.getMinutes()) + ":" + pad(d.getSeconds()); }
  function fmt(n) { return "$ " + Math.round(n).toLocaleString("es-CO"); }

  /* Origen de la visita: se fija en la primera página de la sesión. */
  function origen() {
    var o = null;
    try { o = sessionStorage.getItem(K_OR); } catch (e) {}
    if (!o) {
      var q = new URLSearchParams(location.search);
      var s = q.get("utm_source"), m = q.get("utm_medium"), c = q.get("utm_campaign");
      o = (s || m || c) ? (s || "(sin source)") + " / " + (m || "(sin medium)") + " · " + (c || "(sin campaign)") : "directo (sin UTM)";
      try { sessionStorage.setItem(K_OR, o); } catch (e) {}
    }
    return o;
  }
  var ORIGEN = origen();

  function resumir(n, p) {
    if (n === "page_view") return (p.page_title || "") + " · " + (p.page_location || "");
    var t = [];
    if (p.item_list_name) t.push("lista: " + p.item_list_name);
    if (p.promotion_id) t.push("promo: " + p.promotion_id);
    if (p.transaction_id) t.push("pedido " + p.transaction_id);
    if (p.items && p.items.length) {
      t.push(p.items.length === 1 ? p.items[0].item_name + " ×" + p.items[0].quantity : p.items.length + " productos");
    }
    if (typeof p.value === "number") t.push("value " + fmt(p.value));
    if (typeof p.shipping === "number") t.push("envío " + fmt(p.shipping));
    if (p.shipping_tier) t.push(p.shipping_tier);
    if (p.payment_type) t.push(p.payment_type);
    if (p.coupon) t.push("cupón " + p.coupon);
    if (p.tipo_cliente) t.push(p.tipo_cliente);
    return t.join(" · ");
  }

  function registrar(nombre, params) {
    var lista = leer(sessionStorage, K_EV, []);
    var copia; try { copia = JSON.parse(JSON.stringify(params || {})); } catch (e) { copia = {}; }
    lista.unshift({ t: hora(), n: nombre, r: resumir(nombre, copia), d: copia });
    escribir(sessionStorage, K_EV, lista.slice(0, MAX));
    pintarLista();
  }
  function propiedades(props) {
    var u = leer(sessionStorage, K_UP, {});
    for (var k in props) u[k] = props[k];
    escribir(sessionStorage, K_UP, u);
    pintarProps();
  }

  /* Cookies _ga*: se borran en todas las variantes de dominio del host. */
  function borrarCookiesGA() {
    var nombres = document.cookie.split(";").map(function (c) { return c.trim().split("=")[0]; })
      .filter(function (n) { return n.indexOf("_ga") === 0; });
    var partes = location.hostname.split("."), dominios = [null], i;
    for (i = 0; i < partes.length - 1; i++) {
      var d = partes.slice(i).join(".");
      dominios.push(d, "." + d);
    }
    nombres.forEach(function (n) {
      dominios.forEach(function (d) {
        document.cookie = n + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; Max-Age=0; path=/" + (d ? "; domain=" + d : "");
      });
    });
  }
  function simularVisitante() {
    borrarCookiesGA();
    try { localStorage.removeItem("ec_carrito"); } catch (e) {}
    try { sessionStorage.clear(); } catch (e) {}
    location.href = "index.html";
  }

  /* ---------- Interfaz ---------- */
  var panel, elLista, elProps, elToggle;
  function el(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt !== undefined) e.textContent = txt; return e; }

  function pintarLista() {
    if (!elLista) return;
    var lista = leer(sessionStorage, K_EV, []);
    elLista.innerHTML = "";
    document.getElementById("mon-cuenta").textContent = "(" + lista.length + "/" + MAX + ")";
    lista.forEach(function (ev) {
      var li = el("li", "mon-ev");
      var d = el("details");
      var s = el("summary");
      s.appendChild(el("span", "mon-hora", ev.t));
      s.appendChild(el("b", "mon-nombre", ev.n));
      if (ev.r) s.appendChild(el("span", "mon-res", ev.r));
      d.appendChild(s);
      d.appendChild(el("pre", "mon-json", JSON.stringify(ev.d, null, 1)));
      li.appendChild(d);
      elLista.appendChild(li);
    });
    if (!lista.length) elLista.appendChild(el("li", "mon-vacio", "Aún no hay eventos."));
  }
  function pintarProps() {
    if (!elProps) return;
    var u = leer(sessionStorage, K_UP, {}), t = [];
    for (var k in u) t.push(k + " = " + u[k]);
    elProps.textContent = t.length ? t.join(", ") : "(ninguna todavía)";
  }
  function aplicarOculto(oculto) {
    panel.classList.toggle("oculto", oculto);
    document.body.classList.toggle("monitor-oculto", oculto);
    elToggle.textContent = oculto ? "Mostrar monitor" : "Ocultar";
    elToggle.setAttribute("aria-expanded", String(!oculto));
    try { localStorage.setItem(K_OCULTO, oculto ? "1" : "0"); } catch (e) {}
  }

  function construir() {
    document.body.classList.add("con-monitor");
    panel = el("aside", "monitor"); panel.id = "monitor"; panel.setAttribute("aria-label", "Monitor de eventos");
    var cab = el("div", "monitor-cab");
    cab.appendChild(el("strong", null, "Monitor de eventos"));
    elToggle = el("button", "mon-btn", "Ocultar"); elToggle.type = "button";
    elToggle.addEventListener("click", function () { aplicarOculto(!panel.classList.contains("oculto")); });
    cab.appendChild(elToggle); panel.appendChild(cab);

    var cuerpo = el("div", "monitor-cuerpo");
    var est = el("p", "mon-estado");
    if (window.Analytics && Analytics.activo) {
      est.classList.add("ok");
      est.textContent = "Conectado a " + Analytics.id + (Analytics.debug ? " · modo depuración" : "");
    } else {
      est.classList.add("error");
      est.textContent = "Sin ID de medición: los eventos solo se muestran aquí. Edita js/config.js.";
    }
    cuerpo.appendChild(est);

    var b1 = el("div", "mon-bloque"); b1.appendChild(el("span", null, "Origen de la visita")); b1.appendChild(el("b", null, ORIGEN)); cuerpo.appendChild(b1);
    var b2 = el("div", "mon-bloque"); b2.appendChild(el("span", null, "Propiedades de usuario")); elProps = el("b"); b2.appendChild(elProps); cuerpo.appendChild(b2);

    var h = el("h4", null, "Últimos eventos "); h.appendChild(el("span", null, "")).id = "mon-cuenta"; cuerpo.appendChild(h);
    elLista = el("ol", "mon-lista"); cuerpo.appendChild(elLista);

    var r = el("button", "mon-reset", "Simular nuevo visitante"); r.type = "button";
    r.addEventListener("click", simularVisitante); cuerpo.appendChild(r);
    cuerpo.appendChild(el("p", "mon-nota", "Toca un evento para ver sus parámetros. Esta ayuda es solo didáctica y no envía nada por sí misma."));
    panel.appendChild(cuerpo);
    document.body.appendChild(panel);

    pintarLista(); pintarProps();
    var oculto = false; try { oculto = localStorage.getItem(K_OCULTO) === "1"; } catch (e) {}
    aplicarOculto(oculto);
  }
  document.addEventListener("DOMContentLoaded", construir);

  window.Monitor = { registrar: registrar, propiedades: propiedades };
})();
