import imaplib
import email

# Tus datos de acceso
usuario = "refills.ec@gmail.com"
password = "dmef verv rpmf bomr" # El que generaste en el paso 1

def leer_ultimo_correo():
    try:
        # Conexión al servidor de Gmail
        mail = imaplib.IMAP4_SSL('imap.gmail.com')
        mail.login(usuario, password)
        
        # Seleccionar la bandeja de entrada
        mail.select("inbox")
        
        # Buscar todos los correos
        status, mensajes = mail.search(None, 'ALL')
        ids_correos = mensajes[0].split()
        
        # Obtener el ID del último correo
        ultimo_id = ids_correos[-1]
        
        # Descargar el contenido del correo
        status, data = mail.fetch(ultimo_id, '(RFC822)')
        
        for respuesta in data:
            if isinstance(respuesta, tuple):
                mensaje_raw = email.message_from_bytes(respuesta[1])
                asunto = mensaje_raw['subject']
                remitente = mensaje_raw['from']
                print(f"Asunto: {asunto}")
                print(f"De: {remitente}")
                
                # Aquí podrías extraer el cuerpo del mensaje para mostrarlo en tu interfaz
                
        mail.close()
        mail.logout()
        
    except Exception as e:
        print(f"Error: {e}")

# Llamar a la función
leer_ultimo_correo()