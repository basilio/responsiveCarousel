/**
 * Simple Carousel
 * HTML Structure:
 * .crsl-items > .crsl-wrap > .crsl-item
 * @author @basilio
 * @version 0.2
 **/
(function($){
	"use strict";
	$.fn.carousel = function(args){
		var defaults = {
			infinite : true,
			visible : 1,
			index : 1,
			speed : 'fast',
			overflow : false,
			autoRotate : false,
			navigationId : $(this).data('navigation'),
			itemWidth : $(this).width(), /** TO-DO **/
			itemMinWidth : 320, // think in mobile!
			itemHeight : false,
			itemEqualHeight : false,
			itemMargin : 0,
			itemClassActive : 'crsl-active',
			preventAnimatedQueue : false,
			keyNavigation : true,
			swipeNavigation : false
		}
		return $(this).each( function(){
			// Set Object
			var obj = $(this);
			
			// Extend
			if( $.isEmptyObject(args) == false ) $.extend( defaults, args );
			
			// Carousel Config
			$(window).ready(function(){
				
				// Init some defaults styles
				obj.init(defaults, obj);
				
				// This configure and margins and variables when load and resize
				obj.config(defaults, obj);
				
				// Trigger Init Event Carousel
				$(obj).trigger('initCarousel', [defaults, obj]);
				
				// Resize End event
				$(window).resize(function(){
					if( this.resizeTO ) clearTimeout(this.resizeTO);
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
			$(window).on('resizeEnd', function(){
				if( defaults.itemWidth !== $(obj).width() ){
					obj.config(defaults, obj);
				}
			});
			
			// Click Navigation
			$('#'+defaults.navigationId).delegate('.prev, .next', 'click', function(event){
				// Prevent default
				event.preventDefault();
				
				// Prepare execute
				obj.prepareExecute(defaults, obj);
				
				// Previous & next action
				if( $(this).hasClass('prev') && $('.crsl-wrap', obj).find('.crsl-item').index(obj.itemActive) > 0 ){
					// Action Previous
					obj.previous(defaults, obj);
				} else if( $(this).hasClass('next') && ( ( !defaults.infinite && ( (obj.wrapWidth-obj.wrapMargin) == defaults.itemWidth*defaults.total ) ) || ( defaults.infinite ) ) ){
					// Action Next
					obj.next(defaults, obj);
				}
			});
			
			// Keypress Navigation
			if( defaults.keyNavigation === true ){
				var mouseOverCarousel = false;
				$(window).on('mouseover', function(event){
					// Detect
					if (event.target) { 
						var current = event.target; 
					} else if (event.srcElement) { 
						var current = event.srcElement; 
					}
					if( $.contains(obj, current) || $(current).parents('.crsl-nav').attr('id') == $(obj).data('navigation') || $(current).parents('.crsl-items').data('navigation') == $(obj).data('navigation') ){
						mouseOverCarousel = true;
					} else {
						mouseOverCarousel = false;
					}
					return false;
				});
				$(window).on('keydown', function(event){
					// Prepare execute
					obj.prepareExecute(defaults, obj);
					// Previous & next action
					if( event.keyCode === 37 && mouseOverCarousel === true ){
						obj.previous(defaults, obj);
					} else if( event.keyCode === 39 && mouseOverCarousel === true ){
						obj.next(defaults, obj);
					}
					return;
				});
			}
			
			// Swipe Navigation
			if( defaults.swipeNavigation === true ){
				$(obj).swipe({
					swipe : function(event, direction, distance, duration, fingerCount) {
						// Prepare execute
						obj.prepareExecute(defaults, obj);
						// Previous & next action
						if( direction == 'left' ){
							if( $(document).find('.crsl-items[data-navigation="'+defaults.navigationId+'"]').lenght > 1 ){
								var customObj = $(document).find('.crsl-items[data-navigation="'+defaults.navigationId+'"]');
								/**
								 * TO-DO: execute swipe on all related elements
								 **/
								obj.next(defaults, obj);
							} else {
								obj.next(defaults, obj);
							}
						} else if( direction == 'right' ) {
							if( $(document).find('.crsl-items[data-navigation="'+defaults.navigationId+'"]').length > 1 ){
								var customObj = $(document).find('.crsl-items[data-navigation="'+defaults.navigationId+'"]');
								/**
								 * TO-DO: execute swipe on all related elements
								 **/
								obj.previous(defaults, obj);
							} else {
								obj.previous(defaults, obj);
							}
						}
					},
					threshold : 0
				});
			}
			
			obj.init = function(defaults, obj){
				// Set some default vars
				defaults.total = $(this).find('.crsl-item').length;
				defaults.visibleDefault = defaults.visible;
				
				// Force some styles on items
				$(obj).find('.crsl-item').css({ position : 'relative', float : 'left', overflow: 'hidden' });
				
				// Declare the item ative
				$(obj).find('.crsl-item:first-child').addClass(defaults.itemClassActive);
				
				// Move last element to begin for infinite carousel
				if( defaults.infinite ) $(obj).find('.crsl-item:first-child').before( $('.crsl-item:last-child', obj) );
				
				// if defaults.overflow 
				if( defaults.overflow === false ) $(obj).css({ overflow: 'hidden' });
				else $('html, body').css({ 'overflow-x': 'hidden' });
			}
			
			// Base Configuration: 
			obj.config = function(defaults, obj){
				// Width Item
				defaults.itemWidth = Math.floor( ( $(obj).width() - defaults.itemMargin ) / defaults.visibleDefault );
				if( defaults.itemWidth <= defaults.itemMinWidth ){
					defaults.visible = Math.floor( ( $(obj).width() - defaults.itemMargin ) / defaults.itemMinWidth ) === 1 ?
						Math.floor( $(obj).width() / defaults.itemMinWidth ) :
						Math.floor( ( $(obj).width() - defaults.itemMargin ) / defaults.itemMinWidth );
					defaults.itemWidth = defaults.visible === 1 ? Math.floor( $(obj).width() ) : Math.floor( ( $(obj).width() - defaults.itemMargin ) / defaults.visible );
				}
				
				// Set Variables
				obj.wrapWidth = Math.floor( ( defaults.itemWidth + defaults.itemMargin ) * defaults.total );
				obj.wrapHeight = $(obj).find('.crsl-item').equalHeight(true);
				obj.wrapMargin = obj.wrapMarginDefault = defaults.infinite ? parseInt( ( defaults.itemWidth + defaults.itemMargin ) * -1 ) : 0 ;
				
				// Modify Styles
				$(obj).find('.crsl-wrap').css({ width: obj.wrapWidth+'px', height: obj.wrapHeight+'px', marginLeft: obj.wrapMargin });
				$(obj).find('.crsl-item').css({ width: defaults.itemWidth+'px', marginRight : defaults.itemMargin+'px' });
			}
			
			// Prepare Execute
			obj.prepareExecute = function(defaults, obj){
				// Stop rotate
				if( defaults.autoRotate !== false ){
					clearInterval(obj.rotateTime);
				}
				// Prevent Animate Event
				if( defaults.preventAnimatedQueue !== false && $('.'+defaults.preventAnimatedQueue+':animated').length > 0 ){
					return false;
				}
				// Active
				obj.itemActive = $(obj).find('.crsl-item.'+defaults.itemClassActive);
			}
			
			// Rotate Action
			obj.rotate = function(defaults, obj){
				// Prevent Animate Event
				if( defaults.preventAnimatedQueue !== false && $('.'+defaults.preventAnimatedQueue+':animated').length > 0 ){
					return false;
				}
				// Active
				obj.itemActive = $(obj).find('.crsl-item.'+defaults.itemClassActive);
				obj.next(defaults, obj);
			}
			
			// Previous Animate
			obj.previous = function(defaults, obj){
				obj.wrapMargin = defaults.infinite ? obj.wrapMarginDefault + $(obj.itemActive).outerWidth(true) : obj.wrapMargin + $(itemActive).outerWidth(true);
				var prevItemIndex = $(obj.itemActive).index();
				var newItemActive = $(obj.itemActive).prev('.crsl-item');
				var action = 'previous';
				// Trigger Begin Carousel Move
				$(obj).trigger('beginCarousel', [defaults, obj, action]);
				// Animate
				$(obj).
					find('.crsl-wrap').
					animate({ marginLeft: obj.wrapMargin+'px' }, defaults.speed, function(){
						// Active
						$(obj.itemActive).removeClass(defaults.itemClassActive);
						$(newItemActive).addClass(defaults.itemClassActive);
						if( defaults.infinite ){
							$(this).css({ marginLeft: obj.wrapMarginDefault }).find('.crsl-item:first-child').before( $('.crsl-item:last-child', obj) );
						} else {
							if( obj.wrapMargin >= obj.wrapMarginDefault ) $( '#'+defaults.navigationId ).find('.prev').addClass('prev-inactive');
							if( ( obj.wrapWidth - obj.wrapMargin ) == defaults.itemWidth*defaults.total ) $( '#'+defaults.navigationId ).find('.next').removeClass('next-inactive');
						}
						// Trigger Carousel Exec
						$(this).trigger('endCarousel', [defaults, obj, action]);
					});
			}
			
			// Next Animate
			obj.next = function(defaults, obj){
				obj.wrapMargin = defaults.infinite ? obj.wrapMarginDefault - $(obj.itemActive).outerWidth(true) : obj.wrapMargin - $(itemActive).outerWidth(true);
				var nextItemIndex = $(obj.itemActive).index();
				var newItemActive = $(obj.itemActive).next('.crsl-item');
				var action = 'next';
				// Trigger Begin Carousel Move
				$(obj).trigger('beginCarousel', [defaults, obj, action]);
				// Animate
				$(obj).
					find('.crsl-wrap').
					animate({ marginLeft: obj.wrapMargin+'px' }, defaults.speed, function(){
						// Active
						$(obj.itemActive).removeClass(defaults.itemClassActive);
						$(newItemActive).addClass(defaults.itemClassActive);
						if( defaults.infinite ){
							$(this).css({ marginLeft: obj.wrapMarginDefault }).find('.crsl-item:last-child').after( $('.crsl-item:first-child', obj) );
						} else {
							if( obj.wrapMargin < obj.wrapMarginDefault ) $( '#'+defaults.navigationId ).find('.prev').removeClass('prev-inactive');
							if( ( obj.wrapWidth - obj.wrapMargin ) != defaults.itemWidth*defaults.total ) $( '#'+defaults.navigationId ).find('.next').addClass('next-inactive');
						}
						// Trigger Carousel Exec
						$(this).trigger('endCarousel', [defaults, obj, action]);
					});
			}
			
			// Function Equal Heights
			$.fn.equalHeight = function(get){
				var tallest = 0;
				$(this).each(function(){
					$(this).css({ 'height': 'auto' });
					if ( $(this).innerHeight(true) > tallest ) { tallest = $(this).innerHeight(true); };
				});
				if( get === true ) return tallest;
				else $(this).css({'height': tallest});
			}
		});
	}
})(jQuery);