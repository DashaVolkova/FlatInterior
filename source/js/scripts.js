(function( $, window ){

	"use strict";

	// Mark touch device for css styles
	( "ontouchstart" in window || window.DocumentTouch && document instanceof DocumentTouch ) && $( 'html' ).removeClass( 'no-touch' );

	// Enable live reload for dev enviroment (with port number defined)
	if ( location.host.indexOf( ':' ) >= 0  && ( ( "WebSocket" in window ) || ( "MozWebSocket" in window ) ) ) {
		$( '<script src="http://' + location.host.split(':')[0] + ':35729/livereload.js"></script>' ).appendTo( $( 'body' ) );
	}

	function initAll( context ) {

		$( '.popup-inner-file', context ).each(function() {
			var $decor = $(this),
				$source = $decor.find( '.popup-inner-file-source' );

			$source.on( 'change', function() {
				$decor.addClass( 'popup-inner-file--check' );

			});

		});

		/*
			Slideshow
		 */
		$( '.slideshow', context ).slideshow();

		/*
			Form validation and placeholders polyfill
		 */
		H5F.setup( $( 'form', context ).toArray(), {
			invalidClass: 'invalid'
		});

		/*
			How we work
		 */
		$( '.how_work', context ).each(function() {
			var options = {
					titleSelectedClass: 'how_work-selected',
					contentSelectedClass: 'how_work-list--selected'
				},
				$container = $( this ),
				$titles = $container.find( '.how_work-center > span' ),
				$contents = $container.find( '.how_work-list' );

			$titles.each(function( index ) {
				var $title = $( this ),
					$content = $contents.eq( index );

				$title.on( 'click', function() {
					if ( $( this ).hasClass( options.titleSelectedClass ) ) {
						return;
					}

					$titles.removeClass( options.titleSelectedClass );
					$title.addClass( options.titleSelectedClass );
					$contents.removeClass( options.contentSelectedClass );
					$content.addClass( options.contentSelectedClass );
				});
			});
		});

		/*
			Page down button
		 */
		$( '.page_down', context ).each(function() {
			var options = {
					scrollDuration: 500,
					scrollEasing: 'easeOutQuint',
					scrollTo: 167, // .header height
					btnAnimateDuration: 300,
					btnHeight: 19
				},
				$btn = $( this ),
				$window = $( window ),
				isHidden = false;

			$window.on( 'scroll', function() {
				if ( isHidden && $window.scrollTop() === 0 ) {
					isHidden = false;
					$btn.stop().animate({ bottom: 0 }, options.btnAnimateDuration );
				}
				if ( !isHidden && $window.scrollTop() !== 0 ) {
					isHidden = true;
					$btn.stop().animate({ bottom: -options.btnHeight	 }, options.btnAnimateDuration );
				}
			});

			$btn.on( 'click', function() {
				$( 'html, body' ).animate({ scrollTop: options.scrollTo }, options.scrollDuration, options.scrollEasing );
			});
		});

		/*
			Page up button
		 */
		$( '.page_up', context ).each(function() {
			var options = {
					scrollDuration: 500,
					scrollEasing: 'easeOutQuint',
					btnAnimateDuration: 300,
					btnBottom: 46,
					btnBottomHide: 20
				},
				$btn = $( this ),
				$window = $( window ),
				isHidden = true;

			$window.on( 'scroll', function() {
				if ( isHidden && $window.scrollTop() !== 0 ) {
					isHidden = false;
					$btn
						.css({
							display: 'block',
							opacity: 0
						})
						.stop().animate({ bottom: options.btnBottom, opacity: 1 }, options.btnAnimateDuration );
				}
				if ( !isHidden && $window.scrollTop() === 0 ) {
					isHidden = true;
					$btn.stop().animate({ bottom: options.btnBottomHide, opacity: 0 }, options.btnAnimateDuration, function() {
						$btn.css( 'display', 'none' );
					});
				}
			});

			$btn.on( 'click', function() {
				$( 'html, body' ).animate({ scrollTop: 0 }, options.scrollDuration, options.scrollEasing );
			});
		});

		/*
			Header slim and Aside
		 */
		$( '.header', context ).each(function() {
			var options = {
					headerFixedClass: 'header--fixed',
					asideFixedClass: 'aside--fixed',
					fixTop: 103,
					animateDuration: 300
				},
				$header = $( this ),
				$slim = $header.find( '.header_slim' ),
				$aside = $( '.aside' ),
				$window = $( window ),
				isFixed = false,
				windowHeight,
				windowScrollDiff;

			function updateDimensions() {
				windowHeight = $window.height();
				windowScrollDiff = Math.max( $( 'html' ).height(), $( 'body' ).height() ) - windowHeight;
			}

			function update() {
				var scrollTop = $window.scrollTop();

				if ( isFixed ) {
					if ( scrollTop < options.fixTop ) {
						isFixed = false;
						$header.removeClass( options.headerFixedClass );
						$aside.removeClass( options.asideFixedClass );
						$slim.css( 'display', 'none' );
					} else {
						if ( scrollTop > windowScrollDiff - 28 ) {
							$aside.css( 'height', windowHeight - ( scrollTop - windowScrollDiff + 28 ) );
						} else {
							$aside.css( 'height', windowHeight );
						}
					}
				}
				if ( !isFixed ) {
					if ( scrollTop >= options.fixTop ) {
						isFixed = true;
						$header.addClass( options.headerFixedClass );
						$aside.addClass( options.asideFixedClass );
						$slim.css({
							display: 'block',
							opacity: 0
						});
						$slim.stop().animate({ opacity: 1 }, options.animateDuration );

						$aside.css( 'height', windowHeight );
					} else {
						$aside.css( 'height', windowHeight + scrollTop );
					}
				}
			}

			$window.on( 'resize', updateDimensions );
			updateDimensions();
			$window.on( 'resize', update );
			$window.on( 'scroll', update );
			update();
		});

		/*
			Sec menu submenu
		 */
		$( '.sec_menu', context ).each(function() {
			var $secMenu = $( this ),
				$submenus = $secMenu.find( '.smenu' );

			$submenus.each(function() {
				var options = {
						itemHoverClass: 'sec_menu-hover'
					},

					$submenu = $( this ),
					$item = $submenu.parent( 'div' ),
					$itemBefore = $item.prev( 'b' ),
					$itemBeforePlace = $itemBefore.children( 'b' ),
					$itemAfter = $item.next( 'b' ),
					$itemAll = $item.add( $itemBefore ).add( $itemAfter ),

					itemBeforeWidth,
					itemAfterWidth,
					itemWidth,
					hideTimer,

					supportTouch = !!( "ontouchstart" in window || window.DocumentTouch && document instanceof DocumentTouch );

				function updateDimensions() {
					itemBeforeWidth = $itemBefore.width();
					itemAfterWidth = $itemAfter.width();
					itemWidth = $item.width();
				}

				function show() {
					hideTimer && clearTimeout( hideTimer );
					$submenu.css({
						display: 'block',
						minWidth: itemBeforeWidth + itemWidth + itemAfterWidth
					});
					$itemAll.addClass( options.itemHoverClass );
				}

				function hide() {
					$submenu.css( 'display', 'none' );
					$itemAll.removeClass( options.itemHoverClass );
				}

				function closeOnTouchOutside() {
					$( document.body ).unbind( 'click', closeOnTouchOutside );

					// give time to catch click on submenu
					setTimeout( hide, 1 );
				}

				$itemAll.on( 'mouseover', show );

				$itemAll.on( 'mouseout', function() {
					hideTimer = setTimeout( hide, 1 );
				});

				// for touch devices show submenu on touch
				if ( supportTouch ) {
					$itemAll.bind( 'click', function( evt ) {
						// if not is opened, prevent following link and show submenu
						if ( !$item.hasClass( options.itemHoverClass ) ) {
							evt.preventDefault();

							setTimeout(function() {
								$( document.body ).bind( 'click', closeOnTouchOutside );
							}, 1 );
							show();
						}
					});
				}

				$( window ).on( 'load', updateDimensions );
				updateDimensions();

				$submenu.appendTo( $itemBeforePlace );
			});
		});

		/*
			UICheckboxes
		 */
		$( 'input[type="checkbox"]', context ).UICheckbox();

		/*
			Match set
		 */
		$( '.match-set', context ).each(function() {
			var options = {
					collapsedClass: 'match-set--collapsed'
				},
				$set = $( this ),
				$title = $set.find( '.match-set-title' );

			$title.on( 'click', function() {
				$set.toggleClass( options.collapsedClass );
			});
		});

		/*
			Inplace
		 */
		$( '.inplace', context ).each(function() {

			var $inplace = $( this ),
				data = $inplace.data( 'inplace' ),
				zIndex = 1;

			$.each( data.items, function() {

				var $plus = $( '<div class="inplace-plus"></div>' ),
					$data = $( '#inplace_' + this.id ),
					data_width = parseInt( $data.css( 'width' ), 10 ),
					data_height = parseInt( $data.css( 'height' ), 10 ),
					x = this.x * data.image_size.width,
					y = this.y * data.image_size.height;

				if ( $data.length < 1 ) {
					$plus.hide();
				}

				if ( this.x < 0.5 && this.y < 0.5 ) {
					$data.css({
						left: x,
						top: y
					});
				} else if ( this.x >= 0.5 && this.y < 0.5 ) {
					$data.css({
						left: x - data_width,
						top: y
					});
				} else if ( this.x < 0.5 && this.y >= 0.5 ) {
					$data.css({
						left: x,
						top: y - data_height
					});
				} else if ( this.x >= 0.5 && this.y >= 0.5 ) {
					$data.css({
						left: x - data_width,
						top: y - data_height
					});
				}

				$plus.on( 'click', function() {

					if ( $data.is( ':visible' ) ) {
						return ;
					}

					$data.css( 'zIndex', zIndex++ );
					$data.fadeIn( 300 );

				});

				$data.on( 'click', function() {

					// move $data up
					$data.css( 'zIndex', zIndex++ );

				});

				$data.find( '.inplace-item-close' ).on( 'click', function() {

					$data.fadeOut( 300 );

				});

				$plus.css({
					left: x,
					top: y
				});

				$plus.appendTo( $inplace );

			});

		});

		/*
			Service
		 */
		$( '.service' ).each(function() {
			var options = {
					slideCurrentClass: 'service-slide--current',
					linkCurrentClass: 'pagination-link--current'
				},
				$service = $( this ),
				$slides = $service.find( '.service-slide' ),
				$links = $service.find( '.pagination .pagination-link' ),
				$btnBackward = $service.find( '.service-btn--backward' ),
				$btnForward = $service.find( '.service-btn--forward' ),
				currentSlide = 0,
				countSlides = $links.length;

			function slideInDir( dir ) {
				if ( dir === '>' ) {
					currentSlide++;
					currentSlide = currentSlide >= countSlides ? 0 : currentSlide;
					$links.eq( currentSlide ).trigger( 'click' );
				} else if ( dir === '<' ) {
					currentSlide--;
					currentSlide = currentSlide < 0 ? countSlides - 1 : currentSlide;
					$links.eq( currentSlide ).trigger( 'click' );
				}
			}

			$links.each(function( index ) {
				var $link = $( this ),
					$slide = $slides.eq( index );

				if ( $link.hasClass( options.linkCurrentClass ) ) {
					currentSlide = index;
				}

				$link.on( 'click', function() {
					$slides.removeClass( options.slideCurrentClass );
					$slide.addClass( options.slideCurrentClass );
					$links.removeClass( options.linkCurrentClass );
					$link.addClass( options.linkCurrentClass );
				});
			});

			$btnBackward.on( 'click', function() {
				slideInDir( '<' );
			});

			$btnForward.on( 'click', function() {
				slideInDir( '>' );
			});
		});

		/*
			Shopping cart remove item
		 */
		$( '.fav-item .button_grey--del' ).each(function() {
			var $btnDel = $( this ),
				$item = $btnDel.parents( '.fav-item:first' );

			$btnDel.on( 'click', function( evt ) {

				evt.preventDefault();

				$.ajax({
					url: $btnDel.data( 'ajax' ).url
				});

				$item.slideUp( 200, function() {

					$item.remove();

				});

			});
		});
	}

	/*
	 *   DOM Ready section
	 */
	$(function(){

		// Remove click delay on touch devices
		FastClick.attach( document.body );

		initAll( document.body );

	});
	// End of DOM ready section

})( jQuery, window );