import { reactive } from 'vue';

export const authState = reactive({
    isAuthenticated: !!localStorage.getItem('token'), // Check if token exists
    id: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).id : '', // Include id
    username: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).username : '',
    email: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).email : '',
    institute: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).institute : '',
    role: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).role : '',
});

export function login(id, username, email, institute, role, token) {
    authState.isAuthenticated = true;
    authState.username = username;
    authState.email = email;
    authState.institute = institute;
    authState.role = role;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify({ id, username, email, institute, role }));
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