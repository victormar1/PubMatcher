<template>
    <div
      v-if="visible"
      class="sticky top-0 left-0 w-full bg-white shadow z-40 overflow-hidden font-noto transition-all duration-300"
      :class="{ 'h-16': compactMode, 'h-auto': !compactMode }"
    >
      <div v-if="!compactMode" class="relative flex items-center justify-between px-4 py-1 border-b border-gray-200">
        <span class="text-xs text-gray-500 italic">Latest PubMatches (non-OMIM only)</span>
        <button @click="visible = false" class="text-xs text-gray-400 hover:text-red-500 transition">
          Hide
        </button>
      </div>
  
      <div class="flex whitespace-nowrap animate-marquee items-center h-full">
        <div
          v-for="(assoc, index) in associations"
          :key="assoc.gene + assoc.phenotype"
          class="inline-flex items-center px-4 border-r border-gray-200 w-[80vw] md:w-[400px] h-full box-border overflow-hidden"
          :class="{ 'bg-yellow-50': assoc.nonOmim }"
        >
          <div class="overflow-hidden w-full">
            <div class="mb-1">
              <span
                class="text-xs font-semibold uppercase px-2 py-1 rounded"
                :class="getTypeClass(assoc.associationType)"
              >
                {{ formatType(assoc.associationType) }}
              </span>
            </div>
  
            <template v-if="!compactMode">
              <div class="text-gray-700 font-semibold truncate text-sm md:text-base">
                Gene: <span class="text-gray-600">{{ assoc.gene }}</span>
              </div>
              <div class="text-sm md:text-base mt-0.5">
                Phenotype:
                <span
                  class="inline-block ml-1 px-2 py-0.5 rounded-full text-white text-xs"
                  :class="getPhenotypeClass(assoc.phenotype)"
                >
                  {{ assoc.phenotype }}
                </span>
              </div>
              <div class="text-sm truncate mt-1 w-full">
                <a :href="assoc.articleUrl" class="text-blue-500 hover:underline">
                  {{ assoc.articleTitle }}
                </a>
              </div>
              <div class="text-xs text-gray-500 truncate">By {{ assoc.authors }}</div>
              <div class="text-xs text-gray-400 truncate">Citations: {{ assoc.citations }}</div>
              <div class="text-xs text-gray-400 truncate text-right">{{ daysAgo(assoc.date) }}</div>
            </template>
  
            <template v-else>
              <div class="flex flex-col gap-0.5 text-xs">
                <div class="font-semibold text-gray-800 truncate">{{ assoc.gene }}</div>
                <div class="truncate text-gray-600">{{ assoc.phenotype }}</div>
              </div>
            </template>
          </div>
        </div>
  
        <div
          v-for="(assoc, index) in associations"
          :key="'repeat-' + assoc.gene + assoc.phenotype"
          class="inline-flex items-center px-4 border-r border-gray-200 w-[80vw] md:w-[400px] h-full box-border overflow-hidden"
          :class="{ 'bg-yellow-50': assoc.nonOmim }"
        >
          <div class="overflow-hidden w-full">
            <div class="mb-1">
              <span
                class="text-xs font-semibold uppercase px-2 py-1 rounded"
                :class="getTypeClass(assoc.associationType)"
              >
                {{ formatType(assoc.associationType) }}
              </span>
            </div>
  
            <template v-if="!compactMode">
              <div class="text-gray-700 font-semibold truncate text-sm md:text-base">
                Gene: <span class="text-gray-600">{{ assoc.gene }}</span>
              </div>
              <div class="text-sm md:text-base mt-0.5">
                Phenotype:
                <span
                  class="inline-block ml-1 px-2 py-0.5 rounded-full text-white text-xs"
                  :class="getPhenotypeClass(assoc.phenotype)"
                >
                  {{ assoc.phenotype }}
                </span>
              </div>
              <div class="text-sm truncate mt-1 w-full">
                <a :href="assoc.articleUrl" class="text-blue-500 hover:underline">
                  {{ assoc.articleTitle }}
                </a>
              </div>
              <div class="text-xs text-gray-500 truncate">By {{ assoc.authors }}</div>
              <div class="text-xs text-gray-400 truncate">Citations: {{ assoc.citations }}</div>
              <div class="text-xs text-gray-400 truncate text-right">{{ daysAgo(assoc.date) }}</div>
            </template>
  
            <template v-else>
              <div class="flex flex-col gap-0.5 text-xs">
                <div class="font-semibold text-gray-800 truncate">{{ assoc.gene }}</div>
                <div class="truncate text-gray-600">{{ assoc.phenotype }}</div>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>
  
    <button
      v-else
      @click="visible = true"
      class="fixed top-2 right-2 z-50 bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1 rounded shadow"
    >
      Show PM_DB Feed
    </button>
  </template>
  
  <script>
  export default {
    name: 'PMDBTicker',
    data() {
      return {
        visible: true,
        compactMode: false,
        associations: [
          {
            gene: 'LEF1',
            phenotype: 'NDD',
            articleTitle: 'LEF1 as a biomarker in neurodevelopment',
            articleUrl: '#',
            authors: 'Wang et al.',
            citations: 102,
            nonOmim: true,
            associationType: 'new_association',
            date: '2025-04-08'
          },
          {
            gene: 'PTPRD',
            phenotype: 'autism',
            articleTitle: 'PTPRD and synaptic signaling in autism',
            articleUrl: '#',
            authors: 'Lee et al.',
            citations: 87,
            nonOmim: true,
            associationType: 'preprint',
            date: '2025-04-06'
          },
          {
            gene: 'ARID1B',
            phenotype: 'malformation',
            articleTitle: 'ARID1B and chromatin defects in development',
            articleUrl: '#',
            authors: 'Zhang et al.',
            citations: 133,
            nonOmim: true,
            associationType: 'new_cohort',
            date: '2025-04-03'
          }
        ]
      };
    },
    mounted() {
      window.addEventListener('scroll', this.checkScroll);
    },
    beforeUnmount() {
      window.removeEventListener('scroll', this.checkScroll);
    },
    methods: {
      getPhenotypeClass(phenotype) {
        const map = {
          NDD: 'bg-purple-600',
          autism: 'bg-blue-600',
          'kidney disease': 'bg-green-600',
          malformation: 'bg-pink-600'
        };
        return map[phenotype] || 'bg-gray-500';
      },
      getTypeClass(type) {
        const map = {
          new_association: 'bg-red-600 text-white',
          preprint: 'bg-yellow-600 text-white',
          new_cohort: 'bg-indigo-600 text-white'
        };
        return map[type] || 'bg-gray-600 text-white';
      },
      formatType(type) {
        const labels = {
          new_association: 'New Association',
          preprint: 'Preprint',
          new_cohort: 'New Cohort'
        };
        return labels[type] || type;
      },
      daysAgo(dateString) {
        const now = new Date();
        const givenDate = new Date(dateString);
        const diff = Math.floor((now - givenDate) / (1000 * 60 * 60 * 24));
        if (diff === 0) return 'today';
        if (diff === 1) return '1 day ago';
        return `${diff} days ago`;
      },
      checkScroll() {
        this.compactMode = window.scrollY > 50;
      }
    }
  };
  </script>
  
  <style scoped>
  @keyframes marquee {
    0% {
      transform: translateX(0%);
    }
    100% {
      transform: translateX(-50%);
    }
  }
  .animate-marquee {
    display: flex;
    animation: marquee 30s linear infinite;
  }
  </style>