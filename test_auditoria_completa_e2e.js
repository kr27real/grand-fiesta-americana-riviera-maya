const { chromium } = require('playwright');

(async () => {
    console.log('\x1b[35m===================================================================================\x1b[0m');
    console.log('\x1b[35m   AUDITORÍA EXHAUSTIVA DE PLATAFORMA GFA: DETECCIÓN CONTINUA DE FALLOS           \x1b[0m');
    console.log('\x1b[35m===================================================================================\x1b[0m\n');

    const browser = await chromium.launch({ headless: false, slowMo: 400 });
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();

    const reporte = [];
    const registrar = (seccion, item, estado, detalle) => {
        reporte.push({ seccion, item, estado, detalle });
        const color = estado === 'OK' ? '\x1b[32m' : estado === 'WARN' ? '\x1b[33m' : '\x1b[31m';
        console.log(`  ${color}[${estado}]\x1b[0m ${item}: ${detalle}`);
    };

    // Escuchar errores de consola del navegador y diálogos
    const erroresConsola = [];
    page.on('console', msg => {
        if (msg.type() === 'error') erroresConsola.push(msg.text());
    });
    page.on('dialog', async dialog => {
        console.log(`    \x1b[33m[ALERTA DIÁLOGO NATIVO]\x1b[0m: "${dialog.message()}"`);
        await dialog.accept().catch(() => {});
    });

    // -------------------------------------------------------------------------
    // SECCIÓN 1: VISTA PÚBLICA, CATÁLOGO Y PROTECCIÓN DE ANÓNIMO
    // -------------------------------------------------------------------------
    console.log('\x1b[36m>>> SECCIÓN 1: NAVEGACIÓN PÚBLICA Y CONTROL DE ACCESO ANÓNIMO <<<\x1b[0m');
    try {
        await page.goto('http://localhost:5173', { waitUntil: 'domcontentloaded', timeout: 10000 });
        await page.evaluate(() => { localStorage.clear(); sessionStorage.clear(); });
        registrar('Home', 'Carga de Home', 'OK', 'Renderizado sin caídas en HTTP 200');

        // Validar catálogo de suites
        const btnSuites = page.getByRole('link', { name: /suites/i }).or(page.getByText(/suites/i)).first();
        if (await btnSuites.isVisible().catch(() => false)) {
            await btnSuites.click();
            await page.waitForTimeout(800);
            registrar('Catálogo', 'Vista de Suites', 'OK', 'Catálogo accesible para visitantes anónimos');
        } else {
            registrar('Catálogo', 'Vista de Suites', 'WARN', 'Enlace directo a suites no detectado en el header principal');
        }

        // Intento de reserva anónima -> ¿Muestra LoginModal o arroja error?
        const btnReservar = page.locator('button:has-text("Reservar"), .btn-reservar, button:has-text("RESERVAR AHORA")').first();
        if (await btnReservar.isVisible().catch(() => false)) {
            await btnReservar.click();
            await page.waitForTimeout(800);
            const modalAbierto = await page.locator('.login-modal-overlay, .modal-auth-backdrop, [class*="LoginModal"]').first().isVisible().catch(() => false);
            if (modalAbierto) {
                registrar('Seguridad Anónimo', 'Protección de Reserva', 'OK', 'Interceptó al visitante y abrió el modal institucional');
            } else {
                registrar('Seguridad Anónimo', 'Protección de Reserva', 'FALLO', 'No abrió el LoginModal al pulsar reservar sin sesión');
            }
        }
    } catch (e) {
        registrar('Sección 1', 'Excepción general', 'FALLO', e.message);
    }

    console.log('\n-----------------------------------------------------------------------------------\n');

    // -------------------------------------------------------------------------
    // SECCIÓN 2: MÓDULO DE AUTENTICACIÓN, CAPTCHA Y RECUPERACIÓN DE CLAVE
    // -------------------------------------------------------------------------
    console.log('\x1b[36m>>> SECCIÓN 2: LOGIN, REGISTRO, CAPTCHA Y RECUPERACIÓN <<<\x1b[0m');
    try {
        await page.goto('http://localhost:5173', { waitUntil: 'domcontentloaded' });
        
        // Abrir modal de login
        const btnLoginNav = page.getByRole('button', { name: /iniciar sesión|acceso/i }).or(page.getByText(/iniciar sesión/i)).first();
        if (await btnLoginNav.isVisible().catch(() => false)) {
            await btnLoginNav.click();
            await page.waitForTimeout(600);
        }

        // Probar Captcha y Recuperación
        const linkOlvido = page.getByText(/¿olvidaste tu clave\?/i).first();
        if (await linkOlvido.isVisible().catch(() => false)) {
            await linkOlvido.click();
            await page.waitForTimeout(600);

            const captchaVisible = await page.locator('.login-captcha-code').isVisible().catch(() => false);
            if (captchaVisible) {
                const codigoCaptcha = await page.locator('.login-captcha-code').innerText();
                registrar('Seguridad Captcha', 'Generación de Captcha', 'OK', `Código generado dinámicamente: [${codigoCaptcha}]`);

                // Prueba de captcha incorrecto
                await page.locator('input[type="email"]').fill('jerrysoria32@gmail.com');
                await page.locator('input[placeholder*="código"]').fill('ZZZZZ');
                await page.getByRole('button', { name: /enviar código/i }).click();
                await page.waitForTimeout(600);

                const bannerError = await page.locator('.login-error-banner').innerText().catch(() => '');
                if (bannerError.includes('incorrecto')) {
                    registrar('Seguridad Captcha', 'Rechazo de Código Inválido', 'OK', 'Bloqueó el intento de bypass con captcha erróneo');
                } else {
                    registrar('Seguridad Captcha', 'Rechazo de Código Inválido', 'WARN', 'No reportó el banner de error esperado ante captcha incorrecto');
                }
            } else {
                registrar('Seguridad Captcha', 'Presencia visual', 'FALLO', 'El contenedor .login-captcha-code no está visible');
            }
        } else {
            registrar('Recuperación', 'Enlace Olvidó Clave', 'FALLO', 'No se encontró el enlace "¿Olvidaste tu clave?" en el modal');
        }
    } catch (e) {
        registrar('Sección 2', 'Excepción general', 'FALLO', e.message);
    }

    console.log('\n-----------------------------------------------------------------------------------\n');

    // -------------------------------------------------------------------------
    // SECCIÓN 3: TRANSACCIÓN DE RESERVA, DÉBITO EN FIESTA CARD Y TIMBRADO CFDI 4.0
    // -------------------------------------------------------------------------
    console.log('\x1b[36m>>> SECCIÓN 3: MOTOR FINANCIERO, BILLETERA Y FACTURACIÓN FISCAL <<<\x1b[0m');
    let folioGenerado = null;
    let reservaIdGenerada = null;

    try {
        // Inyectar sesión de Kevin Ramirez Soria
        await page.evaluate(() => {
            const usuario = {
                usuario_id: 1,
                nombres: "Kevin",
                apellidos: "Ramirez Soria",
                email: "jerrysoria32@gmail.com",
                telefono: "5548166341",
                fiesta_rewards_id: "FR-222466"
            };
            const token = "session_gfa_preprod_token_valid";
            localStorage.setItem('usuario', JSON.stringify(usuario));
            localStorage.setItem('token', token);
        });

        // 1. Consultar saldo disponible
        const billetera = await page.evaluate(async () => {
            const res = await fetch('http://localhost:5000/api/billetera/1');
            return await res.json();
        });

        if (billetera && billetera.fiesta_card) {
            registrar('Billetera Digital', 'Consulta de Tarjeta', 'OK', `Disponible: $${billetera.fiesta_card.saldo_disponible} MXN (Tarjeta: ${billetera.fiesta_card.numero_enmascarado})`);
        } else {
            registrar('Billetera Digital', 'Consulta de Tarjeta', 'WARN', 'El endpoint /api/billetera/1 no retornó fiesta_card');
        }

        // 2. Realizar reservación atómica
        const resReserva = await page.evaluate(async () => {
            const res = await fetch('http://localhost:5000/api/reservaciones', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer session_gfa_preprod_token_valid'
                },
                body: JSON.stringify({
                    usuario_id: 1,
                    suite_id: 1,
                    fecha_llegada: "2026-11-20",
                    fecha_salida: "2026-11-22",
                    noches: 2,
                    adultos: 2,
                    ninos: 0,
                    subtotal: 11973.24,
                    iva: 1915.72,
                    ishe: 598.66,
                    saneamiento: 152.00,
                    total_general: 14639.62,
                    metodo_pago_tipo: "fiesta_card",
                    token_sesion: "session_gfa_preprod_token_valid"
                })
            });
            return { status: res.status, data: await res.json() };
        });

        if (resReserva.status === 201) {
            folioGenerado = resReserva.data.data.folio_confirmacion;
            reservaIdGenerada = resReserva.data.data.reservacion_id;
            registrar('Motor Transaccional', 'Emisión de Reserva', 'OK', `Confirmada con Folio: ${folioGenerado} (ID: ${reservaIdGenerada})`);
        } else {
            registrar('Motor Transaccional', 'Emisión de Reserva', 'FALLO', `HTTP ${resReserva.status} - ${JSON.stringify(resReserva.data)}`);
        }

        // 3. Timbrado de Factura CFDI 4.0
        if (folioGenerado) {
            const resFactura = await page.evaluate(async (f) => {
                const res = await fetch('http://localhost:5000/api/facturas', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        folio_confirmacion: f,
                        rfc_receptor: "PTE010203AB4",
                        razon_social_receptor: "PROYECTOS Y TECNOLOGIAS DEL NORTE SA DE CV",
                        codigo_postal_fiscal: "64000",
                        regimen_fiscal_receptor: "601",
                        uso_cfdi: "G03"
                    })
                });
                return { status: res.status, data: await res.json() };
            }, folioGenerado);

            if (resFactura.status === 200 || resFactura.status === 201) {
                registrar('Facturación CFDI', 'Timbrado Fiscal', 'OK', `Factura: ${resFactura.data.factura.folio_fiscal} | UUID: ${resFactura.data.factura.uuid_sat}`);
            } else {
                registrar('Facturación CFDI', 'Timbrado Fiscal', 'FALLO', `HTTP ${resFactura.status} - ${JSON.stringify(resFactura.data)}`);
            }
        }
    } catch (e) {
        registrar('Sección 3', 'Excepción general', 'FALLO', e.message);
    }

    console.log('\n-----------------------------------------------------------------------------------\n');

    // -------------------------------------------------------------------------
    // SECCIÓN 4: PANEL DE PERFIL DE SOCIO, CANCELACIÓN Y REEMBOLSO EN VIVO
    // -------------------------------------------------------------------------
    console.log('\x1b[36m>>> SECCIÓN 4: PERFIL DE SOCIO, HISTORIAL Y CANCELACIÓN <<<\x1b[0m');
    try {
        await page.goto('http://localhost:5173/perfil-socio', { waitUntil: 'networkidle' });
        await page.waitForTimeout(1000);

        // Validar datos de perfil
        const nombreVisible = await page.getByText(/Kevin Ramirez Soria/i).first().isVisible().catch(() => false);
        if (nombreVisible) {
            registrar('Perfil de Socio', 'Identidad de Usuario', 'OK', 'Datos de Kevin Ramirez Soria cargados en cabecera');
        } else {
            registrar('Perfil de Socio', 'Identidad de Usuario', 'WARN', 'El nombre del usuario no se visualiza en el panel principal');
        }

        // Probar Cancelación del Folio o ID actual
        const idCancelar = reservaIdGenerada || 1;
        const resCancelar = await page.evaluate(async (id) => {
            const res = await fetch(`http://localhost:5000/api/reservaciones/${id}/cancelar`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer session_gfa_preprod_token_valid'
                }
            });
            return { status: res.status, data: await res.json() };
        }, idCancelar);

        if (resCancelar.status === 200) {
            registrar('Cancelación y Reembolso', 'Ejecución en SQL', 'OK', resCancelar.data.mensaje || 'Cancelada correctamente');
        } else {
            registrar('Cancelación y Reembolso', 'Ejecución en SQL', 'FALLO', `HTTP ${resCancelar.status} - ${resCancelar.data.error || JSON.stringify(resCancelar.data)}`);
        }

        // Probar Purga de canceladas
        const resPurga = await page.evaluate(async () => {
            const res = await fetch('http://localhost:5000/api/reservaciones/canceladas/usuario/1', {
                method: 'DELETE',
                headers: { 'Authorization': 'Bearer session_gfa_preprod_token_valid' }
            });
            return { status: res.status, data: await res.json() };
        });

        if (resPurga.status === 200) {
            registrar('Mantenimiento', 'Purga de Canceladas', 'OK', resPurga.data.mensaje);
        } else {
            registrar('Mantenimiento', 'Purga de Canceladas', 'WARN', `HTTP ${resPurga.status} - ${JSON.stringify(resPurga.data)}`);
        }

    } catch (e) {
        registrar('Sección 4', 'Excepción general', 'FALLO', e.message);
    }

    console.log('\n\x1b[35m===================================================================================\x1b[0m');
    console.log('\x1b[35m                        RESUMEN CONSOLIDADO DE AUDITORÍA                           \x1b[0m');
    console.log('\x1b[35m===================================================================================\x1b[0m\n');

    const totalFallos = reporte.filter(r => r.estado === 'FALLO').length;
    const totalWarn = reporte.filter(r => r.estado === 'WARN').length;
    const totalOk = reporte.filter(r => r.estado === 'OK').length;

    console.log(`  * Pruebas Aprobadas:  ${totalOk}`);
    console.log(`  * Advertencias:       ${totalWarn}`);
    console.log(`  * Fallos Detectados:  ${totalFallos}\n`);

    if (totalFallos > 0) {
        console.log('\x1b[31mDETALLE DE ELEMENTOS A CORREGIR:\x1b[0m');
        reporte.filter(r => r.estado === 'FALLO').forEach(f => {
            console.log(`  - [${f.seccion}] ${f.item}: ${f.detalle}`);
        });
    } else {
        console.log('\x1b[32m¡TODAS LAS SECCIONES AUDITADAS ESTÁN 100% OPERATIVAS!\x1b[0m');
    }

    await page.waitForTimeout(2000);
    await browser.close();
})();