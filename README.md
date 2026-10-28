# Peryssea · Setlist

Reproductor local para la playlist de preparación del show en vivo.

## Desarrollo

```bash
npm install
npm run dev
```

Para generar la versión de producción: `npm run build` (queda en `dist/`).

## Pistas

Los nueve temas se definen en `src/App.jsx` y sus archivos están en `public/audio/`. La función que construye las rutas codifica espacios y acentos, conservando la coma para que el servidor local resuelva correctamente los nombres de archivo. Las portadas están en `public/covers/`; la portada elegida en cada entrada de `TRACKS` se muestra en la lista, el reproductor y la portada principal. Al agregar o renombrar archivos, actualiza `TRACKS` con el nombre exacto del audio y su portada. La búsqueda filtra por título e intérprete.

## Controles

- Reproducir y pausar, anterior, siguiente, aleatorio y repetición de playlist o tema.
- Buscar en el setlist, mover la posición de reproducción y ajustar volumen.
- Teclado: `Espacio` reproduce/pausa; `←` / `→` retrocede o avanza cinco segundos; `Shift + ←` / `Shift + →` cambia de tema; `M` silencia.
- También responde a las teclas multimedia del sistema.

Si una canción lleva más de tres segundos, el botón anterior vuelve al inicio; de lo contrario cambia al tema anterior.
