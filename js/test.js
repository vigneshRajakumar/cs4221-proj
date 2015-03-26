var graph = new joint.dia.Graph;
//buttons
var addEntityButton = $("#addEntity");
var addRelationButton = $("#addRelation");
var addAttributeButton = $('#addAttribute');
var addCardButton = $('#addCard');
var toSQLButton = $('#toSQL');
var addPrimaryKeyButton = $('#addPKey');
var removeButton = $('#remove');

var elementArray = new Array();
var linkArray = new Array();
var keyArray = new Array();
var keyListArray = new Array();

var paper = new joint.dia.Paper({
    el: $('#myholder'),
    width: 1600,
    height: 600,
    model: graph,
    gridSize: 1
});

var erd = joint.shapes.erd;

var element = function(elm,x,y,label) {
    var cell = new elm({ position: { x: x, y: y }, attrs: { text: { text: label }}});
    graph.addCell(cell);
    return cell;
};

var link = function(elm1, elm2) {
    var myLink = new erd.Line({ source: { id: elm1.id }, target: { id: elm2.id }});
    graph.addCell(myLink);
    linkArray.push(myLink);
    return myLink;
};

var keyNote = function(id ,table, pKey) {
    var keyLink = {id: id, table: table, pKey: pKey};
    keyArray.push(keyLink);
};

var keyListNote = function(id, pKey) {
	var keyLink = {id: id, pKey: pKey};
	keyListArray.push(keyLink);
}

paper.on('cell:pointerclick', 
    function(cellView, evt, x, y) { 
        cellView.model.isSelected = !cellView.model.isSelected;
        if(cellView.model.isSelected) {
            paper.findViewByModel(cellView.model).highlight();
        }
        else {
            paper.findViewByModel(cellView.model).unhighlight();
        }
    }
);

paper.on('cell:pointerup', function(cellView, evt, x, y) {

    // Find the first element below that is not a link nor the dragged element itself.
    var elementBelow = graph.get('cells').find(function(cell) {
        if (cell instanceof joint.dia.Link) return false; // Not interested in links.
        if ((cell.attributes.type == "erd.Normal")||(cell.attributes.type == "erd.Key")) return false; // Not interested in anything except entities and relations.
		if((cellView.model.attributes.type=="erd.Entity")&&(cell.attributes.type=="erd.Entity")) return false;
        if (cell.id === cellView.model.id) return false; // The same element as the dropped one.
		if (cellView.model.attributes.type == "erd.Normal" || cellView.model.attributes.type == "erd.Key"){
			for (var i = 0; i < linkArray.length; i++){	
				if (linkArray[i].attributes.target.id == cellView.model.id || linkArray[i].attributes.source.id == cellView.model.id)
					return false;
			}
		}
        if (cell.getBBox().containsPoint(g.point(x, y))) {
            return true;
        }
        return false;
    });
    
    // If the two elements are connected already, don't
    // connect them again (this is application specific though).
    if (elementBelow && !_.contains(graph.getNeighbors(elementBelow), cellView.model)) {
        
        graph.addCell(new erd.Line({
            source: { id: cellView.model.id }, target: { id: elementBelow.id }//,
            //attrs: { '.marker-source': { d: 'M 10 0 L 0 5 L 10 10 z' } }
        }));
		link(cellView.model,elementBelow);
        // Move the element a bit to the side.
        cellView.model.translate(-50, 0);
    }
});    

addEntityButton.click(function() {
    var elementToPush = element(erd.Entity,100,200,$('#NameInput').val());
    elementToPush.isSelected = false;
    elementArray.push(elementToPush);
});

addRelationButton.click(function() {
    var elementToPush = element(erd.Relationship,200,200, $('#NameInput').val());
    elementToPush.isSelected = false;
    for (var i=0; i<elementArray.length; i++) {
        if(elementArray[i].isSelected && elementArray[i].attributes.type == "erd.Entity") {        
            link(elementArray[i],elementToPush);
        }
    }
    elementArray.push(elementToPush);
});

addAttributeButton.click(function() {
    var elementToPush = element(erd.Normal,300,200, $('#NameInput').val());
    elementToPush.isSelected = false;
    for (var i=0; i<elementArray.length; i++) {
        if(elementArray[i].isSelected && (elementArray[i].attributes.type == "erd.Entity" || elementArray[i].attributes.type == "erd.Relationship")) {        
            link(elementArray[i],elementToPush);
            break;
        }
    }
    elementArray.push(elementToPush);
});

addPrimaryKeyButton.click(function() {
    var elementToPush = element(erd.Key,300,200, $('#NameInput').val());
    elementToPush.isSelected = false;
    for (var i=0; i<elementArray.length; i++) {
        console.log(elementArray[i])
        if(elementArray[i].isSelected && elementArray[i].attributes.type == "erd.Entity") {        
            link(elementArray[i],elementToPush);
            break;
        }
    }
    elementArray.push(elementToPush);
});

addCardButton.click(function() {
    for (var i=0; i<linkArray.length; i++){
        console.log(linkArray[i]);
        if(linkArray[i].isSelected){
            var cardInput = $('#CardInput').val()
            linkArray[i].cardinality(cardInput);
        }
    }
});

removeButton.click(function() {

    for (var i=0; i<linkArray.length; i++){
        if(linkArray[i].isSelected){
		 linkArray.splice(i,1);
        }
    }
	
    for (var i=0; i<elementArray.length; i++) {
        if(elementArray[i].isSelected) {
		 for (var j=0; j<linkArray.length; j++){
			if((linkArray[j].attributes.target.id == elementArray[i].attributes.id)||(linkArray[j].attributes.source.id== elementArray[i].attributes.id)){
				if((elementArray[i].attributes.type == "erd.Entity")||(elementArray[i].attributes.type=="erd.Relationship")){
					for(var k=0;k<elementArray.length;k++){
						if((elementArray[k].attributes.type=="erd.Normal")&&(elementArray[k].attributes.id==linkArray[j].attributes.source.id))
						{
							elementArray.splice(k,1);
						}
					}
				}
				linkArray.splice(j,1);
				j=-1;
			}
			else if(linkArray[j].attributes.source.id== elementArray[i].attributes.id){
				if((elementArray[i].attributes.type == "erd.Entity")||(elementArray[i].attributes.type=="erd.Relationship")){
					for(var k=0;k<elementArray.length;k++){
						if((elementArray[k].attributes.type=="erd.Normal")&&(elementArray[k].attributes.id==linkArray[j].attributes.target.id))
						{
							elementArray.splice(k,1);
						}
					}
				}
				linkArray.splice(j,1);
				j=-1;
			}
		 }
         elementArray.splice(i,1);
        }
    }
});

toSQLButton.click(function() {
	var sqlQuery = "";
	keyArray.length = 0;
	keyListArray.length = 0;
		
    for	(i = 0; i < elementArray.length; i++) {
		if(elementArray[i].attributes.type == "erd.Entity"){
			var ent_id = elementArray[i].attributes.id;
			var table_name = removeSpace(elementArray[i].attributes.attrs.text.text);
			var table_fields = "";
			var ifPKey = false;
			var pKey = "";
			
			for (j = 0; j < linkArray.length; j++){
				if(linkArray[j].attributes.source.id == ent_id){
					for(k = 0; k < elementArray.length; k++) { 
						console.log(elementArray[k].attributes.type);
						if(elementArray[k].attributes.id == linkArray[j].attributes.target.id && elementArray[k].attributes.type == "erd.Normal"){
							table_fields += removeSpace(elementArray[k].attributes.attrs.text.text);
							table_fields += " varchar(255), ";
						}
						
						else if(elementArray[k].attributes.id == linkArray[j].attributes.target.id && elementArray[k].attributes.type == "erd.Key"){
							table_fields += removeSpace(elementArray[k].attributes.attrs.text.text);
							table_fields += " varchar(255), ";
							ifPKey = true;
							pKey += removeSpace(elementArray[k].attributes.attrs.text.text) + ", ";
							keyListNote(ent_id, removeSpace(elementArray[k].attributes.attrs.text.text));
						}
					}
				}
				else if(linkArray[j].attributes.target.id == ent_id) {
					for(k = 0; k < elementArray.length; k++) { 
						console.log(elementArray[k].attributes.type);
						if(elementArray[k].attributes.id == linkArray[j].attributes.source.id && elementArray[k].attributes.type == "erd.Normal"){
							table_fields += removeSpace(elementArray[k].attributes.attrs.text.text);
							table_fields += " varchar(255), ";
						}
						
						else if(elementArray[k].attributes.id == linkArray[j].attributes.source.id && elementArray[k].attributes.type == "erd.Key"){
							table_fields += removeSpace(elementArray[k].attributes.attrs.text.text);
							table_fields += " varchar(255), ";
							ifPKey = true;
							pKey += removeSpace(elementArray[k].attributes.attrs.text.text) + ", ";
							keyListNote(ent_id, removeSpace(elementArray[k].attributes.attrs.text.text));
						}
					}
				}
			}
			
			sqlQuery += "CREATE TABLE " + table_name;
			
			if(table_fields.length != 0){
				table_fields = table_fields.slice(0, table_fields.length-2);
				sqlQuery += "(" + table_fields;
				
				if(ifPKey){
					pKey = pKey.slice(0, pKey.length-2); 
					sqlQuery += ", PRIMARY KEY (" + pKey + ")";
					keyNote(ent_id, table_name, pKey);
				}
				
				sqlQuery += ")";
			}
			
			sqlQuery += ";"
		}
	}
	
	for	(i = 0; i < elementArray.length; i++) {
		if(elementArray[i].attributes.type == "erd.Relationship"){
			var ent_id = elementArray[i].attributes.id;
			var table_name = removeSpace(elementArray[i].attributes.attrs.text.text);
			var table_fields = "";
			var fKey = "";
			var ifPKey = false;
			var pKey = "";
			
			for (j = 0; j < linkArray.length; j++){
				if(linkArray[j].attributes.source.id == ent_id){
					for(k = 0; k < keyArray.length; k++) { 
						if(keyArray[k].id == linkArray[j].attributes.target.id){
							fKey += "FOREIGN KEY(" + keyArray[k].pKey + ") REFERENCES " + keyArray[k].table + "(" + keyArray[k].pKey + "), ";
							for(l = 0; l < keyListArray.length; l++){
								if(keyListArray[l].id === linkArray[j].attributes.target.id){
									table_fields += keyListArray[l].pKey;
									table_fields += " varchar(255), ";
								}
							}
						}
					}
				}
				else if(linkArray[j].attributes.target.id == ent_id) {
					for(k = 0; k < keyArray.length; k++) { 
						if(keyArray[k].id == linkArray[j].attributes.source.id){
							fKey += "FOREIGN KEY(" + keyArray[k].pKey + ") REFERENCES " + keyArray[k].table + "(" + keyArray[k].pKey + "), ";
							for(l = 0; l < keyListArray.length; l++){
								if(keyListArray[l].id === linkArray[j].attributes.source.id){
									table_fields += keyListArray[l].pKey;
									table_fields += " varchar(255), ";
								}
							}
						}
					}
				}
			}
			
			if(fKey === "")
				break;
				
			for (j = 0; j < linkArray.length; j++){
				if(linkArray[j].attributes.source.id == ent_id){
					for(k = 0; k < elementArray.length; k++) { 
						console.log(elementArray[k].attributes.type);
						if(elementArray[k].attributes.id == linkArray[j].attributes.target.id && elementArray[k].attributes.type == "erd.Normal"){
							table_fields += removeSpace(elementArray[k].attributes.attrs.text.text);
							table_fields += " varchar(255), ";
						}
						
						else if(elementArray[k].attributes.id == linkArray[j].attributes.target.id && elementArray[k].attributes.type == "erd.Key"){
							table_fields += removeSpace(elementArray[k].attributes.attrs.text.text);
							table_fields += " varchar(255), ";
							ifPKey = true;
							pKey += removeSpace(elementArray[k].attributes.attrs.text.text) + ", ";
						}
					}
				}
				else if(linkArray[j].attributes.target.id == ent_id) {
					for(k = 0; k < elementArray.length; k++) { 
						console.log(elementArray[k].attributes.type);
						if(elementArray[k].attributes.id == linkArray[j].attributes.source.id && elementArray[k].attributes.type == "erd.Normal"){
							table_fields += removeSpace(elementArray[k].attributes.attrs.text.text);
							table_fields += " varchar(255), ";
						}
						
						else if(elementArray[k].attributes.id == linkArray[j].attributes.source.id && elementArray[k].attributes.type == "erd.Key"){
							table_fields += removeSpace(elementArray[k].attributes.attrs.text.text);
							table_fields += " varchar(255), ";
							ifPKey = true;
							pKey += removeSpace(elementArray[k].attributes.attrs.text.text) + ", ";
						}
					}
				}
			}
			
			sqlQuery += "CREATE TABLE " + table_name;
			
			if(table_fields.length != 0){
				table_fields = table_fields.slice(0, table_fields.length-2);
				sqlQuery += "(" + table_fields;
				
				if(ifPKey){
					pKey = pKey.slice(0, pKey.length-2); 
					sqlQuery += ", PRIMARY KEY (" + pKey + ")";
				}
				
				fKey = fKey.slice(0, fKey.length-2); 
				sqlQuery += ", " + fKey;
				sqlQuery += ")";
			}
			
			sqlQuery += ";"
		}
	}
		
	var textToWrite = sqlQuery;
	var textFileAsBlob = new Blob([textToWrite], {type:'text/plain'});
	var fileNameToSaveAs = "sqlQuery.txt";
	var downloadLink = document.createElement("a");
	downloadLink.download = fileNameToSaveAs;
	downloadLink.innerHTML = "My Hidden Link";
	
	window.URL = window.URL || window.webkitURL;
	downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
	downloadLink.onclick = destroyClickedElement;
	downloadLink.style.display = "none";
	document.body.appendChild(downloadLink);
	downloadLink.click();
});

function removeSpace(inputString){
	return inputString.replace(" ", "_");
};

function destroyClickedElement(event) {
// remove the link from the DOM
    document.body.removeChild(event.target);
}


