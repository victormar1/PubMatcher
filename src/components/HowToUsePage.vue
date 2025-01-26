<template>
    <div class="flex flex-col mx-auto px-10 py-16 justify-center items-center overflow-hidden border-red-800 max-w-7xl"
        @wheel="handleWheel">

        <!-- Navigation Buttons -->
        <div class="flex justify-center mb-8 bg-gray-700 rounded-3xl p-1 drop-shadow">
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
        <div class="relative w-full max-w-6xl mx-auto overflow-hidden">
            <div class="flex transition-transform duration-700 ease-in-out w-full"
                :style="{ transform: `translateX(-${currentSlide * 100}%)` }">
                <div v-for="(slide, index) in slides" :key="index" class="w-full flex-shrink-0" style="flex: 0 0 100%">
                    <div class="flex flex-col items-center justify-center p-6 drop-shadow-lg">
                        <div class="relative max-w-5xl">
                            <!-- Screenshot -->
                            <img :src="slide.screen" alt="Screenshot" class="w-full h-auto rounded-md" />
                            <!-- Pulsating Dots -->
                            <div v-for="(dot, index) in getDotset(slide.dotset)" :key="index"
                                class="absolute flex items-center justify-center "
                                :style="{ top: dot.top, left: dot.left }">
                                <div class="w-8 h-8 bg-red-500 rounded-full animate-ping"></div>
                                <div class="absolute w-5 h-5 bg-red-500 rounded-full border-2 border-white cursor-pointer drop-shadow"
                                    :data-popover-target="'popover-pubmatch-' + slide.dotset + '-' + index"
                                    data-popover-placement="right">
                                </div>
                                <div data-popover :id="'popover-pubmatch-' + slide.dotset + '-' + index" role="tooltip"
                                    class="absolute z-10 invisible text-md font-medium text-gray-600 transition-opacity duration-300
         bg-white border border-gray-200 rounded-lg shadow-sm p-3 
         whitespace-normal break-words text-nowrap">
                                    {{ dot.info }}
                                    <div data-popper-arrow></div>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>




<script>
import { initPopovers } from 'flowbite';

export default {
    name: "HowToUsePage",

    mounted() {
        initPopovers();
    },
    data() {
        return {
            currentSlide: 0,
            slides: [{ index: 1, name: "Search", dotset: "dots_search", screen: "/images/screenshot.png" },
            { index: 2, name: "Read", dotset: "dots_read", screen: "/images/screenshot2.png" },
                //{ index: 2, name: "Collaborate", dotset: "dots_read", screen: "/images/screenshot3.png" },
            ],

            dots_search: [
                { top: "20%", left: "50%", info: "Extract genes from raw text or any output" },
                { top: "50%", left: "30%", info: "Add gene(s) individually" },
                { top: "60%", left: "70%", info: "Add phenotype(s) to match" },
            ],
            dots_read: [
                { top: "10%", left: "5%", info: "Check for gene constraints. Click to swap version (GnomAd v2/v4)" },
                { top: "8%", left: "25%", info: "View Number and Titles of matching PubMed articles" },
                { top: "50%", left: "50%", info: "Assess protein function on Uniprot" },
                { top: "67%", left: "73%", info: "Phenotype in KO mice via IMPC" },
                { top: "50%", left: "85%", info: " Clinvar ratios of P/PL and VUS variants" },
                { top: "30%", left: "93%", info: "OMIM / GeneCC / PanelApp infos" }
            ],

        };
    },
    methods: {
        goToSlide(index) {
            this.currentSlide = index;
        },
        getDotset(dotsetName) {
            return dotsetName ? this[dotsetName] : [];
        },
        handleWheel(event) {
            if (event.deltaY > 0) {
                this.nextSlide();
            } else {
                this.prevSlide();
            }
        },
        nextSlide() {
            if (this.currentSlide < this.slides.length - 1) {
                this.currentSlide++;
            }
        },
        prevSlide() {
            if (this.currentSlide > 0) {
                this.currentSlide--;
            }
        },
    },
};
</script>

<style scoped>
/* Optional: Fine-tune the animations or add custom styles */
</style>