const { z } = require('zod');

const rfcRegex = /^([A-ZÑ&]{3,4}) ?(?:- ?)?(\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\d|3[01])) ?(?:- ?)?([A-Z\d]{2})([A\d])$/;
const cpRegex = /^[0-9]{5}$/;

const facturaSchema = z.object({
    folio_reservacion: z.string().min(4, 'El folio de reservación es requerido').max(50).optional(),
    folio_confirmacion: z.string().min(4).max(50).optional(),
    folio: z.string().min(4).max(50).optional(),
    rfc_receptor: z.string().regex(rfcRegex, 'RFC receptor con formato inválido').optional(),
    rfc: z.string().regex(rfcRegex, 'RFC con formato inválido').optional(),
    razon_social_receptor: z.string().min(3, 'Razón social requerida').max(254).optional(),
    razon_social: z.string().min(3).max(254).optional(),
    codigo_postal_fiscal: z.string().regex(cpRegex, 'Código postal debe ser de 5 dígitos').optional(),
    codigo_postal: z.string().regex(cpRegex, 'Código postal debe ser de 5 dígitos').optional(),
    regimen_fiscal_receptor: z.string().regex(/^\d{3}$/, 'Régimen fiscal debe tener 3 dígitos').optional(),
    regimen_fiscal: z.string().regex(/^\d{3}$/, 'Régimen fiscal debe tener 3 dígitos').optional(),
    uso_cfdi: z.string().length(3, 'Uso de CFDI debe ser de 3 caracteres').optional().default('G03')
}).refine(data => data.folio_reservacion || data.folio_confirmacion || data.folio, {
    message: 'Debe especificarse el folio de reservación',
    path: ['folio_reservacion']
}).refine(data => data.rfc_receptor || data.rfc, {
    message: 'Debe proporcionarse un RFC válido',
    path: ['rfc_receptor']
}).refine(data => data.razon_social_receptor || data.razon_social, {
    message: 'Debe proporcionarse la Razón Social',
    path: ['razon_social_receptor']
});

const validarFactura = (req, res, next) => {
    const result = facturaSchema.safeParse(req.body);
    if (!result.success) {
        return next(result.error);
    }
    req.body = result.data;
    next();
};

module.exports = { validarFactura, facturaSchema };
