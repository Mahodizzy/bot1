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
            authTimeout: 15000, // Un poco más de tiempo para conexiones lentas
        },
    };

    try {
        connection = await imaps.connect(config);
        await connection.openBox('INBOX');

        // Buscamos correos de las últimas 24 horas para que sea súper rápido
        const una_semana_atras = new Date();
        una_semana_atras.setDate(una_semana_atras.getDate() - 1);
        
        const searchCriteria = [['ALL'], ['SINCE', una_semana_atras.toISOString()]];
        const fetchOptions = { bodies: ['TEXT'], struct: true };
        
        const messages = await connection.search(searchCriteria, fetchOptions);

        if (!messages || messages.length === 0) {
            if (connection) connection.end();
            return res.status(200).json({ contenido: "No se encontraron correos recientes (últimas 24h)." });
        }

        // Obtener el último mensaje
        const ultimoCorreo = messages[messages.length - 1];
        
        // Buscamos la parte del cuerpo del mensaje
        const part = ultimoCorreo.parts.find(p => p.which === 'TEXT');
        let cuerpo = "Sin contenido legible";

        if (part && part.body) {
            cuerpo = part.body.toString('utf8');
            // Si el correo es HTML, eliminamos las etiquetas para que sea solo texto
            cuerpo = cuerpo.replace(/<[^>]*>?/gm, ''); 
            // Acortamos el mensaje para que no rompa la interfaz
            cuerpo = cuerpo.substring(0, 300) + "...";
        }

        connection.end();
        return res.status(200).json({ contenido: cuerpo });

    } catch (error) {
        if (connection && typeof connection.end === 'function') {
            connection.end();
        }
        console.error("DETALLE:", error.message);
        return res.status(500).json({ 
            error: "Error de conexión", 
            detalle: error.message 
        });
    }
};
