var SHEET_NAME = 'Videos';
var MAX_BYTES = 25 * 1024 * 1024;
var VIDEO_URL = 'https://drive.usercontent.google.com/download?id=%s&export=download&confirm=t';

function doGet(e) {
  if (e && e.parameter && e.parameter.action === 'video') {
    return serveVideo(e.parameter.id);
  }
  return serveCatalog();
}

function serveCatalog() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    return out({ items: [], error: 'Hoja "' + SHEET_NAME + '" no encontrada' });
  }
  var values = sheet.getDataRange().getValues();
  if (!values.length) {
    return out({ items: [] });
  }
  var headers = values.shift().map(function (h) { return String(h).trim(); });
  var idx = {};
  for (var i = 0; i < headers.length; i++) {
    idx[headers[i]] = i;
  }
  var items = [];
  for (var r = 0; r < values.length; r++) {
    var row = values[r];
    var id = extractId(row[idx['Enlace de Drive']]);
    var name = String(row[idx['Etiqueta']] || '').trim();
    if (!id || !name) continue;
    if (!isActive(row[idx['Activo']])) continue;
    items.push({
      id: id,
      name: name,
      category: String(row[idx['Categoría']] || '').trim(),
      duration: String(row[idx['Duración']] || '').trim(),
      order: toNumber(row[idx['Orden']])
    });
  }
  items.sort(function (a, b) { return a.order - b.order; });
  return out({ items: items });
}

function serveVideo(id) {
  id = String(id || '').trim();
  if (!/^[\w-]{25,}$/.test(id)) {
    return out({ error: 'ID de vídeo no válido' });
  }
  try {
    var res = UrlFetchApp.fetch(VIDEO_URL.replace('%s', encodeURIComponent(id)), { muteHttpExceptions: true });
    if (res.getResponseCode() !== 200) {
      throw new Error('Fallo al descargar el vídeo (HTTP ' + res.getResponseCode() + ')');
    }
    var ct = res.getBlob().getContentType() || '';
    if (ct.indexOf('text/') === 0) {
      throw new Error('Drive no devolvió un vídeo para este enlace');
    }
    var bytes = res.getContent();
    if (!bytes.length) {
      throw new Error('Vídeo vacío');
    }
    if (bytes.length > MAX_BYTES) {
      throw new Error('Vídeo demasiado grande (máx. ~25 MB). Acorta el clip en Drive.');
    }
    return out({
      name: res.getBlob().getName() || 'video.mp4',
      mime: ct || 'video/mp4',
      size: bytes.length,
      data: Utilities.base64Encode(bytes)
    });
  } catch (err) {
    return out({ error: err.message || 'No se pudo cargar el vídeo' });
  }
}

function extractId(link) {
  var m = String(link || '').match(/[\w-]{25,}/);
  return m ? m[0] : null;
}

function isActive(v) {
  if (v === null || v === undefined || String(v).trim() === '') return true;
  return !/^(no|0|false|f|n)$/i.test(String(v).trim());
}

function toNumber(v) {
  var n = Number(String(v || '').replace(',', '.'));
  return isNaN(n) ? 0 : n;
}

function out(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}