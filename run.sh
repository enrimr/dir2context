#!/bin/bash

# Si no hay argumentos, mostrar ayuda
if [ "$#" -eq 0 ]; then
  echo ""
  echo "🚀 dir2context con Chunking Semántico 🚀"
  echo ""
  echo "Comandos disponibles:"
  echo ""
  echo "  1️⃣  Procesar directorio con chunking semántico:"
  echo "      ./run.sh process-semantic"
  echo ""
  echo "  2️⃣  Procesar directorio con chunking semántico y formato JSON:"
  echo "      ./run.sh process-json"
  echo ""
  echo "  3️⃣  Ejecutar comando personalizado:"
  echo "      ./run.sh custom \"<argumentos>\""
  echo ""
  echo "  4️⃣  Ver ayuda de dir2context:"
  echo "      ./run.sh help"
  echo ""
  exit 0
fi

# Procesar comandos
case "$1" in
  "process-semantic")
    node index.js /input --ext .java --semantic-chunks --output /output/java-chunks.txt
    ;;
  "process-json")
    node index.js /input --ext .java --semantic-chunks --json-chunks --output /output/java-chunks.txt
    ;;
  "custom")
    shift
    node index.js "$@"
    ;;
  "help")
    node index.js --help
    ;;
  *)
    # Pasar todos los argumentos a dir2context
    node index.js "$@"
    ;;
esac
