/* Checkout en dos pasos: begin_checkout, add_shipping_info, add_payment_info. */
(function () {
  var res = Carrito.resumen();
  if (!res.lineas.length) { window.location.replace("carrito.html"); return; }

  var PAISES = ["Colombia", "México", "Estados Unidos", "España", "Argentina", "Chile", "Perú", "Ecuador"];
  var envioSel = null, pagando = false;

  var selPais = document.getElementById("pais");
  PAISES.forEach(function (p) { var o = document.createElement("option"); o.value = p; o.textContent = p; selPais.appendChild(o); });

  var paso1 = document.getElementById("paso1"), paso2 = document.getElementById("paso2");
  var ind1 = document.getElementById("ind1"), ind2 = document.getElementById("ind2");

  function base() {
    var p = { value: res.valor, items: res.items };
    if (res.cupon) p.coupon = res.cupon;
    return p;
  }
  function servicioElegido() { return document.querySelector('input[name="servicio"]:checked').value; }

  function pintarResumen() {
    var e = Carrito.envio(selPais.value || "Colombia", servicioElegido(), res.valor);
    var filas = res.lineas.map(function (l) {
      return '<li><span>' + l.prod.nombre + ' × ' + l.cantidad + '</span><span>' + Carrito.formato(l.precioUnidad * l.cantidad) + '</span></li>';
    }).join("");
    document.getElementById("resumen").innerHTML =
      '<h2>Tu pedido</h2><ul class="mini">' + filas + '</ul><dl>' +
      '<dt>Subtotal</dt><dd>' + Carrito.formato(res.subtotal) + '</dd>' +
      (res.cupon ? '<dt>Descuento (' + res.cupon + ')</dt><dd class="desc-ok">− ' + Carrito.formato(res.descuento) + '</dd>' : '') +
      '<dt>Envío</dt><dd>' + (e.tarifa === 0 ? "Gratis" : Carrito.formato(e.tarifa)) + '</dd>' +
      '<dt class="total">Total</dt><dd class="total">' + Carrito.formato(res.valor + e.tarifa) + '</dd></dl>' +
      '<p class="nota">' + e.tier + (selPais.value ? '' : ' (elige un país)') + '</p>';
  }
  function pintarOpciones() {
    var tipoNac = (selPais.value || "Colombia") === "Colombia";
    ["Estándar", "Express"].forEach(function (s) {
      var tier = (tipoNac ? "Nacional" : "Internacional") + " - " + s;
      var e = Carrito.envio(selPais.value || "Colombia", s, res.valor);
      document.getElementById("precio-" + s).textContent = tier + " · " + (e.tarifa === 0 ? "Gratis" : Carrito.formato(e.tarifa));
    });
  }

  selPais.addEventListener("change", function () { pintarOpciones(); pintarResumen(); });
  Array.prototype.forEach.call(document.querySelectorAll('input[name="servicio"]'), function (r) {
    r.addEventListener("change", pintarResumen);
  });
  pintarOpciones(); pintarResumen();

  /* Paso 1 -> Paso 2 */
  document.getElementById("form-envio").addEventListener("submit", function (ev) {
    ev.preventDefault();
    if (!ev.target.checkValidity()) { ev.target.reportValidity(); return; }
    envioSel = Carrito.envio(selPais.value, servicioElegido(), res.valor);
    Analytics.establecerPropiedadesUsuario({ tipo_cliente: envioSel.tipo });
    var p = base(); p.shipping_tier = envioSel.tier;
    Analytics.enviarEvento("add_shipping_info", p);
    paso1.hidden = true; paso2.hidden = false;
    ind1.classList.remove("activo"); ind1.classList.add("hecho"); ind2.classList.add("activo");
    document.getElementById("envio-elegido").textContent = envioSel.tier + " · " + selPais.value +
      " · " + (envioSel.tarifa === 0 ? "Gratis" : Carrito.formato(envioSel.tarifa));
    window.scrollTo(0, 0);
  });

  document.getElementById("volver").addEventListener("click", function () {
    paso2.hidden = true; paso1.hidden = false;
    ind2.classList.remove("activo"); ind1.classList.remove("hecho"); ind1.classList.add("activo");
  });

  /* Paso 2: pago simulado */
  document.getElementById("form-pago").addEventListener("submit", function (ev) {
    ev.preventDefault();
    if (pagando || !envioSel) return;
    pagando = true;
    var tipoPago = document.querySelector('input[name="pago"]:checked').value;
    var p = base(); p.payment_type = tipoPago;

    var pedido = {
      transaction_id: "ENC-" + Date.now().toString(36).toUpperCase() + "-" + Math.random().toString(36).slice(2, 6).toUpperCase(),
      affiliation: MARCA, value: res.valor, shipping: envioSel.tarifa,
      tipo_cliente: envioSel.tipo, items: res.items, pais: selPais.value,
      shipping_tier: envioSel.tier, payment_type: tipoPago,
      subtotal: res.subtotal, descuento: res.descuento, enviado: false
    };
    if (res.cupon) pedido.coupon = res.cupon;
    try { sessionStorage.setItem("ec_pedido", JSON.stringify(pedido)); } catch (e) {}
    Carrito.vaciar();
    Analytics.enviarYNavegar("add_payment_info", p, "gracias.html");
  });

  Analytics.enviarEvento("begin_checkout", base());
})();
