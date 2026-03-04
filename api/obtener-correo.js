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
        
        // Buscamos solo el último correo para máxima velocidad
        const searchCriteria = ['ALL'];
        const fetchOptions = { bodies: ['TEXT'], struct: true };
        const messages = await connection.search(searchCriteria, fetchOptions);
        
        if (!messages.length) {
            if (connection) connection.end();
            return res.status(200).json({ contenido: "Bandeja vacía." });
        }

        const ultimoCorreo = messages[messages.length - 1];
        const part = ultimoCorreo.parts.find(p => p.which === 'TEXT');
        let cuerpo = part ? part.body.toString('utf8') : "";

        // --- LIMPIEZA EFECTIVA ---
        // Si es un correo multipart, cortamos en el primer separador para quitar la basura
        if (cuerpo.includes('--0000')) {
            cuerpo = cuerpo.split('--0000')[0]; 
        }

        // Quitamos etiquetas HTML y metadatos básicos
        cuerpo = cuerpo.replace(/<[^>]*>?/gm, '') // Quita HTML
                       .replace(/Content-Type:[\s\S]*?UTF-8/g, '') // Quita cabeceras
                       .replace(/\s+/g, ' ') // Quita espacios múltiples
                       .trim();

        // Si después de limpiar quedó muy largo, lo cortamos
        const resultadoFinal = cuerpo.length > 5 ? cuerpo.substring(0, 400) : "El correo no tiene texto simple legible.";

        if (connection) connection.end();
        return res.status(200).json({ contenido: resultadoFinal });

    } catch (error) {
        if (connection) connection.end();
        return res.status(500).json({ error: "Error de conexión", detalle: error.message });
    }
};
