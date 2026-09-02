# Instrucciones de trabajo — casalogosdev

## Propósito y límites

Este repositorio contiene el código y los assets de la landing estática de Casa Lógos.

- Incluye: `index.html`, estilos CSS, JavaScript ejecutado en el navegador y assets estáticos de la landing.
- No incluye: el sistema operativo de DEV Team, aplicaciones o instalaciones de clientes, datos de clientes ni infraestructura de producción.
- Clasificación: activo web público mantenido como preview estático; publicar o cambiar su hosting requiere autorización vigente en un issue específico.

## Fuente del estado vivo

`AGENTS.md` contiene reglas estables de trabajo; no es un tablero, checkpoint ni registro diario.

Antes de ejecutar cambios:

1. identificar operador, proyecto, issue y objetivo;
2. consultar [`Dev-Team-Alex-y-Wicho/dev-team-operations/docs/operacion/START-HERE.md`](https://github.com/Dev-Team-Alex-y-Wicho/dev-team-operations/blob/main/docs/operacion/START-HERE.md);
3. revisar `attention:luis` cuando opera Luis/Codex, o la bandeja correspondiente al operador, y el comentario canónico vigente;
4. leer completos el issue operativo activo y el issue técnico correspondiente;
5. actualizar `main` y leer `README.md` y los archivos técnicos afectados de este repositorio;
6. confirmar permisos, datos permitidos, pruebas, evidencia y rollback.

El estado vivo, las prioridades, los handoffs y la siguiente acción pertenecen a `dev-team-operations`, al issue/PR correspondiente y a GitHub. No registrar aquí el próximo trabajo, un PR activo, responsables temporales ni otra información que pueda caducar.

## Seguridad, privacidad y publicación

- No incluir secretos, credenciales, códigos 2FA, datos clínicos, respaldos ni datos privados de clientes o prospectos.
- Usar únicamente contenido público aprobado, datos sintéticos o casos sanitizados y correctamente identificados.
- No inventar testimonios, métricas, clientes, integrantes del equipo ni afirmaciones que no tengan evidencia y autorización.
- Mantener separados producto reusable, casos reales sanitizados, demostraciones y material público.
- No añadir analítica, formularios, servicios externos ni captura de datos sin un issue y una revisión explícita de privacidad y seguridad.
- No publicar, desplegar, habilitar o modificar GitHub Pages, dominio, DNS o hosting sin un ticket y autorización vigentes. Una compatibilidad técnica con GitHub Pages no equivale a permiso de publicación.

## Arquitectura y reglas técnicas

- Stack soportado: HTML5, CSS y JavaScript vanilla ejecutado directamente en el navegador; no hay framework, gestor de paquetes ni paso de build.
- Punto de entrada: `index.html`, que referencia `styles.css`, `script.js` y assets mediante rutas relativas y debe poder abrirse directamente en un navegador.
- Arquitectura: landing de una sola página con navegación por anclas, comportamiento progresivo en `script.js`, estilos responsive y soporte para `prefers-reduced-motion`.
- Conservar HTML semántico, navegación por teclado, atributos accesibles, comportamiento responsive y reducción de movimiento cuando se modifique la interfaz.
- No introducir dependencias, toolchains o servicios de terceros salvo que el issue lo requiera y se documenten también su validación, seguridad y rollback.
- Este repositorio no administra bases de datos ni migraciones. Cualquier integración futura debe permanecer fuera hasta contar con alcance y autorización propios.

## Flujo de trabajo y validación

1. partir de `main` vigente y trabajar mediante una rama y PR asociados al issue activo;
2. mantener el diff dentro del alcance del issue y no mezclar cambios de contenido, diseño, publicación o infraestructura;
3. ejecutar `git diff --check` y revisar el diff completo antes de cada commit;
4. confirmar con `git diff --name-only origin/main...HEAD` que sólo cambiaron los archivos autorizados;
5. para cambios en la landing, abrir `index.html` directamente en un navegador y verificar navegación, consola, enlaces, teclado, vistas responsive y preferencia de movimiento reducido; no existe una suite automatizada ni un build;
6. registrar pruebas, evidencia segura, limitaciones y rollback en el issue o PR;
7. reconciliar checklist, issue, PR y documentación técnica antes de declarar cierre;
8. dejar un checkpoint en GitHub con la plantilla central cuando la sesión se pause.

Para cambios exclusivamente documentales, la validación proporcional consiste en revisar el diff, ejecutar `git diff --check`, comprobar rutas y comandos contra el repositorio real y verificar que no se introdujo estado vivo ni información sensible.

## Acciones que requieren handoff

Preparar el cambio y solicitar revisión o aprobación de Alexis antes de publicaciones, cambios de hosting o GitHub Pages, dominios/DNS, servicios externos, permisos sensibles, uso de datos reales, gastos, cambios de gobierno o acciones destructivas.

## Rollback de estas instrucciones

Si este archivo contradice `START-HERE`, el issue activo, `README.md` o una decisión vigente, detener el trabajo, registrar la contradicción y corregir o revertir `AGENTS.md` por PR conservando el historial. Revertir el PR que añadió o modificó estas instrucciones restaura el estado técnico anterior sin afectar la landing.
