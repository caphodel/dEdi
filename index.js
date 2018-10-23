process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
//load required module
//const ReloadRouter = require('express-route-reload')
const reload = require('require-reload')(require)
const express = require("express");
const path = require("path");
const nodeinfo = require("node-info");
const bodyParser = require('body-parser')
const fs = require('fs');
//const reloadRouter = new ReloadRouter.ReloadRouter();
const app = express();
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('os.sqlite', function(e){
	console.log(e)
});

express.request.db = express.response.db = db;
express.request.apps = {}

//app.use(reloadRouter.handler());
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }))

// parse application/json
app.use(bodyParser.json())

/* start router */
var router=[];

const options = {
	key: fs.readFileSync('key-20180921-085022.pem', 'utf8'),
	cert: fs.readFileSync('cert-20180921-085022.crt', 'utf8'),
	passphrase: process.env.HTTPS_PASSPHRASE || ''
};

var WebSocketServer = require('ws').Server;

var WSSusers = {};

//creating a websocket server at port 9090 
var wss = new WebSocketServer({port: 9090});

wss.on('connection', function(connection) {
	WSSusers = connection;
})

/*router['info'] = require('./router/info')
app.use('/', router['info'])*/

app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

router['test'] = require('./router/test')
app.use('/', router['test'])

router['apps'] = require('./router/apps')
app.use('/apps', router['apps'])

app.get('/refresh/:router', function (req, res) {
	//var newRouter = require(`./router/${req.params.router}`);
	//router['test'] = require(`./router/${req.params.router}`);
	//app.use('/', router['test'])
	try {
		router['test'] = reload(`./router/${req.params.router}`);
		app.use('/', router['test'])
		res.send("success")
	} catch (e) {
		console.error("Failed to reload router.js! Error: ", e);
		res.send("failed")
	}
})

app.get('/os/reg/defaults', function(req, res){
	req.db.all("SELECT * from `defaults`", [], function(err, rows) {
		if(err==null){
			var data = {};
			rows.forEach(function(val, i){
				data[val.target] = val.value
			})
			res.json({status: true, data: data})
		}
		else{
			res.json({status: false})
		}
	});
})

app.get('/json/*', function(req, res){
	fs.readFile('./os'+decodeURI(req.originalUrl).replace('/json/', '/'), function read(err, data) {
		if (err) {
			throw err;
		}
		content = data;

		// Invoke the next step here however you like
		//console.log(content);   // Put all of the code here (not the best solution)
		res.json(JSON.parse(content.toString()));
	});
})

app.use(express.static('os'))

fs.readdir('./os/libs/', (err, files) => {
	files.forEach((file) => {
		var obj;
		var data = fs.readFileSync(`./os/libs/${file}/package.json`, 'utf8')
		obj = JSON.parse(data);
		if(obj.server){
			Object.keys(obj.server).forEach(function(i){
				var val = obj.server[i], js = `./os/libs/${file}/${val}`;
				router[js] = require(js);
				console.log('/os/libs/'+file.replace(/\s/g,'') + ' ready')
				app.use('/os/libs/'+file.replace(/\s/g,''), router[js]);
			});
		}
	});
	
	initApps()
})

function initApps(){
	fs.readdir('./os/apps/', (err, files) => {
		files.forEach((file) => {
			router[file] = require(`./os/apps/${file}/router`);
			if(router[file].init!=undefined)
				router[file].init(express);
			console.log('/os/apps/'+file.replace(/\s/g,'') + ' ready')
			app.use('/os/apps/'+file.replace(/\s/g,''), router[file]);
		});
		
		server()
	})
}

/* end router */
function server(){
	app.use(nodeinfo({
		url: '/info',
		check: function(req) {
			if (req.something === false) {

				// don't show nodeinfo
				return false;
			}

			// show nodeinfo
			return true;
		}
	}));


	const PORT = process.env.PORT || 80;
	app.listen(PORT, () => {
	  console.log(`Listening at port ${PORT}...`);
	});
}