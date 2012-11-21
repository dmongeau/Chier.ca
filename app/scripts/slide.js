define(['jquery','utils'],function($,Utils) {

	var Slide = {

		'currentSlide' : null,

		'createSlide' : function(slide) {
			var $slide = $('<div class="slide" id="slide_'+slide._id+'"></div>');
			$slide.html('<div class="center center-text"><strong>&laquo;</strong><span class="text"></span><strong>&raquo;</strong></div>');
			$slide.append('<div class="like"><iframe src="//www.facebook.com/plugins/like.php?href='+escape('http://chier.ca/'+slide._id)+'&amp;send=false&amp;layout=standard&amp;width=450&amp;show_faces=false&amp;action=like&amp;colorscheme=light&amp;font&amp;height=35&amp;appId=435739666474618" scrolling="no" frameborder="0" style="border:none; overflow:hidden; width:450px; height:35px;" allowTransparency="true"></iframe></div>');
			$slide.find('.text').text(slide.text);
			$slide.data('slide',slide);
			var $current = $('.slide:last');
			$current.after($slide);
			Utils.centerContent();
			return $slide;
		},

		'getNextSlide' : function(id,cb) {

			var url = '/api/item/next';
			if(id)  {
				url += '?id='+escape(id);
			}

			$.getJSON(url,function(response) {
				if(response.data) {
					cb(response.data);
				} else {
					cb(null);
				}
			});

		},

		'getPreviousSlide' : function(id,cb) {

			var url = '/api/item/previous';
			if(id)  {
				url += '?id='+escape(id);
			}

			$.getJSON(url,function(response) {
				if(response.data) {
					cb(response.data);
				} else {
					cb(null);
				}
			});

		}

	};

	return Slide;


});