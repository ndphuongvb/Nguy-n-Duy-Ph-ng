/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Format numbers with dot separators
export function formatNumberDots(value: number): string {
  if (isNaN(value)) return '0';
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

// Convert numbers with dots and appends " VNĐ"
export function formatVND(value: number): string {
  return `${formatNumberDots(value)} VNĐ`;
}

// Parse VNĐ strings (e.g., "1.200.000" or "1.200.000 VND") back into raw numbers
export function parseVND(value: string): number {
  if (!value) return 0;
  // Remove dots and any non-digit character except backspace
  const clean = value.replace(/[^0-9]/g, '');
  const parsed = parseInt(clean, 10);
  return isNaN(parsed) ? 0 : parsed;
}

// CSV/Excel Exporter with UTF-8 BOM
export function exportToCSV(data: any[], filename: string, headers: string[]) {
  // Prep standard Excel-compatible CSV with UTF-8 Byte Order Mark
  const bom = '\uFEFF';
  let csvContent = bom;

  // Add Headers
  csvContent += headers.join(',') + '\n';

  // Add Rows
  data.forEach(row => {
    const escapedRow = row.map((val: any) => {
      if (val === null || val === undefined) return '';
      let str = String(val);
      // Double quotes handling for CSV
      if (str.includes(',') || str.includes('\n') || str.includes('"')) {
        str = '"' + str.replace(/"/g, '""') + '"';
      }
      return str;
    });
    csvContent += escapedRow.join(',') + '\n';
  });

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Export Invoice to simulated .doc (Microsoft Word HTML)
export function exportToWord(invoice: any, sellerInfo: any) {
  const dateObj = new Date(invoice.date);
  const dateStr = `${dateObj.getDate().toString().padStart(2, '0')}/${(dateObj.getMonth() + 1).toString().padStart(2, '0')}/${dateObj.getFullYear()}`;

  const htmlContent = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="utf-8">
      <title>Hóa đơn bán hàng</title>
      <style>
        body { font-family: 'Times New Roman', Times, serif; font-size: 12pt; line-height: 1.5; color: #000; }
        .header { text-align: center; margin-bottom: 20px; }
        .company { font-weight: bold; font-size: 14pt; text-transform: uppercase; }
        .title { text-align: center; font-weight: bold; font-size: 16pt; margin: 20px 0; color: #1a1a1a; }
        .info-table { width: 100%; border: none; margin-bottom: 20px; }
        .info-table td { padding: 4px; vertical-align: top; }
        .grid-table { width: 100%; border-collapse: collapse; margin-bottom: 25px; }
        .grid-table th { border: 1px solid #000; padding: 8px; background-color: #f2f2f2; font-weight: bold; text-align: center; }
        .grid-table td { border: 1px solid #000; padding: 8px; }
        .total-row { font-weight: bold; text-align: right; }
        .signatures { width: 100%; margin-top: 50px; text-align: center; }
        .signatures td { width: 50%; }
        .signature-title { font-weight: bold; margin-bottom: 60px; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="company">${sellerInfo.unit}</div>
        <div>Địa chỉ: ${sellerInfo.address}</div>
        <div>Điện thoại: ${sellerInfo.phone}</div>
      </div>
      <hr />
      <div class="title">HÓA ĐƠN BÁN HÀNG</div>
      <div style="text-align: center; font-style: italic; margin-bottom: 20px;">Mã số: ${invoice.invoiceCode} - Ngày: ${dateStr}</div>

      <table class="info-table">
        <tr>
          <td><strong>Người mua hàng:</strong> ${invoice.buyerName || 'Khách vãng lai'}</td>
          <td><strong>Điện thoại:</strong> ${invoice.buyerPhone || 'N/A'}</td>
        </tr>
        <tr>
          <td colspan="2"><strong>Địa chỉ:</strong> ${invoice.buyerAddress || 'N/A'}</td>
        </tr>
      </table>

      <table class="grid-table">
        <thead>
          <tr>
            <th width="5%">STT</th>
            <th width="45%">Tên hàng hóa</th>
            <th width="15%">Serial</th>
            <th width="10%">ĐVT</th>
            <th width="10%">SL</th>
            <th width="15%">Đơn giá</th>
            <th width="15%">Thành tiền</th>
          </tr>
        </thead>
        <tbody>
          ${invoice.items.map((item: any, idx: number) => `
            <tr>
              <td style="text-align: center;">${idx + 1}</td>
              <td>${item.productName}</td>
              <td style="text-align: center;">${item.serial || ''}</td>
              <td style="text-align: center;">${item.unit}</td>
              <td style="text-align: center;">${item.quantity}</td>
              <td style="text-align: right;">${formatNumberDots(item.sellPrice)} đ</td>
              <td style="text-align: right;">${formatNumberDots(item.sellPrice * item.quantity)} đ</td>
            </tr>
          `).join('')}
          <tr class="total-row">
            <td colspan="6" style="text-align: right; padding-right: 10px;">Tổng tiền thanh toán:</td>
            <td style="text-align: right;">${formatNumberDots(invoice.totalAmount)} đ</td>
          </tr>
        </tbody>
      </table>

      <table class="signatures">
        <tr>
          <td>
            <div class="signature-title">Người mua hàng</div>
            <div style="font-style: italic; font-size: 10pt;">(Ký, ghi rõ họ tên)</div>
          </td>
          <td>
            <div class="signature-title">Người bán hàng</div>
            <div style="font-style: italic; font-size: 10pt;">(Ký, đóng dấu nếu có)</div>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  const blob = new Blob(['\uFEFF' + htmlContent], { type: 'application/msword' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `HoaDon_${invoice.invoiceCode}.doc`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
