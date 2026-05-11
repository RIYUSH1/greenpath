import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAmnv6nBDPyIbMB56RuK4BkEz_d3pauDM8",
  authDomain: "greenpath-ca44b.firebaseapp.com",
  projectId: "greenpath-ca44b",
  storageBucket: "greenpath-ca44b.appspot.com",
  messagingSenderId: "245757537875",
  appId: "1:245757537875:web:988f63103c1bb0854920a6"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
