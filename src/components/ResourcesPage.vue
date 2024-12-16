<template>
    <section class="bg-white dark:bg-gray-900  h-[750px] overflow-x-hidden overflow-y-scroll">
        <div class="py-8 px-4 mx-auto max-w-screen-xl lg:py-16 lg:px-6">
            <div class="max-w-screen-lg text-gray-500 sm:text-lg dark:text-gray-400">
                <h1 class="mb-6 text-4xl tracking-tight font-bold text-gray-900 dark:text-white">Resources</h1>
                <ul v-for="(ref, index) in references" :key="index" class="space-y-6">
                    <!-- Example Entries -->
                    <li class="flex flex-row items-end justify-between">
                        <div>
                            <h2 class="text-xl font-bold text-gray-900 dark:text-white">{{ ref.name }}</h2>
                            <p class="text-gray-700 dark:text-gray-300">
                                {{ ref.desc }}
                            </p>
                        </div>
                        <div>
                            <a :href="ref.link" target="_blank" rel="noopener noreferrer"
                                class="text-blue-500 hover:underline">
                                {{ ref.version }}
                            </a>
                        </div>
                    </li>



                </ul>
            </div>
        </div>
    </section>
</template>

<script>
export default {
    name: 'ReferencesPage',
    data() {
        return {
            references: [
                {
                    name: 'NCBI PubMed API',
                    desc: 'Provides access to biomedical literature and allows querying PubMed for scientific articles.',
                    version: 'v3.0',
                    link: 'https://www.ncbi.nlm.nih.gov/home/develop/api/',
                },
                {
                    name: 'UniProt API',
                    desc: 'Offers comprehensive information on protein sequence and functional annotation.',
                    version: '2024_03',
                    link: 'https://www.uniprot.org/help/api',
                },

                {
                    name: 'ClinVar API',
                    desc: 'Database of clinically relevant variants, offering submissions, classifications, and annotations.',
                    version: 'v2.0',
                    link: 'https://www.ncbi.nlm.nih.gov/clinvar/docs/api/',
                },
                {
                    name: 'PanelApp API',
                    desc: 'Developed by Genomics England, this tool curates gene panels for rare disease diagnostics.',
                    version: 'v2.2',
                    link: 'https://panelapp.genomicsengland.co.uk/',
                },

                {
                    name: 'HGNC API',
                    desc: 'HUGO Gene Nomenclature Committee provides standardized human gene names and symbols.',
                    version: 'v5.1',
                    link: 'https://www.genenames.org/tools/api/',
                },
                {
                    name: 'gnomAD API',
                    desc: 'Database of human genetic variation, focusing on population allele frequencies.',
                    version: 'v3.1',
                    link: 'https://gnomad.broadinstitute.org/',
                },

            ]

        };
    },
};
</script>