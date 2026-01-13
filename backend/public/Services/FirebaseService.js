import { initializeApp } from 'firebase/app';
import {
    getMessaging,
    getToken,
    onMessage,
    deleteToken,
    isSupported
} from 'firebase/messaging';

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBVfX31YX0f_DLiXyAewAk7fdr1A60zXC4",
    authDomain: "casa-coimbra-maputo.firebaseapp.com",
    databaseURL: "https://casa-coimbra-maputo.firebaseio.com",
    projectId: "casa-coimbra-maputo",
    storageBucket: "casa-coimbra-maputo.firebasestorage.app",
    messagingSenderId: "295984447698",
    appId: "1:295984447698:web:ec9008bdfa1516c8af2d0b",
    measurementId: "G-0WX92WQ9M8"
};

const vapidKey = "BNMbKJK8dQm7D8XtMpAOW686hLbZY6l2rgKvdT_eQ8POuh2kO1i4PzpAnAmidadEH3Q48NzlHbLF1qove0zPTNQ";

export class FirebaseService {
    constructor() {
        const app = initializeApp(firebaseConfig);
        const messaging = getMessaging(app);
        getToken(messaging, { vapidKey }).then((currentToken) => {
            if (currentToken) {
                // Send the token to your server and update the UI if necessary
                console.log(currentToken)
            } else {
                // Show permission request UI
                console.log('No registration token available. Request permission to generate one.');
            }
        }).catch((err) => {
            console.log('An error occurred while retrieving token. ', err);
        });
    }
}
