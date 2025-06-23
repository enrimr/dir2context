// lib/processor.js
const fs = require('fs');
const fsp = fs.promises;
const path = require('path');
const { containsHiddenSegment } = require('./utils');

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

      try {
        const contents = await fsp.readFile(entryPath, 'utf8');
        result.push(`File: ${entry.name}\nPath: ${entryPath}\n\n${contents}\n\n`);
        options.filesProcessed++;
      } catch (err) {
        console.error(`Error reading ${entryPath}:`, err);
      }

    } else if (entry.isDirectory() && !options.excludedDirectories.includes(entry.name)) {
      await processDirectory(entryPath, options, result);
    }
  }
  return result;
}

function splitIntoChunks(fileContents, baseFilename, chunkSize) {
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


