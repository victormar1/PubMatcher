import { reactive } from 'vue';

export const authState = reactive({
    isAuthenticated: !!localStorage.getItem('token'), // Check if token exists
    username: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).username : '',
    email: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).email : '',
    institute: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).institute : '',
    role: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).role : '',
});

export function login(username, email, institute, role, token) {
    authState.isAuthenticated = true;
    authState.username = username;
    authState.email = email;
    authState.institute = institute;
    authState.role = role;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify({ username, email, institute }));
}

export function logout() {
    authState.isAuthenticated = false;
    authState.username = '';
    authState.email = '';
    authState.institute = '';
    authState.role = '';
    localStorage.removeItem('token');
    localStorage.removeItem('user');
}
