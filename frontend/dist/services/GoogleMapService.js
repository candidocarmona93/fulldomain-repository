import { setOptions, importLibrary } from '@googlemaps/js-api-loader';

const API_KEY = 'AIzaSyAOapxEBFvTxO9anSKTyW9qizS32N4-zBs';

export class GoogleMapService {
    static controller = null;
    static autocompleteService = null;
    static placesService = null;
    static geocoder = null;

    constructor(options = {}) {
        this.map = null;
        this.marker = null;
        this.autocomplete = null;
        this.options = {
            zoom: 15,
            mapTypeId: 'roadmap',
            mapId: "943534829a0eaca861346f95",
            disableDefaultUI: false,
            zoomControl: true,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: true,
            ...options
        };
    }

    async initMap(el, { lat = -25.92673866891844, lng = 32.63380311779625, title = "Casa coimbra maputo" } = {}) {
        setOptions({
            key: API_KEY,
            v: 'weekly',
        });

        const [{ Map }, { AdvancedMarkerElement }] = await Promise.all([
            google.maps.importLibrary('maps'),
            google.maps.importLibrary('marker'),
        ]);

        this.map = new Map(el, this.options);
        this.map.setCenter({ lat, lng });

        this.marker = new AdvancedMarkerElement({
            map: this.map,
            position: { lat, lng },
            title,
        });

        return {
            map: this.map,
            marker: this.marker,
        };
    }

    static async search(query, options = {}) {
        const {
            countryCode = 'mz',
            limit = 10,
            location = null,
            radius = 50000,
            types = ['geocode', 'establishment']
        } = options;

        if (!this.autocompleteService) {
            throw new Error('GoogleMapService not initialized. Call initMap first.');
        }

        if (this.controller) {
            this.controller.abort();
            this.controller = null;
        }

        return new Promise((resolve, reject) => {
            const request = {
                input: query,
                types: types,
                componentRestrictions: countryCode ? { country: countryCode } : undefined,
            };

            if (location) {
                request.location = new google.maps.LatLng(location.lat, location.lng);
                request.radius = radius;
                request.strictBounds = false;
            }

            this.autocompleteService.getPlacePredictions(request, (predictions, status) => {
                if (status !== google.maps.places.PlacesServiceStatus.OK || !predictions) {
                    resolve([]);
                    return;
                }

                const limitedPredictions = predictions.slice(0, limit);
                const placeDetailsPromises = limitedPredictions.map(prediction =>
                    this.getPlaceDetails(prediction.place_id)
                );

                Promise.all(placeDetailsPromises)
                    .then(details => {
                        const results = details.filter(detail => detail !== null);
                        resolve(results);
                    })
                    .catch(error => {
                        console.error('Error fetching place details:', error);
                        resolve(limitedPredictions);
                    });
            });
        });
    }

    static async getPlaceDetails(placeId) {
        return new Promise((resolve, reject) => {
            this.placesService.getDetails({
                placeId: placeId,
                fields: [
                    'name',
                    'formatted_address',
                    'geometry',
                    'place_id',
                    'types',
                    'address_components'
                ]
            }, (place, status) => {
                if (status === google.maps.places.PlacesServiceStatus.OK) {
                    resolve({
                        name: place.name,
                        address: place.formatted_address,
                        lat: place.geometry.location.lat(),
                        lng: place.geometry.location.lng(),
                        place_id: place.place_id,
                        types: place.types,
                        address_components: place.address_components
                    });
                } else {
                    resolve(null);
                }
            });
        });
    }

    static async geocode(lat, lng) {
        if (!this.geocoder) {
            throw new Error('GoogleMapService not initialized. Call initMap first.');
        }

        return new Promise((resolve, reject) => {
            this.geocoder.geocode({ location: { lat, lng } }, (results, status) => {
                if (status === 'OK' && results[0]) {
                    resolve(results[0]);
                } else {
                    reject(new Error('Geocoder failed due to: ' + status));
                }
            });
        });
    }

    static async reverseGeocode(address) {
        if (!this.geocoder) {
            throw new Error('GoogleMapService not initialized. Call initMap first.');
        }

        return new Promise((resolve, reject) => {
            this.geocoder.geocode({ address }, (results, status) => {
                if (status === 'OK' && results[0]) {
                    resolve({
                        address: results[0].formatted_address,
                        lat: results[0].geometry.location.lat(),
                        lng: results[0].geometry.location.lng(),
                        place_id: results[0].place_id,
                        types: results[0].types,
                        address_components: results[0].address_components
                    });
                } else {
                    reject(new Error('Geocoder failed due to: ' + status));
                }
            });
        });
    }
}