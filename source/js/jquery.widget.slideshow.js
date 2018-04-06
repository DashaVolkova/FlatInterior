
(function( $ ) {

	"use strict";

	function getPageSize() {
		return [
			$( document ).width(),
			$( document ).height(),
			$( window ).width(),
			$( window ).height(),
			$( window ).scrollLeft(),
			$( window ).scrollTop()
		]
	}

	/**
   *  contentScroller
   */
  $.fn.contentScroller = function(settings)
  {
    return this.each(function(){
      settings = $.extend({
        contentQuery: '.content',
        scrollUpBtnQuery: '.sroll_up',
        scrollDownBtnQuery: '.sroll_down',
        scrollUpBtnDisabled: 'sroll_up-disabled',
        scrollDownBtnDisabled: 'sroll_down-disabled',
        scrollEasing: 'linear',
        scrollDuration: 200,
        scrollDir: 'vertical',
        scrollLength: .4
      }, settings);

      var $self          = $(this),
          $content       = $self.find(settings.contentQuery),
          $scrollUpBtn   = $self.find(settings.scrollUpBtnQuery),
          $scrollDownBtn = $self.find(settings.scrollDownBtnQuery);

      var scroll = function(dir) {
        var scrollLength = 0;
        var scrollDiff = 0;

        // stop all animations
        $content.stop();

        if ( settings.scrollDir == 'vertical' ) {

          scrollLength = settings.scrollLength < 1 ? $content.height() * settings.scrollLength : settings.scrollLength;
          scrollDiff = $content.get(0).scrollHeight - $content.get(0).offsetHeight;
          if ( $content.get(0).scrollTop + dir*scrollLength > scrollDiff || scrollDiff == 0 ) {
            $scrollDownBtn.addClass(settings.scrollDownBtnDisabled);
          } else {
            $scrollDownBtn.removeClass(settings.scrollDownBtnDisabled);
          }
          if ( $content.get(0).scrollTop + dir*scrollLength < 0 || scrollDiff == 0 ) {
            $scrollUpBtn.addClass(settings.scrollUpBtnDisabled);
          } else {
            $scrollUpBtn.removeClass(settings.scrollUpBtnDisabled);
          }
          $content.animate({scrollTop: $content.get(0).scrollTop + dir*scrollLength}, settings.scrollDuration, settings.scrollEasing);

        } else {

          scrollLength = settings.scrollLength < 1 ? $content.width() * settings.scrollLength : settings.scrollLength;
          $content.animate({scrollLeft: $content.get(0).scrollLeft + dir*scrollLength}, settings.scrollDuration, settings.scrollEasing);

        }
      }
      // end of scroll function

      $scrollUpBtn.click(function(){
        $content.stop();
        scroll(-1);
        return false;
      });

      $scrollDownBtn.click(function(){
        $content.stop();
        scroll(1);
        return false;
      });

      $content.mousewheel(function(event, delta){
        if (delta > 0) {
					scroll(-1);
        } else if (delta < 0) {
					scroll(1);
        }
        // if we reach the end of content allow to scroll page
        //if ( !$scrollDownBtn.hasClass(settings.scrollDownBtnDisabled) && !$scrollUpBtn.hasClass(settings.scrollUpBtnDisabled)  )
          return false;
      });

    });
  }
	function showHugeImage(_thumbCurrent, $thumbList) {
	    var settings = {
	      overlayApperSpped: 200,
	      panelApperSpead: 100,
	      panelDisapperSpead: 800,
	      panelApperEasing: 'easeInQuad',
	      thumbFadeOutSpeed: 200,
	      thumbFadeInSpeed: 100,
	      thumbFadeOutEasing: 'easeInQuad',
	      thumbFadeInEasing: 'linear',
	      thumbWidth: 43,
	      thumbMargin: 12,
	      moveInterval: 50,
	      moveStep: 3
	    }

	    var $html = $('\
	        <div id="huge_gallery_overlay"><div id="huge_gallery_wrapper">\
	          <div id="huge_gallery_image_viewport"><img src="/img/s.gif" alt="" class="image" style="z-index: 1;" /></div>\
	          <a href="#" id="huge_gallery_prev"></a>\
	          <a href="#" id="huge_gallery_next"></a>\
	          <div id="huge_gallery_panel_top_wrapper"><div id="huge_gallery_panel_top">\
	            <a href="#" id="huge_gallery_back"></a>\
	            <div id="huge_gallery_nav">\
	                <a href="#" id="huge_gallery_nav_prev"></a>\
	                <a href="#" id="huge_gallery_nav_next"></a>\
	            </div>\
	            <a href="#" id="huge_gallery_close"></a>\
	          </div></div>\
	          <div id="huge_gallery_panel_wrapper"><div id="huge_gallery_panel">\
	            <a href="#" id="huge_gallery_control_play"></a>\
	            <span id="huge_gallery_fitscreen" class="fit"></span>\
	            <div id="huge_gallery_control">\
	              <a href="#" class="prev"></a>\
	              <a href="#" class="next"></a>\
	              <div id="huge_gallery_control_viewport_wrapper"><div id="huge_gallery_control_viewport">\
	                <table><tbody><tr>\
	                </tr></tbody></table>\
	              </div></div>\
	            </div>\
	          </div></div>\
	        </div></div>\
	    ');

	    var $wrapper = $html.find('#huge_gallery_wrapper');
	    var $image_viewport = $html.find('#huge_gallery_image_viewport');
	    var $prev = $html.find('#huge_gallery_nav_prev');
	    var $next = $html.find('#huge_gallery_nav_next');
	    var $btnClose = $html.find('#huge_gallery_close');
	    var $back = $html.find('#huge_gallery_back');
	    var $play = $html.find('#huge_gallery_control_play');
	    var $panel = $html.find('#huge_gallery_panel');
	    var $panel_top = $html.find('#huge_gallery_panel_top');
	    var $thumbViewport = $html.find('#huge_gallery_control_viewport');
	    var $thumbContainer = $html.find('#huge_gallery_control_viewport tr');
	    var $btnFitScreen = $html.find( '#huge_gallery_fitscreen' );
	    var preloadedImage = null;
	    var $thumbCurrent = null;
	    var pageSize = null;
	    var timer = null;
	    var cursor = null;
	    var $newImage = $image_viewport.find('.image');
	    var currentScrollTop = 0;
	    var notIEWidnowWidthCorrection = 15;

	    var playerTimer = null;
	    var playerSpeed = 5000;

	    var activityTimer = null;
	    var activityTimeout = 2000;

	    var $currentImage = null;
        var currentImage = null;

	    /*if ( $thumbList.length > 1 ) {
	      $prev.add($next).show();
	    }*/

	    var updatePageSizeInfo = function(){
	      pageSize = getPageSize();
	      $(document.body).css({height: pageSize[3]});
	      $image_viewport.height(pageSize[3] - 110);
	      if ( $btnFitScreen.hasClass( 'fit' ) ) {
	        if ( $currentImage && currentImage ) {
	          fitImage( $currentImage, currentImage );
	        }
	      }
	    }

	    function fitImage( $img, img ){
	      var ratio = Math.min( $image_viewport.width() / img.width, $image_viewport.height() / img.height );
	      if ( ratio < 1 ) {
	        $img
	          .attr( 'width', Math.floor( img.width * ratio ) )
	          .attr( 'height', Math.floor( img.height * ratio ) )
	          .css( {
	            marginTop: - $img.height() / 2,
	            marginLeft: - $img.width() / 2
	          } );
	      }
	    }

	    function unFitImage( $img ){
	      $img
	        .removeAttr( 'width' )
	        .removeAttr( 'height' )
	        .css( {
	          marginTop: - $img.height() / 2,
	          marginLeft: - $img.width() / 2
	        } );
	    }

	    function toggleFit( evt ) {
	      if ( $(this).hasClass('fit') ) {
	        unFitImage($currentImage);
	        $(this).removeClass('fit');
	      } else {
	        fitImage($currentImage, currentImage);
	        $(this).addClass('fit');
	      }
	      return false;
	    }

	    var updateMouseCoords = function(evt){
	      cursor = {
	      	x: evt.pageX,
	      	y: evt.pageY
	      }
	    }

	    var panel_show = function() {
	      $panel.add($panel_top).stop().animate({opacity: 1},  settings.panelApperSpead, settings.panelApperEasing);
	    }

	    var panel_hide = function() {
	      $panel.add($panel_top).stop().animate({opacity: 0}, settings.panelDisapperSpead, settings.panelAppearEasing);
	    }

	    var play = function() {
	      playerTimer = setTimeout(function(){
	        showNext();
	      }, playerSpeed);
	    }

	    var pause = function() {
	      clearInterval(playerTimer);
	    }

	    var switchPlay = function() {
	      if ( $play.hasClass('huge_gallery_control_play_pause') ) {
	        $play.removeClass('huge_gallery_control_play_pause');
	        play();
	      } else {
	        $play.addClass('huge_gallery_control_play_pause');
	        pause();
	      }
	      return false;
	    }

	    $play.click(switchPlay);

	    var close = function() {
	      pause();
	      $html.fadeOut(settings.overlayApperSpped, function(){
	        $html.remove();
	        $(document.body)
	          .css({
	            overflow: 'auto',
	            height: 'auto'
	          });
	        $('html').css('overflow', 'auto');
	        $('html, body').attr('scrollTop', currentScrollTop);
	        //show bottom panel
	        $('#bottom_menu').show();
	      });
	      $(window).unbind('resize', updatePageSizeInfo);
	      $wrapper.unbind('mousemove', updateMouseCoords);
	      $wrapper.unbind('mousemove', panelAutoHide);
	      return false;
	    }

	    var panelAutoHide = function() {
	      clearTimeout(activityTimer);
	      panel_show();
	      activityTimer = setTimeout(function(){
	        panel_hide();
	      }, activityTimeout);
	    }

	    var open = function() {
	      //hide bottom panel
	      $('#bottom_menu').hide();

	      $back.text('\u0412\u0435\u0440\u043d\u0443\u0442\u044c\u0441\u044f \u043a ' + $('h1').text());

	      updatePageSizeInfo();
	      $(window).bind('resize', updatePageSizeInfo);
	      $wrapper.bind('mousemove', updateMouseCoords);
	      $wrapper.bind('mousemove', panelAutoHide);

	      currentScrollTop = Math.max($('body').attr('scrollTop'), $('html').attr('scrollTop'));
	      $('html, body').attr('scrollTop', 0);
	      $('html').css('overflow', 'hidden');
	      $(document.body)
	        .css({
	          overflow: 'hidden',
	          height: pageSize[3]
	        })
	        .append($html);
	      $( document )
	        .keydown(function(e){
	          switch (e.keyCode) {
	            case 27:close();break; //esc
	            case 37:showPrev();break; //arrow left
	            case 39:showNext();break; //arrow right
	            // to avoid scroll down by keybord
	            case 34: //page down
	            case 40:return false;break; //arrow down
	          }
	        });

	      $thumbList.each(function(num){
	        var $image = $(this).find('img');
	        var imageRatio = 43 / Math.min($image.width(), $image.height());
	        var imageSrc = this.href.substr(this.href.indexOf('#') + 1);
	        var $thumb = $('<td><a href="#" _href="' + imageSrc + '" num="' + num + '"><i></i><img src="' + $image.attr('src') + '" width="' + $image.width()*imageRatio + '" height="' + $image.height()*imageRatio + '" alt="" />"</a></td>');
	        $thumb.find('a')
	          .click(function(){thumbClick($(this));return false;})
	          .bind("contextmenu dragstart",function(){return false;});
	        $thumb.appendTo($thumbContainer);
	        if ( this == _thumbCurrent ) {
	          $thumbCurrent = $thumb.find('a');
	          thumbClick($thumbCurrent);
	        }
	      });

	      //thumbClick($thumbCurrent.find('a'));

	      $html.fadeIn(settings.overlayApperSpped, function(){
	        panel_show();
	      });

	      panelAutoHide();

	      $html.contentScroller({
	        contentQuery: '#huge_gallery_control_viewport',
	        scrollUpBtnQuery: '#huge_gallery_control .prev',
	        scrollDownBtnQuery: '#huge_gallery_control .next',
	        scrollDir: 'horizontal',
	        scrollEasing: 'linear',
	        scrollDuration: 200,
	        scrollLength: .3
	      })

	    }

	    var onLoad = function($thumb) {
	      var $oldImage = $image_viewport.find('.image');
	      var $newImage = $('<img src="' + $thumb.attr('_href') + '" class="image" />');
	      $newImage.bind("contextmenu mousedown dragstart",function(){
	        return false;
	      });
	      $currentImage = $newImage;
	      currentImage = preloadedImage;
	      $oldImage.fadeOut(function(){
	        $(this).remove();
	      });
	      if ( $btnFitScreen.hasClass( 'fit' ) ) {
	        fitImage( $newImage, preloadedImage );
	      }
	      $newImage
	        .hide()
	        .css({
	          marginTop: - ( parseInt( $btnFitScreen.hasClass('fit') ? $newImage.attr( 'height' ) || preloadedImage.height : preloadedImage.height ) ) / 2,
	          marginLeft: - ( parseInt( $btnFitScreen.hasClass('fit') ? $newImage.attr( 'width' ) || preloadedImage.width : preloadedImage.width ) ) / 2
	        })
	        .appendTo($image_viewport);
	      if ( timer ) {
		      clearInterval(timer);
	      }
	      timer = setInterval(function(){
	        var imageExceedHeight = $image_viewport.height() - $newImage.height(),
	            imageExceedWidth = $image_viewport.width() - $newImage.width();

	        if ( cursor === null ) {
	          return;
	        }

	        $newImage
	          .css( {
	            marginTop: imageExceedHeight >= 0 ? imageExceedHeight / 2 - $image_viewport.height() / 2 : parseInt( $newImage.css( 'marginTop' ) ) * ( 1 - 1 / settings.moveStep ) + ( ( - $image_viewport.height() / 2 + ( imageExceedHeight * Math.min( cursor.y, $image_viewport.height() ) / $image_viewport.height() ) ) ) / settings.moveStep,
	            marginLeft: imageExceedWidth >= 0 ? imageExceedWidth / 2 - $image_viewport.width() / 2 : parseInt( $newImage.css( 'marginLeft' ) ) * ( 1 - 1 / settings.moveStep ) + ( ( - $image_viewport.width() / 2 + ( imageExceedWidth * Math.min( cursor.x, $image_viewport.width() ) / $image_viewport.width() ) ) ) / settings.moveStep
	          } );
	      }, settings.moveInterval);

	      $newImage.fadeIn();
	      if ( !$play.hasClass('huge_gallery_control_play_pause') )
	        play();
	    }

	    var thumbClick = function($thumb) {
	      if ( $thumb.hasClass('opened') ) return false;
	      if ( $thumb.attr('num') == 0 )
	        $prev.hide();
	      else
	        $prev.show();
	      if ( $thumb.attr('num') == $thumbList.length - 1 )
	        $next.hide();
	      else
	        $next.show();
	      $thumbCurrent.removeClass('opened');
	      var $loader = $thumb.find('i');
	      // abort onload event if image is already loading
	      if ( preloadedImage != null ) {
	        preloadedImage.onload = null;
	        $thumbCurrent.removeClass('loading');
	      }
	      $thumbCurrent = $thumb;
	      //center thumbs list as possible
	      /*if ( $thumbContainer.width() - $thumbViewport.width() > 0 ) {
	        if ( $thumbCurrent.attr('num') <= 3 )
	          $thumbViewport.stop().animate({scrollLeft: 0});
	        else if ( $thumbContainer.find('td').length - $thumbCurrent.attr('num') <= 4 )
	          $thumbViewport.stop().animate({scrollLeft: $thumbContainer.width() - $thumbViewport.width() - settings.thumbMargin});
	        else
	          $thumbViewport.stop().animate({scrollLeft: ( settings.thumbWidth + settings.thumbMargin ) * ( $thumbCurrent.attr('num') - 3 )});
	      }*/

	      pause();
	      //load a huge image
	      preloadedImage = new Image();
	      preloadedImage.onload = function() {
	          $thumb.removeClass('loading').addClass('opened');
	          onLoad($thumb);
	          preloadedImage.onload = null; /* not sure it's necessary because of the next line */
	          preloadedImage = null;
	      };
	      preloadedImage.src = $thumb.attr('_href');
	      if ( preloadedImage != null )
	          $thumb.addClass('loading');
	      return false;
	    }

	    var showNext = function() {
	      if ( $thumbCurrent.parents('td:first').next().length > 0 )
	        thumbClick($thumbCurrent.parents('td:first').next().find('a'));
	      else
	        thumbClick($thumbContainer.find('td:first a'));
	      return false;
	    }

	    var showPrev = function() {
	      if ( $thumbCurrent.parents('td:first').prev().length > 0 )
	        thumbClick($thumbCurrent.parents('td:first').prev().find('a'));
	      else
	        thumbClick($thumbContainer.find('td:last a'));
	      return false;
	    }

	    /*$next.click(function(){
	      if ( !$play.hasClass('huge_gallery_control_play_pause') )
	        pause();
	      showNext();
	      if ( !$play.hasClass('huge_gallery_control_play_pause') )
	        play();
	    });
	    $prev.click(function(){
	      if ( !$play.hasClass('huge_gallery_control_play_pause') )
	        pause();
	      showPrev();
	      if ( !$play.hasClass('huge_gallery_control_play_pause') )
	        play();
	    });*/
		$btnFitScreen.click( toggleFit );
	    $next.click(showNext);
	    $prev.click(showPrev);
	    $btnClose.add($back).click(close);

	    open();

  	};

	$.widget( 'mm.slideshow', {

		options: {
			viewport:      '.slideshow-viewport',
			btnPrev:       '.slideshow-prev',
			btnNext:       '.slideshow-next',
			thumb:         '.slideshow-preview',
			currentThumbClass:  'slideshow-preview--current',
			zoomClass: 	   'slideshow-viewport--zoom',
			zoomBtn: 	   '.slideshow-zoom_in',
			slide:         '.slideshow-slide',
			swapDuration:  200,
			swapEasing:    'linear',
			slideTpl: 		'<div class="slideshow-slide"></div>',
			autoplay: 0
		},

		_create: function() {

			var that = this,

				$cont = $( that.element ),
				$viewport = $cont.find( that.options.viewport ),
				$btnPrev = $cont.find( that.options.btnPrev ),
				$btnNext = $cont.find( that.options.btnNext ),
				$thumbs = $cont.find(  that.options.thumb ),
				$zoomBtn = $cont.find( that.options.zoomBtn ),
				$scroller = $cont.find( '.slideshow-previews' ),
				$newSlide = $( 'nothing' ),
				$zoomThumb;

			$scroller.scroller({
				scrollPage: true,
				mouseDisable: true
			});

			updateZoom( $thumbs.filter( '.slideshow-preview--current' ) );

			$viewport.on( 'click', runGallery );

			function runGallery() {
				if ( $viewport.hasClass( that.options.zoomClass ) ) {
					showHugeImage( $zoomThumb.get(0), $thumbs.filter(function() {

						var hash = this.href.indexOf('#');

						return (hash > 0 && this.href.substr( hash + 1 ).length > 0);

					}) );
				}
			}

			function updateZoom( $thumb ) {

				var hash = $thumb.attr( 'href' ).indexOf('#');

				if ( hash > 0 && $thumb.attr( 'href' ).substr( hash + 1 ).length > 0 ) {
					$zoomThumb = $thumb;
					$zoomBtn.show();
					$viewport.addClass( that.options.zoomClass )
				} else {
					$zoomBtn.hide();
					$viewport.removeClass( that.options.zoomClass );
				}

			}

			function showImage( $thumb ) {

				var $oldSlides = $viewport.find( that.options.slide );

				$thumbs.removeClass( that.options.currentThumbClass );
				$thumb.addClass( that.options.currentThumbClass );

				$scroller.scroller( 'centerTo', $thumb );

				// fix viewport height
				$viewport.height( $oldSlides.last().height() );

				$oldSlides.not(':animated').css({
					opacity: 1,  // set explicitly for ie
					position: 'absolute',
					'z-index': 2
				});

				if ( $newSlide.length > 0 && !$newSlide.data( 'isLoaded' ) ) {
					$newSlide.off( 'load' ).remove();
				}

				$newSlide = $( that.options.slideTpl )
					.append( "<img src='" +  $thumb.attr( 'href' ) + "'/>" )
					.css({
						opacity: 1,  // set explicitly for ie
						position: 'absolute',
						'z-index': 1
					}).appendTo( $viewport );

				$newSlide.children( 'img' ).on( 'load', function() {

					$newSlide.data( 'isLoaded', true );

					updateZoom( $thumb );

					$oldSlides.not( ':animated' ).animate( { opacity: 0 }, that.options.swapDuration, that.options.swapEasing, function() {

						$( this ).remove();

					});

					if ( $viewport.height() !== $newSlide.height() ) {
						$viewport.animate( { height: $newSlide.height() }, that.options.swapDuration );
					}

				});

			}

			$btnPrev.on( 'click', function( evt ) {

				var $prevThumb = $thumbs.filter( '.' + that.options.currentThumbClass ).prev( that.options.thumb );

				if ( $prevThumb.length < 1 ) {
					$prevThumb = $thumbs.last();
				}

				showImage( $prevThumb );

			});

			$btnNext.on( 'click', function( evt ) {

				var $nextThumb = $thumbs.filter( '.' + that.options.currentThumbClass ).next( that.options.thumb );

				if ( $nextThumb.length < 1 ) {
					$nextThumb = $thumbs.first();
				}

				showImage( $nextThumb );

			});

			$thumbs.on( 'click', function( evt ) {

				evt.preventDefault();

				if ( !$( this ).hasClass( that.options.currentThumbClass ) ) {
					showImage( $( this ) );
				}

			});

		}

	});

})( jQuery );