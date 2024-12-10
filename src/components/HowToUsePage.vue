<template>
    <div class="flex flex-col items-center justify-center  border-pink-500 p-4 h-full w-full drop-shadow">
        <div class="relative max-w-5xl mx-auto  border-red-500">
            <!-- Screenshot -->
            <img src="/images/screenshot.png" alt="Screenshot" class="w-full h-auto rounded-md" />

            <!-- Permanent Pulsating Dots -->
            <div v-for="(dot, index) in dots" :key="index" class="absolute flex items-center justify-center"
                :style="{ top: dot.top, left: dot.left }">
                <!-- Pulsating Outer Ring -->
                <div class="w-8 h-8 bg-red-500 rounded-full animate-ping"></div>
                <!-- Permanent Inner Dot -->
                <div class="absolute w-5 h-5 bg-red-500 rounded-full cursor-pointer" @click="showInfo(dot)"></div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: "HowToUsePage",
    data() {
        return {
            dots: [
                { top: "20%", left: "50%", info: "Feature 1: Search Box" },
                { top: "50%", left: "30%", info: "Feature 2: Results Section" },
                { top: "70%", left: "80%", info: "Feature 3: Graph Section" },
            ],
        };
    },
    methods: {
        showInfo(dot) {
            alert(dot.info);
        },
    },
};
</script>

<style scoped>
/* Optional: Fine-tune the animations or add custom styles */
</style>