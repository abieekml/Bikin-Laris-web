
const SHEET_NAME = 'Order BikinLaris';

// ── Kolom header ──
const HEADERS = [
  'Timestamp',
  'Nama Lengkap',
  'No. WhatsApp',
  'Nama Usaha',
  'Alamat Usaha',
  'Jasa Dipesan',
  'Catatan',
  'Status',
];

/**
 * Dipanggil saat website mengirim POST request
 */
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const sheet = getOrCreateSheet();

    // Tambah baris baru
    sheet.appendRow([
      data.timestamp  || new Date().toLocaleString('id-ID'),
      data.nama       || '',
      data.wa         || '',
      data.usaha      || '',
      data.alamat     || '',
      data.jasa       || '',
      data.catatan    || '-',
      data.status     || 'Menunggu Pembayaran',
    ]);

    // Auto-resize kolom
    sheet.autoResizeColumns(1, HEADERS.length);

    return ContentService
      .createTextOutput(JSON.stringify({ status: 'ok' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}


function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'BikinLaris Script aktif ✅' }))
    .setMimeType(ContentService.MimeType.JSON);
}


function getOrCreateSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    setupHeader(sheet);
  } else if (sheet.getLastRow() === 0) {
    setupHeader(sheet);
  }

  return sheet;
}


function setupHeader(sheet) {
  sheet.appendRow(HEADERS);

  const headerRange = sheet.getRange(1, 1, 1, HEADERS.length);


  headerRange.setBackground('#0d7377');
  headerRange.setFontColor('#ffffff');
  headerRange.setFontWeight('bold');
  headerRange.setFontSize(10);
  headerRange.setHorizontalAlignment('center');


  sheet.setFrozenRows(1);

  // Set lebar kolom
  sheet.setColumnWidth(1, 160); // Timestamp
  sheet.setColumnWidth(2, 160); // Nama
  sheet.setColumnWidth(3, 140); // WA
  sheet.setColumnWidth(4, 180); // Usaha
  sheet.setColumnWidth(5, 220); // Alamat
  sheet.setColumnWidth(6, 240); // Jasa
  sheet.setColumnWidth(7, 200); // Catatan
  sheet.setColumnWidth(8, 160); // Status
}


function setupSheetManual() {
  const sheet = getOrCreateSheet();
  Logger.log('Sheet siap: ' + sheet.getName());
}
