# guía paso a paso para implementar JWT (con RS256) y bcrypt


1.-En tu backend (Node.js con Express):

npm install jsonwebtoken bcrypt


2.-Generar claves RSA (una vez)

Desde la terminal, ejecuta:

# 🧭 Paso 1: Crea la carpeta de claves en tu proyecto
Abre CMD (no PowerShell) y navega a tu proyecto backend:


cd "D:\upn\CICLO VII\Tiendas mass\Tiendas-Mass-full\Tiendas-Mass-full\backend"
mkdir keys

# 🔐 Paso 2: Genera las claves RSA usando CMD
Asegúrate de estar en la carpeta backend, luego ejecuta:


openssl genrsa -out keys/private.key 2048
# Y luego:

openssl rsa -in keys/private.key -pubout -out keys/public.key
# ✅ Esto generará dos archivos:


/backend/keys/private.key
/backend/keys/public.key

# Si esto te falla, prueba con ruta completa:

"C:\OpenSSL-Win64\bin\openssl.exe" genrsa -out keys/private.key 2048
"C:\OpenSSL-Win64\bin\openssl.exe" rsa -in keys/private.key -pubout -out keys/public.key
