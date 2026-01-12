// API Configuration
const API_BASE_URL = 'http://localhost:8000';

// API Error Handler
class APIError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.data = data;
  }
}

// Generic fetch wrapper with error handling
async function fetchAPI(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new APIError(
        errorData.message || 'Request failed',
        response.status,
        errorData
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError(error.message || 'Network error', 0, null);
  }
}

// ============================================================================
// OCR Processing APIs
// ============================================================================

/**
 * Upload and process receipts in batch
 * @param {File[]} files - Array of image files
 * @returns {Promise} - Processing results
 */
export async function processBatchReceipts(files) {
  const formData = new FormData();
  files.forEach(file => {
    formData.append('files', file);
  });

  return fetchAPI('/api/extract/batch', {
    method: 'POST',
    body: formData,
  });
}

/**
 * Process a single receipt
 * @param {File} file - Image file
 * @returns {Promise} - Processing result
 */
export async function processSingleReceipt(file) {
  const formData = new FormData();
  formData.append('file', file);

  return fetchAPI('/api/extract/single', {
    method: 'POST',
    body: formData,
  });
}

// ============================================================================
// Database APIs
// ============================================================================

/**
 * Save confirmed receipt data to database
 * @param {Object} receiptData - Confirmed receipt data
 * @returns {Promise} - Save result
 */
export async function saveReceipt(receiptData) {
  return fetchAPI('/api/receipts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(receiptData),
  });
}

/**
 * Check if transaction ID already exists (duplicate detection)
 * @param {string} transactionId - Transaction ID to check
 * @returns {Promise<boolean>} - True if duplicate exists
 */
export async function checkDuplicate(transactionId) {
  return fetchAPI(`/api/receipts/check-duplicate/${transactionId}`);
}

/**
 * Get all known accounts (for autocomplete)
 * @returns {Promise<Array>} - List of known accounts
 */
export async function getKnownAccounts() {
  return fetchAPI('/api/accounts/known');
}

/**
 * Search for accounts by name or number
 * @param {string} query - Search query
 * @returns {Promise<Array>} - Matching accounts
 */
export async function searchAccounts(query) {
  return fetchAPI(`/api/accounts/search?q=${encodeURIComponent(query)}`);
}

/**
 * NEW: Search for receiver names with optional to_account filtering
 * @param {string} query - Search query (receiver name)
 * @param {string} toAccount - Optional to_account to prioritize linked names
 * @returns {Promise<Array>} - Matching receiver names
 */
export async function searchReceiverNames(query, toAccount = null) {
  let url = `/api/receivers/search?q=${encodeURIComponent(query)}`;
  if (toAccount && toAccount.trim()) {
    url += `&to_account=${encodeURIComponent(toAccount)}`;
  }
  return fetchAPI(url);
}

// ============================================================================
// Query APIs
// ============================================================================

/**
 * Query transactions with filters
 * @param {Object} filters - Filter options
 * @returns {Promise<Array>} - Matching transactions
 */
export async function queryTransactions(filters = {}) {
  const params = new URLSearchParams();
  
  Object.keys(filters).forEach(key => {
    if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
      params.append(key, filters[key]);
    }
  });

  return fetchAPI(`/api/transactions?${params.toString()}`);
}

/**
 * Get transaction by ID
 * @param {string} transactionId - Transaction ID
 * @returns {Promise<Object>} - Transaction data
 */
export async function getTransactionById(transactionId) {
  return fetchAPI(`/api/transactions/${transactionId}`);
}

/**
 * Export transactions to CSV/JSON
 * @param {Object} filters - Filter options
 * @param {string} format - 'csv' or 'json'
 * @returns {Promise<Blob>} - File blob
 */
export async function exportTransactions(filters = {}, format = 'json') {
  const params = new URLSearchParams();
  
  Object.keys(filters).forEach(key => {
    if (filters[key]) params.append(key, filters[key]);
  });
  
  params.append('format', format);

  const response = await fetch(`${API_BASE_URL}/api/transactions/export?${params.toString()}`);
  
  if (!response.ok) {
    throw new APIError('Export failed', response.status, null);
  }

  return await response.blob();
}

// ============================================================================
// Statistics APIs
// ============================================================================

/**
 * Get dashboard statistics
 * @returns {Promise<Object>} - Statistics data
 */
export async function getStatistics() {
  return fetchAPI('/api/statistics');
}

// Export APIError for error handling in components
export { APIError };