<template>
    <div>
        <AppHeader />
        <SearchModule @results-fetched="handleResults" />
        <ResultModule :results="results" />
    </div>
</template>



<script>
import AppHeader from './components/AppHeader';
import SearchModule from './components/SearchModule';



export default {
    name: "App",
    components: {
        AppHeader,
        SearchModule,
    },
    
};
</script>