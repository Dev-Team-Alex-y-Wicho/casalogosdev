# Chalupas POS — PWA spike

Spike público con **datos 100% sintéticos** para el issue operativo `CHAL-POS-002` (#93). No contiene menú real, datos personales, credenciales, pagos reales ni integración de impresora.

## Objetivo
Validar en iPad 5 / iPadOS 16.7.16:
- instalación desde Safari;
- flujo `2 × A + 1 × B = $75`;
- cobro `$100` → cambio `$25`;
- persistencia IndexedDB;
- cierre/reapertura;
- operación offline;
- export/restore de respaldo JSON.

## Riesgo de almacenamiento
IndexedDB no se considera copia única duradera. El respaldo externo forma parte del criterio de aceptación.

## Fuera de alcance
Impresión/comandera, menú real, CFDI, nube, usuarios, multi-caja y migración completa del MVP.
