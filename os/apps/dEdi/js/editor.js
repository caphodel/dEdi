String.prototype.hashCode = function() {
  var hash = 0, i, chr;
  if (this.length === 0) return hash;
  for (i = 0; i < this.length; i++) {
    chr   = this.charCodeAt(i);
    hash  = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};

var host = '../../'

$(window).ready(function(){
  
  	//for explorer
  	var explorer = document.querySelector('#editor-explorer');

	explorer.addEventListener('click', function (e) {
		if (e.offsetX > explorer.offsetWidth) {
		  	if($('#editor-explorer').hasClass('sidebar-show-left'))
				$('#editor-explorer').addClass('sidebar-hide sidebar-hide-left').removeClass('sidebar-show sidebar-show-left')
		  	else if($('#editor-explorer').hasClass('sidebar-hide-left'))
			  	$('#editor-explorer').addClass('sidebar-show sidebar-show-left').removeClass('sidebar-hide sidebar-hide-left')
		} else {
			console.log('b')
		}
	});
  
  	var sidebarRight = document.querySelector('#sidebar-right');

	sidebarRight.addEventListener('click', function (e) {
	  console.log(sidebarRight.offsetLeft, e.offsetX)
		if (e.offsetX < sidebarRight.offsetLeft) {
		  	if($('#sidebar-right').hasClass('sidebar-show-right'))
				$('#sidebar-right').addClass('sidebar-hide sidebar-hide-right').removeClass('sidebar-show sidebar-show-right')
		  	else if($('#sidebar-right').hasClass('sidebar-hide-right'))
			  	$('#sidebar-right').addClass('sidebar-show sidebar-show-right').removeClass('sidebar-hide sidebar-hide-right')
		} else {
			console.log('b')
		}
	});
  
	$('#editor-tabs').on('click', ' > .nav-item', function(e){
	  	if(!$(e.target).hasClass('fe-x-square')){
			var target = e.currentTarget, path = target.getAttribute('data-path'), hash = target.getAttribute('id'), ext = target.getAttribute('data-extension');
			$(target).addClass('active').siblings().removeClass('active');
			if(buffer.data[hash]==undefined)
				$.getJSON(host+'os/libs/fs/isbinary/'+path, function(data){
					if(data[0]==false){
						$.get(host+'os/libs/fs/read/ASCII/'+path, function(data){
							buffer.data[hash] = CodeMirror.Doc(data, core.fn.mode[ext]);
							CodeMirror.autoLoadMode(editor, core.fn.mode[ext]);
							buffer.change(hash);
						})
					}
					else{
						alert('Cannot open binary file!');
					}
				})
			else{
				buffer.change(hash);
			}
			fnEditor.current = hash;
		}
	})
	
	CodeMirror.modeURL = "codemirror/mode/%N/%N.js";
	var editor = CodeMirror.fromTextArea(document.getElementById("codemirror"), {
		smartIndent: true,
		lineNumbers: true,
		matchBrackets: true,
		theme: 'monokai-sublime',
		autoCloseTags: true,
		autoCloseBrackets: true,
		matchTags: { bothTags: true },
	  	foldGutter: true,
	  	dragDrop: false,
	  	lineWrapping: true,
	  	gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
	  	matchTags: {bothTags: true},
		viewportMargin: Infinity,
		indentWithTabs: true,
	});
	
	var intellisense = new CodeMirrorIntellisense(editor);
	
	hint['js'](intellisense)
  
  	/*var intellisense = new CodeMirrorIntellisense(editor);
	intellisense.addDeclarationTrigger({ keyCode: 190 }); // `.`
	intellisense.addMethodsTrigger({ keyCode: 57, shiftKey: true }); // `(`
	intellisense.addMethodsTrigger({ keyCode: 48, shiftKey: true });// `)`
	intellisense.addMethodsTrigger({ keyCode: 8 }); // `backspace`

		// called when the methods are triggered
  	intellisense.onMethod(function (item){
		  // hide when the users presses `backspace` or `)`
		if (item.keyCode === 48 || item.keyCode === 8)
		{
		  	intellisense.getMeths().setVisible(false);
		}
		else
		{
		  	intellisense.setMethods(['CompareTo(int)', 'CompareTo(Object)']);
		}
	});

	// called when the declarations are triggered
	intellisense.onDeclaration(function (item){
		var data = [
			{ glyph: 3, name: 'CompareTo', documentation: 'Converts to object to another object' },
			{ glyph: 3, name: 'ToString', documentation: 'Converts to object to a string' }
		];
		intellisense.setDeclarations(data);
	});*/
  
	editor.on('change',function(cMirror){
	  	if($('#editor-tabs li#'+fnEditor.current+' a span').length == 0)
			$('#editor-tabs li#'+fnEditor.current+' a').prepend('<span>&#9679;&nbsp;</span>') 
	});

	var $core = $('#dEdi')
	var core = $core[0]
	
	core.editor = editor
	
	core.fn = {
		
	}
	
	core.fn.mode = {
		".js": "javascript",
		".css": "css",
		".html": "htmlmixed",
		".htm": "htmlmixed"
	}
	
	core.fn.buffer = {
		
	}
	
	var buffer = core.fn.buffer
	
	buffer.data = {};
	
	buffer.change = function(hash){
		var buff = this.data[hash], self = this;
		if (buff.getEditor()) buff = buff.linkedDoc({sharedHist: true})
		var old = editor.swapDoc(buff);
		var linked = old.iterLinkedDocs(function(doc) {linked = doc;});
		if (linked) {
		// Make sure the document in buffers is the one the other view is looking at
			for (var name in self.data) if (self.data[name] == old) self.data[name] = linked;
			old.unlinkDoc(linked);
		}
	  	fnEditor.current = hash;
		editor.focus();
	}

	var fn = core.fn

	var fnEditor = fn.editor = {}
	
	fnEditor.current = null
	
	fnEditor.tabs = {
		$el: $('#editor-tabs'),
		add: function(name, path, hash, extension){
			this.$el.append(`<li class="nav-item" data-path="${path}" id="${hash}" data-extension="${extension}">
				<a class="nav-link text-light" href="#">${name}</a><i data-id="${hash}" class="fe fe-x-square"></i>
			</li>`)
			$(`#editor-tabs > li#${hash}`).click();
		},
		remove: function(el){
		  	var $prev = $(el).parent().prev(), $next = $(el).parent().next()
		  	if($prev.length>0)
				buffer.change($prev.attr('id'))
		  	else if($next.length>0)
				buffer.change($next.attr('id'))
		  	else{
				var self = buffer;
				var hash = el.getAttribute('data-id')
				$(`#editor-tabs > li#${hash}`).remove()
				var buff = CodeMirror.Doc('')
				if (buff.getEditor()) buff = buff.linkedDoc({sharedHist: true})
				var old = editor.swapDoc(buff);
				var linked = old.iterLinkedDocs(function(doc) {linked = doc;});
				if (linked) {
					for (var name in self.data) if (self.data[name] == old) self.data[name] = linked;
					old.unlinkDoc(linked);
				}
			}
		 	/*editor.setValue("");
			editor.clearHistory();*/
			delete self.data[hash];
		},
		active: function(el){
			var hash = el.getAttribute('data-id')
			$(`#editor-tabs > li#${hash}`).addClass('active').siblings().removeClass('active')
		}
	}
	
	fn.explorer = {}
	
	fn.explorer.compare = function(a,b) {
		if (a.type > b.type)
			return 1;
		else
			return 0;
	}
	
	fn.explorer.loopTree = function(tree){
		var tmp = ""
		var hash = tree.path.hashCode()
		var self = this;
		if(tree.type != 'file')
			if(tree.children.length > 0){
				var d = tree.children.sort(self.compare)
				tree.children.forEach(function(val){
					tmp += self.loopTree(val);
				})
			}
		if(tree.type == "directory")
			tmp = `<li id="${hash}" class="directory">
					<label>
						<a data-path="${tree.path}" data-hash="${hash}">${tree.name}</a>
					</label>
					<input value="" type="checkbox">
					<ul>
						${tmp}
					</ul>
				</li>`
		else{
			tmp = `<li id="${hash}" class="file">
					<label>
						<a data-path="${tree.path}" data-hash="${hash}" data-extension="${tree.extension}">${tree.name}</a>
					</label>
					<input value="" type="checkbox">
				</li>`
		}
		return tmp;
	}
	
	//JSLists.createTree("editor-workspace");
	/*$.getJSON(host+'os/libs/fs/dirtree/C:/developer/mid-new/test', function(data){
		var tmp = fn.explorer.loopTree(data)
		//console.log(data)
		$('#editor-workspace > ul').append(tmp)
	})*/
	
	$('#editor-tabs').on('click', '.fe-x-square', function(e){
	  	e.preventDefault()
		fnEditor.tabs.remove(e.currentTarget)
	})
	
	$('#editor-workspace').on('dblclick', 'li.file > label > a', function(e){
		var target = e.currentTarget, hash = target.getAttribute('data-hash'), $el = $(`#editor-tabs > li#${hash}`),
		extension = target.getAttribute('data-extension');
		if($el.length==0)
			fnEditor.tabs.add(target.text, target.getAttribute('data-path'), hash, extension);
		else{
			$el.click()
		}
	})
	
  	$(window).on('beforeunload', function(){
		var message = 'Are you sure to close editor?';
		var evt = confirm(message);

		return message;
	})
  
	var dropZone = document.getElementById('dEdi');

    // Optional.   Show the copy icon when dragging over.  Seems to only work for chrome.
    dropZone.addEventListener('dragover', function(e) {
        e.stopPropagation();
        e.preventDefault();
        //e.dataTransfer.dropEffect = 'copy';
    });

    // Get file data on drop
    dropZone.addEventListener('drop', function(e) {
        e.stopPropagation();
        e.preventDefault();
	  	//console.log(e.dataTransfer.files[0].webkitGetAsEntry())
        /*var files = e.dataTransfer.files; // Array of all files
        for (var i=0, file; file=files[i]; i++) {
			console.log(file)
        }*/
	});
  
	$(window).bind('keydown', function(event) {
		if (event.ctrlKey || event.metaKey) {
			switch (String.fromCharCode(event.which).toLowerCase()) {
			case 's':
				event.preventDefault();
				if(fnEditor.current!=null){
					var current = $('#editor-tabs li#'+fnEditor.current)
					$.post(host+'os/libs/fs/save/ASCII/'+current.attr('data-path'), {
						buffer: editor.getValue()
					}, function(data){
						if(data.status){
							//alert('Saved!')
						  	current.find('span').remove()
						}
						else{
							alert('Failed to save file!')
						}
					}, 'json')
				}
				break;
			case 'o':
				event.preventDefault();
				var $el = $('<input type="file" id="flup"  webkitdirectory mozdirectory msdirectory odirectory directory multiple />')
				$el.on('change', function(e){
					var files = e.target.files;
					var path = files[0].webkitRelativePath;
					var Folder = path.split("/");
					
					$.getJSON(host+'os/libs/fs/dirtree/'+Folder[0], function(data){
						var tmp = fn.explorer.loopTree(data)
						//console.log(data)
						$('#editor-workspace > ul').append(tmp)
						$el.remove()
					})
				})
				$el.click();
				break;
			case 'g':
				event.preventDefault();
				alert('ctrl-g');
				break;
			}
		}
	});
})