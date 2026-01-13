import { BaseWidget } from "./BaseWidget";

export class Router {
  /**
   * Initializes the router with empty state.
   */
  constructor() {
    this.routePaths = {};
    this.middlewares = [];
    this.notFoundComponent = null;
    this.currentLayoutStack = [];
    this.currentGroupPrefixes = [];
    this.eventHandlers = { routeChange: [] };
    this.path = null;
    this.params = {};
    this.queryParams = {};
    this.args = {};
    this._supportsURLPattern = typeof URLPattern !== 'undefined';
  }

  /**
   * Groups routes under a common path prefix.
   * @param {string} path - The path prefix for the group.
   * @param {Function} callback - Callback to define routes within the group.
   * @returns {this} The Router instance for chaining.
   */
  group(path, callback) {
    if (typeof path !== 'string' || !path) {
      throw new Error('Group path must be a non-empty string');
    }
    this.currentGroupPrefixes.push(this._sanitizePath(path));
    callback();
    this.currentGroupPrefixes.pop();
    return this;
  }

  /**
   * Registers a middleware function.
   * @param {Function} middleware - Middleware function that takes a path and returns a boolean or Promise<boolean>.
   * @returns {this} The Router instance for chaining.
   */
  use(middleware) {
    if (typeof middleware !== 'function') {
      throw new Error('Middleware must be a function');
    }
    this.middlewares.push(middleware);
    return this;
  }

  /**
   * Defines a route with a path and component.
   * @param {string} routePath - The URL path for the route (must start with '/').
   * @param {typeof BaseWidget} component - The component to render for this route.
   * @param {Object} [options] - Additional options.
   * @param {boolean} [options.allowDuplicate=false] - Whether to allow duplicate routes.
   * @returns {this} The Router instance for chaining.
   * @throws {Error} If routePath is invalid or component is not a BaseWidget.
   */
  routes(routePath, component, options = { allowDuplicate: false }) {
    if (!component || !(component.prototype instanceof BaseWidget)) {
      throw new Error('Route component must extend BaseWidget');
    }
    if (typeof routePath !== 'string' || !routePath.startsWith('/')) {
      throw new Error(`Invalid route path: ${routePath}. Must start with '/'`);
    }

    const path = this._combineGroupPrefixes(routePath);
    if (this.routePaths[path] && !options.allowDuplicate) {
      throw new Error(`Duplicate route definition for path: ${path}`);
    }

    // Precompile pattern for optimization
    const pattern = this._supportsURLPattern
      ? new URLPattern({ pathname: path })
      : this._createRegexPattern(path);

    this.routePaths[path] = {
      component,
      layouts: [...this.currentLayoutStack],
      pattern,
    };

    console.log(this.routePaths)
    return this;
  }

  /**
   * Sets the component for unmatched routes.
   * @param {typeof BaseWidget} component - The 404 component.
   * @returns {this} The Router instance for chaining.
   */
  notFound(component) {
    if (!component || !(component.prototype instanceof BaseWidget)) {
      throw new Error('Not Found component must extend BaseWidget');
    }
    this.notFoundComponent = component;
    return this;
  }

  /**
   * Defines a layout for routes.
   * @param {typeof BaseWidget} widget - The layout component.
   * @param {Function} callback - Callback to define routes within the layout.
   * @returns {this} The Router instance for chaining.
   */
  layout(widget, callback) {
    if (!(widget.prototype instanceof BaseWidget)) {
      throw new Error('Layout must be a class extending BaseWidget');
    }
    this.currentLayoutStack.push(widget);
    callback();
    this.currentLayoutStack.pop();
    return this;
  }

  /**
   * Registers a route change handler.
   * @param {Function} handler - Function to call on route change.
   * @returns {Function} Unsubscribe function.
   */
  onRouteChange(handler) {
    this.eventHandlers.routeChange.push(handler);
    return () => {
      this.eventHandlers.routeChange = this.eventHandlers.routeChange.filter(h => h !== handler);
    };
  }

  /**
   * Navigates to a new path.
   * @param {string} path - The target path.
   * @param {Object} [args={}] - Arguments to pass to the component.
   * @param {string} [title=''] - Page title.
   * @returns {Promise<void>}
   */
  async to(path, args = {}, title = '') {
    const sanitizedPath = this._sanitizePath(path);
    const normalizedPath = this._normalizePath(sanitizedPath);
    const proceed = await this.applyMiddlewares(normalizedPath);
    if (!proceed) {
      this._navigateToError('Navigation blocked by middleware');
      return;
    }

    const currentPath = window.location.pathname;
    if (normalizedPath === this._normalizePath(currentPath)) {
      history.replaceState({ args }, title, normalizedPath);
    } else {
      history.pushState({ args }, title, normalizedPath);
    }

    this.path = normalizedPath;
    this.args = args;
    document.title = title;
  }

  /**
   * Navigates back in history.
   * @param {Object} [options] - Navigation options.
   * @param {Object} [options.args={}] - Arguments to pass.
   */
  back({ args = {} } = {}) {
    this.args = args;
    window.history.back();
  }

  /**
   * Matches a path to a route.
   * @param {string} path - The path to match.
   * @returns {Object} Route match details.
   */
  _matchRoute(path) {
    if (!path) {
      return { component: null, params: {}, queryParams: {}, layouts: [] };
    }

    const url = new URL(path, window.location.origin);
    const decodedPath = decodeURIComponent(url.pathname);
    const queryParams = Object.fromEntries(url.searchParams);
    const routes = Object.entries(this.routePaths);

    if (this._supportsURLPattern) {
      for (const [routePattern, routeDefinition] of routes) {
        try {
          const match = routeDefinition.pattern.exec({ pathname: decodedPath });
          if (match) {
            const params = {};
            for (const [key, value] of Object.entries(match.pathname.groups || {})) {
              params[key] = decodeURIComponent(value);
            }
            return {
              component: routeDefinition,
              params,
              queryParams,
              layouts: routeDefinition.layouts,
            };
          }
        } catch (error) {
          console.warn(`Skipping invalid route pattern: ${routePattern}`, error);
        }
      }
    } else {
      for (const [routePattern, routeDefinition] of routes) {
        const match = decodedPath.match(routeDefinition.pattern.regex);
        if (match) {
          const params = Object.fromEntries(
            routeDefinition.pattern.paramNames.map((name, index) => [
              name,
              decodeURIComponent(match[index + 1]),
            ])
          );
          return {
            component: routeDefinition,
            params,
            queryParams,
            layouts: routeDefinition.layouts,
          };
        }
      }
    }

    return { component: null, params: {}, queryParams, layouts: [] };
  }

  /**
   * Applies middleware to a path.
   * @param {string} path - The path to check.
   * @returns {Promise<boolean>} Whether navigation should proceed.
   */
  async applyMiddlewares(path) {
    for (const middleware of this.middlewares) {
      try {
        const result = await Promise.resolve(middleware(path));
        if (typeof result !== 'boolean') {
          throw new Error('Middleware must return a boolean');
        }
        if (result === false) {
          this._navigateToError('Navigation blocked by middleware');
          return false;
        }
      } catch (error) {
        console.error('Middleware error:', error);
        this._navigateToError(error.message);
        return false;
      }
    }
    return true;
  }

  /**
   * Normalizes a path to ensure it starts with '/' and has no trailing slashes.
   * @param {string} path - The path to normalize.
   * @returns {string} Normalized path.
   */
  _normalizePath(path) {
    if (!path || typeof path !== 'string') {
      throw new Error('Path must be a non-empty string');
    }
    return path === '/' ? '/' : `/${path.replace(/^\/+|\/+$/g, '')}`;
  }

  /**
   * Sanitizes a path to prevent XSS.
   * @param {string} path - The path to sanitize.
   * @returns {string} Sanitized path.
   */
  _sanitizePath(path) {
    if (!path || typeof path !== 'string') return '/';
    return path.replace(/[<>]/g, '');
  }

  /**
   * Combines group prefixes with a route path.
   * @param {string} routePath - The route path.
   * @returns {string} Combined path.
   */
  _combineGroupPrefixes(routePath) {
    const parts = [...this.currentGroupPrefixes, routePath]
      .map(part => String(part).replace(/^\/+|\/+$/g, ''))
      .filter(Boolean);
    return `/${parts.join('/')}` || '/';
  }

  /**
   * Creates a regex pattern for route matching (fallback).
   * @param {string} routePattern - The route pattern.
   * @returns {Object} Regex and param names.
   */
  _createRegexPattern(routePattern) {
    const paramNames = [];
    const regexPath = routePattern.replace(/:([^/]+)/g, (_, key) => {
      paramNames.push(key);
      return '([^/]+)';
    });
    return { regex: new RegExp(`^${regexPath}$`), paramNames };
  }

  /**
   * Navigates to an error page.
   * @param {string} message - Error message.
   */
  _navigateToError(message) {
    this.to('/error', { message }, 'Error');
  }

  /**
   * Logs registered routes for debugging.
   */
  debugRoutes(verbose = false) {
    console.log('Registered routes:');
    Object.entries(this.routePaths).forEach(([path, def]) => {
      console.log(`- ${path} => ${def.component.name}`);
      if (verbose) {
        console.log(`  Layouts: ${def.layouts.map(l => l.name).join(', ')}`);
      }
    });
    if (verbose) {
      console.log('Middlewares:', this.middlewares.map(m => m.name || 'anonymous'));
      console.log('Current path:', this.path);
    }
  }
}