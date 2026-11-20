import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const jwt = require('./backend/node_modules/jsonwebtoken');
const app = require('./backend/server.js');
const { poolPromise, sql } = require('./backend/db.js');

const JWT_SECRET = process.env.JWT_SECRET || 'gfa_secret_key_ultra_secure_2026';

let server;
let baseUrl;
let usuarioDemoId = null;
let tokenDemo = null;
const resultados = [];

async function ejecutarCaso(nombre, fn) {
  const inicio = performance.now();
  try {
    await fn();
    const ms = (performance.now() - inicio).toFixed(1);
    resultados.push({ caso: nombre, estado: 'APROBADO', tiempo: `${ms} ms` });
    console.log(`  [PASS] ${nombre} (${ms} ms)`);
  } catch (err) {
    const ms = (performance.now() - inicio).toFixed(1);
    resultados.push({ caso: nombre, estado: `FALLÓ: ${err.message}`, tiempo: `${ms} ms` });
    console.error(`  [FAIL] ${nombre} -> ${err.message}`);
  }
}

async function iniciarAuditoria() {
  console.log('\n====================================================================');
  console.log('  AUDITORÍA INTEGRAL DEL SISTEMA — GRAND FIESTA AMERICANA RIVIERA');
  console.log('====================================================================\n');

  await poolPromise;
  await new Promise((resolve) => {
    server = app.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      baseUrl = `http://127.0.0.1:${port}`;
      resolve();
    });
  });

  // 1. Disponibilidad de catálogo y conexión SQL Server
  await ejecutarCaso('01. Conexión SQL Server y consulta de Suites (/api/suites)', async () => {
    const res = await fetch(`${baseUrl}/api/suites`);
    assert.equal(res.status, 200);
    const suites = await res.json();
    assert.ok(Array.isArray(suites) && suites.length >= 6, 'Debe devolver al menos 6 suites físicas');
  });

  // 2. Política estricta de contraseñas (rechazo de claves débiles)
  await ejecutarCaso('02. Blindaje Anti-Hacking: Bloqueo de contraseñas débiles (HTTP 400)', async () => {
    const res = await fetch(`${baseUrl}/api/usuarios/registro`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tratamiento: 'Sr.',
        nombres: 'Debil',
        apellidos: 'Test',
        email: `debil.${Date.now()}@gfa.mx`,
        telefono: '5500000000',
        pais: 'México',
        password: 'password123'
      })
    });
    assert.equal(res.status, 400);
  });

  // 3. Sanitización Anti-XSS en registro y emisión de JWT
  await ejecutarCaso('03. Sanitización Anti-XSS + Registro Socio + Emisión JWT (HTTP 201)', async () => {
    const stamp = Date.now();
    const res = await fetch(`${baseUrl}/api/usuarios/registro`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tratamiento: 'Lic.',
        nombres: '<script>alert("xss")</script>Evaluador',
        apellidos: 'Coloquio Auditor',
        email: `auditor.${stamp}@coloquio-tes.mx`,
        telefono: '5512345678',
        pais: 'México',
        password: 'Auditoria2026#'
      })
    });
    assert.equal(res.status, 201);
    const data = await res.json();
    assert.ok(data.token, 'Debe emitir un JWT firmado');
    assert.equal(data.usuario.nombres, 'Evaluador', 'Debe purgar etiquetas <script> del nombre');
    usuarioDemoId = data.usuario.usuario_id;
    tokenDemo = data.token;
  });

  // 4. Defensa SQL Injection en Login
  await ejecutarCaso('04. Defensa Anti-SQLi en Login con payload OR 1=1', async () => {
    const res = await fetch(`${baseUrl}/api/usuarios/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identificador: "' OR 1=1 --", password: "' OR '1'='1" })
    });
    assert.ok([401, 404].includes(res.status));
  });

  // 5. Rechazo de peticiones sin Token JWT
  await ejecutarCaso('05. Control de Acceso: Bloqueo sin Token Bearer (HTTP 401)', async () => {
    const res = await fetch(`${baseUrl}/api/billetera/${usuarioDemoId}`);
    assert.equal(res.status, 401);
  });

  // 6. Rechazo de Token JWT alterado / firma falsa
  await ejecutarCaso('06. Integridad Criptográfica: Rechazo de JWT adulterado (HTTP 401)', async () => {
    const tokenFalso = jwt.sign({ usuario_id: usuarioDemoId }, 'clave_atacante_externo');
    const res = await fetch(`${baseUrl}/api/billetera/${usuarioDemoId}`, {
      headers: { Authorization: `Bearer ${tokenFalso}` }
    });
    assert.equal(res.status, 401);
  });

  // 7. Regla de negocio Zod v4: Adults-Only (+18)
  await ejecutarCaso('07. Regla Comercial Zod v4: Bloqueo de menores en Suite Adults-Only +18 (HTTP 400)', async () => {
    const res = await fetch(`${baseUrl}/api/reservaciones`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenDemo}` },
      body: JSON.stringify({
        usuario_id: usuarioDemoId,
        suite_id: 3,
        fecha_llegada: '2026-12-20',
        fecha_salida: '2026-12-22',
        noches: 2,
        adultos: 2,
        ninos: 1,
        subtotal: 15000,
        iva: 2400,
        ishe: 750,
        saneamiento_ambiental: 66,
        total_general: 18216,
        metodo_pago_tipo: 'tarjeta_credito'
      })
    });
    assert.equal(res.status, 400);
  });

  // 8. Manipulación de precios negativos en Checkout
  await ejecutarCaso('08. Integridad Financiera: Bloqueo de tarifas manipuladas/negativas (HTTP 400)', async () => {
    const res = await fetch(`${baseUrl}/api/reservaciones`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenDemo}` },
      body: JSON.stringify({
        usuario_id: usuarioDemoId,
        suite_id: 2,
        fecha_llegada: '2026-11-10',
        fecha_salida: '2026-11-12',
        noches: 2,
        adultos: 2,
        ninos: 0,
        subtotal: -9000,
        iva: 0,
        ishe: 0,
        saneamiento_ambiental: 0,
        total_general: -9000,
        metodo_pago_tipo: 'tarjeta_credito'
      })
    });
    assert.equal(res.status, 400);
  });

  // 9. Prueba de Estrés / Concurrencia simultánea (5 reservas al mismo ms)
  await ejecutarCaso('09. Concurrencia ACID (5 reservas simultáneas -> 1x201 y 4x409 Anti-Overbooking)', async () => {
    const payload = JSON.stringify({
      usuario_id: usuarioDemoId,
      suite_id: 5,
      fecha_llegada: '2026-12-26',
      fecha_salida: '2026-12-29',
      noches: 3,
      adultos: 2,
      ninos: 0,
      subtotal: 21000,
      iva: 3360,
      ishe: 1050,
      saneamiento_ambiental: 99,
      total_general: 25509,
      metodo_pago_tipo: 'tarjeta_credito',
      terminacion_tarjeta: '4829'
    });

    const respuestas = await Promise.all(
      Array.from({ length: 5 }, () =>
        fetch(`${baseUrl}/api/reservaciones`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tokenDemo}` },
          body: payload
        })
      )
    );

    const codigos = respuestas.map((r) => r.status);
    const exitosas = codigos.filter((c) => c === 201 || c === 200).length;
    const bloqueadas = codigos.filter((c) => c === 409).length;

    assert.equal(exitosas, 1, `Se esperaba exactamente 1 reserva aprobada, hubo ${exitosas}`);
    assert.equal(bloqueadas, 4, `Se esperaban 4 rechazos 409 Conflict, hubo ${bloqueadas}`);
  });

  // 10. Limpieza e integridad de base de datos tras pruebas
  // 10. Limpieza e integridad de base de datos tras pruebas
  await ejecutarCaso('10. Limpieza transaccional de registros de auditoría en SQL Server', async () => {
    const pool = await poolPromise;
    await pool.request().query(`
      DELETE FROM Reservaciones WHERE usuario_id IN (SELECT usuario_id FROM Usuarios WHERE email LIKE 'auditor.%@coloquio-tes.mx');
      DELETE FROM TarjetasFiestaCard WHERE usuario_id IN (SELECT usuario_id FROM Usuarios WHERE email LIKE 'auditor.%@coloquio-tes.mx');
      DELETE FROM Usuarios WHERE email LIKE 'auditor.%@coloquio-tes.mx';
    `);
    const check = await pool.request()
      .query("SELECT COUNT(*) AS total FROM Usuarios WHERE email LIKE 'auditor.%@coloquio-tes.mx'");
    assert.equal(check.recordset[0].total, 0);
  });
  // 3. Sanitización Anti-XSS en registro y emisión de JWT
  await ejecutarCaso('03. Sanitización Anti-XSS + Registro Socio + Emisión JWT (HTTP 201)', async () => {
    const stamp = Date.now();
    const res = await fetch(`${baseUrl}/api/usuarios/registro`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tratamiento: 'Lic.',
        nombres: '<script>alert("xss")</script>Evaluador',
        apellidos: 'Coloquio Auditor',
        email: `auditor.${stamp}@coloquio-tes.mx`,
        telefono: '5512345678',
        pais: 'México',
        password: 'Auditoria2026#'
      })
    });
    assert.equal(res.status, 201);
    const data = await res.json();
    usuarioDemoId = data.usuario.usuario_id;
    tokenDemo = data.token;
    assert.ok(tokenDemo, 'Debe emitir un JWT firmado');
    assert.equal(data.usuario.nombres, 'Evaluador', 'Debe purgar bloques <script> maliciosos del nombre');
  });

  console.log('\n====================================================================');
  console.table(resultados);

  const fallidos = resultados.filter((r) => r.estado !== 'APROBADO').length;
  console.log(
    fallidos === 0
      ? 'RESULTADO FINAL: 10/10 CONTROLES APROBADOS — SISTEMA BLINDADO Y OPERATIVO\n'
      : `RESULTADO FINAL: ${fallidos} CONTROL(ES) CON OBSERVACIONES\n`
  );

  if (server) await new Promise((resolve) => server.close(resolve));
  const pool = await poolPromise;
  await pool.close();
  process.exit(fallidos === 0 ? 0 : 1);
}

iniciarAuditoria();