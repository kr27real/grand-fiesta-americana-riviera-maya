const { z } = require('zod');

// Esquema para cada servicio extra seleccionado (traslados, spa, cenas, etc.)
const servicioAdicionalItemSchema = z.object({
    servicio_id: z.union([z.number().int().positive(), z.string().regex(/^\d+$/)]).transform(Number),
    codigo_servicio: z.string().min(2).max(50).optional(),
    nombre: z.string().min(2).max(150),
    cantidad: z.number().int().min(1).default(1),
    precio_unitario: z.number().nonnegative(),
    subtotal: z.number().nonnegative()
});

const reservacionSchema = z.object({
    usuario_id: z.union([z.number().int().positive(), z.string().regex(/^\d+$/)]).transform(Number).optional(),
    suite_id: z.union([z.number().int().positive(), z.string().regex(/^\d+$/)]).transform(Number),
    fecha_llegada: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha_llegada debe ser YYYY-MM-DD'),
    fecha_salida: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha_salida debe ser YYYY-MM-DD'),
    noches: z.union([z.number().int().positive(), z.string().regex(/^\d+$/)]).transform(Number).optional(),
    adultos: z.union([z.number().int().min(1), z.string().regex(/^\d+$/)]).transform(Number),
    ninos: z.union([z.number().int().min(0), z.string().regex(/^\d+$/)]).transform(Number).default(0),
    
    // Personalización de confort y servicios
    preferencia_almohada: z.string().max(100).optional(),
    servicios_adicionales: z.array(servicioAdicionalItemSchema).optional().default([]),
    peticiones: z.string().max(500).optional(),
    peticiones_especiales: z.string().max(500).optional(),
    
    // Desglose fiscal monetario
    subtotal: z.union([z.number().positive(), z.string().regex(/^\d+(\.\d+)?$/)]).transform(Number),
    iva: z.union([z.number().nonnegative(), z.string().regex(/^\d+(\.\d+)?$/)]).transform(Number),
    ishe: z.union([z.number().nonnegative(), z.string().regex(/^\d+(\.\d+)?$/)]).transform(Number),
    saneamiento: z.union([z.number().nonnegative(), z.string().regex(/^\d+(\.\d+)?$/)]).transform(Number).optional(),
    saneamiento_ambiental: z.union([z.number().nonnegative(), z.string().regex(/^\d+(\.\d+)?$/)]).transform(Number).optional(),
    total_general: z.union([z.number().positive(), z.string().regex(/^\d+(\.\d+)?$/)]).transform(Number),
    
    // Transaccional
    metodo_pago_tipo: z.enum(['tarjeta_credito', 'fiesta_card', 'spei', 'qr_tiendas']).optional().default('tarjeta_credito'),
    terminacion_tarjeta: z.union([z.string(), z.number()]).transform(String).optional(),
    estatus_reservacion: z.string().optional()
})
// 1. Cronología de fechas
.refine(data => new Date(data.fecha_salida) > new Date(data.fecha_llegada), {
    message: 'La fecha de check-out (salida) debe ser posterior a la de check-in (llegada).',
    path: ['fecha_salida']
})
// 2. Restricción estricta de Adultos (+18) en Suites Swim-Up (3) y Honeymoon (6)
.refine(data => {
    const suitesAdultos = [3, 6];
    if (suitesAdultos.includes(data.suite_id) && data.ninos > 0) {
        return false;
    }
    return true;
}, {
    message: 'Esta suite se ubica en sección exclusiva Adults-Only (+18). No se admiten menores de edad.',
    path: ['ninos']
})
// 3. Aforo máximo total (máximo 6 ocupantes por suite física)
.refine(data => (data.adultos + data.ninos) <= 6, {
    message: 'El aforo combinado excede la capacidad máxima de la suite (máximo 6 huéspedes).',
    path: ['adultos']
});

const validarReservacion = (req, res, next) => {
    const result = reservacionSchema.safeParse(req.body);
    
    if (!result.success) {
        const errores = result.error.errors.map(err => ({
            campo: err.path.join('.'),
            mensaje: err.message
        }));

        return res.status(400).json({
            ok: false,
            error: errores[0]?.mensaje || 'Los datos de la reservación no cumplen con los estándares comerciales.',
            detalles: errores
        });
    }

    // Homogeneizar saneamiento ambiental si viene como 'saneamiento'
    if (result.data.saneamiento && !result.data.saneamiento_ambiental) {
        result.data.saneamiento_ambiental = result.data.saneamiento;
    }

    req.body = result.data;
    next();
};

module.exports = { validarReservacion, reservacionSchema };