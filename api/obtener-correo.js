const imaps = require('imap-simple');

module.exports = async (req, res) => {
    let connection;
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
        connection = await imaps.connect(config);
        await connection.openBox('INBOX');
        
        const searchCriteria = ['ALL'];
        const fetchOptions = { bodies: ['TEXT'], struct: true };
        const messages = await connection.search(searchCriteria, fetchOptions);
        
        if (!messages || messages.length === 0) {
            if (connection) connection.end();
            return res.status(200).json({ contenido: "Bandeja vacía." });
        }

        const ultimoCorreo = messages[messages.length - 1];
        const part = ultimoCorreo.parts.find(p => p.which === 'TEXT');
        
        // Simplemente enviamos el texto tal cual llega para asegurar el 200
        let cuerpo = part ? part.body.toString('utf8') : "Sin texto";
        
        // Limpieza mínima para evitar errores de JSON
        cuerpo = cuerpo.substring(0, 500); 

        connection.end();
        return res.status(200).json({ contenido: cuerpo });

    } catch (error) {
        if (connection) connection.end();
        console.error("Error IMAP:", error.message);
        return res.status(500).json({ error: "Error de conexión", detalle: error.message });
    }
};
