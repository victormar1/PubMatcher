// scripts.js

window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-PGNGTTRTN2');

document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('bug-report-modal');
    const btn = document.getElementById('bug-report-button');
    const span = document.getElementsByClassName('close')[0];
    const searchForm = document.getElementById('searchForm');
    const genesInput = document.getElementById('genesInput');
    const seqOneBtn = document.getElementById('seqOneBtn');
    const seqOnePopin = document.getElementById('seqOnePopin');
    const seqOneInput = document.getElementById('seqOneInput');
    const seqOneSubmit = document.getElementById('seqOneSubmit');
    const loader = document.getElementById('loader');


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


    searchForm.addEventListener('submit', function() {
        loader.style.display = 'block'; // OBSCURE LOADER BUSINESS
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
