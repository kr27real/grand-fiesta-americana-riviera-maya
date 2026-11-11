const errorHandler = (err, req, res, next) => {
    console.error(`[SERVER ERROR] ${new Date().toISOString()} - ${req.method} ${req.url}:`, err);

    // Errores de validación de Zod
    if (err.name === 'ZodError') {
        const detalles = err.issues.map(e => ({
            campo: e.path.join('.'),
            mensaje: e.message
        }));
        return res.status(400).json({
            error: 'Datos de entrada inválidos',
            detalles
        });
    }

    // Errores específicos de SQL Server (mssql)
    if (err.number || err.code === 'EREQUEST') {
        let mensaje = 'Error en el procesamiento de la base de datos.';
        let status = 500;

        switch (err.number) {
            case 2627:
            case 2601:
                mensaje = 'El registro ya existe o se encuentra duplicado.';
                status = 409;
                break;
            case 547:
                mensaje = 'La operación infringe una restricción de integridad referencial.';
                status = 400;
                break;
            case 1205: // Deadlock en SERIALIZABLE
                mensaje = 'Conflicto de concurrencia temporal. Por favor reintenta la operación.';
                status = 409;
                break;
            default:
                mensaje = 'Ocurrió un error interno al ejecutar la consulta.';
                break;
        }

        return res.status(status).json({ error: mensaje });
    }

    // Error 500 genérico para cualquier otra excepción
    return res.status(500).json({
        error: process.env.NODE_ENV === 'production' 
            ? 'Error interno del servidor.' 
            : (err.message || 'Error no controlado.')
    });
};

module.exports = errorHandler;
