// scripts.js

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


    //SUGESTION #DEBUG
    /*
    const modal = document.getElementById('bug-report-modal');
    const btn = document.getElementById('bug-report-button');
    const span = document.getElementsByClassName('close')[0];
    const searchForm = document.getElementById('searchForm');
    const genesInput = document.getElementById('genesInput');
    const seqOneBtn = document.getElementById('seqOneBtn');
    const seqOnePopin = document.getElementById('seqOnePopin');
    const seqOneInput = document.getElementById('seqOneInput');
    const seqOneSubmit = document.getElementById('seqOneSubmit');
    */

    displayItems('gene');
    displayItems('phenotype');
    //Look for stored persistent data on DOM load then init update the containers
    if (!localStorage.getItem('data')) {
        localStorage.setItem('data', JSON.stringify([{ type: 'gene', items: [] }, { type: 'phenotype', items: [] }]));
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


    document.addEventListener('mouseenter', () => {
        location.reload();
    });

    
    

    btn.onclick = function() {
        modal.style.display = 'block';
    }
    
    span.onclick = function() {
        modal.style.display = 'none';
    }
    
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    }
    
    document.getElementById('bug-report-form').onsubmit = async function(event) {
        event.preventDefault();
        const name = document.getElementById('name').value;
        const message = document.getElementById('message').value;
        console.log('Sending bug report:', { name, message });
        try {
            const response = await fetch('/reportbug', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, message })
            });
            if (response.ok) {
                alert('Bug report sent successfully');
                modal.style.display = 'none';
            } else {
                const errorText = await response.text();
                console.error('Failed to send bug report:', errorText);
                alert('Failed to send bug report');
            }
        } catch (error) {
            console.error('Network error:', error);
            alert('Network error');
        }
    }
    
    document.getElementById('textFreeInputBtn').addEventListener('click', () => {
        document.getElementById('textFreePopin').style.display = 'block';
    });
    
    document.getElementById('textFreeSubmit').addEventListener('click', () => {
        const text = document.getElementById('textFreeInput').value;
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
            document.getElementById('textFreePopin').style.display = 'none';
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


function displayItems(type) {
    const items = getItems(type);
    const container = (type === 'gene') ? document.querySelector('.flex-wrap.gene-items') : document.querySelector('.flex-wrap.phenotype-items');

    if (container) {
        container.innerHTML = ''; // Clear existing content

        items.forEach(item => {
            const geneElement = document.createElement('div');
            geneElement.className = 'bg-gray-200 text-gray-700 rounded-full text-xl font-mono font-bold px-4 py-2 flex items-center space-x-2';
            geneElement.textContent = item; // Set the text content directly
            const svgIcon = createSvgIcon(type, item); // Create the SVG element with click handler
            geneElement.appendChild(svgIcon);
            container.appendChild(geneElement);
        });

        console.log(`Updated ${type} list:`, items); // Log updated items directly
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


function selectItem(type, item) {  // Modified to handle both genes and phenotypes
    const inputField = document.getElementById(type === 'gene' ? "geneInput" : "phenotypeInput");
    const suggestions = document.getElementById(type === 'gene' ? "geneSuggestions" : "phenotypeSuggestions"); // Hide the correct list
    inputField.value = '';      // Clear the search bar
    inputField.focus();         // Put the cursor back in the search bar
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

        console.log(data)
        console.log(geneSymbols)

        
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