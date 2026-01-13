import { BaseWidget } from "./BaseWidget";


export class App extends BaseWidget {
  static instance = null;

  constructor(rootElement, {
    className = [],
    style = {},
    props = {},
    onBeforeCreated = null,
    onCreated = null,
    onBeforeAttached = null,
    onAttached = null,
    onMounted = null,
  } = {}) {
    if (App.instance) {
      throw new Error("App is a singleton and has already been initialized");
    }

    super({
      rootElement,
      className,
      style,
      props,
      onBeforeCreated: (widget) => onBeforeCreated?.(widget),
      onCreated: (el, widget) => onCreated?.(el, widget),
      onBeforeAttached: (el, widget) => onBeforeAttached?.(el, widget),
      onAttached: (el, widget) => onAttached?.(el, {}, widget),
      onMounted: (el, widget) => onMounted?.(el, {}, widget),
    });

    this._isRootElement = true;

    // Router state
    this.routePaths = {};
    this.params = {};
    this.path = null;
    this.middlewares = [];
    this.rootElement = rootElement;
    this.notFoundComponent = null;
    this.previousComponents = [];
    this.currentLayoutStack = [];
    this.currentGroupPrefixes = [];
    this.args = {};
    this.eventHandlers = {
      routeChange: []
    };

    window.addEventListener("popstate", this.handlePopState.bind(this));

    App.instance = this;
  }

  /* ========== ROUTE CONFIGURATION METHODS ========== */

  group(path, callback) {
    this.currentGroupPrefixes.push(path);
    callback();
    this.currentGroupPrefixes.pop();
    return this;
  }

  use(middleware) {
    if (typeof middleware !== "function") {
      throw new Error("Middleware must be a function");
    }
    this.middlewares.push(middleware);
    return this;
  }

  routes(routePath, component) {
    if (!component || !(component.prototype instanceof BaseWidget)) {
      throw new Error("Route component must extend BaseWidget");
    }

    if (typeof routePath !== 'string' || !routePath.startsWith('/')) {
      throw new Error(`Invalid route path: ${routePath}. Must start with '/'`);
    }

    const path = this._combineGroupPrefixes(routePath);

    if (this.routePaths[path]) {
      console.warn(`Duplicate route definition for path: ${path}`);
    }

    this.routePaths[path] = {
      component,
      layouts: [...this.currentLayoutStack]
    };
    return this;
  }

  notFound(component) {
    if (!component || !(component.prototype instanceof BaseWidget)) {
      throw new Error("Not Found component must extend BaseWidget");
    }
    this.notFoundComponent = component;
    return this;
  }

  layout(widget, callback) {
    if (!(widget.prototype instanceof BaseWidget)) {
      throw new Error("Layout must be a class extending BaseWidget");
    }

    this.currentLayoutStack.push(widget);
    callback();
    this.currentLayoutStack.pop();
    return this;
  }

  onRouteChange(handler) {
    this.eventHandlers.routeChange.push(handler);
    return () => {
      this.eventHandlers.routeChange =
        this.eventHandlers.routeChange.filter(h => h !== handler);
    };
  }

  /* ========== NAVIGATION METHODS ========== */

  async to(path, args = {}, title = '') {
    const proceed = await this.applyMiddlewares(path);
    if (!proceed) return;

    const normalizedPath = this._normalizePath(path);
    const currentPath = window.location.pathname;

    if (normalizedPath === this._normalizePath(currentPath)) {
      history.replaceState({ args }, title, normalizedPath);
    } else {
      history.pushState({ args }, title, normalizedPath);
    }

    this.path = normalizedPath;
    this.args = args;
    document.title = title;
    this.render();
  }

  back({ args = {} } = {}) {
    this.args = args;
    window.history.back();
  }

  /* ========== ROUTE MATCHING & RENDERING ========== */

  _normalizePath(path) {
    return path === '/' ? '/' : `/${path.replace(/^\/+|\/+$/g, '')}`;
  }

  _combineGroupPrefixes(routePath) {
    const parts = [...this.currentGroupPrefixes, routePath]
      .map(part => String(part).replace(/^\/+|\/+$/g, ''))
      .filter(part => part !== '');
    return parts.length === 0 ? '/' : `/${parts.join('/')}`;
  }

  _matchRoute(path) {
    const decodedPath = decodeURIComponent(path);
    const routes = Object.entries(this.routePaths);

    // Try URLPattern first if available
    if (typeof URLPattern !== "undefined") {
      for (const [routePattern, routeDefinition] of routes) {
        try {
          const pattern = new URLPattern({ pathname: routePattern });
          const match = pattern.exec({ pathname: decodedPath });

          if (match) {
            const decodedParams = {};
            for (const [key, value] of Object.entries(match.pathname.groups || {})) {
              decodedParams[key] = decodeURIComponent(value);
            }

            return {
              component: routeDefinition,
              params: decodedParams,
              layouts: routeDefinition.layouts,
            };
          }
        } catch (error) {
          console.warn(`Skipping invalid route pattern: ${routePattern}`, error);
        }
      }
    }

    // Fallback to regex matching
    for (const [routePattern, routeDefinition] of routes) {
      const paramNames = [];
      const regexPath = routePattern.replace(/:([^/]+)/g, (_, key) => {
        paramNames.push(key);
        return "([^/]+)";
      });

      const regex = new RegExp(`^${regexPath}$`);
      const match = decodedPath.match(regex);

      if (match) {
        const params = Object.fromEntries(
          paramNames.map((name, index) => [name, decodeURIComponent(match[index + 1])])
        );
        return {
          component: routeDefinition,
          params,
          layouts: routeDefinition.layouts,
        };
      }
    }

    return { component: null, params: {}, layouts: [] };
  }

  /* ========== CORE RENDERING LOGIC ========== */

  render() {
    const previousPath = this.path;
    this.path = this._normalizePath(window.location.pathname || "/");

    this.renderRoute();
    const result = super.render();

    if (previousPath !== this.path) {
      this.eventHandlers.routeChange.forEach(handler =>
        handler({ from: previousPath, to: this.path }));
    }

    return result;
  }

  renderRoute() {
    if (!this.rootElement) {
      throw new Error("Root element not set. App needs a target DOM element.");
    }

    const match = this._matchRoute(this.path);
    this.params = match.params;
    this.previousComponents = this.children || [];
    this._cleanupPreviousComponents();

    try {
      let finalComponentToRender;
      const matchedRouteDefinition = match.component;

      if (matchedRouteDefinition) {
        const PageComponentClass = matchedRouteDefinition.component;
        const componentArgs = {
          args: { ...this.params, ...this.args },
          path: this.path
        };
        finalComponentToRender = new PageComponentClass(componentArgs);

        const reversedLayouts = [...matchedRouteDefinition.layouts].reverse();
        for (const LayoutClass of reversedLayouts) {
          const layoutInstance = new LayoutClass();
          layoutInstance.children = [finalComponentToRender];
          finalComponentToRender = layoutInstance;
        }
      } else {
        const notFoundPath = this.path;
        if (this.notFoundComponent) {
          finalComponentToRender = new this.notFoundComponent({
            args: { requestedPath: notFoundPath },
            path: notFoundPath
          });
        } else {
          finalComponentToRender = new BaseWidget({
            tagName: "div",
            className: ["app-not-found"],
            children: [
              new BaseWidget({
                tagName: "h1",
                children: ["404 - Page Not Found"]
              }),
              new BaseWidget({
                tagName: "p",
                children: [`The requested path "${notFoundPath}" was not found.`]
              })
            ]
          });
        }
      }

      this.children = [finalComponentToRender];
    } catch (error) {
      console.error("Error rendering route component:", error);
      this.children = [new BaseWidget({
        tagName: "div",
        className: ["app-render-error"],
        children: ["Error: Could not render the requested page."]
      })];
    }
  }

  /* ========== UTILITY METHODS ========== */

  async applyMiddlewares(path) {
    for (const middleware of this.middlewares) {
      try {
        const result = await middleware(path);
        if (result === false) return false;
      } catch (error) {
        console.error("Middleware error:", error);
        return false;
      }
    }
    return true;
  }

  handlePopState(event) {
    const path = window.location.pathname || '/';
    this.path = this._normalizePath(path);
    this.args = event?.state?.args || {};
    console.log(this.path)
    this.render();
  }

  _cleanupPreviousComponents() {
    this.previousComponents.forEach(component => {
      if (component && typeof component.detach === "function") {
        component.detach();
      }
    });
    this.previousComponents = [];
  }

  getSessionManager() {
    return this.state.session;
  }

  debugRoutes() {
    console.log('Registered routes:');
    Object.entries(this.routePaths).forEach(([path, def]) => {
      console.log(`- ${path} => ${def.component.name}`);
    });
  }

  onUpdate() {
    super.update.call(this);
  }
}