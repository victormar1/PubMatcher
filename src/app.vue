<template>
    <div class="flex flex-col min-h-screen">  
        <AppHeader />
        <div class="flex-grow">  
        <SearchModule @results-fetched="handleResults" />
        <ResultModule :results="results" />
        </div>
        <AppFooter />
    </div>
</template>



<script>
import AppHeader from './components/AppHeader';
import SearchModule from './components/SearchModule';
import AppFooter from './components/AppFooter.vue'; 


export default {
    name: "App",
    components: {
        AppHeader,
        SearchModule,
        AppFooter,
    },
    
};
</script>