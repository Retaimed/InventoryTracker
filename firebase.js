// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyApwIks0ypJKHhD8c5iiflFWwvD6li9Mng",
  authDomain: "headstarter-inventory-manage.firebaseapp.com",
  projectId: "headstarter-inventory-manage",
  storageBucket: "headstarter-inventory-manage.appspot.com",
  messagingSenderId: "528634737705",
  appId: "1:528634737705:web:edd495dba3c93bd0f6d838",
  measurementId: "G-MT66WJKQFQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);

export {firestore} // extort to be able to access other files 