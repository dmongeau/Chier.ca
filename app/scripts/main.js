require.config({
	paths: {
		jquery: 'vendor/jquery.min'
	}
});

require(['jquery','utils','slide'], function($,Utils,Slide) {

	var STARTS = [
		'Chier'
	];

	var history = null;
	YUI().use('history', function (Y) {

	    history = new Y.History({
			initialState: {
				'_id' : 'form'
			}
		});

		Y.on('history:change', function (e) {
			var changed = e.changed,
			removed = e.removed;

			if(changed._id) {
				var id = 'slide-'+changed._id.newVal;

				if($('#'+id).length){
					if($('#'+id).is('.slide-previous')) {
						$('#previous').click();
					} else if($('#'+id).is('.slide-next')) {
						$('#next').click();
					}
				}
			}
			
		});

	});

	$.ajaxSetup ({
	    // Disable caching of AJAX responses
	    cache: false
	});
	
	$(function() {
		
		var start = STARTS[Math.floor(Math.random()*STARTS.length)];
		var placeholder = start+'...';

		$(window).resize(function() {
			Utils.centerContent();
		});

		$('#form textarea').val(placeholder);
		Utils.adjustHeight($('#form textarea'));
		$('#form .save').css('opacity',0);
		$('#form .save').css('visibility','visible');
		$('#form').css('opacity',0);
		$('#form').css('visibility','visible');

		if(!CURRENT_SLIDE) {
			$('#form').fadeTo('fast',1);
		} else {
			$('#form').css('opacity',1);
			$('.slide-form').css('left','-100%');
			$('.slide-form').removeClass('slide-current');
			var $slide = Slide.createSlide(CURRENT_SLIDE);
			$slide.addClass('slide-current');
		}
		

		$('#form textarea').focus(function() {
			if($(this).val() == (placeholder)) {
				$(this).val(start+' ');
				$('#form .save').fadeTo('slow',1);
				$(this).addClass('active');
			}
			$(this).val($(this).val());
			Utils.adjustHeight($(this));
		}).blur(function(){
			var text = $.trim($(this).val()).toLowerCase();
			if(text == start.toLowerCase() || text == 'chier') {
				$(this).val(placeholder);
				$('#form .save').fadeTo('slow',0);
			}
			$(this).removeClass('active');
			Utils.adjustHeight($(this));
		});

		var checkMaxLength = function(e) { 
			var len = parseInt($(this).attr("maxlength"), 10);
			if($.trim($(this).val()).length > len) { 
				$(this).val($(this).val().substr(0, len)); 
				e.preventDefault();
			} 
		}
		$('#form textarea').keyup(checkMaxLength);
		$('#form textarea').blur(checkMaxLength);

		$('#form .save .cancel').click(function(e) {

			e.preventDefault();

			$('#form textarea').val(placeholder);
			$('#form textarea').removeClass('active');
			Utils.adjustHeight($('#form textarea'));
			$('#form .save').fadeTo('slow',0);

		});

		$('#form textarea').keyup(function(e) {
			Utils.adjustHeight($(this));
		});

		$('#form textarea').keydown(function(e) {

			if(e.keyCode == 13) {
				e.preventDefault();
				$('#form form').submit();
				return;
			}

			if($(this).val() == (start) && (e.keyCode == 8 || e.keyCode == 46)) {
				e.preventDefault();
				$(this).val(start);
			}
		});

		$('#form form').submit(function(e) {
			e.preventDefault();
			$.getJSON('/api/item/create?text='+encodeURIComponent($('#form textarea').val()),function(data) {
				if(!data.success) {
					alert(data.error.errors.text.type);
				} else {
					$('#form textarea').val(placeholder);
					$('#form textarea').blur();
					$('#form .save').fadeOut('fast');
					window.setTimeout(function() {
						$('#next').click();
						_gaq.push(['_trackPageview','/submit']);
					},500);
				}
			});
		});

		var isSliding = false;

		$('#next').click(function(e) {
			e.preventDefault();

			if(isSliding) return;
			isSliding = true;

			function nextSlide(){

				$('.slide-next').animate({
					'left' : '0%'
				},1000,function() {
					$(this).removeClass('slide-next');
					$(this).addClass('slide-current');
					isSliding = false;
				});
				$('.slide-current').animate({
					'left' : '-100%'
				},1000,function() {
					$(this).removeClass('slide-current');
					$('.slide-previous:not(.slide-form)').remove();
					$('.slide-previous.slide-form').removeClass('slide-previous');
					$(this).addClass('slide-previous');
					if(!$('#previous').is(':visible')) {
						$('#previous').fadeIn('fast');
					}
				});
			}

			if($('.slide-next').length) {
				nextSlide();
			} else {
				Slide.getNextSlide(CURRENT_SLIDE ? CURRENT_SLIDE._id:null, function(slide) {
					CURRENT_SLIDE = slide;

					if(!slide) {
						$('#next').hide();
						isSliding = false;
					} else {
						var $slide = Slide.createSlide(slide);
						$slide.addClass('slide-next');
						$slide.css({
							'left' : '100%'
						});
						nextSlide();

						history.add({
							'_id' : slide._id
						}, {
							url  : '/'+slide._id
						});
						
						_gaq.push(['_trackPageview','/'+slide._id]);
					}
				});
			}

		});


		$('#previous').click(function(e) {
			e.preventDefault();

			if(isSliding) return;
			isSliding = true;

			function previousSlide(){
				$('.slide-previous').animate({
					'left' : '0%'
				},1000,function() {
					$(this).removeClass('slide-previous');
					$(this).addClass('slide-current');
					isSliding = false;
				});
				$('.slide-current').animate({
					'left' : '100%'
				},1000,function() {
					$(this).removeClass('slide-current');
					$('.slide-next').remove();
					$(this).addClass('slide-next');
					if(!$('#next').is(':visible')) {
						$('#next').fadeIn('fast');
					}
				});
			}

			if($('.slide-previous').length) {
				previousSlide();
			} else {
				Slide.getPreviousSlide(CURRENT_SLIDE ? CURRENT_SLIDE._id:null, function(slide) {
					CURRENT_SLIDE = slide;
					if(!slide) {
						$('#previous').hide();
						if(!$('.slide-form').is('.slide-current')) {
							$('.slide-form').addClass('slide-previous');
							$('.slide-form').css({
								'left' : '-100%'
							});
							previousSlide();
							history.add({
								'_id' : 'form'
							}, {
								url  : '/'
							});


						} else {
							isSliding = false;
						}
					} else {

						history.add({
							'_id' : slide._id
						}, {
							url  : '/'+slide._id
						});

						var $slide = Slide.createSlide(slide);
						$slide.addClass('slide-previous');
						$slide.css({
							'left' : '-100%'
						});
						previousSlide();
						
						_gaq.push(['_trackPageview','/'+slide._id]);
					}
				});
			}

		});

	});
	

});