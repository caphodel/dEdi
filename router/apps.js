var express = require('express')
var router = express.Router()
const fs = require('fs');

// define the home page route
router.get('/installed', function (req, res) {
	fs.readdir('./os/apps/', (err, files) => {
		res.send(files)
	})
})

module.exports = router