// utils/getUniProtFunction.js
const axios = require('axios');

/**
 * Récupère la fonction d'une protéine depuis l'API UniProt
 * @param {String} uniprotId - Identifiant UniProt de la protéine
 * @returns {String} - Description de la fonction ou "No match"
 */
async function getUniProtFunction(uniprotId) {
    try {
        const uniProtApiUrl = `https://www.ebi.ac.uk/proteins/api/proteins/${uniprotId}.xml`;
        console.log(`Fetching UniProt data for ID: ${uniprotId} from URL: ${uniProtApiUrl}`);
        const response = await axios.get(uniProtApiUrl, { headers: { 'Accept': 'application/json' } });
        const getKeywordsCSV = await axios.get('https://ftp.uniprot.org/pub/databases/uniprot/current_release/knowledgebase/complete/docs/keywlist.txt')
        const keywordsCSV = getKeywordsCSV.data
        const biologicalProcessKeywords = [];

        //console.log(keywordsCSV)
        let functionKeywords = [];

        if (response.status === 200) {
            console.log(`Successfully fetched data for ${uniprotId}`);
            const data = response.data;
            let proteinMatch = null;

            if (data.comments && Array.isArray(data.comments)) {
                data.comments.some((element) => {
                    if (element.type === "FUNCTION") {
                        proteinMatch = element.text[0].value;
                        // Extracting function keywords
                        for (let i = 0; i < Object.keys(data.keywords).length; i++){
                            functionKeywords.push(data.keywords[i].value)
                        }
                        // ADD HERE: Process each function keyword
                        functionKeywords.forEach(keyword => {
                            // Search for the keyword in keywordsCSV by matching the ID line
                            const keywordEntry = keywordsCSV.split('//').find(entry => 
                                entry.includes(`ID   ${keyword}`)
                            );

                            if (keywordEntry) {
                                // Check if the CA line is "Biological process"
                                const isBiologicalProcess = keywordEntry.split('\n').some(line =>
                                    line.startsWith('CA') && line.includes('Biological process')
                                );

                                // If it is a biological process, add it to the list
                                if (isBiologicalProcess) {
                                    biologicalProcessKeywords.push(keyword);
                                }
                                
                            }
                        });

                        //ADD HERE
                        
                        
                        return true; // Arrêter l'itération une fois trouvé
                    }
                });
            }
            //Add keywords to proteinMatch
            proteinMatch = proteinMatch 
            keywordsMatch = biologicalProcessKeywords;
            const result = {
                proteinMatch: proteinMatch,
                keywordsMatch: biologicalProcessKeywords
            };
            console.log(biologicalProcessKeywords)
            return result

        } else {
            console.error(`UniProt API responded with status: ${response.status}`);
            return "No match";
        }
    } catch (error) {
        console.error("Error fetching UniProt data:", error.message);
        return "No Function Found";
    }
}

module.exports = getUniProtFunction;
