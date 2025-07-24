# dir2context

**dir2context** is a CLI tool that generates clean, consolidated text context files from source directories. Ideal for feeding source code or structured content into Large Language Models (LLMs) like GPT, Claude, or Mistral.

Supports both simple file-based chunking and **semantic chunking** based on code structure (functions, classes, methods) using [`tree-sitter`](https://tree-sitter.github.io/tree-sitter/).

## 📦 Installation

### Global installation

```bash
npm install -g dir2context
```

### Without installing (via `npx`)
```bash
npx dir2context ./src --output context.txt
```

## 🚀 Usage

```bash
dir2context [directory] [options]
```

#### Run with all defaults (include all files and directories from current folder)

```bash
dir2context
```

### Options

| Option                   | Description                                                                                   |
|--------------------------|-----------------------------------------------------------------------------------------------|
| `--output <file>`        | Output file name. Defaults to `dir2context_<timestamp>.txt`.                                  |
| `--ext <list>`           | Comma-separated list of file extensions to include (e.g. `.java,.ts`).                        |
| `--exclude-dirs <list>`  | Comma-separated list of directory names to exclude.                                           |
| `--exclude-files <list>` | Comma-separated list of specific file names to exclude.                                       |
| `--ignore-hidden`        | Skip hidden files and directories (those starting with `.`).                                  |
| `--chunk-size <n>`       | Maximum number of characters per output file. Ensures files are kept whole (not split).       |
| `--semantic-chunks`	   | Enable semantic chunking using Tree-sitter (splits by functions, methods, classes).           |
| `--json-chunks`          | Output semantic chunks as a JSON array (requires --semantic-chunks).                          |
| `--json`                 | Print summary in JSON format. If used with `--output`, also creates `<output>.stats.json`.    |
| `--quiet`                | Suppress normal output (only errors will be printed).                                         |
| `--help`, `-h`           | Show help message.                                                                            |
| `--version`, `-v`        | Show version number.                                                                          |

## 💡 Examples


```bash
# Basic usage (defaults to .java files)
dir2context ./src

# Custom output file
dir2context ./project --output context.txt

# Include both Java and Kotlin files
dir2context . --ext .java,.kt

# Exclude test directories and hidden files
dir2context . --exclude-dirs test --ignore-hidden

# Exclude specific files by name
dir2context . --exclude-files build.gradle,MainTest.java

# Enable semantic chunking (recommended for LLM/RAG pipelines)
dir2context ./src --semantic-chunks --ext .java --output semantic.txt
``` 

## 📁 Output format

Each file is included in the output like this:
```
File: MyClass.java
Path: /absolute/path/to/MyClass.java

<contents of file>
```

When using `--semantic-chunks`, the output includes structural metadata:

```
File: Calculator.java
Path: /input/src/main/java/com/example/demo/Calculator.java
Type: method
Name: getName
Lines: 118–120

getName() {
    return name;
}
```

When using `--json-chunks`, the output is a JSON array of semantic chunks:

```
[
  {
    "file": "Calculator.java",
    "path": "/input/src/main/java/com/example/demo/Calculator.java",
    "type": "method",
    "name": "getName",
    "lines": [118, 120],
    "content": "getName() {\n    return name;\n}"
  },
  ...
]
```

## 🧠 Use cases

Preparing context for prompting LLMs with multi-file source code.

Code analysis pipelines.

Documentation extraction.

Preprocessing for embedding or chunking tools.


---
## 🧠 Semantic Chunking (optional)

Starting from this version, `dir2context` allows semantic code analysis to generate chunks based on **functions**, **methods**, and **classes**, using [`tree-sitter`](https://tree-sitter.github.io/tree-sitter/).

### 🔧 How to use it

How to use
Just add --semantic-chunks to your command:

```bash
dir2context ./src --ext .java --semantic-chunks --output output.txt
```

To get the output in structured JSON format instead:

```bash
dir2context ./src --semantic-chunks --json-chunks --ext .java > chunks.json
```

### 📄 Output Example

```plaintext
File: Calculator.java
Path: /input/src/main/java/com/example/demo/Calculator.java
Type: method
Name: getName
Lines: 118–120

getName() {
    return name;
}
```

### 📦 Advantages

* Greater precision when using the output in LLM / RAG models
* Better context organization by logical code units
* Ideal for projects requiring structural source code analysis
* Machine-readable output with --json-chunks for further automation

> ✅ You can combine `--semantic-chunks` and `--json-chunks` with all other options like `--ext`, `--exclude-dirs`, etc.

---


## 🪪 License

MIT License

Copyright (c) 2025 Enrique Ismael Mendoza Robaina

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights  
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell     
copies of the Software, and to permit persons to whom the Software is         
furnished to do so, subject to the following conditions:                      

The above copyright notice and this permission notice shall be included in    
all copies or substantial portions of the Software.                           

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR    
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,      
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE   
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER        
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, 
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN     
THE SOFTWARE.
