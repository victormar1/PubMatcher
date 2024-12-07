<template>
   <div class="relative mx-20 mt-16 drop-shadow ">
      <!-- Carousel Wrapper -->
      <div class="overflow-hidden rounded-xl ">
         <div class="flex transition-transform duration-700 ease-in-out" ref="carousel" @wheel="handleScroll"
            :style="{ transform: `translateX(-${currentSlide * 100}%)` }">
            <!-- Slide 1 -->
            <div class="flex flex-col justify-center items-start w-full flex-shrink-0">
               <h1 class="text-4xl font-extrabold text-gray-700 font-noto  ">A smarter way to decode.</h1>
               <p class="font-noto text-xl text-gray-600">PubMatcher is an advanced genomic search platform designed to
                  integrate
                  biological
                  databases
                  and APIs,<br>
                  streamlining the process of genetic data interpretation.</p>
               <div class="flex flex-row justify-between w-full pt-24 px-32 py-10">
                  <div class=" pl-2 py-2 px-2 ">
                     <div class="w-16 h-16 bg-blue-600 flex items-center justify-center rounded-lg">
                        <svg class="w-8 h-8 text-white dark:text-white" aria-hidden="true"
                           xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                           <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                              d="M15.041 13.862A4.999 4.999 0 0 1 17 17.831V21M7 3v3.169a5 5 0 0 0 1.891 3.916M17 3v3.169a5 5 0 0 1-2.428 4.288l-5.144 3.086A5 5 0 0 0 7 17.831V21M7 5h10M7.399 8h9.252M8 16h8.652M7 19h10" />
                        </svg>
                     </div>
                     <p class="font-noto text-2xl text-gray-600 font-bold pl-1 py-3">Genomic research</p>
                     <ul class="space-y-2">
                        <li class="flex items-center">
                           <svg class="w-6 h-6 text-blue-600 dark:text-white" xmlns="http://www.w3.org/2000/svg"
                              width="24" height="24" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                              <path fill-rule="evenodd"
                                 d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm13.707-1.293a1 1 0 0 0-1.414-1.414L11 12.586l-1.793-1.793a1 1 0 0 0-1.414 1.414l2.5 2.5a1 1 0 0 0 1.414 0l4-4Z"
                                 clip-rule="evenodd" />
                           </svg>
                           <p class="font-noto text-xl pl-3 text-gray-500">Constraints Verification</p>
                        </li>
                        <li class="flex items-center">
                           <svg class="w-6 h-6 text-blue-600 dark:text-white" xmlns="http://www.w3.org/2000/svg"
                              width="24" height="24" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                              <path fill-rule="evenodd"
                                 d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm13.707-1.293a1 1 0 0 0-1.414-1.414L11 12.586l-1.793-1.793a1 1 0 0 0-1.414 1.414l2.5 2.5a1 1 0 0 0 1.414 0l4-4Z"
                                 clip-rule="evenodd" />
                           </svg>
                           <p class="font-noto text-xl pl-3 text-gray-500">Scientific Publications</p>
                        </li>
                        <li class="flex items-center">
                           <svg class="w-6 h-6 text-blue-600 dark:text-white" xmlns="http://www.w3.org/2000/svg"
                              width="24" height="24" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                              <path fill-rule="evenodd"
                                 d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm13.707-1.293a1 1 0 0 0-1.414-1.414L11 12.586l-1.793-1.793a1 1 0 0 0-1.414 1.414l2.5 2.5a1 1 0 0 0 1.414 0l4-4Z"
                                 clip-rule="evenodd" />
                           </svg>
                           <p class="font-noto text-xl pl-3 text-gray-500">Protein Functions</p>
                        </li>
                        <li class="flex items-center">
                           <svg class="w-6 h-6 text-blue-600 dark:text-white" xmlns="http://www.w3.org/2000/svg"
                              width="24" height="24" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                              <path fill-rule="evenodd"
                                 d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm13.707-1.293a1 1 0 0 0-1.414-1.414L11 12.586l-1.793-1.793a1 1 0 0 0-1.414 1.414l2.5 2.5a1 1 0 0 0 1.414 0l4-4Z"
                                 clip-rule="evenodd" />
                           </svg>
                           <p class="font-noto text-xl pl-3 text-gray-500">Mouse Phenotypes</p>
                        </li>
                        <li class="flex items-center">
                           <svg class="w-6 h-6 text-blue-600 dark:text-white" xmlns="http://www.w3.org/2000/svg"
                              width="24" height="24" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                              <path fill-rule="evenodd"
                                 d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm13.707-1.293a1 1 0 0 0-1.414-1.414L11 12.586l-1.793-1.793a1 1 0 0 0-1.414 1.414l2.5 2.5a1 1 0 0 0 1.414 0l4-4Z"
                                 clip-rule="evenodd" />
                           </svg>
                           <p class="font-noto text-xl pl-3 text-gray-500">Genes Panels</p>
                        </li>
                     </ul>
                  </div>
                  <div class=" pl-2 py-2 px-2 ">
                     <div class="w-16 h-16 bg-green-500 flex items-center justify-center rounded-lg">
                        <svg class="w-6 h-6 text-white dark:text-white" aria-hidden="true"
                           xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor"
                           viewBox="0 0 24 24">
                           <path
                              d="M12 7.205c4.418 0 8-1.165 8-2.602C20 3.165 16.418 2 12 2S4 3.165 4 4.603c0 1.437 3.582 2.602 8 2.602ZM12 22c4.963 0 8-1.686 8-2.603v-4.404c-.052.032-.112.06-.165.09a7.75 7.75 0 0 1-.745.387c-.193.088-.394.173-.6.253-.063.024-.124.05-.189.073a18.934 18.934 0 0 1-6.3.998c-2.135.027-4.26-.31-6.3-.998-.065-.024-.126-.05-.189-.073a10.143 10.143 0 0 1-.852-.373 7.75 7.75 0 0 1-.493-.267c-.053-.03-.113-.058-.165-.09v4.404C4 20.315 7.037 22 12 22Zm7.09-13.928a9.91 9.91 0 0 1-.6.253c-.063.025-.124.05-.189.074a18.935 18.935 0 0 1-6.3.998c-2.135.027-4.26-.31-6.3-.998-.065-.024-.126-.05-.189-.074a10.163 10.163 0 0 1-.852-.372 7.816 7.816 0 0 1-.493-.268c-.055-.03-.115-.058-.167-.09V12c0 .917 3.037 2.603 8 2.603s8-1.686 8-2.603V7.596c-.052.031-.112.059-.165.09a7.816 7.816 0 0 1-.745.386Z" />
                        </svg>
                     </div>
                     <p class="font-noto text-2xl text-gray-600 font-bold pl-1 py-3">Robust databases</p>
                     <ul class="space-y-2">
                        <li class="flex items-center">
                           <svg class="w-6 h-6 text-green-600 dark:text-white" xmlns="http://www.w3.org/2000/svg"
                              width="24" height="24" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                              <path fill-rule="evenodd"
                                 d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm13.707-1.293a1 1 0 0 0-1.414-1.414L11 12.586l-1.793-1.793a1 1 0 0 0-1.414 1.414l2.5 2.5a1 1 0 0 0 1.414 0l4-4Z"
                                 clip-rule="evenodd" />
                           </svg>
                           <p class="font-noto text-xl pl-3 text-gray-500">HGNC</p>
                        </li>
                        <li class="flex items-center">
                           <svg class="w-6 h-6 text-green-600 dark:text-white" xmlns="http://www.w3.org/2000/svg"
                              width="24" height="24" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                              <path fill-rule="evenodd"
                                 d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm13.707-1.293a1 1 0 0 0-1.414-1.414L11 12.586l-1.793-1.793a1 1 0 0 0-1.414 1.414l2.5 2.5a1 1 0 0 0 1.414 0l4-4Z"
                                 clip-rule="evenodd" />
                           </svg>
                           <p class="font-noto text-xl pl-3 text-gray-500">GeneCC</p>
                        </li>
                        <li class="flex items-center">
                           <svg class="w-6 h-6 text-green-600 dark:text-white" xmlns="http://www.w3.org/2000/svg"
                              width="24" height="24" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                              <path fill-rule="evenodd"
                                 d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm13.707-1.293a1 1 0 0 0-1.414-1.414L11 12.586l-1.793-1.793a1 1 0 0 0-1.414 1.414l2.5 2.5a1 1 0 0 0 1.414 0l4-4Z"
                                 clip-rule="evenodd" />
                           </svg>
                           <p class="font-noto text-xl pl-3 text-gray-500">UniProt</p>
                        </li>
                        <li class="flex items-center">
                           <svg class="w-6 h-6 text-green-600 dark:text-white" xmlns="http://www.w3.org/2000/svg"
                              width="24" height="24" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                              <path fill-rule="evenodd"
                                 d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm13.707-1.293a1 1 0 0 0-1.414-1.414L11 12.586l-1.793-1.793a1 1 0 0 0-1.414 1.414l2.5 2.5a1 1 0 0 0 1.414 0l4-4Z"
                                 clip-rule="evenodd" />
                           </svg>
                           <p class="font-noto text-xl pl-3 text-gray-500">PanelAPP</p>
                        </li>
                        <li class="flex items-center">
                           <svg class="w-6 h-6 text-green-600 dark:text-white" xmlns="http://www.w3.org/2000/svg"
                              width="24" height="24" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                              <path fill-rule="evenodd"
                                 d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm13.707-1.293a1 1 0 0 0-1.414-1.414L11 12.586l-1.793-1.793a1 1 0 0 0-1.414 1.414l2.5 2.5a1 1 0 0 0 1.414 0l4-4Z"
                                 clip-rule="evenodd" />
                           </svg>
                           <p class="font-noto text-xl pl-3 text-gray-500">MGI</p>
                        </li>
                     </ul>

                  </div>
                  <div class=" pl-2 py-2 px-2 ">
                     <div class="w-16 h-16 bg-purple-600 flex items-center justify-center rounded-lg">
                        <svg class="w-6 h-6 text-white dark:text-white" aria-hidden="true"
                           xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor"
                           viewBox="0 0 24 24">
                           <path fill-rule="evenodd"
                              d="M12 6a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Zm-1.5 8a4 4 0 0 0-4 4 2 2 0 0 0 2 2h7a2 2 0 0 0 2-2 4 4 0 0 0-4-4h-3Zm6.82-3.096a5.51 5.51 0 0 0-2.797-6.293 3.5 3.5 0 1 1 2.796 6.292ZM19.5 18h.5a2 2 0 0 0 2-2 4 4 0 0 0-4-4h-1.1a5.503 5.503 0 0 1-.471.762A5.998 5.998 0 0 1 19.5 18ZM4 7.5a3.5 3.5 0 0 1 5.477-2.889 5.5 5.5 0 0 0-2.796 6.293A3.501 3.501 0 0 1 4 7.5ZM7.1 12H6a4 4 0 0 0-4 4 2 2 0 0 0 2 2h.5a5.998 5.998 0 0 1 3.071-5.238A5.505 5.505 0 0 1 7.1 12Z"
                              clip-rule="evenodd" />
                        </svg>
                     </div>
                     <p class="font-noto text-2xl text-gray-600 font-bold pl-1 py-3">Collaborative tools</p>
                     <ul class="space-y-2">
                        <li class="flex items-center">
                           <svg class="w-6 h-6 text-purple-600 dark:text-white" xmlns="http://www.w3.org/2000/svg"
                              width="24" height="24" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                              <path fill-rule="evenodd"
                                 d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm13.707-1.293a1 1 0 0 0-1.414-1.414L11 12.586l-1.793-1.793a1 1 0 0 0-1.414 1.414l2.5 2.5a1 1 0 0 0 1.414 0l4-4Z"
                                 clip-rule="evenodd" />
                           </svg>
                           <p class="font-noto text-xl pl-3 text-gray-500">Gene marking</p>
                        </li>
                        <li class="flex items-center">
                           <svg class="w-6 h-6 text-purple-600 dark:text-white" xmlns="http://www.w3.org/2000/svg"
                              width="24" height="24" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                              <path fill-rule="evenodd"
                                 d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm13.707-1.293a1 1 0 0 0-1.414-1.414L11 12.586l-1.793-1.793a1 1 0 0 0-1.414 1.414l2.5 2.5a1 1 0 0 0 1.414 0l4-4Z"
                                 clip-rule="evenodd" />
                           </svg>
                           <p class="font-noto text-xl pl-3 text-gray-500">Publication flagging</p>
                        </li>
                        <li class="flex items-center">
                           <svg class="w-6 h-6 text-purple-600 dark:text-white" xmlns="http://www.w3.org/2000/svg"
                              width="24" height="24" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                              <path fill-rule="evenodd"
                                 d="M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm13.707-1.293a1 1 0 0 0-1.414-1.414L11 12.586l-1.793-1.793a1 1 0 0 0-1.414 1.414l2.5 2.5a1 1 0 0 0 1.414 0l4-4Z"
                                 clip-rule="evenodd" />
                           </svg>
                           <p class="font-noto text-xl pl-3 text-gray-500">More coming soon</p>
                        </li>


                     </ul>

                  </div>
               </div>

            </div>

            <!-- Slide 2 (placeholder for future content) -->
            <div class="flex flex-col justify-center items-center w-full flex-shrink-0">

            </div>

            <!-- Slide 3 (placeholder for future content) -->
            <div class="flex flex-col justify-center items-start w-full flex-shrink-0">
               <div class="text-4xl font-extrabold text-gray-700 font-noto">
                  Slide 3
               </div>
               <p class="font-noto text-xl text-gray-600">
                  This is the third slide. You can replace this with your content.
               </p>
            </div>
         </div>
      </div>

      <!-- Navigation Arrows -->
      <button @click="prevSlide"
         class="absolute top-1/2 left-2 transform -translate-y-1/2 bg-gray-800 p-2 rounded-full text-white hover:bg-gray-800">
         <svg class="w-6 h-6 text-white dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
            width="24" height="24" fill="none" viewBox="0 0 24 24">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
               d="m14 8-4 4 4 4" />
         </svg>

      </button>
      <button @click="nextSlide"
         class="absolute top-1/2 right-2 transform -translate-y-1/2 bg-gray-800 p-2 rounded-full text-white hover:bg-gray-800">
         <svg class="w-6 h-6 text-white dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
            width="24" height="24" fill="none" viewBox="0 0 24 24">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
               d="m10 16 4-4-4-4" />
         </svg>

      </button>

      <!-- Dot Indicators -->
      <div class="flex justify-center  space-x-2 mt-32">
         <span v-for="(dot, index) in totalSlides" :key="index" @click="goToSlide(index)" :class="{
            'bg-gray-700': currentSlide === index,
            'bg-gray-300': currentSlide !== index,
         }" class="w-3 h-3 rounded-full cursor-pointer"></span>
      </div>
   </div>




























</template>

<script>
export default {
   data() {
      return {
         currentSlide: 0, // Index of the currently active slide
         totalSlides: 3, // Total number of slides
         isScrolling: false,

      };
   },
   methods: {
      nextSlide() {
         this.currentSlide = (this.currentSlide + 1) % this.totalSlides;
      },
      prevSlide() {
         this.currentSlide =
            (this.currentSlide - 1 + this.totalSlides) % this.totalSlides;
      },
      goToSlide(index) {
         this.currentSlide = index;
      },
      handleScroll(event) {
         if (this.isScrolling) return;

         this.isScrolling = true;

         if (event.deltaY > 0) {
            // Scrolling down or to the right
            this.currentSlide = Math.min(this.currentSlide + 1, this.totalSlides - 1);
         } else {
            // Scrolling up or to the left
            this.currentSlide = Math.max(this.currentSlide - 1, 0);
         }

         this.scrollToSlide(this.currentSlide);

         setTimeout(() => {
            this.isScrolling = false;
         }, 500); // Prevent rapid scrolling
      },
      scrollToSlide(index) {
         const carousel = this.$refs.carousel;
         const slideWidth = carousel.offsetWidth;
         carousel.scrollTo({
            left: index * slideWidth,
            behavior: "smooth",
         });
      },
   },
};
</script>
