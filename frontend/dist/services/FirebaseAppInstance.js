import { initializeApp } from "firebase/app";

export class FirebaseAppInstance {
    static _instance = null;
    app = null;

    constructor() {
        if (FirebaseAppInstance._instance) {
            throw new Error("Use FirebaseAppInstance.getInstance() instead");
        }

        this.initApp();
        FirebaseAppInstance._instance = this;
    }

    static getInstance() {
        if (FirebaseAppInstance._instance === null) {
            FirebaseAppInstance._instance = new FirebaseAppInstance();
        }
        return FirebaseAppInstance._instance;
    }

    initApp() {
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

        this.app = initializeApp(firebaseConfig);
    }

    getApp() {
        if (!this.app) {
            throw new Error("Firebase app not initialized");
        }
        return this.app;
    }
}