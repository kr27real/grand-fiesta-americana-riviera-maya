const { z } = require('zod');

const reservacionSchema = z.object({
    usuario_id: z.number().int().positive().optional(),
    suite_id: z.union([z.number().int().positive(), z.string().regex(/^\d+$/)]),
    fecha_llegada: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha_llegada debe ser YYYY-MM-DD'),
    fecha_salida: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de fecha_salida debe ser YYYY-MM-DD'),
    noches: z.number().int().positive().optional(),
    adultos: z.number().int().min(1, 'Debe haber al menos 1 adulto').max(6),
    ninos: z.number().int().min(0).max(6).optional().default(0),
    peticiones: z.string().max(500).optional(),
    peticiones_especiales: z.string().max(500).optional(),
    subtotal: z.number().positive(),
    iva: z.number().nonnegative(),
    ishe: z.number().nonnegative(),
    saneamiento: z.number().nonnegative(),
    total_general: z.number().positive(),
    terminacion_tarjeta: z.union([z.string(), z.number()]).optional()
}).refine(data => new Date(data.fecha_salida) > new Date(data.fecha_llegada), {
    message: 'La fecha de salida debe ser posterior a la fecha de llegada',
    path: ['fecha_salida']
});

const validarReservacion = (req, res, next) => {
    const result = reservacionSchema.safeParse(req.body);
    if (!result.success) {
        return next(result.error);
    }
    req.body = result.data;
    next();
};

module.exports = { validarReservacion, reservacionSchema };
