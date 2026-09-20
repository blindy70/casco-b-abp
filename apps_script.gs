var SHEET_NAME = 'Videos';

function doGet() {
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