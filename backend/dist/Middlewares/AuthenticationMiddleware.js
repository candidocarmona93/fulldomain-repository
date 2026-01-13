// middleware/AuthenticationMiddleware.js
import { AuthService } from "../Services/AuthService";

function AuthenticationMiddleware(app) {
  return async (path) => {
    const session = AuthService.getSession();
    const isAuthenticated = AuthService.isAuthenticated();

    // Parse user permissions (your format: JSON string of booleans)
    let userPerms = {};
    if (session?.user?.permissions) {
      try {
        userPerms = typeof session.user.permissions === "string"
          ? JSON.parse(session.user.permissions)
          : session.user.permissions;
      } catch (e) {
        console.warn("Failed to parse permissions", e);
      }
    }

    // Helper: check if user has a specific permission
    const can = (permission) => !!userPerms[permission];

    // 1. Public routes (always allowed)
    const publicRoutes = [
      "/auth",
      "/login",
      "/recover-password",
      "/reset-password",
      "/not-found",
      "/error",
    ];

    if (publicRoutes.includes(path)) {
      if (isAuthenticated) {
        await app.to("/");
        return false;
      }
      return true;
    }

    // 2. Must be authenticated
    if (!isAuthenticated) {
      localStorage.setItem("redirect_after_login", path);
      await app.to("/auth");
      return false;
    }

    // 3. Route → Required Permission Map
    const routePermissions = {
      // Dashboard & General
      "/": [], // everyone logged in can access dashboard

      // Properties Module
      "/properties": ["general_info"],
      "/properties/save": ["general_info"],
      "/properties/save/:propertyId": ["general_info"],
      "/properties/:propertyId": ["general_info"],

      // Activities → Tasks
      "/activities/tasks": ["manage_tasks"],
      "/activities/tasks/save/:taskId": ["manage_tasks"],
      "/activities/tasks/:taskId": ["manage_tasks"],

      // Activities → Visits
      "/activities/visits": ["manage_visits"],
      "/activities/visits/save/:visitId": ["manage_visits"],

      // Configurations (Admin Area)
      "/configurations": [], // base config page

      "/configurations/users": ["manage_users"],
      "/configurations/owners": ["manage_owners"],
      "/configurations/agents": ["manage_agents"],
      "/configurations/clients": ["manage_clients"],
      "/configurations/categories": ["manage_categories"],
      "/configurations/property-features": ["manage_features"],
      "/configurations/finalities": ["manage_finalities"],
      "/configurations/neighborhoods": ["manage_neighborhoods"],
      "/configurations/roles": ["manage_users"], // roles usually require user management
    };

    // Find the most specific matching route
    let requiredPerm = null;
    for (const [routePattern, perms] of Object.entries(routePermissions)) {
      // Convert pattern to regex (e.g. "/properties/:propertyId" → /^\/properties\/[^/]+$/)
      const regex = new RegExp(
        "^" + routePattern.replace(/:[^/]+/g, "[^/]+") + "$"
      );

      if (regex.test(path)) {
        requiredPerm = perms[0]; // we only use one main permission per module
        break;
      }
    }

    // If route requires permission and user doesn't have it
    if (requiredPerm && !can(requiredPerm)) {
      localStorage.setItem("last_attempted_path", path);
      await app.to("/unauthorized");
      return false;
    }

    // All good!
    return true;
  };
}

export { AuthenticationMiddleware };