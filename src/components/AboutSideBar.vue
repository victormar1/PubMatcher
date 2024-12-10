<template>
    <nav class="p-4 font-noto font-bold text-gray-300 border-r border-gray-500">
        <ul class="space-y-2">
            <li>
                <router-link to="/about/general"
                    class="block p-2 rounded-lg transition duration-75 hover:bg-gray-600 hover:text-gray-100"
                    active-class="bg-gray-600 text-gray-100">
                    What is PubMatcher?
                </router-link>
            </li>
            <li>
                <router-link to="/about/howto"
                    class="block p-2 rounded-lg transition duration-75 hover:bg-gray-600 hover:text-gray-100"
                    active-class="bg-gray-600 text-gray-100">
                    How to use it ?
                </router-link>
            </li>
            <li>
                <router-link to="/about/resources"
                    class="block p-2 rounded-lg transition duration-75 hover:bg-gray-600 hover:text-gray-100"
                    active-class="bg-gray-600 text-gray-100">
                    Resources
                </router-link>
            </li>
            <li>
                <router-link to="/about/changelog"
                    class="block p-2 rounded-lg transition duration-75 hover:bg-gray-600 hover:text-gray-100"
                    active-class="bg-gray-600 text-gray-100">
                    Changelog
                </router-link>
            </li>
        </ul>
        <hr class="my-4 border-t border-gray-500" />
        <ul class="space-y-2">
            <li>
                <router-link to="/about/disclaimer"
                    class="block p-2 rounded-lg transition duration-75 hover:bg-gray-600 hover:text-gray-100"
                    active-class="bg-gray-600 text-gray-100">
                    Disclamer
                </router-link>
            </li>
            <li>
                <router-link to="/about/legals"
                    class="block p-2 rounded-lg transition duration-75 hover:bg-gray-600 hover:text-gray-100"
                    active-class="bg-gray-600 text-gray-100">
                    Legal Mentions
                </router-link>
            </li>
            <li>
                <router-link to="/about/contact"
                    class="block p-2 rounded-lg transition duration-75 hover:bg-gray-600 hover:text-gray-100"
                    active-class="bg-gray-600 text-gray-100">
                    Contact
                </router-link>
            </li>
        </ul>

    </nav>
</template>