const imaps = require('imap-simple');

module.exports = async (req, res) => {
  const config = {
    imap: {
      user: process.env.GMAIL_USER, // Esto leerá automáticamente lo que configuraste en Vercel
      password: process.env.GMAIL_PASS,
      host: 'imap.gmail.com',
      port: 993,
      tls: true,
      authTimeout: 3000,
    },
  };

  try {
    const connection = await imaps.connect(config);
    await connection.openBox('INBOX');
    
    const searchCriteria = ['ALL'];
    const fetchOptions = { bodies: ['HEADER', 'TEXT'], struct: true };
    const messages = await connection.search(searchCriteria, fetchOptions);
    
    if (messages.length === 0) {
      return res.status(200).json({ contenido: "No hay correos." });
    }

    const ultimoCorreo = messages[messages.length - 1];
    const part = ultimoCorreo.parts.find(p => p.which === 'TEXT');
    const cuerpo = part ? part.body : "Correo sin contenido de texto";

    connection.end();
    res.status(200).json({ contenido: cuerpo });
  } catch (error) {
    res.status(500).json({ error: "Error de conexión: " + error.message });
  }
};
