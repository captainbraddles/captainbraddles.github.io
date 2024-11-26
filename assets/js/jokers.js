
    var allTableCells = document.getElementsByTagName("td");
    console.log("All table cells - " + JSON.stringify(allTableCells));

    for (var i = 0, max = allTableCells.length; i < max; i++) {
        var node = allTableCells[i];
        console.log("Insied - " + JSON.stringify(node));

        //get the text from the first child node - which should be a text node
        var currentText = node.childNodes[0].nodeValue;
        console.log("Tesxt - " + currentText);

        //check for 'one' and assign this table cell's background color accordingly 
        if (currentText === 'Will Brown');
        node.style.backgroundColor = "red";
    }

