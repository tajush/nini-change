(function () {
  let articleOptions = () => {
    const main = document.getElementById("MainContent");
    const sections = main.querySelectorAll(".shopify-section");
    let articleElement = document.querySelector('.article-template');
    let headerArticle = document.querySelector('.article-template__header');
    let headerWrapper = document.querySelector('.header-wrapper');
    let headerLogo = document.querySelector('.header > .container  .header__heading-logo:not(.header__heading-logo--overlay)');
    let headerLogoOverlay = document.querySelector('.header__heading-logo--overlay');
    let headerIsAlwaysSticky;
    if (headerWrapper)
      headerIsAlwaysSticky = headerWrapper.getAttribute('data-sticky-type') === 'always';

    const headerGroupSections = document.querySelectorAll(
			".shopify-section-group-header-group",
		);
    const header = document.querySelector(".shopify-section-header");

    if (headerLogoOverlay && headerGroupSections[headerGroupSections.length - 1] === header && sections[0].classList.contains('section-main-article')) {
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
    
    if (articleElement.classList.contains('article-template--overlay') && headerGroupSections[headerGroupSections.length - 1] === header && sections[0].classList.contains('section-main-article')) {
      if (headerWrapper) {
        headerWrapper.classList.add('header-wrapper--overlay');
        let heightHeader = document.querySelector('.header').getBoundingClientRect().height;
        articleElement.style.marginTop = -heightHeader-50+'px';
        headerArticle.style.paddingTop = articleElement.style.paddingTop + heightHeader-144+'px';
      }
    }
    else {
      if (headerWrapper) {
        if (!sections[0].querySelector('.section--has-overlay'))
          headerWrapper.classList.remove('header-wrapper--overlay');
        articleElement.style.marginTop = '0';
        headerArticle.style.paddingTop = '0';
      }
      if (headerGroupSections[headerGroupSections.length - 1] != header) {
        document.querySelector('.section-main-article').style.marginTop = '-5rem';
        document.querySelector('.article-template--overlay').style.marginTop = '0';
      }
    }

    let heroMedia = document.querySelector('.article-template__hero > .media');

    if (heroMedia) {
      if (heroMedia.classList.contains('article-template__hero-large')) {
        headerArticle.classList.add('article-template__header-large')
      }
      else {
        headerArticle.classList.remove('article-template__header-large')
      }
    }

    if (headerIsAlwaysSticky && articleElement.classList.contains('article-template--overlay') && headerGroupSections[headerGroupSections.length - 1] === header && sections[0].classList.contains('section-main-article')) {
      document.addEventListener('scroll', () => {
        let scrollTop = window.scrollY;

        if (scrollTop > header.offsetHeight / 2) {
          headerWrapper.classList.remove('header-wrapper--overlay');
        } else if (scrollTop <= header.offsetHeight / 2) {
          headerWrapper.classList.add('header-wrapper--overlay');
        }
      });
    }
  }

  document.addEventListener('shopify:section:load', function() {
    articleOptions();
  });

  document.addEventListener('shopify:section:reorder', function () {
    articleOptions();
	});

  document.addEventListener("shopify:section:unload", function () {
		setTimeout(function () {
      articleOptions();
		}, 100);
	});

  window.addEventListener('resize', function() {
    articleOptions();
  });

  articleOptions();
})()