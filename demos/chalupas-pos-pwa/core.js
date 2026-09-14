(function (global) {
  'use strict';
  function toCents(value) {
    var n = Number(value);
    if (!Number.isFinite(n)) return 0;
    return Math.round(n * 100);
  }
  function formatMoney(cents) {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 2 }).format((cents || 0) / 100);
  }
  function calculateTotal(lines, productsById) {
    return Object.keys(lines).reduce(function (sum, id) {
      var qty = lines[id] || 0;
      var product = productsById[id];
      return sum + (product ? product.priceCents * qty : 0);
    }, 0);
  }
  function calculateChange(receivedCents, totalCents) {
    return Math.max(0, receivedCents - totalCents);
  }
  function buildSaleSnapshot(lines, productsById, receivedCents, folio, nowIso) {
    var items = Object.keys(lines).filter(function (id) { return lines[id] > 0; }).map(function (id) {
      var p = productsById[id];
      return { productId: id, name: p.name, unitPriceCents: p.priceCents, quantity: lines[id], lineTotalCents: p.priceCents * lines[id] };
    });
    var totalCents = items.reduce(function (sum, item) { return sum + item.lineTotalCents; }, 0);
    if (!items.length) throw new Error('La venta no contiene productos.');
    if (receivedCents < totalCents) throw new Error('El efectivo recibido es insuficiente.');
    return {
      id: 'sale-' + folio,
      folio: folio,
      createdAt: nowIso,
      items: items,
      totalCents: totalCents,
      payment: { method: 'cash', receivedCents: receivedCents, changeCents: calculateChange(receivedCents, totalCents) }
    };
  }
  global.ChalupasCore = { toCents: toCents, formatMoney: formatMoney, calculateTotal: calculateTotal, calculateChange: calculateChange, buildSaleSnapshot: buildSaleSnapshot };
})(window);
