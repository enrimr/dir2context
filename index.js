#!/usr/bin/env node

/**
 * dir2context
 * (c) 2025 Enrique Ismael Mendoza Robaina - MIT License
 */

const fs = require('fs').promises;
const { parseArgs } = require('./lib/cli');
const { processDirectory, splitIntoChunks } = require('./lib/processor');
const { colors } = require('./lib/utils');

(async () => {
  const options = parseArgs();

  try {
    const fileContents = await processDirectory(options.rootDirectory, options);
    
    const chunks = splitIntoChunks(fileContents, options.outputFile, options.chunkSize);
    for (const [filename, content] of chunks) {
      await fs.writeFile(filename, content, 'utf8');
    }

    if (options.json) {
      const result = {
        outputFiles: chunks.map(([filename]) => filename),
        filesProcessed: options.filesProcessed,
        directoriesScanned: options.directoriesScanned,
        chunks: chunks.length
      };
      console.log(JSON.stringify(result, null, 2));

      if (options.outputFile) {
        const statsFilename = options.outputFile.replace(/\.txt$/, '.stats.json');
        await fs.writeFile(statsFilename, JSON.stringify(result, null, 2), 'utf8');
      }

      return;
    }

    if (!options.quiet) {
      console.log('');
      if (chunks.length === 1) {
        console.log(`${colors.green}✅ ${colors.bold}Content saved to:${colors.reset} ${colors.cyan}${chunks[0][0]}${colors.reset}`);
      } else {
        console.log(`${colors.green}✅ ${colors.bold}Content saved to:${colors.reset}`);
        for (const [filename] of chunks) {
          console.log(`  - ${colors.cyan}${filename}${colors.reset}`);
        }
      }
      console.log('');
      console.log(`${colors.green}  📝 Files processed:    ${colors.bold}${colors.white}${options.filesProcessed}${colors.reset}`);
      console.log(`${colors.green}  📦 Output chunks:      ${colors.bold}${colors.magenta}${chunks.length}${colors.reset}`);
      console.log(`${colors.green}  📁 Directories scanned: ${colors.bold}${colors.yellow}${options.directoriesScanned}${colors.reset}\n`);
    }
  } catch (err) {
    console.error('An error occurred during processing:', err);
  }
})();
