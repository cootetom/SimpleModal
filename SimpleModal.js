/*jshint curly: true, eqeqeq: true, undef:true, devel: true, browser: true */
/*global $, jQuery */

/**
 * This is Toms simple modal window... it's simple... thats why I called it SimpleModal.
 *
 * If you want to make it complex then go make a ComplexModal. 
 *
 * NOTE: you need jQuery on the page for it to work!
 *
 * Instructions:
 * call SimpleModal.open('http://www.myurl.com', 500, 600); to open a modal window 500px high by 600px wide.
 * call SimpleModal.close(); to close the modal window you last opened.
 *
 * If you need to call a callback type function when the modal you open has been closed then add it at the end
 * of the parameters when opening;
 * SimpleModal.open('http://www.myurl.com', 500, 600, function(data) { alert(data); });
 *
 * Pass data from your pop up to the opening callback by passing it through the close function;
 * SimpleModal.close('some data');
 *
 * @name SimpleModal
 * @author Tom Coote (tomcoote.co.uk)
 * @version 2.0
 * @license released under the BSD (3-clause) licences
 */
 
var topWin = window;
var SimpleModal = function() {

	var that = {};

	/**
	* Open a modal window. Modal windows are always opened by the top window.
	*
	* Parameters;
	* url - the url to show in the modal.
	* height -- the height of the modal window.
	* width -- the width of the modal window.
	* callback -- a function that will be called when the modal is closed.
	*             If the modal passes data to the close() method then the
	*             callback will receive that data.
	*/
	that.open = function(url, height, width, callback) {	
		if (!window.SimpleModal.isController) {
			if (typeof topWin.SimpleModal !== 'object') {
				alert('Simple modals need the JavaScript available in the modal window itself.');
			} else {
				return topWin.SimpleModal.open(url, height, width, callback);
			}
		}

		// sort out ie bugs
		if (jQuery.browser.msie) {
			$('select').css('visibility', 'hidden');
		}
		
		// prevent parent from scrolling whilst pop up is overlayed on top
		if ($('._simpleModalMask').length < 1) {
			var overflow = $(document.body).css('overflow').toLowerCase() || 'visible';
			$(document.body).data('simpleModalOverflow', overflow);
			$(document.body).css('overflow', 'hidden');
		}
	
		var mask = document.createElement('div'),
			eDiv = document.createElement('div');
		
		$(document.body).append(mask).append(eDiv);
		$(mask).addClass('_simpleModalMask').
		css({
			'position':'absolute',
			'top':'0px',
			'left':'0px',
			'width':$(document).width() + 'px',
			'height':$(document).height() + 'px',
			'margin':'0px',
			'padding':'0px',
			'background-color':'#FFFFFF',
			'opacity':0.8,
			'overflow':'hidden'
		});
		
		$(eDiv).addClass('_simpleModal').
		css({
			'height':height + 'px',
			'width':width + 'px',
			'padding':'0px',
			'margin':'0px',
			'border':'1px solid #ccc',
			'position':'absolute',
			'background-color':'#FFF',
			'left': (($(window).width() / 2) - (width / 2)) + $(document).scrollLeft() + 'px',
			'top': (($(window).height() / 2) - (height / 2)) + $(document).scrollTop() + 'px'
		}).
		append("<iframe frameborder='0' scrolling='no'></iframe>");
		
		$('iframe:first', eDiv).attr('src',url).
		css({
			'height':'100%',
			'width':'100%',
			'background-color':'#FFF',
			'border':'none',
			'overflow':'hidden'
		});
		
		that.callbacks.push(callback);
		return false;
	};
	
	/**
	* Close the last opened modal window.
	*
	* Parameters;
	* data -- the data that will be passed from this modal being closed
	*         to the openers callback function.
	*/
	that.close = function(data) {
		if (!window.SimpleModal.isController) {
			if (typeof topWin.SimpleModal !== 'object') {
				alert('Simple modals need the JavaScript available in the top window.');
			} else {
				return topWin.SimpleModal.close(data);
			}
		}
	
		$('div._simpleModal:last').remove();
		$('div._simpleModalMask:last').remove();
		
		if ($('div._simpleModal').length < 1) {
			// sort out ie bugs
			if (jQuery.browser.msie) {
				$('select').css('visibility', 'visible');
			}
			
			var overflow = $(document.body).data('simpleModalOverflow');
			if (overflow) {
				$(document.body).css('overflow', overflow);
			}
		}
		
		if (that.callbacks.length > 0) {
			var fn = that.callbacks.pop();
			if (typeof fn === 'function') {
				fn(data);
			}
		}
		return false;
	};
	
	that.isController = false;
	that.callbacks = [];
	
	return that;
}();

/**
 * Need to find the true top window for the current domain. There are case's
 * where the actual top frame is another domain when a URL is using frame masking.	
 */
(function() { 
	var previousTopWin;

	while (true) {
		var ref;
		
		try {
			ref = topWin.parent.location.href;
		}
		catch(err) {
			ref = undefined;
		}

		if (typeof ref === 'undefined' || previousTopWin === topWin) {
			break;
		}
		else {
			previousTopWin = topWin;
			topWin = topWin.parent;
		}
	}

	if (typeof topWin.SimpleModal === 'object') {
		topWin.SimpleModal.isController = true;
	}
}());