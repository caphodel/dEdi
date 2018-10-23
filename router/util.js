var express = require('express')
var router = express.Router()
const nodeinfo = require('nodejs-info');

// define the home page route
router.get('/refresh/:router', function (req, res) {
	var newRouter = require(`../router/${req.params.router}`);
	var router = []
	for (var key in newRouter.stack[0].route) {
		if (newRouter.stack[0].route.hasOwnProperty(key)) {
			router.push(newRouter)
		}
	}
	reloadRouter.reload(router);
	res.send("success")
})

module.exports = router