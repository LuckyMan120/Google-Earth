import * as firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/firestore'

// firebase init - add your own config here
firebase.initializeApp(firebaseConfig)

const auth = firebase.auth()

export {
  auth
}