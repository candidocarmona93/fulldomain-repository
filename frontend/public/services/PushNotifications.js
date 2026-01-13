import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { FirebaseAppInstance } from "./FirebaseAppInstance";

export class PushNotifications {
    static async execute() {
        if (!('Notification' in window)) {
            console.log('This browser does not support notifications');
            return null;
        }

        if (!('serviceWorker' in navigator)) {
            console.log('This browser does not support service workers');
            return null;
        }

        // Check current permission first
        if (Notification.permission === 'granted') {
            console.log('Notification permission already granted');
            return await this.registerServiceWorker();
        }
        
        if (Notification.permission === 'denied') {
            console.log('Notification permission previously denied. User must manually enable it in browser settings.');
            return null;
        }

        // Request permission
        try {
            const permission = await Notification.requestPermission();
            console.log('Permission result:', permission);
            
            if (permission !== 'granted') {
                console.log('Notification permission denied');
                return null;
            }
            
            console.log('Notification permission granted');
            return await this.registerServiceWorker();
            
        } catch (error) {
            console.error('Error requesting notification permission:', error);
            return null;
        }
    }

    static async registerServiceWorker() {
        try {
            console.log('Registering service worker...');
            
            // Register service worker
            const registration = await navigator.serviceWorker.register('/push-notification-worker.js');
            
            console.log('Service Worker registered with scope:', registration.scope);
            
            // Wait for service worker to be ready
            if (registration.installing) {
                console.log('Service worker installing');
            } else if (registration.waiting) {
                console.log('Service worker installed');
            } else if (registration.active) {
                console.log('Service worker active');
            }
            
            // Initialize Firebase Messaging
            return await this.initializeMessaging(registration);
            
        } catch (error) {
            console.error('Service worker registration failed:', error);
            return null;
        }
    }

    static async initializeMessaging(registration) {
        try {
            const app = new FirebaseAppInstance().getApp();
            const messaging = getMessaging(app);
            
            onMessage(messaging, (payload) => {
                if (payload.notification) {
                    const { title, body } = payload.notification;
                    new Notification(title, {
                        body: body,
                    });
                }
            });
            
            const currentToken = await getToken(messaging, {
                serviceWorkerRegistration: registration,
                vapidKey: 'BNMbKJK8dQm7D8XtMpAOW686hLbZY6l2rgKvdT_eQ8POuh2kO1i4PzpAnAmidadEH3Q48NzlHbLF1qove0zPTNQ'
            });
            
            if (currentToken) {
                console.log('FCM Token:', currentToken);
                return currentToken;
            } else {
                console.log('No registration token available. Request permission to generate one.');
                return null;
            }
            
        } catch (error) {
            console.error('Error getting FCM token:', error);
            return null;
        }
    }

    static async sendTokenToServer(token) {
        try {
            const response = await fetch('/api/save-fcm-token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token })
            });
            
            if (response.ok) {
                console.log('Token sent to server successfully');
            } else {
                console.error('Failed to send token to server');
            }
        } catch (error) {
            console.error('Error sending token to server:', error);
        }
    }

    // Utility function to check if notifications are supported and permitted
    static isSupported() {
        return 'Notification' in window && 
               'serviceWorker' in navigator && 
               'PushManager' in window;
    }

    // Utility function to get current permission status
    static getPermissionStatus() {
        return Notification.permission;
    }
}