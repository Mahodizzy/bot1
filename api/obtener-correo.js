const imaps = require('imap-simple');

module.exports = async (req, res) => {
    let connection; // La declaramos aquí arriba

    const config = {
        imap: {
            user: process.env.GMAIL_USER,
            password: process.env.GMAIL_PASS,
            host: 'imap.gmail.com',
            port: 993,
            tls: true,
            tlsOptions: { rejectUnauthorized: false },
            authTimeout: 10000,
        },
    };

    try {
        // Intentamos conectar
        connection = await imaps.connect(config);
        await connection.openBox('INBOX');
        
       // ... dentro del try ...
connection = await imaps.connect(config);
await connection.openBox('INBOX');

// Solo buscamos los últimos 2 correos para ir más rápido
const searchCriteria = [['ALL'], ['SINCE', new Date(Date.now() - 86400000).toISOString()]]; 
const fetchOptions = { bodies: ['TEXT'], struct: true };
const messages = await connection.search(searchCriteria, fetchOptions);

if (!messages || messages.length === 0) {
    connection.end();
    return res.status(200).json({ contenido: "No hay correos recientes." });
}

// Tomar el último
const ultimoCorreo = messages[messages.length - 1];
// Buscar la parte del texto (manejamos si es multipart o simple)
const part = ultimoCorreo.parts.find(p => p.which === 'TEXT');
let cuerpo = part ? part.body : "Sin texto";

connection.end();
return res.status(200).json({ contenido: cuerpo.toString('utf8').substring(0, 500) }); // Limitamos a 500 caracteres para probar
        const messages = await connection.search(searchCriteria, fetchOptions);
        
        if (!messages || messages.length === 0) {
            if (connection) connection.end();
            return res.status(200).json({ contenido: "No hay correos en la bandeja." });
        }

        // Extraer el último correo
        const ultimoCorreo = messages[messages.length - 1];
        const part = ultimoCorreo.parts.find(p => p.which === 'TEXT');
        const cuerpo = part ? part.body.toString('utf8') : "Correo sin texto legible.";

        connection.end();
        return res.status(200).json({ contenido: cuerpo });

    } catch (error) {
        // CORRECCIÓN: Solo cerramos la conexión si realmente se llegó a definir
        if (connection && typeof connection.end === 'function') {
            connection.end();
        }
        
        console.error("DETALLE DEL ERROR:", error.message);
        
        return res.status(500).json({ 
            error: "Error de autenticación o conexión", 
            detalle: error.message 
        });
    }
};


