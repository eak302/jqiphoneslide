# New Project #

Rewrite with CoffeeScript and fixed some issue about mobile devices.

[https://github.com/hinablue/iphoneslide](https://github.com/hinablue/iphoneslide)

---------------------------------------

# UPDATE, v0.75.1 #

Bug fixed.

# UPDATE, v0.75 #

FIXED: Use `<a>`, `<input>` and `<button>` Tags in the slide working fine on the mobile device, tested in iPhone 4/4S with Safari.

If you use the `<a>` tag, it will open new window to show the website/webpage. If you use the `<input>` or `<button>`, you must bind the `click` event on your element, it will trigger the `click` event when user click the button on the slide.

---------------------------------------

# Buy me a beer :-P #

DEMO: [Live Demo](http://jquery.hinablue.me/jqiphoneslide)

---------------------------------------

# UPDATE, v0.7 #

Update to v0.7, merge new functions from Adam Chow.

* autoplay
* autogenerated pager
* make banner link clickable

Known Issue:

*Fixed:* When you bind the multiple selectors, the auto play function maybe failed in the pager switcher.

---------------------------------------

# Configure #

```
$('#album').iphoneSlide({
    // Page items handler, default: the first child of the $('album').
    handler: null,
    // Pages handler, default: the children of the handler.
    pageHandler : null,
    // Drag area handler, default: full page area.
    slideHandler : null,
    // You can define an element to handle this event(default: click) slide to next page.
    nextPageHandler : '.nextPage',
    // You can define an element to handle this event(default: click) slide to previous page.
    prevPageHandler : '.prevPage',
    // The friction of slide page.
    friction : 0.325,
    // When drag&drop page, the point length must be larger than this value which event will be fire.
    sensitivity : 20,
    // Slow down the page shift speed(ms).
    extrashift : 500,
    // If drag&drop over this time(ms), there will always slide 1 page.
    touchduring : 800,
    // Direction of slide, there are three directions you can choose(horizontal, vertical and matrix).
    direction : 'horizontal',
    // Max slide page.
    maxShiftPage : 5,
    // It's only for dynamic page(s).
    pageshowfilter : false,
    // Support jquery easing plugin, via http://gsgd.co.uk/sandbox/jquery/easing/
    easing: "swing",
    // Turn on/off default animate effect "bounce".
    bounce: true,
	autoPlay: false,
	cancelAutoPlayOnResize: true,
    autoCreatePager: false,
	pager: {
		pagerType: "dot",
        selectorName: ".banner_pager",
        childrenOnClass: "on",
		slideToAnimated: true
	},
	autoPlayTime: 3000,
    // When slide page completed, fire this.
    onShiftComplete : function(elem, page) {
        // this is parent of the handler.
        // elem is nowPage's page item.
        // page is "nowPage".
    }
});
```

---------------------------------------

# Change Log #

## UPDATE, v0.6 ##

Fixed all events to work fine on jQuery 1.4+ ~ 1.7pre. Also I known the iPad/iPhone issue (maybe other mobile devices), but I have no device to test :-P.

## UPDATE, v0.56. ##

Fixed/Modified click event. When click and no drag action that will fire click event and return true for it. So, you can use a tag in the pages.

## UPDATE, v0.55. ##

Modified method. ".jqipslide2page" to .iphoneSlide("jqipslide2page", args), ".jqipblank2page" to .iphoneSlide("jqipblank2page", args), see the demo.html for more detail.

## UPDATE, v0.54. ##

Add slide2page and blank2page. You can use ".jqipslide2page" to sliding the box to page, ".jqipblank2page" to add HTML-Code page in the box. See the demo.html for more detail.

## UPDATE, v0.53. ##

Modified/Fixed next/prev page handler.

## UPDATE, v0.52. ##

Fixed some event issue usr Namespace.

## UPDATE, v0.51. ##

Add new setting "bounce" that you can turn on/off the default animate bounce effect.
