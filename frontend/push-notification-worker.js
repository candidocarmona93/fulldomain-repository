importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

firebase.initializeApp({
    apiKey: "AIzaSyBVfX31YX0f_DLiXyAewAk7fdr1A60zXC4",
    authDomain: "casa-coimbra-maputo.firebaseapp.com",
    databaseURL: "https://casa-coimbra-maputo.firebaseio.com",
    projectId: "casa-coimbra-maputo",
    storageBucket: "casa-coimbra-maputo.firebasestorage.app",
    messagingSenderId: "295984447698",
    appId: "1:295984447698:web:ec9008bdfa1516c8af2d0b",
    measurementId: "G-0WX92WQ9M8"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    const notificationTitle = payload.notification?.title || 'Background Message Title';
    const notificationOptions = {
        body: payload.notification?.body || 'Background Message body.',
    };
    return self.registration.showNotification(notificationTitle, notificationOptions);
});