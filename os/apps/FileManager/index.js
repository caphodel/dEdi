var apps = {};

apps.run = function(id){	
	$('head').append( $('<link rel="stylesheet" type="text/css" />').attr('href', './apps/FileManager/index.css') );

	$('#os-desktop').append(`<div class="card window app-FMan" id="${id}">
		<div class="card-header">
			<h3 class="card-title">File Manager</h3>
			<div class="card-options">
				<a href="#" class="card-options-collapse" data-toggle="card-collapse"><i class="fe fe-minus"></i></a>
				<a href="#" class="card-options-collapse" data-toggle="card-collapse"><i class="fe fe-square"></i></a>
				<a href="#" class="card-options-remove" data-toggle="card-remove"><i class="fe fe-x"></i></a>
			</div>
		</div>
		<div class="card-body" style="display: flex; overflow: hidden">
			<table class="table table-hover table-outline table-vcenter text-nowrap card-table table-sm table-scroll" style="display: flex; flex-direction: column">
				<thead>
					<tr>
						<th>
						</th>
						<th>
							Name
						</th>
						<th>
							Modified Date
						</th>
					</tr>
				</thead>
				<tbody style="flex: 1">
				</tbody>
			</table>
		</div>
	</div>`);

	createWindow($(`#${id}`))
	
	var $tbody = $(`#${id} table tbody`);
	
	window.os.apps.FMan = window.os.apps.FMan || []
	
	window.os.apps.FMan[id] = {};
	
	window.os.apps.FMan[id].setColumnWidth = function(){
		var $table = $(`#${id} table`),
		$bodyCells = $table.find('tbody tr:first').children(),
		colWidth;

		// Get the tbody columns width array
		colWidth = $bodyCells.map(function() {
			return $(this).width();
		}).get();

		// Set the width of thead columns
		$table.find('thead tr').children().each(function(i, v) {
			$(v).width(colWidth[i]);
		});
	}
	
	$.getJSON('./os/libs/fs/drive', function(data){
		var tpl = ''
		$.each(data, function(i, val){
			if(val.mountpoints.length>0)
				$.each(val.mountpoints, function(i, val){
					tpl += `<tr path="${val.path}" dir="true"><td width="1"><i class="fe fe-hard-drive"></i></td><td>${val.path.split(':/')[0]}</td><td style="width: 100%">&nbsp;</td></tr>`
				})
		})
		$tbody.html(tpl)
		window.os.apps.FMan[id].setColumnWidth()
	})
	
	$tbody.on('dblclick', ' > tr', function(e){
		var path = this.getAttribute('path'), parent = this.getAttribute('path').split(/[\\\/]/).slice(0, -1).join('/'), directory = this.getAttribute('dir');
		if(directory == "true"){
			if(path=="/" || path.split(":")[1] == "")
				$.getJSON('./os/libs/fs/drive', function(data){
					var tpl = ''
					$.each(data, function(i, val){
						if(val.mountpoints.length>0)
							$.each(val.mountpoints, function(i, val){
								tpl += `<tr path="${val.path}" dir="true"><td width="1"><i class="fe fe-hard-drive"></i></td><td>${val.path.split(':/')[0]}</td><td style="width: 100%">&nbsp;</td></tr>`
							})
					})
					$tbody.html(tpl)
					window.os.apps.FMan[id].setColumnWidth()
				})
			else
				$.getJSON('./os/libs/fs/ls/'+path, function(data){
					var tpl = ''
					tpl += `<tr path="${parent}" dir="true"><td width="1"></td><td>..</td><td style="width: 100%">-</td></tr>`
					$.each(data, function(i, val){
						var icon = val.stat.directory ? "fe-folder" : "fe-file"
						tpl += `<tr path="${val.path}" parent="${path}" dir="${val.stat.directory}"><td width="1"><i class="fe ${icon}"></i></td><td>${val.filename}</td><td style="width: 100%">${val.stat.mtime || '-'}</td></tr>`
					})
					$tbody.html(tpl)
					window.os.apps.FMan[id].setColumnWidth()
				})
		}
		else{
			var type = path.split('.').pop(),
			app = os.reg.defaults[type];
			
			if(app!=undefined){
				os.apps[app].run({
					target: path
				})
			}
			else{
				
			}
		}
	})
}

module.exports = apps