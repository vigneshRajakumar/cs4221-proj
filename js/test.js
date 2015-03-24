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

paper.on('cell:pointerup', function(cellView, evt, x, y) {

    // Find the first element below that is not a link nor the dragged element itself.
    var elementBelow = graph.get('cells').find(function(cell) {
        if (cell instanceof joint.dia.Link) return false; // Not interested in links.
        if (cell.id === cellView.model.id) return false; // The same element as the dropped one.
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
        // Move the element a bit to the side.
        cellView.model.translate(-200, 0);
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
    //This function now converts to JSON. Later have to generate SQL from this
    var js = JSON.stringify(graph.toJSON());
    console.log(js);
});