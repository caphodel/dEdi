/**
 *
 */
let hexToRgba = function(hex, opacity) {
	let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	let rgb = result ? {
		r: parseInt(result[1], 16),
		g: parseInt(result[2], 16),
		b: parseInt(result[3], 16)
	} : null;

	return 'rgba(' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + ', ' + opacity + ')';
};

/**
 *
 */
$(document).ready(function() {
	/** Constant div card */
	const DIV_CARD = 'div.card';

	/** Initialize tooltips */
	$('[data-toggle="tooltip"]').tooltip();

	/** Initialize popovers */
	$('[data-toggle="popover"]').popover({
		html: true
	});

	/** Function for remove card */
	$('[data-toggle="card-remove"]').on('click', function(e) {
		let $card = $(this).closest(DIV_CARD);

		$card.remove();

		e.preventDefault();
		return false;
	});

	/** Function for collapse card */
	$('[data-toggle="card-collapse"]').on('click', function(e) {
		let $card = $(this).closest(DIV_CARD);

		$card.toggleClass('card-collapsed');

		e.preventDefault();
		return false;
	});

	/** Function for fullscreen card */
	$('[data-toggle="card-fullscreen"]').on('click', function(e) {
		let $card = $(this).closest(DIV_CARD);

		$card.toggleClass('card-fullscreen').removeClass('card-collapsed');

		e.preventDefault();
		return false;
	});

	/**  */
	if ($('[data-sparkline]').length) {
		let generateSparkline = function($elem, data, params) {
			$elem.sparkline(data, {
				type: $elem.attr('data-sparkline-type'),
				height: '100%',
				barColor: params.color,
				lineColor: params.color,
				fillColor: 'transparent',
				spotColor: params.color,
				spotRadius: 0,
				lineWidth: 2,
				highlightColor: hexToRgba(params.color, .6),
				highlightLineColor: '#666',
				defaultPixelsPerValue: 5
			});
		};

		require(['sparkline'], function() {
			$('[data-sparkline]').each(function() {
				let $chart = $(this);

				generateSparkline($chart, JSON.parse($chart.attr('data-sparkline')), {
					color: $chart.attr('data-sparkline-color')
				});
			});
		});
	}

	/**  */
	if ($('.chart-circle').length) {
		require(['circle-progress'], function() {
			$('.chart-circle').each(function() {
				let $this = $(this);

				$this.circleProgress({
					fill: {
						color: tabler.colors[$this.attr('data-color')] || tabler.colors.blue
					},
					size: $this.height(),
					startAngle: -Math.PI / 4 * 2,
					emptyFill: '#F4F4F4',
					lineCap: 'round'
				});
			});
		});
	}

	window.dragMoveListener = function(event) {
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
	}

	window.moveToCenter = function(element) {
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

	window.createWindow = function(element) {
		if (element.length > 0) {
			interact(element[0])
				.draggable({
					onmove: dragMoveListener,
					allowFrom: '.card-header',
					elementOrigin: {
						x: 0.5,
						y: 0.5
					},
					manualStart: true
				})
				/*.on('hold', function (event) {
					var interaction = event.interaction;

					if (!interaction.interacting()) {
					  interaction.start({ name: 'drag' },
										event.interactable,
										$('.os-drag-clone')[0]);
					}
				})*/
				.resizable({
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
				})
				.on('resizemove', function(event) {
					var target = event.target,
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
				}).on('move', function(event){
					
					 var interaction = event.interaction;

					// if the pointer was moved while being held down
					// and an interaction hasn't started yet 
					if (interaction.pointerIsDown && !interaction.interacting()) {
					  var original = event.currentTarget,
						  // create a clone of the currentTarget element
						  clone = event.currentTarget.cloneNode(true);

					  // insert the clone to the page
					  // TODO: position the clone appropriately
					  document.body.appendChild(clone);

					  // start a drag interaction targeting the clone
					  interaction.start({ name: 'drag' },
										event.interactable,
										clone[0]);
					}   
				});

			moveToCenter(element)
		}
	}

	/*createWindow($('.window'))*/
});