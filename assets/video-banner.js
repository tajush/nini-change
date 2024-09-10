/* Header Overlay */
(function () {
  const eventScroll = () => {
    const header = document.querySelector(".shopify-section-header");
    const headerWrapper = document.querySelector('.header-wrapper');
    let scrollTop = window.scrollY;

    if (scrollTop > header.offsetHeight / 2) {
      headerWrapper.classList.remove('header-wrapper--overlay');
    } else if (scrollTop <= header.offsetHeight / 2) {
      headerWrapper.classList.add('header-wrapper--overlay');
    }
  }

  const setLightHeader = () => {
    const headerWrapper = document.querySelector('.header-wrapper');
    const headerLogo = document.querySelector('.header > .container  .header__heading-logo:not(.header__heading-logo--overlay)');
    const headerLogoOverlay = document.querySelector('.header__heading-logo--overlay');

    const main = document.getElementById("MainContent");
    const sections = main.querySelectorAll(".shopify-section");
    const elementOverlay = sections[0].querySelector(".section--has-overlay");

    let headerIsAlwaysSticky;
    if (headerWrapper)
      headerIsAlwaysSticky = headerWrapper.getAttribute('data-sticky-type') === 'always';

    const headerGroupSections = document.querySelectorAll(
			".shopify-section-group-header-group",
		);
    const header = document.querySelector(".shopify-section-header"); 

    if (headerLogoOverlay && headerGroupSections[headerGroupSections.length - 1] === header) {
      if (headerLogo) {
        headerLogo.classList.add('hide');
      }
      headerLogoOverlay.classList.add('show');
    }
    else {
      if (headerLogo) {
        headerLogo.classList.remove('hide');
      }
    }

    if (elementOverlay && headerGroupSections[headerGroupSections.length - 1] === header) {
      if (headerWrapper) {
        headerWrapper.classList.add('header-wrapper--overlay');
        let heightHeader = document.querySelector('.header').getBoundingClientRect().height;
        if (sections[0].querySelector('.section--has-overlay'))
          sections[0].querySelector('.section--has-overlay').style.marginTop = -heightHeader+'px';
        if (document.documentElement.clientWidth > 749 ) 
					sections[0].querySelector('.video-banner__wrapper').style.paddingTop = heightHeader+10+'px';
        else 
					sections[0].querySelector('.video-banner__wrapper').style.paddingTop = '20px';
      }
    }
    else {
      if (headerWrapper) {
        if (!sections[0].classList.contains('section-main-article'))
          headerWrapper.classList.remove('header-wrapper--overlay');
      }
      if (headerWrapper || headerGroupSections[headerGroupSections.length - 1] != header) {
        if (sections[0].querySelector('.section--has-overlay'))
          sections[0].querySelector('.section--has-overlay').style.marginTop = '0';
				if (sections[0].querySelector('.video-banner__wrapper')) 
        	sections[0].querySelector('.video-banner__wrapper').style.paddingTop = '20px';
      }
    }

    if (headerIsAlwaysSticky && elementOverlay && headerGroupSections[headerGroupSections.length - 1] === header) {
      document.addEventListener('scroll', eventScroll);
    }
    else {
      document.removeEventListener('scroll', eventScroll);
    }
  }

  setLightHeader();

  document.addEventListener('shopify:section:load', function() {
    setLightHeader();
  });

  document.addEventListener("shopify:section:unload", function () {
		setTimeout(function () {
      setLightHeader();
		}, 100);
	});

  window.addEventListener('resize', function() {
    setLightHeader();
  });

  document.addEventListener('shopify:section:reorder', function () {
		setLightHeader();
	})

})();