const fs = require('fs');
let code = fs.readFileSync('./server.js', 'utf8');

// 1. Extraemos todo hasta justo antes del manejador 404
const marker404 = "app.use((req, res) => {";
const idx404 = code.indexOf(marker404);

if (idx404 === -1) {
    console.error("No se encontró el marcador del manejador 404.");
    process.exit(1);
}

// Cortamos el archivo en la base anterior al 404
let baseCode = code.substring(0, idx404);

// Limpiamos comentarios y restos duplicados al final de baseCode
baseCode = baseCode.replace(/\/\/\s*BÚSQUEDA Y LOCALIZADOR[\s\S]*?\/\/\s*Manejador 404\s*$/i, '').trim();

// 2. Definición limpia y completa de los endpoints del hotel
const endpointsHotel = `

// ==========================================
// CATÁLOGOS Y SERVICIOS DEL HOTEL (SQL SERVER)
// ==========================================

// 1. Galería de Fotos
app.get('/api/galeria', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query("SELECT * FROM dbo.Galeria WHERE activo = 1 ORDER BY foto_id ASC");
        res.json({ ok: true, data: result.recordset });
    } catch (err) {
        console.error('Error en /api/galeria:', err);
        res.status(500).json({ error: 'Error al consultar galería.' });
    }
});

// 2. Ofertas y Promociones
app.get('/api/ofertas', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query("SELECT * FROM dbo.OfertasPromociones WHERE activo = 1 ORDER BY oferta_id ASC");
        res.json({ ok: true, data: result.recordset });
    } catch (err) {
        console.error('Error en /api/ofertas:', err);
        res.status(500).json({ error: 'Error al consultar ofertas.' });
    }
});

// 3. Restaurantes y Bares
app.get('/api/restaurantes', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query("SELECT * FROM dbo.Restaurantes WHERE activo = 1 ORDER BY restaurante_id ASC");
        res.json({ ok: true, data: result.recordset });
    } catch (err) {
        console.error('Error en /api/restaurantes:', err);
        res.status(500).json({ error: 'Error al consultar restaurantes.' });
    }
});

// 4. Experiencias Exclusivas
app.get('/api/experiencias', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query("SELECT * FROM dbo.ExperienciasExclusivas WHERE activo = 1 ORDER BY experiencia_id ASC");
        res.json({ ok: true, data: result.recordset });
    } catch (err) {
        console.error('Error en /api/experiencias:', err);
        res.status(500).json({ error: 'Error al consultar experiencias.' });
    }
});

// 5. Espacios para Eventos MICE
app.get('/api/eventos/espacios', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query("SELECT * FROM dbo.EspaciosEventos WHERE activo = 1 ORDER BY espacio_id ASC");
        res.json({ ok: true, data: result.recordset });
    } catch (err) {
        console.error('Error en /api/eventos/espacios:', err);
        res.status(500).json({ error: 'Error al consultar espacios de eventos.' });
    }
});

// 6. Cotizar Evento MICE
app.post('/api/eventos/cotizar', async (req, res) => {
    try {
        const { espacio_id, nombre_contacto, email, telefono, tipo_evento, fecha_evento, num_asistentes, comentarios } = req.body;
        const pool = await poolPromise;
        const insert = await pool.request()
            .input('eid', sql.Int, espacio_id || null)
            .input('nom', sql.VarChar(150), nombre_contacto || '')
            .input('mail', sql.VarChar(150), email || '')
            .input('tel', sql.VarChar(50), telefono || '')
            .input('tipo', sql.VarChar(100), tipo_evento || 'Corporativo')
            .input('fecha', sql.Date, fecha_evento || new Date())
            .input('num', sql.Int, num_asistentes || 10)
            .input('com', sql.VarChar(sql.MAX), comentarios || '')
            .query(\`
                INSERT INTO dbo.CotizacionesEventos (espacio_id, nombre_contacto, email, telefono, tipo_evento, fecha_evento, num_asistentes, comentarios, creado_en)
                VALUES (@eid, @nom, @mail, @tel, @tipo, @fecha, @num, @com, GETDATE());
                SELECT SCOPE_IDENTITY() AS cotizacion_id;
            \`);
        res.status(201).json({ ok: true, mensaje: 'Cotización recibida con éxito.', cotizacion_id: insert.recordset[0].cotizacion_id });
    } catch (err) {
        console.error('Error en /api/eventos/cotizar:', err);
        res.status(500).json({ error: 'Error al registrar la cotización.' });
    }
});

// 7. Tickets de Contacto / Concierge
app.post('/api/contacto/tickets', async (req, res) => {
    try {
        const { usuario_id, hotel_destino, categoria, tipo_solicitud, clave_reservacion, nombres, apellidos, email, telefono, descripcion } = req.body;
        const pool = await poolPromise;
        const insert = await pool.request()
            .input('uid', sql.Int, usuario_id || null)
            .input('hotel', sql.VarChar(150), hotel_destino || 'Grand Fiesta Americana Riviera Cancún')
            .input('cat', sql.VarChar(100), categoria || 'Atención a Huéspedes')
            .input('tipo', sql.VarChar(100), tipo_solicitud || 'Consulta General')
            .input('clave', sql.VarChar(50), clave_reservacion || null)
            .input('nom', sql.VarChar(100), nombres || '')
            .input('ape', sql.VarChar(100), apellidos || '')
            .input('mail', sql.VarChar(150), email || '')
            .input('tel', sql.VarChar(50), telefono || '')
            .input('desc', sql.VarChar(sql.MAX), descripcion || '')
            .query(\`
                INSERT INTO dbo.TicketsContacto (usuario_id, hotel_destino, categoria, tipo_solicitud, clave_reservacion, nombres, apellidos, email, telefono, descripcion, estatus, creado_en)
                VALUES (@uid, @hotel, @cat, @tipo, @clave, @nom, @ape, @mail, @tel, @desc, 'ABIERTO', GETDATE());
                SELECT SCOPE_IDENTITY() AS ticket_id;
            \`);
        res.status(201).json({ ok: true, ticket_id: insert.recordset[0].ticket_id });
    } catch (err) {
        console.error('Error en /api/contacto/tickets:', err);
        res.status(500).json({ error: 'Error al registrar ticket de contacto.' });
    }
});
`;

// 3. Manejador 404 al final absoluto y arranque del servidor
const cierreServidor = `

// ==========================================
// MANEJADOR GLOBAL 404 (FINAL ABSOLUTO DE RUTAS)
// ==========================================
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint no encontrado' });
});

// Iniciar servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(\`Servidor seguro corriendo en http://localhost:\${PORT}\`);
});
`;

const finalCode = baseCode + endpointsHotel + cierreServidor;
fs.writeFileSync('./server.js', finalCode, 'utf8');
console.log('✅ server.js reorganizado: todos los endpoints quedaron ubicados ANTES del 404.');
