var apps = {};

apps.run = function(id, opt){
	
	//os.util.loader('./assets/js/codemirror/codemirror.js')
	
	//$('head').append( $('<link rel="stylesheet" type="text/css" />').attr('href', './assets/js/codemirror/codemirror.css') );
	
	/*os.util.loader.require([
    "./assets/js/codemirror/codemirror.js"], 
    function() {
		
		if(opt){
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
		}
		
		function start(data, target){
			$('#os-desktop').append(`<div class="card window" id="${id}">
				<div class="card-header">
					<h3 class="card-title">TEd</h3>
					<div class="card-options">
						<a href="#" class="card-options-collapse" data-toggle="card-collapse"><i class="far fa-window-minimize"></i></a>
						<a href="#" class="card-options-collapse" data-toggle="card-collapse"><i class="far fa-window-maximize"></i></a>
						<a href="#" class="card-options-remove" data-toggle="card-remove"><i class="fas fa-times"></i></a>
					</div>
				</div>
				<div class="card-body" style="display: flex">
					
				</div>
			</div>`);

			createWindow($(`#${id}`))
			
			var editor = CodeMirror($(`#${id} > .card-body`)[0], {
				lineNumbers: true
			});
			
			if(data){
				editor.getDoc().setValue(data);
				editor.target = target
			}
			
			$(`#${id} > .card-body > .CodeMirror`).css({
					height: 'auto',
					width: '100%'
			})
			
			$(`#${id} > .card-body`).click(function(e){
				if(!$(e.target).hasClass('.CodeMirror-line')){
					editor.focus()
				}
			}).bind('keydown', function(e) {
				if(e.ctrlKey && (e.which == 83)) {
					e.preventDefault();
					$.post('./os/libs/fs/save/ASCII/'+editor.target, {buffer: editor.getDoc().getValue()}, function(data){
						if(data.status)
							alert("File saved!")
						else
							alert("Failed to save!")
					}, "json")
					return false;
				}
			});
		}
    });*/
}

module.exports = apps