# CascoB · Videoteca ABP

Aplicación web (PWA) para que los jugadores consulten los vídeos de acciones a balón parado del equipo, clasificados por tipo de jugada. Se instala en el móvil como una app y se publica gratis en GitHub Pages.

## Cómo funciona

```
Jugadores (móvil) ──> GitHub Pages (app estática)
                        └─ catálogo (JSON) <── Google Sheets + Apps Script
                        └─ vídeos <── Google Drive (embed)
```

- El **catálogo** (qué jugadas se ven, sus nombres y enlaces) vive en una **hoja de cálculo de Google**.
- La app lee esa hoja mediante un pequeño **Apps Script** que la publica como JSON.
- Los **vídeos** se reproducen desde Google Drive sin descargarlos.

## Pasos de instalación (una sola vez)

### 1. Compartir los vídeos de Drive

Abre tu carpeta de Drive con los vídeos → botón derecho → **Compartir** → *General access* →

- **Cualquier persona con el enlace** → **Lector**.

Así los vídeos pueden verse sin cuenta de Google. Aplica también a la carpeta si los vídeos cuelgan de ella.

### 2. Crear la hoja de catálogo

1. Crea una hoja de cálculo en Google Sheets. Nombra la primera pestaña **Videos**.
2. En la fila 1 añade las columnas en este orden exacto:

| Etiqueta | Enlace de Drive | Categoría | Duración | Orden | Activo |
|---|---|---|---|---|---|
| Córner 45 primer palo | (pega el enlace del vídeo) | Córner | 0:42 | 1 | |
| Banda corta a altura | (pega el enlace del vídeo) | | 0:31 | 2 | |

- **Etiqueta** (obligatorio): nombre corto de la jugada.
- **Enlace de Drive** (obligatorio): copia en Google Drive el vídeo → *Compartir* → *Copiar enlace* → pégalo aquí.
- **Categoría** (opcional): elige del desplegable (Córner, Banda Corta, Banda Media, Banda Larga, Salida de Presión, Saque de Centro, Falta, Defensa Córner, Ataque 5vs4, Ataque 4v3, Defensa 5vs4, Defensa 4v3).
- **Duración** (opcional): formato `min:seg`.
- **Orden** (opcional): número; ordena los vídeos dentro de cada tipo.
- **Activo** (opcional): vacío = visible; `No`, `0` o `Falso` = oculto.

> Si **Categoría** queda vacía, la app la **deduce del nombre** con reglas de palabras clave (p. ej. el nombre lleva "corner" → Córner, "5vs4" → Ataque 5vs4, "def 5vs4" → Defensa 5vs4). Las reglas están en `config.js` (`categories`).

Para el desplegable de Categoría: selecciona la columna C → *Datos* → *Validación de datos* → Lista de elementos → escribe las 12 categorías.

### 3. Publicar el catálogo (Apps Script)

1. En la hoja: menú **Extensiones** → **Apps Script**.
2. Borra el contenido del editor y pega el contenido de **`apps_script.gs`** (este proyecto).
3. Guarda (icono 💾) con el nombre que quieras.
4. Ejecuta la función **`doGet`** una vez y **autoriza** (permite editar tu hoja y publicar). En la lista de funciones elige *doGet* → *Ejecutar* → acepta los permisos.
5. Arriba a la derecha: **Implementar / Deploy** → **Nueva implementación** → tipo **Aplicación web**:
   - Ejecutar como: *Yo*.
   - Acceso: **Cualquier persona**.
6. Clic en **Implementar**. Copia la **URL de aplicación web** (termina en `exec`).
7. Abre `config.js` y pega esa URL en `data.sheetUrl`. Deja `useSample: false` para ver los vídeos reales.

Prueba la URL en el navegador: debe devolver un JSON que empieza por `{"items":[...]}`.

### 4. Publicar la app en GitHub Pages

1. Sube todo el contenido de esta carpeta a un repositorio de GitHub (puedes arrastrar los archivos en la web de GitHub si no usas git).
2. En el repo: **Settings** → **Pages** → *Build and deployment* → **Deploy from a branch** → rama `main`, carpeta `/ (root)` → **Save**.
3. Espera 1-2 minutos. La app quedará en `https://tuusuario.github.io/nombre-del-repo/`.
4. Comparte ese enlace con los jugadores (desde el móvil pueden elegir *Añadir a pantalla de inicio* para instalarla como app). Para un QR: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=TU_ENLACE`.

## Mantenimiento diario

- **Añadir/ocultar vídeos**: solo edita la hoja (nueva fila o marcar *Activo* = No). No toques código.
- **Cambiar categorías**: edita la lista `categories` de `config.js` (etiqueta, posición `rank`, sigla e iniciales `initials` y claves de detección `patterns`) y el desplegable de la hoja.
- **Cambiar colores/nombre/escudo**: edita `club` en `config.js`. Sustituye `Escudo.png` por la nueva imagen manteniendo ese nombre.

## Estructura del proyecto

```
config.js            → marca del club, URL del catálogo, categorías y claves
index.html           → estructura de la app
styles.css           → estilos (tema oscuro, móvil)
app.js               → lógica de la app (menú, listado, reproductor)
manifest.json        → configuración de instalación PWA
service-worker.js    → caché offline de la interfaz
apps_script.gs       → script Google Apps Script para publicar la hoja como JSON
icons/               → iconos de la app (generados desde Escudo.png)
Escudo.png           → escudo del club
```

## Notas

- La interfaz funciona sin conexión (se guarda en caché); **el vídeo necesita Internet** para cargarse desde Drive.
- Si un vídeo no se reproduce, confirma que su carpeta está compartida "Cualquier persona con el enlace".
- Solo necesita cuenta de GitHub quien publica. Los jugadores solo abren el enlace.