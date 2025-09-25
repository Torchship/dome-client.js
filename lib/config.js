/*!
 * Enhanced config abstraction with environment variable overrides
 * 
 * Environment variable naming convention:
 * - Use DOME_ prefix for all config overrides
 * - Use underscore notation for nested properties (e.g., DOME_NODE_PORT for node.port)
 * - Boolean values: 'true', 'false', '1', '0'
 * - Numbers: any valid number string
 * - Strings: any string value
 * 
 * Examples:
 * - DOME_NODE_MODE=development
 * - DOME_NODE_PORT=3000
 * - DOME_NODE_CONNECTANYWHERE=true
 * - DOME_MOO_HOST=game.example.com
 * - DOME_MOO_PORT=9999
 * - DOME_MOO_NAME=MyGame
 */

/**
 * Convert string values to appropriate types
 */
function convertValue(value, defaultValue) {
  if (typeof value !== 'string') return value;
  
  // Handle boolean values
  if (value.toLowerCase() === 'true' || value === '1') return true;
  if (value.toLowerCase() === 'false' || value === '0') return false;
  
  // Handle numbers
  if (!isNaN(value) && !isNaN(parseFloat(value))) {
    return parseFloat(value);
  }
  
  return value;
}

/**
 * Set nested property using dot notation
 */
function setNestedProperty(obj, path, value) {
  const keys = path.split('.');
  let current = obj;
  
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (!(key in current) || typeof current[key] !== 'object') {
      current[key] = {};
    }
    current = current[key];
  }
  
  current[keys[keys.length - 1]] = value;
}

/**
 * Convert snake_case to camelCase
 */
function toCamelCase(str) {
  return str.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase());
}

/**
 * Apply environment variable overrides to configuration
 */
function applyEnvOverrides(config) {
  const overrides = {};
  const prefix = 'DOME_';
  
  // Find all environment variables with DOME_ prefix
  for (const [key, value] of Object.entries(process.env)) {
    if (key.startsWith(prefix)) {
      // Remove prefix and convert to lowercase
      const configKey = key.substring(prefix.length).toLowerCase();
      
      // Convert underscores to dots for nested properties first
      const dotPath = configKey.replace(/_/g, '.');
      
      // Convert each part to camelCase
      const camelCasePath = dotPath.split('.').map((part, index) => {
        if (index === 0) {
          return part; // First part stays lowercase
        } else {
          // Convert to proper camelCase: first letter lowercase, rest as-is
          return part.charAt(0).toLowerCase() + part.slice(1);
        }
      }).join('.');
      
      // Convert value to appropriate type
      const convertedValue = convertValue(value);
      
      setNestedProperty(overrides, camelCasePath, convertedValue);
    }
  }
  
  // Deep merge overrides into config
  return deepMerge(config, overrides);
}

/**
 * Find a property key in an object (case-insensitive)
 */
function findPropertyKey(obj, targetKey) {
  const lowerTargetKey = targetKey.toLowerCase();
  for (const key in obj) {
    if (obj.hasOwnProperty(key) && key.toLowerCase() === lowerTargetKey) {
      return key;
    }
  }
  return targetKey; // Return original if not found
}

/**
 * Deep merge two objects with case-insensitive property matching
 */
function deepMerge(target, source) {
  const result = { ...target };
  
  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      // Find the actual key in target (case-insensitive)
      const actualKey = findPropertyKey(result, key);
      
      if (
        source[key] &&
        typeof source[key] === 'object' &&
        !Array.isArray(source[key]) &&
        result[actualKey] &&
        typeof result[actualKey] === 'object' &&
        !Array.isArray(result[actualKey])
      ) {
        result[actualKey] = deepMerge(result[actualKey], source[key]);
      } else {
        result[actualKey] = source[key];
      }
    }
  }
  
  return result;
}

/**
 * Load and process configuration
 */
function loadConfig() {
  let baseConfig;
  
  try {
    // Load base configuration
    const myName = process.env["NODE_ENV"];
    if (myName) {
      console.log(`Loading configuration from: ${myName}`);
      baseConfig = require("../config/" + myName);
    } else {
      console.log("No NODE_ENV specified, loading default configuration");
      baseConfig = require("../config/default.js");
    }
  } catch (e) {
    console.error("Error loading configuration:", e.message);
    console.log("Falling back to default configuration");
    baseConfig = require("../config/default.js");
  }
  
  // Apply environment variable overrides
  const finalConfig = applyEnvOverrides(baseConfig);
  
  // Log applied overrides for debugging
  const envOverrides = Object.keys(process.env)
    .filter(key => key.startsWith('DOME_'))
    .map(key => `${key}=${process.env[key]}`);
  
  if (envOverrides.length > 0) {
    console.log("Applied environment variable overrides:");
    envOverrides.forEach(override => console.log(`  ${override}`));
  }
  
  return finalConfig;
}

module.exports = loadConfig();
