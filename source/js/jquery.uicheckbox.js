/*
  requires jQuery 1.6+ because of using $.prop function
*/
(function( $ ){

  "use strict";

  $.fn.UICheckbox = function() {

    return this.each(function() {

      var options = {
            checkboxHoverClass: 'ui-checkbox--hover'
          },
          $real = $( this ),
          $decor = $( '<span class="ui-checkbox"></span>' ),
          $label = $( 'label[for="' + $real.attr( 'id' ) + '"]' ),
          isRadioButton = $real.hasClass( 'f-checkbox-radio' ),
          $form = $real.parents( 'form' );

      $decor.bind({
        click: function() {
          if ( $real.is( ':disabled' ) ) {
            return;
          }
          $real.focus();
          // change value only if it's checkbox or unchecked radio button (so we do not uncheck radio button)
          if ( !isRadioButton || !$real.get( 0 ).checked ) {
            $real
              .prop( 'checked', !$real.get( 0 ).checked )
              .trigger( 'change' );
          }
        }
      });

      $label.bind({
        mouseover: function() {
          if ( !$real.is( ':disabled' ) ) {
            $decor.addClass( options.checkboxHoverClass );
          }
        },
        mouseleave: function() {
          $decor.removeClass( options.checkboxHoverClass );
        }
      });

      $real.bind({
        change: function() {
          // uncheck other radio buttons if we check this
          if ( isRadioButton && $real.get( 0 ).checked ) {
            $( '[name="' + $real.attr( 'name' ) + '"]' ).each(function() {
              if ( this !== $real.get( 0 ) ) {
                $( this )
                  .prop( 'checked', false )
                  .data( '$decor' ).removeClass( 'ui-checkbox-checked' );
              }
            });
          }
          $decor.toggleClass( 'ui-checkbox-checked', $real.get( 0 ).checked );
          console.log( this, $real.get( 0 ).checked, $decor.hasClass( 'ui-checkbox-checked' ) );
        },
        focus: function() {
          $decor.addClass( options.checkboxHoverClass );
        },
        blur: function() {
          $decor.removeClass( options.checkboxHoverClass );
        },
        disabled: function() {
          if ( $real.is( ':disabled' ) ) {
            $decor.addClass( 'ui-checkbox-disabled' );
            $label.addClass( 'ui-checkbox-label-disabled' );
          } else {
            $decor.removeClass( 'ui-checkbox-disabled' );
            $label.removeClass( 'ui-checkbox-label-disabled' );
          }
        }
      });

      $form.bind( 'reset', function() {
        setTimeout( function() { $real.trigger( 'change' ) }, 1 );
      });

      $decor.toggleClass( 'ui-checkbox-checked', $real.get( 0 ).checked );
      $real.addClass( 'ui-checkbox-val' );
      if ( $real.is( ':disabled' ) ) {
        $decor.addClass( 'ui-checkbox-disabled' );
        $label.addClass( 'ui-checkbox-label-disabled' );
      }
      if ( isRadioButton ) {
        $decor.addClass( 'ui-checkbox-radio' );
      }
      $decor.insertAfter( $real );

      $real.data( '$decor', $decor );

    });

  };

})( jQuery );