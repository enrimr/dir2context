// lib/utils.js
const path = require('path');

function containsHiddenSegment(fullPath) {
  return fullPath
    .split(path.sep)
    .some(segment => segment.startsWith('.') && segment.length > 1);
}

function formatTimestamp() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
}

const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  yellow: '\x1b[33m',
  white: '\x1b[37m',
  red: '\x1b[31m'
};

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
  --semantic-chunks        Use semantic chunking (split by functions, classes, etc.)
  --json-chunks            Generate JSON file with chunks suitable for vector stores
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
  dir2context ./src --semantic-chunks --ext .js,.ts,.py
  dir2context ./src --semantic-chunks --json-chunks --output code-chunks.txt
`);
}

module.exports = {
  containsHiddenSegment,
  formatTimestamp,
  colors,
  printHelp
};