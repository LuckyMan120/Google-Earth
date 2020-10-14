import LocalStorage from './LocalStorage.js';

let cache = new LocalStorage()

export default cache;

export const keys = {
    'TOKEN_KEY': 'TOKEN',
    'RESET_KEY': 'RESET',
    'DEVICE_KEY': 'CURRENT_DEVICE',
    'SIGNUP_KEY': 'SIGNUP_DATA'
};
