/* Página del carrito: view_cart, add_to_cart, remove_from_cart y cupón. */
(function () {
  var cont = document.getElementById("carrito");
  var primera = true;

  function params(res, extra) {
    var p = { value: res.valor, items: res.items };
    if (res.cupon) p.coupon = res.cupon;
    return p;
  }

  function mover(id, delta) {
    var res = Carrito.resumen(), l = null;
    res.lineas.forEach(function (x) { if (x.prod.id === id) l = x; });
    if (!l) return;
    var conCupon = !!res.cupon, item;
    if (delta > 0) {
      item = Carrito.itemGA(l.prod, delta, l.index, conCupon);
      Carrito.agregar(id, delta);
      Analytics.enviarEvento("add_to_cart", { value: item.price * item.quantity, items: [item] });
    } else {
      var n = Math.min(-delta, l.cantidad);
      item = Carrito.itemGA(l.prod, n, l.index, conCupon);
      Carrito.quitar(id, n);
      Analytics.enviarEvento("remove_from_cart", { value: item.price * item.quantity, items: [item] });
    }
    pintar();
  }

  function pintar() {
    var res = Carrito.resumen();
    Carrito.pintarContador();
    if (!res.lineas.length) {
      cont.innerHTML = '<div class="vacio"><h2>Tu carrito está vacío</h2><p>Agrega una pieza del catálogo para empezar.</p><a class="btn" href="index.html">Ver catálogo</a></div>';
      return;
    }
    var filas = res.lineas.map(function (l) {
      var precio = res.cupon
        ? '<s>' + Carrito.formato(l.precioLista) + '</s> ' + Carrito.formato(l.precioUnidad)
        : Carrito.formato(l.precioLista);
      return '<li class="linea">' +
        '<div class="linea-img">' + svgProducto(l.prod) + '</div>' +
        '<div class="linea-info"><h3>' + l.prod.nombre + '</h3><p class="ref">' + l.prod.categoria + ' · ' + l.prod.id + '</p><p>' + precio + ' c/u</p></div>' +
        '<div class="linea-acc"><div class="cantidad"><button type="button" data-a="menos" data-id="' + l.prod.id + '" aria-label="Disminuir">−</button><span>' + l.cantidad + '</span><button type="button" data-a="mas" data-id="' + l.prod.id + '" aria-label="Aumentar">+</button></div>' +
        '<p class="subt">' + Carrito.formato(l.precioUnidad * l.cantidad) + '</p>' +
        '<button type="button" class="enlace" data-a="quitar" data-id="' + l.prod.id + '">Quitar</button></div></li>';
    }).join("");

    var cupon = res.cupon
      ? '<p class="cupon-ok">Cupón <b>' + res.cupon + '</b> aplicado (−10 %) <button type="button" class="enlace" data-a="quitar-cupon">Quitar cupón</button></p>'
      : '<form class="cupon" id="form-cupon"><input id="cupon" type="text" placeholder="Código de cupón" autocomplete="off" aria-label="Código de cupón"><button type="submit" class="btn btn-sec">Aplicar</button></form><p class="aviso error" id="err-cupon" hidden>Ese cupón no es válido. Prueba con BIENVENIDA10.</p>';

    cont.innerHTML =
      '<div class="dos-col"><ul class="lineas">' + filas + '</ul>' +
      '<aside class="resumen"><h2>Resumen</h2>' + cupon +
      '<dl><dt>Subtotal</dt><dd>' + Carrito.formato(res.subtotal) + '</dd>' +
      (res.cupon ? '<dt>Descuento</dt><dd class="desc-ok">− ' + Carrito.formato(res.descuento) + '</dd>' : '') +
      '<dt class="total">Total productos</dt><dd class="total">' + Carrito.formato(res.valor) + '</dd></dl>' +
      '<p class="nota">El envío se calcula en el pago.</p>' +
      '<a class="btn ancho" href="checkout.html">Ir al pago</a></aside></div>';

    if (primera) {
      primera = false;
      Analytics.enviarEvento("view_cart", params(res));
    }
  }

  cont.addEventListener("click", function (e) {
    var b = e.target.closest("[data-a]");
    if (!b) return;
    var a = b.getAttribute("data-a"), id = b.getAttribute("data-id");
    if (a === "mas") mover(id, 1);
    else if (a === "menos") mover(id, -1);
    else if (a === "quitar") {
      var l = Carrito.resumen().lineas.filter(function (x) { return x.prod.id === id; })[0];
      if (l) mover(id, -l.cantidad);
    } else if (a === "quitar-cupon") { Carrito.quitarCupon(); pintar(); }
  });
  cont.addEventListener("submit", function (e) {
    if (e.target.id !== "form-cupon") return;
    e.preventDefault();
    if (Carrito.aplicarCupon(document.getElementById("cupon").value)) pintar();
    else document.getElementById("err-cupon").hidden = false;
  });

  pintar();
})();
