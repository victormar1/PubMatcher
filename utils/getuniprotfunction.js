// utils/getUniProtFunction.js
const axios = require('axios');

/**
 * Récupère la fonction d'une protéine depuis l'API UniProt
 * @param {String} uniprotId - Identifiant UniProt de la protéine
 * @returns {String} - Description de la fonction ou "No match"
 */
async function getUniProtFunction(uniprotId) {
    try {
        const uniProtApiUrl = `https://www.ebi.ac.uk/proteins/api/proteins/${uniprotId}`;
        console.log(`Fetching UniProt data for ID: ${uniprotId} from URL: ${uniProtApiUrl}`);
        const response = await axios.get(uniProtApiUrl, { headers: { 'Accept': 'application/json' } });

        if (response.status === 200) {
            console.log(`Successfully fetched data for ${uniprotId}`);
            const data = response.data;
            let proteinMatch = null;

            if (data.comments && Array.isArray(data.comments)) {
                data.comments.some((element) => {
                    if (element.type === "FUNCTION") {
                        proteinMatch = element.text[0].value;
                        return true; // Arrêter l'itération une fois trouvé
                    }
                });
            }

            return proteinMatch || "No match";
        } else {
            console.error(`UniProt API responded with status: ${response.status}`);
            return "No match";
        }
    } catch (error) {
        console.error("Error fetching UniProt data:", error.message);
        return "No UniProt match";
    }
}

module.exports = getUniProtFunction;
