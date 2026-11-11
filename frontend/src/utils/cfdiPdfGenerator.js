import { jsPDF } from 'jspdf';

export function generarPDFRepresentacionImpresa(factura, reserva = {}) {
  if (!factura) {
    throw new Error('No se proporcionaron datos de la factura para generar el PDF');
  }

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'letter'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 14;
  let y = 16;

  // Encabezado institucional
  doc.setFillColor(120, 53, 15); // Marrón dorado Posadas
  doc.rect(margin, y, pageWidth - (margin * 2), 20, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text('GRAND FIESTA AMERICANA RIVIERA CANCÚN', margin + 6, y + 8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text('COMPROBANTE FISCAL DIGITAL POR INTERNET (CFDI 4.0) - INGRESO', margin + 6, y + 14);

  y += 26;

  // Bloque Emisor vs Comprobante
  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59);

  // Columna Izquierda: Emisor
  doc.setFont('helvetica', 'bold');
  doc.text('EMISOR:', margin, y);
  doc.setFont('helvetica', 'normal');
  doc.text(`${factura.razon_social_emisor || 'GRUPO POSADAS S.A.B. DE C.V.'}`, margin, y + 4);
  doc.text(`RFC: ${factura.rfc_emisor || 'GFA920401HM3'}`, margin, y + 8);
  doc.text('Régimen Fiscal: 601 - General de Ley Personas Morales', margin, y + 12);
  doc.text('Lugar de Expedición: C.P. 77500 (Cancún, Q. Roo)', margin, y + 16);

  // Columna Derecha: Folio Fiscal y Timbre
  const colDerX = 120;
  doc.setFont('helvetica', 'bold');
  doc.text(`Serie / Folio: ${factura.serie || 'FA'}-${factura.folio_fiscal || '000000'}`, colDerX, y);
  doc.setFont('helvetica', 'normal');
  doc.text(`Folio Fiscal (UUID):`, colDerX, y + 4);
  doc.setFontSize(7);
  doc.text(`${factura.uuid_sat || 'N/A'}`, colDerX, y + 8);
  doc.setFontSize(8);
  doc.text(`Fecha Timbrado: ${new Date(factura.creado_en || Date.now()).toLocaleString('es-MX')}`, colDerX, y + 12);
  doc.text(`Método / Forma: ${factura.metodo_pago || 'PUE'} / ${factura.forma_pago || '04'}`, colDerX, y + 16);

  y += 24;

  // Caja Receptor
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.rect(margin, y, pageWidth - (margin * 2), 22, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.text('DATOS DEL RECEPTOR:', margin + 4, y + 5);
  doc.setFont('helvetica', 'normal');
  doc.text(`Nombre / Razón Social: ${factura.razon_social_receptor || 'PÚBLICO EN GENERAL'}`, margin + 4, y + 10);
  doc.text(`RFC: ${factura.rfc_receptor || 'XAXX010101000'}`, margin + 4, y + 14);
  doc.text(`Domicilio Fiscal (C.P.): ${factura.codigo_postal_fiscal || '54980'}  |  Régimen: ${factura.regimen_fiscal_receptor || '612'}  |  Uso CFDI: ${factura.uso_cfdi || 'G03'}`, margin + 4, y + 18);

  y += 28;

  // Tabla de Conceptos
  doc.setFillColor(241, 245, 249);
  doc.rect(margin, y, pageWidth - (margin * 2), 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.text('Clave SAT', margin + 2, y + 5);
  doc.text('Descripción del Concepto', margin + 28, y + 5);
  doc.text('Cant.', margin + 115, y + 5);
  doc.text('P. Unitario', margin + 130, y + 5);
  doc.text('Importe', margin + 160, y + 5);

  y += 11;
  doc.setFont('helvetica', 'normal');
  const conceptoDesc = reserva.suite_nombre 
    ? `Hospedaje Resort & Spa - ${reserva.suite_nombre} (${reserva.noches || 1} noches)`
    : 'Servicio de Hospedaje y Amenidades Gran Fiesta Americana';

  doc.text('90111800', margin + 2, y);
  doc.text(conceptoDesc.slice(0, 52), margin + 28, y);
  doc.text('1', margin + 117, y);
  doc.text(`$${Number(factura.subtotal || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}`, margin + 130, y);
  doc.text(`$${Number(factura.subtotal || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}`, margin + 160, y);

  y += 14;

  // Cuadro de Totales
  const totalesX = 125;
  doc.line(margin, y, pageWidth - margin, y);
  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.text('Subtotal:', totalesX, y);
  doc.text(`$${Number(factura.subtotal || 0).toFixed(2)}`, margin + 160, y);
  y += 5;

  doc.text('IVA Trasladado (16%):', totalesX, y);
  doc.text(`$${Number(factura.iva_trasladado || 0).toFixed(2)}`, margin + 160, y);
  y += 5;

  doc.text('ISH Impuesto Sobre Hospedaje (5%):', totalesX, y);
  doc.text(`$${Number(factura.ish_trasladado || 0).toFixed(2)}`, margin + 160, y);
  y += 5;

  doc.text('Derecho Saneamiento Ambiental:', totalesX, y);
  doc.text(`$${Number(factura.saneamiento_ambiental || 0).toFixed(2)}`, margin + 160, y);
  y += 6;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('TOTAL FACTURADO (MXN):', totalesX, y);
  doc.text(`$${Number(factura.total_facturado || 0).toFixed(2)}`, margin + 160, y);

  y += 14;

  // Sellos Digitales SAT
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'bold');
  doc.text('SELLO DIGITAL DEL EMISOR:', margin, y);
  doc.setFont('helvetica', 'normal');
  doc.text((factura.sello_emisor || 'dB47v9+vW/0x...simulado_sat_gfa').slice(0, 110), margin, y + 3.5);

  y += 9;
  doc.setFont('helvetica', 'bold');
  doc.text('SELLO DIGITAL DEL SAT:', margin, y);
  doc.setFont('helvetica', 'normal');
  doc.text((factura.sello_sat || 'kW91a+kP3/1z...timbrado_oficial_sat').slice(0, 110), margin, y + 3.5);

  y += 9;
  doc.setFont('helvetica', 'bold');
  doc.text('CADENA ORIGINAL DEL COMPLEMENTO DE CERTIFICACIÓN DIGITAL DEL SAT:', margin, y);
  doc.setFont('helvetica', 'normal');
  const cadenaOriginal = `||1.1|${factura.uuid_sat || 'UUID'}|${new Date().toISOString()}|GFA920401HM3|${(factura.sello_emisor || 'sello').slice(0, 20)}||`;
  doc.text(cadenaOriginal.slice(0, 120), margin, y + 3.5);

  // Pie de página
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('Este documento es una representación impresa de un CFDI versión 4.0 emitida por Grand Fiesta Americana.', margin, 268);

  const nombreArchivo = `Factura_CFDI40_${factura.folio_fiscal || factura.folio_reservacion || 'GFA'}.pdf`;
  doc.save(nombreArchivo);
}
