var path = `C:\\develop\\mid-new\\`;
var fs = require('fs');
 
fs.readdir(path, function(err, items) {
    for (var i=0; i<items.length; i++) {
        var file = path + '/' + items[i];
        console.log("Start: " + file);
 
        var stat = fs.lstatSync(file);
		console.log(stat)
    }
});