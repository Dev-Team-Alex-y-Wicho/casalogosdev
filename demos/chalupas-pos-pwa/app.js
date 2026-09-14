(function () {
  'use strict';
  var Core = window.ChalupasCore;
  var Db = window.ChalupasDb;
  var state = { products: [], productsById: {}, cart: {}, sales: [] };
  var $ = function (id) { return document.getElementById(id); };
  var els = {
    productGrid: $('productGrid'), cartList: $('cartList'), cartTotal: $('cartTotal'), received: $('receivedAmount'), change: $('changeAmount'), charge: $('chargeBtn'), salesList: $('salesList'), saleCount: $('saleCount'), network: $('networkStatus'), storage: $('storageStatus'), toast: $('toast'), receipt: $('receiptDialog'), receiptFolio: $('receiptFolio'), receiptTotal: $('receiptTotal'), receiptReceived: $('receiptReceived'), receiptChange: $('receiptChange'), installMode: $('installMode')
  };

  function showToast(message) {
    els.toast.textContent = message; els.toast.classList.add('show');
    clearTimeout(showToast.timer); showToast.timer = setTimeout(function () { els.toast.classList.remove('show'); }, 2600);
  }
  function updateNetwork() {
    var online = navigator.onLine;
    els.network.textContent = online ? 'En línea' : 'Offline · listo para operar';
    els.network.className = 'status ' + (online ? 'online' : 'offline');
  }
  function productMap() {
    state.productsById = {};
    state.products.forEach(function (p) { state.productsById[p.id] = p; });
  }
  function renderProducts() {
    els.productGrid.innerHTML = '';
    state.products.filter(function (p) { return p.active !== false; }).forEach(function (p) {
      var btn = document.createElement('button'); btn.type = 'button'; btn.className = 'product-card'; btn.dataset.id = p.id;
      btn.innerHTML = '<strong>' + escapeHtml(p.name) + '</strong><span class="price">' + Core.formatMoney(p.priceCents) + '</span>';
      btn.addEventListener('click', function () { state.cart[p.id] = (state.cart[p.id] || 0) + 1; renderCart(); });
      els.productGrid.appendChild(btn);
    });
  }
  function renderCart() {
    var ids = Object.keys(state.cart).filter(function (id) { return state.cart[id] > 0; });
    var total = Core.calculateTotal(state.cart, state.productsById);
    els.cartTotal.textContent = Core.formatMoney(total);
    if (!ids.length) {
      els.cartList.className = 'cart-list empty-state'; els.cartList.textContent = 'Toca un producto para comenzar.';
    } else {
      els.cartList.className = 'cart-list'; els.cartList.innerHTML = '';
      ids.forEach(function (id) {
        var p = state.productsById[id], qty = state.cart[id];
        var row = document.createElement('div'); row.className = 'cart-row';
        row.innerHTML = '<div><h3>' + escapeHtml(p.name) + '</h3><p>' + qty + ' × ' + Core.formatMoney(p.priceCents) + ' = ' + Core.formatMoney(qty * p.priceCents) + '</p></div><div class="qty-controls"><button type="button" data-action="minus" aria-label="Quitar una unidad">−</button><strong>' + qty + '</strong><button type="button" data-action="plus" aria-label="Agregar una unidad">+</button></div>';
        row.querySelector('[data-action="minus"]').addEventListener('click', function () { state.cart[id] = Math.max(0, state.cart[id] - 1); renderCart(); });
        row.querySelector('[data-action="plus"]').addEventListener('click', function () { state.cart[id] += 1; renderCart(); });
        els.cartList.appendChild(row);
      });
    }
    updatePayment();
  }
  function updatePayment() {
    var total = Core.calculateTotal(state.cart, state.productsById);
    var received = Core.toCents(els.received.value);
    els.change.textContent = Core.formatMoney(Core.calculateChange(received, total));
    els.charge.disabled = total <= 0 || received < total;
  }
  function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[c]; });
  }
  function renderSales() {
    var sales = state.sales.slice().sort(function (a, b) { return b.folio - a.folio; });
    els.saleCount.textContent = String(sales.length);
    if (!sales.length) { els.salesList.className = 'sales-list empty-state'; els.salesList.textContent = 'Aún no hay ventas guardadas.'; return; }
    els.salesList.className = 'sales-list'; els.salesList.innerHTML = '';
    sales.slice(0, 8).forEach(function (s) {
      var el = document.createElement('div'); el.className = 'sale-card';
      el.innerHTML = '<div><strong>Folio ' + s.folio + '</strong><p>' + new Date(s.createdAt).toLocaleString('es-MX') + ' · ' + s.items.length + ' partida(s)</p></div><strong>' + Core.formatMoney(s.totalCents) + '</strong>';
      els.salesList.appendChild(el);
    });
  }
  async function refreshData() {
    state.products = await Db.getProducts(); productMap(); state.sales = await Db.getSales(); renderProducts(); renderCart(); renderSales();
  }
  async function charge() {
    try {
      var received = Core.toCents(els.received.value);
      var sale = await Db.saveSale(function (folio) { return Core.buildSaleSnapshot(state.cart, state.productsById, received, folio, new Date().toISOString()); });
      state.sales.push(sale);
      els.receiptFolio.textContent = 'Folio ' + sale.folio;
      els.receiptTotal.textContent = Core.formatMoney(sale.totalCents);
      els.receiptReceived.textContent = Core.formatMoney(sale.payment.receivedCents);
      els.receiptChange.textContent = Core.formatMoney(sale.payment.changeCents);
      state.cart = {}; els.received.value = '0'; renderCart(); renderSales();
      if (typeof els.receipt.showModal === 'function') els.receipt.showModal(); else showToast('Venta guardada. Cambio: ' + Core.formatMoney(sale.payment.changeCents));
    } catch (err) { showToast(err.message || 'No se pudo guardar la venta.'); }
  }
  function resetCurrentSale() { state.cart = {}; els.received.value = '0'; renderCart(); showToast('Venta actual reiniciada.'); }
  async function exportBackup() {
    try {
      var data = await Db.exportSnapshot();
      var text = JSON.stringify(data, null, 2);
      var blob = new Blob([text], { type: 'application/json' });
      var filename = 'chalupas-pos-backup-' + new Date().toISOString().replace(/[:.]/g, '-') + '.json';
      var file = new File([blob], filename, { type: 'application/json' });
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: 'Respaldo Chalupas POS' });
        showToast('Respaldo enviado al menú Compartir. Guárdalo en Archivos.');
      } else {
        var url = URL.createObjectURL(blob); var a = document.createElement('a'); a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
        showToast('Respaldo generado. Guárdalo fuera del navegador.');
      }
    } catch (err) { if (err && err.name === 'AbortError') return; showToast('No se pudo crear el respaldo: ' + (err.message || err)); }
  }
  async function restoreBackup(file) {
    try {
      var text = await file.text(); var data = JSON.parse(text); Db.validateSnapshot(data);
      if (!confirm('Esto reemplazará los datos demo actuales. ¿Continuar?')) return;
      await Db.restoreSnapshot(data); state.cart = {}; els.received.value = '0'; await refreshData(); showToast('Respaldo restaurado correctamente.');
    } catch (err) { showToast('Restauración rechazada: ' + (err.message || 'archivo inválido')); }
  }
  async function resetDemoData() {
    if (!confirm('¿Borrar ventas y reiniciar los datos sintéticos?')) return;
    await Db.resetDemo(); state.cart = {}; els.received.value = '0'; await refreshData(); showToast('Datos demo reiniciados.');
  }
  async function inspectStorage() {
    var parts = ['IndexedDB activo'];
    try {
      if (navigator.storage && navigator.storage.persisted) {
        var persisted = await navigator.storage.persisted();
        if (!persisted && navigator.storage.persist) persisted = await navigator.storage.persist();
        parts.push(persisted ? 'persistencia reforzada concedida' : 'persistencia reforzada no concedida');
      } else { parts.push('Storage Persistence API no disponible en este navegador'); }
      if (navigator.storage && navigator.storage.estimate) {
        var estimate = await navigator.storage.estimate();
        if (estimate && estimate.usage != null && estimate.quota != null) parts.push('uso aprox. ' + Math.round(estimate.usage / 1024) + ' KB de ' + Math.round(estimate.quota / 1024 / 1024) + ' MB');
      }
    } catch (_) { parts.push('no se pudo consultar la cuota'); }
    els.storage.textContent = 'Almacenamiento: ' + parts.join(' · ') + '. Mantén respaldos externos.';
  }
  async function registerServiceWorker() {
    if (!('serviceWorker' in navigator)) { showToast('Este navegador no soporta Service Worker.'); return; }
    try { await navigator.serviceWorker.register('./sw.js', { scope: './' }); } catch (err) { showToast('No se pudo preparar el modo offline.'); }
  }
  function detectInstallMode() {
    var standalone = window.matchMedia && window.matchMedia('(display-mode: standalone)').matches;
    var iosStandalone = window.navigator.standalone === true;
    els.installMode.textContent = (standalone || iosStandalone) ? 'Modo: instalada como app de pantalla de inicio.' : 'Modo: navegador. En iPad, instálala desde Safari para la prueba definitiva.';
  }
  function bindEvents() {
    els.received.addEventListener('input', updatePayment);
    document.querySelectorAll('[data-cash]').forEach(function (b) { b.addEventListener('click', function () { els.received.value = b.dataset.cash; updatePayment(); }); });
    els.charge.addEventListener('click', charge);
    $('newSaleBtn').addEventListener('click', resetCurrentSale);
    $('backupBtn').addEventListener('click', exportBackup);
    $('restoreInput').addEventListener('change', function (e) { var f = e.target.files && e.target.files[0]; if (f) restoreBackup(f); e.target.value = ''; });
    $('resetBtn').addEventListener('click', resetDemoData);
    $('closeReceiptBtn').addEventListener('click', function () { if (els.receipt.open) els.receipt.close(); });
    window.addEventListener('online', updateNetwork); window.addEventListener('offline', updateNetwork);
  }
  async function boot() {
    updateNetwork(); detectInstallMode(); bindEvents(); await registerServiceWorker(); await refreshData(); await inspectStorage();
  }
  boot().catch(function (err) { console.error(err); showToast('Error de inicio: ' + (err.message || err)); });
})();
