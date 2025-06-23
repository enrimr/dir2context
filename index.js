#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');

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
        noArguments
    };

    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        if (arg === '--output') {
            options.outputFile = args[++i];
        } else if (arg === '--ext') {
            options.allowedExtensions = args[++i].split(',').map(e => e.trim());
        } else if (arg === '--exclude-dirs') {
            options.excludedDirectories = args[++i].split(',').map(e => e.trim());
        } else if (arg === '--exclude-files') {
            options.excludedFiles = args[++i].split(',').map(e => e.trim());
        } else if (arg === '--ignore-hidden') {
            options.ignoreHidden = true;
        } else if (!arg.startsWith('--')) {
            options.rootDirectory = arg;
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

// Helper to detect if a path contains any hidden segments
function containsHiddenSegment(fullPath) {
    return fullPath
        .split(path.sep)
        .some(segment => segment.startsWith('.') && segment.length > 1);
}

async function processDirectory(directory, options, result = []) {
    const entries = await fs.readdir(directory, { withFileTypes: true });

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
                const contents = await fs.readFile(entryPath, 'utf8');
                result.push(`File: ${entry.name}\nPath: ${entryPath}\n\n${contents}\n\n`);
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
        await fs.writeFile(options.outputFile, fileContents.join('\n'), 'utf8');
        console.log(`Content saved to ${options.outputFile}`);
    } catch (err) {
        console.error('An error occurred during processing:', err);
    }
})();

