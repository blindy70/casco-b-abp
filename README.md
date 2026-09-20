# CascoB · Videoteca ABP

Aplicación web (PWA) para que los jugadores consulten los vídeos de acciones a balón parado del equipo, clasificados por tipo de jugada. Se instala en el móvil como una app y se publica gratis en GitHub Pages.

## Cómo funciona

```
Jugadores (móvil) ──> GitHub Pages (app estática)
                        └─ catálogo (JSON) <── Google Sheets + Apps Script
                        └─ vídeos <── Apps Script (proxy) <── Google Drive
```

- El **catálogo** (qué jugadas se ven, sus nombres y enlaces) vive en una **hoja de cálculo de Google**.
- La app lee esa hoja mediante un **Apps Script** que la publica como JSON.
- Los **vídeos** llegan a través de ese mismo Apps Script: Google los descarga desde tu Drive y la app los muestra en su propio reproductor. Así funcionan en cualquier móvil **sin cuenta de Google**.

> El clip se descarga completo antes de reproducirse. Es ideal para jugadas de segundos; procura que cada vídeo pese **menos de ~25 MB** (recorta con cualquier editor si pasa de ahí).

## Pasos de instalación (una sola vez)

### 1. Compartir los vídeos de Drive

Abre la carpeta de Drive con los vídeos → botón derecho → **Compartir** → *Acceso general* →

- **Cualquier persona con el enlace** → **Lector**.

Hazlo también a nivel de carpeta para que los vídeos que cuelgan de ella se hereden. Con esto se pueden ver sin cuenta de Google.

### 2. Crear la hoja de catálogo

1. Crea una hoja de cálculo en Google Sheets. Nombra la primera pestaña **Videos**.
2. En la fila 1 añade las columnas en este orden exacto:

| Etiqueta | Enlace de Drive | Categoría | Duración | Orden | Activo |
|---|---|---|---|---|---|
| Córner 45 primer palo | (pega el enlace del vídeo) | Córner | 0:42 | 1 | |
| Banda corta a altura | (pega el enlace del vídeo) | | 0:31 | 2 | |

- **Etiqueta** (obligatorio): nombre corto de la jugada.
- **Enlace de Drive** (obligatorio): en Google Drive, clic derecho sobre el vídeo → *Compartir* → *Copiar enlace* → pégalo aquí.
- **Categoría** (opcional): elige del desplegable (Córner, Banda Corta, Banda Media, Banda Larga, Salida de Presión, Saque de Centro, Falta, Defensa Córner, Ataque 5vs4, Ataque 4v3, Defensa 5vs4, Defensa 4v3).
- **Duración** (opcional): formato `min:seg`.
- **Orden** (opcional): número; ordena los vídeos dentro de cada tipo.
- **Activo** (opcional): vacío = visible; `No`, `0` o `Falso` = oculto.

Para el desplegable: selecciona la columna C → *Datos* → *Validación de datos* → *Lista de elementos* → escribe las 12 categorías.

> Si **Categoría** queda vacía, la app la **deduce del nombre** con reglas de palabras clave (`config.js` → `categories`). Ejemplos: un nombre con "corner" → Córner, con "5vs4" → Ataque 5vs4, con "def 5vs4" → Defensa 5vs4.

### 3. Poner en marcha el Apps Script

Hace dos cosas: publica la hoja como JSON (catálogo) y descarga los vídeos de Drive (proxy).

1. En la hoja: menú **Extensiones** → **Apps Script**.
2. Borra el contenido del editor y pega el de **`apps_script.gs`** (este proyecto). Guarda (💾).
3. **Autoriza los permisos** (paso clave, solo hay que hacerlo una vez):
   - En la lista de funciones elige **`probar`** → **Ejecutar**.
   - *Revisar permisos* → elige tu cuenta → *Avanzado* → *Ir a (…no seguro)* → *Permitir*.
   - Debe devolver `Sí se pudo: permisos concedidos`. Eso permite que el script descargue los vídeos de tu Drive.
4. Arriba a la derecha: **Implementar** → **Nueva implementación** → tipo **Aplicación web**:
   - Ejecutar como: *Yo*.
   - Acceso: **Cualquier persona**.
5. **Implementar**. Copia la **URL de aplicación web** (termina en `exec`).
6. Abre `config.js` y pega esa URL en `data.sheetUrl`. Deja `useSample: false` para ver los vídeos reales.

Prueba la URL en el navegador: debe devolver un JSON que empieza por `{"items":[...]}`. Y con `?action=video&id=EL_ID` debe devolver los datos binarios del vídeo.

> **Cuando actualices `apps_script.gs` en el futuro:** pega el contenido nuevo sustituyendo al viejo, guarda, y en *Implementar* → **Administrar implementaciones** → ✏️ editar la *Aplicación web* → versión **Nueva versión** → *Implementar*.
> **La URL no cambia**; no toques `config.js`. Si Google vuelve a pedir permisos, repite el paso 3 (ejecutar `probar`).

### 4. Publicar la app en GitHub Pages

1. Sube el contenido de esta carpeta a un repositorio de GitHub (sin `apps_script.gs`: ese script se pega en Apps Script, no se sube).
2. En el repo: **Settings** → **Pages** → *Build and deployment* → **Deploy from a branch** → rama `main`, carpeta `/ (root)` → **Save**.
3. Espera 1-2 minutos. La app queda en `https://tuusuario.github.io/nombre-del-repo/`.
4. Comparte ese enlace con los jugadores: desde el móvil pueden elegir *Añadir a pantalla de inicio* para instalarla como app. Para un QR: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=TU_ENLACE`.

## Mantenimiento diario

- **Añadir / ocultar vídeos**: solo edita la hoja (nueva fila o marcar *Activo* = No). No toques código.
- **Cambiar categorías**: edita la lista `categories` de `config.js` (etiqueta, `rank`, `initials` y `patterns` de detección) y el desplegable de la hoja.
- **Cambiar colores / nombre / escudo**: edita `club` en `config.js`. Sustituye `Escudo.png` por la nueva imagen manteniendo ese nombre.
- **Actualizar el Apps Script**: ver la nota del paso 3.

## Estructura del proyecto

```
config.js            → marca del club, URL del catálogo, categorías y claves
index.html           → estructura de la app
styles.css           → estilos (tema oscuro, móvil)
app.js               → lógica de la app (menú, listado, reproductor)
manifest.json        → configuración de instalación PWA
service-worker.js    → caché offline de la interfaz
apps_script.gs       → script Google Apps Script: catálogo JSON + proxy de vídeo
icons/               → iconos de la app (generados desde Escudo.png)
Escudo.png           → escudo del club
```

## Resolución de problemas

- **La app carga pero no salen jugadas**: revisa que la pestaña se llama **Videos** y que la URL de `data.sheetUrl` termina en `exec` (funciona en el navegador → JSON `{"items":[...]}`).
- **El vídeo no se reproduce**: confirma que la carpeta está compartida *Cualquier persona con el enlace* (Lector), que el fichero pesa menos de ~25 MB y que el script tiene permisos (paso 3.3).
- **"No se pudo cargar el vídeo"**: debajo del reproductor está el enlace **"abrir en Google Drive"**, que funciona siempre como respaldo.

## Notas

- La interfaz funciona sin conexión (se guarda en caché); **el vídeo necesita Internet** para cargarse desde Drive.
- Solo necesita cuenta de GitHub quien publica (y la de Google para la hoja y Apps Script). Los jugadores solo abren el enlace.