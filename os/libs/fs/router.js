const express = require('express'),
fs = require('fs'),
isBinaryFile = require("isbinaryfile"),
router = express.Router(),
drivelist = require('drivelist');
const dirTree = require('directory-tree');

// define the home page route
router.get('/drive', function (req, res) {
	drivelist.list((error, drives) => {
		if (error) {
			throw error;
		}

		res.json(drives)
	});
})

router.get('/isbinary/*', function (req, res) {
	var path = decodeURI(req.originalUrl).split('os/libs/fs/isbinary/')[1];
	
	var bin = isBinaryFile.sync(path)
	res.json([bin])
})

router.get('/dirtree/*', function (req, res) {
	/\.txt$/
	var path = decodeURI(req.originalUrl).split('os/libs/fs/dirtree/')[1];
	
	tree = dirTree(path, {exclude:/\.git$/});
	res.json(tree);
})

router.get('/ls/*', function (req, res) {
	var path = decodeURI(req.originalUrl).split('os/libs/fs/ls/')[1]
	var files = []
	fs.readdir(path, function(err, items) {
		for (var i=0; i<items.length; i++) {
			var file = {path: path + '/' + items[i], filename: items[i]};
			
			var stat = {};
			try{
				stat = fs.lstatSync(file.path);
				stat.directory = stat.isDirectory();
				stat.symbolicLink = stat.isSymbolicLink()
				//stat.binary = isBinaryFile.sync(file.path)
			}
			catch(e){
				
			}
			file.stat = stat;
			files.push(file)
		}
		res.json(files)
	});
})

router.get('/read/ASCII/*', function (req, res) {
	var path = decodeURI(req.originalUrl).split('ASCII/')[1]
	fs.readFile(path, 'utf8', function read(err, data) {
		if (err) {
			throw err;
		}
		res.send(data);
	});
})

router.post('/save/ASCII/*', function (req, res) {
	var path = decodeURI(req.originalUrl).split('ASCII/')[1]
	/*fs.readFile(path, 'utf8', function read(err, data) {
		if (err) {
			throw err;
		}
		res.send(data);
	});*/
	
	//console.log(req.body.buffer)
	
	fs.writeFile(path, req.body.buffer, (err) => {  
		// throws an error, you could also catch it here
		if (err){
			res.json({status: false})
		}
		else{
			res.json({status: true})
		}
	});
})

module.exports = router