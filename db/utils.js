const { pool } = require('./pool');

// Cache for table existence checks
const tableCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Check if a table exists with caching
 * @param {string} tableName - Name of the table to check
 * @returns {Promise<boolean>} - True if table exists
 */
async function tableExists(tableName) {
  const cacheKey = `table:${tableName}`;
  const cached = tableCache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.exists;
  }
  
  try {
    const result = await pool.query(
      "SELECT to_regclass($1) as tbl",
      [`public.${tableName}`]
    );
    const exists = !!(result.rows[0] && result.rows[0].tbl);
    
    tableCache.set(cacheKey, {
      exists,
      timestamp: Date.now()
    });
    
    return exists;
  } catch (error) {
    console.error(`Error checking table existence for ${tableName}:`, error);
    return false;
  }
}

/**
 * Clear table cache (useful for testing or after schema changes)
 */
function clearTableCache() {
  tableCache.clear();
}

/**
 * Validate required fields in request body
 * @param {Object} body - Request body
 * @param {string[]} requiredFields - Array of required field names
 * @returns {Object|null} - Error object if validation fails, null otherwise
 */
function validateRequiredFields(body, requiredFields) {
  const missing = requiredFields.filter(field => !body[field]);
  
  if (missing.length > 0) {
    return {
      ok: false,
      error: `Missing required fields: ${missing.join(', ')}`
    };
  }
  
  return null;
}

module.exports = {
  tableExists,
  clearTableCache,
  validateRequiredFields
};
