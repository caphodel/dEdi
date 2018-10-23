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

$(window).ready(function(){
	$('#editor-tabs').on('click', ' > .nav-item', function(e){
		var target = e.currentTarget, path = target.getAttribute('data-path'), hash = target.getAttribute('id'), ext = target.getAttribute('data-extension');
		$(target).addClass('active').siblings().removeClass('active');
		if(buff.data[hash]==undefined)
			$.getJSON('http://localhost/os/libs/fs/isbinary/'+path, function(data){
				if(data[0]==false){
					$.get('http://localhost/os/libs/fs/read/ASCII/'+path, function(data){
						buff.data[hash] = CodeMirror.Doc(data, core.fn.mode[ext]);
						CodeMirror.autoLoadMode(editor, core.fn.mode[ext]);
						buff.change(hash);
					})
				}
				else{
					alert('Cannot open binary file!');
				}
			})
		else{
			buff.change(hash);
		}
		fnEditor.current = hash;
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
		viewportMargin: Infinity,
		indentWithTabs: true,
	});

	var $core = $('#dEdi')
	var core = $core[0]
	
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
	
	var buff = core.fn.buffer
	
	buff.data = {};
	
	buff.change = function(hash){
		var buff = this.data[hash], self = this;
		if (buff.getEditor()) buff = buff.linkedDoc({sharedHist: true})
		var old = editor.swapDoc(buff);
		var linked = old.iterLinkedDocs(function(doc) {linked = doc;});
		if (linked) {
		// Make sure the document in buffers is the one the other view is looking at
			for (var name in self.data) if (self.data[name] == old) self.data[name] = linked;
			old.unlinkDoc(linked);
		}
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
			var hash = el.getAttribute('data-id')
			$(`#editor-tabs > li#${hash}`).remove()
			var buff = CodeMirror.Doc('')
			if (buff.getEditor()) buff = buff.linkedDoc({sharedHist: true})
			var old = editor.swapDoc(buff);
			var linked = old.iterLinkedDocs(function(doc) {linked = doc;});
			if (linked) {
			// Make sure the document in buffers is the one the other view is looking at
				for (var name in self.data) if (self.data[name] == old) self.data[name] = linked;
				old.unlinkDoc(linked);
			}
			delete buff.data[hash];
		},
		active: function(el){
			var hash = el.getAttribute('data-id')
			$(`#editor-tabs > li#${hash}`).addClass('active').siblings().removeClass('active')
		}
	}
	
	fn.explorer = {}
	
	fn.explorer.compare = function(a,b) {
		if (a.type == 'directory')
			return -1;
		else
			return 0;
	}
	
	fn.explorer.loopTree = function(tree){
		var tmp = ""
		var hash = tree.path.hashCode()
		var self = this;
		if(tree.type != 'file')
			if(tree.children.length > 0){
				tree.children.sort(self.compare)
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
	$.getJSON('http://localhost/os/libs/fs/dirtree/C:/developer/mid-new/test', function(data){
		var tmp = fn.explorer.loopTree(data)
		//console.log(data)
		$('#editor-workspace > ul').append(tmp)
	})
	
	$('#editor-tabs').on('click', '.fe-x-square', function(e){
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
	
	$(window).bind('keydown', function(event) {
		if (event.ctrlKey || event.metaKey) {
			switch (String.fromCharCode(event.which).toLowerCase()) {
			case 's':
				event.preventDefault();
				if(fnEditor.current!=null){
					var current = $('#editor-tabs li#'+fnEditor.current)
					$.post('http://localhost/os/libs/fs/save/ASCII/'+current.attr('data-path'), {
						buffer: editor.getValue()
					}, function(data){
						if(data.status){
							alert('Saved!')
						}
						else{
							alert('Failed to save file!')
						}
					}, 'json')
				}
				break;
			case 'f':
				event.preventDefault();
				alert('ctrl-f');
				break;
			case 'g':
				event.preventDefault();
				alert('ctrl-g');
				break;
			}
		}
	});
})