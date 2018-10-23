var Loader = function () {}
Loader.prototype = {
	require: function (scripts, callback) {
		this.loadCount = 0;
		this.totalRequired = scripts.length;
		this.callback = callback;

		for (var i = 0; i < scripts.length; i++) {
			this.writeScript(scripts[i]);
		}
	},
	loaded: function (evt) {
		this.loadCount++;

		if (this.loadCount == this.totalRequired && typeof this.callback == 'function')
			this.callback.call();
	},
	writeScript: function (src) {
		var self = this;
		var s = document.createElement('script');
		s.type = "text/javascript";
		s.async = true;
		s.src = src;
		s.addEventListener('load', function (e) {
			self.loaded(e);
		}, false);
		var head = document.getElementsByTagName('head')[0];
		head.appendChild(s);
	}
}

function merge(target, source) {
    Object.keys(source).forEach(function (key) {
        if (!source[key]) {
            return;
        }
        if (typeof source[key] === 'object') {
            target[key] = target[key] || (Array.isArray(source[key]) ? [] : {});
            return merge(source[key], target[key]);
        }
        target[key] = source[key];
    });
}

var os = {}

os.util = {}

os.util.loader = new Loader();

os.window = {}

os.window.dragged = false;

os.reg = {}

os.util.escapeRegExp = function(input){
  return (input || '').replace(/([.*+?^${}()|\[\]\/\\])/g, '\\$1');
}

os.util.reduceTemplate = function(template, key) {
  return template.replace(
    new RegExp('\{\{\\s*' + os.util.escapeRegExp(key) + '\\s*\}\}', 'g'),
    this.data[key]
  );
}

os.util.tmpl = function(template, data) {
  return Object.keys(data).reduce(
    os.util.reduceTemplate.bind({ data }),
    template
  );
}


$.getJSON('./os/reg/defaults', function (data) {
	os.reg.defaults = data.data
})

/*window.dragMoveListener = function(event) {
var clone = $('.os-drag-clone');
var target = clone[0],
// keep the dragged position in the data-x/data-y attributes
x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx,
y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

// translate the element
target.style.webkitTransform =
target.style.transform =
'translate(' + x + 'px, ' + y + 'px)';

// update the posiion attributes
target.setAttribute('data-x', x);
target.setAttribute('data-y', y);
}*/

window.dragMoveListener = function (event, a) {
	var target = event.target,
	// keep the dragged position in the data-x/data-y attributes
	x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx,
	y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

	// translate the element
	target.style.webkitTransform =
		target.style.transform =
		'translate(' + x + 'px, ' + y + 'px)';

	// update the posiion attributes
	target.setAttribute('data-x', x);
	target.setAttribute('data-y', y);
}

window.moveToCenter = function (element) {
	var target = element[0],
	dataY = element.attr('data-y') || 0,
	x = (($(window).width() / 2) - (element.width() / 2)),
	y = window.scrollY - dataY - element.offset().top + element.height() / 2

		// translate the elementwindow.scrollY
		target.style.webkitTransform =
		target.style.transform =
		'translate(' + x + 'px, ' + y + 'px)';

	// update the posiion attributes
	target.setAttribute('data-x', x);
	target.setAttribute('data-y', y);
}

/*$('.os-drag-clone').on('mouseup', function(){
$('body').removeClass('noselect')
if(os.window.dragged != false){
var target = this

var original = os.window.dragged[0]

original.style.webkitTransform =
original.style.transform =
target.style.transform

original.style.top = target.style.top
original.style.left = target.style.left

original.setAttribute('data-x', target.getAttribute('data-x'));
original.setAttribute('data-y', target.getAttribute('data-y'));
os.window.dragged = false;
$(this).hide()
}
})*/

window.createWindow = function (element, options) {
	options = options || {}
	options.draggable = options.draggable || {}
	options.resizable = options.resizable || {}
	var resOptions = {
			// resize from all edges and corners
			edges: {
				left: true,
				right: true,
				bottom: true,
				top: true
			},
			// keep the edges inside the parent
			restrictEdges: {
				outer: 'parent',
				endOnly: true,
			},
			// minimum size
			restrictSize: {
				min: {
					width: 100,
					height: 50
				},
			},
			inertia: true,
		}
	merge(resOptions, options.resizable)
		
	if (element.length > 0) {
		interact(element[0])
		.draggable({
			onmove: dragMoveListener,
			allowFrom: '.card-header',
			elementOrigin: {
				x: 0.5,
				y: 0.5
			},
			restrict: {
				restriction: 'parent',
				elementRect: {
					top: 0,
					left: 0,
					bottom: 1,
					right: 1
				}
			}
			/*,
			manualStart: true*/
		})
		/*.on('move', function(event){
		var interaction = event.interaction;

		// if the pointer was moved while being held down
		// and an interaction hasn't started yet
		if (interaction.pointerIsDown && !interaction.interacting()) {
		//console.log($(event.currentTarget).css('cursor').match('resize'))
		$('body').addClass('noselect')
		if($(event.path[0]).hasClass('card-header')){
		$('.os-drag-clone').show();
		os.window.dragged = $(event.target).parent();
		var clone = $('.os-drag-clone');
		var $target = $(event.target).parent();
		var target = $target[0],
		x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx,
		y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

		clone.attr('data-x', x).attr('data-y', y)
		var pos = $target.position();
		clone.css({
		top: pos.top,
		left: pos.left,
		height: $target.height(),
		width: $target.width()
		})
		var original = event.currentTarget

		// start a drag interaction targeting the clone
		interaction.start({ name: 'drag' },
		event.interactable,
		clone[0]);
		}
		if($(event.currentTarget).css('cursor').match('resize')!=null){
		$('.os-drag-clone').show();
		os.window.resized = $(event.target).parent();
		var clone = $('.os-drag-clone');
		var $target = $(event.target).closest('.window');
		var target = $target[0],
		x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx,
		y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

		clone.attr('data-x', x).attr('data-y', y)
		var pos = $target.position();
		clone.css({
		top: pos.top,
		left: pos.left,
		height: $target.height(),
		width: $target.width()
		})
		var original = event.currentTarget

		// start a drag interaction targeting the clone
		interaction.start({ name: 'resize',
		edges: {
		top   : (original.dataset.top == "true"),
		left  : (original.dataset.left == "true"),
		bottom: (original.dataset.bottom == "true"),
		right : (original.dataset.right == "true"),
		}
		},
		event.interactable,
		clone[0]);
		}
		}
		})*/
		.resizable(resOptions)
		/*
		.on('resizemove', function(event) {

		});*/
		.on('resizemove', function (event) {
			var target = event.target;
			x = (parseFloat(target.getAttribute('data-x')) || 0),
			y = (parseFloat(target.getAttribute('data-y')) || 0);

			// update the element's style
			target.style.width = event.rect.width + 'px';
			target.style.height = event.rect.height + 'px';

			// translate when resizing from top or left edges
			x += event.deltaRect.left;
			y += event.deltaRect.top;

			target.style.webkitTransform = target.style.transform =
				'translate(' + x + 'px,' + y + 'px)';

			target.setAttribute('data-x', x);
			target.setAttribute('data-y', y);
		});

		moveToCenter(element)
	}
}

createWindow($('#app-calculator'))
createWindow($('#app-editor'))

function sortByZ(a, b) {
	return (parseInt(a.style.zIndex, 10)) < (parseInt(b.style.zIndex, 10))
}

os.window.remove = function (el) {
	var $el = $(el)
		var $window = $el.closest('.window')
		$(`#os-toolbar-button [data-window=${$window.prop('id')}]`).remove();
	$window.remove()
}

os.window.active = function (el) {
	$el = $(el)
		$('#os-toolbar-button > a.active').removeClass('active')
		$(`#os-toolbar-button [data-window=${$el.prop('id')}]`).addClass('active')
		$el.css('z-index', 1001);
	var all = $(".window").sort(sortByZ);
	all.each(function (i, val) {
		$(val).css('z-index', 1001 - (i + 1))
	})
}

$('body').on('mousedown', '.window', function (e) {
	os.window.active(e.currentTarget)
})

$('body').on('click', '.window > .card-header > .card-options > .card-options-remove', function (e) {
	os.window.remove(e.currentTarget)
})

$('body').on('click', '.header-tab-item', function(e){
	var el = $(e.currentTarget)
	el.addClass('header-tab-item-active')
	el.siblings().removeClass('header-tab-item-active')
})

os.apps = {}

os.apps.open = function (app, id, name, multiple, opt) {
	R(`./apps/${app}/index`, function (err, index) {
		if (os.apps[app].info.style != undefined) {
			var style = os.apps[app].info.style;
			$('head').append($('<link rel="stylesheet" type="text/css" />').attr('href', `./apps/${app}/${style}`));
		}
		if (err) {
			console.error(err.statusText);
			return;
		}

		var guid = multiple ? id + '-' + guidGenerator() : id;
		if(!multiple){
			if($('#'+guid).length==0){
				$(`<a href="javascript:void(0)" class="btn btn-outline-primary btn-sm" data-window="${guid}">${name}</a>`).appendTo('#os-toolbar-button')
				index.run(guid, opt)
			}
		}
		else{
			$(`<a href="javascript:void(0)" class="btn btn-outline-primary btn-sm" data-window="${guid}">${name}</a>`).appendTo('#os-toolbar-button')
			index.run(guid, opt)
		}
	});
}

function guidGenerator() {
	var S4 = function () {
		return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
	};
	return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
}

$.getJSON('./apps/installed', function (apps) {
	$.each(apps, function (i, val) {
		var path = val;
		$.getJSON(`./json/apps/${path}/package.json`, function (appInfo) {
			//`<div class="os-desktop-icon" onclick="os.apps.open('${val}', '${appInfo.id}', '${appInfo.name}', ${appInfo.multiple})"><i class="fe ${appInfo.icon}"></i>${appInfo.name}</div>`
			$('#os-desktop').append(
			`
				<div class="icon" text="" onclick="os.apps.open('${val}', '${appInfo.id}', '${appInfo.name}', ${appInfo.multiple})">
					<div><i class="fe ${appInfo.icon}"></i></div>
					<div>${appInfo.name}</div>
				</div>
			`)
			os.apps[val] = {
				run: function (opt) {
					opt = opt || false
						os.apps.open(val, appInfo.id, appInfo.name, appInfo.multiple, opt)
				},
				info: appInfo
			}
		})
	})
})
