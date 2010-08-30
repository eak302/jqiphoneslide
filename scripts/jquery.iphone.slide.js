/**
 * iphoneSlide - jQuery plugin
 * @version: 0.48 (2010/08/30)
 * @requires jQuery v1.3.2 or later 
 * @author Hina, Cain Chen. hinablue [at] gmail [dot] com
 * Examples and documentation at: http://jquery.hinablue.me/jqiphoneslide
 
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
**/
(function($) {
	var defaults = {
		handler: undefined,
		pageHandler : undefined,
		slideHandler : undefined,
		nextPageHandler : '.nextPage',
		prevPageHandler : '.prevPage',
        draglaunch: 0.5,
		friction : 0.325,
		sensitivity : 20,
		extrashift : 800,
		touchduring : 800,
		direction : 'horizontal',
		maxShiftPage : 5,
		easing: "swing",
		pageshowfilter : false,
		onShiftComplete : function() {}
	};

	$.fn.iphoneSlide = function(options, callback) {
		var opts = $.extend({}, defaults, options), callback = callback;
		
		function __getMovingData(w, s, e, t) {
			var v = 0, s = 0;
			
			v = (Math.abs(s - e) / Math.abs(t)).toPrecision(5);
			s = Math.floor(Math.pow(v, 2)*Math.abs(opts.extrashift) / (2*0.0098*Math.abs(opts.friction)));
			s = (s>w/2) ? Math.floor(w/3) : s;
			
			return {"speed":v, "shift":s};
		}
		
		function __initPages(w) {
			var totalPages, workspace = w, handler = $(opts.handler, workspace), pagesHandler = (!opts.pageshowfilter) ? handler.children(opts.pageHandler) : handler.children(opts.pageHandler).filter(':visible'), matrixSqrt = 0, matrixColumn = 0;
			
			totalPages = pagesHandler.length;
			
			switch(opts.direction) {
				case "matrix":
					matrixSqrt = Math.ceil(Math.sqrt(totalPages));
					matrixColumn = Math.ceil(totalPages / matrixSqrt);
					
					if(matrixColumn*matrixSqrt > totalPages) {
						var firstChild = pagesHandler.filter(":first"), lastChild = pagesHandler.filter(":last");
						for(var i=0; i<(matrixColumn*matrixSqrt - totalPages); i++) {
							firstChild.clone().empty()
							.removeAttr('id').removeAttr('style')
							.addClass("matrix-blank-page").css('display','block')
							.insertAfter(lastChild);
						}
						totalPages = matrixColumn*matrixSqrt;
					}					
					for(var i=matrixColumn; i>1; i--) {
						$('<br class="matrix-break-point" style="clear:both;" />').insertAfter(pagesHandler.eq((i-1)*matrixSqrt-1));
					}
					handler.width(matrixSqrt*workspace.width()).height(matrixColumn*workspace.height());
				break;
				case "vertical":
					handler.height(totalPages*workspace.height());
				break;
				case "horizontal":
				default:
					handler.width(totalPages*workspace.width());
			}
			
			pagesHandler.css({ 'display' : 'block' });
			
			workspace.data("totalPages", totalPages)
			.data("matrixSqrt", matrixSqrt)
			.data("matrixColumn", matrixColumn)
			.data("nowPage", 1)
			.data("initIphoneSlide", true);
			
			if($.isFunction(callback)) callback.call(workspace);
		}
		
		function __onSlideCallback(w) {
			var workspace = w, nowPage = workspace.data("nowPage");
		
			if(opts.pageshowfilter) {
				opts.onShiftComplete.call(workspace, $(opts.handler, workspace).children(opts.pageHandler).filter(':visible').eq(nowPage-1), nowPage);
			} else {
				opts.onShiftComplete.call(workspace, $(opts.handler, workspace).children(opts.pageHandler).eq(nowPage-1), nowPage);
			}
			return false;
		}
		
		function __slidingPage(h, d, m) {
			var workspace = h.parent(), handler = h, direction = d, matrix = m, matrixSqrt = workspace.data("matrixSqrt"), left = ((direction) ? "-=" : "+="), top = ((direction) ? "-=" : "+="), _width = workspace.width(), _height = workspace.height();
			
			switch(opts.direction) {
				case "matrix":
					if(matrix) {
						left = (direction) ? "+=" : "-=";						
						handler.animate({ 'left': left+((matrixSqrt-1)*_width)+"px", 'top': top+_height+"px" }, function() { __onSlideCallback(workspace); });
					} else {
						handler.animate({ 'left': left+_width+"px" }, function() { __onSlideCallback(workspace); });
					}
				break;
				case "vertical":
					handler.animate({ 'top': top+_height+"px" }, function() { __onSlideCallback(workspace); });
				break;
				case "horizontal":
				default:
					handler.animate({ 'left': left+_width+"px" }, function() { __onSlideCallback(workspace); });
			}
		}
		
		return this.each(function() {
			var workspace = $(this), handler = $(opts.handler, workspace), dragAndDrop = {origX:0, origY:0, X:0, Y:0}, totalPages = 0, nowPage = 1, matrixSqrt = 0, matrixColumn = 0;
			var mobileDevice = (navigator.userAgent.match(/iPhone/i) || navigator.userAgent.match(/iPad/i) || navigator.userAgent.match(/Android/i)) ? true : false;
            
			if(workspace.children().length>1) {
				alert('The Selector('+workspace.attr('id')+')\'s page handler can not more than one element.');
				return this;
			}
		
			if(opts.handler==undefined || typeof opts.handler !== "string") {
				opts.handler = ".iphone-slide-page-handler";
				workspace.children(':first').addClass('iphone-slide-page-handler');
			}
			
			if($(opts.handler, workspace).children().length==0) {
				alert('You have no page(s) context.');
				return this;
			}
			
			if(opts.pageHandler==undefined || typeof opts.pageHandler !== "string") {
				switch(handler.attr('tagName').toLowerCase()) {
					case "ul":
					case "ol":
						opts.pageHandler = 'li';
					break;
					default:
						opts.pageHandler = handler.children(':first').attr('tagName').toLowerCase();
				}
			}			
			
			var __slideNextPage = function(event) {
				var nowPage = workspace.data("nowPage"), totalPages = workspace.data("totalPages"), matrixSqrt = workspace.data("matrixSqrt");				
				nowPage++;
				if(nowPage<=totalPages) {
					if(opts.direction=="matrix" && ((nowPage-1) % matrixSqrt == 0)) {
						__slidingPage(handler, true, true);
					} else {
						__slidingPage(handler, true, false);
					}
				} else {
					nowPage = totalPages;
				}				
				workspace.data("nowPage", nowPage);
				return false;
			};
			
			var __slidePrevPage = function(event) {
				var nowPage = workspace.data("nowPage"), totalPages = workspace.data("totalPages"), matrixSqrt = workspace.data("matrixSqrt");				
				nowPage--;
				if(nowPage>0) {
					if(opts.direction=="matrix" && (nowPage % matrixSqrt == 0)) {
						__slidingPage(handler, false, true);
					} else {
						__slidingPage(handler, false, false);
					}
				} else {
					nowPage = 1;
				}				
				workspace.data("nowPage", nowPage);
				return false;
			};
			
			var __preventClickEvent = false, __mouseStarted = false, __mouseDownEvent;
			
			var __mouseDown = function(event) {
				if(__mouseStarted) return false;
				
                __mouseStarted = true;
                __mouseDownEvent = event;

				event.preventDefault();
                
                var nowPage = workspace.data("nowPage"), matrixSqrt = workspace.data("matrixSqrt");
                switch(opts.direction) {
                    case "matrix":
                        dragAndDrop.origX = (Math.ceil(nowPage % matrixSqrt)===0) ? (1-matrixSqrt) * workspace.width() : (1-Math.ceil(nowPage % matrixSqrt)) * workspace.width();
                        dragAndDrop.origY = (1-Math.ceil(nowPage / matrixSqrt)) * workspace.height();
                    break;
                    case "vertical":
                        dragAndDrop.origY = (1-nowPage) * workspace.height();
                    break;
                    case "horizontal":
                    default:
                        dragAndDrop.origX = (1-nowPage) * workspace.width();
                }
				
                if(opts.slideHandler==undefined || typeof opts.slideHandler !== "string" || mobileDevice===true) {
                    if(mobileDevice===true) {
                        document.getElementById(workspace.attr("id")).addEventListener("touchmove", __mouseMove, false);
                        document.getElementById(workspace.attr("id")).addEventListener("touchend", __mouseUp, false);
                    } else {
                        workspace.bind("mousemove", __mouseMove, false).bind("mouseleave mouseup", __mouseUp, false);
                    }
                } else {
                    handler.bind("mousemove", __mouseMove, false).bind("mouseleave mouseup", __mouseUp, false);
                }
			};
			
			var __mouseMove = function(event) {
				if ($.browser.msie && !event.button) return __mouseUp(event);
                
                if (__mouseStarted) {
                    event.preventDefault();
                    
                    var __eventTouches = (mobileDevice!==true) ? event : event.changedTouches[0];
                    var __mouseDownTouches = (mobileDevice!==true) ? __mouseDownEvent : __mouseDownEvent.changedTouches[0];
                    
                    switch(opts.direction) {
                        case "matrix":
                            dragAndDrop.X = parseInt(__eventTouches.pageX - __mouseDownTouches.pageX);
                            dragAndDrop.Y = parseInt(__eventTouches.pageY - __mouseDownTouches.pageY);
                            handler.css({
                                top: (dragAndDrop.origY + dragAndDrop.Y) + "px",
                                left: (dragAndDrop.origX + dragAndDrop.X) + "px"
                            });
                        break;
                        case "vertical":
                            dragAndDrop.Y = parseInt(__eventTouches.pageY - __mouseDownTouches.pageY);
                            handler.css({
                                top: (dragAndDrop.origY + dragAndDrop.Y) + "px"
                            });
                        break;
                        case "horizontal":
                        default:
                            dragAndDrop.X = parseInt(__eventTouches.pageX - __mouseDownTouches.pageX);
                            handler.css({
                                left: (dragAndDrop.origX + dragAndDrop.X) + "px"
                            });                    
                    }
                }
                
				return !__mouseStarted;
			};
            
			var __mouseUp = function(event) {
            
				var totalPages = workspace.data("totalPages"), nowPage = workspace.data("nowPage"), matrixSqrt = workspace.data("matrixSqrt"), matrixColumn = workspace.data("matrixColumn");
                
                if(opts.slideHandler==undefined || typeof opts.slideHandler !== "string" || mobileDevice===true) {
                    if(mobileDevice===true) {
                        document.getElementById(workspace.attr("id")).removeEventListener("touchmove", __mouseMove, false);
                    } else {
                        workspace.unbind("mousemove", __mouseMove, false);
                    }
                } else {
                    handler.unbind("mousemove", __mouseMove, false);
                }

				if(__mouseStarted) __preventClickEvent = (event.target == __mouseDownEvent.target);
                
                var __eventTouches = (mobileDevice!==true) ? event : event.changedTouches[0];
                var __mouseDownTouches = (mobileDevice!==true) ? __mouseDownEvent : __mouseDownEvent.changedTouches[0];
                
                if(Math.max(
						Math.abs(__mouseDownTouches.pageX - __eventTouches.pageX),
						Math.abs(__mouseDownTouches.pageY - __eventTouches.pageY)
						) >= parseInt(opts.sensitivity)
                ) {
					var during, _width = workspace.width(), _height = workspace.height(), timeStamp = Math.abs(__mouseDownEvent.timeStamp - event.timeStamp);

					var thisMove = {
						"X": __getMovingData(_width, __mouseDownTouches.pageX, __eventTouches.pageX, timeStamp),
						"Y": __getMovingData(_height, __mouseDownTouches.pageY, __eventTouches.pageY, timeStamp),
					}, easing = {
						"X": Math.min(__eventTouches.pageX-__mouseDownTouches.pageX , _width),
						"Y": Math.min(__eventTouches.pageY-__mouseDownTouches.pageY , _height)
					}, shift = {
						"X": "",
						"Y": "",
						"EX": "",
						"EY": "",
						"shift": Math.max(thisMove.X.shift , thisMove.Y.shift),
						"speed": Math.max(thisMove.X.speed , thisMove.Y.speed)
					}, pages = {
                        "X": (Math.abs(dragAndDrop.X) >= workspace.width()*opts.draglaunch || Math.abs(dragAndDrop.Y) >= workspace.height()*opts.draglaunch) ? 0 : (timeStamp>opts.touchduring) ? 1 : Math.ceil(thisMove.X.speed*thisMove.X.shift/_width),
                        "Y": (Math.abs(dragAndDrop.X) >= workspace.width()*opts.draglaunch || Math.abs(dragAndDrop.Y) >= workspace.height()*opts.draglaunch) ? 0 : (timeStamp>opts.touchduring) ? 1 : Math.ceil(thisMove.Y.speed*thisMove.Y.shift/_height)
                    };
                    
                    if(Math.abs(dragAndDrop.X) >= workspace.width()*opts.draglaunch || Math.abs(dragAndDrop.Y) >= workspace.height()*opts.draglaunch) {
                        shift.shift = 0;
                    }
                    
                    during = Math.max(1/shift.speed*Math.abs(opts.extrashift), Math.abs(opts.extrashift)*0.5);

                    switch(opts.direction) {
                        case "matrix":
                            var pageColumn = Math.ceil(nowPage/matrixSqrt);
                            
                            pages.X = (pages.X>matrixSqrt) ? matrixSqrt : ((Math.abs(dragAndDrop.X) >= workspace.width()*opts.draglaunch) ? 1 : ((Math.floor(Math.abs(easing.Y/easing.X))>2) ? 0 : pages.X));
                            pages.Y = (pages.Y>matrixColumn) ? matrixColumn : ((Math.abs(dragAndDrop.Y) >= workspace.height()*opts.draglaunch) ? 1 : ((Math.floor(Math.abs(easing.X/easing.Y))>2) ? 0 : pages.Y));

                            if(easing.X>0) {
                                pages.X = Math.min(pages.X, (nowPage-matrixSqrt*(pageColumn-1)-1));
                                nowPage = ((nowPage-pages.X)<1) ? 1 : nowPage-pages.X;
                                shift.X = "+=";
                                shift.EX = "-=";
                            } else {
                                pages.X = Math.min(pages.X, (matrixSqrt*pageColumn-nowPage));
                                nowPage = (nowPage+pages.X>totalPages) ? totalPages : nowPage+pages.X;
                                shift.X = "-=";
                                shift.EX = "+=";
                            }
                            dragAndDrop.X = (dragAndDrop.X>0) ? -1*dragAndDrop.X : dragAndDrop.X;
                            
                            shift.X += (pages.X*_width+shift.shift + dragAndDrop.X).toString()+"px";
                            shift.EX += (shift.shift.toString())+"px";
                            
                            if(easing.Y>0) {
                                pages.Y = Math.min(pages.Y, (pageColumn-1));
                                nowPage = ((nowPage-pages.Y*matrixSqrt)<1) ? 1 : nowPage-pages.Y*matrixSqrt;
                                shift.Y = "+=";
                                shift.EY = "-=";
                            } else {
                                pages.Y = ((matrixSqrt*pages.Y+nowPage)>totalPages) ? (matrixColumn-pageColumn) : pages.Y;
                                nowPage = (pages.Y*matrixSqrt>totalPages) ? totalPages : nowPage+pages.Y*matrixSqrt;
                                shift.Y = "-=";
                                shift.EY = "+=";
                            }
                            dragAndDrop.Y = (dragAndDrop.Y>0) ? -1 * dragAndDrop.Y : dragAndDrop.Y;
                            
                            shift.Y += (pages.Y*_height+shift.shift + dragAndDrop.Y).toString()+"px";
                            shift.EY += (shift.shift.toString())+"px";
                        break;
                        case "vertical":
                            pages.X = 0;
                            pages.Y = (pages.Y==0) ? 1 : ((pages.Y>opts.maxShiftPage) ? opts.maxShiftPage : pages.Y);
                            if(easing.Y>0) {
                                pages.Y = ((nowPage-pages.Y)<1) ? nowPage-1 : pages.Y;
                                nowPage = ((nowPage-pages.Y)<1) ? 1 : nowPage-pages.Y;
                                shift.Y = "+=";
                                shift.EY = "-=";
                            } else {
                                pages.Y = ((nowPage + pages.Y)>totalPages) ? totalPages - nowPage : pages.Y;
                                nowPage = ((nowPage + pages.Y)>totalPages) ? totalPages : nowPage+pages.Y;
                                shift.Y = "-=";
                                shift.EY = "+=";
                            }
                            dragAndDrop.Y = (dragAndDrop.Y>0) ? -1 * dragAndDrop.Y : dragAndDrop.Y;
                            
                            shift.X = "+=0px";
                            shift.Y += ((pages.Y*_height+shift.shift + dragAndDrop.Y).toString())+"px";
                            shift.EY += (shift.shift.toString())+"px";
                            shift.EX = "+=0px";
                        break;
                        case "horizontal":
                        default:
                            pages.Y = 0;
                            pages.X = (pages.X==0) ? 1 : ((pages.X>opts.maxShiftPage) ? opts.maxShiftPage : pages.X);
                            if(easing.X>0) {
                                pages.X = ((nowPage-pages.X)<1) ? nowPage-1 : pages.X;
                                nowPage = ((nowPage-pages.X)<1) ? 1 : nowPage-pages.X;
                                shift.X = "+=";
                                shift.EX = "-=";
                            } else {
                                pages.X = ((nowPage + pages.X)>totalPages) ? totalPages - nowPage : pages.X;
                                nowPage = ((nowPage + pages.X)>totalPages) ? totalPages : nowPage+pages.X;
                                shift.X = "-=";
                                shift.EX = "+=";
                            }
                            dragAndDrop.X = (dragAndDrop.X>0) ? -1 * dragAndDrop.X : dragAndDrop.X;
                            
                            shift.X += (pages.X*_width+shift.shift + dragAndDrop.X).toString()+"px";
                            shift.Y = "+=0px";
                            shift.EX += (shift.shift.toString())+"px";
                            shift.EY = "+=0px";
                    }
                    
                    var slideEasing = ($.easing[opts.easing]!==undefined) ? opts.easing : "swing";
                    handler.animate({ 'top': shift.Y, 'left': shift.X }, during)
                    .animate(
                    { 'top': shift.EY, 'left': shift.EX },
                    { duration: during, 
                        easing: slideEasing, 
                        complete: function() {
                            __mouseStarted = false;
                            __onSlideCallback(workspace);
                        }
                    });
				} else {
                    __mouseStarted =  false;
                }

                if(mobileDevice===true) {
                    document.getElementById(workspace.attr("id")).removeEventListener("touchend", __mouseUp, false);
                } else {
                    workspace.data("nowPage", nowPage).unbind("mouseleave mouseup", __mouseUp, false);
                }
                workspace.data("nowPage", nowPage);
				return false;
			};

			if(opts.slideHandler==undefined || typeof opts.slideHandler !== "string" || mobileDevice===true) {
                if(mobileDevice===true) {
                    document.getElementById(workspace.attr("id")).addEventListener("touchstart", __mouseDown, false);
                } else {
                    workspace
                    .bind("mousedown", __mouseDown, false)
                    .bind("click", function(event) {
                        if(__preventClickEvent) {
                            __preventClickEvent = false;
                            event.stopImmediatePropagation();
                            return false;
                        }
                    }, false);
                }
			} else {
                handler.filter(opts.slideHandler)
                .bind("mousedown", __mouseDown, false)
                .bind("click", function(event) {
                    if(__preventClickEvent) {
                        __preventClickEvent = false;
                        event.stopImmediatePropagation();
                        return false;
                    }
                }, false);
			}
			
            if(mobileDevice!==true) {
                handler.filter(opts.nextPageHandler).bind("click", __slideNextPage, false);
                handler.filter(opts.nextPageHandler).bind("click", __slidePrevPage, false);	
            }
            
			__initPages(workspace);
			
			return this;
		});
	};
})(jQuery);