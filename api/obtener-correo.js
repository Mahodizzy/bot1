const imaps = require('imap-simple');

module.exports = async (req, res) => {
    let connection; // La declaramos aquí fuera para que sea accesible en todo el código

    const config = {
        imap: {
            user: process.env.GMAIL_USER,
            password: process.env.GMAIL_PASS,
            host: 'imap.gmail.com',
            port: 993,
            tls: true,
            tlsOptions: { rejectUnauthorized: false },
            authTimeout: 10000, // Aumentamos el tiempo de espera
        },
    };

    try {
        connection = await imaps.connect(config);
        await connection.openBox('INBOX');
        
        const searchCriteria = ['ALL'];
        const fetchOptions = { bodies: ['HEADER', 'TEXT'], struct: true };
        const messages = await connection.search(searchCriteria, fetchOptions);
        
        if (!messages || messages.length === 0) {
            connection.end();
            return res.status(200).json({ contenido: "Bandeja de entrada vacía." });
        }

        // Obtener el último correo
        const ultimoCorreo = messages[messages.length - 1];
        const part = ultimoCorreo.parts.find(p => p.which === 'TEXT');
        
        // Convertimos el buffer a texto legible
        const cuerpo = part ? part.body.toString('utf8') : "Sin contenido de texto";

        connection.end();
        return res.status(200).json({ contenido: cuerpo });

    } catch (error) {
        // Si la conexión llegó a existir, la cerramos para no dejar procesos abiertos
        if (connection) connection.end();
        
        console.error("ERROR DETECTADO:", error.message);
        return res.status(500).json({ 
            error: "Error de conexión", 
            detalle: error.message 
        });
    }
};
