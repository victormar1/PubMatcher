// scripts.js
// REFACTOR WHEN DONE



window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-PGNGTTRTN2');

document.addEventListener('DOMContentLoaded', function() {




    //LISTENERS VARIABLES
    const addGeneButton = document.getElementById('addGeneButton');
    const addGeneInput = document.getElementById('geneInput'); 
    const addPhenotypeInput = document.getElementById('phenotypeInput');
    const addPhenotypeButton = document.getElementById('addPhenotypeButton');
    const researchButton = document.getElementById('researchButton');




    displayItems('gene');
    displayItems('phenotype');
    //Look for stored persistent data on DOM load then init update the containers
    if (!localStorage.getItem('data')) {
        localStorage.setItem('data', JSON.stringify([{ type: 'gene', items: [] }, { type: 'phenotype', items: [] }]));
    }
    //check if there is a response stored 
    const storedResults = localStorage.getItem('results');
    if (storedResults) {
        const jsonData = JSON.parse(storedResults);
        renderResults(jsonData);
        document.getElementById('resultsTable').scrollIntoView({ behavior: 'smooth' });
        document.getElementById('searchResults').classList.remove('hidden');
    }


    
    const clearTextButton = document.getElementById('clearTextArea');
    clearTextButton.addEventListener('click', () => {
        clearList('gene');
    });

    addGeneButton.addEventListener('click', () => { // Add event listener
        const geneName = addGeneInput.value.trim(); // Get the gene name from the input field

        if (geneName) { // Check if the input is not empty
            addGene(geneName); // Call addGene with the gene name
            addGeneInput.value = ''; // Clear the input field
        }
    });

    addPhenotypeButton.addEventListener('click', () => {
        const phenotypeName = addPhenotypeInput.value.trim();

        if (phenotypeName) {
            addPhenotype(phenotypeName);
            addPhenotypeInput.value = ''; // Clear the input
        }
    });

    
    //RESEARCH BUTTON
    researchButton.addEventListener('click', () => {
        startLoader()
        const genes = getItems('gene');
        const phenotypes = getItems('phenotype');
        if (genes.length > 0 || phenotypes.length > 0) {
            const data = { genes, phenotypes };
            
            fetch('/search', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json(); // Parse the response as JSON
            })
            .then(jsonData => { // jsonData now holds the parsed JSON
                console.log(jsonData)
                if (!jsonData || !jsonData.results || jsonData.results.length === 0) {
                    stopLoader()
                }
                const searchResultsContainer = document.getElementById('searchResults');
                searchResultsContainer.classList.remove('hidden');
                renderResults(jsonData)
                document.getElementById('resultsTable').scrollIntoView({ behavior: 'smooth' });
                //stock resonse in a localstorage
                localStorage.setItem('results', JSON.stringify(jsonData));
                stopLoader()
            })
            .catch(error => {
                console.error('Error:', error);
                //Consider adding UI feedback to the user about the error.  For example,  display an error message in the `searchResultsContainer`.
            });
        }else if((genes, phenotypes) => 
            Object.keys(genes).length === 0 && Object.keys(phenotypes).length === 0){
            stopLoader() //loader check for no input
        }
    });


    addGeneInput.addEventListener('input', () => showSuggestions('gene'));
    addPhenotypeInput.addEventListener('input', () => showSuggestions('phenotype'));

    document.addEventListener('mouseenter', () => {
        //location.reload(); //POOR MANS HOT RELOAD
    });

    document.getElementById('extractGenesBUtton').addEventListener('click', () => {
        const text = document.getElementById('batchInputText').value;
        fetch('/extract-genes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text: text })
        })
        .then(response => response.json())
        .then(data => {
            document.getElementById('genesInput').value = data.genes.join(', ');
            document.getElementById('batchInputText').style.display = 'none';
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    });
    
    seqOneBtn.addEventListener('click', () => {
        seqOnePopin.style.display = 'block';
    });

  seqOneSubmit.addEventListener('click', () => {
        const text = seqOneInput.value;
        const lines = text.split('\n');
        let genes = [];
        if (lines.some(line => line.startsWith('New') || /^[1-5]$/.test(line.trim()))) {
            lines.forEach((line, index) => {
                if (line.startsWith('New') && lines[index + 1]) {
                    genes.push(lines[index + 1].split('\t')[0]);
                }
            });
        } 
        genesInput.value = genes.join(', ');
        seqOnePopin.style.display = 'none';
    });
    
    
    document.getElementById('textFreeInputBtn').addEventListener('click', function() {
        document.getElementById('textFreePopin').style.display = 'block';
    });
    
    document.getElementById('textFreeClose').addEventListener('click', function() {
        document.getElementById('textFreePopin').style.display = 'none';
    });
    
    if (document.getElementById('resultsTable')) {
        document.getElementById("resultsTable").scrollIntoView({ behavior: 'smooth' });
    }
});
function startLoader() {
    document.querySelectorAll('.loader').forEach(loader => {
        loader.classList.add('animate-spin'); // Start rotation on each loader
    });
}
function stopLoader() {
    document.querySelectorAll('.loader').forEach(loader => {
        loader.classList.remove('animate-spin'); // Stop rotation on each loader
    });
}
function renderResults(data) {
    const tbody = document.getElementById('resultsTable').querySelector('tbody'); // Target the tbody, not the entire table.
    tbody.innerHTML = ''; // Clear existing rows

    if (!data || !data.results || data.results.length === 0) {
        // No results case - add a row indicating no results found.
        const row = tbody.insertRow();
        const cell = row.insertCell();
        cell.colSpan = 6; // Adjust colSpan to match your table's columns
        cell.classList.add("px-6", "py-4", "font-medium", "text-gray-900", "whitespace-nowrap", "dark:text-white", "text-center"); // Add classes for styling
        cell.textContent = "No results found";
        return;
    }

    data.results.forEach(result => {
        console.log(result)

        const row = tbody.insertRow();
        row.classList.add("bg-white", "border-b", "dark:bg-gray-800", "dark:border-gray-700"); // Add row classes for styling

        // Gene Name Cell
        const geneCell = row.insertCell();
        geneCell.classList.add("px-6", "py-4", "font-medium", "text-gray-700", "text-lg", "whitespace-nowrap", "dark:text-white");
        const hgncLink = document.createElement("a");
        hgncLink.href = result.geneLink; // Set the URL
        hgncLink.textContent = result.gene; // Set the text
        hgncLink.classList.add("text-blue-700", "hover:underline"); // Add styles for link
        hgncLink.target = "_blank"; // Open in a new tab
        hgncLink.rel = "noopener noreferrer"; // Ensure security for external links
        geneCell.appendChild(hgncLink);
    



        // Title of First Publication Cell
        const firstPubCell = row.insertCell();
        firstPubCell.classList.add("px-6", "py-4");
        firstPubCell.textContent = result.title || 'N/A';

        // Function Cell
        const functionCell = row.insertCell();
        functionCell.classList.add("px-6", "py-4");
        //keywords
        if (result.functionKeywords && Array.isArray(result.functionKeywords)) {
            const keywordsDiv = document.createElement("div");
            keywordsDiv.classList.add("mb-2", "flex", "flex-wrap", "gap-2");

            result.functionKeywords.forEach(keyword => {
                const keywordItem = document.createElement("div");
                keywordItem.classList.add(
                    "px-2", 
                    "py-1", 
                    "text-xs", 
                    "font-bold",
                    "font-sans", 
                    "text-blue-700", 
                    "bg-blue-100", 
                    "rounded"
                );
                keywordItem.textContent = keyword;
                keywordsDiv.appendChild(keywordItem);
            });

            // Append the keywords div to the cell
            functionCell.appendChild(keywordsDiv);
        }

        // Add the function text below the keywords
        const functionText = document.createElement("div");
        functionText.textContent = result.function || 'N/A';
        // [...]"
        const link = document.createElement("a");
        link.href = result.urlAccession;
        link.classList.add("font-bold","text-blue-600")
        link.target = "_blank";
        link.textContent = "[...]";
        functionCell.appendChild(functionText);
        functionText.appendChild(link);

        // Mouse Phenotype Cell
        const mousePhenotypeCell = row.insertCell();
        mousePhenotypeCell.classList.add("px-6", "py-4");
        if (result.mousePhenotype && typeof result.mousePhenotype === "object" && Object.keys(result.mousePhenotype).length > 0) {
            // Create a container div for the phenotypes
            const phenotypeContainer = document.createElement("div");
            phenotypeContainer.classList.add("flex", "flex-wrap", "gap-2", "justify-center");

            for (const [category, details] of Object.entries(result.mousePhenotype)) {
                const categoryDiv = document.createElement("div");
                categoryDiv.classList.add("relative", "flex", "items-center", "gap-2");
            
                if (details.icon) {
                    const svgContainer = document.createElement("div");
                    svgContainer.innerHTML = details.icon;
                    svgContainer.classList.add("w-6", "h-6", "cursor-pointer");
                    categoryDiv.appendChild(svgContainer);
            
                    const tooltip = document.createElement("div");
            
                    details.names.forEach(name => {
                        const line = document.createElement("div");
                        line.textContent = name.trim(); 
                        tooltip.appendChild(line);
                    });
            
                    tooltip.classList.add(
                        "absolute",
                        "hidden",
                        "bg-gray-800",
                        "text-white",
                        "text-ml",
                        "font-mono",
                        "font-bold",
                        "rounded",
                        "p-2",
                        "z-50",
                        "top-full",
                        "left-1/2",
                        "-translate-x-1/2",
                        "mt-2",
                        "shadow-lg",
                        "pointer-events-none"
                    );
            
                    // Remove any fixed or max width
                    tooltip.style.width = "auto";
                    tooltip.style.maxWidth = "unset"; // Ensure no maximum width constraint
                    tooltip.style.whiteSpace = "nowrap"; // Prevent wrapping

                    // Handle tooltip positioning to stay within viewport
                    svgContainer.addEventListener("mouseenter", () => {
                        tooltip.classList.remove("hidden");
                    
                        // Get bounding box for the parent container and tooltip
                        const containerRect = svgContainer.getBoundingClientRect();
                        const tooltipRect = tooltip.getBoundingClientRect();
                        const viewportWidth = window.innerWidth;
                    
                        // Reset tooltip position
                        tooltip.style.left = "50%";
                        tooltip.style.transform = "translateX(-50%)";
                    
                        // Adjust if the tooltip overflows on the right
                        if (tooltipRect.right > viewportWidth) {
                            const overflowRight = tooltipRect.right - viewportWidth;
                            tooltip.style.left = `calc(50% - ${overflowRight + 10}px)`; //GPT MAGIC 
                        }
                    
                        // Adjust if the tooltip overflows on the left
                        if (tooltipRect.left < 0) {
                            const overflowLeft = Math.abs(tooltipRect.left);
                            tooltip.style.left = `calc(50% + ${overflowLeft + 10}px)`;
                        }
                    });
                    
                    svgContainer.addEventListener("mouseleave", () => {
                        tooltip.classList.add("hidden");
                    });
            
                    categoryDiv.appendChild(tooltip);
                }
            
                phenotypeContainer.appendChild(categoryDiv);
            }
            
            
            

            mousePhenotypeCell.appendChild(phenotypeContainer);

        } 

        // Panel App Count Cell
        const panelAppCell = row.insertCell();
        panelAppCell.classList.add("px-6", "py-4");
        panelAppCell.textContent = `${result.panelAppEnglandCount || 0} / ${result.panelAppAustraliaCount || 0}`; // Display counts for England and Australia
    });

    stopLoader();
}
function displayItems(type) {
    const items = getItems(type);
    const container = (type === 'gene') ? document.querySelector('.flex-wrap.gene-items') : document.querySelector('.flex-wrap.phenotype-items');
    if(type==='gene'){

        document.querySelector('.genes-count').textContent = `RESEARCH ${Object.keys(items).length} GENES`;
    }
    if (container) {
        container.innerHTML = ''; // Clear existing content

        items.forEach(item => {
            const geneElement = document.createElement('div');
            geneElement.className = 'bg-gray-200 text-gray-700 rounded-full text-ml font-mono font-bold px-4 py-2 flex items-center space-x-2';
            geneElement.textContent = item; // Set the text content directly
            const svgIcon = createSvgIcon(type, item); // Create the SVG element with click handler
            geneElement.appendChild(svgIcon);
            container.appendChild(geneElement);
            
        });
        
    } else {
        
        console.error("Container element not found!");
    }
    
}
function addPhenotype(phenotype) {
    const data = JSON.parse(localStorage.getItem('data'));
    const phenotypes = data.find(item => item.type === 'phenotype');
    if (!phenotypes.items.includes(phenotype)) {
    phenotypes.items.push(phenotype);
    localStorage.setItem('data', JSON.stringify(data));
    console.log("Phenotype added:", phenotype);
    displayItems('phenotype'); // Met à jour l'affichage
    }
}
function addGene(gene) {
    const data = JSON.parse(localStorage.getItem('data'));
    const genes = data.find(item => item.type === 'gene');
    if (!genes.items.includes(gene)) {
        genes.items.push(gene);
        localStorage.setItem('data', JSON.stringify(data));
        console.log("Gene added:", gene);
        displayItems('gene'); // Update the display
    }
}
function createSvgIcon(type, item) {
    const svgIcon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svgIcon.setAttribute('class', 'w-6 h-6 hover:text-gray-600 text-gray-800 dark:text-white');
    svgIcon.setAttribute('aria-hidden', 'true');
    svgIcon.setAttribute('width', '24');
    svgIcon.setAttribute('height', '24');
    svgIcon.setAttribute('fill', 'currentColor');
    svgIcon.setAttribute('viewBox', '0 0 24 24');
    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute('fill-rule', 'evenodd');
    path.setAttribute('d', 'M2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10S2 17.523 2 12Zm7.707-3.707a1 1 0 0 0-1.414 1.414L10.586 12l-2.293 2.293a1 1 0 1 0 1.414 1.414L12 13.414l2.293 2.293a1 1 0 0 0 1.414-1.414L13.414 12l2.293-2.293a1 1 0 0 0-1.414-1.414L12 10.586 9.707 8.293Z');
    path.setAttribute('clip-rule', 'evenodd');
    svgIcon.appendChild(path);
    svgIcon.addEventListener('click', () => removeItem(type, item)); // Attach click listener
    return svgIcon;
}
function getItems(type) {
    const data = JSON.parse(localStorage.getItem('data'));
    const typeObject = data.find(item => item.type === type); 
    return typeObject ? typeObject.items : []; // Return empty array if type not found
}
function removeItem(type, itemToRemove) {
    const data = JSON.parse(localStorage.getItem('data'));
    const items = data.find(item => item.type === type).items;
    const updatedItems = items.filter(item => item !== itemToRemove);
    data.find(item => item.type === type).items = updatedItems;
    localStorage.setItem('data', JSON.stringify(data));
    console.log("Item removed:", itemToRemove);
    displayItems(type) // Refresh the display
}
function clearList(type) {
    console.log("List cleared:", type);
    const data = JSON.parse(localStorage.getItem('data'));
    const items = data.find(item => item.type === type);
    items.items = []; // Clear the list of items
    localStorage.setItem('data', JSON.stringify(data));
    displayItems(type) // Refresh the display
}
async function showSuggestions(type) {
    const inputField = document.getElementById(type === 'gene' ? "geneInput" : "phenotypeInput");
    const suggestionsContainer = document.getElementById(type === 'gene' ? "geneSuggestions" : "phenotypeSuggestions");
    const query = inputField.value.trim();

    suggestionsContainer.innerHTML = ""; // Clear previous suggestions

    if (query) {
        try {
            const terms = type === 'gene' ? await fetchGenesAPI(query) : await fetchPhenotypesAPI(query);
            if (terms.length > 0) {
                terms.forEach(term => {
                    const listItem = document.createElement("li");
                    listItem.textContent = term.name;
                    listItem.className = "p-2 hover:bg-blue-100 cursor-pointer";
                    listItem.onclick = () => selectItem(type, term.name);
                    suggestionsContainer.appendChild(listItem);
                });
                suggestionsContainer.classList.remove("hidden");
            } else {
                suggestionsContainer.classList.add("hidden");
            }
        } catch (error) {
            console.error("Error fetching suggestions:", error);
            suggestionsContainer.classList.add("hidden");
        }
    } else {
        suggestionsContainer.classList.add("hidden"); // Hide if query is empty
    }
}
function selectItem(type, item) {  
    const inputField = document.getElementById(type === 'gene' ? "geneInput" : "phenotypeInput");
    const suggestions = document.getElementById(type === 'gene' ? "geneSuggestions" : "phenotypeSuggestions"); 
    inputField.value = '';     
    inputField.focus();       
    suggestions.classList.add("hidden");
    if (type === 'gene') {
        addGene(item);
    } else if (type === 'phenotype') {
        addPhenotype(item);
    }
}
async function fetchPhenotypesAPI(query) {
    try {
        const response = await fetch(`https://ontology.jax.org/api/hp/search?q=${encodeURIComponent(query)}&page=0&limit=10`);
        if (!response.ok) {
            throw new Error('Failed to fetch data from OLS API');
        }
        const data = await response.json();
        console.log(data.terms)
        return data.terms;
    } catch (error) {
        console.error("Fetch error:", error);
        return []; // Return an empty array on error
    }
}
async function fetchGenesAPI(query) {
    try {
        const apiUrl = `https://clinicaltables.nlm.nih.gov/api/ncbi_genes/v3/search?terms=${encodeURIComponent(query)}&maxList=10`; //CORS BYPASS NEED TO CHANGE BEFORE PROD
        const response = await fetch(apiUrl, {
            headers: {
                'Content-Type': 'application/json',
                'Origin': 'http://localhost:3000'
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch data for gene symbol ${query}`);
        }

        let data = await response.json();
        const geneSymbols = data[3].map(gene => ({
            name: gene[3] 
        }));
        // Return data in the same structure as fetchPhenotypesAPI
        return geneSymbols

    } catch (error) {
        console.error("Fetch error:", error);
        return []; // Return an empty array on error
    }
}
function parseGeneXML(xmlString) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, "application/xml");
    const docs = xmlDoc.getElementsByTagName("doc");
    const genes = [];

    Array.from(docs).forEach(doc => {
        const symbol = doc.querySelector("str[name='symbol']").textContent;
        const hgnc_id = doc.querySelector("str[name='hgnc_id']").textContent;
        genes.push({ symbol, hgnc_id });
    });

    return genes;
}