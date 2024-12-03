<template>
    <div class="flex flex-col items-center justify-center px-6 py-20 mx-auto">
        <div
            class="w-full bg-white rounded-lg shadow dark:border sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
            <div class="p-6 space-y-4 sm:p-8">
                <h1 class="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
                    Reset Password
                </h1>
                <form @submit.prevent="resetPassword" class="space-y-4">
                    <div>
                        <label for="password" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                            New Password
                        </label>
                        <input v-model="password" type="password" id="password" placeholder="••••••••"
                            class="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            required />
                    </div>
                    <div>
                        <label for="confirmPassword"
                            class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                            Confirm Password
                        </label>
                        <input v-model="confirmPassword" type="password" id="confirmPassword" placeholder="••••••••"
                            class="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            required />
                    </div>
                    <button type="submit"
                        class="w-full text-white bg-red-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800">
                        Reset Password
                    </button>
                    <p v-if="message" class="text-sm font-light text-gray-500 dark:text-gray-400">
                        {{ message }}
                    </p>
                </form>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    props: ['token'], // Accept the token from the router
    data() {
        return {
            password: '',
            confirmPassword: '',
            message: ''
        };
    },
    methods: {
        async resetPassword() {
            if (this.password !== this.confirmPassword) {
                this.message = 'Passwords do not match.';
                return;
            }

            try {
                const response = await fetch('/api/reset-password', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        token: this.token,
                        password: this.password
                    })
                });

                if (response.ok) {
                    this.message = 'Password reset successfully! Redirecting to login...';
                    setTimeout(() => this.$router.push('/login'), 3000); // Redirect to login after 3 seconds
                } else {
                    const data = await response.json();
                    this.message = data.error || 'An error occurred while resetting your password.';
                }
            } catch (error) {
                console.error('Error resetting password:', error);
                this.message = 'An error occurred. Please try again.';
            }
        }
    }
};
</script>
