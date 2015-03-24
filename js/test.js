var graph = new joint.dia.Graph;
//buttons
var addEntityButton = $("#addEntity");
var addRelationButton = $("#addRelation");
var addAttributeButton = $('#addAttribute');
var addCardButton = $('#addCard');
var toSQLButton = $('#toSQL');

var elementArray = new Array();
var linkArray = new Array();

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
    linkArray.push(myLink)
    return myLink;
};



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

addEntityButton.click(function() {
    var elementToPush = element(erd.Entity,100,200,$('#NameInput').val());
    elementToPush.isSelected = false;
    elementArray.push(elementToPush);
});

addRelationButton.click(function() {
    var elementToPush = element(erd.Relationship,200,200, $('#NameInput').val());
    elementToPush.isSelected = false;
    for (var i=0; i<elementArray.length; i++) {
        console.log(elementArray[i])
        if(elementArray[i].isSelected) {        
            link(elementArray[i],elementToPush);
        }
    }
    elementArray.push(elementToPush);
});

addAttributeButton.click(function() {
    var elementToPush = element(erd.Normal,300,200, $('#NameInput').val());
    elementToPush.isSelected = false;
    for (var i=0; i<elementArray.length; i++) {
        console.log(elementArray[i])
        if(elementArray[i].isSelected) {        
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

toSQLButton.click(function() {
	var sqlQuery = "";
	
    for	(i = 0; i < elementArray.length; i++) {
		if(elementArray[i].attributes.type == "erd.Entity"){
			var ent_id = elementArray[i].attributes.id;
			var table_name = removeSpace(elementArray[i].attributes.attrs.text.text);
			var table_fields = "";
			
			for (j = 0; j < linkArray.length; j++){
				if(linkArray[j].attributes.source.id == ent_id){
					for(k = 0; k < elementArray.length; k++) { 
						if(elementArray[k].attributes.id == linkArray[j].attributes.target.id && elementArray[k].attributes.type == "erd.Normal"){
							table_fields += removeSpace(elementArray[k].attributes.attrs.text.text);
							table_fields += " varchar(255), ";
						}
					}
				}
				else if(linkArray[j].attributes.target.id == ent_id) {
					for(k = 0; k < elementArray.length; k++) { 
						if(elementArray[k].attributes.id == linkArray[j].attributes.source.id && elementArray[k].attributes.type == "erd.Normal"){
							table_fields += removeSpace(elementArray[k].attributes.attrs.text.text);
							table_fields += " varchar(255), ";
						}
					}
				}
			}
			
			sqlQuery += "CREATE TABLE " + table_name;
			
			if(table_fields.length != 0){
				table_fields = table_fields.slice(0, table_fields.length-2);
				sqlQuery += "(" + table_fields + ")";
			}
			
			sqlQuery += ";"
			
			console.log(sqlQuery);
		}
	}
    for	(index = 0; index < linkArray.length; index++) {
		console.log(linkArray[index].attributes.type);
	}
	
    //This function now converts to JSON. Later have to generate SQL from this
    var js = JSON.stringify(graph.toJSON());
    console.log(js);
});

function removeSpace(inputString){
	return inputString.replace(" ", "_");
};

//-----------below this is demo code
/*
var rect = new joint.shapes.basic.Rect({
    position: { x: 100, y: 30 },
    size: { width: 100, height: 30 },
    attrs: { rect: { fill: 'blue' }, text: { text: 'my box', fill: 'white' } }
});

var rect2 = rect.clone();
rect2.translate(300);

var link = new joint.dia.Link({
    source: { id: rect.id },
    target: { id: rect2.id }
});



graph.addCells([rect, rect2, link]);*/