/**
 * Simple Carousel
 * HTML Structure:
 * OBJECT >
 *	.crsl-wrap > .crsl-item
 * @author @basilio
 * @version 0.1
 **/

(function($){
	$.fn.carousel = function(args){
		var defaults = {
			infinite : true,
			total : $(this).find('.crsl-item').length,
			speed : 'fast',
			activeClass : 'crsl-active',
			itemWidth : $(this).find('.crsl-item:eq(0)').outerWidth(true),
			itemHeight : $(this).find('.crsl-item:eq(0)').outerHeight(true),
			scroll : 1,
			paginate : $(this).data('target-paginate'),
			preventAnimatedQueue : false,
			autoRotate : false
		}
		return $(this).each( function(){
			// Set Object
			var obj = this;
			
			// extend
			if( $.isEmptyObject(args) == false ) $.extend( defaults, args );
			
			// item
			$(obj).find('.crsl-item').css( { position : 'relative', float : 'left' } );
			
			// width & margin wrap
			obj.wrapWidth = parseInt( defaults.itemWidth * defaults.total );
			obj.wrapMarginDefault = defaults.infinite ? parseInt( defaults.itemWidth * -1 ) : 0 ;
			obj.wrapMargin = obj.wrapMarginDefault;
			$(obj).find('.crsl-wrap').css({ width: obj.wrapWidth+'px', height: defaults.itemHeight+'px', marginLeft: obj.wrapMargin+'px' });
			
			// Add active
			$(obj).find('.crsl-item:first-child').addClass(defaults.activeClass);
			
			// Infinite add last to begin
			if( defaults.infinite ){
				$(obj).find('.crsl-item:first-child').before( $('.crsl-item:last-child', obj) );
			}
			
			// Trigger Carousel Config
			$(window).ready(function(){
				$(obj).trigger('beginCarousel', [defaults, obj]);
			});
			
			// Resize
			$(window).bind('resizeEnd', function(){
				if( defaults.itemWidth !== $(obj).find('.crsl-item:eq(0)').outerWidth(true) ){
					defaults.itemWidth = $(obj).find('.crsl-item:eq(0)').outerWidth(true);
					defaults.itemHeight = $(obj).find('.crsl-item:eq(0)').outerHeight(true);
					obj.wrapWidth = parseInt( defaults.itemWidth * defaults.total );
					obj.wrapMargin = obj.wrapMarginDefault = defaults.itemWidth * -1;
					$(obj).find('.crsl-wrap').css({ width: obj.wrapWidth+'px', height: defaults.itemHeight+'px', marginLeft: obj.wrapMargin+'px' });
				}
			});
			
			// Auto Rotate Config
			if( defaults.autoRotate !== false ){
				obj.rotateTime = window.setInterval( function(){
					//$('#' + defaults.paginate).find('.next').trigger('autoclick');
					obj.rotate(defaults, obj);
				}, defaults.autoRotate);
			}
			
			// Event Click
			$( '#'+defaults.paginate ).delegate('.prev, .next', 'click', function(event){
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
				obj.wrapMargin = defaults.infinite ? obj.wrapMarginDefault + ( $(itemActive).outerWidth(true) * defaults.scroll ) : obj.wrapMargin + ( $(itemActive).outerWidth(true) * defaults.scroll );
				var prevItemIndex = parseInt( $(itemActive).index() - defaults.scroll );
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
							if( obj.wrapMargin >= obj.wrapMarginDefault ) $( '#'+defaults.paginate ).find('.prev').addClass('prev-inactive');
							if( ( obj.wrapWidth - obj.wrapMargin ) == defaults.itemWidth*defaults.total ) $( '#'+defaults.paginate ).find('.next').removeClass('next-inactive');
						}
					});
				// Trigger Carousel Exec
				$(obj).trigger('endCarousel', [defaults, obj, action]);
			}
			
			// Next Animate
			obj.next = function(defaults, obj, itemActive){
				obj.wrapMargin = defaults.infinite ? obj.wrapMarginDefault - ( $(itemActive).outerWidth(true) * defaults.scroll ) : obj.wrapMargin - ( $(itemActive).outerWidth(true) * defaults.scroll );
				var nextItemIndex = parseInt( $(itemActive).index() + defaults.scroll );
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
							if( obj.wrapMargin < obj.wrapMarginDefault ) $( '#'+defaults.paginate ).find('.prev').removeClass('prev-inactive');
							if( ( obj.wrapWidth - obj.wrapMargin ) != defaults.itemWidth*defaults.total ) $( '#'+defaults.paginate ).find('.next').addClass('next-inactive');
						}
					});
				// Trigger Carousel Exec
				$(obj).trigger('endCarousel', [defaults, obj, action]);
			}
		});
	}
})(jQuery);