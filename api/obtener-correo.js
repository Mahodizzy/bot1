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
        
        // Buscamos solo el último correo
        const searchCriteria = ['ALL'];
        const fetchOptions = { bodies: ['TEXT'], struct: true };
        const messages = await connection.search(searchCriteria, fetchOptions);
        
        if (!messages.length) {
            connection.end();
            return res.status(200).json({ contenido: "Bandeja vacía." });
        }

        const ultimoCorreo = messages[messages.length - 1];
        const part = ultimoCorreo.parts.find(p => p.which === 'TEXT');
        let cuerpo = part ? part.body : "";

        // --- FILTRO PARA LIMPIAR EL CONTENIDO ---
        // 1. Convertimos a texto
        cuerpo = cuerpo.toString('utf8');
        
        // 2. Si el correo tiene varias partes (multipart), nos quedamos solo con la primera
        if (cuerpo.includes('--')) {
            const partes = cuerpo.split('--');
            // Intentamos buscar una parte que no tenga códigos HTML pesados
            cuerpo = partes.find(p => p.includes('Content-Type: text/plain')) || partes[1];
        }

        // 3. Limpieza final de etiquetas y metadatos
        cuerpo = cuerpo.replace(/Content-Type:[\s\S]*?charset="UTF-8"/g, ''); // Quita cabeceras
        cuerpo = cuerpo.replace(/<[^>]*>?/gm, ''); // Quita HTML
        cuerpo = cuerpo.trim().substring(0, 300); // Cortamos para que no sature la pantalla

        connection.end();
        return res.status(200).json({ contenido: cuerpo });

    } catch (error) {
        if (connection) connection.end();
        return res.status(500).json({ error: error.message });
    }
};
