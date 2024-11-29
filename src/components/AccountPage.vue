<template>
    <section class="bg-white py-8 antialiased dark:bg-gray-900 md:py-8 ">
        <div class="mx-auto max-w-screen-lg px-4 2xl:px-0">
            <div class="py-4 md:py-8">
                <div class="mb-4 grid gap-4 sm:grid-cols-2 sm:gap-8 lg:gap-16">
                    <div class="space-y-4">
                        <div class="flex space-x-4 items-center">
                            <img class="h-16 w-16 rounded-lg"
                                src="https://upload.wikimedia.org/wikipedia/commons/7/7c/Profile_avatar_placeholder_large.png?20150327203541"
                                alt="Helene avatar" />
                            <div>
                                <h2 class="text-xl font-bold leading-none text-gray-900 dark:text-white sm:text-2xl">
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
                        <dl>
                            <dt class="font-semibold text-gray-900 dark:text-white">Email Address</dt>
                            <dd class="text-gray-500 dark:text-gray-400">{{ email }}</dd>
                        </dl>
                    </div>
                    <div class="space-y-4">
                        <dl>
                            <dt class="font-semibold text-gray-900 dark:text-white">Institute</dt>
                            <dd class="text-gray-500 dark:text-gray-400">{{ institute }}</dd>
                        </dl>
                        <dl>
                            <dt class="mb-1 font-semibold text-gray-900 dark:text-white">Role/Position</dt>
                            <dd class="text-gray-500 dark:text-gray-400">{{ role }}</dd>
                        </dl>
                    </div>
                </div>
            </div>
            <div class="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800 md:p-8 shadow-sm">
                <h3 class="mb-4 text-xl font-semibold text-gray-900 dark:text-white">Research History</h3>
                <div>
                    <ul v-if="history.length">
                        <li v-for="(entry, index) in history" :key="index" class="mb-4">
                            <button
                                @click="toggleAccordion(index)"
                                class="flex w-full items-center justify-between p-4 font-medium text-gray-500 rounded-lg bg-gray-100 dark:bg-gray-700 dark:text-gray-400 focus:outline-none">
                                <span>
                                <a 
                                    :href="`/search?genes=${entry.genes.split(',').join(',')}&phenotypes=${entry.phenotypes.split(',').join(',')}`"
                                    class="text-blue-600 hover:underline">
                                    {{ formatDate(entry.timestamp) }}
                                </a>
                                </span>
                                <div class="space-x-2">
                                    <span class="inline-block px-3 py-1 text-sm font-medium text-gray-500 bg-blue-300 rounded-md dark:bg-gray-600">
                                        {{entry.genes.split(',').length}} Genes
                                    </span>
                                    <span class="inline-block px-3 py-1 text-sm font-medium text-gray-500 bg-red-300 rounded-md dark:bg-gray-600">
                                        {{ entry.phenotypes ? entry.phenotypes.split(',').length : 0 }} Phenotypes
                                    </span>
                                </div>
                                <svg
                                    :class="{'rotate-180': accordionState[index]}"
                                    class="w-4 h-4 transition-transform"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                            <div
                                v-show="accordionState[index]"
                                class="mt-2 p-4 text-gray-500 bg-gray-50 border border-gray-200 rounded-lg dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700"
                            >
                                <div>
                                    <p class="mb-2 font-semibold"><strong>Genes:</strong></p>
                                    <div class="flex flex-wrap gap-2">
                                        <span
                                            v-for="(gene, geneIndex) in entry.genes.split(',')"
                                            :key="geneIndex"
                                            class="inline-block px-3 py-1 text-sm font-medium text-white bg-gray-500 rounded-md dark:bg-blue-600"
                                        >
                                            {{ gene }}
                                        </span>
                                    </div>
                                </div>
                                <div class="mt-4">
                                    <p class="mb-2 font-semibold"><strong>Phenotypes:</strong></p>
                                    <div class="flex flex-wrap gap-2">
                                        <span
                                            v-if="entry.phenotypes"
                                            v-for="(phenotype, phenotypeIndex) in entry.phenotypes.split(',')"
                                            :key="phenotypeIndex"
                                            class="inline-block px-3 py-1 text-sm font-medium text-white bg-green-500 rounded-md dark:bg-green-600"
                                        >
                                            {{ phenotype }}
                                        </span>

                                        <span v-else class="inline-block px-3 py-1 text-sm font-medium text-gray-500 bg-gray-300 rounded-md dark:bg-gray-600">
                                            No phenotypes
                                        </span>
                                    </div>
                                </div>
                                
                            </div>
                        </li>
                    </ul>
                    <p v-else>No history found.</p>
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
import { logout, authState } from '../authStateManager';

export default {
    name: 'AccountPage',
    data() {
        return {
            logoutModalVisible: false,
            history: [],
            accordionState: [], // Tracks which accordions are open
        };
    },
    async mounted() {
        await this.fetchUserHistory();
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
        async fetchUserHistory() {
            try {
                const response = await fetch('api/getuserhistory', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                this.history = data.history;
                this.accordionState = Array(data.history.length).fill(false);
            } catch (error) {
                console.error('Error fetching user history:', error);
            }
        },
        toggleAccordion(index) {
            this.accordionState[index] = !this.accordionState[index];
        },
        formatDate(timestamp) {
        const date = new Date(timestamp);
        return new Intl.DateTimeFormat('en-US', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
        }).format(date);
        },
    },
};
</script>
