import { initializeApp, getApps } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyBZpnP-kGh6kR62phqCAcNXy7XBEIlJ5Cw',
  authDomain: 'sparshgyan-upes.firebaseapp.com',
  projectId: 'sparshgyan-upes',
  storageBucket: 'sparshgyan-upes.firebasestorage.app',
  messagingSenderId: '68954829987',
  appId: '1:68954829987:web:0aa2c1872c63a071503b16',
}

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]

export const auth = getAuth(app)
export const db = getFirestore(app)
