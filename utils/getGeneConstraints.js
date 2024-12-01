const path = require('path')
const fs = require('fs')
const csv = require('csv-parser')

let constraints = {}
loadConstraints('v2', 'constraints_v2.csv')
loadConstraints('v4', 'constraints_v4.csv')
const constraints_v2 = constraints.v2 || {}
const constraints_v4 = constraints.v4 || {}

// TODO Refactor needed
async function getGeneConstraints(gene) {
  let geneConstraintsV2 = null
  let geneConstraintsV4 = null
  let constraintsDelta = false

  emptyConstraints = {
    pLI: 'N/A',
    oe_mis_upper: 'N/A',
    oe_lof_upper: 'N/A',
    mis_z: 'N/A'
  }

  if (constraints_v2[gene]) {
    geneConstraintsV2 = constraints_v2[gene]
  } else {
    geneConstraintsV2 = emptyConstraints
    constraintsDelta = true
  }

  if (constraints_v4[gene]) {
    geneConstraintsV4 = constraints_v4[gene]
  } else {
    geneConstraintsV4 = emptyConstraints
    constraintsDelta = true
  }

  if (JSON.stringify(geneConstraintsV2) === JSON.stringify(geneConstraintsV4)) {
    constraintsDelta = false //If both na dnt flag
  }

  if (constraints_v2[gene] && constraints_v4[gene]) {
    const parseValue = (value) => parseFloat(value.toString().replace(',', '.'))

    const v2 = {
      oe_mis_upper: parseValue(constraints_v2[gene].oe_mis_upper),
      oe_lof_upper: parseValue(constraints_v2[gene].oe_lof_upper),
      pLI: parseValue(constraints_v2[gene].pLI),
      mis_z: parseValue(constraints_v2[gene].mis_z)
    }

    const v4 = {
      oe_mis_upper: parseValue(constraints_v4[gene].oe_mis_upper),
      oe_lof_upper: parseValue(constraints_v4[gene].oe_lof_upper),
      pLI: parseValue(constraints_v4[gene].pLI),
      mis_z: parseValue(constraints_v4[gene].mis_z)
    }

    const perc = 1.5 // * threshold
    if (v2.pLI === 0 || v4.pLI === 0) {
      constraintsDelta = v2.pLI !== v4.pLI
    } else {
      const conditionPLi = v4.pLI >= v2.pLI * perc || v4.pLI <= v2.pLI / perc
      constraintsDelta = conditionPLi
    }
  }

  // * RETURN THE RESULT
  return {
    constraints_v2: geneConstraintsV2,
    constraints_v4: geneConstraintsV4,
    constraintsDelta
  }
}

function loadConstraints(datasetKey, fileName) {
  const constraintsPath = path.join(__dirname, '..', 'BDD', fileName)

  // Ensure constraints container for the datasetKey exists
  if (!constraints[datasetKey]) {
    constraints[datasetKey] = {}
  }

  fs.createReadStream(constraintsPath)
    .pipe(csv({ separator: ';' }))
    .on('data', (row) => {
      constraints[datasetKey][row.gene] = {
        pLI: row.pLI,
        oe_mis_upper: row.oe_mis_upper,
        oe_lof_upper: row.oe_lof_upper,
        mis_z: row.mis_z
      }
    })
    .on('end', () => {
      console.log(`Constraints CSV file (${datasetKey}) successfully processed`)
    })
    .on('error', (error) => {
      console.error(`Error reading constraints CSV (${datasetKey}):`, error)
    })
}

module.exports = getGeneConstraints
