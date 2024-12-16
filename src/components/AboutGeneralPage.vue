<template>
    <section class="bg-white dark:bg-gray-900  dark:border-gray-700 h-[750px] overflow-x-hidden overflow-y-scroll">
        <div class="py-8 px-4 mx-auto max-w-screen-xl lg:py-16 lg:px-6">
            <div class="max-w-screen-lg text-gray-500 sm:text-lg dark:text-gray-400">
                <h2 class="mb-4 text-4xl tracking-tight font-bold text-gray-900 dark:text-white">What is PubMatcher?
                </h2>
                <p class="mb-4 font-light">
                    PubMatcher is an automated genomic search tool designed to streamline genetic analysis and research.
                    By integrating biological databases and APIs, it simplifies the interpretation of pangenomic data espically for lesser known genes.
                </p>
                <p class="mb-4 font-medium">
                    PubMatcher bridges the gap between genomic data and actionable insights, aiming to quickly identitfy possible association.
                </p>

            </div>
        </div>
        <img class="  object-cover mx-auto drop-shadow" src="/images/pmchart.svg" alt="PubMatcher Logo" />
    </section>

</template>

<script>
export default {
    name: 'AboutGeneral',

};
</script>