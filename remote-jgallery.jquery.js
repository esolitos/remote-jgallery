(function( $ ){

var wrapperSize = {};

// jQuery Object caching
var $carus = $.noop,
 $thumbs = $.noop
 $wrapper = $.noop;

var methods = {
	init : function( settings ) {
  
		if( settings.debug ) {
			console.log("--- Remote jGallery: init ---");
			console.log("Loaded Settings:");
			console.log(settings);
		}
  
		if ( settings.remoteURL !== undefined ) {
    
			var element = this,
				carouFredSel_src = settings.scripts.carouFredSel,
				waitForImages_src = settings.scripts.waitForImages;
    
			// Adding base url if scripts are marked as remote,
			//  but a relative path given
			if ( settings.scripts.remote ) {
				if ( carouFredSel_src.indexOf('http') === -1 ) {
					carouFredSel_src = settings.baseURL + carouFredSel_src;
				}
				if ( waitForImages_src.indexOf('http') === -1 ) {
					waitForImages_src = settings.baseURL + waitForImages_src;
				}
			}
    
			$.when(
				$.getScript( settings.scripts.carouFredSel ),
				$.getScript( settings.scripts.waitForImages )
				
			).done(
				$.ajax( {
					"url": settings.remoteURL+"?callback=?",
					"type": "GET",
					"dataType": "jsonp",
					"success": function(data, textStatus, xhr) {
						// Server should return data.success == TRUE
						if( data.success && data.galleries.length > 0 ) {
							settings.baseURL = data.base_url;
							build_gallery.apply( element, [data.galleries, settings] );
						
						} else {
							console.error("remotejGallery: Remote server "+
									"returned malformed data.");

							if( settings.debug ) {
								console.log(data);
							}
						}
					},
					"error": function(xhr, textStatus, errorThrown) {
						console.error("remotejGallery: ERROR while getting data.")

						if( settings.debug ) {
							console.log(errorThrown);
						}
					}
				})
			);
		} else {
			console.error("remotejGallery: Remote Server URL not defined.");
		}
		return this;
	},


	prepare : function( imgID, gID, options ) {},


	start : function( imgID, gID, options ) {

		setup = $.extend({}, $.fn.remotejGallery.defaults, options);
		var gallID = setup.galleryID+gID;

		$carus = $("#"+setup.slideshowCaruselID);
		$thumbs = $("#"+setup.slideshowThumbnailID);

		$carus.carouFredSel({
			width: "100%",
			height: "100%",
			items: {
				start: $('#'+setup.slideshowCaruselID+' img[data-imgid='+ imgID +']'),
				visible: 1,
				height: wrapperSize.height,
			},
			scroll: {
				fx: 'crossfade',
				onBefore: function( data ) {
					imgID = data.items.visible.data('imgid');
					pos = Math.floor(setup.thumbs_visible / 2) - 1;

					$thumbs.trigger( 'slideTo', [ $('#'+setup.slideshowThumbnailID+' img[data-imgid='+ imgID +']'), - pos  ] );
				}
			},
			prev: {key: 'left'},
			next: {key: 'right'},
			onCreate: function(data) {
				$('#'+setup.slideshowWrapperID).animate({opacity: 1});
			}
		}, {debug: setup.carouFredSel_DEBUG});

		$thumbs.carouFredSel({
			auto: false,
			width: '100%'
		}, {debug: setup.carouFredSel_DEBUG});

		setup.thumbs_visible = $thumbs.children('img').size();
		$carus.trigger("play", [0, true]);
  
		return this;
	},
    

	stop : function() {

		$("#"+setup.slideshowCaruselID).trigger('stop');
		$("#"+setup.slideshowThumbnailID).trigger('stop');
  
		return this;
	},
    

	update : function( content ) {
		$("#"+setup.slideshowCaruselID).trigger('updateSizes');
		$("#"+setup.slideshowThumbnailID).trigger('updateSizes');
  
		return this;
	},

	destroy: function(options) {
		setup = $.extend({}, $.fn.remotejGallery.defaults, options);
		var wrapper = document.getElementById(setup.slideshowWrapperID);
		var bg = document.getElementById(setup.slideshowBackdropID);

		methods.stop();

		$(wrapper).animate({opacity:0}, 200, function(){
			wrapper.parentNode.removeChild( wrapper );
		});

		$(bg).animate({opacity:0}, 200, function() {
			$("#"+setup.slideshowCaruselID).trigger('destroy');
			$("#"+setup.slideshowThumbnailID).trigger('destroy');
			bg.parentNode.removeChild(bg);
		});

		return this;
	}
};


function build_gallery( galleries, settings ) {
	var style = $.fn.remotejGallery.style,
		attributes = $.fn.remotejGallery.attributes;
	
	// Loop trough galleries
	for (var g = galleries.length - 1; g >= 0; g--) {
		var currentGallery = galleries[g];
		var galleryID = settings.galleryID + currentGallery.gid;

		wrapper = $( "<div/>" )
			.attr( {
				"id": galleryID,
				"class": attributes.galleryWrapper.class
			} )
			.data( "gid", currentGallery.gid )
			.css( style.galleryWrapper );

		$( "<h2/>" )
			.attr( attributes.galleryWrapperTitle )
			.css( style.galleryWrapperTitle )
				.text( currentGallery.name )
			.appendTo( wrapper );


		galleryContainer = $( "<div/>" )
			.attr( attributes.galleryImagesContainer )
			.css( style.galleryImagesContainer );

		for (var j = currentGallery.images.length - 1; j >= 0; j--) {
			var imageInfo = currentGallery.images[j];
			var imageAttributes = {
				"title": imageInfo.title,
				"alt": imageInfo.descr,
				"src": settings.baseURL + imageInfo.thumb,

				// since $.data() it's not reliable
				"data-large": settings.baseURL + imageInfo.full_size,
				"data-gid": currentGallery.gid,
				"data-imgID": imageInfo.id
			};

			image = $("<img/>")
				.attr( $.extend( imageAttributes, attributes.galleryImage ) )
				.css( style.galleryImage )
				// .data( imageData )
				.on('click', {"settings": settings}, prepare_slideshow);

			galleryContainer.prepend( image );
		}

		wrapper.append(galleryContainer);
		wrapper.prependTo( "#"+this.id );
	}

	return this;
};


function prepare_slideshow( event ) {
	event.preventDefault();
	var imageID = this.getAttribute('data-imgid'),
		galleryID = this.getAttribute('data-gid'),
		settings = event.data.settings,
		style = $.fn.remotejGallery.style,
		attributes = $.fn.remotejGallery.attributes;
	
	var windowWidth = $(window).width(),
		windowHeight = $(window).height();

	var $galleryContainer = $( this ).parents( "."+attributes.galleryImagesContainer.class ),
		$slideshowBackdrop = $( "<div/>" );
	
	$wrapper = $("<div/>");
	$thumbs = $galleryContainer.clone();
	$carus = $galleryContainer.clone();;
	
	$slideshowBackdrop.attr( attributes.slideshowBackdrop )
		.css( "min-height", windowWidth )
		.css( style.slideshowBackdrop );

	wrapperSize.width = windowWidth * 0.8;
	wrapperSize.height = windowHeight * 0.75;
	wrapperSize.position = {
		"top": (windowHeight / 2) - (wrapperSize.height /2),
		"left": (windowWidth / 2) - (wrapperSize.width /2)
	};

	$wrapper.attr( attributes.slideshowWrapper )
		.css( {
			width: wrapperSize.width,
			height: wrapperSize.height,
			top: wrapperSize.position.top,
			left: wrapperSize.position.left,
		} )
		.css( style.slideshowWrapper );

	$thumbs.attr( 'style', "" )
		.attr( attributes.slideshowThumbnail )
		.css( style.slideshowThumbnail );

	$thumbs.find('img')
		.each( function(){
			this.removeAttribute("data-large");
			this.removeAttribute("style");

			$(this).css( style.slideshowThumbnailImages );
		} );

	$carus.attr( 'style', "" )
		.attr( attributes.slideshowCarusel )
		.css( style.slideshowCarusel );
	
	$carus.find('img')
		.each(function(idx){
			if(this.src) {
				this.onload =  function() {
					var ratio = $wrapper.height() / this.height;
					var img_width = this.width * ratio

					this.setAttribute('width', img_width );
					this.setAttribute('height', $wrapper.height() );

					this.removeAttribute("style");
					this.style.display = 'block';
					this.style.float = 'left';
				}

				this.src = this.getAttribute("data-large");
				this.removeAttribute("data-large");
			}
		});

	$wrapper.append( $carus );
	$wrapper.append( $thumbs );
	// $wrapper.appendTo( $slideshowBackdrop );

	$thumbs.children('img')
		.css( 'cursor', 'pointer' )
		.click(function() {
			imgID = this.getAttribute('data-imgid');
			selector = '#'+settings.slideshowCaruselID+' img[data-imgid='+ imgID +']';

			$carus.trigger( 'slideTo', [ $(selector) ] );
		});

	$wrapper.hover(
		function() {
			$carus.trigger( 'pause' );
			$thumbs.parent().animate({bottom: "120"});
		}, function() {
			$carus.trigger( 'play' );
			$thumbs.parent().animate({bottom: "30"});
		}
	);

	$slideshowBackdrop.click(function(){
		methods.destroy();
	});
  
	if ( settings.closeButtonID != false ) {
		var $closeBtn = $("<img/>").attr({
			id: settings.closeButtonID,
			src: settings.images.closeImage
		}).css({
			top: wrapperSize.position.top - 15,
			left: wrapperSize.position.left - 15,
		}).css( $.fn.remotejGallery.style.closeButton )
		.bind('click', methods.destroy ).appendTo($wrapper);
	}

	if ( settings.externalCloseButtonID != false ) {
		$(settings.closeButtonID).bind('click', function(ev) {
			ev.preventDefault();
			$(this).unbind('click');

			methods.destroy();
		})
	}

	$('body').append($slideshowBackdrop);
	$('body').append($wrapper);

	// methods.start(imgID, gID, options);
	$slideshowBackdrop.animate({opacity: 1}, 'fast');

	$carus.waitForImages({
		finished: function() {
			$wrapper.animate({opacity: 1}, 'fast');
			setTimeout(function () {
				methods.start(imageID, galleryID, settings);
			}, 50);
		},
	});
}


$.fn.remotejGallery = function(methodOrOptions, optOptions) {

	return this.each(function(i, me) {

		if ( typeof methodOrOptions === 'string' && methods[methodOrOptions] ) {
			var opt = [];
			if (optOptions != undefined) {
				opt = $.extend(true, $.fn.remotejGallery.defaults, optOptions);
			}

			this.each( methods[ methodOrOptions ].apply( this, Array.prototype.slice.call( arguments, 1 )) );

		} else if ( typeof methodOrOptions === 'object' || ! methodOrOptions ) {

			var opt = $.extend(true, $.fn.remotejGallery.defaults, methodOrOptions);
			methods.init.apply( this, [opt] );

		} else {
			$.error( 'Method ' +  method + ' does not exist on jQuery.remotejGallery' );
		}


	});

	return this;
};

$.fn.remotejGallery.defaults = {
	"debug": false,
	"carouFredSel_DEBUG": false,

	// These are the defaults.
	"baseURL": false,
	"images": {
		"closeImage": "/source/images/btn-close.png"
	},
	"scripts": {
		"remote": true,
		"carouFredSel": "../source/carouFredSel-6.2.1/jquery.carouFredSel-6.2.1-packed.js",
		"waitForImages": "../source/waitForImages-1.5/dist/jquery.waitforimages.min.js"
	},

	"galleries": [],
	"galleryGroupID": 0,
	"gallerySelected": 0,
	"startFrom": 0,
	"thumbs_visible": 5,
	"autoPlay": false,

	// HTML options
	"wrapperID": false,
	"galleryID": "remote-jgallery-",
	"galleriesClass": "",
	"closeButtonID": false,
	"externalCloseButtonID": false,

	"slideshowCaruselID": "slideshow-carusel",
	"slideshowThumbnailID": "slideshow-thumb"
};

$.fn.remotejGallery.attributes = {
	"galleryWrapper": {
		"class": "jgallery-gallery-wrapper"
	},
	"galleryWrapperTitle": {
		"class": "jgallery-gallery-title"
	},
	"galleryImagesContainer" : {
		"class": "jgallery-gallery-images-container"
	},
	"galleryImage": {
		"class": "gallery-image"
	},
	
	
	"slideshowBackdrop": {
		"id": "slideshow-overall-backdrop"
	},
	"slideshowWrapper": {
		"id": "slideshow-wrapper"
	},
	"slideshowCarusel": {
		"id": "slideshow-carusel",
		"class": "thumbnail-carusel remote-jgallery-slideshow"
	},
	"slideshowThumbnail": {
		"id": "slideshow-thumb",
		"class": "thumbnail-slideshow remote-jgallery-slideshow"
	}
}

$.fn.remotejGallery.style = {
	"galleryWrapper": {
		"min-width": '300px',
		"max-width": '1200px',
		"margin": '50px auto'
	},
	"galleryWrapperTitle": {
		"text-align": "center"
	},
	"galleryImagesContainer": {
		"text-align": "center",
		"margin": "20px 0px 0px 10px"
	},
	"galleryImage": {
		"display": "inline-block",
		"border": "1px solid #ccc",
		"padding": "12px",
		"margin": "0px 20px 20px 0px"
	},
	
	
	"slideshowBackdrop": {
		"position": 'fixed',
		"top": 0,
		"left": 0,
		"width": "100%",
		"height": "100%",
		"background-image": "url('/source/images/ajax-loader.gif')",
		"background-repeat": "no-repeat",
		"background-position": "center",
		"background-color": "#FAFAFA",
		"z-index": 5000,
		"opacity": 0
	},
	"slideshowWrapper": {
		"position": "fixed",
		"background-color": "#000",
		"box-shadow": "0 20px 50px #333",
		"z-index": 5500,
		"overflow": "hidden",
		"opacity": 0
	},
	"slideshowCarusel": {
		"overflow": "hidden",
		"z-index": 6000
	},
	"slideshowThumbnail": {
		"height": "120px",
		"overflow": "hidden",
		"position": "relative",
		"bottom": "50px",
		"min-width": "250px",
		"z-index": 6500
	},
	"slideshowThumbnailImages": {
		"display": "block",
		"float": "left",
		"margin": "10px",
		"width": "100px",
		"height": "100px",
		"box-shadow": "0 0 10px #000"
	},
	
	
	// To be checked
	"closeButton": {
		"position": 'fixed',
		"z-index": 9000
	},
};


})( jQuery );