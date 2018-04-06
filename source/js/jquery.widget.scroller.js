(function( $ ) {

	"use strict";

	// TODO can be optimized by generating getScrollPos/setScrollPos functinos without conditions

	$.widget( 'mm.scroller', {

		scrollbarTpl: [ '<div class="scroller-scrollbar">',
							'<div class="scroller-scrollbar-backward"></div>',
							'<div class="scroller-scrollbar-forward"></div>',
							'<div class="scroller-scrollbar-place">',
								'<div class="scroller-scrollbar-handler"></div>',
							'</div>',
						'</div>' ].join( '' ),

		options: {
			backwardBtnQuery: '.scroller-backward',
			forwardBtnQuery: '.scroller-forward',
			viewportQuery: '.scroller-viewport',
			contentQuery: '.scroller-content',
			scrollDir: 'h', // 'v' - for vertical, 'h' - for horizontal,
			scrollbar: false,
			mouseDisable: false,
			mousewheelStep: 0.1,
			scrollPage: false, // if true then scroll one page and align to children elements
			scrollToDistance: 0.7,
			scrollToDuration: 200,
			scrollToEsaing: 'easeOutQuad'
		},

		_create: function () {

			var that = this;

			that.el = {};
			that.el.$backwardBtn = $( that.options.backwardBtnQuery, that.element );
			that.el.$forwardBtn = $( that.options.forwardBtnQuery, that.element );
			that.el.$viewport = $( that.options.viewportQuery, that.element );
			that.el.$content = $( that.options.contentQuery, that.element );

			// need to keep scroll position instead of getting it from content position
			// because of iScroll which is incompatible with jquery.transit $(...).css('x')
			that.scrollPos = 0;

			that.isTouchDevice = !!( 'ontouchstart' in window );
			that.touchClickEvent = that.isTouchDevice ? 'click' : 'click';
			that.iscroll = null;

			that._updateDimentions();
			that._updateControls();

			if ( that.options.scrollbar && !that.isTouchDevice ) {
				that._initScrollbar();
			}

			that.element.on( 'setScrollPos', $.proxy( that._updateControls, that ) );

			if ( that.isTouchDevice ) {
				// scroll by touch
				that.iscroll = new iScroll( that.el.$viewport.get( 0 ), {
					hScroll: that.options.scrollDir === 'h',
					vScroll: that.options.scrollDir === 'v',
					hScrollbar: that.options.scrollDir === 'h' && that.options.scrollbar,
					vScrollbar: that.options.scrollDir === 'v' && that.options.scrollbar,
					onScrollMove: function() {
						that.scrollPos = -this.x;
					},
					onScrollEnd: function() {
						that.scrollPos = -this.x;
						that._updateControls();
					}
				});
			}

			// scroll by mousewheel
			if ( !that.options.mouseDisable ) {
				that._on( that.el.$viewport, { 'mousewheel': function( evt, delta ) {

					var that = this,
						step = that.options.mousewheelStep <= 1 ? that.options.mousewheelStep * that.el.$viewport.width() : that.options.mousewheelStep;

					that.setScrollPos( delta < 0 ? that.getScrollPos() + step : that.getScrollPos() - step );
					evt.preventDefault();

				}});
			}

			// scroll backward by button
			that._on( that.el.$backwardBtn, (function() {

				var handlers = {};

				handlers[ that.touchClickEvent ] = function() {

					var that = this,
						scrollOn = that.options.scrollToDistance <= 1 ? that._getViewportSize() * that.options.scrollToDistance : that.options.scrollToDistance;

					that.scrollTo( that.scrollPos - scrollOn );

				}

				return handlers;

			})());

			// scroll forward by button
			that._on( that.el.$forwardBtn, (function() {

				var handlers = {};

				handlers[ that.touchClickEvent ] = function() {

					var that = this,
						scrollOn = that.options.scrollToDistance <= 1 ? that._getViewportSize() * that.options.scrollToDistance : that.options.scrollToDistance;

					that.scrollTo( that.scrollPos + scrollOn );

				}

				return handlers;

			})());

			$( window ).on( 'load', $.proxy( that.update, that ) );

		},

		getScrollPos: function() {

			var that = this;

			return that.scrollPos;

		},

		setScrollPos: function( scrollPos ) {

			var that = this;

			scrollPos = Math.min( scrollPos, that.scrollDiff );
			scrollPos = Math.max( scrollPos, 0 );

			if ( that.options.scrollDir === 'h' ) {
				that.isTouchDevice ? that.el.$content.css( 'x', -scrollPos ) : that.el.$viewport.scrollLeft( scrollPos );
			} else {
				that.isTouchDevice ? that.el.$content.css( 'y', -scrollPos ) : that.el.$viewport.scrollTop( scrollPos );
			}

			// update scrollPos for getter
			that.scrollPos = scrollPos;

			// trigger event
			that.element.trigger( 'setScrollPos', { scrollPos: scrollPos } );

		},

		scrollTo: function( scrollTo ) {

			var that = this;

			// prevent action when is animating
			if ( that.isTouchDevice ? that.el.$content.is( ':animated' ) : that.el.$viewport.is( ':animated' ) ) {
			 	return;
			}

			scrollTo = Math.max( scrollTo, 0 );
			scrollTo = Math.min( scrollTo, that.scrollDiff );

			if ( that.isTouchDevice ) {
				that.el.$content.transit( { x: -scrollTo }, that.options.scrollToDuration, that.options.scrollToEsaing, function() {
					that.scrollPos = scrollTo;
					that._updateControls();
				});
			} else {
				that.el.$viewport.animate( { scrollLeft: scrollTo }, that.options.scrollToDuration, that.options.scrollToEsaing, function() {
					that.scrollPos = scrollTo;
					that._updateControls();
				});
			}

		},

		centerTo: function( $elem ) {

			var that = this,
				elemPos = that.options.scrollDir === 'h' ? $elem.offset().left : $elem.offset().top,
				elemSize = that.options.scrollDir === 'h' ? $elem.width() : $elem.height(),
				viewportPos = that.options.scrollDir === 'h' ? that.el.$viewport.offset().left : that.el.$viewport.offset().top,
				scrollTo;

			scrollTo = Math.round( elemPos - viewportPos + that.scrollPos - ( that._getViewportSize() - elemSize ) / 2 );

			that.scrollTo( scrollTo );

		},

		_updateDimentions: function() {

			var that = this;

			if ( that.options.scrollPage ) {
				that.el.$content.children().each(function() {

					if ( that.options.scrollDir === 'h' ) {
						if ( $( this ).get( 0 ).offsetLeft > that.el.$viewport.width() ) {
							that.options.scrollToDistance = $( this ).get( 0 ).offsetLeft;
							return false;
						}
					} else {
						if ( $( this ).get( 0 ).offsetTop > that.el.$viewport.height() ) {
							that.options.scrollToDistance = $( this ).get( 0 ).offsetTop;
							return false;
						}
					}

				});
			}

			that.scrollDiff = Math.max( that._getContentSize() - that._getViewportSize(), 0 );

		},

		_updateControls: function () {

			var that = this,
				scrollPos = that.getScrollPos();

	    	scrollPos === 0 ? that.el.$backwardBtn.hide() : that.el.$backwardBtn.show();
			scrollPos === that.scrollDiff ? that.el.$forwardBtn.hide() : that.el.$forwardBtn.show();

		},

		_getViewportSize: function() {

			var that = this;

			return that.options.scrollDir === 'h' ? that.el.$viewport.width() : that.el.$viewport.height();

		},

		_getContentSize: function() {

			var that = this;

			return that.options.scrollDir === 'h' ? that.el.$content.outerWidth() : that.el.$content.outerHeight();

		},

		update: function() {

			var that = this;

			that._updateDimentions();
			// update current scroll pos
			that.scrollPos = Math.max( that.scrollPos, 0 );
			that.scrollPos = Math.min( that.scrollPos, that.scrollDiff );
			that._updateControls();
			if ( that.iscroll ) {
				setTimeout(function() {
					that.iscroll.refresh();
					that.element.trigger( 'update' );
				}, 1 );
			} else {
				that.element.trigger( 'update' );
			}

		},

		_initScrollbar: function() {

			var that = this,
				scrollbarDiff = 0,
				startHandlerPos = 0,
				startDragPos = 0;

			function _getPlaceSize() {

				return that.options.scrollDir === 'h' ? that.el.$scrollbarPlace.width() : that.el.$scrollbarPlace.height();

			}

			function _updateHandlerPos() {

				if ( that.scrollDiff > 0 ) {
					_setHandlerPos( that.getScrollPos() / that.scrollDiff * scrollbarDiff );
					that.el.$scrollbar.removeClass( 'scroller-scrollbar--disabled' );
				} else {
					that.el.$scrollbar.addClass( 'scroller-scrollbar--disabled' );
				}

			}

			function _setHandlerPos( pos ) {

				pos = Math.min( pos, scrollbarDiff );
				pos = Math.max( pos, 0 );

				if ( that.options.scrollDir === 'h' ) {
					that.el.$scrollbarHandler.css( 'left', pos );
				} else {
					that.el.$scrollbarHandler.css( 'top', pos );
				}

			}

			function _getHandlerPos() {

				return parseInt( that.options.scrollDir === 'h' ? that.el.$scrollbarHandler.css( 'left' ) : that.el.$scrollbarHandler.css( 'top' ) );

			}

			function _setHandlerSize( size ) {

				if ( that.options.scrollDir === 'h' ) {
					that.el.$scrollbarHandler.width( size );
				} else {
					that.el.$scrollbarHandler.height( size );
				}

			}

			function _updateDimentions() {

				var handlerSize = Math.min( that._getViewportSize() / that._getContentSize(), 1 ) * _getPlaceSize();

				scrollbarDiff = Math.max( _getPlaceSize() - handlerSize, 0 );
				_setHandlerSize( handlerSize );

			}

			function _dontStartSelectForIE8() {

				return false;

			}

			function _onHandlerMousedown( evt ) {

				evt.preventDefault();

				startHandlerPos = _getHandlerPos();
				startDragPos = that.options.scrollDir === 'h' ? evt.pageX : evt.pageY;

				$( document ).on( 'selectstart', _dontStartSelectForIE8 );
				$( document.body ).on( 'mousemove', _onHandlerMousemove );
				$( document.body ).on( 'mouseup blur', _onHandlerMouseup );

			}

			function _onHandlerMousemove( evt ) {

				var handlerPos = startHandlerPos + ( that.options.scrollDir === 'h' ? evt.pageX : evt.pageY ) - startDragPos;

				that.setScrollPos( handlerPos / scrollbarDiff * that.scrollDiff );

			}

			function _onHandlerMouseup( evt ) {

				$( document.body ).off( 'mousemove', _onHandlerMousemove );
				$( document.body ).off( 'mouseup blur', _onHandlerMouseup );
				$( document ).off( 'selectstart', _dontStartSelectForIE8 );

			}

			that.el.$scrollbar = $( that.scrollbarTpl ).appendTo( that.element );
			that.el.$scrollbarPlace = that.el.$scrollbar.find( '.scroller-scrollbar-place' );
			that.el.$scrollbarHandler = that.el.$scrollbar.find( '.scroller-scrollbar-handler' );
			that.el.$scrollbarForwardBtn = that.el.$scrollbar.find( '.scroller-scrollbar-forward' );
			that.el.$scrollbarBackwardBtn = that.el.$scrollbar.find( '.scroller-scrollbar-backward' );

			_updateDimentions();
			that.element.on( 'update', function() {

				_updateDimentions();
				_updateHandlerPos();

			});

			that.element.on( 'setScrollPos', _updateHandlerPos );

			that.el.$scrollbarHandler.on( 'mousedown', _onHandlerMousedown );

		}

	});

})( jQuery );