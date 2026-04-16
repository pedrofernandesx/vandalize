// public/src/firebase.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyB0JVaokc5-cynilnmmOU8bYI4lkMf4tHc",
  authDomain: "vandalize-e78ee.firebaseapp.com",
  projectId: "vandalize-e78ee",
  storageBucket: "vandalize-e78ee.firebasestorage.app",
  messagingSenderId: "722609067868",
  appId: "1:722609067868:web:0b7da7239cab95b0529399"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);