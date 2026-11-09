const express = require('express');
const cors = require('cors');
const sql = require('mssql');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'gfa_secret_key_2026_posadas';

app.use(cors());
app.use(express.json());

const dbConfig = {
    user: process.env.DB_USER || 'sa',
    password: process.env.DB_PASSWORD || '123456',
    server: process.env.DB_SERVER || 'localhost',
    database: process.env.DB_DATABASE || 'HotelGranFiestaAmericanaDB',
    options: { encrypt: false, trustServerCertificate: true }
};

const poolPromise = new sql.ConnectionPool(dbConfig)
    .connect()
    .then(pool => {
        console.log('Conectado exitosamente a SQL Server: HotelGranFiestaAmericanaDB');
        return pool;
    })
    .catch(err => {
        console.error('Error al conectar a SQL Server:', err);
        process.exit(1);
    });

// Middleware Estricto: Bloquea reservas a usuarios anónimos
const verificarSesionObligatoria = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    let token = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
    } else if (req.body && req.body.token_sesion) {
        token = req.body.token_sesion;
    }

    if (!token || token === 'null' || token === 'undefined') {
        return res.status(401).json({ 
            error: 'ACCESO RESTRINGIDO: Debes iniciar sesión o registrarte como socio Fiesta Rewards para poder reservar.' 
        });
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            // Permitir token simulado de testing local preprod si aplica
            if (token === 'session_gfa_preprod_token_valid' && req.body.usuario_id) {
                req.user = { usuario_id: req.body.usuario_id };
                return next();
            }
            return res.status(401).json({ error: 'Sesión expirada o inválida. Inicia sesión nuevamente.' });
        }
        req.user = decoded;
        next();
    });
};

// ==========================================
// 1. SUITES
// ==========================================
app.get('/api/suites', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT 
                suite_id, nombre, categoria, descripcion, precio_noche_base,
                capacidad_adultos, capacidad_ninos, metros_cuadrados, tipo_cama,
                vista_tipo, amenidades_destacadas, servicios_incluidos, detalles_confort,
                detalles_bano, detalles_tecnologia, politica_suite, foto_principal,
                galeria_fotos, inventario_total, inventario_disponible, creado_en
            FROM HabitacionesSuites
            ORDER BY suite_id ASC
        `);
        res.json(result.recordset);
    } catch (err) {
        console.error('Error suites:', err);
        res.status(500).json({ error: 'Error al consultar suites' });
    }
});

// ==========================================
// 2. REGISTRO & LOGIN
// ==========================================
app.post('/api/usuarios/registro', async (req, res) => {
    const { nombres, apellidos, email, password, telefono } = req.body;
    try {
        const pool = await poolPromise;
        const userCheck = await pool.request()
            .input('email', sql.VarChar(150), email)
            .query('SELECT usuario_id FROM Usuarios WHERE email = @email');

        if (userCheck.recordset.length > 0) {
            return res.status(400).json({ error: 'El correo electrónico ya se encuentra registrado' });
        }

        const salt = await bcrypt.genSalt(10);
        const passHash = await bcrypt.hash(password || '123456', salt);
        const randomFR = 'FR-' + Math.floor(100000 + Math.random() * 900000);

        const insertUser = await pool.request()
            .input('nombres', sql.VarChar(100), nombres)
            .input('apellidos', sql.VarChar(100), apellidos)
            .input('email', sql.VarChar(150), email)
            .input('telefono', sql.VarChar(20), telefono || '')
            .input('password_hash', sql.VarChar(255), passHash)
            .input('fiesta_rewards_id', sql.VarChar(50), randomFR)
            .query(`
                INSERT INTO Usuarios (nombres, apellidos, email, telefono, password_hash, fiesta_rewards_id, creado_en)
                OUTPUT INSERTED.usuario_id, INSERTED.nombres, INSERTED.apellidos, INSERTED.email, INSERTED.fiesta_rewards_id
                VALUES (@nombres, @apellidos, @email, @telefono, @password_hash, @fiesta_rewards_id, GETDATE())
            `);

        const usuarioCreado = insertUser.recordset[0];

        try {
            const cuatroDigitos = Math.floor(1000 + Math.random() * 9000);
            const numeroCard = `4829 9012 3456 ${cuatroDigitos}`;
            await pool.request()
                .input('uid_card', sql.Int, usuarioCreado.usuario_id)
                .input('num_mask', sql.VarChar(30), numeroCard)
                .query(`
                    INSERT INTO dbo.TarjetasFiestaCard (
                        usuario_id, numero_enmascarado, linea_credito_total, 
                        saldo_disponible, saldo_utilizado, puntos_rewards_acumulados, 
                        nivel_membresia, estatus_tarjeta, fecha_expiracion
                    )
                    VALUES (
                        @uid_card, @num_mask, 50000.00, 
                        50000.00, 0.00, 2500, 
                        'Titanium Privilege', 'Activa', '11/30'
                    )
                `);
        } catch (cardErr) {
            console.warn('Aviso al emitir tarjeta:', cardErr.message);
        }

        const token = jwt.sign({ usuario_id: usuarioCreado.usuario_id, email: usuarioCreado.email }, JWT_SECRET, { expiresIn: '7d' });
        res.status(201).json({ usuario: usuarioCreado, token });
    } catch (err) {
        console.error('Error en registro:', err);
        res.status(500).json({ error: err.message || 'Error al registrar usuario' });
    }
});

app.post('/api/usuarios/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('email', sql.VarChar(150), email)
            .query('SELECT * FROM Usuarios WHERE email = @email');

        if (!result.recordset.length) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        const user = result.recordset[0];
        const valido = await bcrypt.compare(password, user.password_hash);
        if (!valido) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        const token = jwt.sign({ usuario_id: user.usuario_id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
        delete user.password_hash;
        res.json({ usuario: user, token });
    } catch (err) {
        console.error('Error en login:', err);
        res.status(500).json({ error: 'Error interno en autenticación' });
    }
});

// ==========================================
// 3. BILLETERA DIGITAL (WALLET COMPLETA)
// ==========================================
// Consultar todos los métodos de pago guardados
app.get('/api/billetera/:usuario_id', async (req, res) => {
    try {
        const pool = await poolPromise;
        const uid = req.params.usuario_id;

        // 1. Tarjeta Institucional Fiesta Card
        const fiestaCard = await pool.request()
            .input('uid', sql.Int, uid)
            .query('SELECT * FROM dbo.TarjetasFiestaCard WHERE usuario_id = @uid');

        // 2. Tarjetas Bancarias Personales
        const tarjetasBancarias = await pool.request()
            .input('uid2', sql.Int, uid)
            .query('SELECT * FROM dbo.TarjetasBancariasUsuario WHERE usuario_id = @uid2 ORDER BY es_preferida DESC, tarjeta_bancaria_id DESC');

        res.json({
            fiesta_card: fiestaCard.recordset[0] || null,
            tarjetas_bancarias: tarjetasBancarias.recordset
        });
    } catch (err) {
        console.error('Error al consultar billetera:', err);
        res.status(500).json({ error: 'Error al consultar métodos de pago' });
    }
});

// Registrar nueva tarjeta bancaria en la billetera
app.post('/api/billetera', async (req, res) => {
    const {
        usuario_id, alias_tarjeta, banco_emisor, marca_tarjeta,
        tipo_cuenta, numero_tarjeta, titular_nombre,
        mes_expiracion, anio_expiracion, saldo_inicial_simulado, es_preferida
    } = req.body;

    if (!usuario_id || !numero_tarjeta || !titular_nombre || !mes_expiracion || !anio_expiracion) {
        return res.status(400).json({ error: 'Faltan campos obligatorios para guardar la tarjeta.' });
    }

    try {
        const pool = await poolPromise;
        const ultimos4 = numero_tarjeta.replace(/\s/g, '').slice(-4);
        const mask = `•••• •••• •••• ${ultimos4}`;

        if (es_preferida) {
            await pool.request()
                .input('uid_pref', sql.Int, usuario_id)
                .query('UPDATE dbo.TarjetasBancariasUsuario SET es_preferida = 0 WHERE usuario_id = @uid_pref');
        }

        const insert = await pool.request()
            .input('u_id', sql.Int, usuario_id)
            .input('alias', sql.VarChar(50), alias_tarjeta || `${banco_emisor || 'Bancaria'} ${marca_tarjeta || ''}`)
            .input('banco', sql.VarChar(50), banco_emisor || 'Banco Internacional')
            .input('marca', sql.VarChar(20), marca_tarjeta || 'Visa')
            .input('tipo', sql.VarChar(20), tipo_cuenta || 'Crédito')
            .input('mask', sql.VarChar(25), mask)
            .input('titular', sql.NVarChar(150), titular_nombre.toUpperCase())
            .input('mes', sql.Int, mes_expiracion)
            .input('anio', sql.Int, anio_expiracion)
            .input('saldo', sql.Decimal(10, 2), saldo_inicial_simulado !== undefined ? saldo_inicial_simulado : 30000.00)
            .input('pref', sql.Bit, es_preferida ? 1 : 0)
            .query(`
                INSERT INTO dbo.TarjetasBancariasUsuario (
                    usuario_id, alias_tarjeta, banco_emisor, marca_tarjeta,
                    tipo_cuenta, numero_enmascarado, titular_nombre,
                    mes_expiracion, anio_expiracion, saldo_disponible_simulado, es_preferida
                )
                OUTPUT INSERTED.*
                VALUES (
                    @u_id, @alias, @banco, @marca,
                    @tipo, @mask, @titular,
                    @mes, @anio, @saldo, @pref
                )
            `);

        res.status(201).json({ mensaje: 'Tarjeta guardada en billetera exitosamente', tarjeta: insert.recordset[0] });
    } catch (err) {
        console.error('Error al registrar tarjeta bancaria:', err);
        res.status(500).json({ error: 'Error al registrar la tarjeta en la billetera' });
    }
});

// ==========================================
// 4. RESERVACIONES (CON VALIDACIÓN UNIVERSAL DE SALDO)
// ==========================================

// ==========================================
// 4.1 BÚSQUEDA / LOCALIZADOR OFICIAL DE RESERVACIÓN (GET Y POST)
// ==========================================
const handlerBuscarReservacion = async (req, res) => {
    try {
        const folio = (req.query.folio || req.body.folio || '').trim();
        const correoOApellido = (req.query.email || req.body.email || req.body.email_o_apellido || '').trim();

        if (!folio) {
            return res.status(400).json({ error: 'Debes ingresar un folio de reservación válido.' });
        }

        const querySql = `
            SELECT 
                r.reservacion_id,
                r.folio_confirmacion,
                r.usuario_id,
                r.suite_id,
                r.fecha_llegada,
                r.fecha_salida,
                r.noches,
                r.adultos,
                r.ninos,
                r.peticiones_especiales,
                r.subtotal,
                r.iva,
                r.ishe,
                r.saneamiento_ambiental,
                r.total_general,
                r.terminacion_tarjeta,
                r.estatus_reservacion,
                r.creado_en,
                u.nombres,
                u.apellidos,
                u.email,
                u.telefono,
                s.nombre_suite,
                s.descripcion_corta,
                s.imagen_principal
            FROM dbo.Reservaciones r
            LEFT JOIN dbo.Usuarios u ON r.usuario_id = u.usuario_id
            LEFT JOIN dbo.Suites s ON r.suite_id = s.suite_id
            WHERE (r.folio_confirmacion = @folio OR CAST(r.reservacion_id AS VARCHAR) = @folio)
              AND (
                  @correo = '' 
                  OR u.email = @correo 
                  OR u.apellidos LIKE '%' + @correo + '%'
              )
        `;

        const pool = await poolPromise;
        const request = pool.request()
            .input('folio', sql.VarChar(50), folio)
            .input('correo', sql.VarChar(100), (typeof correoOApellido !== 'undefined' ? correoOApellido : (typeof correo !== 'undefined' ? correo : '')));

        const result = await request.query(querySql);

        if (!result.recordset.length) {
            return res.status(404).json({ error: 'No se encontró ninguna reservación con el folio o correo especificado.' });
        }

        const reserva = result.recordset[0];
        res.json({
            ok: true,
            data: reserva,
            ...reserva
        });
    } catch (err) {
        console.error('Error al buscar reservación por localizador:', err);
        res.status(500).json({ error: 'Error interno al consultar el folio de reservación.' });
    }
};

// ==========================================

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
            .input('com', sql.VarChar, comentarios || '')
            .query(`
                INSERT INTO dbo.CotizacionesEventos (espacio_id, nombre_contacto, email, telefono, tipo_evento, fecha_evento, num_asistentes, comentarios, creado_en)
                VALUES (@eid, @nom, @mail, @tel, @tipo, @fecha, @num, @com, GETDATE());
                SELECT SCOPE_IDENTITY() AS cotizacion_id;
            `);
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
            .input('desc', sql.VarChar, descripcion || '')
            .query(`
                INSERT INTO dbo.TicketsContacto (usuario_id, hotel_destino, categoria, tipo_solicitud, clave_reservacion, nombres, apellidos, email, telefono, descripcion, estatus, creado_en)
                VALUES (@uid, @hotel, @cat, @tipo, @clave, @nom, @ape, @mail, @tel, @desc, 'ABIERTO', GETDATE());
                SELECT SCOPE_IDENTITY() AS ticket_id;
            `);
        res.status(201).json({ ok: true, ticket_id: insert.recordset[0].ticket_id });
    } catch (err) {
        console.error('Error en /api/contacto/tickets:', err);
        res.status(500).json({ error: 'Error al registrar ticket de contacto.' });
    }
});


// ==========================================
// ==========================================
// MÓDULO DE CONTACTO Y CONCIERGE (SQL SERVER)
// ==========================================
app.get('/api/contacto/usuario/:usuario_id', async (req, res) => {
    try {
        const { usuario_id } = req.params;
        const pool = await poolPromise;
        const result = await pool.request()
            .input('uid', sql.Int, usuario_id)
            .query("SELECT * FROM dbo.TicketsContacto WHERE usuario_id = @uid ORDER BY ticket_id DESC");
        res.json({ ok: true, data: result.recordset });
    } catch (err) {
        console.error('Error en /api/contacto/usuario:', err);
        res.status(500).json({ error: 'Error al consultar tickets del usuario.' });
    }
});

const handlerCrearTicket = async (req, res) => {
    try {
        const { usuario_id, hotel_destino, categoria, tipo_solicitud, clave_reservacion, nombres, apellidos, email, telefono, descripcion } = req.body;
        const pool = await poolPromise;
        const querySql = "INSERT INTO dbo.TicketsContacto (usuario_id, hotel_destino, categoria, tipo_solicitud, clave_reservacion, nombres, apellidos, email, telefono, descripcion, estatus, creado_en) VALUES (@uid, @hotel, @cat, @tipo, @clave, @nom, @ape, @mail, @tel, @desc, 'ABIERTO', GETDATE()); SELECT SCOPE_IDENTITY() AS ticket_id;";
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
            .input('desc', sql.VarChar, descripcion || '')
            .query(querySql);
        res.status(201).json({ ok: true, mensaje: 'Ticket registrado con éxito.', ticket_id: insert.recordset[0].ticket_id });
    } catch (err) {
        console.error('Error al crear ticket:', err);
        res.status(500).json({ error: 'Error al registrar ticket de contacto.' });
    }
};

app.post('/api/contacto', handlerCrearTicket);
app.post('/api/contacto/tickets', handlerCrearTicket);

// MANEJADOR GLOBAL 404 (FINAL ABSOLUTO DE RUTAS)
// ==========================================

// GET /api/usuarios/perfil/:id
// GET /api/usuarios/perfil/:id
app.get('/api/usuarios/perfil/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await poolPromise;
        const result = await pool.request()
            .input('uid', sql.Int, id)
            .query("SELECT usuario_id, nombres, apellidos, email, telefono, pais, programa_lealtad, fiesta_rewards_id, creado_en FROM dbo.Usuarios WHERE usuario_id = @uid");

        if (!result.recordset.length) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        const u = result.recordset[0];
        res.json({
            ok: true,
            usuario_id: u.usuario_id,
            nombre: u.nombres ? u.nombres.trim() : '',
            apellido: u.apellidos ? u.apellidos.trim() : '',
            nombres: u.nombres ? u.nombres.trim() : '',
            apellidos: u.apellidos ? u.apellidos.trim() : '',
            email: u.email || '',
            telefono: u.telefono || '',
            pais: u.pais || 'México',
            programa_lealtad: u.programa_lealtad || 'FiestaRewards',
            fiesta_rewards_id: u.fiesta_rewards_id || 'FR-000000'
        });
    } catch (err) {
        console.error('Error al consultar perfil del usuario:', err.message);
        res.status(500).json({ error: 'Error al consultar perfil: ' + err.message });
    }
});



// ==========================================
// RUTAS OFICIALES DE RESERVAS, SOCIOS Y BILLETERA
// ==========================================

// 1. BUSCADOR OFICIAL DE RESERVAS POR FOLIO (GET Y POST)
app.all(['/api/reservaciones/buscar'], async (req, res) => {
    try {
        const folio = (req.query.folio || req.body.folio || '').trim();
        const correo = (req.query.email || req.body.email || req.body.email_o_apellido || '').trim();

        if (!folio) {
            return res.status(400).json({ error: 'Debes ingresar un folio de reservación válido.' });
        }

        const pool = await poolPromise;
        const result = await pool.request()
            .input('folio', sql.VarChar(50), folio)
            .input('correo', sql.VarChar(150), correo)
            .query(`
                SELECT 
                    r.reservacion_id,
                    r.folio_confirmacion,
                    r.usuario_id,
                    r.suite_id,
                    r.fecha_llegada,
                    r.fecha_salida,
                    r.noches,
                    r.adultos,
                    r.ninos,
                    r.peticiones_especiales,
                    r.subtotal,
                    r.iva,
                    r.ishe,
                    r.saneamiento_ambiental,
                    r.total_general,
                    r.terminacion_tarjeta,
                    r.estatus_reservacion,
                    r.creado_en,
                    u.nombres,
                    u.apellidos,
                    u.email,
                    s.nombre AS nombre_suite,
                    s.tipo_cama,
                    s.foto_principal
                FROM dbo.Reservaciones r
                LEFT JOIN dbo.Usuarios u ON r.usuario_id = u.usuario_id
                LEFT JOIN dbo.HabitacionesSuites s ON r.suite_id = s.suite_id
                WHERE (r.folio_confirmacion = @folio OR CAST(r.reservacion_id AS VARCHAR) = @folio)
                  AND (@correo = '' OR u.email = @correo OR u.apellidos LIKE '%' + @correo + '%')
            `);

        if (!result.recordset.length) {
            return res.status(404).json({ error: 'No se encontró ninguna reservación con los datos especificados.' });
        }

        const reserva = result.recordset[0];
        res.json({ ok: true, data: reserva, ...reserva });
    } catch (err) {
        console.error('Error al buscar reservación:', err);
        res.status(500).json({ error: 'Error al consultar folio en SQL Server: ' + err.message });
    }
});

// 2. CREACIÓN OFICIAL DE RESERVACIÓN (CHECKOUT)
app.post('/api/reservaciones', async (req, res) => {
    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);

    try {
        const {
            usuario_id, suite_id, fecha_llegada, fecha_salida, noches,
            adultos, ninos, peticiones, peticiones_especiales,
            subtotal, iva, ishe, saneamiento, total_general,
            terminacion_tarjeta
        } = req.body;

        const uId = usuario_id || (req.user && req.user.usuario_id) || 2;
        const sId = parseInt(suite_id, 10);
        const folio = 'GFA-' + Math.floor(100000 + Math.random() * 900000);
        const notas = (peticiones || peticiones_especiales || '').trim();
        const tarjeta = terminacion_tarjeta ? String(terminacion_tarjeta).slice(-4) : '4242';

        await transaction.begin(sql.ISOLATION_LEVEL.SERIALIZABLE);

        // 1. Bloqueo pesimista de inventario para evitar colisiones
        const reqSuite = new sql.Request(transaction);
        const checkSuite = await reqSuite
            .input('sid', sql.Int, sId)
            .query("SELECT suite_id, nombre, inventario_disponible FROM dbo.HabitacionesSuites WITH (UPDLOCK, HOLDLOCK) WHERE suite_id = @sid");

        if (checkSuite.recordset.length === 0) {
            await transaction.rollback();
            return res.status(404).json({ error: 'La suite especificada no existe en la base de datos.' });
        }

        const suiteData = checkSuite.recordset[0];
        if (suiteData.inventario_disponible <= 0) {
            await transaction.rollback();
            return res.status(409).json({ error: `La suite "${suiteData.nombre}" no cuenta con cupo disponible en este momento.` });
        }

        // 2. Descontar cupo en inventario disponible
        await reqSuite.query("UPDATE dbo.HabitacionesSuites SET inventario_disponible = inventario_disponible - 1 WHERE suite_id = @sid");

        // 3. Registrar la estancia
        const reqRes = new sql.Request(transaction);
        const insertQuery = `
            INSERT INTO dbo.Reservaciones (
                usuario_id, suite_id, folio_confirmacion, fecha_llegada, fecha_salida,
                noches, adultos, ninos, peticiones_especiales, subtotal, iva, ishe,
                saneamiento_ambiental, total_general, terminacion_tarjeta,
                estatus_reservacion, creado_en
            )
            OUTPUT
                INSERTED.reservacion_id,
                INSERTED.folio_confirmacion,
                INSERTED.fecha_llegada,
                INSERTED.fecha_salida,
                INSERTED.noches,
                INSERTED.adultos,
                INSERTED.ninos,
                INSERTED.total_general,
                INSERTED.terminacion_tarjeta,
                INSERTED.estatus_reservacion,
                INSERTED.creado_en
            VALUES (
                @uid, @sid, @folio, @llegada, @salida,
                @noches, @adultos, @ninos, @notas, @subtotal, @iva, @ishe,
                @saneamiento, @total, @tarjeta, 'Confirmada', GETDATE()
            );
        `;

                // 2.1 Validación y débito atómico de Tarjeta Institucional Fiesta Card
        const esFiestaCard = req.body.metodo_pago_tipo === 'fiesta_card' || tarjeta === '8993';
        if (esFiestaCard) {
            const reqCard = new sql.Request(transaction);
            const checkCard = await reqCard
                .input('c_uid', sql.Int, uId)
                .query("SELECT tarjeta_id, saldo_disponible, linea_credito_total FROM dbo.TarjetasFiestaCard WITH (UPDLOCK, HOLDLOCK) WHERE usuario_id = @c_uid");

            if (checkCard.recordset.length === 0) {
                await transaction.rollback();
                return res.status(404).json({ error: 'No se encontró la línea Fiesta Card asociada a este usuario.' });
            }

            const cardData = checkCard.recordset[0];
            if (Number(cardData.saldo_disponible) < Number(total_general)) {
                await transaction.rollback();
                return res.status(402).json({
                    error: `Saldo insuficiente en tu Fiesta Card. Disponible: $${Number(cardData.saldo_disponible).toLocaleString('es-MX')} MXN, Requerido: $${Number(total_general).toLocaleString('es-MX')} MXN.`
                });
            }

            const puntosNuevos = Math.round(Number(total_general) * 0.10);
            await reqCard
                .input('monto_cargo', sql.Decimal(18, 2), total_general)
                .input('pts_ganados', sql.Int, puntosNuevos)
                .query(`
                    UPDATE dbo.TarjetasFiestaCard 
                    SET saldo_disponible = saldo_disponible - @monto_cargo,
                        saldo_utilizado = saldo_utilizado + @monto_cargo,
                        puntos_rewards_acumulados = puntos_rewards_acumulados + @pts_ganados
                    WHERE usuario_id = @c_uid
                `);
        }

        const resultadoReserva = await reqRes
            .input('uid', sql.Int, uId)
            .input('sid', sql.Int, sId)
            .input('folio', sql.VarChar(50), folio)
            .input('llegada', sql.Date, fecha_llegada)
            .input('salida', sql.Date, fecha_salida)
            .input('noches', sql.Int, parseInt(noches, 10) || 1)
            .input('adultos', sql.Int, parseInt(adultos, 10) || 1)
            .input('ninos', sql.Int, parseInt(ninos, 10) || 0)
            .input('notas', sql.VarChar(500), notas)
            .input('subtotal', sql.Decimal(18, 2), subtotal)
            .input('iva', sql.Decimal(18, 2), iva)
            .input('ishe', sql.Decimal(18, 2), ishe)
            .input('saneamiento', sql.Decimal(18, 2), saneamiento)
            .input('total', sql.Decimal(18, 2), total_general)
            .input('tarjeta', sql.VarChar(4), tarjeta)
            .query(insertQuery);

        await transaction.commit();

        res.status(201).json({
            ok: true,
            mensaje: 'Reservación procesada y cupo descontado en SQL Server.',
            reservacion: resultadoReserva.recordset[0]
        });
    } catch (err) {
        try { await transaction.rollback(); } catch (rbErr) {}
        console.error('Error al procesar reservación transaccional:', err);
        res.status(500).json({ error: 'Fallo al confirmar estancia: ' + err.message });
    }
});

// 3. HISTORIAL DE RESERVAS POR SOCIO
app.get('/api/reservaciones/usuario/:usuario_id', async (req, res) => {
    try {
        const { usuario_id } = req.params;
        const pool = await poolPromise;
        const result = await pool.request()
            .input('UsuarioID', sql.Int, usuario_id)
            .execute('dbo.sp_ObtenerHistorialReservaciones');

        res.json({
            ok: true,
            reservaciones: result.recordset,
            data: result.recordset
        });
    } catch (err) {
        console.error('Error al consultar historial de reservaciones:', err);
        res.status(500).json({ error: 'Error al consultar historial: ' + err.message });
    }
});

// 4. CANCELACIÓN DE RESERVAS
app.put('/api/reservaciones/:id/cancelar', async (req, res) => {
    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);

    try {
        const { id } = req.params;
        const reservacionId = parseInt(id, 10);

        await transaction.begin(sql.ISOLATION_LEVEL.SERIALIZABLE);

        // 1. Obtener la reservacion con bloqueo pesimista
        const reqCheck = new sql.Request(transaction);
        const checkRes = await reqCheck
            .input('rid', sql.Int, reservacionId)
            .query("SELECT reservacion_id, usuario_id, suite_id, folio_confirmacion, total_general, terminacion_tarjeta, estatus_reservacion FROM dbo.Reservaciones WITH (UPDLOCK, HOLDLOCK) WHERE reservacion_id = @rid");

        if (checkRes.recordset.length === 0) {
            await transaction.rollback();
            return res.status(404).json({ error: 'La reservación indicada no existe en el sistema.' });
        }

        const reserva = checkRes.recordset[0];
        if (reserva.estatus_reservacion === 'CANCELADA') {
            await transaction.rollback();
            return res.status(400).json({ error: `La reservación con folio ${reserva.folio_confirmacion} ya se encuentra cancelada.` });
        }

        // 2. Marcar como CANCELADA
        const reqUpdate = new sql.Request(transaction);
        await reqUpdate
            .input('rid', sql.Int, reservacionId)
            .query("UPDATE dbo.Reservaciones SET estatus_reservacion = 'CANCELADA' WHERE reservacion_id = @rid");

        // 3. Devolver el cupo retenido al inventario disponible de la suite
        const reqStock = new sql.Request(transaction);
                // Si la reserva se liquidó con Fiesta Card (8993), reintegrar crédito y saldo
        if (reserva.terminacion_tarjeta === '8993') {
            const reqReintegro = new sql.Request(transaction);
            const puntosDeducir = Math.round(Number(reserva.total_general) * 0.10);
            await reqReintegro
                .input('r_uid', sql.Int, reserva.usuario_id)
                .input('monto_dev', sql.Decimal(18, 2), reserva.total_general)
                .input('pts_deducir', sql.Int, puntosDeducir)
                .query(`
                    UPDATE dbo.TarjetasFiestaCard 
                    SET saldo_disponible = saldo_disponible + @monto_dev,
                        saldo_utilizado = CASE WHEN saldo_utilizado >= @monto_dev THEN saldo_utilizado - @monto_dev ELSE 0 END,
                        puntos_rewards_acumulados = CASE WHEN puntos_rewards_acumulados >= @pts_deducir THEN puntos_rewards_acumulados - @pts_deducir ELSE 0 END
                    WHERE usuario_id = @r_uid
                `);
        }

        await reqStock
            .input('sid', sql.Int, reserva.suite_id)
            .query("UPDATE dbo.HabitacionesSuites SET inventario_disponible = inventario_disponible + 1 WHERE suite_id = @sid");

        await transaction.commit();

        res.json({
            ok: true,
            mensaje: `Reservación ${reserva.folio_confirmacion} cancelada con éxito. El inventario ha sido liberado en SQL Server.`
        });
    } catch (err) {
        try {
            await transaction.rollback();
        } catch (rbErr) {}
        console.error('Error al cancelar reservación:', err);
        res.status(500).json({ error: 'Fallo al procesar la cancelación: ' + err.message });
    }
});

// 5. TARJETA CORPORATIVA FIESTA CARD
app.get('/api/tarjeta-fiesta/:usuario_id', async (req, res) => {
    try {
        const { usuario_id } = req.params;
        const pool = await poolPromise;
        const result = await pool.request()
            .input('uid', sql.Int, usuario_id)
            .query("SELECT TOP 1 * FROM dbo.TarjetasFiestaCard WHERE usuario_id = @uid");

        if (!result.recordset.length) {
            return res.json({
                ok: true,
                data: {
                    numero_enmascarado: '•••• •••• •••• 7412',
                    saldo_disponible: 50000.00,
                    puntos_rewards_acumulados: 2500,
                    nivel_membresia: 'Titanium Privilege'
                }
            });
        }
        res.json({ ok: true, data: result.recordset[0] });
    } catch (err) {
        console.error('Error al obtener Fiesta Card:', err);
        res.status(500).json({ error: 'Error al obtener Fiesta Card' });
    }
});

// 6. ACTUALIZACIÓN DE PERFIL DE SOCIO (PUT)
app.put(['/api/usuarios/perfil/:id', '/api/usuarios/:id'], async (req, res) => {
    try {
        const { id } = req.params;
        const { nombres, apellidos, telefono, pais } = req.body;
        const pool = await poolPromise;

        await pool.request()
            .input('uid', sql.Int, id)
            .input('nombres', sql.VarChar(80), nombres || '')
            .input('apellidos', sql.VarChar(80), apellidos || '')
            .input('telefono', sql.VarChar(20), telefono || '')
            .input('pais', sql.VarChar(50), pais || 'México')
            .query(`
                UPDATE dbo.Usuarios 
                SET nombres = @nombres, apellidos = @apellidos, telefono = @telefono, pais = @pais 
                WHERE usuario_id = @uid
            `);

        res.json({ ok: true, mensaje: 'Perfil actualizado con éxito en SQL Server.' });
    } catch (err) {
        console.error('Error al actualizar perfil:', err);
        res.status(500).json({ error: 'Error al actualizar perfil: ' + err.message });
    }
});


// ==========================================
// RUTAS DE BILLETERA BANCARIA Y FACTURACIÓN CFDI 4.0
// ==========================================

// 1. REGISTRAR NUEVA TARJETA BANCARIA EN SQL SERVER
app.post('/api/billetera', async (req, res) => {
    try {
        const pool = await poolPromise;
        const {
            usuario_id, alias_tarjeta, banco_emisor, marca_tarjeta,
            tipo_cuenta, numero_tarjeta, titular_nombre,
            mes_expiracion, anio_expiracion, saldo_disponible_simulado, es_preferida
        } = req.body;

        const uid = usuario_id || (req.user && req.user.usuario_id);
        if (!uid || !numero_tarjeta) {
            return res.status(400).json({ error: 'Faltan parámetros requeridos para registrar la tarjeta.' });
        }

        const ultimosCuatro = String(numero_tarjeta).slice(-4);
        const enmascarado = '•••• •••• •••• ' + ultimosCuatro;

        // Si se marca como preferida, desmarcar las anteriores
        if (es_preferida) {
            await pool.request()
                .input('uid', sql.Int, uid)
                .query("UPDATE dbo.TarjetasBancariasUsuario SET es_preferida = 0 WHERE usuario_id = @uid");
        }

        const insertQuery = `
            INSERT INTO dbo.TarjetasBancariasUsuario (
                usuario_id, alias_tarjeta, banco_emisor, marca_tarjeta,
                tipo_cuenta, numero_enmascarado, titular_nombre,
                mes_expiracion, anio_expiracion, saldo_disponible_simulado,
                es_preferida, estatus, creado_en
            )
            OUTPUT INSERTED.*
            VALUES (
                @uid, @alias, @banco, @marca,
                @tipo, @enmascarado, @titular,
                @mes, @anio, @saldo,
                @preferida, 'ACTIVA', GETDATE()
            );
        `;

        const result = await pool.request()
            .input('uid', sql.Int, uid)
            .input('alias', sql.VarChar(100), alias_tarjeta || 'Tarjeta Personal')
            .input('banco', sql.VarChar(100), banco_emisor || 'Banca Institucional')
            .input('marca', sql.VarChar(50), marca_tarjeta || 'VISA')
            .input('tipo', sql.VarChar(50), tipo_cuenta || 'Crédito')
            .input('enmascarado', sql.VarChar(50), enmascarado)
            .input('titular', sql.NVarChar(150), titular_nombre || 'SOCIO TITULAR')
            .input('mes', sql.Int, parseInt(mes_expiracion, 10) || 12)
            .input('anio', sql.Int, parseInt(anio_expiracion, 10) || 29)
            .input('saldo', sql.Decimal(18, 2), saldo_disponible_simulado || 50000.00)
            .input('preferida', sql.Bit, es_preferida ? 1 : 0)
            .query(insertQuery);

        res.status(201).json({
            ok: true,
            mensaje: 'Tarjeta bancaria vinculada exitosamente a la bóveda de SQL Server.',
            tarjeta: result.recordset[0]
        });
    } catch (err) {
        console.error('Error al registrar tarjeta bancaria:', err);
        res.status(500).json({ error: 'Error al vincular tarjeta: ' + err.message });
    }
});

// 2. ESTABLECER TARJETA COMO PREFERIDA
app.put('/api/billetera/:id/preferida', async (req, res) => {
    try {
        const { id } = req.params;
        const { usuario_id } = req.body;
        const pool = await poolPromise;

        if (usuario_id) {
            await pool.request()
                .input('uid', sql.Int, usuario_id)
                .query("UPDATE dbo.TarjetasBancariasUsuario SET es_preferida = 0 WHERE usuario_id = @uid");
        }

        await pool.request()
            .input('tid', sql.Int, id)
            .query("UPDATE dbo.TarjetasBancariasUsuario SET es_preferida = 1 WHERE tarjeta_bancaria_id = @tid");

        res.json({ ok: true, mensaje: 'Tarjeta seleccionada como principal de cobro.' });
    } catch (err) {
        console.error('Error al actualizar tarjeta preferida:', err);
        res.status(500).json({ error: 'Error al actualizar preferencia: ' + err.message });
    }
});

// 3. REMOVER TARJETA BANCARIA
app.delete('/api/billetera/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await poolPromise;

        await pool.request()
            .input('tid', sql.Int, id)
            .query("DELETE FROM dbo.TarjetasBancariasUsuario WHERE tarjeta_bancaria_id = @tid");

        res.json({ ok: true, mensaje: 'Tarjeta bancaria eliminada con éxito de SQL Server.' });
    } catch (err) {
        console.error('Error al eliminar tarjeta bancaria:', err);
        res.status(500).json({ error: 'Error al remover tarjeta: ' + err.message });
    }
});

// 4. CONSULTAR FACTURAS CFDI DEL USUARIO
app.get('/api/facturas/usuario/:usuario_id', async (req, res) => {
    try {
        const { usuario_id } = req.params;
        const pool = await poolPromise;

        const result = await pool.request()
            .input('uid', sql.Int, usuario_id)
            .query(`
                SELECT 
                    f.factura_id,
                    f.reservacion_id,
                    f.folio_reservacion,
                    f.uuid_sat,
                    f.serie,
                    f.folio_fiscal,
                    f.rfc_emisor,
                    f.razon_social_emisor,
                    f.rfc_receptor,
                    f.razon_social_receptor,
                    f.codigo_postal_fiscal,
                    f.regimen_fiscal_receptor,
                    f.uso_cfdi,
                    f.subtotal,
                    f.iva_trasladado,
                    f.ish_trasladado,
                    f.saneamiento_ambiental,
                    f.total_facturado,
                    f.estatus_factura,
                    f.creado_en
                FROM dbo.FacturasCFDI f
                INNER JOIN dbo.Reservaciones r ON f.reservacion_id = r.reservacion_id
                WHERE r.usuario_id = @uid
                ORDER BY f.creado_en DESC
            `);

        res.json(result.recordset);
    } catch (err) {
        console.error('Error al consultar facturas:', err);
        res.status(500).json({ error: 'Error al consultar historial fiscal: ' + err.message });
    }
});

// 5. EMITIR Y TIMBRAR FACTURA CFDI 4.0
app.post('/api/facturas', async (req, res) => {
    try {
        const pool = await poolPromise;
        console.log('--> Solicitud recibida en /api/facturas:', req.body);
        const folio_reservacion = String(req.body.folio_confirmacion || req.body.folio_reservacion || req.body.folio || '').trim();
        const rfc_receptor = String(req.body.rfc_receptor || req.body.rfc || '').trim().toUpperCase();
        const razon_social = String(req.body.razon_social_receptor || req.body.razon_social || '').trim().toUpperCase();
        const codigo_postal = String(req.body.codigo_postal_fiscal || req.body.codigo_postal || '54980').trim();
        const regimen_fiscal = String(req.body.regimen_fiscal_receptor || req.body.regimen_fiscal || '601').trim();
        const uso_cfdi = String(req.body.uso_cfdi || 'G03').trim();

        if (!folio_reservacion || !rfc_receptor || !razon_social) {
            return res.status(400).json({ error: 'Folio de reservación, RFC y Razón Social son obligatorios.', recibido: req.body });
        }

        // Buscar reservación real para extraer montos contables
        const resConsulta = await pool.request()
            .input('folio', sql.VarChar(50), folio_reservacion.trim())
            .query("SELECT TOP 1 * FROM dbo.Reservaciones WHERE folio_confirmacion = @folio");

        if (!resConsulta.recordset.length) {
            return res.status(404).json({ error: 'No se localizó la estancia para emitir comprobante CFDI.' });
        }

        const reserva = resConsulta.recordset[0];
        const folioFiscalNumero = 'GFA-' + Math.floor(100000 + Math.random() * 900000);

        const insertCFDI = `
            INSERT INTO dbo.FacturasCFDI (
                reservacion_id, folio_reservacion, uuid_sat, serie, folio_fiscal,
                rfc_emisor, razon_social_emisor, regimen_fiscal_emisor,
                rfc_receptor, razon_social_receptor, codigo_postal_fiscal,
                regimen_fiscal_receptor, uso_cfdi, forma_pago, metodo_pago,
                subtotal, iva_trasladado, ish_trasladado, saneamiento_ambiental,
                total_facturado, estatus_factura, creado_en
            )
            OUTPUT INSERTED.*
            VALUES (
                @rid, @folioRes, NEWID(), 'FA', @folioFiscal,
                'GFA920401HM3', 'GRUPO POSADAS HOTEL GRAND FIESTA AMERICANA S.A. DE C.V.', '601',
                @rfcReceptor, @razonReceptor, @cp,
                @regimen, @uso, '04', 'PUE',
                @subtotal, @iva, @ish, @saneamiento,
                @total, 'TIMBRADA', GETDATE()
            );
        `;

        const resultadoFactura = await pool.request()
            .input('rid', sql.Int, reserva.reservacion_id)
            .input('folioRes', sql.VarChar(50), reserva.folio_confirmacion)
            .input('folioFiscal', sql.VarChar(50), folioFiscalNumero)
            .input('rfcReceptor', sql.VarChar(20), rfc_receptor.trim().toUpperCase())
            .input('razonReceptor', sql.NVarChar(150), razon_social.trim().toUpperCase())
            .input('cp', sql.VarChar(10), codigo_postal || '77500')
            .input('regimen', sql.VarChar(10), regimen_fiscal || '612')
            .input('uso', sql.VarChar(10), uso_cfdi || 'G03')
            .input('subtotal', sql.Decimal(18, 2), reserva.subtotal)
            .input('iva', sql.Decimal(18, 2), reserva.iva)
            .input('ish', sql.Decimal(18, 2), reserva.ishe)
            .input('saneamiento', sql.Decimal(18, 2), reserva.saneamiento_ambiental)
            .input('total', sql.Decimal(18, 2), reserva.total_general)
            .query(insertCFDI);

        res.status(201).json({
            ok: true,
            mensaje: 'Comprobante CFDI 4.0 timbrado y registrado con éxito en SQL Server.',
            factura: resultadoFactura.recordset[0]
        });
    } catch (err) {
        console.error('Error al timbrar CFDI:', err);
        res.status(500).json({ error: 'Error al emitir factura CFDI: ' + err.message });
    }
});


// ==========================================
// RUTAS DE CONFIGURACIÓN DE CUENTA Y TICKETS CONCIERGE
// ==========================================

// ACTUALIZAR PERFIL Y CREDENCIALES DEL SOCIO
app.put('/api/usuarios/perfil/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nombres, apellidos, telefono, password } = req.body;
        const pool = await poolPromise;

        let queryUpdate = `
            UPDATE dbo.Usuarios
            SET nombres = COALESCE(@nombres, nombres),
                Nombre = COALESCE(@nombres, Nombre),
                apellidos = COALESCE(@apellidos, apellidos),
                ApellidoPaterno = COALESCE(@apellidos, ApellidoPaterno),
                telefono = COALESCE(@telefono, telefono)
        `;

        const request = pool.request()
            .input('uid', sql.Int, id)
            .input('nombres', sql.VarChar(80), nombres ? nombres.trim() : null)
            .input('apellidos', sql.VarChar(80), apellidos ? apellidos.trim() : null)
            .input('telefono', sql.VarChar(20), telefono ? telefono.trim() : null);

        if (password && password.trim().length >= 6) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password.trim(), salt);
            queryUpdate += `, password_hash = @pwd, PasswordHash = @pwd`;
            request.input('pwd', sql.VarChar(255), hashedPassword);
        }

        queryUpdate += ` OUTPUT INSERTED.usuario_id, INSERTED.nombres, INSERTED.apellidos, INSERTED.email, INSERTED.telefono, INSERTED.fiesta_rewards_id WHERE usuario_id = @uid;`;

        const result = await request.query(queryUpdate);

        if (result.recordset.length === 0) {
            return res.status(404).json({ error: 'Usuario no localizado en SQL Server.' });
        }

        res.json({
            ok: true,
            mensaje: 'Perfil y credenciales actualizadas correctamente en SQL Server.',
            usuario: result.recordset[0]
        });
    } catch (err) {
        console.error('Error al actualizar perfil de usuario:', err);
        res.status(500).json({ error: 'Error al actualizar perfil: ' + err.message });
    }
});

// CONSULTAR TICKETS DE CONCIERGE DEL USUARIO
app.get('/api/tickets/usuario/:usuario_id', async (req, res) => {
    try {
        const { usuario_id } = req.params;
        const pool = await poolPromise;

        const result = await pool.request()
            .input('uid', sql.Int, usuario_id)
            .query(`
                SELECT 
                    ticket_id, usuario_id, hotel_destino, categoria,
                    tipo_solicitud, clave_reservacion, nombres, apellidos,
                    email, telefono, descripcion, estatus, creado_en
                FROM dbo.TicketsContacto
                WHERE usuario_id = @uid
                ORDER BY creado_en DESC;
            `);

        res.json(result.recordset);
    } catch (err) {
        console.error('Error al consultar tickets:', err);
        res.status(500).json({ error: 'Error al obtener tickets: ' + err.message });
    }
});

// CREAR TICKET DE CONCIERGE / CONTACTO
app.post('/api/tickets', async (req, res) => {
    try {
        const pool = await poolPromise;
        const {
            usuario_id, hotel_destino, categoria, tipo_solicitud,
            clave_reservacion, nombres, apellidos, email, telefono, descripcion
        } = req.body;

        if (!hotel_destino || !categoria || !descripcion || !nombres || !email) {
            return res.status(400).json({ error: 'Campos obligatorios incompletos para generar ticket.' });
        }

        const insertQuery = `
            INSERT INTO dbo.TicketsContacto (
                usuario_id, hotel_destino, categoria, tipo_solicitud,
                clave_reservacion, nombres, apellidos, email, telefono,
                descripcion, estatus, creado_en
            )
            OUTPUT INSERTED.*
            VALUES (
                @uid, @hotel, @cat, @tipo,
                @clave, @nom, @ape, @correo, @tel,
                @desc, 'ABIERTO', GETDATE()
            );
        `;

        const result = await pool.request()
            .input('uid', sql.Int, usuario_id || null)
            .input('hotel', sql.VarChar(150), hotel_destino.trim())
            .input('cat', sql.VarChar(100), categoria.trim())
            .input('tipo', sql.VarChar(100), tipo_solicitud ? tipo_solicitud.trim() : 'Asistencia General')
            .input('clave', sql.VarChar(50), clave_reservacion ? clave_reservacion.trim() : null)
            .input('nom', sql.VarChar(100), nombres.trim())
            .input('ape', sql.VarChar(100), (apellidos || '').trim())
            .input('correo', sql.VarChar(150), email.trim().toLowerCase())
            .input('tel', sql.VarChar(50), (telefono || '').trim())
            .input('desc', sql.VarChar, descripcion.trim())
            .query(insertQuery);

        res.status(201).json({
            ok: true,
            mensaje: 'Ticket de Concierge canalizado y registrado con éxito.',
            ticket: result.recordset[0]
        });
    } catch (err) {
        console.error('Error al registrar ticket:', err);
        res.status(500).json({ error: 'Error al procesar ticket: ' + err.message });
    }
});


// ==========================================
// FLUJO DE RECUPERACIÓN Y RESET DE CONTRASEÑA
// ==========================================

// 1. SOLICITAR TOKEN DE RECUPERACIÓN
app.post(['/api/auth/recuperar-password', '/api/usuarios/recuperar-password'], async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ error: 'Debes proporcionar un correo electrónico válido.' });
        }

        const pool = await poolPromise;
        const checkUser = await pool.request()
            .input('correo', sql.VarChar(150), email.trim().toLowerCase())
            .query("SELECT usuario_id, email, nombres FROM dbo.Usuarios WHERE LOWER(email) = @correo");

        if (checkUser.recordset.length === 0) {
            return res.json({
                ok: true,
                mensaje: 'Si el correo está registrado en Grand Fiesta Americana, recibirás las instrucciones en breve.'
            });
        }

        const crypto = require('crypto');
        const token = crypto.randomBytes(32).toString('hex');
        const userId = checkUser.recordset[0].usuario_id;

        await pool.request()
            .input('uid', sql.Int, userId)
            .input('token', sql.VarChar(100), token)
            .query(`
                UPDATE dbo.Usuarios
                SET token_recuperacion = @token,
                    token_expiracion = DATEADD(hour, 1, GETDATE())
                WHERE usuario_id = @uid;
            `);

        res.json({
            ok: true,
            mensaje: 'Token de restablecimiento generado con éxito. Vigencia: 1 hora.',
            token_recuperacion: token
        });
    } catch (err) {
        console.error('Error al generar token de recuperación:', err);
        res.status(500).json({ error: 'Error interno al procesar recuperación: ' + err.message });
    }
});

// 2. RESTABLECER CONTRASEÑA CON TOKEN VÁLIDO
app.post(['/api/auth/reset-password', '/api/usuarios/reset-password'], async (req, res) => {
    try {
        const { token, password } = req.body;
        if (!token || !password || password.trim().length < 6) {
            return res.status(400).json({ error: 'Token no provisto o contraseña menor a 6 caracteres.' });
        }

        const pool = await poolPromise;
        const checkToken = await pool.request()
            .input('token', sql.VarChar(100), token.trim())
            .query(`
                SELECT usuario_id, email, nombres 
                FROM dbo.Usuarios 
                WHERE token_recuperacion = @token 
                  AND token_expiracion > GETDATE();
            `);

        if (checkToken.recordset.length === 0) {
            return res.status(400).json({ error: 'El enlace de recuperación es inválido o ha expirado.' });
        }

        const userId = checkToken.recordset[0].usuario_id;
        const bcryptMod = require('bcryptjs');
        const salt = await bcryptMod.genSalt(10);
        const hashedPwd = await bcryptMod.hash(password.trim(), salt);

        await pool.request()
            .input('uid', sql.Int, userId)
            .input('pwd', sql.VarChar(255), hashedPwd)
            .query(`
                UPDATE dbo.Usuarios
                SET password_hash = @pwd,
                    PasswordHash = @pwd,
                    token_recuperacion = NULL,
                    token_expiracion = NULL
                WHERE usuario_id = @uid;
            `);

        res.json({
            ok: true,
            mensaje: 'Contraseña actualizada con éxito en SQL Server. Puedes iniciar sesión con tus nuevas credenciales.'
        });
    } catch (err) {
        console.error('Error al restablecer contraseña:', err);
        res.status(500).json({ error: 'Error al actualizar contraseña: ' + err.message });
    }
});



// 6. CANCELAR / ELIMINAR FACTURA CFDI 4.0
app.delete('/api/facturas/:folio', async (req, res) => {
    try {
        const { folio } = req.params;
        const pool = await poolPromise;

        const resultado = await pool.request()
            .input('folio', sql.VarChar(50), folio.trim())
            .query(`
                DELETE FROM dbo.FacturasCFDI 
                WHERE folio_reservacion = @folio;
                SELECT @@ROWCOUNT AS eliminadas;
            `);

        const filasEliminadas = resultado.recordset[0]?.eliminadas || 0;

        if (filasEliminadas === 0) {
            return res.status(404).json({ error: 'No se encontró ninguna factura activa para este folio de reservación.' });
        }

        console.log(`[SAT CFDI 4.0] Factura eliminada/cancelada para el folio: ${folio}`);
        res.json({ ok: true, mensaje: `Factura CFDI amparada bajo el folio ${folio} cancelada y eliminada con éxito.` });
    } catch (err) {
        console.error('Error al cancelar factura:', err);
        res.status(500).json({ error: 'Error interno al cancelar la factura: ' + err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor seguro corriendo en http://localhost:${PORT}`);
});





