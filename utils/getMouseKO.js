const axios = require('axios')
const cheerio = require('cheerio')
const path = require('path')
const fs = require('fs')

let svgIcons = []

async function getMouseKO(mgdId) {
  const mouseUrl = `https://www.ebi.ac.uk/mi/impc/solr/genotype-phenotype/select?q=marker_accession_id:"${mgdId}"`
  const matchingPhenotypes = []
  const groupedPhenotypes = {}

  try {
    // * FETCH MOUSE API
    const mouseResponse = await axios.get(mouseUrl)
    mouseResponse.data.response.docs.forEach((doc) => {
      const phenotype = {
        phenotypeName: doc.mp_term_name, // Set the phenotype name
        phenotypeCategory: doc.top_level_mp_term_name[0].replace(/[^a-zA-Z0-9]/g, '_').toLowerCase() // Set the phenotype category
      }
      matchingPhenotypes.push(phenotype) // Add to the list of matching phenotypes
    })

    // * REMOVE DUPLICATES
    const matchingPhenotypesNoDuplicates = [...new Map(matchingPhenotypes.map((item) => [item.phenotypeName, item])).values()]

    matchingPhenotypesNoDuplicates.forEach((item) => {
      const { phenotypeCategory, phenotypeName } = item

      if (!groupedPhenotypes[phenotypeCategory]) {
        groupedPhenotypes[phenotypeCategory] = {
          names: [],
          icon: null
        }
      }
      groupedPhenotypes[phenotypeCategory].names.push(phenotypeName)
      let matchingIcon = 'NoICONFOUND'

      try {
        for (const key in svgIcons) {
          if (svgIcons[key].name === phenotypeCategory) {
            matchingIcon = svgIcons[key]
            groupedPhenotypes[phenotypeCategory].icon = matchingIcon ? matchingIcon.path.replace(/^"|"$/g, '') : ''
            break
          }
        }
      } catch (error) {
        console.error('Error finding SVG icon for category')
      }
    })
  } catch (error) {
    console.error('Error fetching phenotypes from IMPC')
  }
  //GOOFY ASS
  if (Object.keys(groupedPhenotypes).length === 0) {
    groupedPhenotypes['noMatch'] = {
      names: ['No Match'], // Add "No Match" as the name
      icon: svgIcons.find((icon) => icon.name === 'noMatch')?.path.replace(/^"|"$/g, '') || '' // Add the SVG icon
    }
  }
  //NoMatch icon
  if (Object.keys(groupedPhenotypes).length === 0) {
    result.mousePhenotype = 'No match'
  }
  // * RETURN THE RESULT
  console.log(groupedPhenotypes)
  return { mousePhenotypes: groupedPhenotypes }
}

function loadSVGIcons() {
  const entries = []
  const folderPath = 'BDD/SVG/'

  // Lire tous les fichiers dans le dossier
  const files = fs.readdirSync(folderPath)

  files.forEach((file) => {
    const filePath = path.join(folderPath, file)

    // Vérifier si le fichier est un SVG
    if (path.extname(file) === '.svg') {
      // Lire le contenu du fichier SVG
      let svgContent = fs.readFileSync(filePath, 'utf-8')

      svgContent = svgContent
        .replace(/width="[^"]*"/, 'width="25px"') // DEGUELASSE A CHANGER ASAP
        .replace(/height="[^"]*"/, 'height="25px"')

      // Push the modified SVG icon to the array
      svgIcons.push({
        name: path.basename(file, '.svg'), // File name without extension
        path: svgContent // Modified SVG content
      })
    }
  })
  return svgIcons
}

loadSVGIcons()

module.exports = getMouseKO
