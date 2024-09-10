(() => {	
	Flickity.prototype._createResizeClass = function() {
		this.element.classList.add('flickity-resize');
	};
	
	Flickity.createMethods.push('_createResizeClass');
	
	var resize = Flickity.prototype.resize;
	Flickity.prototype.resize = function() {
		this.element.classList.remove('flickity-resize');
		resize.call( this );
		this.element.classList.add('flickity-resize');
	};	

	const initSliders = () => {
		const slideshowSections = document.querySelectorAll(".slideshow");
		slideshowSections.forEach((section) => {
			const slideshow = section.querySelector('.slideshow__slider');
			const autoplay =
			slideshow.getAttribute("data-autoplay") === "true" ? true : false;
			const autoplayDuration = Number(slideshow.getAttribute("data-autoplay-duration"));
			let dots = slideshow.querySelectorAll('.slideshow__slide').length > 1 ? true : false;
			
			let slideshowSlider = new Flickity(slideshow, {
				cellAlign: 'left',
				pageDots: dots,
				prevNextButtons: false,
				wrapAround: true,
				setGallerySize: true
			});

			if (!section.querySelector('.slideshow__button--prev')) {
				let buttonPrev = document.createElement('li');
				buttonPrev.className = 'slideshow__button--prev slider-btn slider-btn--prev';
				buttonPrev.innerHTML = '<svg viewBox="0 0 63 30" fill="none" role="presentation" class="icon icon-caret-left" aria-hidden="true" focusable="false"><path fill-rule="evenodd" clip-rule="evenodd" d="M6.31578 15C6.31574 15 6.3157 15 6.31566 15C6.3157 15 6.31574 15 6.31578 15L6.31578 15ZM8.34282 15.7895C13.8012 18.332 17.6825 23.692 18.1172 30L16.5341 30C15.9294 22.051 9.28802 15.7895 1.1842 15.7895C0.785745 15.7895 0.390825 15.8046 -1.40204e-05 15.8343L-1.38745e-05 14.1657C0.390825 14.1954 0.785745 14.2105 1.1842 14.2105C9.28802 14.2105 15.9294 7.94895 16.5341 -5.91431e-06L18.1172 -5.77591e-06C17.6825 6.30803 13.8012 11.668 8.34282 14.2105L62.3684 14.2105L62.3684 15.7895L8.34282 15.7895Z" fill="currentColor"/></svg>';				
				slideshow.querySelector('.flickity-page-dots').prepend(buttonPrev);
				buttonPrev.onclick =  () => {
					slideshowSlider.previous();
				};
			}
			
			if (!section.querySelector('.slideshow__button--next')) {
				let buttonNext = document.createElement('li');
				buttonNext.className = 'slideshow__button--next slider-btn slider-btn--next';
				buttonNext.innerHTML = '<svg viewBox="0 0 63 30" fill="none" role="presentation" class="icon icon-caret-right" aria-hidden="true" focusable="false"><path fill-rule="evenodd" clip-rule="evenodd" d="M56.0526 15C56.0527 15 56.0527 15 56.0527 15C56.0527 15 56.0527 15 56.0526 15V15ZM54.0256 14.2105C48.5672 11.668 44.6859 6.30803 44.2512 0H45.8343C46.439 7.94895 53.0804 14.2105 61.1842 14.2105C61.5827 14.2105 61.9776 14.1954 62.3684 14.1657V15.8343C61.9776 15.8046 61.5827 15.7895 61.1842 15.7895C53.0804 15.7895 46.439 22.051 45.8343 30H44.2512C44.6859 23.692 48.5672 18.332 54.0256 15.7895H0V14.2105H54.0256Z" fill="currentColor"/></svg>';
				slideshow.querySelector('.flickity-page-dots').append(buttonNext);
				buttonNext.onclick = () => {
					slideshowSlider.next();
				};
			}

			if (autoplay) {
				slideshowSlider.options.autoPlay = autoplayDuration;
				slideshowSlider.playPlayer();
				slideshow.addEventListener("mouseenter", () => {
					slideshowSlider.pausePlayer()
				});
				slideshow.addEventListener("mouseleave", () => {
					slideshowSlider.unpausePlayer()
				});
			}
		});
	};

	initSliders();

	document.addEventListener("shopify:section:load", function () {
		setTimeout(function () {
      initSliders();
		}, 100);
	});
})();
