/**
 * Generic HTTP Client
 * Supports GET, POST, PUT, DELETE methods with configurable options
 */
export class HttpClient {
  static instance = null;
  /**
   * Create a new HttpClient instance
   * @param {Object} config - Default configuration
   * @param {string} config.baseURL - Base URL for all requests
   * @param {Object} config.defaultHeaders - Default headers
   * @param {number} config.timeout - Request timeout in ms
   * @param {Function} config.requestInterceptor - Request interceptor
   * @param {Function} config.responseInterceptor - Response interceptor
   */
  constructor({
    baseURL = '',
    defaultHeaders = {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    },
    timeout = 10000,
    requestInterceptor = null,
    responseInterceptor = null,
  } = {}) {
    // Enforce Singleton Pattern
    if (HttpClient.instance) {
      throw new Error("App is a singleton and has already been initialized");
    }

    this.baseURL = baseURL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...defaultHeaders,
    };
    this.timeout = timeout;
    this.requestInterceptor = requestInterceptor;
    this.responseInterceptor = responseInterceptor;

    // Assign the newly created instance to the static property
    HttpClient.instance = this;
  }

  /**
   * Make a GET request
   * @param {string} url - Endpoint URL
   * @param {Object} params - Query parameters
   * @param {Object} options - Additional options
   * @returns {Promise} Promise with response data
   */
  async get(url, params = {}, options = { cache: 'no-store' }) {
    return this._request({
      method: 'GET',
      url,
      params,
      ...options,
    });
  }

  /**
   * Make a POST request
   * @param {string} url - Endpoint URL
   * @param {Object} data - Request body
   * @param {Object} options - Additional options
   * @returns {Promise} Promise with response data
   */
  async post(url, data = {}, options = { cache: 'no-store' }) {
    return this._request({
      method: 'POST',
      url,
      data,
      ...options,
    });
  }

  /**
   * Make a PUT request
   * @param {string} url - Endpoint URL
   * @param {Object} data - Request body
   * @param {Object} options - Additional options
   * @returns {Promise} Promise with response data
   */
  async put(url, data = {}, options = { cache: 'no-store' }) {
    return this._request({
      method: 'PUT',
      url,
      data,
      ...options,
    });
  }

  /**
   * Make a DELETE request
   * @param {string} url - Endpoint URL
   * @param {Object} options - Additional options
   * @returns {Promise} Promise with response data
   */
  async delete(url, data = {}, options = { cache: 'no-store' }) {
    return this._request({
      method: 'DELETE',
      data,
      url,
      ...options,
    });
  }

  /**
 * Make a GET request that bypasses all caches
 * @param {string} url - Endpoint URL
 * @param {Object} params - Query parameters
 * @param {Object} options - Additional options
 * @returns {Promise} Promise with response data
 */
  async freshGet(url, params = {}, options = {}) {
    return this._request({
      method: 'GET',
      url,
      params: {
        ...params,
        _: Date.now() // Force cache bust
      },
      cache: 'reload', // Bypasses HTTP cache
      headers: {
        'Cache-Control': 'no-cache',
        ...options.headers
      },
      ...options
    });
  }

  /**
   * Make a file upload request
   * @param {string} url - Endpoint URL
   * @param {File|Blob} file - File to upload
   * @param {Object} options - Additional options
   * @param {string} options.fieldName - Field name for the file (default: 'file')
   * @param {Object} options.additionalData - Additional form data to send with the file
   * @param {Function} options.onProgress - Progress callback function
   * @returns {Promise} Promise with response data
   */
  async upload(url, file, options = {}) {
    const {
      fieldName = 'file',
      additionalData = {},
      onProgress = null,
      ...requestOptions
    } = options;

    // Create FormData and append the file
    const formData = new FormData();
    formData.append(fieldName, file);

    // Append additional data if provided
    Object.entries(additionalData).forEach(([key, value]) => {
      formData.append(key, value);
    });

    return this._request({
      method: 'POST',
      url,
      data: formData,
      headers: {
        // Let the browser set Content-Type with boundary
        'Content-Type': undefined,
        ...requestOptions.headers
      },
      onProgress,
      ...requestOptions
    });
  }

  /**
   * Internal request method (updated to support progress tracking)
   * @private
   * @param {Object} config - Request configuration
   * @returns {Promise} Promise with response data
   */
  async _request(config) {
    const {
      method,
      url,
      params = {},
      data = null,
      headers = {},
      timeout = this.timeout,
      responseType = 'json',
      signal = null,
      cache = 'no-store',
      onProgress = null // New progress callback
    } = config;

    // Build full URL with query parameters
    const fullUrl = this._buildUrl(url, params);
    const controller = new AbortController();
    const abortTimeout = setTimeout(() => controller.abort(), timeout);

    try {
      // Prepare request config
      const requestConfig = {
        method,
        headers: { ...this.defaultHeaders, ...headers },
        signal: signal || controller.signal,
        cache
      };

      // Handle FormData (don't stringify)
      if (data instanceof FormData) {
        requestConfig.body = data;
        // Remove Content-Type header to let browser set it with boundary
        delete requestConfig.headers['Content-Type'];
      }
      // Add body for methods that need it
      else if (data && method !== 'GET' && method !== 'HEAD') {
        requestConfig.body = this._stringifyData(data, headers['Content-Type']);
      }

      // Apply request interceptor if exists
      const interceptedConfig = this.requestInterceptor
        ? await this.requestInterceptor({ ...requestConfig, url: fullUrl })
        : requestConfig;

      // Make the request
      const response = await fetch(fullUrl, interceptedConfig);

      // Support progress tracking if requested
      if (onProgress && response.body) {
        const contentLength = response.headers.get('content-length');
        const total = parseInt(contentLength, 10) || 0;
        let loaded = 0;

        const reader = response.body.getReader();
        const chunks = [];

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          chunks.push(value);
          loaded += value.length;
          onProgress({ loaded, total });
        }

        // Reconstruct the response
        const blob = new Blob(chunks);
        const newResponse = new Response(blob, {
          status: response.status,
          statusText: response.statusText,
          headers: response.headers
        });

        // Clear timeout
        clearTimeout(abortTimeout);

        // Check if response is OK
        if (!newResponse.ok) {
          throw await this._createError(newResponse);
        }

        // Parse response
        const responseData = await this._parseResponse(newResponse, responseType);

        // Apply response interceptor if exists
        return this.responseInterceptor
          ? this.responseInterceptor(responseData, newResponse)
          : responseData;
      } else {
        // Clear timeout
        clearTimeout(abortTimeout);

        // Check if response is OK
        if (!response.ok) {
          throw await this._createError(response);
        }

        // Parse response
        const responseData = await this._parseResponse(response, responseType);

        // Apply response interceptor if exists
        return this.responseInterceptor
          ? this.responseInterceptor(responseData, response)
          : responseData;
      }
    } catch (error) {
      clearTimeout(abortTimeout);
      throw this._normalizeError(error);
    }
  }

  /**
   * Build full URL with query parameters
   * @private
   * @param {string} url - Endpoint URL
   * @param {Object} params - Query parameters
   * @returns {string} Full URL with query string
   */
  _buildUrl(url, params) {
    // Add cache-buster if not already in params
    const finalParams = {
      ...params,
     // _: params._ || Date.now() // Only add if not already provided
    };
    // Remove trailing slash from baseURL and leading slash from url
    const cleanBaseUrl = this.baseURL.replace(/\/+$/, '');
    const cleanUrl = url.replace(/^\/+/, '');

    // Combine base URL with endpoint URL
    const fullUrl = `${cleanBaseUrl}/${cleanUrl}`;

    // Convert params to URLSearchParams
    const queryString = new URLSearchParams();
    Object.entries(finalParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(item => queryString.append(key, item));
        } else {
          queryString.append(key, value);
        }
      }
    });

    const queryStringStr = queryString.toString();
    return queryStringStr ? `${fullUrl}?${queryStringStr}` : fullUrl;
  }

  /**
   * Stringify request data based on content type
   * @private
   * @param {Object} data - Request data
   * @param {string} contentType - Content type header
   * @returns {string|FormData} Stringified data
   */
  _stringifyData(data, contentType = 'application/json') {
    if (contentType === 'application/json') {
      return JSON.stringify(data);
    } else if (contentType === 'multipart/form-data') {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, value);
      });
      return formData;
    } else if (contentType === 'application/x-www-form-urlencoded') {
      return new URLSearchParams(data).toString();
    }
    return data;
  }

  /**
   * Parse response based on response type
   * @private
   * @param {Response} response - Fetch response object
   * @param {string} responseType - Expected response type
   * @returns {Promise} Parsed response data
   */
  async _parseResponse(response, responseType) {
    if (responseType === 'json') {
      return response.json();
    } else if (responseType === 'text') {
      return response.text();
    } else if (responseType === 'blob') {
      return response.blob();
    } else if (responseType === 'arraybuffer') {
      return response.arrayBuffer();
    } else if (responseType === 'formdata') {
      return response.formData();
    }
    return response.text();
  }

  /**
   * Create error object from response
   * @private
   * @param {Response} response - Fetch response object
   * @returns {Error} Error object with response details
   */
  async _createError(response) {
    let errorData;
    try {
      errorData = await response.json();
    } catch {
      errorData = { message: response.statusText };
    }

    const error = new Error(errorData.message || `HTTP error ${response.status}`);
    error.status = response.status;
    error.response = errorData;
    return error;
  }

  /**
   * Normalize error object
   * @private
   * @param {Error} error - Original error
   * @returns {Error} Normalized error
   */
  _normalizeError(error) {
    if (error.name === 'AbortError') {
      return new Error('Request timeout');
    }
    return error;
  }
}