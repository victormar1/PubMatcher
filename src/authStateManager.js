import { reactive } from 'vue';

export const authState = reactive({
    isAuthenticated: !!localStorage.getItem('token'), // Check if token exists
    username: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).username : '',
});

export function login(username, token) {
    authState.isAuthenticated = true;
    authState.username = username;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify({ username }));
}

export function logout() {
    authState.isAuthenticated = false;
    authState.username = '';
    localStorage.removeItem('token');
    localStorage.removeItem('user');
}   
