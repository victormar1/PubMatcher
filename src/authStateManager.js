import { reactive } from 'vue';

export const authState = reactive({
    isAuthenticated: !!localStorage.getItem('token'), // Check if token exists
    username: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).username : '',
    email: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).email : '',
    institute: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).institute : '',
});

export function login(username, email, institute, token) {
    console.log(token)
    console.log(username)
    console.log(email)
    console.log(institute)
    authState.isAuthenticated = true;
    authState.username = username;
    authState.email = email;
    authState.institute = institute;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify({ username, email, institute }));
}

export function logout() {
    authState.isAuthenticated = false;
    authState.username = '';
    authState.email = '';
    authState.institute = '';
    localStorage.removeItem('token');
    localStorage.removeItem('user');
}
