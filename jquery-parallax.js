"use strict"

;(function($) {

	var elements = []
	var windowH = 0
	var windowW = 0

	var getPropertyName = function(element) {
		return ($(element).data('px-property-name') + '').split(';')
	}

	var getPropertyFormat = function(element) {
		return ($(element).data('px-property-format') + '').split(';')
	}

	var getPropertyMinValue = function(element) {
		return $.map(($(element).data('px-value-min') + '').split(';'), parseFloat)
	}

	var getPropertyMaxValue = function(element) {
		return $.map(($(element).data('px-value-max') + '').split(';'), parseFloat)
	}

	var getEnterScrollPosition = function(element) {
		return Math.max($(element).offset().top - $(window).height(), 0)  + (parseFloat($(element).data('enterOffset')) || 0)
	}

	var getLeaveScrollPosition = function(element) {
		return Math.max($(element).offset().top + $(element).height(), 0) + (parseFloat($(element).data('leaveOffset')) || 0)
	}

	var getDepth = function(element) {
		return parseFloat($(element).data('px-depth')) || 1
	}

	$.enableAllParallax = function() {
		$('[data-px-property-name]').enableParallax()
	}

	$.disableAllParallax = function() {
		$('[data-px-property-name]').disableParallax()
	}

	$.fn.enableParallax = function() {
		$(this).each(function(i, el) {
			$(el).data('px-enabled', true).updateParallaxPosition()
		})
	}

	$.fn.disableParallax = function() {
		$(this).each(function(i, el) {
			$(el).data('px-enabled', false).resetParallaxPosition()
		})
	}

	$.fn.parallax = function(options) {

		if (options === 'refresh') {

			var animation = $(this).data('px-anim')
			if (animation) {
				animation.measure(animation, this)
			}

			return animation
		}

		if (options) {

			var update = function(animation, element, progress, min, max) {
				return progress * (max - min) + min
			}

			var refresh = function(animation, element) {

				var depth = animation.depth
				var enter = getEnterScrollPosition(element)
				var leave = getLeaveScrollPosition(element)

				animation.enter = enter
				animation.leave = leave * depth

				$(element).updateParallaxPosition()
			}

			var propertyName = []
			if (typeof options.propertyName === 'string') {
				propertyName = options.propertyName.split(';')
			} else if (typeof options.propertyName === 'object' && options.propertyName) {
				propertyName = options.propertyName
			}

			var propertyFormat = []
			if (typeof options.propertyFormat === 'string') {
				propertyFormat = options.propertyFormat.split(';')
			} else if (typeof options.propertyFormat === 'object' && options.propertyFormat) {
				propertyFormat = options.propertyFormat
			}

			var propertyMinValue = []
			if (typeof options.propertyMinValue === 'string') {
				propertyMinValue = $.map(options.propertyMinValue.split(';'), parseFloat)
			} else if (typeof options.propertyMinValue === 'number') {
				propertyMinValue = [options.propertyMinValue]
			} else if (typeof options.propertyMinValue === 'object' && options.propertyMinValue) {
				propertyMinValue = options.propertyMinValue
			}

			var propertyMaxValue = []
			if (typeof options.propertyMaxValue === 'string') {
				propertyMaxValue = $.map(options.propertyMaxValue.split(';'), parseFloat)
			} else if (typeof options.propertyMaxValue === 'number') {
				propertyMaxValue = [options.propertyMaxValue]
			} else if (typeof options.propertyMaxValue === 'object' && options.propertyMaxValue) {
				propertyMaxValue = options.propertyMaxValue
			}

			var animation = {
				visible: false,
				propertyName: propertyName,
				propertyFormat: propertyFormat,
				propertyMinValue: propertyMinValue,
				propertyMaxValue: propertyMaxValue,
				enter: null,
				leave: null,
				depth: options.depth || 1,
				update: options.update || update,
				refresh: options.refresh || refresh
			}

			animation.refresh(animation, this)

			$(this).data('px-anim', animation)

			elements.push(this)

			return animation
		}

		return $(this).data('px-anim')
	}

	$.fn.resetParallaxPosition = function() {

		var animation = $(this).parallax()
		if (animation == null)
			return

		$(this).css(animation.propertyName, '')
	}

	$.fn.updateParallaxPosition = function() {

		if ($(this).data('px-enabled') === false)
			return

		var animation = $(this).parallax()
		if (animation == null)
			return

		var scroll = $(window).scrollTop()
		if (scroll >= animation.enter &&
			scroll <= animation.leave) {
			if (animation.visible == false) {
				animation.visible = true
				console.log('Enter')
			}
		} else {
			if (animation.visible) {
				animation.visible = false
				console.log('Leave')
			}
		}

		if (animation.visible) {

			var length = animation.enter - animation.leave
			if (length) {

				var progress = (animation.enter - scroll) / length
				if (progress > 1) progress = 1
				if (progress < 0) progress = 0

				var names = animation.propertyName
				var formats = animation.propertyFormat
				var mins = animation.propertyMinValue
				var maxs = animation.propertyMaxValue

				for (var i = 0; i < names.length; i++) {

					var name = names[i]
					var format = formats[i]
					var min = mins[i]
					var max = maxs[i]

					var value = animation.update(animation, this, progress, min, max)

					$(this).css(name, (format || '%vpx').replace('%v', value))
				}
			}
		}
	}

	$(document).ready(function() {

		windowW = $(window).width()
		windowH = $(window).height()

		$('[data-px-property-name]').each(function(i, el) {
			$(el).parallax({
				propertyName: getPropertyName(el),
				propertyFormat: getPropertyFormat(el),
				propertyMinValue: getPropertyMinValue(el),
				propertyMaxValue: getPropertyMaxValue(el)
			})
		})

		$('[data-px-depth]').each(function(i, el) {

			var offset = 0

			var update = function(animation, element, progress, min, max) {
				return offset = ($(window).scrollTop() - animation.enter) - (((animation.leave - animation.enter) / animation.depth) * progress)
			}

			var refresh = function(animation, element) {

				var depth = animation.depth
				var enter = getEnterScrollPosition(element)
				var leave = getLeaveScrollPosition(element)

				animation.enter = enter - offset
				animation.leave = enter + (leave - enter) * depth - offset
				animation.height = $(element).outerHeight()

				$(element).updateParallaxPosition()
			}

			$(el).parallax({
				depth: getDepth(el),
				propertyName: 'transform',
				propertyFormat: 'translate3d(0, %vpx, 0)',
				propertyMinValue: null,
				propertyMaxValue: null,
				update: update,
				refresh: refresh
			})

			console.log($(el).parallax())
		})

		$(window).on('resize', function(e) {

			windowW = $(window).width()
			windowH = $(window).height()

			$.each(elements, function(i, el) {

				var $el = $(el)

				var animation = $el.parallax()
				if (animation == null)
					return

				animation.refresh(animation, el)

			})
		})

		$(window).on('scroll', function(e) {
			$.each(elements, function(i, el) {
				$(el).updateParallaxPosition()
			})
		})

	})

})(jQuery)