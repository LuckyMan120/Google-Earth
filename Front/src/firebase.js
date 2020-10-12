import * as firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/firestore'

// firebase init - add your own config here
var firebaseConfig = {
    apiKey: "AIzaSyD3L0J7TyO67mUysv6pyUWQF3SypLqwI_k",
    authDomain: "us--map.firebaseapp.com",
    databaseURL: "https://us--map.firebaseio.com",
    projectId: "us--map",
    storageBucket: "us--map.appspot.com",
    messagingSenderId: "1048878076507",
    appId: "1:1048878076507:web:dfc4cc520faa270a34657e",
    measurementId: "G-DZ69LJVQE2"
};
firebase.initializeApp(firebaseConfig)

const auth = firebase.auth()

export {
  auth
}