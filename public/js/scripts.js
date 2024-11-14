// scripts.js

window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-PGNGTTRTN2');

document.addEventListener('DOMContentLoaded', function() {


    const addGeneButton = document.getElementById('addGeneButton');
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
   
    const clearTextButton = document.getElementById('clearTextArea');
    clearTextButton.addEventListener('click', () => {
        clearList('gene');
    });

   

    //Look for stored persistent data on DOM load
    if (!localStorage.getItem('data')) {
        localStorage.setItem('data', JSON.stringify([{ type: 'gene', items: [] }, { type: 'phenotype', items: [] }]));
    }
    
    
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


// Afficher les éléments
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


function createSvgIcon(type, item) {
    const svgIcon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    // ... (set SVG attributes - same as before)
    svgIcon.addEventListener('click', () => removeItem(type, item)); // Attach click listener directly to SVG
    return svgIcon;
}

function addPhenotype(phenotype) {
    const data = JSON.parse(localStorage.getItem('data'));
    const genes = data.find(item => item.type === 'phenotype');
    genes.items.push(phenotype);
    localStorage.setItem('data', JSON.stringify(data));
    displayItems('phenotype'); // Met à jour l'affichage
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
    svgIcon.setAttribute('class', 'w-6 h-6 text-gray-800 dark:text-white');
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




