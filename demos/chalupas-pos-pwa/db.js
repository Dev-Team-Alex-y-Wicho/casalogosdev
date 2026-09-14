(function (global) {
  'use strict';
  var DB_NAME = 'chalupas-pos-pwa';
  var DB_VERSION = 1;
  var PRODUCTS = [
    { id: 'demo-a', name: 'Producto demo A', priceCents: 2000, active: true },
    { id: 'demo-b', name: 'Producto demo B', priceCents: 3500, active: true }
  ];

  function requestToPromise(request) {
    return new Promise(function (resolve, reject) {
      request.onsuccess = function () { resolve(request.result); };
      request.onerror = function () { reject(request.error || new Error('IndexedDB error')); };
    });
  }
  function txDone(tx) {
    return new Promise(function (resolve, reject) {
      tx.oncomplete = function () { resolve(); };
      tx.onabort = function () { reject(tx.error || new Error('Transacción cancelada')); };
      tx.onerror = function () { reject(tx.error || new Error('Error de transacción')); };
    });
  }
  function openDb() {
    return new Promise(function (resolve, reject) {
      var req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = function () {
        var db = req.result;
        if (!db.objectStoreNames.contains('products')) db.createObjectStore('products', { keyPath: 'id' });
        if (!db.objectStoreNames.contains('sales')) db.createObjectStore('sales', { keyPath: 'id' });
        if (!db.objectStoreNames.contains('meta')) db.createObjectStore('meta', { keyPath: 'key' });
      };
      req.onsuccess = function () { resolve(req.result); };
      req.onerror = function () { reject(req.error || new Error('No se pudo abrir IndexedDB')); };
    });
  }
  async function ensureSeed(db) {
    var tx = db.transaction(['products', 'meta'], 'readwrite');
    var products = tx.objectStore('products');
    var meta = tx.objectStore('meta');
    var count = await requestToPromise(products.count());
    if (count === 0) PRODUCTS.forEach(function (p) { products.put(p); });
    var next = await requestToPromise(meta.get('nextFolio'));
    if (!next) meta.put({ key: 'nextFolio', value: 1 });
    meta.put({ key: 'schemaVersion', value: 1 });
    await txDone(tx);
  }
  async function getAll(storeName) {
    var db = await openDb();
    await ensureSeed(db);
    var tx = db.transaction(storeName, 'readonly');
    var result = await requestToPromise(tx.objectStore(storeName).getAll());
    db.close();
    return result;
  }
  async function saveSale(buildSaleFn) {
    var db = await openDb();
    await ensureSeed(db);
    var tx = db.transaction(['sales', 'meta'], 'readwrite');
    var metaStore = tx.objectStore('meta');
    var salesStore = tx.objectStore('sales');
    var meta = await requestToPromise(metaStore.get('nextFolio'));
    var folio = meta && Number(meta.value) ? Number(meta.value) : 1;
    var sale = buildSaleFn(folio);
    salesStore.add(sale);
    metaStore.put({ key: 'nextFolio', value: folio + 1 });
    await txDone(tx);
    db.close();
    return sale;
  }
  async function exportSnapshot() {
    var db = await openDb();
    await ensureSeed(db);
    var tx = db.transaction(['products', 'sales', 'meta'], 'readonly');
    var products = await requestToPromise(tx.objectStore('products').getAll());
    var sales = await requestToPromise(tx.objectStore('sales').getAll());
    var meta = await requestToPromise(tx.objectStore('meta').getAll());
    await txDone(tx);
    db.close();
    return { app: 'chalupas-pos-pwa', backupVersion: 1, createdAt: new Date().toISOString(), products: products, sales: sales, meta: meta };
  }
  function validateSnapshot(data) {
    if (!data || data.app !== 'chalupas-pos-pwa' || data.backupVersion !== 1) throw new Error('El archivo no es un respaldo compatible.');
    if (!Array.isArray(data.products) || !Array.isArray(data.sales) || !Array.isArray(data.meta)) throw new Error('El respaldo está incompleto.');
    data.products.forEach(function (p) {
      if (!p || typeof p.id !== 'string' || typeof p.name !== 'string' || !Number.isInteger(p.priceCents) || p.priceCents < 0) throw new Error('Producto inválido en respaldo.');
    });
    data.sales.forEach(function (s) {
      if (!s || typeof s.id !== 'string' || !Number.isInteger(s.folio) || !Number.isInteger(s.totalCents) || !Array.isArray(s.items)) throw new Error('Venta inválida en respaldo.');
    });
    return true;
  }
  async function restoreSnapshot(data) {
    validateSnapshot(data);
    var db = await openDb();
    var tx = db.transaction(['products', 'sales', 'meta'], 'readwrite');
    var stores = { products: tx.objectStore('products'), sales: tx.objectStore('sales'), meta: tx.objectStore('meta') };
    stores.products.clear(); stores.sales.clear(); stores.meta.clear();
    data.products.forEach(function (v) { stores.products.put(v); });
    data.sales.forEach(function (v) { stores.sales.put(v); });
    data.meta.forEach(function (v) { stores.meta.put(v); });
    await txDone(tx);
    db.close();
  }
  async function resetDemo() {
    var db = await openDb();
    var tx = db.transaction(['products', 'sales', 'meta'], 'readwrite');
    tx.objectStore('products').clear(); tx.objectStore('sales').clear(); tx.objectStore('meta').clear();
    await txDone(tx); db.close();
    var db2 = await openDb(); await ensureSeed(db2); db2.close();
  }

  global.ChalupasDb = { openDb: openDb, getProducts: function () { return getAll('products'); }, getSales: function () { return getAll('sales'); }, saveSale: saveSale, exportSnapshot: exportSnapshot, restoreSnapshot: restoreSnapshot, resetDemo: resetDemo, validateSnapshot: validateSnapshot };
})(window);
