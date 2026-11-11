const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const configureHelmet = helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }
});

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Demasiadas solicitudes desde esta IP, por favor intenta en unos minutos.' }
});

const financialLimiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Límite de solicitudes de facturación o reservación alcanzado. Espera unos momentos.' }
});

module.exports = {
    configureHelmet,
    apiLimiter,
    financialLimiter
};
