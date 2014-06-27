"use strict"

;(function($) {

	var elements = []

	$.enableAllParallax = function() {
		$('[data-px-property-name]').enableParallax()
	}

	$.disableAllParallax = function() {
		$('[data-px-property-name]').disableParallax()
	}

	$.fn.enableParallax = function() {
		$(this).each(function(i, el) {
			$(el).data('parallax_enabled', true).updateParallaxPosition()
		})
	}

	$.fn.disableParallax = function() {
		$(this).each(function(i, el) {
			$(el).data('parallax_enabled', false).resetParallaxPosition()
		})
	}

	$.fn.parallax = function(options) {

		if (options) {

			var animation = {
				visible: false,
				propertyName: options.propertyName || '',
				propertyFormat: options.propertyFormat || '',
				propertyMinValue: options.propertyMinValue || null,
				propertyMaxValue: options.propertyMaxValue || null,
				enter: getEnterScrollPosition(this),
				leave: getLeaveScrollPosition(this)
			}

			$(this).data('parallax_animation', animation).updateParallaxPosition()

			elements.push(this)

			return animation
		}

		return $(this).data('parallax_animation')
	}

	$.fn.resetParallaxPosition = function() {

		var animation = $(this).parallax()
		if (animation == null)
			return

		$(this).css(animation.propertyName, '')
	}

	$.fn.updateParallaxPosition = function() {

		if ($(this).data('parallax_enabled') === false)
			return

		var animation = $(this).parallax()
		if (animation == null)
			return

		var scroll = $(window).scrollTop()
		if (scroll >= animation.enter &&
			scroll <= animation.leave) {
			if (animation.visible == false) {
				animation.visible = true
			}
		} else {
			if (animation.visible) {
				animation.visible = false
			}
		}

		var min = animation.propertyMinValue
		var max = animation.propertyMaxValue

		if (animation.callback == null) {
			animation.callback = function(progress) {
				return progress * (max - min) + min
			}
		}

		if (animation.visible) {

			var length = animation.enter - animation.leave
			if (length) {

				var progress = (animation.enter - scroll) / length
				if (progress > 1) progress = 1
				if (progress < 0) progress = 0

				$(this).css(animation.propertyName, (animation.propertyFormat || '%vpx').replace('%v', animation.callback(progress)))
			}
		}
	}

	var getPropertyName = function(element) {
		return $(element).data('px-property-name')
	}

	var getPropertyFormat = function(element) {
		return $(element).data('px-property-format')
	}

	var getPropertyMinValue = function(element) {
		return parseFloat($(element).data('px-value-min'), 10) || null
	}

	var getPropertyMaxValue = function(element) {
		return parseFloat($(element).data('px-value-max'), 10) || null
	}

	var getEnterScrollPosition = function(element) {
		return Math.max($(element).offset().top - $(window).height(), 0) + parseFloat($(element).data('enterOffset') || 0, 10)
	}

	var getLeaveScrollPosition = function(element) {
		return Math.max($(element).offset().top + $(element).height(), 0) + parseFloat($(element).data('leaveOffset') || 0, 10)
	}

	$(document).ready(function() {

		$('[data-px-property-name]').each(function(i, el) {

			var animation = {
				visible: false,
				propertyName: getPropertyName(el),
				propertyFormat: getPropertyFormat(el),
				propertyMinValue: getPropertyMinValue(el),
				propertyMaxValue: getPropertyMaxValue(el),
				enter: getEnterScrollPosition(el),
				leave: getLeaveScrollPosition(el)
			}

			$(el).data('parallax_animation', animation).updateParallaxPosition()

			elements.push(el)
		})

		$('[data-px-depth]').each(function(i, el) {

			var $el = $(el)

			var depth = parseFloat($el.data('px-depth'))

			var min = 0
			var max = $el.offset().top + $el.outerHeight()

			var callback = function(progress) {
				return progress * (max - min) + min
			}

			var animation = {
				visible: false,
				propertyName: 'transform',
				propertyFormat: 'translate3d(0, %vpx, 0)',
				propertyMinValue: null,
				propertyMaxValue: null,
				enter: getEnterScrollPosition(el),
				leave: getLeaveScrollPosition(el) * depth,
				callback: callback
			}

			$el.data('parallax_animation', animation).updateParallaxPosition()

			elements.push(el)
		})

		$(window).on('resize', function(e) {

			$.each(elements, function(i, el) {

				var $el = $(el)

				var animation = $el.parallax()
				if (animation == null)
					return

				animation.enter = getEnterScrollPosition(el)
				animation.leave = getLeaveScrollPosition(el)
				$el.updateParallaxPosition()
			})
		})

		$(window).on('scroll', function(e) {
			$.each(elements, function(i, el) {
				$(el).updateParallaxPosition()
			})
		})

	})

})(jQuery)