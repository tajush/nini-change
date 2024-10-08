class FacetFiltersForm extends HTMLElement {
  constructor() {
    super();
    this.onActiveFilterClick = this.onActiveFilterClick.bind(this);

    this.debouncedOnSubmit = debounce((event) => {
      this.onSubmitHandler(event);
    }, 500);

    this.querySelector('form').addEventListener('input', this.debouncedOnSubmit.bind(this));

    const facetWrapper = this.querySelector('#FacetsWrapperDesktop');
    if (facetWrapper) facetWrapper.addEventListener('keyup', onKeyUpEscape);
  }

  static setListeners() {
    const onHistoryChange = (event) => {
      const searchParams = event.state ? event.state.searchParams : FacetFiltersForm.searchParamsInitial;
      if (searchParams === FacetFiltersForm.searchParamsPrev) return;
      FacetFiltersForm.renderPage(searchParams, null, false);
    }
    window.addEventListener('popstate', onHistoryChange);
  }

  static toggleActiveFacets(disable = true) {
    document.querySelectorAll('.js-facet-remove').forEach((element) => {
      element.classList.toggle('disabled', disable);
    });
  }

  static renderPage(searchParams, event, updateURLHash = true) {
    FacetFiltersForm.searchParamsPrev = searchParams;
    const sections = FacetFiltersForm.getSections();
    const countContainer = document.getElementById('ProductCount');
    const countContainerDesktop = document.getElementById('ProductCountDesktop');
    document.getElementById('ProductGridContainer').querySelector('.collection-product').classList.add('loading');
    if (countContainer){
      countContainer.classList.add('loading');
    }
    if (countContainerDesktop){
      countContainerDesktop.classList.add('loading');
    }

    sections.forEach((section) => {
      const url = `${window.location.pathname}?section_id=${section.section}&${searchParams}`;
      const filterDataUrl = element => element.url === url;

      FacetFiltersForm.filterData.some(filterDataUrl) ?
        FacetFiltersForm.renderSectionFromCache(filterDataUrl, event) :
        FacetFiltersForm.renderSectionFromFetch(url, event);
    });

    if (updateURLHash) FacetFiltersForm.updateURLHash(searchParams);
  }

  static renderSectionFromFetch(url, event) {
    fetch(url)
      .then(response => response.text())
      .then((responseText) => {
        const html = responseText;
        FacetFiltersForm.filterData = [...FacetFiltersForm.filterData, { html, url }];
        FacetFiltersForm.renderFilters(html, event);
        FacetFiltersForm.renderProductGridContainer(html);
        FacetFiltersForm.renderProductCount(html);
      });
  }

  static renderSectionFromCache(filterDataUrl, event) {
    const html = FacetFiltersForm.filterData.find(filterDataUrl).html;
    FacetFiltersForm.renderFilters(html, event);
    FacetFiltersForm.renderProductGridContainer(html);
    FacetFiltersForm.renderProductCount(html);
  }

  static renderProductGridContainer(html) {
    document.getElementById('ProductGridContainer').innerHTML = new DOMParser().parseFromString(html, 'text/html').getElementById('ProductGridContainer').innerHTML;
    quickView();
    try {
      colorSwatches();
    } 
    catch(err) {}
  }

  static renderProductCount(html) {
    const count = new DOMParser().parseFromString(html, 'text/html').getElementById('ProductCount').innerHTML
    const container = document.getElementById('ProductCount');
    const containerDesktop = document.getElementById('ProductCountDesktop');
    container.innerHTML = count;
    container.classList.remove('loading');
    if (containerDesktop) {
      containerDesktop.innerHTML = count;
      containerDesktop.classList.remove('loading');
    }
  }

  static renderFilters(html, event) {
    const parsedHTML = new DOMParser().parseFromString(html, 'text/html');

    const facetDetailsElements =
      parsedHTML.querySelectorAll('#FacetFiltersForm .js-filter, #FacetFiltersFormMobile .js-filter');
    const matchesIndex = (element) => {
      const jsFilter = event ? event.target.closest('.js-filter') : undefined;
      return jsFilter ? element.dataset.index === jsFilter.dataset.index : false;
    }
    const facetsToRender = Array.from(facetDetailsElements).filter(element => !matchesIndex(element));
    const countsToRender = Array.from(facetDetailsElements).find(matchesIndex);

    facetsToRender.forEach((element) => {
      document.querySelector(`.js-filter[data-index="${element.dataset.index}"]`).innerHTML = element.innerHTML;
    });

    FacetFiltersForm.renderActiveFacets(parsedHTML);
    FacetFiltersForm.renderAdditionalElements(parsedHTML);

    if (countsToRender) FacetFiltersForm.renderCounts(countsToRender, event.target.closest('.js-filter'));

    checkProductTypeItem();
  }

  static renderActiveFacets(html) {
    const activeFacetElementSelectors = ['.active-facets-mobile', '.active-facets-desktop'];

    activeFacetElementSelectors.forEach((selector) => {
      const activeFacetsElement = html.querySelector(selector);
      if (!activeFacetsElement) return;
      document.querySelector(selector).innerHTML = activeFacetsElement.innerHTML;
    })

    FacetFiltersForm.toggleActiveFacets(false);
  }

  static renderAdditionalElements(html) {
    const mobileElementSelectors = ['.mobile-facets__open', '.mobile-facets__count', '.sorting'];

    mobileElementSelectors.forEach((selector) => {
      if (!html.querySelector(selector)) return;
      document.querySelector(selector).innerHTML = html.querySelector(selector).innerHTML;
    });

    document.getElementById('FacetFiltersFormMobile').closest('menu-drawer').bindEvents();
  }

  static renderCounts(source, target) {
    const countElementSelectors = ['.count-bubble', '.facets__selected'];
		countElementSelectors.forEach((selector) => {
			const targetElement = target.querySelector(selector);
			const sourceElement = source.querySelector(selector);

			if (sourceElement && targetElement) {
				target.querySelector(selector).outerHTML = source.querySelector(selector).outerHTML;
			}
		});
  }

  static updateURLHash(searchParams) {
    history.pushState({ searchParams }, '', `${window.location.pathname}${searchParams && '?'.concat(searchParams)}`);
  }

  static getSections() {
    return [
      {
        section: document.getElementById('product-grid').dataset.id,
      }
    ]
  }

  onSubmitHandler(event) {
    event.preventDefault();
    const formData = new FormData(event.target.closest('form'));
    const searchParams = new URLSearchParams(formData).toString();
    FacetFiltersForm.renderPage(searchParams, event);
  }

  onActiveFilterClick(event) {
    event.preventDefault();
    FacetFiltersForm.toggleActiveFacets();
    const url = event.currentTarget.href.indexOf('?') == -1 ? '' : event.currentTarget.href.slice(event.currentTarget.href.indexOf('?') + 1);
    FacetFiltersForm.renderPage(url);
  }
}

FacetFiltersForm.filterData = [];
FacetFiltersForm.searchParamsInitial = window.location.search.slice(1);
FacetFiltersForm.searchParamsPrev = window.location.search.slice(1);
customElements.define('facet-filters-form', FacetFiltersForm);
FacetFiltersForm.setListeners();

class PriceRange extends HTMLElement {
  constructor() {
    super();
    this.querySelectorAll('input')
      .forEach(element => element.addEventListener('change', this.onRangeChange.bind(this)));

    this.setMinAndMaxValues();
    this.controlSlider();
    this.controlInput();
  }

  onRangeChange(event) {
    this.adjustToValidValues(event.currentTarget);
    this.setMinAndMaxValues();
  }

  setMinAndMaxValues() {
    const inputs = this.querySelectorAll('input');
    const minInput = inputs[0];
    const maxInput = inputs[1];
    if (maxInput.value) minInput.setAttribute('max', maxInput.value);
    if (minInput.value) maxInput.setAttribute('min', minInput.value);
    if (minInput.value === '') maxInput.setAttribute('min', 0);
    if (maxInput.value === '') minInput.setAttribute('max', maxInput.getAttribute('max'));
  }

  adjustToValidValues(input) {
    const value = Number(input.value);
    const min = Number(input.getAttribute('min'));
    const max = Number(input.getAttribute('max'));

    if (value < min) input.value = min;
    if (value > max) input.value = max;
  }

  fillSlider () {
    const inputRangeWrappers = document.querySelectorAll('.facets__price .facets__range');
    inputRangeWrappers.forEach(inputWrapper => {
      const inputsRange = inputWrapper.querySelectorAll('.field__range');
      const inputRangeFrom = inputsRange[0];
      const inputRangeTo = inputsRange[1];

      const range = inputRangeTo.max - inputRangeTo.min;
      const fromCurrent = inputRangeFrom.value - inputRangeTo.min;
      const toCurrent = inputRangeTo.value - inputRangeTo.min;
      const minRange = fromCurrent / range * 100;
      const maxRange = toCurrent / range * 100;

      inputWrapper.setAttribute(
        'style',
        `--range-min: ${minRange}%; --range-max: ${maxRange}%`
      );
    })
  }

  controlSlider () {
    const inputRangeWrappers = document.querySelectorAll('.facets__price .facets__range');
    const inputNumberWrappers = document.querySelectorAll('.facets__price .facets__price-wrapper');

    inputRangeWrappers.forEach((inputWrapper, index) => {
      const inputsRange = inputWrapper.querySelectorAll('.field__range');
      const inputRangeFrom = inputsRange[0];
      const inputRangeTo = inputsRange[1];
      const inputNumberFrom = inputNumberWrappers[index].querySelectorAll('.field__input')[0];
      const inputNumberTo = inputNumberWrappers[index].querySelectorAll('.field__input')[1];

      inputRangeFrom.oninput = () => {
        const from = parseInt(inputRangeFrom.value, 10);
        const to = parseInt(inputRangeTo.value, 10);
        if (from > to) {
          inputRangeFrom.value = to;
          inputNumberFrom.value = to;
        }
        else {
          inputNumberFrom.value = from;
        }

        this.fillSlider();
      }

      if (Number(inputRangeTo.value) <= 0 ) {
        inputRangeTo.style.zIndex = 2;
      } else {
        inputRangeTo.style.zIndex = 0;
      }

      inputRangeTo.oninput = () => {
        const from = parseInt(inputRangeFrom.value, 10);
        const to = parseInt(inputRangeTo.value, 10);
        if (from <= to) {
          inputRangeTo.value = to;
          inputNumberTo.value = to;
        }
        else {
          inputNumberTo.value = from;
          inputRangeTo.value = from;
        }

        if (Number(inputRangeTo.value) <= 0 ) {
          inputRangeTo.style.zIndex = 2;
        } else {
          inputRangeTo.style.zIndex = 0;
        }

        this.fillSlider();
      }
    })
  }

  controlInput() {
    const inputRangeWrappers = document.querySelectorAll('.facets__price .facets__range');
    const inputNumberWrappers = document.querySelectorAll('.facets__price .facets__price-wrapper');

    inputNumberWrappers.forEach((inputWrapper, index) => {
      const inputsNumber = inputWrapper.querySelectorAll('.field__input');
      const inputNumberFrom = inputsNumber[0];
      const inputNumberTo = inputsNumber[1];
      const inputRangeFrom = inputRangeWrappers[index].querySelectorAll('.field__range')[0];
      const inputRangeTo = inputRangeWrappers[index].querySelectorAll('.field__range')[1];

      inputNumberFrom.oninput = () => {
        const from = parseInt(inputNumberFrom.value, 10);
        const to = parseInt(inputNumberTo.value, 10);
        if (from > to) {
          inputRangeFrom.value = to;
          inputNumberFrom.value = to;
        } 
        else {
          inputRangeFrom.value = from;
        }

        this.fillSlider();
      }

      inputNumberTo.oninput = () => {
        const from = parseInt(inputNumberFrom.value, 10);
        const to = parseInt(inputNumberTo.value, 10);
        if (from <= to) {
          inputRangeTo.value = to;
          inputNumberTo.value = to;
        }
        else {
          inputNumberTo.value = from;
        }

        this.fillSlider();
      }

    })
  }
}

customElements.define('price-range', PriceRange);

class FacetRemove extends HTMLElement {
  constructor() {
    super();
    this.querySelector('a').addEventListener('click', (event) => {
      event.preventDefault();
      const form = this.closest('facet-filters-form') || document.querySelector('facet-filters-form');
      form.onActiveFilterClick(event);
    });
  }
}

customElements.define('facet-remove', FacetRemove);

function checkProductTypeItem() {	
  const productTypeListWrapper = document.querySelector(('.product-type__wrapper'));
  const productTypeList = document.querySelector(('.product-type__list'));

  if (productTypeListWrapper) {
    const productTypeReset = productTypeListWrapper.querySelector('.product-type__all');
    if (productTypeReset) {
      productTypeListWrapper.classList.add('active-all');
      for (let elem of productTypeList.children) {
        let inputItem = elem.querySelector('input[type=checkbox]');
        if (inputItem && inputItem.checked) {
          productTypeListWrapper.classList.remove('active-all');
          break;
        }
      }
    }
  }
}

document.addEventListener("DOMContentLoaded", checkProductTypeItem);
