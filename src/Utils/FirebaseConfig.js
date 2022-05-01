import { initializeApp } from "firebase/app";
//const firebase = require("firebase/app");

const firebaseConfig = {
    apiKey: "AIzaSyBGU6Zwlec7melFzc1_v_aoI6KWokhZf-Q",
    authDomain: "rpag-b8590.firebaseapp.com",
    databaseURL: "https://rpag-b8590.firebaseio.com",
    projectId: "rpag-b8590",
    storageBucket: "rpag-b8590.appspot.com",
    messagingSenderId: "468844673997",
    appId: "1:468844673997:web:75a8f87040734d3737a284"
};

const firebase = initializeApp(firebaseConfig);

export default firebase;
//module.exports = firebase;