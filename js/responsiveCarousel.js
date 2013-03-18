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
			navigation : $(this).data('navigation'),
			itemMinWidth : 0, // think in mobile!
			itemMargin : 0,
			itemClassActive : 'crsl-active',
			keyNavigation : true,
			swipeNavigation : false
		}
		return $(this).each( function(){
			// Set Object
			var obj = $(this);
			
			// Extend
			if( $.isEmptyObject(args) == false ) $.extend( defaults, args );
			if( $.isEmptyObject( $(obj).data('crsl') ) == false ) $.extend( defaults, $(obj).data('crsl') );
			
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
				// Set AutoRotate Interval
				if( defaults.autoRotate !== false ){
					obj.rotateTime = window.setInterval( function(){
						obj.rotate(defaults, obj);
					}, defaults.autoRotate);
				}
			});
			
			// Bind ResizeEnd on Window: use for recall obj.config() with his variables
			$(window).on('resizeEnd', function(){
				if( defaults.itemWidth !== $(obj).width() ){
					obj.config(defaults, obj);
				}
			});
			
			// Previous / Next Navigation
			$('#'+defaults.navigation).delegate('.previous, .next', 'click', function(event){
				// Prevent default
				event.preventDefault();
				// Prepare execute
				obj.prepareExecute(defaults, obj);
				// Previous & next action
				if( $(this).hasClass('previous') && $('.crsl-wrap', obj).find('.crsl-item').index(obj.itemActive) > 0 ){
					obj.previous(defaults, obj);
				} else if( $(this).hasClass('next') && ( ( !defaults.infinite && ( (obj.wrapWidth-obj.wrapMargin) == defaults.itemWidth*defaults.total ) ) || ( defaults.infinite ) ) ){
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
					// Previous & next action
					if( event.keyCode === 37 && mouseOverCarousel === true ){
						// Prepare execute
						obj.prepareExecute(defaults, obj);
						// Previous
						obj.previous(defaults, obj);
					} else if( event.keyCode === 39 && mouseOverCarousel === true ){
						// Prepare execute
						obj.prepareExecute(defaults, obj);
						// Next
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
							if( $(document).find('.crsl-items[data-navigation="'+defaults.navigation+'"]').lenght > 1 ){
								var customObj = $(document).find('.crsl-items[data-navigation="'+defaults.navigation+'"]');
								/**
								 * TO-DO: execute swipe on all related elements
								 **/
								obj.next(defaults, obj);
							} else {
								obj.next(defaults, obj);
							}
						} else if( direction == 'right' ) {
							if( $(document).find('.crsl-items[data-navigation="'+defaults.navigation+'"]').length > 1 ){
								var customObj = $(document).find('.crsl-items[data-navigation="'+defaults.navigation+'"]');
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
				defaults.itemWidth = $(this).width();
				defaults.visibleDefault = defaults.visible;
				// Force some styles on items
				$(obj).find('.crsl-item').css({ position : 'relative', float : 'left', overflow: 'hidden', height: 'auto' });
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
				defaults.itemWidth = Math.floor( ( $(obj).outerWidth() - ( defaults.itemMargin * ( defaults.visibleDefault - 1 ) ) ) / defaults.visibleDefault );
				if( defaults.itemWidth <= defaults.itemMinWidth ){
					defaults.visible = Math.floor( ( $(obj).width() - ( defaults.itemMargin * ( defaults.visible - 1 ) ) ) / defaults.itemMinWidth ) === 1 ?
						Math.floor( $(obj).width() / defaults.itemMinWidth ) :
						Math.floor( ( $(obj).width() - defaults.itemMargin ) / defaults.itemMinWidth );
					defaults.itemWidth = defaults.visible === 1 ? Math.floor( $(obj).width() ) : Math.floor( ( $(obj).width() - ( defaults.itemMargin * ( defaults.visible - 1 ) ) ) / defaults.visible );
				}
				// Set Variables
				obj.wrapWidth = Math.floor( ( defaults.itemWidth + defaults.itemMargin ) * defaults.total );
				obj.wrapMargin = obj.wrapMarginDefault = defaults.infinite ? parseInt( ( defaults.itemWidth + defaults.itemMargin ) * -1 ) : 0 ;
				// Modify Styles
				$(obj).find('.crsl-wrap').css({ width: obj.wrapWidth+'px', marginLeft: obj.wrapMargin });
				$(obj).find('.crsl-item').css({ width: defaults.itemWidth+'px', marginRight : defaults.itemMargin+'px' });
			}
			
			// Prepare Execute
			obj.prepareExecute = function(defaults, obj){
				// Stop rotate
				if( defaults.autoRotate !== false ){
					clearInterval(obj.rotateTime);
				}
				// Prevent Animate Event
				if( $(obj).find('.crsl-wrap:animated').length > 0 ){
					mouseOverCarousel = false;
					return false;
				}
				// Active
				obj.itemActive = $(obj).find('.crsl-item.'+defaults.itemClassActive);
				return true;
			}
			
			// Rotate Action
			obj.rotate = function(defaults, obj){
				// Prevent Animate Event
				if( $(obj).find('.crsl-wrap:animated').length > 0 ){
					mouseOverCarousel = false;
					return false;
				}
				// Active
				obj.itemActive = $(obj).find('.crsl-item.'+defaults.itemClassActive);
				obj.next(defaults, obj);
				return true;
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
							if( obj.wrapMargin >= obj.wrapMarginDefault ) $( '#'+defaults.navigation ).find('.previous').addClass('previous-inactive');
							if( ( obj.wrapWidth - obj.wrapMargin ) == defaults.itemWidth*defaults.total ) $( '#'+defaults.navigation ).find('.next').removeClass('next-inactive');
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
							if( obj.wrapMargin < obj.wrapMarginDefault ) $( '#'+defaults.navigation ).find('.previous').removeClass('previous-inactive');
							if( ( obj.wrapWidth - obj.wrapMargin ) != defaults.itemWidth*defaults.total ) $( '#'+defaults.navigation ).find('.next').addClass('next-inactive');
						}
						// Trigger Carousel Exec
						$(this).trigger('endCarousel', [defaults, obj, action]);
					});
			}
		});
	}
})(jQuery);