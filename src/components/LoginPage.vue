<template>
    <div class="flex flex-col items-center justify-center px-6 py-20 mx-auto ">
        <div class="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
            <div class="p-6 space-y-4 md:space-y-6 sm:p-8">
                <h1 class="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
                    Log in to your account
                </h1>
                <form class="space-y-4 md:space-y-6" action="#" @submit.prevent="login">
                    <div>
                        <label for="username" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Username</label>
                        <input v-model="formData.username" type="username" name="username" id="username" class="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="MarinVic" required="">
                    </div>
                    <div>
                        <label for="password" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Password</label>
                        <input v-model="formData.password" type="password" name="password" id="password" placeholder="••••••••" class="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required="">
                    </div>
                    <div class="flex justify-between items-center">
                        <a href="#" class="text-sm font-medium text-primary-600 hover:underline dark:text-primary-500">Forgot password?</a>
                        <p v-if="errorData.error" class="text-sm font-light text-gray-500 dark:text-gray-400">{{ errorData.error }}</p>
                    </div>
                    <button type="submit" class="w-full text-white bg-red-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800">Sign in</button>
                    <p class="text-sm font-light text-gray-500 dark:text-gray-400">
                        Don’t have an account yet? <a href="#" @click.prevent="SendToRegister" class="font-medium text-primary-600 hover:underline dark:text-primary-500">Sign up</a>
                    </p>
                </form>
            </div>
        </div>
    </div>
</template>

<script>
import { login } from '../authStateManager'; // Import the login function from authStateManager

export default {
name: 'LoginPage',
data() {
        return {
            formData: {
                username: '',
                password: '',
            },
            errorData: {
                error: '', // Store the error message
            },
        };
    },
mounted() {
    const token = localStorage.getItem('token'); // Check if token exists
    if (token) {
        this.$router.push('/account'); // Redirect to account page
    }


},
methods:{
        SendToRegister(){
            this.$router.push('/register')
        },
        async login() {
            try {
                const response = await fetch('/api/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(this.formData),
                });

                if (response.ok) {
                    const data = await response.json();
                    console.log(data)
                    login(data.user.username, data.user.email, data.user.institute, data.token);
                    this.$router.push('/account'); 
                } else {
                    const errorData = await response.json();
                    this.errorData.error = errorData.error || 'Unknown error occurred. Please try again.';
                }
            } catch (error) {
                console.error('Error during login:', error);
                alert('Failed to log in. Please try again.');
            }
        },
    }
};

</script>
