import { generarYDescargarCFDI40XML } from '../../utils/cfdiXmlGenerator';
import React from 'react';
// Código QR fiscal generado de forma nativa

export default function CFDI40Impresion({ factura, reserva, onCerrar }) {
  if (!factura) return null;

  const urlValidacionSAT = `https://verificacfdi.facturaelectronica.sat.gob.mx/default.aspx?id=${factura.uuid_sat}&re=${factura.rfc_emisor}&rr=${factura.rfc_receptor}&tt=${Number(factura.total_facturado).toFixed(2)}&fe=${(factura.sello_sat || 'b0y782kA').slice(-8)}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="cfdi-modal-overlay" style={{
      position: 'fixed', inset: 0, zIndex: 100000,
      background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(10px)',
      display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1.5rem',
      overflowY: 'auto'
    }}>
      {/* Barra superior de acciones (no imprimible) */}
      <div style={{ position: 'fixed', top: '1.5rem', right: '2rem', display: 'flex', gap: '1rem', zIndex: 100001 }} className="no-print">
        <button
          onClick={handlePrint}
          style={{
            background: 'linear-gradient(135deg, #d4af37 0%, #aa8212 100%)',
            color: '#060508', border: 'none', padding: '0.75rem 1.6rem',
            borderRadius: '4px', fontWeight: 800, cursor: 'pointer', fontSize: '0.82rem',
            letterSpacing: '1px', textTransform: 'uppercase', boxShadow: '0 4px 15px rgba(0,0,0,0.5)'
          }}
        >
          🖨️ Imprimir / Guardar PDF
        </button>
        <button
          onClick={onCerrar}
          style={{
            background: '#27272a', color: '#f8fafc', border: '1px solid #3f3f46',
            padding: '0.75rem 1.2rem', borderRadius: '4px', fontWeight: 700, cursor: 'pointer', fontSize: '0.82rem'
          }}
        >
          Cerrar
        </button>
      </div>

      {/* Hoja tamaño carta CFDI 4.0 */}
      <div id="cfdi-print-area" style={{
        background: '#ffffff', color: '#1e293b', width: '215.9mm', minHeight: '279.4mm',
        padding: '20mm 18mm', margin: 'auto', boxSizing: 'border-box',
        boxShadow: '0 20px 50px rgba(0,0,0,0.7)', fontFamily: 'Helvetica, Arial, sans-serif',
        fontSize: '9pt', lineHeight: 1.3
      }}>
        {/* Cabecera Membretada */}
        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #b45309', paddingBottom: '12px', marginBottom: '14px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '15pt', color: '#78350f', fontFamily: 'Cinzel, serif', fontWeight: 800 }}>
              GRAND FIESTA AMERICANA
            </h1>
            <div style={{ fontSize: '8pt', color: '#475569', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '6px' }}>
              Riviera Cancún Resort & Spa
            </div>
            <div style={{ fontSize: '8.5pt', lineHeight: 1.35 }}>
              <strong>Emisor:</strong> {factura.razon_social_emisor || 'GRUPO POSADAS S.A.B. DE C.V.'}<br />
              <strong>RFC Emisor:</strong> {factura.rfc_emisor || 'GFA920401HM3'}<br />
              <strong>Régimen Fiscal:</strong> 601 - General de Ley Personas Morales<br />
              <strong>Lugar de Expedición:</strong> C.P. 77500 (Cancún, Q. Roo)
            </div>
          </div>
          <div style={{ textAlign: 'right', minWidth: '220px' }}>
            <div style={{ background: '#fef3c7', border: '1px solid #f59e0b', padding: '6px 10px', borderRadius: '4px', textAlign: 'center', marginBottom: '6px' }}>
              <span style={{ display: 'block', fontSize: '7pt', textTransform: 'uppercase', color: '#92400e', fontWeight: 700 }}>Comprobante Fiscal Digital por Internet</span>
              <strong style={{ fontSize: '11pt', color: '#78350f' }}>FACTURA ELECTRÓNICA CFDI 4.0</strong>
            </div>
            <div style={{ fontSize: '8.5pt' }}>
              <strong>Serie / Folio:</strong> {factura.serie || 'FA'}-{factura.folio_fiscal || 'GFA-646848'}<br />
              <strong>Tipo de Comprobante:</strong> I - Ingreso<br />
              <strong>Fecha Emisión:</strong> {new Date(factura.creado_en || Date.now()).toLocaleString('es-MX')}<br />
              <strong>Exportación:</strong> 01 - No aplica
            </div>
          </div>
        </div>

        {/* Datos del Receptor */}
        <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '4px', padding: '8px 12px', marginBottom: '12px' }}>
          <div style={{ fontSize: '7.5pt', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '4px', borderBottom: '1px solid #cbd5e1', paddingBottom: '2px' }}>
            Receptor del Comprobante
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '8px', fontSize: '8.5pt' }}>
            <div>
              <strong>Nombre / Razón Social:</strong> {factura.razon_social_receptor}<br />
              <strong>RFC Receptor:</strong> {factura.rfc_receptor}<br />
              <strong>Domicilio Fiscal (C.P.):</strong> {factura.codigo_postal_fiscal}
            </div>
            <div>
              <strong>Régimen Fiscal:</strong> {factura.regimen_fiscal_receptor}<br />
              <strong>Uso de CFDI:</strong> {factura.uso_cfdi} - Gastos en general<br />
              <strong>Folio Reserva Ref.:</strong> {factura.folio_reservacion}
            </div>
          </div>
        </div>

        {/* Tabla de Conceptos SAT */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '12px', fontSize: '8pt' }}>
          <thead>
            <tr style={{ background: '#1e293b', color: '#ffffff', textAlign: 'left' }}>
              <th style={{ padding: '6px 8px' }}>Clave SAT</th>
              <th style={{ padding: '6px 8px' }}>Cant.</th>
              <th style={{ padding: '6px 8px' }}>Unidad</th>
              <th style={{ padding: '6px 8px' }}>Descripción</th>
              <th style={{ padding: '6px 8px', textAlign: 'right' }}>Valor Unitario</th>
              <th style={{ padding: '6px 8px', textAlign: 'right' }}>Importe</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
              <td style={{ padding: '8px' }}><strong>90111800</strong><br/><span style={{ fontSize: '7pt', color: '#64748b' }}>Cuartos de hotel</span></td>
              <td style={{ padding: '8px' }}>1.00</td>
              <td style={{ padding: '8px' }}>E48<br/><span style={{ fontSize: '7pt', color: '#64748b' }}>Unidad de servicio</span></td>
              <td style={{ padding: '8px' }}>
                <strong>SERVICIO DE HOSPEDAJE EN RESORT TODO INCLUIDO</strong><br />
                Estancia 3 noches en categoría de suite de lujo. Folio: {factura.folio_reservacion}.<br />
                <span style={{ fontSize: '7pt', color: '#047857' }}>Impuesto 002 IVA Base: ${Number(factura.subtotal).toLocaleString('es-MX', { minimumFractionDigits: 2 })} | Tasa: 0.160000 | Importe: ${Number(factura.iva_trasladado).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
              </td>
              <td style={{ padding: '8px', textAlign: 'right' }}>${Number(factura.subtotal).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
              <td style={{ padding: '8px', textAlign: 'right' }}><strong>${Number(factura.subtotal).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</strong></td>
            </tr>
          </tbody>
        </table>

        {/* Desglose de Totales e Impuestos */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1.1fr', gap: '16px', marginBottom: '14px' }}>
          <div style={{ fontSize: '8pt', background: '#f8fafc', padding: '10px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
            <strong>Condiciones y Método de Pago:</strong><br />
            <strong>Forma de Pago:</strong> 04 - Tarjeta de Crédito / Débito Bancaria<br />
            <strong>Método de Pago:</strong> PUE - Pago en una sola exhibición<br />
            <strong>Moneda:</strong> MXN - Peso Mexicano | <strong>Tipo de Cambio:</strong> 1.0000<br />
            <div style={{ marginTop: '8px', fontSize: '7.5pt', color: '#475569' }}>
              * Esta representación impresa ampara servicios de hospitalidad sujetos al Impuesto Sobre Hospedaje (ISH 5%) del Estado de Quintana Roo y al Derecho de Saneamiento Ambiental Municipal de Benito Juárez / Puerto Morelos.
            </div>
          </div>

            <table style={{ width: '100%', fontSize: '8.5pt', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
              <colgroup>
                <col style={{ width: '58%' }} />
                <col style={{ width: '42%' }} />
              </colgroup>
              <tbody>
                <tr>
                  <td style={{ padding: '3px 6px', color: '#475569', textAlign: 'left' }}>Subtotal:</td>
                  <td style={{ padding: '3px 6px', textAlign: 'right', fontWeight: 600, whiteSpace: 'nowrap' }}>
                    ${Number(factura.subtotal).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '3px 6px', color: '#475569', textAlign: 'left' }}>IVA Trasladado (16%):</td>
                  <td style={{ padding: '3px 6px', textAlign: 'right', fontWeight: 600, whiteSpace: 'nowrap' }}>
                    ${Number(factura.iva_trasladado).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                </tr>
                <tr>
                  <td style={{ padding: '3px 6px', color: '#475569', textAlign: 'left' }}>Impuesto Local ISH (5%):</td>
                  <td style={{ padding: '3px 6px', textAlign: 'right', fontWeight: 600, whiteSpace: 'nowrap' }}>
                    ${Number(factura.ish_trasladado).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                </tr>
                <tr style={{ borderBottom: '1px solid #cbd5e1' }}>
                  <td style={{ padding: '3px 6px', color: '#475569', textAlign: 'left' }}>Saneamiento Ambiental:</td>
                  <td style={{ padding: '3px 6px', textAlign: 'right', fontWeight: 600, whiteSpace: 'nowrap' }}>
                    ${Number(factura.saneamiento_ambiental).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                </tr>
                <tr style={{ background: '#fef3c7', fontSize: '9.5pt', color: '#78350f' }}>
                  <td style={{ padding: '6px', fontWeight: 800, textAlign: 'left', whiteSpace: 'nowrap' }}>TOTAL FACTURADO:</td>
                  <td style={{ padding: '6px', textAlign: 'right', fontWeight: 800, whiteSpace: 'nowrap' }}>
                    ${Number(factura.total_facturado).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MXN
                  </td>
                </tr>
              </tbody>
            </table>
        </div>

        {/* Timbre Fiscal Digital del SAT (Anexo 20 con QR) */}
        <div style={{ borderTop: '2px solid #334155', paddingTop: '10px', display: 'flex', gap: '14px', alignItems: 'center' }}>
          {/* Código QR bidimensional obligatorio */}
          <div style={{ padding: '6px', border: '1px solid #cbd5e1', borderRadius: '4px', background: '#ffffff', flexShrink: 0 }}>
            <img 
  src={`https://api.qrserver.com/v1/create-qr-code/?size=110x110&data=${encodeURIComponent(urlValidacionSAT)}`} 
  alt="Código QR Fiscal SAT" 
  style={{ width: '94px', height: '94px', display: 'block' }} 
/>
          </div>

          <div style={{ fontSize: '6.8pt', color: '#334155', wordBreak: 'break-all', lineHeight: 1.25 }}>
            <div style={{ marginBottom: '4px' }}>
              <strong>Folio Fiscal (UUID SAT):</strong> <span style={{ fontFamily: 'monospace', fontSize: '8pt', color: '#0f172a' }}>{factura.uuid_sat}</span><br />
              <strong>No. Certificado Emisor:</strong> 00001000000508821934 | <strong>No. Certificado SAT:</strong> 00001000000504465028<br />
              <strong>Fecha y Hora de Certificación:</strong> {new Date(factura.creado_en || Date.now()).toISOString()} | <strong>RFC Prov. Certif.:</strong> SAT970701NN3
            </div>
            <div style={{ marginBottom: '3px' }}>
              <strong>Cadena Original del Complemento de Certificación Digital del SAT:</strong><br />
              <span style={{ color: '#64748b' }}>||1.1|{factura.uuid_sat}|{new Date(factura.creado_en || Date.now()).toISOString()}|SAT970701NN3|b0y782kA...==|00001000000504465028||</span>
            </div>
            <div>
              <strong>Sello Digital del CFDI:</strong><br />
              <span style={{ color: '#64748b' }}>{factura.sello_sat || 'b0y782kA9LqZpX2m0+Nf1...=='}</span>
            </div>
            <div style={{ textAlign: 'center', marginTop: '6px', color: '#64748b', fontSize: '7pt', fontStyle: 'italic' }}>
              Este documento es una representación impresa de un CFDI versión 4.0
            </div>
          </div>
        </div>
      </div>

      {/* Regla CSS de Impresión para ocultar elementos web */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #cfdi-print-area, #cfdi-print-area * {
            visibility: visible;
          }
          #cfdi-print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            margin: 0 !important;
            padding: 10mm !important;
            box-shadow: none !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
