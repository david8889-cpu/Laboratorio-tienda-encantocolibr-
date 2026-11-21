/* Carrito en localStorage + cálculos compartidos (cupón, envío, ítems GA4). */
(function () {
  var KEY = "ec_carrito";
  var memoria = null;

  function leer() {
    try {
      var d = JSON.parse(localStorage.getItem(KEY));
      if (d && Array.isArray(d.items)) return d;
    } catch (e) { if (memoria) return memoria; }
    return { items: [], cupon: null };
  }
  function guardar(c) {
    memoria = c;
    try { localStorage.setItem(KEY, JSON.stringify(c)); } catch (e) {}
  }
  function formato(n) { return "$ " + Math.round(n).toLocaleString("es-CO"); }

  function cuponActivo() { return leer().cupon; }
  function precioUnidad(prod, conCupon) {
    return conCupon ? Math.round(prod.precio * (100 - CUPON.porcentaje) / 100) : prod.precio;
  }

  function agregar(id, n) {
    var c = leer(), f = null;
    c.items.forEach(function (it) { if (it.id === id) f = it; });
    if (f) f.cantidad += n; else c.items.push({ id: id, cantidad: n });
    guardar(c);
  }
  function quitar(id, n) {
    var c = leer();
    c.items.forEach(function (it) { if (it.id === id) it.cantidad -= n; });
    c.items = c.items.filter(function (it) { return it.cantidad > 0; });
    guardar(c);
  }
  function aplicarCupon(codigo) {
    if (String(codigo || "").trim().toUpperCase() !== CUPON.codigo) return false;
    var c = leer(); c.cupon = CUPON.codigo; guardar(c); return true;
  }
  function quitarCupon() { var c = leer(); c.cupon = null; guardar(c); }
  function vaciar() { guardar({ items: [], cupon: null }); }

  /* Ítem con el formato exacto del contrato de medición. */
  function itemGA(prod, cantidad, index, conCupon) {
    var it = {
      item_id: prod.id, item_name: prod.nombre, item_brand: MARCA, item_category: prod.categoria,
      price: precioUnidad(prod, conCupon), quantity: cantidad, index: index
    };
    if (conCupon) { it.discount = prod.precio - it.price; it.coupon = CUPON.codigo; }
    return it;
  }

  function resumen() {
    var c = leer(), conCupon = !!c.cupon, lineas = [], subtotal = 0, valor = 0, unidades = 0;
    c.items.forEach(function (it, i) {
      var prod = buscarProducto(it.id);
      if (!prod) return;
      var pu = precioUnidad(prod, conCupon);
      lineas.push({ prod: prod, cantidad: it.cantidad, precioLista: prod.precio, precioUnidad: pu, index: lineas.length });
      subtotal += prod.precio * it.cantidad; valor += pu * it.cantidad; unidades += it.cantidad;
    });
    return {
      lineas: lineas, cupon: c.cupon, subtotal: subtotal, valor: valor,
      descuento: subtotal - valor, unidades: unidades,
      items: lineas.map(function (l) { return itemGA(l.prod, l.cantidad, l.index, conCupon); })
    };
  }

  var TARIFAS = {
    "Nacional - Estándar": 12000, "Nacional - Express": 25000,
    "Internacional - Estándar": 95000, "Internacional - Express": 160000
  };
  var ENVIO_GRATIS_DESDE = 150000;

  function envio(pais, servicio, valorProductos) {
    var tipo = pais === "Colombia" ? "Nacional" : "Internacional";
    var serv = servicio === "Express" ? "Express" : "Estándar";
    var tier = tipo + " - " + serv, tarifa = TARIFAS[tier];
    if (tier === "Nacional - Estándar" && valorProductos >= ENVIO_GRATIS_DESDE) tarifa = 0;
    return { tipo: tipo, servicio: serv, tier: tier, tarifa: tarifa };
  }

  function pintarContador() {
    var n = resumen().unidades;
    var els = document.querySelectorAll("[data-contador]");
    for (var i = 0; i < els.length; i++) { els[i].textContent = n; els[i].hidden = n === 0; }
  }
  document.addEventListener("DOMContentLoaded", pintarContador);

  window.Carrito = {
    leer: leer, agregar: agregar, quitar: quitar, aplicarCupon: aplicarCupon, quitarCupon: quitarCupon,
    cuponActivo: cuponActivo, vaciar: vaciar, itemGA: itemGA, resumen: resumen, envio: envio,
    formato: formato, pintarContador: pintarContador, ENVIO_GRATIS_DESDE: ENVIO_GRATIS_DESDE
  };
})();
