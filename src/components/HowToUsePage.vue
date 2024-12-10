<template>
    <div
        class="flex flex-col mx-auto px-10 py-16 justify-center items-center overflow-hidden border border-red-800 max-w-7xl">
        <!-- Navigation Buttons -->
        <div class="flex justify-center mb-8 bg-gray-700 rounded-3xl p-1">
            <div class="flex space-x-4">
                <button v-for="(slide, index) in slides" :key="index"
                    class="text-lg font-bold px-6 py-1 rounded-3xl transition-colors"
                    :class="currentSlide === index ? 'text-red-500 bg-slate-100' : 'text-gray-200'"
                    @click="goToSlide(index)">
                    {{ slide.name }}
                </button>
            </div>
        </div>

        <!-- Carousel -->
        <div class="relative w-full max-w-6xl mx-auto">
            <div class="flex transition-transform duration-700 ease-in-out"
                :style="{ transform: `translateX(-${currentSlide * 100}%)` }">
                <div v-for="(slide, index) in slides" :key="index" class="w-full flex-shrink-0">
                    <div class="flex flex-col items-center justify-center p-6 drop-shadow-lg">
                        <div class="relative max-w-5xl">
                            <!-- Screenshot -->
                            <img :src="slide.screen" alt="Screenshot" class="w-full h-auto rounded-md" />

                            <!-- Pulsating Dots -->
                            <div v-for="(dot, index) in getDotset(slide.dotset)" :key="index"
                                class="absolute flex items-center justify-center"
                                :style="{ top: dot.top, left: dot.left }">
                                <div class="w-8 h-8 bg-red-500 rounded-full animate-ping"></div>
                                <div class="absolute w-5 h-5 bg-red-500 rounded-full cursor-pointer"
                                    @click="showInfo(dot)"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>



<script>
export default {
    name: "HowToUsePage",
    data() {
        return {
            currentSlide: 0,
            slides: [{ index: 1, name: "Search", dotset: "dots_search", screen: "/images/screenshot.png" },
            { index: 2, name: "Read", dotset: "dots_read", screen: "/images/screenshot2.png" },
            { index: 3, name: "Collaborate" },
            ],

            dots_search: [
                { top: "20%", left: "50%", info: "Feature 1: Search Box" },
                { top: "50%", left: "30%", info: "Feature 2: Results Section" },
                { top: "70%", left: "80%", info: "Feature 3: Graph Section" },
            ],
            dots_read: [
                { top: "20%", left: "50%", info: "Feature 1: Search Box" },
                { top: "10%", left: "84%", info: "Feature 2: Results Section" },
                { top: "30%", left: "10%", info: "Feature 3: Graph Section" },
            ],
        };
    },
    methods: {
        showInfo(dot) {
            alert(dot.info);
        },
        goToSlide(index) {
            this.currentSlide = index;
        },
        getDotset(dotsetName) {
            return dotsetName ? this[dotsetName] : [];
        },
    },
};
</script>

<style scoped>
/* Optional: Fine-tune the animations or add custom styles */
</style>