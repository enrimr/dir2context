FROM node:18-slim

WORKDIR /app

# Instalar dependencias del sistema necesarias para tree-sitter
RUN apt-get update && apt-get install -y \
    python3 \
    build-essential \
    git \
    && rm -rf /var/lib/apt/lists/*

# Copiar archivos de package.json
COPY package.json ./

# Instalar dependencias de Node.js
RUN npm install

# Copiar el código fuente de dir2context
COPY index.js ./
COPY lib/ ./lib/

# Copiar el script de ayuda
COPY run.sh ./
RUN chmod +x ./run.sh

# Crear directorios para volúmenes
RUN mkdir -p /input /output

# Hacer ejecutable el script index.js
RUN chmod +x index.js

# Establecer punto de entrada
ENTRYPOINT ["/app/run.sh"]
