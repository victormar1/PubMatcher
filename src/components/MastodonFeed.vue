<!-- MastodonFeed.vue -->
<template>
    <div class="relative" ref="container">
        <button @click="toggleFeed" class="relative hover:opacity-80 transition-opacity">
            <div class="flex flex-row items-center gap-2">
                <BellIcon />
                <div v-if="newPostsCount > 0"
                    class="absolute inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 border-2 border-white rounded-full -top-2 -end-2 dark:border-gray-900">
                    {{ newPostsCount }}
                </div>
            </div>
        </button>

        <transition name="fade">
            <div v-if="showFeed"
                class="absolute right-0 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl w-96 max-h-[60vh] overflow-hidden z-50 border dark:border-gray-700 flex flex-col">
                <div class="flex justify-between items-center p-4 border-b dark:border-gray-700 bg-gray-800">
                    <h2 class="text-xl font-bold text-white">News from PubMatcher</h2>
                    <button @click="toggleFeed" class="text-white hover:text-gray-200 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd"
                                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                clip-rule="evenodd" />
                        </svg>
                    </button>
                </div>

                <div class="overflow-y-auto flex-1">
                    <div v-if="loading" class="p-8 flex flex-col items-center">
                        <div
                            class="h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                        <p class="mt-4 text-gray-600 dark:text-gray-300">
                            Loading updates…
                        </p>
                    </div>

                    <div v-else-if="error" class="p-6 text-center">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto text-red-500" fill="none"
                            viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p class="mt-2 text-red-500">{{ error }}</p>
                        <button @click="fetchPosts"
                            class="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">
                            Try Again
                        </button>
                    </div>

                    <div v-else-if="posts.length === 0" class="p-8 text-center">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto text-gray-400" fill="none"
                            viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                        <p class="mt-4 text-gray-600 dark:text-gray-300">
                            No updates available at the moment.
                        </p>
                    </div>

                    <div v-else class="divide-y divide-gray-100 dark:divide-gray-700">
                        <div v-for="post in posts" :key="post.id"
                            class="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                            <div class="flex">
                                <img :src="post.avatar || '/default-avatar.png'" alt="Avatar"
                                    class="h-12 w-12 rounded-full mr-3 border-2 border-gray-200 dark:border-gray-600" />
                                <div class="flex-1 min-w-0">
                                    <div class="flex items-center justify-between">
                                        <div class="font-bold text-gray-900 dark:text-white truncate">
                                            {{ post.displayName }}
                                        </div>
                                        <div class="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap ml-2">
                                            {{ post.formattedDate }}
                                        </div>
                                    </div>
                                    <div class="text-sm text-gray-500 dark:text-gray-400">
                                        @{{ post.username }}
                                    </div>
                                </div>
                            </div>

                            <div class="mt-3 text-gray-800 dark:text-gray-200 text-sm" v-html="post.content" />

                            <div v-if="post.media && post.media.length" class="mt-3 grid gap-2" :class="{
                                'grid-cols-1': post.media.length === 1,
                                'grid-cols-2': post.media.length > 1
                            }">
                                <img v-for="media in post.media" :key="media.id" :src="media.url" alt="Media"
                                    class="rounded-md w-full h-auto object-cover max-h-48 hover:opacity-90 transition-opacity cursor-pointer" />
                            </div>

                            <div
                                class="mt-3 flex justify-between text-gray-500 dark:text-gray-400 border-t dark:border-gray-700 pt-3">
                                <button class="action-button flex items-center hover:text-blue-500 transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none"
                                        viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                                    </svg>
                                    <span class="text-xs">{{ post.repliesCount || 0 }}</span>
                                </button>

                                <button class="action-button flex items-center hover:text-green-500 transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none"
                                        viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                    <span class="text-xs">{{ post.reblogsCount || 0 }}</span>
                                </button>

                                <button class="action-button flex items-center hover:text-yellow-500 transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none"
                                        viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                    </svg>
                                    <span class="text-xs">{{ post.favouritesCount || 0 }}</span>
                                </button>

                                <a :href="post.url" target="_blank" rel="noopener noreferrer" @click.stop
                                    class="action-button flex items-center hover:text-blue-500 transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none"
                                        viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="p-3 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                    <a href="https://mastodon.social/@pubmatcher" target="_blank" rel="noopener noreferrer" @click.stop
                        class="block w-full text-center py-2 bg-gray-800 hover:bg-blue-600 text-white rounded-md transition-colors text-sm font-medium">
                        Follow on Mastodon
                    </a>
                </div>
            </div>
        </transition>
    </div>
</template>

<script setup>
import { ref, onMounted, computed, onUnmounted } from 'vue';
import { useEventListener } from '@vueuse/core';
import BellIcon from './icons/BellIcon.vue';
import { useMastodonStore } from '../stores/mastodonStore';

const mastodonStore = useMastodonStore();
const container = ref(null);

// Use store state
const posts = computed(() => mastodonStore.formattedPosts);
const loading = computed(() => mastodonStore.loading);
const error = computed(() => mastodonStore.error);
const showFeed = computed(() => mastodonStore.showFeed);
const newPostsCount = computed(() => mastodonStore.newPostsCount);

// Use store actions
const toggleFeed = () => {
    mastodonStore.toggleFeed();
};

const fetchPosts = async () => {
    await mastodonStore.fetchPosts();
};


onMounted(() => {
    fetchPosts();
    useEventListener(document, 'click', (evt) => {
        if (showFeed.value && container.value && !container.value.contains(evt.target)) {
            mastodonStore.toggleFeed();
        }
    });
});

</script>
