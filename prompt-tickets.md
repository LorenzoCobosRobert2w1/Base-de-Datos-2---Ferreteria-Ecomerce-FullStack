# SESIÓN DE MANTENIMIENTO ESTRICTO Y NUEVAS FEATURES

**CONTEXTO TÉCNICO:** Seguimos trabajando bajo las directrices de `gemini.md` y `restrictions.md` (Vanilla JS, HTML/CSS puro, Node.js + MongoDB). 

**REGLA DE ORO (ANTI-ALUCINACIONES Y ANTI-BORRADO):** 1. NO reescribas ni borres módulos enteros. Aplica parches mínimos y precisos.
2. NO asumas ni inventes cómo está estructurado mi código actualmente. 
3. Por cada ticket, **debes pedirme** que te comparta el fragmento de código específico (HTML, JS o Controlador) que necesitas ver para diagnosticar el problema real antes de generar la solución.

## TICKETS ACTIVOS:

- **Ticket 1 (Bug Crítico - Lógica de POS/Ventas):** No funciona el proceso de venta. Hay productos (ej. "Martillo") que tienen stock comprobado en la base de datos, pero el sistema no permite venderlos o finalizar la compra.
- **Ticket 2 (UI/CSS - Gráficos Desbordados):** Los gráficos renderizados (barras, líneas, torta) son gigantes y rompen la estructura visual. Necesito aplicar CSS y configuración en Chart.js para que se mantengan pequeños, concisos y dentro de sus tarjetas.
- **Ticket 3 (Nueva Feature - Rango de Fechas):** Necesito añadir un margen de fechas (inputs "Desde" y "Hasta") en el dashboard de inicio. Al cambiar las fechas, los gráficos y las tarjetas de ventas deben actualizarse consultando a MongoDB.

## PROTOCOLO DE EJECUCIÓN:
Está estrictamente prohibido intentar resolver los 3 tickets en una sola respuesta. Vamos a trabajar uno por uno.

Iniciemos ÚNICAMENTE por el **Ticket 1**. ¿Qué fragmentos de mi código actual (ej: función `addToCart`, fetch del checkout o el endpoint del backend) necesitas que te comparta para encontrar por qué falla el stock?