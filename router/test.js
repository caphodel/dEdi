var express = require('express')
var router = express.Router()
const nodeinfo = require('nodejs-info');

// define the home page route
router.get('/test', function (req, res) {
	res.send("test")
})

module.exports = router