export class NavigationService {
    /**
     * Open navigation app with coordinates
     * @param {number} latitude 
     * @param {number} longitude 
     * @param {string} destinationName 
     * @param {string} mode - 'driving', 'walking', 'transit', 'bicycling'
     */
    static openNavigation({ startLat, startLng, latitude, longitude, destinationName = "", mode = "driving" } = {}) {
        if (!latitude || !longitude) {
            console.error("Coordinates are required");
            return false;
        }

        // Clean coordinates
        const lat = parseFloat(latitude).toFixed(6);
        const lng = parseFloat(longitude).toFixed(6);

        // Google Maps URL with options
        let url = `https://www.google.com/maps/dir/?api=1`;
        url += `&destination=${lat},${lng}`;
        url += `&travelmode=${mode}`;

        if (startLat && startLng) {
            url += `&origin=${startLat},${startLng}`
        }

        if (destinationName) {
            url += `&destination_place_id=${encodeURIComponent(destinationName)}`;
        }

        // Try to detect if it's a mobile device
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

        if (isMobile) {
            // For mobile, try to open in Google Maps app first
            const mapsAppUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=${mode}`;
            window.location.href = mapsAppUrl;
        } else {
            // For desktop, open in new tab
            window.open(url, '_blank', 'noopener,noreferrer');
        }

        return true;
    }

    /**
     * Open Waze navigation (if installed)
     */
    static openWazeNavigation(latitude, longitude) {
        const url = `https://waze.com/ul?ll=${latitude},${longitude}&navigate=yes`;
        window.open(url, '_blank');
    }

    /**
     * Open Apple Maps (for iOS devices)
     */
    static openAppleMapsNavigation(latitude, longitude, destinationName = "") {
        const url = `https://maps.apple.com/?daddr=${latitude},${longitude}&dirflg=d`;
        window.open(url, '_blank');
    }

    /**
     * Get current location and navigate to destination
     */
    static async navigateFromCurrentLocation(latitude, longitude, destinationName) {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const startLat = position.coords.latitude;
                    const startLng = position.coords.longitude;

                    // Create route from current location to destination
                    this.openNavigation({ startLat, startLng, latitude, longitude, destinationName });
                },
                (error) => {
                    console.error("Error getting location:", error);
                    // Fallback to just destination

                }
            );
        } else {
            // Geolocation not supported, use destination only
            this.openNavigation({ latitude, longitude });
        }
    }
}