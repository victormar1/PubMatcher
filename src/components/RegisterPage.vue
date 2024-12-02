<template>
    <div class="flex flex-col items-center justify-center px-6 py-20 mx-auto ">
        <div
            class="w-full bg-white rounded-lg shadow dark:border md:mt-0 max-w-2xl xl:p-0 dark:bg-gray-800 dark:border-gray-700">
            <div class="p-6 space-y-4 md:space-y-6 sm:p-8">
                <h1 class="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
                    Create an account
                </h1>
                <form class="space-y-4 md:space-y-6" action="#" @submit.prevent="createAccount">
                    <div>
                        <label for="username"
                            class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Username</label>
                        <input v-model="formData.username" type="username" name="username" id="username"
                            placeholder="Username"
                            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            required="">
                    </div>
                    <div>
                        <label for="password"
                            class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Password</label>
                        <input v-model="formData.password" type="password" name="password" id="password"
                            placeholder="••••••••"
                            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            required="">
                    </div>
                    <div class="flex flex-row justify-between">
                        <div class="w-1/2 pr-2">
                            <label for="institute"
                                class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Institute</label>
                            <input v-model="formData.institute" type="institute" name="institute" id="institute"
                                placeholder="CHU bordeaux"
                                class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                        </div>
                        <div class="w-1/2 pl-2">
                            <form>
                                <label for="role"
                                    class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Role/Position</label>
                                <select id="role" v-model="formData.role"
                                    class="bg-gray-50 border outline-none focus:outline-none border-gray-300 text-gray-900 text-sm rounded-lg block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white">
                                    <option value="Clinical Geneticist">Clinical Geneticist</option>
                                    <option value="Molecular Biologist">Molecular Biologist</option>
                                    <option value="Genetic Counselor">Genetic Counselor</option>
                                    <option value="Bioinformatician">Bioinformatician</option>
                                    <option value="Oncologist">Oncologist</option>
                                    <option value="Pediatric Geneticist">Pediatric Geneticist</option>
                                    <option value="Reproductive Specialist">Reproductive Specialist</option>
                                    <option value="Pharmacogeneticist">Pharmacogeneticist</option>
                                    <option value="Laboratory Technician">Laboratory Technician</option>
                                    <option value="Medical Research Scientist">Medical Research Scientist</option>
                                </select>
                            </form>
                        </div>
                    </div>
                    <div>
                        <label for="email"
                            class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Email</label>
                        <input v-model="formData.email" type="email" name="email" id="email"
                            class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            placeholder="name@chu-bordeaux.com">
                    </div>

                    <button type="submit"
                        class="w-full text-white bg-red-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800">Create
                        an account</button>
                    <div class="flex flex-row justify-between">
                        <p class="text-sm font-light text-gray-500 dark:text-gray-400">
                            Already have an account? <a href="#" @click="SendToLogin"
                                class="font-medium text-primary-600 hover:underline dark:text-primary-500">Login
                                here</a>
                        </p>
                        <p v-if="errorData.error"
                            class="text-sm font-medium text-red-500 dark:text-gray-400 text-right w-1/2">{{
                                errorData.error }}</p>
                    </div>
                </form>
            </div>
        </div>
    </div>
    <div v-if="loginSuccess" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <!-- Modal Content -->
        <div class="bg-white rounded-lg shadow-lg w-96 p-6 text-center flex flex-col items-center justify-center">
            <svg class="size-12 text-green-500 " aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24"
                height="24" fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M8.5 11.5 11 14l4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>

            <p class="text-gray-600 mb-6 mt-4">Your account has been successfully created.</p>
            <div class="flex justify-center gap-4">
                <button @click="confirm"
                    class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none">
                    Log In
                </button>
            </div>
        </div>
    </div>
</template>


<script>
import { event } from 'vue-gtag';

export default {
    name: 'RegisterPage',
    data() {
        return {
            formData: {
                username: '',
                password: '',
                institute: '',
                email: '',
                role: 'Clinical Geneticist',
            },

            errorData: {
                error: '',
            },
            loginSuccess: false,
        };
    },
    methods: {
        async createAccount() {
            try {
                const response = await fetch('api/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(this.formData),
                });
                if (response.ok) {
                    event('account_created', {
                        event_category: 'user_interaction',
                        event_label: 'account_created',
                        debug_mode: true
                    });
                    this.showLogInSuccessModal();
                } else {
                    const errorData = await response.json();
                    this.errorData.error = errorData.error || 'Unknown error occurred. Please try again.';
                }
            } catch (error) {
                console.error(error);
                alert('Failed to create account. Please try again.');
            }
        },
        showLogInSuccessModal() {
            this.loginSuccess = true;
        },
        confirm() {
            this.loginSuccess = false;
            this.$router.push('/login');
        },
        cancel() {
            this.loginSuccess = false;
        },
    },
};
</script>
