import { HttpClient } from "./HttpClient";

// AuthService.js
const STORAGE_KEY = "auth_session";

export class AuthService {
    static _refreshPromise = null;

    // Login
    static async login(credentials) {
        const response = await HttpClient.instance.post("auth", credentials);

        if (response.result?.status !== "success") {
            throw new Error("As credenciais não conferem");
        }

        const session = {
            user: response.result.user,
            access_token: response.result.token,
            refresh_token: response.result.refresh_token,
            access_expires_at: Date.now() + (response.result.expires_in || 3600) * 1000,
            refresh_expires_at: Date.now() + (response.result.refresh_expires_in || 30 * 24 * 3600 * 1000),
        };

        this._saveSession(session);
        return session;
    }

    static async getValidAccessToken() {
        const session = this.getSession();
        if (!session) return null;

        const now = Date.now();
        if (now >= session.refresh_expires_at) {
            this.clearSession();
            return null;
        }

        if (now < session.access_expires_at) {
            return session.access_token;
        }

        // Need to refresh
        if (this._refreshPromise) return this._refreshPromise;

        this._refreshPromise = this._refreshAccessToken();
        try {
            await this._refreshPromise;
            return this.getSession()?.access_token || null;
        } catch {
            return null;
        } finally {
            this._refreshPromise = null;
        }
    }

    static async _refreshAccessToken() {
        const session = this.getSession();
        if (!session?.refresh_token) throw new Error("No refresh token");

        try {
            const response = await HttpClient.instance.post("auth/refresh", {
                refresh_token: session.refresh_token,
            });

            if (response.result?.status !== "success") {
                throw new Error("Refresh failed");
            }

            const updated = {
                ...session,
                access_token: response.result.token,
                refresh_token: response.result.refresh_token || session.refresh_token,
                access_expires_at: Date.now() + (response.result.expires_in || 3600) * 1000,
                refresh_expires_at: Date.now() + (response.result.refresh_expires_in || 30 * 24 * 3600 * 1000),
            };

            this._saveSession(updated);
        } catch (error) {
            this.clearSession();
            throw error;
        }
    }

    // Secure logout with server-side revocation
    static async logout() {
        const session = this.getSession();

        // Always clear local session first
        this.clearSession();

        if (!session?.refresh_token) return;

        try {
            await HttpClient.instance.post("auth/revoke", {
                refresh_token: session.refresh_token,
            });
        } catch (err) {
            console.warn("Failed to revoke token on server (still logged out locally)", err);
        }
    }

    // Helpers
    static isAuthenticated() {
        const s = this.getSession();
        return !!(s && Date.now() < s.refresh_expires_at);
    }

    static getCurrentUser() {
        return this.isAuthenticated() ? this.getSession()?.user : null;
    }

    static getToken() {
        const s = this.getSession();
        return s && Date.now() < s.access_expires_at ? s.access_token : null;
    }

    // Storage
    static getSession() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            return raw ? JSON.parse(raw) : null;
        } catch {
            this.clearSession();
            return null;
        }
    }

    static _saveSession(data) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch (e) {
            console.error("Failed to save session", e);
        }
    }

    static clearSession() {
        try {
            localStorage.removeItem(STORAGE_KEY);
        } catch (e) {
            console.error("Failed to clear session", e);
        }
    }
}