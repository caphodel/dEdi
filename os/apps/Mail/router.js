process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
const express = require('express'),
router = express.Router();
const Promise = require('bluebird');
var CircularJSON=function(JSON,RegExp){var specialChar="~",safeSpecialChar="\\x"+("0"+specialChar.charCodeAt(0).toString(16)).slice(-2),escapedSafeSpecialChar="\\"+safeSpecialChar,specialCharRG=new RegExp(safeSpecialChar,"g"),safeSpecialCharRG=new RegExp(escapedSafeSpecialChar,"g"),safeStartWithSpecialCharRG=new RegExp("(?:^|([^\\\\]))"+escapedSafeSpecialChar),indexOf=[].indexOf||function(v){for(var i=this.length;i--&&this[i]!==v;);return i},$String=String;function generateReplacer(value,replacer,resolve){var doNotIgnore=false,inspect=!!replacer,path=[],all=[value],seen=[value],mapp=[resolve?specialChar:"[Circular]"],last=value,lvl=1,i,fn;if(inspect){fn=typeof replacer==="object"?function(key,value){return key!==""&&replacer.indexOf(key)<0?void 0:value}:replacer}return function(key,value){if(inspect)value=fn.call(this,key,value);if(doNotIgnore){if(last!==this){i=lvl-indexOf.call(all,this)-1;lvl-=i;all.splice(lvl,all.length);path.splice(lvl-1,path.length);last=this}if(typeof value==="object"&&value){if(indexOf.call(all,value)<0){all.push(last=value)}lvl=all.length;i=indexOf.call(seen,value);if(i<0){i=seen.push(value)-1;if(resolve){path.push((""+key).replace(specialCharRG,safeSpecialChar));mapp[i]=specialChar+path.join(specialChar)}else{mapp[i]=mapp[0]}}else{value=mapp[i]}}else{if(typeof value==="string"&&resolve){value=value.replace(safeSpecialChar,escapedSafeSpecialChar).replace(specialChar,safeSpecialChar)}}}else{doNotIgnore=true}return value}}function retrieveFromPath(current,keys){for(var i=0,length=keys.length;i<length;current=current[keys[i++].replace(safeSpecialCharRG,specialChar)]);return current}function generateReviver(reviver){return function(key,value){var isString=typeof value==="string";if(isString&&value.charAt(0)===specialChar){return new $String(value.slice(1))}if(key==="")value=regenerate(value,value,{});if(isString)value=value.replace(safeStartWithSpecialCharRG,"$1"+specialChar).replace(escapedSafeSpecialChar,safeSpecialChar);return reviver?reviver.call(this,key,value):value}}function regenerateArray(root,current,retrieve){for(var i=0,length=current.length;i<length;i++){current[i]=regenerate(root,current[i],retrieve)}return current}function regenerateObject(root,current,retrieve){for(var key in current){if(current.hasOwnProperty(key)){current[key]=regenerate(root,current[key],retrieve)}}return current}function regenerate(root,current,retrieve){return current instanceof Array?regenerateArray(root,current,retrieve):current instanceof $String?current.length?retrieve.hasOwnProperty(current)?retrieve[current]:retrieve[current]=retrieveFromPath(root,current.split(specialChar)):root:current instanceof Object?regenerateObject(root,current,retrieve):current}var CircularJSON={stringify:function stringify(value,replacer,space,doNotResolve){return CircularJSON.parser.stringify(value,generateReplacer(value,replacer,!doNotResolve),space)},parse:function parse(text,reviver){return CircularJSON.parser.parse(text,generateReviver(reviver))},parser:JSON};return CircularJSON}(JSON,RegExp);

// define the home page route
router.init = function(express){
	var db = express.request.db;
	db.all(`CREATE TABLE IF NOT EXISTS app_Mail (
	username	TEXT NOT NULL,
	password	TEXT NOT NULL,
	server	TEXT NOT NULL,
	mail_type	TEXT NOT NULL,
	PRIMARY KEY(username)
);

CREATE TABLE IF NOT EXISTS app_Mail_folder (
	unique_id TEXT NOT NULL,
	display_name TEXT NOT NULL,
	total TEXT NOT NULL,
	PRIMARY KEY(unique_id)
);

CREATE TABLE IF NOT EXISTS app_Mail_folder_item (
	unique_id TEXT NOT NULL,
	body TEXT NOT NULL,
	subject TEXT NOT NULL,
	displayTo TEXT NOT NULL,
	displayCc TEXT NOT NULL,
	attachment TEXT NOT NULL,
	dateTimeCreated TEXT NOT NULL,
	dateTimeReceived TEXT NOT NULL,
	dateTimeSent TEXT NOT NULL,
	[from] TEXT NOT NULL,
	isRead TEXT NOT NULL,
	isReadReceiptRequested TEXT NOT NULL,
	folderId TEXT NOT NULL,
	PRIMARY KEY(unique_id)
);
` , [], function(err, rows) {
		
	});
	
	express.request.apps.Mail = {
		ews : require("ews-javascript-api"),
		ewsAuth : require("ews-javascript-api-auth"),
		account: {}
	}
}

router.get('/data/account', function(req, res){
	req.db.all(`Select * from app_Mail` , [], function(err, rows) {
		if(err){
			res.json({status: false})
		}
		else{
			res.json({status: true, data: rows})
		}
	})
})

router.get('/data/folder', function(req, res){
	req.db.all(`Select * from app_Mail_folder` , [], function(err, rows) {
		if(err){
			res.json({status: false})
		}
		else{
			res.json({status: true, data: rows})
		}
	})
})

router.post('/account/get', function (req, res) {
	req.db.all(`Select * from app_Mail` , [], function(err, rows) {
		if(err){
			res.json({status: false})
		}
		else{
			res.json({status: true, data: rows})
		}
	})
})

router.post('/account/add', function (req, res) {
	req.db.all(`INSERT INTO app_Mail values(?, ?, ?, ?)` , [req.body.username, req.body.password, req.body.server, req.body.mail_type], function(err, rows) {
		if(err){
			res.json({status: false})
		}
		else{
			res.json({status: true})
		}
	})
})

router.post('/account/login/exchange', function(req, res){
	var conf = {}
	//req.apps.Mail.account[req.body.username] = {}
	var apps = req.apps.Mail;
	console.log(req.body.username, req.body.password)
	conf.auth = apps.ews.ConfigurationApi.ConfigureXHR(new apps.ewsAuth.ntlmAuthXhrApi(req.body.username, req.body.password, true));
	conf.exch = new apps.ews.ExchangeService(apps.ews.ExchangeVersion.Exchange2013);
	conf.exch.Credentials = new apps.ews.ExchangeCredentials(req.body.username, req.body.password);
	conf.exch.Url = new apps.ews.Uri(`https://${req.body.url}/EWS/Exchange.asmx`);
	
	//console.log(`https://${req.body.url}/EWS/Exchange.asmx`)
	apps.ews.EwsLogging.DebugLogEnabled = false;

	req.apps.Mail.account[req.body.username] = {
		conf: conf
	}
	
	var folders = conf.exch.FindFolders(apps.ews.WellKnownFolderName.Inbox, new apps.ews.FolderView(1, 0))
	folders.then(resources => {
		/*var data = [], acc = {};
		acc.Folders = []//= resources.Folders
		
		Promise.reduce(resources.Folders,function(totalNotUsed, folder){
				//acc.Folders[folder.DisplayName] = folder.Id;//{id: folder.Id.UniqueId, changeKey: folder.Id.ChangeKey}
			return folder.Load().then(function() {
				data.push({
					name: folder.DisplayName,
					id: folder.Id.UniqueId
				})
				return null;
			})
		},null).then(function(totalNotUsed){
			req.apps.Mail.account[req.body.username].account = acc
			res.json({status: true, folder: data})
		});*/
		res.json({status: true})
	}, err =>{
		res.json({status: false})
	})
})

router.get('/email/exchange/folders', function(req, res){
	console.log(req.query.username)
	var apps = req.apps.Mail,
	conf = apps.account[req.query.username].conf;
	var offset = 0;
	var data = [];
	
	function getFolder(offset){
		var results = conf.exch.FindFolders(apps.ews.WellKnownFolderName.Inbox, new apps.ews.FolderView(10, offset))
		results.then(resources => {
			Promise.reduce(resources.Folders,function(totalNotUsed, folder){
				return folder.Load().then(function() {
					data.push({
						name: folder.DisplayName,
						id: folder.Id.UniqueId,
						total: folder.TotalCount
					})
					return null;
				})
			},null).then(function(totalNotUsed){
				if(results.MoreAvailable){
					offset+=10
					getFolder(offset)
				}
				else{
					res.json({status: true, folder: data})
				}
			});
		}, err =>{
			res.json({status: false})
		})
	}
	
	getFolder(0)
	
	/*var folders = conf.exch.FindFolders(apps.ews.WellKnownFolderName.Inbox, new apps.ews.FolderView(10, offset))
	
	folders.then(resources => {
		Promise.reduce(resources.Folders,function(totalNotUsed, folder){
			return folder.Load().then(function() {
				data.push({
					name: folder.DisplayName,
					id: folder.Id.UniqueId
				})
				return null;
			})
		},null).then(function(totalNotUsed){
			res.json({status: true, folder: data})
		});
	}, err =>{
		res.json({status: false})
	})*/
})

router.get('/email/exchange/items', function(req, res){
	//req.params.router
	//var folderInfo = req.apps.Mail.account[req.body.username].account.Folders[req.body.folder];
	var apps = req.apps.Mail;
	var conf = apps.account[req.query.username].conf
	var folder = new apps.ews.FolderId()
	folder.UniqueId = req.query.id
	
	
	/*function getItems(offset){
		var items = conf.exch.FindItems(folder, new apps.ews.ItemView(10, offset))
		
		items.then(resources => {
			var data = [], acc = {};
			Promise.reduce(resources.Items,function(totalNotUsed, item){
				return item.Load().then(function() {
					data.push({
						body: item.Body.Text,
						subject: item.Subject,
						displayTo: item.DisplayTo,
						displayCc: item.DisplayCc,
						attachment: item.Attachment,
						dateTimeCreated: item.DateTimeCreated,
						dateTimeReceived: item.DateTimeReceived,
						dateTimeSent: item.DateTimeSent,
						from: item.PropertyBag.properties.objects.Sender,
						id: item.Id.UniqueId,
						isRead: item.IsRead,
						isReadReceiptRequested: item.IsReadReceiptRequested,
					})
					return null;
				})
			},null).then(function(totalNotUsed){
				res.json({status: true, items: data})
			});
		}, err =>{
			res.json({status: false})
		})
	}*/
	
	var items = conf.exch.FindItems(folder, new apps.ews.ItemView(10, 0))
	items.then(resources => {
		var data = [], acc = {};
		Promise.reduce(resources.Items,function(totalNotUsed, item){
			return item.Load().then(function() {
				data.push({
					body: item.Body.Text,
					subject: item.Subject,
					displayTo: item.DisplayTo,
					displayCc: item.DisplayCc,
					attachment: item.Attachment,
					dateTimeCreated: item.DateTimeCreated,
					dateTimeReceived: item.DateTimeReceived,
					dateTimeSent: item.DateTimeSent,
					from: item.PropertyBag.properties.objects.Sender,
					id: item.Id.UniqueId,
					isRead: item.IsRead,
					isReadReceiptRequested: item.IsReadReceiptRequested,
					folderId: item.ParentFolderId.UniqueId
				})
				return null;
			})
		},null).then(function(totalNotUsed){
			res.json({status: true, items: data})
		});
	}, err =>{
		res.json({status: false})
	})
})

module.exports = router