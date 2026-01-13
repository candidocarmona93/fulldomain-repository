import { setOptions, importLibrary } from '@googlemaps/js-api-loader';

const API_KEY = 'AIzaSyAOapxEBFvTxO9anSKTyW9qizS32N4-zBs';

export class GoogleMapService {
    static autocompleteService = null;
    static placesService = null;
    static geocoder = null;
    static loader = null;

    constructor(options = {}) {
        this.map = null;
        this.marker = null;
        this.options = {
            zoom: 15,
            mapTypeId: 'roadmap',
            mapId: "943534829a0eaca861346f95", // Required for AdvancedMarkerElement
            disableDefaultUI: false,
            zoomControl: true,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: true,
            ...options
        };
    }

    /**
     * Ensures the Google Maps API is loaded before any service is used.
     */
    static async ensureLibraryLoaded() {
        setOptions({
            apiKey: API_KEY,
            version: 'weekly',
            libraries: ['places', 'marker']
        });
    }

    async initMap(el, { lat = -25.9267, lng = 32.6338, title = "Location" } = {}) {
        await GoogleMapService.ensureLibraryLoaded();

        const { Map } = await importLibrary('maps');
        const { AdvancedMarkerElement } = await importLibrary('marker');
        const { places } = await importLibrary('places');

        // Initialize Map with mapId from options
        this.map = new Map(el, this.options);
        this.map.setCenter({ lat, lng });

        this.marker = new AdvancedMarkerElement({
            map: this.map,
            position: { lat, lng },
            title: title,
            gmpDraggable: true // Enables dragging for the advanced marker
        });

        // Initialize static services if not already done
        if (!GoogleMapService.autocompleteService) {
            GoogleMapService.autocompleteService = places.AutocompleteService();
        }
        if (!GoogleMapService.placesService) {
            GoogleMapService.placesService = PlacesService(this.map);
        }
        if (!GoogleMapService.geocoder) {
            GoogleMapService.geocoder = new google.maps.Geocoder();
        }

        return { map: this.map, marker: this.marker };
    }

    static async search(query, options = {}) {
        await this.ensureLibraryLoaded();

        const {
            countryCode = 'mz',
            limit = 5,
            types = ['geocode', 'establishment']
        } = options;

        if (!this.autocompleteService) {
            this.autocompleteService = new google.maps.places.AutocompleteService();
        }

        return new Promise((resolve) => {
            const request = {
                input: query,
                types: types,
                componentRestrictions: { country: countryCode },
            };

            this.autocompleteService.getPlacePredictions(request, (predictions, status) => {
                if (status !== google.maps.places.PlacesServiceStatus.OK || !predictions) {
                    resolve([]);
                    return;
                }

                // Limit predictions to prevent over-billing on Detail requests
                const limitedPredictions = predictions.slice(0, limit);
                const detailsPromises = limitedPredictions.map(p => this.getPlaceDetails(p.place_id));

                Promise.all(detailsPromises).then(results => {
                    resolve(results.filter(r => r !== null));
                });
            });
        });
    }

    static async getPlaceDetails(placeId) {
        // Requires a dummy element if initMap hasn't been called yet
        if (!this.placesService) {
            const dummyDiv = document.createElement('div');
            this.placesService = new google.maps.places.PlacesService(dummyDiv);
        }

        return new Promise((resolve) => {
            this.placesService.getDetails({
                placeId: placeId,
                fields: ['name', 'formatted_address', 'geometry', 'place_id']
            }, (place, status) => {
                if (status === google.maps.places.PlacesServiceStatus.OK) {
                    resolve({
                        name: place.name,
                        address: place.formatted_address,
                        lat: place.geometry.location.lat(),
                        lng: place.geometry.location.lng(),
                        place_id: place.place_id
                    });
                } else {
                    resolve(null);
                }
            });
        });
    }
}