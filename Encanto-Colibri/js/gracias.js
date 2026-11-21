/* Confirmación: purchase una sola vez por pedido. */
(function () {
  var cont = document.getElementById("pedido");
  var pedido = null;
  try { pedido = JSON.parse(sessionStorage.getItem("ec_pedido")); } catch (e) {}

  if (!pedido) {
    cont.innerHTML = '<div class="vacio"><h2>No hay un pedido para mostrar</h2><p>Haz una compra simulada desde el catálogo.</p><a class="btn" href="index.html">Ver catálogo</a></div>';
    return;
  }

  var filas = pedido.items.map(function (it) {
    return '<li><span>' + it.item_name + ' × ' + it.quantity + '</span><span>' + Carrito.formato(it.price * it.quantity) + '</span></li>';
  }).join("");
  cont.innerHTML =
    '<div class="gracias"><div class="check" aria-hidden="true">✓</div><h1>¡Gracias por tu compra simulada!</h1>' +
    '<p class="sub">Pedido <b>' + pedido.transaction_id + '</b></p>' +
    '<div class="resumen centro"><ul class="mini">' + filas + '</ul><dl>' +
    '<dt>Subtotal</dt><dd>' + Carrito.formato(pedido.subtotal) + '</dd>' +
    (pedido.coupon ? '<dt>Descuento (' + pedido.coupon + ')</dt><dd class="desc-ok">− ' + Carrito.formato(pedido.descuento) + '</dd>' : '') +
    '<dt>Envío (' + pedido.shipping_tier + ')</dt><dd>' + (pedido.shipping === 0 ? "Gratis" : Carrito.formato(pedido.shipping)) + '</dd>' +
    '<dt class="total">Total</dt><dd class="total">' + Carrito.formato(pedido.value + pedido.shipping) + '</dd></dl>' +
    '<p class="nota">Pago simulado con ' + pedido.payment_type + ' · envío a ' + pedido.pais + '. No se realizó ningún cobro.</p></div>' +
    '<p id="estado-purchase" class="nota"></p>' +
    '<a class="btn" href="index.html">Seguir explorando</a></div>';

  var estado = document.getElementById("estado-purchase");
  if (pedido.enviado) {
    estado.textContent = "Este pedido ya se reportó a GA4: recargar la página no repite el evento purchase.";
    return;
  }

  /* user_properties no viaja entre páginas, por eso se repite antes de purchase. */
  Analytics.establecerPropiedadesUsuario({ tipo_cliente: pedido.tipo_cliente });
  var p = {
    transaction_id: pedido.transaction_id, affiliation: pedido.affiliation,
    value: pedido.value, shipping: pedido.shipping,
    tipo_cliente: pedido.tipo_cliente, items: pedido.items
  };
  if (pedido.coupon) p.coupon = pedido.coupon;
  Analytics.enviarEvento("purchase", p);

  pedido.enviado = true;
  try { sessionStorage.setItem("ec_pedido", JSON.stringify(pedido)); } catch (e) {}
  estado.textContent = "Evento purchase enviado una vez para este pedido.";
})();
