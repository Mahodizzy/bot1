const imaps = require('imap-simple');

module.exports = async (req, res) => {
  const config = {
    imap: {
      user: process.env.GMAIL_USER,
      password: process.env.GMAIL_PASS,
      host: 'imap.gmail.com',
      port: 993,
      tls: true,
      // ESTA ES LA PARTE CLAVE QUE DEBES AGREGAR:
      tlsOptions: {
        rejectUnauthorized: false
      },
      authTimeout: 5000,
    },
  };

  try {
    const connection = await imaps.connect(config);
    await connection.openBox('INBOX');
    
    // Filtramos para buscar correos (puedes usar 'ALL' o 'UNSEEN')
    const searchCriteria = ['ALL']; 
    const fetchOptions = { bodies: ['HEADER', 'TEXT'], struct: true };
    const messages = await connection.search(searchCriteria, fetchOptions);
    
    if (!messages || messages.length === 0) {
      return res.status(200).json({ contenido: "No se encontraron correos." });
    }

    // Obtenemos el último mensaje
    const ultimoCorreo = messages[messages.length - 1];
    const part = ultimoCorreo.parts.find(p => p.which === 'TEXT');
    const cuerpo = part ? part.body : "El correo no tiene texto plano.";

    connection.end();
    
    res.status(200).json({ contenido: cuerpo });
  } catch (error) {
    // Si hay un error de contraseña o conexión, lo veremos aquí
    res.status(500).json({ error: "Error de conexión: " + error.message });
  }
};

// ... (dentro del bloque try, después de obtener 'cuerpo')
connection.end();

// Limpiamos un poco el texto por si viene con códigos raros
const textoLimpio = cuerpo.toString().replace(/[\r\n]/g, "<br>");

res.status(200).json({ contenido: textoLimpio });


document.getElementById('btnAceptar').onclick = async () => {
    const display = document.getElementById('resultado'); // Asegúrate que este ID exista
    display.innerHTML = "Cargando correo...";

    try {
        const res = await fetch('/api/obtener-correo');
        const data = await res.json();

        if (data.contenido) {
            // Usamos innerHTML para que los <br> se vean como saltos de línea
            display.innerHTML = `<div style="text-align:left; padding:10px; border:1px solid #ccc;">
                                    ${data.contenido}
                                 </div>`;
        } else {
            display.innerHTML = "No se encontró contenido en el correo.";
        }
    } catch (error) {
        display.innerHTML = "Error al conectar con el servidor.";
        console.error(error);
    }
};


