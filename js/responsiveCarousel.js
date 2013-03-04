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
			scroll : 1,
			speed : 'fast',
			autoRotate : false,
			activeClass : 'crsl-active',
			navigationId : $(this).data('navigation'),
			itemWidth : $(this).width(),
			itemHeight : false,
			itemHeightEqual : false,
			preventAnimatedQueue : false
		}
		return $(this).each( function(){
			// Set Object
			var obj = this;
			
			// Extend
			if( $.isEmptyObject(args) == false ) $.extend( defaults, args );
			
			$(obj).find('.crsl-item').css( { position : 'relative', float : 'left' } );
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
					$(obj).find('.crsl-wrap').css({ marginLeft: obj.wrapMargin });
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
				// Set defaults
				defaults.itemWidth = $(obj).width();
				defaults.itemHeight = $(obj).find('.crsl-item:eq(0)').outerHeight(true);
				// Set Variables
				obj.wrapWidth = parseInt( defaults.itemWidth * defaults.total );
				obj.wrapMargin = obj.wrapMarginDefault = defaults.infinite ? parseInt( defaults.itemWidth * -1 ) : 0 ;
				// Modify Styles
				$(obj).find('.crsl-wrap').css({ width: obj.wrapWidth+'px' });
				$(obj).find('.crsl-item').css({ width: defaults.itemWidth+'px' });
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
							if( obj.wrapMargin >= obj.wrapMarginDefault ) $( '#'+defaults.navigationId ).find('.prev').addClass('prev-inactive');
							if( ( obj.wrapWidth - obj.wrapMargin ) == defaults.itemWidth*defaults.total ) $( '#'+defaults.navigationId ).find('.next').removeClass('next-inactive');
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
							if( obj.wrapMargin < obj.wrapMarginDefault ) $( '#'+defaults.navigationId ).find('.prev').removeClass('prev-inactive');
							if( ( obj.wrapWidth - obj.wrapMargin ) != defaults.itemWidth*defaults.total ) $( '#'+defaults.navigationId ).find('.next').addClass('next-inactive');
						}
					});
				// Trigger Carousel Exec
				$(obj).trigger('endCarousel', [defaults, obj, action]);
			}
			
			// Function Equal Heights
			$.fn.equalHeight = function(){
				tallest = 0;
				$(this).each(function(){
					$(this).css({ 'height': 'auto' });
					if ( $(this).outerHeight(true) > tallest ) { tallest = $(this).outerHeight(true); };
				});
				console.log(tallest);
				$(this).css({'height': tallest});
			}
		});
	}
})(jQuery);