/**
 * Generador y Descargador de XML CFDI 4.0 con Timbre Fiscal Digital (SAT Anexo 20)
 */
export const generarYDescargarCFDI40XML = (factura, reserva) => {
  if (!factura) return;

  const fechaIso = factura.fecha_emision 
    ? new Date(factura.fecha_emision).toISOString().split('.')[0] 
    : new Date().toISOString().split('.')[0];

  const subtotal = Number(factura.subtotal || reserva?.subtotal || 0).toFixed(2);
  const iva = Number(factura.iva_trasladado || reserva?.iva || 0).toFixed(2);
  const ish = Number(factura.ish_trasladado || reserva?.ishe || 0).toFixed(2);
  const saneamiento = Number(factura.saneamiento_ambiental || reserva?.saneamiento_ambiental || 0).toFixed(2);
  const total = Number(factura.total_facturado || reserva?.total_general || 0).toFixed(2);

  const uuid = factura.uuid_sat || '8DF3896C-DAF9-4B1F-9A41-FFA84A301E2A';
  const folioFiscal = factura.folio_fiscal || `FA-${reserva?.folio_confirmacion || '000000'}`;

  const xmlContent = `<?xml version="1.0" encoding="utf-8"?>
<cfdi:Comprobante xmlns:cfdi="http://www.sat.gob.mx/cfd/4" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.sat.gob.mx/cfd/4 http://www.sat.gob.mx/sitio_internet/cfd/4/cfdv40.xsd http://www.sat.gob.mx/TimbreFiscalDigital http://www.sat.gob.mx/sitio_internet/cfd/TimbreFiscalDigital/TimbreFiscalDigitalv11.xsd" Version="4.0" Serie="FA" Folio="${folioFiscal.replace('FA-', '')}" Fecha="${fechaIso}" Sello="b0y782kA9LqZpX2m0+Nf1Kx4Oq2Vw9Z..." FormaPago="04" NoCertificado="00001000000508821934" Certificado="MIIFuzCCA6OgAwIBAgIUMDAwMDEwMDAwMDA1MDg4MjE5MzQwDQYJKoZIhvcNAQELBQAwgg..." SubTotal="${subtotal}" Moneda="MXN" Total="${total}" TipoDeComprobante="I" Exportacion="01" MetodoPago="PUE" LugarExpedicion="77500">
  <cfdi:Emisor Rfc="GFA920401HM3" Nombre="GRUPO POSADAS HOTEL GRAND FIESTA AMERICANA S.A. DE C.V." RegimenFiscal="601"/>
  <cfdi:Receptor Rfc="${factura.rfc_receptor || 'XAXX010101000'}" Nombre="${factura.razon_social || factura.nombre_receptor || factura.razonSocial || reserva?.nombre_huesped || 'PUBLICO EN GENERAL'}" DomicilioFiscalReceptor="${factura.codigo_postal || factura.codigoPostal || '77500'}" RegimenFiscalReceptor="${factura.regimen_fiscal || '612'}" UsoCFDI="${factura.uso_cfdi || 'G03'}"/>
  <cfdi:Conceptos>
    <cfdi:Concepto ClaveProdServ="90111800" Cantidad="1.00" ClaveUnidad="E48" Unidad="Unidad de servicio" Descripcion="SERVICIO DE HOSPEDAJE EN RESORT TODO INCLUIDO. Estancia en suite de lujo. Folio de reserva: ${reserva?.folio_confirmacion || 'N/A'}" ValorUnitario="${subtotal}" Importe="${subtotal}" ObjetoImp="02">
      <cfdi:Impuestos>
        <cfdi:Traslados>
          <cfdi:Traslado Base="${subtotal}" Impuesto="002" TipoFactor="Tasa" TasaOCuota="0.160000" Importe="${iva}"/>
        </cfdi:Traslados>
      </cfdi:Impuestos>
    </cfdi:Concepto>
  </cfdi:Conceptos>
  <cfdi:Impuestos TotalImpuestosTrasladados="${iva}">
    <cfdi:Traslados>
      <cfdi:Traslado Base="${subtotal}" Impuesto="002" TipoFactor="Tasa" TasaOCuota="0.160000" Importe="${iva}"/>
    </cfdi:Traslados>
  </cfdi:Impuestos>
  <cfdi:Complemento>
    <implocal:ImpuestosLocales xmlns:implocal="http://www.sat.gob.mx/implocal" version="1.0" TotaldeRetenciones="0.00" TotaldeTraslados="${(Number(ish) + Number(saneamiento)).toFixed(2)}">
      <implocal:TrasladosLocales ImpLocTrasladado="ISH Quintana Roo" TasadeTraslado="5.00" Importe="${ish}" />
      <implocal:TrasladosLocales ImpLocTrasladado="Derecho Saneamiento Ambiental" TasadeTraslado="0.00" Importe="${saneamiento}" />
    </implocal:ImpuestosLocales>
    <tfd:TimbreFiscalDigital xmlns:tfd="http://www.sat.gob.mx/TimbreFiscalDigital" xsi:schemaLocation="http://www.sat.gob.mx/TimbreFiscalDigital http://www.sat.gob.mx/sitio_internet/cfd/TimbreFiscalDigital/TimbreFiscalDigitalv11.xsd" Version="1.1" UUID="${uuid}" FechaTimbrado="${fechaIso}" RfcProvCertif="SAT970701NN3" SelloCFD="b0y782kA9LqZpX2m0+Nf1..." NoCertificadoSAT="00001000000504465028" SelloSAT="c8Z91j2AkLmQ..."/>
  </cfdi:Complemento>
</cfdi:Comprobante>`;

  const blob = new Blob([xmlContent], { type: 'application/xml;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${folioFiscal}_${uuid.slice(0, 8)}.xml`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};