/* Catálogo ficticio de Encanto Colibrí. Precios enteros en COP. */
window.MARCA = "Encanto Colibrí";
window.CUPON = { codigo: "BIENVENIDA10", porcentaje: 10 };

window.PRODUCTOS = [
  { id: "COL-001", nombre: "Aretes Gota Aurora", categoria: "Aretes", precio: 48000, sigla: "AG",
    descripcion: "Aretes largos en mostacilla checa con degradé de naranja a rojo. Livianos, tejidos a mano gota por gota.",
    colores: ["#f2994a", "#eb5757", "#f2c94c"], fondo: ["#fff1e6", "#ffd9c2"] },
  { id: "COL-002", nombre: "Collar Colibrí Esmeralda", categoria: "Collares", precio: 89000, sigla: "CE",
    descripcion: "Collar en mostacilla verde y azul con un dije de colibrí bordado. Cierre ajustable en cordón encerado.",
    colores: ["#0f9d8a", "#1c6e8c", "#7ed6c1"], fondo: ["#e3f6f2", "#bfe8e0"] },
  { id: "COL-003", nombre: "Pulsera Arcoíris Wayuu", categoria: "Pulseras", precio: 36000, sigla: "PA",
    descripcion: "Pulsera elástica de mostacilla con patrón geométrico inspirado en los tejidos del Caribe colombiano.",
    colores: ["#e63946", "#f4a261", "#2a9d8f"], fondo: ["#fdeef0", "#fbd5da"] },
  { id: "COL-004", nombre: "Tobillera Mar Caribe", categoria: "Tobilleras", precio: 42000, sigla: "TM",
    descripcion: "Tobillera de cuentas azules y perlas blancas, pensada para el verano. Cierre de argolla y extensión.",
    colores: ["#1d8fe1", "#7fd1f0", "#f7f7f7"], fondo: ["#e6f3fd", "#c6e4fa"] },
  { id: "COL-005", nombre: "Aretes Flor Crochet", categoria: "Aretes", precio: 52000, sigla: "AF",
    descripcion: "Pequeñas flores tejidas en crochet con centro de mostacilla. Ganchos hipoalergénicos.",
    colores: ["#c05299", "#f7a8d0", "#f6d365"], fondo: ["#fceef6", "#f8d3e8"] },
  { id: "COL-006", nombre: "Collar Sol de Nácar", categoria: "Collares", precio: 115000, sigla: "SN",
    descripcion: "Collar de dos vueltas en mostacilla dorada y nácar, con dije central bordado. Pieza de edición limitada.",
    colores: ["#e0b04a", "#f5e6c4", "#b8862b"], fondo: ["#fbf4e2", "#f1e0b2"] },
  { id: "COL-007", nombre: "Set Pulseras Amanecer", categoria: "Pulseras", precio: 78000, sigla: "SA",
    descripcion: "Tres pulseras combinables en tonos violeta, rosa y durazno. Se pueden usar juntas o por separado.",
    colores: ["#7b61ff", "#ff7eb3", "#ffb86c"], fondo: ["#efecff", "#dcd5ff"] },
  { id: "COL-008", nombre: "Anillo Mosaico", categoria: "Anillos", precio: 29000, sigla: "AM",
    descripcion: "Anillo ajustable en crochet fino con una piedra central de mostacilla multicolor.",
    colores: ["#2f855a", "#d69e2e", "#c53030"], fondo: ["#e9f5ee", "#cfe8d9"] }
];

window.buscarProducto = function (id) {
  for (var i = 0; i < PRODUCTOS.length; i++) if (PRODUCTOS[i].id === id) return PRODUCTOS[i];
  return null;
};

/* Ilustración propia en SVG (sin imágenes externas). */
window.svgProducto = function (p) {
  var c = p.colores, out = "", i, j, a, x, y;
  function cuenta(x, y, r, col) {
    return '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="' + r + '" fill="' + col + '" stroke="rgba(0,0,0,.10)" stroke-width=".8"/>' +
           '<circle cx="' + (x - r * 0.3).toFixed(1) + '" cy="' + (y - r * 0.3).toFixed(1) + '" r="' + (r * 0.28).toFixed(1) + '" fill="#fff" opacity=".6"/>';
  }
  if (p.categoria === "Collares") {
    for (i = 0; i < 17; i++) { a = (20 + i * 8.75) * Math.PI / 180; out += cuenta(100 + 82 * Math.cos(a), 24 + 100 * Math.sin(a), 6.5, c[i % 3]); }
    out += cuenta(100, 148, 13, c[0]) + cuenta(100, 168, 7, c[2]);
  } else if (p.categoria === "Aretes") {
    [64, 136].forEach(function (s) { for (j = 0; j < 6; j++) out += cuenta(s, 34 + j * 20, 9 - j * 0.9, c[j % 3]); });
  } else if (p.categoria === "Anillos") {
    for (i = 0; i < 14; i++) { a = i * 2 * Math.PI / 14; out += cuenta(100 + 34 * Math.cos(a), 108 + 34 * Math.sin(a), 5.5, c[i % 3]); }
    out += cuenta(100, 70, 15, c[0]) + cuenta(100, 70, 6, c[2]);
  } else {
    var n = p.categoria === "Tobilleras" ? 22 : 18, r = p.categoria === "Tobilleras" ? 5.6 : 7.4;
    for (i = 0; i < n; i++) { a = i * 2 * Math.PI / n; out += cuenta(100 + 58 * Math.cos(a), 98 + 58 * Math.sin(a), r, c[i % 3]); }
  }
  var gid = "g" + p.id.replace("-", "");
  return '<svg viewBox="0 0 200 200" role="img" aria-label="Ilustración de ' + p.nombre + '" xmlns="http://www.w3.org/2000/svg">' +
    '<defs><linearGradient id="' + gid + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + p.fondo[0] + '"/><stop offset="1" stop-color="' + p.fondo[1] + '"/></linearGradient></defs>' +
    '<rect width="200" height="200" fill="url(#' + gid + ')"/>' + out +
    '<text x="100" y="192" text-anchor="middle" font-family="-apple-system,Helvetica,Arial,sans-serif" font-size="12" font-weight="600" letter-spacing="3" fill="#1d1d1f" opacity=".4">' + p.sigla + '</text></svg>';
};
