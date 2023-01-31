const rateLimit = require ("express-rate-limit")
const {logEvents} = require ("./logger")

const loginLimiter = rateLimit ({
    windowMs: 60 * 1000, // 1 Minuto
    max: 5, // Limite por cada IP de 5 requests de login por ventana por minuto
    message: 
        {message: "Demasiados intentos de logeo desde la IP actual, intentar en unos minutos"},
    handler: (req, res, next, options) => {
        logEvents(`Demasiados requests : ${options.message.message}\t${req.method}\t${req.url}\t${req.headers.origin}`, 'errLog.log')
        res.status(options.statusCode).send(options.message)
    },
    standardHeaders: true,
    legacyHeaders:false,
})

module.exports = loginLimiter