// MapService.js
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-control-geocoder/dist/Control.Geocoder.css';
import 'leaflet-control-geocoder';

// Configure default icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Tile layer configurations
const TILE_LAYERS = {
    osm: {
        url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        attribution: '© OpenStreetMap contributors'
    },
    stadia: {
        url: 'https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png',
        attribution: '© Stadia Maps © OpenMapTiles © OpenStreetMap'
    },
    opentopo: {
        url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
        attribution: '© OpenStreetMap contributors, SRTM'
    },
    cycle: {
        url: 'https://{s}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png',
        attribution: '© OpenStreetMap contributors, CyclOSM'
    },
    dark: {
        url: 'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png',
        attribution: '© Stadia Maps © OpenMapTiles © OpenStreetMap'
    }
};

// Inside MapService.js — replace the NominatimService class

class NominatimService {
    // Keep a single controller to abort previous requests
    static controller = null;

    static async search(query, countryCode = 'mz', limit = 10) {
        // Cancel any ongoing request
        if (this.controller) {
            this.controller.abort();
        }

        // Create new controller for this request
        this.controller = new AbortController();
        const { signal } = this.controller;

        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=${countryCode}&limit=${limit}&addressdetails=1`,
                { signal } // Pass the signal to fetch
            );

            // If aborted, fetch will throw AbortError — we catch it below
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();

            // In NominatimService.search() — add this fallback
            if (data.length === 0) {
                // Try Photon as fallback
                const photonResp = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(query + ", Moçambique")}&limit=5`);
                const photonData = await photonResp.json();
                return photonData.features?.map(f => ({
                    display_name: f.properties.name || f.properties.street || f.properties.display_name || query,
                    lat: f.geometry.coordinates[1],
                    lon: f.geometry.coordinates[0]
                })) || [];
            }
            return data;
        } catch (error) {
            // Only re-throw if it's NOT an abort error
            if (error.name === 'AbortError') {
                console.log('Search request was cancelled (new one started)');
                return null; // Silently ignore cancelled requests
            }

            console.error('Geocoding search failed:', error);
            throw error;
        }
    }

    static async reverseGeocode(lat, lng, countryCode = 'mz') {
        if (this.controller) {
            this.controller.abort();
        }
        this.controller = new AbortController();
        const { signal } = this.controller;

        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&countrycodes=${countryCode}`,
                { signal }
            );

            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return await response.json();
        } catch (error) {
            if (error.name === 'AbortError') {
                return null;
            }
            console.error('Reverse geocoding failed:', error);
            throw error;
        }
    }

    // Optional: Manual cancel method (if you ever need it)
    static cancel() {
        if (this.controller) {
            this.controller.abort();
            this.controller = null;
        }
    }
}

export class MapService {
    constructor() {
        this.map = null;
        this.markers = new Map();
        this.activeMarker = null;
        this.eventHandlers = new Map();
    }

    /**
     * Initialize map
     * @param {HTMLElement} element - Container element
     * @param {Object} options - Map options
     */
    static initMap(element, options = {}) {
        const defaultOptions = {
            center: { lat: -18.665695, lng: 35.529562 },
            zoom: 16,
            showMarker: true,
            popup: null,
            tileLayer: 'osm',
            geocoder: false,
            scrollWheelZoom: true,
            countryCode: "MZ",
            maxZoom: 20,
            minZoom: 3,
            tap: true
        };

        const config = { ...defaultOptions, ...options };

        if (typeof element === 'string') {
            element = document.querySelector(element);
        }

        if (!element) {
            throw new Error('Map container not found');
        }

        // Initialize map
        const map = L.map(element, {
            scrollWheelZoom: config.scrollWheelZoom,
            tap: config.tap,
            maxZoom: config.maxZoom,
            minZoom: config.minZoom
        }).setView([config.center.lat, config.center.lng], config.zoom);

        // Add tile layer
        const tileConfig = TILE_LAYERS[config.tileLayer] || TILE_LAYERS.osm;
        L.tileLayer(tileConfig.url, {
            attribution: tileConfig.attribution,
            maxZoom: config.maxZoom
        }).addTo(map);

        let mainMarker = null;

        // Add main marker if requested
        if (config.showMarker) {
            mainMarker = L.marker([config.center.lat, config.center.lng], {
                draggable: true,
                autoPan: true
            }).addTo(map);

            if (config.popup) {
                mainMarker.bindPopup(config.popup).openPopup();
            }
        }

        // Add geocoder control
        if (config.geocoder) {
            const geocoder = L.Control.geocoder({
                defaultMarkGeocode: true,
                placeholder: 'Pesquisar em Moçambique...',
                errorMessage: 'Nada encontrado',
                geocoder: L.Control.Geocoder.nominatim(),
                collapsed: false,
                expand: 'touch',
                queryOptions: {
                    countrycodes: config.countryCode.toLowerCase(),
                    bounded: 1,
                    viewbox: [30.217, -26.742, 40.842, -10.317] // Mozambique bounds
                },
                suggestMinLength: 3,
                suggestTimeout: 250
            });

            geocoder.on('markgeocode', function (e) {
                const { center, bbox, name } = e.geocode;

                if (mainMarker) {
                    map.removeLayer(mainMarker);
                }

                mainMarker = L.marker(center, {
                    draggable: true,
                    autoPan: true
                })
                    .addTo(map)
                    .bindPopup(`<b>${name}</b>`)
                    .openPopup();

                const bounds = bbox ? L.latLngBounds(bbox) : L.latLngBounds([center, center]);
                map.fitBounds(bounds, {
                    padding: [50, 50],
                    maxZoom: 16
                });
            });

            geocoder.addTo(map);
        }

        // Fix map size
        setTimeout(() => map.invalidateSize(), 100);

        // Store references
        element._leafletMap = map;
        element._mainMarker = mainMarker;
        element._mapInstance = new MapService();
        element._mapInstance.map = map;
        element._mapInstance.activeMarker = mainMarker;

        return map;
    }

    /**
     * Create a new marker
     * @param {Object} latlng - Latitude and longitude
     * @param {string} popup - Popup content
     * @param {Object} options - Marker options
     * @returns {L.Marker} Created marker
     */
    addMarker(latlng, popup = '', options = {}) {
        const defaultOptions = {
            draggable: false,
            autoPan: true,
            ...options
        };

        const marker = L.marker(latlng, defaultOptions).addTo(this.map);

        if (popup) {
            marker.bindPopup(popup);
        }

        const markerId = `marker_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        this.markers.set(markerId, marker);

        return { id: markerId, marker };
    }

    /**
     * Update active marker position and popup
     * @param {Object} latlng - New position
     * @param {string} popupContent - New popup content
     */
    updateActiveMarker(latlng, popupContent = '') {
        if (!this.activeMarker) {
            console.warn('No active marker to update');
            return;
        }

        this.activeMarker.setLatLng(latlng);

        if (popupContent) {
            this.activeMarker.setPopupContent(popupContent);
            if (!this.activeMarker.isPopupOpen()) {
                this.activeMarker.openPopup();
            }
        }
    }

    /**
     * Set map view
     * @param {Object} latlng - Center coordinates
     * @param {number} zoom - Zoom level
     */
    setView(latlng, zoom = 14) {
        this.map.setView(latlng, zoom);
    }

    /**
     * Fit bounds to markers
     * @param {Array} markers - Array of markers
     * @param {Object} options - Fit bounds options
     */
    fitToMarkers(markers = [], options = {}) {
        const defaultOptions = {
            padding: [50, 50],
            maxZoom: 14
        };

        const bounds = L.latLngBounds(markers.map(m => m.getLatLng()));
        this.map.fitBounds(bounds, { ...defaultOptions, ...options });
    }

    /**
     * Clear all markers
     */
    clearMarkers() {
        this.markers.forEach(marker => {
            this.map.removeLayer(marker);
        });
        this.markers.clear();
    }

    /**
     * Add event listener
     * @param {string} event - Event name
     * @param {Function} handler - Event handler
     */
    on(event, handler) {
        if (!this.eventHandlers.has(event)) {
            this.eventHandlers.set(event, []);
        }
        this.eventHandlers.get(event).push(handler);
        this.map.on(event, handler);
    }

    /**
     * Remove event listener
     * @param {string} event - Event name
     * @param {Function} handler - Event handler to remove
     */
    off(event, handler) {
        if (this.eventHandlers.has(event)) {
            const handlers = this.eventHandlers.get(event);
            const index = handlers.indexOf(handler);
            if (index > -1) {
                handlers.splice(index, 1);
                this.map.off(event, handler);
            }
        }
    }

    /**
     * Get current center coordinates
     * @returns {Object} Center coordinates
     */
    getCenter() {
        return this.map.getCenter();
    }

    /**
     * Get current zoom level
     * @returns {number} Zoom level
     */
    getZoom() {
        return this.map.getZoom();
    }

    /**
     * Remove map from DOM
     */
    destroy() {
        if (this.map) {
            this.clearMarkers();
            this.eventHandlers.clear();
            this.map.remove();
            this.map = null;
            this.activeMarker = null;
        }
    }

    // Static methods for backward compatibility
    static addMarker(map, latlng, popup) {
        return L.marker(latlng).addTo(map).bindPopup(popup || '');
    }

    static destroy(map) {
        if (map) map.remove();
    }

    /**
 * Move the main marker to new coordinates and center the map
 * Works with the marker created by initMap(..., { showMarker: true })
 *
 * @param {HTMLElement} container - The container element passed to initMap()
 * @param {number} lat
 * @param {number} lng
 * @param {string} popupContent - Optional popup text
 * @param {Object} options - { zoom: 16, animate: true }
 */
    static setMainMarkerPosition(container, lat, lng, popupContent = '', options = {}) {
        if (!container || !container._leafletMap || !container._mainMarker) {
            console.warn('Map or main marker not initialized on this container');
            return;
        }

        const map = container._leafletMap;
        const marker = container._mainMarker;

        const latLng = L.latLng(lat, lng);

        // Update marker
        marker.setLatLng(latLng);

        if (popupContent) {
            if (marker.getPopup()) {
                marker.setPopupContent(popupContent);
            } else {
                marker.bindPopup(popupContent);
            }
            marker.openPopup();
        }

        // Center map
        const zoom = options.zoom ?? 16;
        const animate = options.animate ?? true;
        map.setView(latLng, zoom, { animate });
    }
}

export { NominatimService };