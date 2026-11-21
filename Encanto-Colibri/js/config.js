/* ============================================================
   CONFIGURACIÓN DE LA TIENDA  ·  Este es el ÚNICO archivo que debes editar
   ============================================================

   1) GA_MEASUREMENT_ID
      Pega aquí el ID de medición de tu flujo de datos web de GA4.
      Lo encuentras en: GA4 > Administrar (engranaje) > Flujos de datos
      > tu flujo web > "ID de medición". Tiene la forma G-ABC123DEF4.
      Mientras dejes el marcador "G-XXXXXXXXXX", NO se carga Google
      Analytics y los eventos solo se muestran en el monitor de la tienda.

   2) DEBUG_MODE
      true  -> los eventos se envían con debug_mode y aparecen en
               GA4 > Administrar > DebugView (ideal para el laboratorio).
      false -> envío normal, sin debug_mode.
   ============================================================ */
window.TIENDA_CONFIG = {
  GA_MEASUREMENT_ID: "G-XXXXXXXXXX", // <- pega aquí tu ID (entre comillas)
  DEBUG_MODE: true                   // <- true o false (sin comillas)
};
