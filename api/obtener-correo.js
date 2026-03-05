import imaps from 'imap-simple';

export default async function handler(req, res) {

  const config = {
    imap: {
      user: process.env.GMAIL_USER,
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

    const messages = await connection.search(['ALL'], {
      bodies: ['TEXT'],
      struct: true
    });

    if (!messages.length) {
      return res.status(404).json({ error: "No hay correos" });
    }

    const ultimoCorreo = messages[messages.length - 1];
    const cuerpo = ultimoCorreo.parts
      .find(part => part.which === 'TEXT')?.body;

    connection.end();

    res.status(200).json({ contenido: cuerpo });

  } catch (error) {
    res.status(500).json({ error: "Error de conexión con Gmail" });
  }
}
