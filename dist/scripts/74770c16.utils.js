define(['jquery'], function($) {

	var Utils = {};

	Utils.centerContent = function(el) {
		var $el = $(el || 'body');
		$el.find('.center').each(function() {
			var width = $(this).width(),
				height = $(this).height();
			$(this).css({
				'marginTop': -Math.round(height/2) + 'px',
				'marginLeft': -Math.round(width/2) + 'px'
			});
		});
	};

	Utils.adjustHeight = function($input) {
		$('#inputTest').html($input.val()+'&nbsp;');
		var height = $('#inputTest').outerHeight();
		$input.css('height',(height > 60 ? height:60)+'px');
		Utils.centerContent();
	};

	return Utils;

});