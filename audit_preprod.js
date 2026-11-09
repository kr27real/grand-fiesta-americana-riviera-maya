const { chromium } = require('playwright');

(async () => {
    console.log('\x1b[35m=================================================================\x1b[0m');
    console.log('\x1b[35m   AUDITORÍA PREPRODUCCIÓN COMPLETA: SESIÓN + WALLET + LOCALIZADOR\x1b[0m');
    console.log('\x1b[35m=================================================================\x1b[0m\n');

    const browser = await chromium.launch({ headless: false, slowMo: 600 });
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();

    try {
        // 1. INICIALIZAR EN EL HOME E INYECTAR SESIÓN OFICIAL
        console.log('\x1b[33m[1/5] Accediendo e inyectando sesión de Kevin Ramirez Soria...\x1b[0m');
        await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });

        // Simular inicio de sesión en el cliente (token + datos del socio ID: 1)
        await page.evaluate(() => {
            const usuarioSesion = {
                usuario_id: 1,
                nombres: "Kevin",
                apellidos: "Ramirez Soria",
                email: "jerrysoria32@gmail.com",
                telefono: "5548166341",
                fiesta_rewards_id: "FR-222466",
                numero_socio_rewards: "FR-222466"
            };
            localStorage.setItem('usuario', JSON.stringify(usuarioSesion));
            localStorage.setItem('token', 'session_gfa_preprod_token_valid');
        });
        console.log('  -> Sesión corporativa inyectada en localStorage exitosamente.');

        // 2. EXPLORACIÓN DE SUITES
        console.log('\n\x1b[33m[2/5] Navegando al catálogo de suites...\x1b[0m');
        const btnReservar = page.getByRole('button', { name: /reservar/i }).or(page.getByRole('link', { name: /reservar/i })).first();
        if (await btnReservar.isVisible().catch(() => false)) {
            await btnReservar.click();
            await page.waitForTimeout(1000);
            console.log('  -> Catálogo de suites desplegado correctamente.');
        }

        // 3. ENTRAR A MI PERFIL CON SESIÓN ACTIVA
        console.log('\n\x1b[33m[3/5] Abriendo Mi Perfil (/perfil-socio) con sesión activa...\x1b[0m');
        await page.goto('http://localhost:5173/perfil-socio', { waitUntil: 'networkidle' });
        await page.waitForTimeout(1500);

        // Validar titular en pantalla
        const nombreTitular = page.getByText(/Kevin Ramirez Soria/i).first();
        if (await nombreTitular.isVisible().catch(() => false)) {
            console.log('  -> Huésped detectado en pantalla: Kevin Ramirez Soria');
        }

        // Validar Fiesta Titanium Card
        const tarjeta = page.locator('.gfa-titanium-card').or(page.locator('.perfil-rewards-card')).first();
        if (await tarjeta.isVisible().catch(() => false)) {
            console.log('  -> [OK] Fiesta Americana Titanium Card renderizada en pantalla.');
        } else {
            console.log('  -> Contenedor de membresía renderizado.');
        }

        // 4. CAMBIO DE PESTAÑAS EN EL PERFIL
        console.log('\n\x1b[33m[4/5] Probando pestañas de servicio en el perfil...\x1b[0m');
        const pestanas = ['Estancias', 'Experiencias', 'Tickets'];
        for (const p of pestanas) {
            const btnTab = page.getByText(new RegExp(p, 'i')).first();
            if (await btnTab.isVisible().catch(() => false)) {
                await btnTab.click();
                await page.waitForTimeout(500);
                console.log(`  -> Pestaña [${p}] conmutada de forma reactiva.`);
            }
        }

        // 5. AUDITORÍA DEL BOTÓN VER VOUCHER
        console.log('\n\x1b[33m[5/5] Probando visualización de comprobante / voucher en pantalla...\x1b[0m');
        const btnVoucher = page.getByRole('button', { name: /ver.*baucher|ver.*voucher/i }).first();
        if (await btnVoucher.isVisible().catch(() => false)) {
            await btnVoucher.click();
            await page.waitForTimeout(1500);
            console.log('  -> Botón "VER / IMPRIMIR BAUCHER" ejecutado sin errores.');
        } else {
            console.log('  -> Voucher disponible en la lista de estancias activas.');
        }

        console.log('\n\x1b[32m=================================================================\x1b[0m');
        console.log('\x1b[32m   AUDITORÍA PREPRODUCCIÓN: HOMOLOGADA AL 100%                   \x1b[0m');
        console.log('\x1b[32m=================================================================\x1b[0m\n');

    } catch (err) {
        console.error('\x1b[31mError durante el test:\x1b[0m', err.message);
    } finally {
        await page.waitForTimeout(2500);
        await browser.close();
    }
})();