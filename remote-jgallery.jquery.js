(function( $ ){
	
  var wrapperSize = {position:{}};
	
  // jQuery Object cache
  var $carus = null;
  var $thumbs = null;
  var $wrapper = null;

  var methods = {
    init : function(options) {
      var settings = $.fn.remotejGallery.defaults = $.extend({}, $.fn.remotejGallery.defaults, options );

        $.when(
          $.getScript( settings.scripts.carouFredSel ),
          $.getScript( settings.scripts.waitForImages ),
          $.Deferred(function( deferred ){
            $( deferred.resolve );
          })
        ).done($.ajax({
          // Getting the website data trough JSONP
          url: settings.remoteURL+'?callback=?',
          type: 'GET',
          dataType: 'jsonp',
          success: function(data, textStatus, xhr) {
            // If everything is right the server should have returned data.result as TRUE or
            // a positive number, so we check for that and if that's right we call the build method.
            if( data.result ) {
              methods.build(data.data.galleries);
            }
            else {
              alert("Galleries not loaded. Check console for more informations.")

              if(defaults.debug) {
                console.log("IrisLoginGallery: ERROR malformed data received!");
                console.log(data);
              }
            }

          },
          error: function(xhr, textStatus, errorThrown) {
            document.console.log("IrisLoginGallery: ERROR while getting data.")

            if(defaults.debug) {
              console.log(xhr);
              // console.log(textStatus);
              console.log(errorThrown);
            }
          }
        }));	
    },


    build : function(galleries, options) {

      setup = $.extend({}, $.fn.remotejGallery.defaults, options);

      if( ! setup.wrapperID ) {
        alert("Wrong Setup. Check console for more informations.");

        console.log("Wrapper ID Not set.");
      }
      else {
        // Loop trough galleries
        for (var gID = galleries.length - 1; gID >= 0; gID--) {
          var currGallery = galleries[gID];
          var gallID = setup.galleryID + currGallery.gid;

          wrapper = $("<DIV/>").attr({
            id: gallID,
            'class': "well"
          }).css({
            'min-width': '300px',
            'max-width': '1200px',
            margin: '50px auto'
          });

          wrapper.append( $("<h2/>").text(currGallery.name).css('text-align', "center") );

          gall = $("<div/>").attr({
            'class': setup.galleriesClass,
            'data-gid': currGallery.gid
          }).css({
            'text-align': "center",
            margin: "20px 0px 0px 10px"
          });

          for (var j = currGallery.images.length - 1; j >= 0; j--) {
            imageData = currGallery.images[j];

            img = $("<img/>").attr({
              'class': "gallery-image",
              title: imageData.title,
              alt: imageData.descr,
              src: setup.irisLogin + imageData.thumb,
              'data-large': setup.irisLogin + imageData.full_size,
              'data-gid': currGallery.gid,
              'data-imgID': imageData.id
            }).bind('click', function(ev){
              // $me = $(this);
              methods.prepare(this.getAttribute('data-imgid'), this.getAttribute('data-gid'));

            }).css({
              display: 'inline-block',
              border: '1px solid #ccc',
              padding: '12px',
              margin: '0px 20px 20px 0px'
            });

            gall.prepend(img);
          }

          wrapper.append(gall);
          wrapper.prependTo("#"+setup.wrapperID);
        }



      }
    },



    prepare : function( imgID, gID, options ) {
      setup = $.extend({}, $.fn.remotejGallery.defaults, options);
      var gallID = setup.galleryID+gID;

      var $backdrop = $("<div/>").attr({
        id: setup.slideshowBackdropID
      }).css({
        'min-height': $(window).height,
        'background-image': 'url('+setup.images.loaderBackImage+')',
      }).css( $.fn.remotejGallery.style.slideshowBackdrop );


      var win_width = $(window).width();
      var win_height = $(window).height();

      wrapperSize.width = win_width * 0.8;
      wrapperSize.height = win_height * 0.75;
      wrapperSize.position.top = (win_height / 2) - (wrapperSize.height /2);
      wrapperSize.position.left = (win_width / 2) - (wrapperSize.width /2);

      $wrapper = $("<div/>").attr({
        id: setup.slideshowWrapperID
      }).css({
        width: wrapperSize.width,
        height: wrapperSize.height,
        top: wrapperSize.position.top,
        left: wrapperSize.position.left,
      }).css( $.fn.remotejGallery.style.slideshowWrapper );

      $thumbs = $("#"+gallID +" ."+ setup.galleriesClass).clone().removeClass(setup.galleriesClass);
      $thumbs.attr({
        id: setup.slideshowThumbnailID,
        style: false
      }).css( $.fn.remotejGallery.style.slideshowThumbnail )
      .find('img').each(function(){
        this.removeAttribute("data-large");
        this.removeAttribute("style");

        $(this).css({
          display: "block",
          float: "left",
          margin: "10px",
          width: "100px",
          height: "100px",
          'box-shadow': "0 0 10px #000"
        });
      });
			
      /* We apply the style in the settings */
			

      $carus = $("#"+gallID +" ."+ setup.galleriesClass).clone().removeClass(setup.galleriesClass);
			
			
      $carus.attr({
        id: setup.slideshowCaruselID,
        style: false
      }).css( $.fn.remotejGallery.style.slideshowCarusel )
      .find('img').each(function(idx){
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
      // $wrapper.appendTo( $backdrop );

      $thumbs.children('img').click(function() {
        imgID = this.getAttribute('data-imgid');
        selector = '#'+setup.slideshowCaruselID+' img[data-imgid='+ imgID +']';
					
        $carus.trigger( 'slideTo', [ $(selector) ] );
      }).css( 'cursor', 'pointer' );

      $wrapper.hover(
        function() {
          $carus.trigger( 'pause' );
          $thumbs.parent().animate({bottom: "120"});
        }, function() {
          $carus.trigger( 'play' );
          $thumbs.parent().animate({bottom: "30"});
        }
      );
			
      $backdrop.click(function(){
        methods.destroy();
      });
      if ( setup.closeButtonID != false ) {
        var $closeBtn = $("<img/>").attr({
          id: setup.closeButtonID,
          src: setup.images.closeImage
        }).css({
          top: wrapperSize.position.top - 15,
          left: wrapperSize.position.left - 15,
        }).css( $.fn.remotejGallery.style.closeButton )
        .bind('click', methods.destroy ).appendTo($wrapper);
      }
			
      if ( setup.externalCloseButtonID != false ) {
        $(setup.closeButtonID).bind('click', function(ev) {
          ev.preventDefault();
          $(this).unbind('click');
					
          methods.destroy();
        })
      }

      $('body').append($backdrop);
      $('body').append($wrapper);
			
      // methods.start(imgID, gID, options);
      $backdrop.animate({opacity: 1}, 'fast');
			
			
      $carus.waitForImages({
        finished: function() {
          setTimeout(function () {
            methods.start(imgID, gID, options);
          }, 50);
        },
      });

    },
		
        
		
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
    },
        
		
    stop : function( ) {
        	
      $("#"+setup.slideshowCaruselID).trigger('stop');
      $("#"+setup.slideshowThumbnailID).trigger('stop');
    },
        
		
    update : function( content ) {
			
      $("#"+setup.slideshowCaruselID).trigger('updateSizes');
      $("#"+setup.slideshowThumbnailID).trigger('updateSizes');
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
			
      // setTimeout(function () {
        // 	wrapper.parentNode.removeChild( wrapper );
        // 	bg.parentNode.removeChild(bg);
        // }, 200);
      }
    };

    $.fn.remotejGallery = function(methodOrOptions) {
      if ( methods[methodOrOptions] ) {
        return methods[ methodOrOptions ].apply( this, Array.prototype.slice.call( arguments, 1 ));
      } else if ( typeof methodOrOptions === 'object' || ! methodOrOptions ) {
        // Default to "init"
        return methods.init.apply( this, arguments );
      } else {
        $.error( 'Method ' +  method + ' does not exist on jQuery.remotejGallery' );
      }    
    };
	
    $.fn.remotejGallery.defaults = {
      debug: false,
      // These are the defaults.
      irisLoginAPI: "http://api.irislogin.it/",
      irisLogin: "http://irislogin.it/",
      images: {
        // closeImage: "http://api.irislogin.it/public/img/btn-del-small.png",
        closeImage: "http://api.irislogin.it/public/img/btn-del-over-small.png",
        loaderBackImage: "http://api.irislogin.it/public/img/ajax-loader-big.gif"
      },
      scripts: {
        carouFredSel: "source/carouFredSel-6.2.1/jquery.carouFredSel-6.2.1-packed.js",
        waitForImages: "http://api.irislogin.it/public/js/jquery.waitForImages.min.js"
      },
		
      galleries: [],
      galleryGroupID: 0,
      gallerySelected: 0,
      startFrom: 0,
      thumbs_visible: 5,
      autoPlay: false,
		
      // HTML options
      wrapperID: false,
      galleryID: "irislogin-gallery-",
      galleriesClass: "irislogin-galleries-wrapper",
      closeButtonID: false,
      externalCloseButtonID: false,
		
      slideshowBackdropID: "slideshow-overall-backdrop",
      slideshowWrapperID: "slideshow-wrapper",
      slideshowCaruselID: "slideshow-carusel",
      slideshowThumbnailID: "slideshow-thumb",
		
		
      carouFredSel_DEBUG: false
    };
	
    $.fn.remotejGallery.style = {
      closeButton: {
        position: 'fixed',
        'z-index': 9000
      },
      slideshowBackdrop: {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        'background-repeat': 'no-repeat',
        'background-position': 'center',
        'background-color': '#FAFAFA',
        'z-index': 5000,
        opacity: 0
      },
      slideshowWrapper: {
        position: "fixed",
        'background-color': "#000",
        'box-shadow': "0 20px 50px #333",
        'z-index': 5500,
        'overflow': "hidden",
        opacity: 0
      },
      slideshowCarusel: {
        overflow: "hidden",
        'z-index': 6000
      },
      slideshowThumbnail: {
        height: "120px",
        overflow: "hidden",
        position: "relative",
        bottom: "50px",
        'min-width': "250px",
        'z-index': 6500
      }
    };


  })( jQuery );