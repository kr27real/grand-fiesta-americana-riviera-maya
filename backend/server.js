const express = require('express');
const cors = require('cors');
const sql = require('mssql');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'gfa_secret_key_ultra_secure_2026';

// Configuración de base de datos SQL Server
const dbConfig = {
    user: process.env.DB_USER || 'sa',
    password: process.env.DB_PASSWORD || '123456',
    server: process.env.DB_SERVER || 'localhost',
    database: process.env.DB_DATABASE || 'HotelGranFiestaAmericanaDB',
    options: {
        encrypt: false,
        trustServerCertificate: true,
        enableArithAbort: true
    }
};

const poolPromise = new sql.ConnectionPool(dbConfig)
    .connect()
    .then(pool => {
        console.log(`Conectado exitosamente a SQL Server: ${dbConfig.database}`);
        return pool;
    })
    .catch(err => {
        console.error('Error crítico al conectar a SQL Server:', err.message);
        process.exit(1);
    });

app.use(cors());
app.use(express.json());

// ==========================================
// 1. CATÁLOGOS PÚBLICOS DEL RESORT
// ==========================================

// Habitaciones y Suites
app.get(['/api/habitaciones', '/api/suites'], async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query("SELECT * FROM dbo.HabitacionesSuites ORDER BY suite_id ASC");
        res.json(result.recordset);
    } catch (err) {
        console.error('Error al consultar suites:', err.message);
        res.status(500).json({ error: 'Error al consultar catálogo de suites' });
    }
});

// Experiencias Exclusivas
app.get('/api/experiencias', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query("SELECT * FROM dbo.ExperienciasExclusivas WHERE activo = 1 ORDER BY experiencia_id ASC");
        res.json(result.recordset);
    } catch (err) {
        console.error('Error al consultar experiencias:', err.message);
        res.status(500).json({ error: 'Error al consultar experiencias exclusivas' });
    }
});

// Restaurantes y Cava
app.get('/api/restaurantes', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query("SELECT * FROM dbo.Restaurantes WHERE activo = 1 ORDER BY restaurante_id ASC");
        res.json(result.recordset);
    } catch (err) {
        console.error('Error al consultar restaurantes:', err.message);
        res.status(500).json({ error: 'Error al consultar restaurantes' });
    }
});

// Ofertas y Promociones
app.get('/api/ofertas', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query("SELECT * FROM dbo.OfertasPromociones WHERE activo = 1 ORDER BY oferta_id ASC");
        res.json(result.recordset);
    } catch (err) {
        console.error('Error al consultar ofertas:', err.message);
        res.status(500).json({ error: 'Error al consultar promociones' });
    }
});

// Espacios para Eventos y Convenciones (MICE)
app.get('/api/eventos/espacios', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query("SELECT * FROM dbo.EspaciosEventos WHERE activo = 1 ORDER BY espacio_id ASC");
        res.json(result.recordset);
    } catch (err) {
        console.error('Error al consultar espacios:', err.message);
        res.status(500).json({ error: 'Error al consultar espacios para eventos' });
    }
});

// Cotizar Evento MICE
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
        res.status(201).json({ ok: true, mensaje: 'Cotización registrada con éxito.', cotizacion_id: insert.recordset[0].cotizacion_id });
    } catch (err) {
        console.error('Error en cotización:', err);
        res.status(500).json({ error: 'Error al registrar cotización: ' + err.message });
    }
});

// Galería Multimedia
app.get('/api/galeria', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query("SELECT * FROM dbo.Galeria WHERE activo = 1 ORDER BY foto_id ASC");
        res.json(result.recordset);
    } catch (err) {
        console.error('Error al consultar galeria:', err.message);
        res.status(500).json({ error: 'Error al consultar galería de fotos' });
    }
});

// ==========================================
// 2. MÓDULO DE AUTENTICACIÓN Y SEGURIDAD
// ==========================================

// Registro de Socios
app.post('/api/usuarios/registro', async (req, res) => {
    try {
        const { tratamiento, nombres, apellidos, email, password, telefono, pais, codigo_promocional } = req.body;

        if (!nombres || !apellidos || !email || !password) {
            return res.status(400).json({ error: 'Todos los campos obligatorios deben completarse.' });
        }

        const pool = await poolPromise;
        const userExists = await pool.request()
            .input('email', sql.VarChar(100), email.trim().toLowerCase())
            .query("SELECT usuario_id FROM dbo.Usuarios WHERE LOWER(email) = @email");

        if (userExists.recordset.length > 0) {
            return res.status(400).json({ error: 'El correo electrónico ya se encuentra registrado.' });
        }

        const salt = await bcrypt.genSalt(10);
        const passHash = await bcrypt.hash(password, salt);
        const randomFR = 'FR-' + Math.floor(100000 + Math.random() * 900000);
        const telSeguro = telefono ? String(telefono).trim() : '';

        const insertResult = await pool.request()
            .input('tratamiento', sql.VarChar(10), tratamiento || 'Sr.')
            .input('nombres', sql.VarChar(80), nombres.trim())
            .input('apellidos', sql.VarChar(80), apellidos.trim())
            .input('email', sql.VarChar(100), email.trim().toLowerCase())
            .input('telefono', sql.VarChar(20), telSeguro)
            .input('pais', sql.VarChar(50), pais || 'México')
            .input('programa_lealtad', sql.VarChar(50), 'FiestaRewards')
            .input('fiesta_rewards_id', sql.VarChar(50), randomFR)
            .input('password_hash', sql.VarChar(255), passHash)
            .input('promo', sql.VarChar(50), codigo_promocional || null)
            .query(`
                INSERT INTO dbo.Usuarios (
                    tratamiento, nombres, apellidos, email, telefono, pais,
                    programa_lealtad, fiesta_rewards_id, password_hash,
                    Nombre, ApellidoPaterno, Programa, CodigoPromocional, PasswordHash,
                    creado_en, FechaRegistro, intentos_fallidos,
                    nivel_socio, noches_acumuladas, preferencia_cama, preferencia_piso
                )
                OUTPUT INSERTED.usuario_id, INSERTED.fiesta_rewards_id, INSERTED.nombres, INSERTED.apellidos, INSERTED.email, INSERTED.telefono
                VALUES (
                    @tratamiento, @nombres, @apellidos, @email, @telefono, @pais,
                    @programa_lealtad, @fiesta_rewards_id, @password_hash,
                    @nombres, @apellidos, @programa_lealtad, @promo, @password_hash,
                    GETDATE(), GETDATE(), 0,
                    'Titanium Privilege', 12, 'King Size', 'Piso Alto - Vista al Mar'
                )
            `);

        const nuevoUsuario = insertResult.recordset[0];

        // Crear Fiesta Card digital
        const maskNum = `4829 ${Math.floor(1000 + Math.random() * 9000)} ${Math.floor(1000 + Math.random() * 9000)} ${Math.floor(1000 + Math.random() * 9000)}`;
        await pool.request()
            .input('uid', sql.Int, nuevoUsuario.usuario_id)
            .input('num', sql.VarChar(19), maskNum)
            .query(`
                INSERT INTO dbo.TarjetasFiestaCard (
                    usuario_id, numero_enmascarado, linea_credito_total, saldo_disponible,
                    saldo_utilizado, puntos_rewards_acumulados, nivel_membresia, estatus_tarjeta, fecha_expiracion, creado_en
                ) VALUES (
                    @uid, @num, 50000.00, 50000.00, 0.00, 2500, 'Titanium Privilege', 'Activa', '11/30', GETDATE()
                )
            `);

        const token = jwt.sign({ usuario_id: nuevoUsuario.usuario_id, email: nuevoUsuario.email }, JWT_SECRET, { expiresIn: '7d' });

        res.status(201).json({
            ok: true,
            mensaje: 'Socio registrado con éxito.',
            usuario: nuevoUsuario,
            token
        });

    } catch (err) {
        console.error('Error en registro:', err);
        res.status(500).json({ error: 'Error al registrar socio en SQL Server: ' + err.message });
    }
});

// Login
app.post('/api/usuarios/login', async (req, res) => {
    try {
        const { identificador, email, password } = req.body;
        const idIngresado = (identificador || email || '').trim();

        if (!idIngresado || !password) {
            return res.status(400).json({ error: 'Debes ingresar tu correo o No. Fiesta Rewards y tu contraseña.' });
        }

        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.VarChar(100), idIngresado)
            .query(`
                SELECT usuario_id, tratamiento, nombres, apellidos, email, telefono, pais,
                       programa_lealtad, fiesta_rewards_id, password_hash, intentos_fallidos,
                       bloqueado_hasta, nivel_socio, noches_acumuladas, preferencia_cama,
                       preferencia_piso, preferencias_adicionales, creado_en
                FROM dbo.Usuarios 
                WHERE LOWER(email) = LOWER(@id) OR UPPER(fiesta_rewards_id) = UPPER(@id)
            `);

        if (result.recordset.length === 0) {
            return res.status(401).json({ error: 'Credenciales inválidas. Verifica tu correo o membresía.' });
        }

        const user = result.recordset[0];

        if (user.bloqueado_hasta && new Date(user.bloqueado_hasta) > new Date()) {
            return res.status(403).json({ error: 'Cuenta bloqueada temporalmente por intentos fallidos. Intenta más tarde.' });
        }

        const passMatch = await bcrypt.compare(password, user.password_hash);
        if (!passMatch) {
            const intentos = (user.intentos_fallidos || 0) + 1;
            let bloqueadoHasta = null;
            if (intentos >= 5) {
                bloqueadoHasta = new Date(Date.now() + 15 * 60 * 1000);
            }

            await pool.request()
                .input('uid', sql.Int, user.usuario_id)
                .input('intentos', sql.Int, intentos)
                .input('bloqueado', sql.DateTime, bloqueadoHasta)
                .query("UPDATE dbo.Usuarios SET intentos_fallidos = @intentos, bloqueado_hasta = @bloqueado WHERE usuario_id = @uid");

            return res.status(401).json({ error: 'Contraseña incorrecta.' });
        }

        await pool.request()
            .input('uid', sql.Int, user.usuario_id)
            .query("UPDATE dbo.Usuarios SET intentos_fallidos = 0, bloqueado_hasta = NULL, ultimo_acceso = GETDATE() WHERE usuario_id = @uid");

        const token = jwt.sign({ usuario_id: user.usuario_id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

        delete user.password_hash;
        res.json({
            ok: true,
            mensaje: 'Bienvenido de vuelta.',
            usuario: user,
            token
        });

    } catch (err) {
        console.error('Error en login:', err);
        res.status(500).json({ error: 'Error interno en autenticación: ' + err.message });
    }
});

// Recuperación de Contraseña
app.post('/api/usuarios/recuperar-password', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ error: 'El correo electrónico es requerido.' });

        const pool = await poolPromise;
        const check = await pool.request()
            .input('email', sql.VarChar(100), email.trim().toLowerCase())
            .query("SELECT usuario_id FROM dbo.Usuarios WHERE LOWER(email) = @email");

        if (check.recordset.length === 0) {
            return res.json({ ok: true, mensaje: 'Si el correo está registrado, se emitirá el código de seguridad.' });
        }

        const codigo = Math.floor(100000 + Math.random() * 900000).toString();
        await pool.request()
            .input('uid', sql.Int, check.recordset[0].usuario_id)
            .input('token', sql.VarChar(100), codigo)
            .query("UPDATE dbo.Usuarios SET token_recuperacion = @token, token_expiracion = DATEADD(minute, 15, GETDATE()) WHERE usuario_id = @uid");

        res.json({ ok: true, mensaje: 'Código de seguridad emitido exitosamente.', codigo_simulado: codigo });
    } catch (err) {
        console.error('Error en recuperar-password:', err);
        res.status(500).json({ error: 'Error al solicitar código: ' + err.message });
    }
});

// Restablecimiento de Contraseña
app.post('/api/usuarios/restablecer-password', async (req, res) => {
    try {
        const { email, codigo_token, nueva_password } = req.body;
        if (!email || !codigo_token || !nueva_password || nueva_password.length < 8) {
            return res.status(400).json({ error: 'Datos incompletos o contraseña menor a 8 caracteres.' });
        }

        const pool = await poolPromise;
        const result = await pool.request()
            .input('email', sql.VarChar(100), email.trim().toLowerCase())
            .input('token', sql.VarChar(100), codigo_token.trim())
            .query("SELECT usuario_id, token_expiracion FROM dbo.Usuarios WHERE LOWER(email) = @email AND token_recuperacion = @token");

        if (result.recordset.length === 0) {
            return res.status(400).json({ error: 'Código de seguridad inválido.' });
        }

        const user = result.recordset[0];
        if (user.token_expiracion && new Date(user.token_expiracion) < new Date()) {
            return res.status(400).json({ error: 'El código ha expirado.' });
        }

        const salt = await bcrypt.genSalt(10);
        const passHash = await bcrypt.hash(nueva_password, salt);

        await pool.request()
            .input('pwd', sql.VarChar(255), passHash)
            .input('uid', sql.Int, user.usuario_id)
            .query(`
                UPDATE dbo.Usuarios 
                SET password_hash = @pwd, PasswordHash = @pwd, 
                    token_recuperacion = NULL, token_expiracion = NULL,
                    intentos_fallidos = 0, bloqueado_hasta = NULL 
                WHERE usuario_id = @uid
            `);

        res.json({ ok: true, mensaje: 'Contraseña restablecida con éxito.' });
    } catch (err) {
        console.error('Error en restablecer-password:', err);
        res.status(500).json({ error: 'Error al restablecer contraseña: ' + err.message });
    }
});

// ==========================================
// 3. PERFIL DEL SOCIO Y LEALTAD
// ==========================================

// Consulta de Perfil
app.get('/api/usuarios/perfil/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await poolPromise;
        const result = await pool.request()
            .input('uid', sql.Int, id)
            .query(`
                SELECT usuario_id, tratamiento, nombres, apellidos, email, telefono, pais,
                       programa_lealtad, fiesta_rewards_id, nivel_socio, noches_acumuladas,
                       preferencia_cama, preferencia_piso, preferencias_adicionales,
                       ultimo_acceso, creado_en
                FROM dbo.Usuarios 
                WHERE usuario_id = @uid
            `);

        if (result.recordset.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        res.json(result.recordset[0]);
    } catch (err) {
        console.error('Error al obtener perfil:', err);
        res.status(500).json({ error: 'Error al consultar perfil del socio' });
    }
});

// Actualización Unificada de Perfil
app.put(['/api/usuarios/perfil/:id', '/api/usuarios/:id'], async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            tratamiento, nombres, apellidos, telefono, pais, 
            preferencia_cama, preferencia_piso, preferencias_adicionales,
            password 
        } = req.body;
        const pool = await poolPromise;

        const request = pool.request()
            .input('uid', sql.Int, id)
            .input('tratamiento', sql.VarChar(10), tratamiento || 'Sr.')
            .input('nombres', sql.VarChar(80), nombres ? String(nombres).trim() : '')
            .input('apellidos', sql.VarChar(80), apellidos ? String(apellidos).trim() : '')
            .input('telefono', sql.VarChar(20), telefono ? String(telefono).trim() : '')
            .input('pais', sql.VarChar(50), pais || 'México')
            .input('cama', sql.VarChar(50), preferencia_cama || 'King Size')
            .input('piso', sql.VarChar(50), preferencia_piso || 'Piso Alto - Vista al Mar')
            .input('adic', sql.VarChar(255), preferencias_adicionales ? String(preferencias_adicionales).trim() : null);

        let queryUpdate = `
            UPDATE dbo.Usuarios
            SET tratamiento = @tratamiento,
                nombres = @nombres,
                Nombre = @nombres,
                apellidos = @apellidos,
                ApellidoPaterno = @apellidos,
                telefono = @telefono,
                pais = @pais,
                preferencia_cama = @cama,
                preferencia_piso = @piso,
                preferencias_adicionales = @adic
        `;

        if (password && String(password).trim().length >= 8) {
            const salt = await bcrypt.genSalt(10);
            const passHash = await bcrypt.hash(String(password).trim(), salt);
            request.input('pwd', sql.VarChar(255), passHash);
            queryUpdate += `, password_hash = @pwd, PasswordHash = @pwd`;
        }

        queryUpdate += `
            OUTPUT 
                INSERTED.usuario_id, INSERTED.tratamiento, INSERTED.nombres, 
                INSERTED.apellidos, INSERTED.email, INSERTED.telefono, 
                INSERTED.pais, INSERTED.fiesta_rewards_id, INSERTED.nivel_socio,
                INSERTED.noches_acumuladas, INSERTED.preferencia_cama, 
                INSERTED.preferencia_piso, INSERTED.preferencias_adicionales
            WHERE usuario_id = @uid
        `;

        const result = await request.query(queryUpdate);
        if (!result.recordset.length) {
            return res.status(404).json({ error: 'Socio no encontrado para actualizar' });
        }

        res.json({
            ok: true,
            mensaje: 'Perfil de socio y preferencias actualizadas en SQL Server.',
            usuario: result.recordset[0]
        });
    } catch (err) {
        console.error('Error al actualizar perfil:', err);
        res.status(500).json({ error: 'Error al actualizar perfil: ' + err.message });
    }
});

// Fiesta Card Digital
app.get(['/api/tarjeta-fiesta/:id', '/api/usuarios/fiesta-card/:id', '/api/tarjetas-fiesta-card/usuario/:id'], async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await poolPromise;
        const result = await pool.request()
            .input('uid', sql.Int, id)
            .query("SELECT * FROM dbo.TarjetasFiestaCard WHERE usuario_id = @uid");

        if (result.recordset.length === 0) {
            return res.status(404).json({ error: 'Tarjeta Fiesta Card no encontrada' });
        }

        res.json({ ok: true, data: result.recordset[0], ...result.recordset[0] });
    } catch (err) {
        console.error('Error al obtener Fiesta Card:', err);
        res.status(500).json({ error: 'Error al consultar tarjeta de fidelización' });
    }
});

// ==========================================
// 4. BÚSQUEDA PÚBLICA DE RESERVACIONES (FOLIO + CORREO)
// ==========================================
app.all(['/api/reservaciones/buscar'], async (req, res) => {
    try {
        const folio = (req.query.folio || req.body.folio || '').trim();
        const correo = (req.query.email || req.query.email_o_apellido || req.body.email || req.body.email_o_apellido || '').trim();

        if (!folio) {
            return res.status(400).json({ error: 'El folio de confirmación es obligatorio.' });
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
                    u.telefono,
                    s.nombre AS nombre_suite,
                    s.categoria AS categoria_suite,
                    s.tipo_cama,
                    s.foto_principal
                FROM dbo.Reservaciones r
                LEFT JOIN dbo.Usuarios u ON r.usuario_id = u.usuario_id
                LEFT JOIN dbo.HabitacionesSuites s ON r.suite_id = s.suite_id
                WHERE (r.folio_confirmacion = @folio OR CAST(r.reservacion_id AS VARCHAR) = @folio)
                  AND (
                      @correo = '' 
                      OR u.email = @correo 
                      OR u.apellidos LIKE '%' + @correo + '%'
                  )
            `);

        if (!result.recordset || result.recordset.length === 0) {
            return res.status(404).json({ error: 'No se encontró ninguna reservación con los datos proporcionados.' });
        }

        const reserva = result.recordset[0];
        return res.json({
            ok: true,
            data: reserva,
            ...reserva
        });
    } catch (err) {
        console.error('Error al consultar reservación por folio:', err);
        return res.status(500).json({ error: 'Error interno en el servidor: ' + err.message });
    }
});

// ==========================================
// 5. RESERVACIONES: CREACIÓN Y GESTIÓN
// ==========================================

// Consulta general
app.get('/api/reservaciones', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT r.*, s.nombre AS suite_nombre, s.categoria AS suite_categoria, s.foto_principal AS suite_foto
            FROM dbo.Reservaciones r
            INNER JOIN dbo.HabitacionesSuites s ON r.suite_id = s.suite_id
            ORDER BY r.creado_en DESC
        `);
        res.json(result.recordset);
    } catch (err) {
        console.error('Error al consultar reservaciones:', err);
        res.status(500).json({ error: 'Error al consultar reservaciones' });
    }
});

// Historial por Usuario
app.get('/api/reservaciones/usuario/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await poolPromise;
        const result = await pool.request()
            .input('uid', sql.Int, id)
            .query(`
                SELECT r.*, 
                       s.nombre AS suite_nombre, 
                       s.nombre AS nombre_suite, 
                       s.categoria AS suite_categoria, 
                       s.foto_principal AS suite_foto
                FROM dbo.Reservaciones r
                INNER JOIN dbo.HabitacionesSuites s ON r.suite_id = s.suite_id
                WHERE r.usuario_id = @uid
                ORDER BY r.creado_en DESC
            `);

        res.json(result.recordset);
    } catch (err) {
        console.error('Error al consultar reservaciones:', err);
        res.status(500).json({ error: 'Error al consultar historial de reservaciones' });
    }
});

// Crear nueva reservación (POST)
app.post('/api/reservaciones', async (req, res) => {
    try {
        const {
            usuario_id, suite_id, fecha_llegada, fecha_salida, noches,
            adultos, ninos, peticiones, peticiones_especiales,
            subtotal, iva, ishe, saneamiento, saneamiento_ambiental,
            total_general, terminacion_tarjeta, metodo_pago_tipo, estatus_reservacion
        } = req.body;

        if (!usuario_id || !suite_id || !fecha_llegada || !fecha_salida || !total_general) {
            return res.status(400).json({ error: 'Faltan campos obligatorios para procesar la reservación.' });
        }

        const pool = await poolPromise;
        const folioConfirmacion = 'GFA-' + Math.floor(100000 + Math.random() * 900000);

        let estatusFinal = estatus_reservacion;
        if (!estatusFinal) {
            estatusFinal = (metodo_pago_tipo === 'qr_tiendas' || terminacion_tarjeta === 'QR')
                ? 'Pendiente de Pago'
                : 'Confirmada';
        }

        const sub = subtotal ? parseFloat(subtotal) : parseFloat(total_general) / 1.16;
        const impIva = iva ? parseFloat(iva) : sub * 0.16;
        const impIshe = ishe ? parseFloat(ishe) : sub * 0.05;
        const impSan = (saneamiento_ambiental || saneamiento) ? parseFloat(saneamiento_ambiental || saneamiento) : 75.00;
        const cardTerm = terminacion_tarjeta ? String(terminacion_tarjeta).slice(-4) : '4829';
        const notas = (peticiones_especiales || peticiones || '').trim() || null;

        const result = await pool.request()
            .input('uid', sql.Int, parseInt(usuario_id))
            .input('sid', sql.Int, parseInt(suite_id))
            .input('folio', sql.VarChar(50), folioConfirmacion)
            .input('llegada', sql.Date, fecha_llegada)
            .input('salida', sql.Date, fecha_salida)
            .input('noches', sql.Int, noches ? parseInt(noches) : 1)
            .input('adultos', sql.Int, adultos ? parseInt(adultos) : 2)
            .input('ninos', sql.Int, ninos ? parseInt(ninos) : 0)
            .input('peticiones', sql.VarChar(500), notas)
            .input('subtotal', sql.Decimal(12, 2), sub)
            .input('iva', sql.Decimal(12, 2), impIva)
            .input('ishe', sql.Decimal(12, 2), impIshe)
            .input('saneamiento', sql.Decimal(12, 2), impSan)
            .input('total', sql.Decimal(12, 2), parseFloat(total_general))
            .input('terminacion', sql.VarChar(4), cardTerm)
            .input('estatus', sql.VarChar(30), estatusFinal)
            .query(`
                INSERT INTO dbo.Reservaciones (
                    usuario_id, suite_id, folio_confirmacion, fecha_llegada, fecha_salida,
                    noches, adultos, ninos, peticiones_especiales, subtotal, iva, ishe,
                    saneamiento_ambiental, total_general, terminacion_tarjeta, estatus_reservacion, creado_en
                )
                OUTPUT INSERTED.*
                VALUES (
                    @uid, @sid, @folio, @llegada, @salida,
                    @noches, @adultos, @ninos, @peticiones, @subtotal, @iva, @ishe,
                    @saneamiento, @total, @terminacion, @estatus, GETDATE()
                )
            `);

        if (metodo_pago_tipo === 'fiesta_card' && estatusFinal === 'Confirmada') {
            await pool.request()
                .input('uid', sql.Int, parseInt(usuario_id))
                .input('monto', sql.Decimal(12, 2), parseFloat(total_general))
                .query(`
                    UPDATE dbo.TarjetasFiestaCard 
                    SET saldo_disponible = CASE WHEN saldo_disponible >= @monto THEN saldo_disponible - @monto ELSE 0 END,
                        saldo_utilizado = ISNULL(saldo_utilizado, 0) + @monto
                    WHERE usuario_id = @uid
                `);
        }

        const totalNoches = noches ? parseInt(noches) : 1;
        await pool.request()
            .input('uid', sql.Int, parseInt(usuario_id))
            .input('noches', sql.Int, totalNoches)
            .query("UPDATE dbo.Usuarios SET noches_acumuladas = ISNULL(noches_acumuladas, 0) + @noches WHERE usuario_id = @uid");

        res.status(201).json({
            ok: true,
            mensaje: 'Reservación procesada exitosamente.',
            reservacion: result.recordset[0]
        });

    } catch (err) {
        console.error('Error al procesar reservación:', err);
        res.status(500).json({ error: 'Error al registrar reservación: ' + err.message });
    }
});

// Cancelar Reservación
app.put('/api/reservaciones/:id/cancelar', async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await poolPromise;

        const resQuery = await pool.request()
            .input('rid', sql.Int, id)
            .query("SELECT * FROM dbo.Reservaciones WHERE reservacion_id = @rid");

        if (resQuery.recordset.length === 0) {
            return res.status(404).json({ error: 'Reservación no encontrada.' });
        }

        const reserva = resQuery.recordset[0];

        await pool.request()
            .input('rid', sql.Int, id)
            .query("UPDATE dbo.Reservaciones SET estatus_reservacion = 'CANCELADA' WHERE reservacion_id = @rid");

        if (reserva.total_general && reserva.usuario_id) {
            await pool.request()
                .input('uid', sql.Int, reserva.usuario_id)
                .input('monto', sql.Decimal(12, 2), parseFloat(reserva.total_general))
                .query(`
                    UPDATE dbo.TarjetasFiestaCard
                    SET saldo_disponible = saldo_disponible + @monto,
                        saldo_utilizado = CASE WHEN saldo_utilizado >= @monto THEN saldo_utilizado - @monto ELSE 0 END
                    WHERE usuario_id = @uid
                `);
        }

        res.json({ ok: true, mensaje: 'Reservación cancelada exitosamente y saldo reembolsado a tu cuenta.' });
    } catch (err) {
        console.error('Error al cancelar reservación:', err);
        res.status(500).json({ error: 'Error al cancelar la reservación: ' + err.message });
    }
});

// Purgar historial cancelado
app.delete('/api/reservaciones/canceladas/usuario/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await poolPromise;
        await pool.request()
            .input('uid', sql.Int, id)
            .query("DELETE FROM dbo.Reservaciones WHERE usuario_id = @uid AND estatus_reservacion = 'CANCELADA'");

        res.json({ ok: true, mensaje: 'Historial de cancelaciones purgado con éxito.' });
    } catch (err) {
        console.error('Error al purgar cancelaciones:', err);
        res.status(500).json({ error: 'Error al purgar cancelaciones: ' + err.message });
    }
});

// ==========================================
// 6. FACTURACIÓN FISCAL SAT CFDI 4.0
// ==========================================

// Consultar facturas por usuario
app.get('/api/facturas/usuario/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await poolPromise;
        const result = await pool.request()
            .input('uid', sql.Int, id)
            .query(`
                SELECT f.* 
                FROM dbo.FacturasCFDI f
                INNER JOIN dbo.Reservaciones r ON f.reservacion_id = r.reservacion_id
                WHERE r.usuario_id = @uid
                ORDER BY f.creado_en DESC
            `);

        res.json(result.recordset);
    } catch (err) {
        console.error('Error al consultar facturas:', err);
        res.status(500).json({ error: 'Error al consultar facturación CFDI' });
    }
});

// Emitir / Timbrar factura CFDI 4.0
app.post('/api/facturas', async (req, res) => {
    try {
        const pool = await poolPromise;
        const folio_reservacion = String(req.body.folio_confirmacion || req.body.folio_reservacion || req.body.folio || '').trim();
        const rfc_receptor = String(req.body.rfc_receptor || req.body.rfc || '').trim().toUpperCase();
        const razon_social = String(req.body.razon_social_receptor || req.body.razon_social || '').trim().toUpperCase();
        const codigo_postal = String(req.body.codigo_postal_fiscal || req.body.codigo_postal || '77500').trim();
        const regimen_fiscal = String(req.body.regimen_fiscal_receptor || req.body.regimen_fiscal || '601').trim();
        const uso_cfdi = String(req.body.uso_cfdi || 'G03').trim();

        if (!folio_reservacion || !rfc_receptor || !razon_social) {
            return res.status(400).json({ error: 'Folio, RFC y Razón Social son requeridos.' });
        }

        const resConsulta = await pool.request()
            .input('folio', sql.VarChar(50), folio_reservacion)
            .query("SELECT TOP 1 * FROM dbo.Reservaciones WHERE folio_confirmacion = @folio");

        if (!resConsulta.recordset.length) {
            return res.status(404).json({ error: 'No se encontró la reservación para facturar.' });
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
            .input('rfcReceptor', sql.VarChar(20), rfc_receptor)
            .input('razonReceptor', sql.NVarChar(150), razon_social)
            .input('cp', sql.VarChar(10), codigo_postal)
            .input('regimen', sql.VarChar(10), regimen_fiscal)
            .input('uso', sql.VarChar(10), uso_cfdi)
            .input('subtotal', sql.Decimal(18, 2), reserva.subtotal)
            .input('iva', sql.Decimal(18, 2), reserva.iva)
            .input('ish', sql.Decimal(18, 2), reserva.ishe)
            .input('saneamiento', sql.Decimal(18, 2), reserva.saneamiento_ambiental)
            .input('total', sql.Decimal(18, 2), reserva.total_general)
            .query(insertCFDI);

        res.status(201).json({
            ok: true,
            mensaje: 'Factura CFDI 4.0 timbrada con éxito.',
            factura: resultadoFactura.recordset[0]
        });
    } catch (err) {
        console.error('Error al timbrar factura:', err);
        res.status(500).json({ error: 'Error al generar factura: ' + err.message });
    }
});

// Cancelar / Eliminar Factura por Folio
app.delete('/api/facturas/:folio', async (req, res) => {
    try {
        const { folio } = req.params;
        const pool = await poolPromise;
        const resultado = await pool.request()
            .input('folio', sql.VarChar(50), folio.trim())
            .query("DELETE FROM dbo.FacturasCFDI WHERE folio_reservacion = @folio; SELECT @@ROWCOUNT AS eliminadas;");

        const filasEliminadas = resultado.recordset[0]?.eliminadas || 0;
        if (filasEliminadas === 0) {
            return res.status(404).json({ error: 'No se encontró la factura a cancelar.' });
        }

        res.json({ ok: true, mensaje: `Factura del folio ${folio} cancelada exitosamente.` });
    } catch (err) {
        console.error('Error al cancelar factura:', err);
        res.status(500).json({ error: 'Error interno: ' + err.message });
    }
});

// ==========================================
// 7. BILLETERA BANCARIA & TICKETS CONCIERGE
// ==========================================

// Billetera
app.get(['/api/billetera/usuario/:id', '/api/billetera/:id'], async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await poolPromise;

        const tarjetas = await pool.request()
            .input('uid', sql.Int, id)
            .query("SELECT * FROM dbo.TarjetasBancariasUsuario WHERE usuario_id = @uid ORDER BY es_preferida DESC, creado_en DESC");

        const fCard = await pool.request()
            .input('uid', sql.Int, id)
            .query("SELECT * FROM dbo.TarjetasFiestaCard WHERE usuario_id = @uid");

        res.json({
            ok: true,
            fiesta_card: fCard.recordset[0] || null,
            tarjetas_bancarias: tarjetas.recordset,
            ...tarjetas.recordset
        });
    } catch (err) {
        console.error('Error al consultar billetera:', err);
        res.status(500).json({ error: 'Error al consultar billetera bancaria' });
    }
});

app.post('/api/billetera', async (req, res) => {
    try {
        const { usuario_id, alias_tarjeta, banco_emisor, marca_tarjeta, tipo_cuenta, numero_enmascarado, titular_nombre, mes_expiracion, anio_expiracion, es_preferida } = req.body;
        const pool = await poolPromise;

        const result = await pool.request()
            .input('uid', sql.Int, usuario_id)
            .input('alias', sql.VarChar(50), alias_tarjeta || 'Tarjeta Personal')
            .input('banco', sql.VarChar(50), banco_emisor || 'Banco Emisor')
            .input('marca', sql.VarChar(20), marca_tarjeta || 'Visa')
            .input('tipo', sql.VarChar(20), tipo_cuenta || 'Crédito')
            .input('num', sql.VarChar(25), numero_enmascarado)
            .input('titular', sql.NVarChar(150), titular_nombre)
            .input('mes', sql.Int, mes_expiracion)
            .input('anio', sql.Int, anio_expiracion)
            .input('saldo', sql.Decimal(12, 2), 75000.00)
            .input('pref', sql.Bit, es_preferida ? 1 : 0)
            .query(`
                INSERT INTO dbo.TarjetasBancariasUsuario (
                    usuario_id, alias_tarjeta, banco_emisor, marca_tarjeta, tipo_cuenta,
                    numero_enmascarado, titular_nombre, mes_expiracion, anio_expiracion,
                    saldo_disponible_simulado, es_preferida, estatus, creado_en
                )
                OUTPUT INSERTED.*
                VALUES (
                    @uid, @alias, @banco, @marca, @tipo,
                    @num, @titular, @mes, @anio,
                    @saldo, @pref, 'Activa', GETDATE()
                )
            `);

        res.status(201).json({ ok: true, mensaje: 'Tarjeta guardada en bóveda con éxito.', tarjeta: result.recordset[0] });
    } catch (err) {
        console.error('Error al agregar tarjeta:', err);
        res.status(500).json({ error: 'Error al agregar tarjeta: ' + err.message });
    }
});

app.delete('/api/billetera/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await poolPromise;
        await pool.request()
            .input('tid', sql.Int, id)
            .query("DELETE FROM dbo.TarjetasBancariasUsuario WHERE tarjeta_bancaria_id = @tid");

        res.json({ ok: true, mensaje: 'Tarjeta eliminada exitosamente.' });
    } catch (err) {
        console.error('Error al eliminar tarjeta:', err);
        res.status(500).json({ error: 'Error al eliminar tarjeta: ' + err.message });
    }
});

// Tickets Concierge / Contacto
const handlerGetTickets = async (req, res) => {
    try {
        const id = req.params.id || req.params.usuario_id;
        const pool = await poolPromise;
        const result = await pool.request()
            .input('uid', sql.Int, id)
            .query("SELECT * FROM dbo.TicketsContacto WHERE usuario_id = @uid ORDER BY creado_en DESC");

        res.json({ ok: true, data: result.recordset, tickets: result.recordset, ...result.recordset });
    } catch (err) {
        console.error('Error al consultar tickets:', err);
        res.status(500).json({ ok: false, error: 'Error al consultar tickets' });
    }
};

app.get(['/api/tickets/usuario/:id', '/api/contacto/usuario/:usuario_id', '/api/contacto/usuario/:id'], handlerGetTickets);

const handlerPostTickets = async (req, res) => {
    try {
        const { usuario_id, hotel_destino, categoria, tipo_solicitud, clave_reservacion, nombres, apellidos, email, telefono, descripcion } = req.body;
        const pool = await poolPromise;

        const result = await pool.request()
            .input('uid', sql.Int, usuario_id || null)
            .input('hotel', sql.VarChar(150), hotel_destino || 'Grand Fiesta Americana Riviera Cancún')
            .input('cat', sql.VarChar(100), categoria || 'Atención a Socios')
            .input('tipo', sql.VarChar(100), tipo_solicitud || 'Consulta General')
            .input('clave', sql.VarChar(50), clave_reservacion || null)
            .input('nombres', sql.VarChar(100), nombres || '')
            .input('apellidos', sql.VarChar(100), apellidos || '')
            .input('email', sql.VarChar(150), email || '')
            .input('tel', sql.VarChar(50), telefono || '')
            .input('desc', sql.VarChar(-1), descripcion || '')
            .query(`
                INSERT INTO dbo.TicketsContacto (
                    usuario_id, hotel_destino, categoria, tipo_solicitud, clave_reservacion,
                    nombres, apellidos, email, telefono, descripcion, estatus, creado_en
                )
                OUTPUT INSERTED.*
                VALUES (
                    @uid, @hotel, @cat, @tipo, @clave,
                    @nombres, @apellidos, @email, @tel, @desc, 'Abierto', GETDATE()
                )
            `);

        res.status(201).json({ ok: true, mensaje: 'Ticket registrado con éxito.', ticket: result.recordset[0], data: result.recordset[0] });
    } catch (err) {
        console.error('Error al registrar ticket:', err);
        res.status(500).json({ ok: false, error: 'Error al registrar ticket: ' + err.message });
    }
};

app.post(['/api/tickets', '/api/contacto', '/api/contacto/tickets'], handlerPostTickets);

// ==========================================
// INICIALIZACIÓN
// ==========================================
app.listen(PORT, () => {
    console.log(`Servidor seguro corriendo en http://localhost:${PORT}`);
});