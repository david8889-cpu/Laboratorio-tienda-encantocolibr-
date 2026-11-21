/* Catálogo: view_item_list, select_item, view_promotion, select_promotion. */
(function () {
  var LISTA = { item_list_id: "catalogo_principal", item_list_name: "Catálogo principal" };
  var grid = document.getElementById("grid");

  PRODUCTOS.forEach(function (p, i) {
    var a = document.createElement("a");
    a.className = "tarjeta";
    a.href = "producto.html?id=" + encodeURIComponent(p.id);
    a.setAttribute("data-indice", i);
    a.innerHTML = '<div class="tarjeta-img">' + svgProducto(p) + '</div>' +
      '<div class="tarjeta-info"><span class="cat">' + p.categoria + '</span><h3>' + p.nombre + '</h3><p class="precio">' + Carrito.formato(p.precio) + '</p></div>';
    a.addEventListener("click", function (e) {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      Analytics.enviarYNavegar("select_item", {
        item_list_id: LISTA.item_list_id, item_list_name: LISTA.item_list_name,
        items: [Carrito.itemGA(p, 1, i, false)]
      }, a.href);
    });
    grid.appendChild(a);
  });

  Analytics.enviarEvento("view_item_list", {
    item_list_id: LISTA.item_list_id, item_list_name: LISTA.item_list_name,
    items: PRODUCTOS.map(function (p, i) { return Carrito.itemGA(p, 1, i, false); })
  });

  /* Banner del cupón */
  var banner = document.getElementById("banner");
  function paramsPromo() {
    return {
      promotion_id: CUPON.codigo, promotion_name: "Cupón de bienvenida 10 %",
      creative_name: "banner_inicio_bienvenida", creative_slot: "inicio_banner_superior",
      items: PRODUCTOS.map(function (p, i) { return Carrito.itemGA(p, 1, i, true); })
    };
  }
  if (Carrito.cuponActivo()) {
    banner.querySelector(".banner-titulo").textContent = "Cupón BIENVENIDA10 aplicado";
    banner.querySelector(".banner-texto").textContent = "Tu 10 % de descuento ya está en el carrito.";
    banner.querySelector(".banner-boton").textContent = "Ver carrito";
    banner.hidden = false;
  } else {
    banner.hidden = false;
    Analytics.enviarEvento("view_promotion", paramsPromo());
    banner.addEventListener("click", function (e) {
      e.preventDefault();
      Carrito.aplicarCupon(CUPON.codigo);
      Analytics.enviarYNavegar("select_promotion", paramsPromo(), "carrito.html");
    });
  }
})();
