<template >
    <div class="bg-gray-800">
        <footer class="flex flex-row text-white justify-between  h-16 py-4 mx-4">
            <div>
                <img class="h-full w-auto max-w-xs md:max-w-sm pr-4" src="/logoCHU.jpg" alt="Clinic Logo">
            </div>
            <div class="container flex flex-col mx-auto text-center justify-center">
                <p>&copy; 2024 PubMatcher. All rights reserved.</p>
                <p class="text-sm">Made by Victor Marin</p>
            </div>
            <div class="flex items-center">
                <button class="bg-red-500 rounded-md px-4 py-2 text-nowrap font-bold" @click="openModal()">
                    REPORT A BUG
                </button>
            </div>
        </footer>

        <!-- Modal -->
        <div v-if="isModalOpen" class="fixed inset-0 bg-gray-700 bg-opacity-50 flex justify-center items-center">
        <div class="bg-white p-6 rounded-md w-96">
            <h2 class="text-lg font-bold mb-4">Report a Bug</h2>
            <label class="block mb-2">
            Name:
            <input v-model="bugReport.name" type="text" class="border p-2 w-full rounded" />
            </label>
            <label class="block mb-4">
            Description:
            <textarea v-model="bugReport.description" class="border p-2 w-full rounded"></textarea>
            </label>
            <div class="flex justify-end space-x-4">
            <button @click="closeModal" class="bg-gray-500 text-white rounded-md px-4 py-2">
                Cancel
            </button>
            <button @click="submitBugReport" class="bg-blue-500 text-white rounded-md px-4 py-2">
                Submit
            </button>
            </div>
        </div>
        </div>

    </div>
</template>

<script>
import axios from 'axios';

export default {
    data() {
    return {
        isModalOpen: false,
        bugReport: {
        name: '',
        description: '',
        },
    };
    },
    methods: {
    openModal() {
        this.isModalOpen = true;
    },
    closeModal() {
        this.isModalOpen = false;
    },
    async submitBugReport() {
        try {
        const response = await axios.post('api/reportbug', this.bugReport);
        alert('Bug report submitted successfully!');
        this.closeModal();
        this.bugReport = { name: '', description: '' }; // Clear the form
        } catch (error) {
        console.error('Error submitting bug report:', error);
        alert('Failed to submit the bug report.');
        }
    },
    },
    };
</script>