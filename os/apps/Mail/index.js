var apps = {};

apps.run = function (id, opt) {

	/*if(opt){
	if(opt.target){
	$.get('./os/libs/fs/read/ASCII/'+opt.target, function(data){
	start(data, opt.target)
	})
	}
	else{
	start();
	}
	}
	else{
	start();
	}*/
	/* loading all template */
	var template = {
		data: {}
	}

	$.when(
		// Get the HTML
		$.get("./apps/Mail/exchange_login.html", function (html) {
			template.exchange_login = html;
		}),
		$.get("./apps/Mail/email.html", function (html) {
			template.email = html;
		}),
		$.get("./apps/Mail/folder_item.html", function (html) {
			template.folder_item = html;
		}),
		
		$.get('./os/apps/Mail/data/account', function(data){
			template.data.account = data
		}, "json"),
		
		$.get('./os/apps/Mail/data/folder', function(data){
			template.data.folder = data
		}, "json")

		/*// Get the CSS
		$.get("/assets/feature.css", function (css) {
			globalStore.css = css;
		}),

		// Get the JS
		$.getScript("/assets/feature.js")*/
	).then(function () {

		start();

	});

	//start();

	function start(data, target) {
		$('#os-desktop').append(`<div class="card window" id="${id}" style="width: 600px; height: 450px;">
			<div class="card-header">
				<div class="header-tab">
					<div class="header-tab-item header-tab-item-active" text="Email">Email</div><div class="header-tab-item" text="Contact">Contact</div>
				</div>
				<div class="card-options">
					<a href="#" class="card-options-collapse" data-toggle="card-collapse"><i class="far fa-window-minimize"></i></a>
					<a href="#" class="card-options-collapse" data-toggle="card-collapse"><i class="far fa-window-maximize"></i></a>
					<a href="#" class="card-options-remove" data-toggle="card-remove"><i class="fas fa-times"></i></a>
				</div>
			</div>
			<div class="card-body" style="display: flex">
				
			</div>
		</div>`);

		createWindow($(`#${id}`), {
			resizable: {
				restrictSize: {
					min: {
						width: 600,
						height: 450
					}
				}
			}
		})

		var mail_app = $(`#${id}`)
		var tpl = mail_app[0].template = template
		
		mail_app.on('click', '#app-Mail-folders > tbody > tr', function(e){
			console.log("folder clicked")
		})
		
		if(tpl.data.account.data.length>0){
			tpl.data.account.data.forEach(function(val, i){
				mail_app.find('.card-body').html(os.util.tmpl(mail_app[0].template.email, {}))
				$.post('./os/apps/Mail/account/login/' + val.mail_type, {
						username: val.username,
						password: val.password,
						url: val.server
					}, function (data) {
						tpl.data.account.data[i].status = data.status;
						if(data.status){
							mail_app[0].template.fn.getFolder(val.username, val.mail_type)
						}
						else{
							console.log("login failed")
						}
					}, "json")
			})
		}
		else{
			mail_app.find('.card-body').html(os.util.tmpl(mail_app[0].template.exchange_login, {
				id: id
			}))

			$('#app-Mail-login').click(function () {
				$.post('./os/apps/Mail/account/login/' + $(`#${id}-mail-type`).val(), {
					username: $(`#${id}-username`).val(),
					password: $(`#${id}-password`).val(),
					url: $(`#${id}-server`).val()
				}, function (data) {
					if (data.status) {
						$.post('./os/apps/Mail/account/add', {
							username: $(`#${id}-username`).val(),
							password: $(`#${id}-password`).val(),
							server: $(`#${id}-server`).val(),
							mail_type: $(`#${id}-mail-type`).val()
						}, function(data){
							console.log("Mail App added account")
						})
						mail_app[0].username = $(`#${id}-username`).val();
						var tpl = ''
							data.folder.forEach(function (val, i) {
								tpl += `<tr style="cursor: pointer;" id="${val.id}"><td>${val.name}</td></tr>`
							})

							var mainTpl = `<div style="border: 1px solid #dee2e6" class="${id}-folders">
								<table class="table card-table table-sm">
									<tbody>
										${tpl}
									</tbody>
								</table>
							</div>
							<div style="flex: 1; border: 1px solid #dee2e6; overflow: auto;"><table class="table card-table table-sm" id="app-Mail-items" >
									<tbody>
									</tbody>
								</table>
							</div>`

							$(`#${id} .card-body`).html(mainTpl)
							$(`#${id} .card-footer`).empty()
							$(`.${id}-folders`).on('click', 'tr', function (e) {
								var el = $(e.currentTarget)
									$.get(`./os/apps/Mail/email/exchange/items`, {
										username: mail_app[0].username,
										id: el.prop('id')
									}, function (data) {
										var tpl = ''
											data.items.forEach(function (val, i) {
												tpl += `
<tr id="${val.id}">
	<td>
		<div>${val.from.name}</div>
		<div>${val.subject}</div>
	</td>
</tr>
								`
											})
											var el = $('#app-Mail-items > tbody')
											el.html(tpl)
											data.items.forEach(function (val, i) {
												document.getElementById(val.id).data = val;
											})
									}, "json")
							})
					} else {
						alert("Login Failed")
					}
				}, 'json')
			})
		}
		
		mail_app[0].template.fn = {
			getFolder: function(account, type){
				$.get('./os/apps/Mail/email/'+type+'/folders', {
					username: account
				}, function(data){
					var folder = mail_app[0].template.data.folder = data.folder;
					var tpl = "";
					folder.forEach(function(val, i){
						tpl += os.util.tmpl(mail_app[0].template.folder_item, {
							name: val.name,
							total: val.total
						})
					})
					mail_app.find('#app-Mail-folders tbody').html(tpl)
				}, "json")
			}
		}
	}
}

module.exports = apps
