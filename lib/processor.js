// lib/processor.js
const fs = require('fs');
const fsp = fs.promises;
const path = require('path');
const { containsHiddenSegment } = require('./utils');
const { getSemanticChunks } = require('./semanticChunker');

async function processDirectory(directory, options, result = []) {
  options.directoriesScanned++;
  const entries = await fsp.readdir(directory, { withFileTypes: true });

  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);

    if (options.ignoreHidden && containsHiddenSegment(entryPath)) {
      continue;
    }

    if (entry.isFile()) {
      const ext = path.extname(entry.name);
      if (options.allowedExtensions && !options.allowedExtensions.includes(ext)) {
        continue;
      }

      // Verificar si el archivo está excluido
      if (options.excludedFiles.includes(entry.name)) {
        continue;
      }

      try {
        const contents = await fsp.readFile(entryPath, 'utf8');
        options.filesProcessed++;
        
        // Usar chunking semántico si está habilitado
        if (options.semanticChunks) {
          const semanticChunks = getSemanticChunks(contents, entryPath);
          for (const chunk of semanticChunks) {
            let chunkOutput = 
              `File: ${path.basename(chunk.filePath)}\n` +
              `Path: ${chunk.filePath}\n` +
              `Type: ${chunk.type}\n` +
              `Name: ${chunk.name}\n`;
            
            // Añadir información de parámetros si está disponible
            if (chunk.parameters && chunk.parameters.length > 0) {
              chunkOutput += `Parameters: ${chunk.parameters.join(', ')}\n`;
            }
            
            chunkOutput += `Lines: ${chunk.startLine}-${chunk.endLine}\n\n` +
              `${chunk.content}\n\n`;
              
            result.push(chunkOutput);
          }
        } else {
          // Comportamiento original
          result.push(`File: ${entry.name}\nPath: ${entryPath}\n\n${contents}\n\n`);
        }
      } catch (err) {
        console.error(`Error reading ${entryPath}:`, err);
      }

    } else if (entry.isDirectory() && !options.excludedDirectories.includes(entry.name)) {
      await processDirectory(entryPath, options, result);
    }
  }
  return result;
}

function splitIntoChunks(fileContents, baseFilename, chunkSize, options) {
  if (options.jsonChunks) {
    // Convertir el contenido a formato JSON para vectorización
    const jsonChunks = fileContents.map(content => {
      // Extraer metadatos del contenido
      const lines = content.split('\n');
      const metadata = {};
      let contentStart = 0;
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line === '') {
          contentStart = i + 1;
          break;
        }
        
        const colonIndex = line.indexOf(':');
        if (colonIndex > 0) {
          const key = line.substring(0, colonIndex).trim();
          const value = line.substring(colonIndex + 1).trim();
          metadata[key] = value;
        }
      }
      
      const actualContent = lines.slice(contentStart).join('\n');
      
      return {
        content: actualContent,
        metadata: metadata,
        embedding: null // Espacio para embeddings si se generan después
      };
    });
    
    // Guardar en un archivo JSON
    const jsonFilename = baseFilename.replace(/\.txt$/, '.json');
    fs.writeFileSync(jsonFilename, JSON.stringify(jsonChunks, null, 2));
  }
  
  // Continuar con el procesamiento normal de texto
  if (!chunkSize) {
    return [[baseFilename, fileContents.join('\n')]];
  }

  const chunks = [];
  let currentChunk = '';
  let partNumber = 1;

  for (const section of fileContents) {
    if ((currentChunk + section).length > chunkSize) {
      const filename = baseFilename.replace(/\.txt$/, `_part${partNumber}.txt`);
      chunks.push([filename, currentChunk]);
      currentChunk = section;
      partNumber++;
    } else {
      currentChunk += section;
    }
  }

  if (currentChunk) {
    const filename = baseFilename.replace(/\.txt$/, `_part${partNumber}.txt`);
    chunks.push([filename, currentChunk]);
  }

  return chunks;
}

module.exports = {
  processDirectory,
  splitIntoChunks
};