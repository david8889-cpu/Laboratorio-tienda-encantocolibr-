# Encanto Colibrí · Tienda ficticia para el laboratorio de GA4

Sitio **académico de simulación** para el Diplomado en E-commerce y Negocios Internacionales Digitales.
Vende joyería artesanal en mostacilla y crochet (productos inventados). **No procesa pagos ni guarda datos personales.**
Solo HTML, CSS y JavaScript puros: sin frameworks, sin npm, sin servidor y sin base de datos.

## 1. Lo único que debes editar: `js/config.js`

```js
window.TIENDA_CONFIG = {
  GA_MEASUREMENT_ID: "G-XXXXXXXXXX", // pega aquí tu ID de medición
  DEBUG_MODE: true                   // true = aparece en DebugView
};
```

- El ID está en GA4 > Administrar > Flujos de datos > tu flujo web > **ID de medición**.
- Con el marcador `G-XXXXXXXXXX` **no se carga gtag.js**; el monitor muestra un aviso rojo.
- Con `DEBUG_MODE: true` se llama `gtag('config', ID, { debug_mode: true })`; con `false` no se envía `debug_mode`.

## 2. Estructura

| Archivo | Función |
|---|---|
| `index.html` + `js/index.js` | Catálogo y banner del cupón |
| `producto.html?id=COL-001` + `js/producto.js` | Detalle y agregar al carrito |
| `carrito.html` + `js/carrito-pagina.js` | Carrito y cupón |
| `checkout.html` + `js/checkout.js` | Envío (paso 1) y pago simulado (paso 2) |
| `gracias.html` + `js/gracias.js` | Confirmación y evento `purchase` |
| `js/config.js` | Configuración (único archivo que editas) |
| `js/productos.js` | 8 productos, cupón e ilustraciones SVG propias |
| `js/carrito.js` | Carrito en localStorage, cupón, tarifas de envío, formato de ítems GA4 |
| `js/analytics.js` | Carga gtag.js y expone `enviarEvento` y `enviarYNavegar` |
| `js/monitor.js` | Monitor de eventos (panel derecho) |
| `css/estilos.css` | Estilos |

## 3. Reglas de negocio

- **Cupón:** `BIENVENIDA10` = 10 % de descuento. Se aplica escribiéndolo en el carrito o con un clic en el banner del inicio.
- **Envío (COP):** Nacional Estándar 12.000 · Nacional Express 25.000 · Internacional Estándar 95.000 · Internacional Express 160.000.
  Nacional Estándar es **gratis desde 150.000** en productos (ya con descuento).
- **Países:** Colombia, México, Estados Unidos, España, Argentina, Chile, Perú y Ecuador. Colombia = Nacional; los demás = Internacional.
- **No se piden ni se guardan** correo, teléfono, documento ni datos de tarjeta. El nombre del checkout es ficticio y no se guarda ni se envía.

## 4. Contrato de medición

Todos los eventos llevan `currency: "COP"`. Cada ítem lleva `item_id, item_name, item_brand, item_category, price, quantity, index`; con cupón, `price` es el precio unitario con descuento y se añaden `discount` (por unidad) y `coupon`.

| Evento | Cuándo ocurre |
|---|---|
| `view_item_list` | Al cargar el catálogo (`catalogo_principal`) |
| `view_promotion` | Al mostrarse el banner del cupón |
| `select_promotion` | Clic en el banner (aplica el cupón y va al carrito) |
| `select_item` | Clic en un producto, antes de navegar |
| `view_item` | Al abrir el detalle |
| `add_to_cart` | Al agregar o aumentar unidades |
| `remove_from_cart` | Al quitar o disminuir unidades |
| `view_cart` | Al abrir el carrito con productos |
| `begin_checkout` | Al abrir `checkout.html` |
| `add_shipping_info` | Clic en "Continuar al pago" (con `shipping_tier`) |
| `add_payment_info` | Clic en "Pagar (simulado)" (con `payment_type`) |
| `purchase` | Al cargar `gracias.html`, una vez por pedido |

Notas de diseño:
- `value` = suma de `price × quantity` de los ítems (productos con descuento, **sin envío**). `shipping` va aparte en `purchase`.
- En `view_promotion` y `select_promotion`, los ítems son todo el catálogo con el descuento del cupón.
- `tipo_cliente` ("Nacional" o "Internacional") se envía como propiedad de usuario (`gtag('set','user_properties')`) al confirmar el envío y se **repite en `gracias.html` antes de `purchase`**, porque gtag no conserva esa propiedad entre páginas. También viaja como parámetro de `purchase`.
- Para verlo en reportes, registra `tipo_cliente` como dimensión personalizada en GA4 (Administrar > Definiciones personalizadas): una de alcance **usuario** y otra de alcance **evento**.
- `purchase` se protege con `sessionStorage`: el pedido se marca como enviado y recargar `gracias.html` no lo repite.

## 5. Monitor de eventos

Panel a la derecha (380 px; en pantallas de menos de 820 px pasa abajo con 300 px de alto). Muestra el estado de la conexión, el origen de la visita (UTM de la primera página de la sesión), las propiedades de usuario y los últimos 12 eventos (toca uno para ver sus parámetros). El botón **Simular nuevo visitante** borra las cookies `_ga*`, el carrito y `sessionStorage`, y vuelve al inicio.

Para probar UTM, abre la tienda así (como primera página de la sesión):
`https://TU-SITIO.vercel.app/?utm_source=newsletter&utm_medium=email&utm_campaign=lanzamiento`

## 6. Publicar en GitHub y Vercel

1. En github.com, crea un repositorio nuevo (por ejemplo `encanto-colibri`), público o privado.
2. Dentro del repositorio, pulsa **Add file > Upload files** y arrastra **el contenido** de la carpeta (`index.html`, las demás páginas, y las carpetas `css` y `js`), de modo que `index.html` quede en la raíz. Pulsa **Commit changes**.
3. Para poner tu ID: abre `js/config.js` en GitHub, pulsa el lápiz (Edit), cambia el ID y confirma con **Commit changes**.
4. En vercel.com entra con tu cuenta de GitHub, pulsa **Add New > Project** e importa el repositorio.
5. Deja **Framework Preset en "Other"**, sin comando de build ni directorio de salida, y pulsa **Deploy**.
6. Cada cambio que confirmes en GitHub se publica solo. Para ver eventos en vivo: GA4 > Administrar > **DebugView** (con `DEBUG_MODE: true`).
