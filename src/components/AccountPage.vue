<template>
    <section class="bg-white py-8 antialiased dark:bg-gray-900 md:py-8">
        <div class="mx-auto max-w-screen-lg px-4 2xl:px-0">
            <div class="py-4 md:py-8">
                <div class="mb-4 grid gap-4 sm:grid-cols-2 sm:gap-8 lg:gap-16">
                    <div class="space-y-4">
                        <div class="flex space-x-4 items-center">
                            <img class="h-16 w-16 rounded-lg"
                                src="https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541"
                                alt="Helene avatar" />
                            <div>
                                <h2
                                    class="text-xl font-bold leading-none text-gray-900 dark:text-white sm:text-2xl">
                                    {{ username }}
                                </h2>
                            </div>
                        </div>
                        <button
                            @click="showLogoutModal"
                            class="w-30 text-white bg-red-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
                        >
                            Logout
                        </button>
                        <dl class="">
                            <dt class="font-semibold text-gray-900 dark:text-white">Email Address</dt>
                            <dd class="text-gray-500 dark:text-gray-400">{{ email }}</dd>
                        </dl>
                    </div>
                    <div class="space-y-4">
                        <dl>
                            <dt class="font-semibold text-gray-900 dark:text-white">Institute</dt>
                            <dd class="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                                <svg class="hidden h-5 w-5 shrink-0 text-gray-400 dark:text-gray-500 lg:inline"
                                    aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                                    fill="none" viewBox="0 0 24 24">
                                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                                        stroke-width="2"
                                        d="M6 12c.263 0 .524-.06.767-.175a2 2 0 0 0 .65-.491c.186-.21.333-.46.433-.734.1-.274.15-.568.15-.864a2.4 2.4 0 0 0 .586 1.591c.375.422.884.659 1.414.659.53 0 1.04-.237 1.414-.659A2.4 2.4 0 0 0 12 9.736a2.4 2.4 0 0 0 .586 1.591c.375.422.884.659 1.414.659.53 0 1.04-.237 1.414-.659A2.4 2.4 0 0 0 16 9.736c0 .295.052.588.152.861s.248.521.434.73a2 2 0 0 0 .649.488 1.809 1.809 0 0 0 1.53 0 2.03 2.03 0 0 0 .65-.488c.185-.209.332-.457.433-.73.1-.273.152-.566.152-.861 0-.974-1.108-3.85-1.618-5.121A.983.983 0 0 0 17.466 4H6.456a.986.986 0 0 0-.93.645C5.045 5.962 4 8.905 4 9.736c.023.59.241 1.148.611 1.567.37.418.865.667 1.389.697Zm0 0c.328 0 .651-.091.94-.266A2.1 2.1 0 0 0 7.66 11h.681a2.1 2.1 0 0 0 .718.734c.29.175.613.266.942.266.328 0 .651-.091.94-.266.29-.174.537-.427.719-.734h.681a2.1 2.1 0 0 0 .719.734c.289.175.612.266.94.266.329 0 .652-.091.942-.266.29-.174.536-.427.718-.734h.681c.183.307.43.56.719.734.29.174.613.266.941.266a1.819 1.819 0 0 0 1.06-.351M6 12a1.766 1.766 0 0 1-1.163-.476M5 12v7a1 1 0 0 0 1 1h2v-5h3v5h7a1 1 0 0 0 1-1v-7m-5 3v2h2v-2h-2Z" />
                                </svg>
                                {{institute}}
                            </dd>
                        </dl>
                        <dl>
                            <dt class="mb-1 font-semibold text-gray-900 dark:text-white">Role/Position</dt>
                            <div>
                                <dd class="text-gray-500 dark:text-gray-400">{{ role }}</dd>
                            </div>
                        </dl>
                    </div>
                </div>
            </div>
            <div class="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800 md:p-8">
                <h3 class="mb-4 text-xl font-semibold text-gray-900 dark:text-white">Research history</h3>
                <div
                    class="flex flex-wrap items-center justify-between gap-y-4 border-b border-gray-200 pb-4 dark:border-gray-700 md:pb-5">
                    <dl class="">
                        <dt class="text-base font-medium text-gray-500 dark:text-gray-400">Request</dt>
                        <dd class="mt-1.5 text-base font-semibold text-gray-900 dark:text-white">
                            <a href="#" class="hover:underline">GENE PHENOTYPES</a>
                        </dd>
                    </dl>
                    <dl class="">
                        <dt class="text-base font-medium text-gray-500 dark:text-gray-400">Date:</dt>
                        <dd>
                            <dt class="text-base font-medium text-black-500 dark:text-gray-400">03/10/2024</dt>
                        </dd>
                    </dl>
                </div>
            </div>
        </div>
    </section>
    
    <div v-if="logoutModalVisible" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
    <!-- Modal Content -->
        <div class="bg-white rounded-lg shadow-lg w-96 p-6 text-center">
            <h2 class="text-xl font-bold mb-4">Are you sure?</h2>
            <p class="text-gray-600 mb-6">You'll be logged out.</p>
            <div class="flex justify-center gap-4">
                <button
                @click="confirm"
                class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none"
                >
                Yes, I'm Sure
                </button>
                <button
                @click="cancel"
                class="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none"
                >
                Cancel
                </button>
            </div>
        </div>
    </div>



</template>

<script>
import { logout, authState  } from '../authStateManager'; // Import the login function from authStateManager

export default {
    name: 'AccountPage',
    data() {
        return {
            logoutModalVisible: false,
        };
    },
    computed: {
        username() {
            return authState.username;
        },
        email() {
            return authState.email;
        },
        institute() {
            return authState.institute;
        },
        role() {
            return authState.role;
        },
    },
    methods: {
        showLogoutModal() {
            this.logoutModalVisible = true;
        },

        confirm() {
            this.logoutModalVisible = false;
            logout();
            this.$router.push('/login');
        },
        cancel() {
            this.logoutModalVisible = false;
        },
    },
};
</script>