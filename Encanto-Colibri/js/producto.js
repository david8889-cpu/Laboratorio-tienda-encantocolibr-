/* Detalle de producto: view_item y add_to_cart. */
(function () {
  var cont = document.getElementById("detalle");
  var id = new URLSearchParams(location.search).get("id");
  var p = buscarProducto(id);

  if (!p) {
    cont.innerHTML = '<div class="vacio"><h2>No encontramos ese producto</h2><p>Revisa el enlace o vuelve al catálogo.</p><a class="btn" href="index.html">Ver catálogo</a></div>';
    return;
  }
  document.title = p.nombre + " · Encanto Colibrí";

  var cantidad = 1;
  cont.innerHTML =
    '<div class="detalle-grid">' +
      '<div class="detalle-img">' + svgProducto(p) + '</div>' +
      '<div class="detalle-info">' +
        '<span class="cat">' + p.categoria + '</span><h1>' + p.nombre + '</h1>' +
        '<p class="precio grande">' + Carrito.formato(p.precio) + '</p>' +
        '<p class="desc">' + p.descripcion + '</p>' +
        '<p class="ref">Referencia ' + p.id + '</p>' +
        '<div class="cantidad"><button type="button" id="menos" aria-label="Menos">−</button><span id="cant">1</span><button type="button" id="mas" aria-label="Más">+</button></div>' +
        '<div class="acciones"><button type="button" class="btn" id="agregar">Agregar al carrito</button><a class="btn btn-sec" href="carrito.html">Ver carrito</a></div>' +
        '<p class="aviso" id="aviso" role="status" hidden></p>' +
      '</div>' +
    '</div>';

  var elCant = document.getElementById("cant");
  document.getElementById("menos").addEventListener("click", function () { if (cantidad > 1) elCant.textContent = --cantidad; });
  document.getElementById("mas").addEventListener("click", function () { if (cantidad < 10) elCant.textContent = ++cantidad; });

  document.getElementById("agregar").addEventListener("click", function () {
    var conCupon = !!Carrito.cuponActivo();
    var item = Carrito.itemGA(p, cantidad, 0, conCupon);
    Carrito.agregar(p.id, cantidad);
    Analytics.enviarEvento("add_to_cart", { value: item.price * item.quantity, items: [item] });
    Carrito.pintarContador();
    var av = document.getElementById("aviso");
    av.textContent = cantidad + (cantidad === 1 ? " unidad agregada" : " unidades agregadas") + " al carrito.";
    av.hidden = false;
  });

  Analytics.enviarEvento("view_item", { value: p.precio, items: [Carrito.itemGA(p, 1, 0, false)] });
})();
