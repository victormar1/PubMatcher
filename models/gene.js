// models/gene.js
class Gene {
    constructor(geneName, aliasName, location, maneSelect, mgdId, enzymeId, uniprotIds, hgncId, rgdId, ensemblGeneId, orphanet, dateModified, dateApprovedReserved, validityMarker) {
        this.geneName = geneName;
        this.aliasName = aliasName;
        this.location = location;
        this.maneSelect = maneSelect;
        this.mgdId = mgdId;
        this.enzymeId = enzymeId;
        this.uniprotIds = uniprotIds; 
        this.hgncId = hgncId;
        this.rgdId = rgdId;
        this.ensemblGeneId = ensemblGeneId;
        this.orphanet = orphanet;
        this.dateModified = dateModified;
        this.dateApprovedReserved = dateApprovedReserved;
        this.validityMarker = validityMarker;
    }
    
    
}

module.exports = Gene;
