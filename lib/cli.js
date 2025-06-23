// lib/cli.js
const fs = require('fs');
const path = require('path');
const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8'));
const { printHelp, formatTimestamp, colors } = require('./utils');

function parseArgs() {
  const args = process.argv.slice(2);
  const noArguments = args.length === 0;
  const options = {
    rootDirectory: './',
    outputFile: '',
    allowedExtensions: null,
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
        console.error(`${colors.yellow}❌ Invalid directory: ${options.rootDirectory}${colors.reset}`);
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

  if (!options.outputFile) {
    options.outputFile = `dir2context_${formatTimestamp()}.txt`;
  }

  options.rootDirectory = path.resolve(options.rootDirectory);
  return options;
}

module.exports = {
  parseArgs,
  printHelp
};


