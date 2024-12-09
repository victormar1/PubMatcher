<template>
    <section class="bg-white dark:bg-gray-900  h-[750px] overflow-x-hidden  overflow-y-scroll  ">
        <div class="py-8 px-4 mx-auto max-w-screen-xl lg:py-16 lg:px-6">
            <div class="max-w-screen-lg text-gray-500 sm:text-lg dark:text-gray-400">
                <h1 class="mb-6 text-4xl tracking-tight font-bold text-gray-900 dark:text-white">Changelog</h1>

                <!-- Entries -->
                <div v-for="(entry, index) in changelogEntries" :key="index" class="mb-8">
                    <h2 class="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">
                        {{ entry.date }}
                    </h2>
                    <ul class="list-disc list-inside space-y-2">
                        <li v-for="(item, itemIndex) in entry.changes" :key="itemIndex"
                            class="text-gray-700 dark:text-gray-300">
                            {{ item }}
                        </li>
                    </ul>
                    <hr v-if="index < changelogEntries.length - 1"
                        class="my-6 border-t border-gray-200 dark:border-gray-600" />
                </div>
            </div>
        </div>
    </section>
</template>

<script>
export default {
    name: 'ChangelogPage',
    data() {
        return {
            changelogEntries: [
                {
                    date: 'December 2024',
                    changes: ['User accounts', 'New UI', 'Bug fixes', 'New features'],
                },
                {
                    date: 'November 2024',
                    changes: ['Added new feature X', 'Improved performance', 'Fixed bug Y'],
                },
                {
                    date: 'June 2024',
                    changes: ['Initial Release'],
                },
                {
                    date: 'June 2024',
                    changes: ['Initial Release'],
                },
                {
                    date: 'June 2024',
                    changes: ['Initial Release'],
                },
                {
                    date: 'June 2024',
                    changes: ['Initial Release'],
                },

            ],
        };
    },
};
</script>