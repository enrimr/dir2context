// lib/semanticChunker.js
const Parser = require('tree-sitter');
const JavaScript = require('tree-sitter-javascript');
const Python = require('tree-sitter-python');
const TypeScript = require('tree-sitter-typescript').typescript;
const path = require('path');

// Inicializar el parser
const parser = new Parser();

// Mapeo de extensiones de archivo a lenguajes
const LANGUAGE_MAP = {
  '.js': JavaScript,
  '.jsx': JavaScript,
  '.ts': TypeScript,
  '.tsx': TypeScript,
  '.py': Python,
  '.java': JavaScript  // Usamos el parser de JavaScript para Java como aproximación
};

/**
 * Obtiene chunks semánticos de un archivo de código
 * @param {string} content - Contenido del archivo
 * @param {string} filePath - Ruta del archivo
 * @returns {Array} - Array de chunks semánticos
 */
function getSemanticChunks(content, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const language = LANGUAGE_MAP[ext];
  
  // Si no tenemos un parser para este lenguaje, devolver el archivo completo como un chunk
  if (!language) {
    return [{
      type: 'file',
      name: path.basename(filePath),
      content: content,
      filePath: filePath,
      startLine: 1,
      endLine: content.split('\n').length
    }];
  }
  
  // Configurar el parser para el lenguaje adecuado
  parser.setLanguage(language);
  
  // Parsear el código
  const tree = parser.parse(content);
  const chunks = [];
  
  // Recorrer el AST para encontrar unidades semánticas
  traverseTree(tree.rootNode, chunks, content, filePath);
  
  // Si no encontramos chunks semánticos, devolver el archivo completo
  if (chunks.length === 0) {
    return [{
      type: 'file',
      name: path.basename(filePath),
      content: content,
      filePath: filePath,
      startLine: 1,
      endLine: content.split('\n').length
    }];
  }
  
  return chunks;
}

/**
 * Recorre el AST para extraer unidades semánticas
 */
function traverseTree(node, chunks, content, filePath) {
  // Identificar nodos que representan unidades semánticas
  if (isSemanticUnit(node)) {
    const chunk = extractChunk(node, content, filePath);
    if (chunk) {
      chunks.push(chunk);
    }
  }
  
  // Recursivamente procesar los hijos
  for (const child of node.children) {
    traverseTree(child, chunks, content, filePath);
  }
}

/**
 * Determina si un nodo es una unidad semántica
 */
function isSemanticUnit(node) {
  // Tipos que representan funciones en diferentes lenguajes
  const functionTypes = [
    'function_declaration',    // JavaScript/TypeScript
    'method_definition',       // JavaScript/TypeScript
    'arrow_function',          // JavaScript/TypeScript
    'function',                // Python
    'method_declaration',      // Java
    'constructor_declaration', // Java
    'method',                  // Java
    'function_expression',     // JavaScript
    'method_declaration',      // TypeScript
    'lambda_expression',       // Java/TypeScript
  ];
  
  return functionTypes.includes(node.type);
}

/**
 * Extrae información de un chunk semántico
 */
function extractChunk(node, content, filePath) {
  // Obtener el texto del nodo
  const nodeContent = content.substring(
    node.startPosition.row === 0 ? 0 : 
    getPositionOffset(content, node.startPosition),
    getPositionOffset(content, node.endPosition)
  );
  
  // Intentar obtener el nombre del nodo
  let name = 'anonymous';
  const nameNode = findNameNode(node);
  if (nameNode) {
    name = content.substring(
      getPositionOffset(content, nameNode.startPosition),
      getPositionOffset(content, nameNode.endPosition)
    ).trim();
  }
  
  // Extraer comentarios javadoc/JSDoc si están presentes
  const commentLines = extractComments(node, content);
  
  // Extraer información sobre parámetros
  const parameters = extractParameters(node, content);
  
  // Determinar el tipo de función (método, constructor, función estática, etc.)
  const functionType = determineFunctionType(node);
  
  return {
    type: functionType || node.type,
    name: name,
    content: commentLines ? commentLines + '\n' + nodeContent : nodeContent,
    parameters: parameters,
    filePath: filePath,
    startLine: node.startPosition.row + 1,
    endLine: node.endPosition.row + 1
  };
}

/**
 * Extrae los comentarios asociados a un nodo
 */
function extractComments(node, content) {
  // Buscar un nodo de comentario inmediatamente anterior
  let commentNode = null;
  if (node.previousSibling && 
      (node.previousSibling.type === 'comment' || 
       node.previousSibling.type === 'block_comment' ||
       node.previousSibling.type === 'documentation_comment')) {
    commentNode = node.previousSibling;
  } else {
    // Buscar en los padres
    let current = node.parent;
    while (current) {
      if (current.children && current.children.length > 0) {
        for (let i = 0; i < current.children.length; i++) {
          const child = current.children[i];
          if (child === node && i > 0 && 
              (current.children[i-1].type === 'comment' || 
               current.children[i-1].type === 'block_comment' ||
               current.children[i-1].type === 'documentation_comment')) {
            commentNode = current.children[i-1];
            break;
          }
        }
      }
      if (commentNode) break;
      current = current.parent;
    }
  }
  
  if (commentNode) {
    return content.substring(
      getPositionOffset(content, commentNode.startPosition),
      getPositionOffset(content, commentNode.endPosition)
    );
  }
  
  return null;
}

/**
 * Extrae información sobre los parámetros de la función
 */
function extractParameters(node, content) {
  // Buscar el nodo de parámetros
  let paramListNode = null;
  
  for (const child of node.children) {
    if (child.type === 'formal_parameters' || 
        child.type === 'parameter_list' ||
        child.type === 'parameters') {
      paramListNode = child;
      break;
    }
  }
  
  if (!paramListNode) return [];
  
  const params = [];
  for (const param of paramListNode.children) {
    if (param.type === 'formal_parameter' || 
        param.type === 'parameter' ||
        param.type === 'identifier') {
      const paramText = content.substring(
        getPositionOffset(content, param.startPosition),
        getPositionOffset(content, param.endPosition)
      ).trim();
      
      if (paramText && !paramText.match(/^[,(){}]$/)) {
        params.push(paramText);
      }
    }
  }
  
  return params;
}

/**
 * Determina el tipo específico de función (método, constructor, etc.)
 */
function determineFunctionType(node) {
  if (node.type === 'constructor_declaration') {
    return 'constructor';
  }
  
  if (node.type === 'method_definition' || node.type === 'method_declaration') {
    // Detectar si es un getter/setter
    for (const child of node.children) {
      if (child.type === 'property_identifier' && 
          (child.text === 'get' || child.text === 'set')) {
        return child.text + '_method';
      }
    }
    
    // Detectar si es estático
    let isStatic = false;
    for (const child of node.children) {
      if (child.type === 'static' || 
          (child.type === 'modifier' && child.text === 'static')) {
        isStatic = true;
        break;
      }
    }
    
    return isStatic ? 'static_method' : 'method';
  }
  
  return 'function';
}

/**
 * Encuentra el nodo que contiene el nombre de la unidad semántica
 */
function findNameNode(node) {
  // Diferentes tipos de nodos almacenan el nombre en diferentes lugares
  if (node.type === 'function_declaration' || node.type === 'class_declaration') {
    for (const child of node.children) {
      if (child.type === 'identifier') {
        return child;
      }
    }
  } else if (node.type === 'method_definition') {
    for (const child of node.children) {
      if (child.type === 'property_identifier') {
        return child;
      }
    }
  } else if (node.type === 'function' || node.type === 'class_definition') {
    // Python
    for (const child of node.children) {
      if (child.type === 'identifier') {
        return child;
      }
    }
  } else if (node.type === 'method_declaration' || node.type === 'constructor_declaration') {
    // Java
    for (const child of node.children) {
      if (child.type === 'identifier') {
        return child;
      }
    }
  } else if (node.type === 'arrow_function' || node.type === 'function_expression') {
    // Intentar encontrar el nombre de la variable a la que se asigna la función
    const parent = node.parent;
    if (parent && parent.type === 'variable_declarator') {
      for (const sibling of parent.children) {
        if (sibling.type === 'identifier') {
          return sibling;
        }
      }
    } else if (parent && parent.type === 'assignment_expression') {
      for (const sibling of parent.children) {
        if (sibling.type === 'identifier' || sibling.type === 'member_expression') {
          return sibling;
        }
      }
    } else if (parent && parent.type === 'pair') {
      for (const sibling of parent.children) {
        if (sibling.type === 'property_identifier' || sibling.type === 'string') {
          return sibling;
        }
      }
    }
  }
  
  return null;
}

/**
 * Calcula el offset de bytes para una posición en el texto
 */
function getPositionOffset(text, position) {
  const lines = text.split('\n');
  let offset = 0;
  
  for (let i = 0; i < position.row; i++) {
    offset += lines[i].length + 1; // +1 para el caracter de nueva línea
  }
  
  return offset + position.column;
}

module.exports = {
  getSemanticChunks
};