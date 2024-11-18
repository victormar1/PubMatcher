<template>
    <div>
        <AppHeader />
        <SearchModule @results-fetched="handleResults" />
        <ResultModule :results="results" />
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