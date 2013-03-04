/**
 * Simple Carousel
 * HTML Structure:
 * .crsl-items > .crsl-wrap > .crsl-item
 * @author @basilio
 * @version 0.2
 **/

(function($){
	$.fn.carousel = function(args){
		var defaults = {
			infinite : true,
			total : $(this).find('.crsl-item').length,
			visible : 1,
			speed : 'fast',
			overflow : true,
			autoRotate : false,
			activeClass : 'crsl-active',
			navigationId : $(this).data('navigation'),
			itemWidth : $(this).width(),
			itemMinWidth : 320, // think in mobile!
			itemHeight : false,
			itemHeightEqual : false,
			gutter : 0,
			preventAnimatedQueue : false
		}
		return $(this).each( function(){
			// Set Object
			var obj = this;
			
			// Extend
			if( $.isEmptyObject(args) == false ) $.extend( defaults, args );
			
			if( defaults.overflow == true ){
				$(obj).css( { overflow: 'hidden' } );
			} else {
				$('html, body').css( { 'overflow-x': 'hidden' } );
			}
			$(obj).find('.crsl-item').css( { position : 'relative', float : 'left', overflow: 'hidden' } );
			$(obj).find('.crsl-item:first-child').addClass(defaults.activeClass);
			if( defaults.infinite ) $(obj).find('.crsl-item:first-child').before( $('.crsl-item:last-child', obj) );
			
			// Trigger Carousel Config
			$(window).ready(function(){
				// Config Call
				obj.config(defaults, obj);
				// Begin Carousel
				$(obj).trigger('beginCarousel', [defaults, obj]);
				// Resize End event
				$(window).resize(function(){
					if(this.resizeTO) clearTimeout(this.resizeTO);
					this.resizeTO = setTimeout(function(){
						$(this).trigger('resizeEnd');
					}, 100);
				});
			});
			
			// Auto Rotate Config
			if( defaults.autoRotate !== false ){
				obj.rotateTime = window.setInterval( function(){
					obj.rotate(defaults, obj);
				}, defaults.autoRotate);
			}
			
			// Bind ResizeEnd on Window: use for recall obj.config()
			$(window).bind('resizeEnd', function(){
				if( defaults.itemWidth !== $(obj).width() ){
					obj.config(defaults, obj);
				}
			});
			
			// Clicks on Navigation
			$( '#'+defaults.navigationId ).delegate('.prev, .next', 'click', function(event){
				// Prevent default
				event.preventDefault();
				// Stop rotate
				if( defaults.autoRotate !== false ){
					clearInterval(obj.rotateTime);
				}
				// Prevent Animate Event
				if( defaults.preventAnimatedQueue != false ){
					if( $('.'+defaults.preventAnimatedQueue+':animated').length > 0 ){
						return false;
					}
				}
				// Active
				var itemActive = $(obj).find('.crsl-item.'+defaults.activeClass);
				// Previous & next action
				if( $(this).hasClass('prev') && $('.crsl-wrap', obj).find('.crsl-item').index(itemActive) > 0 ){
					obj.previous(defaults, obj, itemActive);
				} else if( $(this).hasClass('next') && ( ( !defaults.infinite && ( (obj.wrapWidth-obj.wrapMargin) == defaults.itemWidth*defaults.total ) ) || ( defaults.infinite ) ) ){
					obj.next(defaults, obj, itemActive);
				}
			});
			
			// Base Configuration: 
			obj.config = function(defaults, obj){
				// Width Item
				defaults.itemWidth = Math.floor( ( $(obj).width() - defaults.gutter ) / defaults.visible );
				if( defaults.itemWidth <= defaults.itemMinWidth ) defaults.itemWidth = Math.floor( $(obj).width() - defaults.gutter );
				// Set Variables
				obj.wrapWidth = Math.floor( ( defaults.itemWidth + defaults.gutter ) * defaults.total );
				obj.wrapHeight = $(obj).find('.crsl-item').equalHeight(true);
				obj.wrapMargin = obj.wrapMarginDefault = defaults.infinite ? parseInt( ( defaults.itemWidth + defaults.gutter ) * -1 ) : 0 ;
				// Modify Styles
				$(obj).find('.crsl-wrap').css({ width: obj.wrapWidth+'px', height: obj.wrapHeight+'px', marginLeft: obj.wrapMargin });
				$(obj).find('.crsl-item').css({ width: defaults.itemWidth+'px', marginRight : defaults.gutter+'px' });
			}
			
			// Rotate Action
			obj.rotate = function(defaults, obj){
				// Prevent Animate Event
				if( defaults.preventAnimatedQueue != false ){
					if( $('.'+defaults.preventAnimatedQueue+':animated').length > 0 ){
						return false;
					}
				}
				// Active
				var itemActive = $(obj).find('.crsl-item.'+defaults.activeClass);
				obj.next(defaults, obj, itemActive);
			}
			
			// Previous Animate
			obj.previous = function(defaults, obj, itemActive){
				obj.wrapMargin = defaults.infinite ? obj.wrapMarginDefault + $(itemActive).outerWidth(true) : obj.wrapMargin + $(itemActive).outerWidth(true);
				var prevItemIndex = $(itemActive).index();
				var newItemActive = $(itemActive).prev('.crsl-item');
				var action = 'previous';
				// Animate
				$(obj).
					find('.crsl-wrap').
					animate({ marginLeft: obj.wrapMargin+'px' }, defaults.speed, function(){
						// Active
						$(itemActive).removeClass(defaults.activeClass);
						$(newItemActive).addClass(defaults.activeClass);
						if( defaults.infinite ){
							$(this).css({ marginLeft: obj.wrapMarginDefault }).find('.crsl-item:first-child').before( $('.crsl-item:last-child', obj) );
						} else {
							if( obj.wrapMargin >= obj.wrapMarginDefault ) $( '#'+defaults.navigationId ).find('.prev').addClass('prev-inactive');
							if( ( obj.wrapWidth - obj.wrapMargin ) == defaults.itemWidth*defaults.total ) $( '#'+defaults.navigationId ).find('.next').removeClass('next-inactive');
						}
					});
				// Trigger Carousel Exec
				$(obj).trigger('endCarousel', [defaults, obj, action]);
			}
			
			// Next Animate
			obj.next = function(defaults, obj, itemActive){
				obj.wrapMargin = defaults.infinite ? obj.wrapMarginDefault - $(itemActive).outerWidth(true) : obj.wrapMargin - $(itemActive).outerWidth(true);
				var nextItemIndex = $(itemActive).index();
				var newItemActive = $(itemActive).next('.crsl-item');
				var action = 'next';
				// Animate
				$(obj).
					find('.crsl-wrap').
					animate({ marginLeft: obj.wrapMargin+'px' }, defaults.speed, function(){
						// Active
						$(itemActive).removeClass(defaults.activeClass);
						$(newItemActive).addClass(defaults.activeClass);
						if( defaults.infinite ){
							$(this).css({ marginLeft: obj.wrapMarginDefault }).find('.crsl-item:last-child').after( $('.crsl-item:first-child', obj) );
						} else {
							if( obj.wrapMargin < obj.wrapMarginDefault ) $( '#'+defaults.navigationId ).find('.prev').removeClass('prev-inactive');
							if( ( obj.wrapWidth - obj.wrapMargin ) != defaults.itemWidth*defaults.total ) $( '#'+defaults.navigationId ).find('.next').addClass('next-inactive');
						}
					});
				// Trigger Carousel Exec
				$(obj).trigger('endCarousel', [defaults, obj, action]);
			}
			
			// Function Equal Heights
			$.fn.equalHeight = function(get){
				tallest = 0;
				$(this).each(function(){
					$(this).css({ 'height': 'auto' });
					if ( $(this).innerHeight(true) > tallest ) { tallest = $(this).innerHeight(true); };
				});
				if( get == true ) return tallest;
				else $(this).css({'height': tallest});
			}
		});
	}
})(jQuery);