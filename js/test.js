var graph = new joint.dia.Graph;
//buttons
var addEntityButton = $("#addEntity");
var addRelationButton = $("#addRelation");
var addAttributeButton = $('#addAttribute');

var elementArray = new Array();

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
    var elementToPush = element(erd.Entity,100,200,$('#textInput').val());
    elementToPush.isSelected = false;
    elementArray.push(elementToPush);
});

addRelationButton.click(function() {
    var elementToPush = element(erd.Relationship,200,200, $('#textInput').val());
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
    var elementToPush = element(erd.Normal,300,200, $('#textInput').val());
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