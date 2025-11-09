import http.server
import socketserver
import os
import argparse

# Cambiar al directorio del proyecto correcto (carpeta que contiene los HTML/CSS)
# Sirve siempre el directorio donde está este script, evitando rutas externas
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
os.chdir(BASE_DIR)

# Configurar el servidor
# Prioridad: CLI > variable de entorno PORT > valor por defecto
DEFAULT_PORT = 8000

parser = argparse.ArgumentParser(description="Servidor HTTP simple para el proyecto")
parser.add_argument("-p", "--port", type=int, help="Puerto de escucha (1-65535)")
args = parser.parse_args()

env_port = os.environ.get("PORT")

def resolve_port(cli_port, env_port_value, default):
    # CLI tiene prioridad si es válido
    if cli_port is not None and 1 <= cli_port <= 65535:
        return cli_port
    # Luego variable de entorno si existe y es válida
    if env_port_value:
        try:
            parsed = int(env_port_value)
            if 1 <= parsed <= 65535:
                return parsed
        except ValueError:
            print(f"Advertencia: PORT='{env_port_value}' no es un número válido. Usando puerto por defecto {default}.")
    # Finalmente el valor por defecto
    return default

PORT = resolve_port(args.port, env_port, DEFAULT_PORT)

Handler = http.server.SimpleHTTPRequestHandler
socketserver.TCPServer.allow_reuse_address = True

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print(f"Servidor ejecutándose en http://localhost:{PORT}/ (raíz: {BASE_DIR})")
    print("Presiona Ctrl+C para detener el servidor")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServidor detenido")
        httpd.shutdown()