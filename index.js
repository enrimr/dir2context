#!/usr/bin/env node

/**
 * dir2context
 * (c) 2025 Enrique Ismael Mendoza Robaina - MIT License
 */

const fs = require('fs');
const fsp = fs.promises;
const path = require('path');
const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));

function printHelp() {
    console.log(`
Usage:
  dir2context [directory] [options]

Options:
  --output <file>          Output file name (default: dir2context_<timestamp>.txt)
  --ext <list>             Comma-separated list of file extensions to include (e.g. .js,.ts)
  --exclude-dirs <list>    Comma-separated list of directory names to exclude
  --exclude-files <list>   Comma-separated list of filenames to exclude
  --ignore-hidden          Skip hidden files and directories (those starting with .)
  --chunk-size <n>         Max number of characters per output file (keeps files whole)
  --json                   Output summary in JSON format to console
                           If used with --output, also writes <output>.stats.json
  --quiet                  Suppress normal output (only errors will be shown)
  --help, -h               Show this help message
  --version, -v            Show version number

Examples:
  dir2context
  dir2context ./src --ext .js,.ts --chunk-size 10000
  dir2context --ignore-hidden
  dir2context ./project --output result.txt --json
`);
}

function parseArgs() {
    const args = process.argv.slice(2);
    const noArguments = args.length === 0;
    const options = {
        rootDirectory: './',
        outputFile: '',
        allowedExtensions: null, // null means "allow all"
        excludedDirectories: [],
        excludedFiles: [],
        ignoreHidden: false,
        chunkSize: null,
        noArguments,
        filesProcessed: 0,
        directoriesScanned: 0,
        quiet: false,
        json: false,
    };

    for (let i = 0; i < args.length; i++) {
        const arg = args[i];

        if (args[0] === 'help' || arg === '--help' || arg === '-h') {
            printHelp();
            process.exit(0);
        } else if (arg === '--version' || arg === '-v') {
            console.log(`dir2context version ${packageJson.version}`);
            process.exit(0);
        } else if (arg === '--output') {
            options.outputFile = args[++i];
        } else if (arg === '--ext') {
            options.allowedExtensions = args[++i].split(',').map(e => e.trim().startsWith('.') ? e.trim() : '.' + e.trim());
        } else if (arg === '--exclude-dirs') {
            options.excludedDirectories = args[++i].split(',').map(e => e.trim());
        } else if (arg === '--exclude-files') {
            options.excludedFiles = args[++i].split(',').map(e => e.trim());
        } else if (arg === '--ignore-hidden') {
            options.ignoreHidden = true;
        } else if (arg === '--chunk-size') {
            options.chunkSize = parseInt(args[++i], 10);
        } else if (!arg.startsWith('--')) {
            options.rootDirectory = arg;
            if (!fs.existsSync(options.rootDirectory) || !fs.lstatSync(options.rootDirectory).isDirectory()) {
                console.error(`Invalid directory: ${options.rootDirectory}`);
                process.exit(1);
            }
        } else if (arg === '--quiet') {
            options.quiet = true;
        } else if (arg === '--json') {
            options.json = true;
        } else {
            console.error(`Unknown option: ${arg}`);
            printHelp();
            process.exit(1);
        } 
    }

    /*if (!options.outputFile) {
        const sanitized = options.rootDirectory.replace(/\//g, '_');
        options.outputFile = `output_${sanitized}.txt`;
    }*/

    if (!options.outputFile) {
        const now = new Date();
        const pad = (n) => String(n).padStart(2, '0');
        const timestamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
        options.outputFile = `dir2context_${timestamp}.txt`;
    }

    options.rootDirectory = path.resolve(options.rootDirectory);
    return options;
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


// Helper to detect if a path contains any hidden segments
function containsHiddenSegment(fullPath) {
    return fullPath
        .split(path.sep)
        .some(segment => segment.startsWith('.') && segment.length > 1);
}

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
            if (
                options.allowedExtensions &&
                !options.allowedExtensions.includes(ext)
            ) {
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

(async () => {
    const options = parseArgs();

    try {
        const fileContents = await processDirectory(options.rootDirectory, options);
        if (options.noArguments) {
            console.log('No arguments provided — processing ALL files and directories in the current folder.');
            console.log(`Output will be saved to ${options.outputFile}`);
        }
        //await fsp.writeFile(options.outputFile, fileContents.join('\n'), 'utf8');

        const chunks = splitIntoChunks(fileContents, options.outputFile, options.chunkSize);
        for (const [filename, content] of chunks) {
            await fsp.writeFile(filename, content, { encoding: 'utf8' });
            //console.log(`Content saved to ${filename}`);
        }

        //console.log(`Processed ${options.filesProcessed} file${options.filesProcessed !== 1 ? 's' : ''} across ${chunks.length} output chunk${chunks.length !== 1 ? 's' : ''}.`);
        //console.log(`Scanned ${options.directoriesScanned} director${options.directoriesScanned !== 1 ? 'ies' : 'y'} in total.`);

        //console.log(`Content saved to ${options.outputFile}`);

        // JSON output mode
        if (options.json) {
            const result = {
                outputFiles: chunks.map(([filename]) => filename),
                filesProcessed: options.filesProcessed,
                directoriesScanned: options.directoriesScanned,
                chunks: chunks.length
            };
            console.log(JSON.stringify(result, null, 2));

            // Also save to disk if --output is defined
            if (options.outputFile) {
                const statsFilename = options.outputFile.replace(/\.txt$/, '.stats.json');
                await fsp.writeFile(statsFilename, JSON.stringify(result, null, 2), { encoding: 'utf8' });
            }

            return;
        }
        if (!options.quiet) {
            const color = {
                reset: '\x1b[0m',
                bold: '\x1b[1m',
                green: '\x1b[32m',
                blue: '\x1b[34m',
                cyan: '\x1b[36m',
                magenta: '\x1b[35m',
                yellow: '\x1b[33m',
                white: '\x1b[37m'
            };

            console.log(``);
            // Mostrar salida agrupada
            if (chunks.length === 1) {
                console.log(`${color.green}✅ ${color.bold}Content saved to:${color.reset} ${color.cyan}${chunks[0][0]}${color.reset}`);
            } else {
                console.log(`${color.green}✅ ${color.bold}Content saved to:${color.reset}`);
                for (const [filename] of chunks) {
                    console.log(`  - ${color.cyan}${filename}${color.reset}`);
                }
            }

            console.log(``);
            console.log(`${color.green}  📝 Files processed:    ${color.bold}${color.white}${options.filesProcessed}${color.reset}`);
            console.log(`${color.green}  📦 Output chunks:      ${color.bold}${color.magenta}${chunks.length}${color.reset}`);
            console.log(`${color.green}  📁 Directories scanned: ${color.bold}${color.yellow}${options.directoriesScanned}${color.reset}\n`);
        }
    } catch (err) {
        console.error('An error occurred during processing:', err);
    }
})();

