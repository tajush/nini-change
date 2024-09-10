function getSubSliderProductSettings() {
	return {
		asNavFor: ".product__media-list",
		contain: true,
		pageDots: false,
		prevNextButtons: false,
	};
}

function getFocusableElements(container) {
	return Array.from(
		container.querySelectorAll(
			"summary, a[href], button:enabled, [tabindex]:not([tabindex^='-']), [draggable], area, input:not([type=hidden]):enabled, select:enabled, textarea:enabled, object, iframe",
		),
	);
}

document.querySelectorAll('[id^="Details-"] summary').forEach((summary) => {
	summary.setAttribute("role", "button");
	summary.setAttribute("aria-expanded", "false");

	if (summary.nextElementSibling.getAttribute("id")) {
		summary.setAttribute("aria-controls", summary.nextElementSibling.id);
	}

	summary.addEventListener("click", (event) => {
		event.currentTarget.setAttribute(
			"aria-expanded",
			!event.currentTarget.closest("details").hasAttribute("open"),
		);
	});

	if (summary.closest("header-drawer")) return;
	summary.parentElement.addEventListener("keyup", onKeyUpEscape);
});

function onKeyUpEscape(event) {
	if (event.code.toUpperCase() !== "ESCAPE") return;

	const openDetailsElement = event.target.closest("details[open]");
	if (!openDetailsElement) return;

	const summaryElement = openDetailsElement.querySelector("summary");
	openDetailsElement.removeAttribute("open");
	summaryElement.setAttribute("aria-expanded", false);
	summaryElement.focus();
}

const trapFocusHandlers = {};

function trapFocus(container, elementToFocus = container) {
	var elements = getFocusableElements(container);
	var first = elements[0];
	var last = elements[elements.length - 1];

	removeTrapFocus();

	trapFocusHandlers.focusin = (event) => {
		if (
			event.target !== container &&
			event.target !== last &&
			event.target !== first
		)
			return;

		document.addEventListener("keydown", trapFocusHandlers.keydown);
	};

	trapFocusHandlers.focusout = function () {
		document.removeEventListener("keydown", trapFocusHandlers.keydown);
	};

	trapFocusHandlers.keydown = function (event) {
		if (event.code.toUpperCase() !== "TAB") return; // If not TAB key
		// On the last focusable element and tab forward, focus the first element.
		if (event.target === last && !event.shiftKey) {
			event.preventDefault();
			first.focus();
		}

		//  On the first focusable element and tab backward, focus the last element.
		if (
			(event.target === container || event.target === first) &&
			event.shiftKey
		) {
			event.preventDefault();
			last.focus();
		}
	};

	document.addEventListener("focusout", trapFocusHandlers.focusout);
	document.addEventListener("focusin", trapFocusHandlers.focusin);

	elementToFocus.focus();
}

function pauseAllMedia() {
	document.querySelectorAll(".js-youtube").forEach((video) => {
		video.contentWindow.postMessage(
			'{"event":"command","func":"' + "pauseVideo" + '","args":""}',
			"*",
		);
	});
	document.querySelectorAll(".js-vimeo").forEach((video) => {
		video.contentWindow.postMessage('{"method":"pause"}', "*");
	});
	document.querySelectorAll("video").forEach((video) => video.pause());
	document.querySelectorAll("product-model").forEach((model) => {
		if (model.modelViewerUI) model.modelViewerUI.pause();
	});
}

function removeTrapFocus(elementToFocus = null) {
	document.removeEventListener("focusin", trapFocusHandlers.focusin);
	document.removeEventListener("focusout", trapFocusHandlers.focusout);
	document.removeEventListener("keydown", trapFocusHandlers.keydown);

	if (elementToFocus) elementToFocus.focus();
}

class QuantityInput extends HTMLElement {
	constructor() {
		super();
		this.input = this.querySelector("input");
		this.changeEvent = new Event("change", { bubbles: true });

		this.querySelectorAll("button").forEach((button) =>
			button.addEventListener("click", this.onButtonClick.bind(this)),
		);

		var eventList = ["paste", "input"];

		for (event of eventList) {
			this.input.addEventListener(event, function (e) {
				const numberRegex = /^0*?[1-9]\d*$/;

				if (
					numberRegex.test(e.currentTarget.value) ||
					e.currentTarget.value === ""
				) {
					e.currentTarget.value;
				} else {
					e.currentTarget.value = 1;
				}
			});
		}

		this.input.addEventListener("focusout", function (e) {
			if (e.currentTarget.value === "") {
				e.currentTarget.value = 1;
			}
		});
	}

	onButtonClick(event) {
		event.preventDefault();
		const previousValue = this.input.value;

		event.target.name === "plus" ? this.input.stepUp() : this.input.stepDown();
		if (previousValue !== this.input.value)
			this.input.dispatchEvent(this.changeEvent);
	}
}

customElements.define("quantity-input", QuantityInput);

function debounce(fn, wait) {
	let t;
	return (...args) => {
		clearTimeout(t);
		t = setTimeout(() => fn.apply(this, args), wait);
	};
}

const serializeForm = (form) => {
	const obj = {};
	const formData = new FormData(form);
	for (const key of formData.keys()) {
		obj[key] = formData.get(key);
	}
	return JSON.stringify(obj);
};

function fetchConfig(type = "json") {
	return {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Accept: `application/${type}`,
		},
	};
}

/*
 * Shopify Common JS
 *
 */
if (typeof window.Shopify == "undefined") {
	window.Shopify = {};
}

Shopify.bind = function (fn, scope) {
	return function () {
		return fn.apply(scope, arguments);
	};
};

Shopify.setSelectorByValue = function (selector, value) {
	for (var i = 0, count = selector.options.length; i < count; i++) {
		var option = selector.options[i];
		if (value == option.value || value == option.innerHTML) {
			selector.selectedIndex = i;
			return i;
		}
	}
};

Shopify.addListener = function (target, eventName, callback) {
	target.addEventListener
		? target.addEventListener(eventName, callback, false)
		: target.attachEvent("on" + eventName, callback);
};

Shopify.postLink = function (path, options) {
	options = options || {};
	var method = options["method"] || "post";
	var params = options["parameters"] || {};

	var form = document.createElement("form");
	form.setAttribute("method", method);
	form.setAttribute("action", path);

	for (var key in params) {
		var hiddenField = document.createElement("input");
		hiddenField.setAttribute("type", "hidden");
		hiddenField.setAttribute("name", key);
		hiddenField.setAttribute("value", params[key]);
		form.appendChild(hiddenField);
	}
	document.body.appendChild(form);
	form.submit();
	document.body.removeChild(form);
};

Shopify.CountryProvinceSelector = function (
	country_domid,
	province_domid,
	options,
) {
	this.countryEl = document.getElementById(country_domid);
	this.provinceEl = document.getElementById(province_domid);
	this.provinceContainer = document.getElementById(
		options["hideElement"] || province_domid,
	);

	Shopify.addListener(
		this.countryEl,
		"change",
		Shopify.bind(this.countryHandler, this),
	);

	this.initCountry();
	this.initProvince();
};

Shopify.CountryProvinceSelector.prototype = {
	initCountry: function () {
		var value = this.countryEl.getAttribute("data-default");
		Shopify.setSelectorByValue(this.countryEl, value);
		this.countryHandler();
	},

	initProvince: function () {
		var value = this.provinceEl.getAttribute("data-default");
		if (value && this.provinceEl.options.length > 0) {
			Shopify.setSelectorByValue(this.provinceEl, value);
		}
	},

	countryHandler: function (e) {
		var opt = this.countryEl.options[this.countryEl.selectedIndex];
		var raw = opt.getAttribute("data-provinces");
		var provinces = JSON.parse(raw);

		this.clearOptions(this.provinceEl);
		if (provinces && provinces.length == 0) {
			this.provinceContainer.style.display = "none";
		} else {
			for (var i = 0; i < provinces.length; i++) {
				var opt = document.createElement("option");
				opt.value = provinces[i][0];
				opt.innerHTML = provinces[i][1];
				this.provinceEl.appendChild(opt);
			}

			this.provinceContainer.style.display = "";
		}
	},

	clearOptions: function (selector) {
		while (selector.firstChild) {
			selector.removeChild(selector.firstChild);
		}
	},

	setOptions: function (selector, values) {
		for (var i = 0, count = values.length; i < values.length; i++) {
			var opt = document.createElement("option");
			opt.value = values[i];
			opt.innerHTML = values[i];
			selector.appendChild(opt);
		}
	},
};

class MenuDrawer extends HTMLElement {
	constructor() {
		super();

		this.mainDetailsToggle = this.querySelector("details");
		const summaryElements = this.querySelectorAll("summary");
		this.addAccessibilityAttributes(summaryElements);

		if (navigator.platform === "iPhone")
			document.documentElement.style.setProperty(
				"--viewport-height",
				`${window.innerHeight}px`,
			);

		this.addEventListener("keyup", this.onKeyUp.bind(this));
		this.addEventListener("focusout", this.onFocusOut.bind(this));
		this.bindEvents();
	}

	bindEvents() {
		this.querySelectorAll("summary").forEach((summary) =>
			summary.addEventListener("click", this.onSummaryClick.bind(this)),
		);
		this.querySelectorAll("button").forEach((button) => {
			if (this.querySelector(".header__localization-button") === button) return;
			if (this.querySelector(".header__localization-lang-button") === button)
				return;
			button.addEventListener("click", this.onCloseButtonClick.bind(this));
		});
	}

	addAccessibilityAttributes(summaryElements) {
		summaryElements.forEach((element) => {
			element.setAttribute("role", "button");
			element.setAttribute("aria-expanded", false);
			element.setAttribute("aria-controls", element.nextElementSibling.id);
		});
	}

	onKeyUp(event) {
		if (event.code.toUpperCase() !== "ESCAPE") return;

		const openDetailsElement = event.target.closest("details[open]");
		if (!openDetailsElement) return;

		openDetailsElement === this.mainDetailsToggle
			? this.closeMenuDrawer(this.mainDetailsToggle.querySelector("summary"))
			: this.closeSubmenu(openDetailsElement);
	}

	onSummaryClick(event) {
		const summaryElement = event.currentTarget;
		const detailsElement = summaryElement.parentNode;
		const isOpen = detailsElement.hasAttribute("open");

		if (detailsElement === this.mainDetailsToggle) {
			if (isOpen) event.preventDefault();
			isOpen
				? this.closeMenuDrawer(summaryElement)
				: this.openMenuDrawer(summaryElement);
		} else {
			trapFocus(
				summaryElement.nextElementSibling,
				detailsElement.querySelector("button"),
			);

			setTimeout(() => {
				detailsElement.classList.add("menu-opening");
			});
		}
	}

	openMenuDrawer(summaryElement) {
		setTimeout(() => {
			this.mainDetailsToggle.classList.add("menu-opening");
		});
		summaryElement.setAttribute("aria-expanded", true);
		trapFocus(this.mainDetailsToggle, summaryElement);
		document.body.classList.add(`overflow-hidden-${this.dataset.breakpoint}`);
	}

	closeMenuDrawer(event, elementToFocus = false) {
		if (event !== undefined) {
			this.mainDetailsToggle.classList.remove("menu-opening");
			this.mainDetailsToggle.querySelectorAll("details").forEach((details) => {
				details.removeAttribute("open");
				details.classList.remove("menu-opening");
			});
			this.mainDetailsToggle
				.querySelector("summary")
				.setAttribute("aria-expanded", false);
			document.body.classList.remove(
				`overflow-hidden-${this.dataset.breakpoint}`,
			);
			removeTrapFocus(elementToFocus);
			this.closeAnimation(this.mainDetailsToggle);
		}
	}

	onFocusOut(event) {
		setTimeout(() => {
			if (
				this.mainDetailsToggle.hasAttribute("open") &&
				!this.mainDetailsToggle.contains(document.activeElement)
			)
				this.closeMenuDrawer();
		});
	}

	onCloseButtonClick(event) {
		const detailsElement = event.currentTarget.closest("details");
		this.closeSubmenu(detailsElement);
	}

	closeSubmenu(detailsElement) {
		detailsElement.classList.remove("menu-opening");
		removeTrapFocus();
		this.closeAnimation(detailsElement);
	}

	closeAnimation(detailsElement) {
		let animationStart;

		const handleAnimation = (time) => {
			if (animationStart === undefined) {
				animationStart = time;
			}

			const elapsedTime = time - animationStart;

			if (elapsedTime < 400) {
				window.requestAnimationFrame(handleAnimation);
			} else {
				detailsElement.removeAttribute("open");
				if (detailsElement.closest("details[open]")) {
					trapFocus(
						detailsElement.closest("details[open]"),
						detailsElement.querySelector("summary"),
					);
				}
			}
		};

		window.requestAnimationFrame(handleAnimation);
	}
}

customElements.define("menu-drawer", MenuDrawer);

class HeaderDrawer extends MenuDrawer {
	constructor() {
		super();
	}

	openMenuDrawer(summaryElement) {
		this.header =
			this.header || document.querySelector(".shopify-section-header");
		this.borderOffset =
			this.borderOffset ||
			this.closest(".header-wrapper").classList.contains(
				"header-wrapper--border-bottom",
			)
				? 1
				: 0;
		document.documentElement.style.setProperty(
			"--header-bottom-position",
			`${parseInt(
				this.header.getBoundingClientRect().bottom - this.borderOffset,
			)}px`,
		);

		setTimeout(() => {
			this.mainDetailsToggle.classList.add("menu-opening");
		});

		summaryElement.setAttribute("aria-expanded", true);
		trapFocus(this.mainDetailsToggle, summaryElement);
		document.body.classList.add(`overflow-hidden-${this.dataset.breakpoint}`);
	}
}

customElements.define("header-drawer", HeaderDrawer);

class ModalDialog extends HTMLElement {
	constructor() {
		super();
		this.querySelector('[id^="ModalClose-"]').addEventListener(
			"click",
			this.hide.bind(this),
		);
		this.addEventListener("click", (event) => {
			if (event.target.nodeName === "MODAL-DIALOG") this.hide();
		});
		this.addEventListener("keyup", () => {
			if (event.code.toUpperCase() === "ESCAPE") this.hide();
		});
	}

	show(opener) {
		this.openedBy = opener;
		document.body.classList.add("overflow-hidden");
		this.setAttribute("open", "");
		this.querySelector(".template-popup")?.loadContent();
		trapFocus(this, this.querySelector('[role="dialog"]'));
	}

	hide() {
		document.body.classList.remove("overflow-hidden");
		this.removeAttribute("open");
		removeTrapFocus(this.openedBy);
		window.pauseAllMedia();
		document.querySelector("body").style.overflow = "auto";
	}
}

customElements.define("modal-dialog", ModalDialog);

class ModalOpener extends HTMLElement {
	constructor() {
		super();

		const button = this.querySelector("button");
		button?.addEventListener("click", () => {
			document.querySelector(this.getAttribute("data-modal"))?.show(button);
			document.querySelector("body").style.overflow = "hidden";
		});
	}
}

customElements.define("modal-opener", ModalOpener);

class DeferredMedia extends HTMLElement {
	constructor() {
		super();
		this.querySelector('[id^="Deferred-Poster-"]')?.addEventListener(
			"click",
			this.loadContent.bind(this),
		);
	}

	loadContent() {
		if (!this.getAttribute("loaded")) {
			const content = document.createElement("div");
			content.appendChild(
				this.querySelector("template").content.firstElementChild.cloneNode(
					true,
				),
			);

			this.setAttribute("loaded", true);
			window.pauseAllMedia();
			this.appendChild(
				content.querySelector("video, model-viewer, iframe"),
			).focus();
		}
	}
}

customElements.define("deferred-media", DeferredMedia);

class SliderComponent extends HTMLElement {
	constructor() {
		super();
		this.slider = this.querySelector(".slider");
		this.sliderItems = this.querySelectorAll(".slider__slide");
		this.pageCount = this.querySelector(".slider-counter--current");
		this.pageTotal = this.querySelector(".slider-counter--total");
		this.prevButton = this.querySelector('button[name="previous"]');
		this.nextButton = this.querySelector('button[name="next"]');

		if (!this.slider || !this.nextButton) return;

		const resizeObserver = new ResizeObserver((entries) => this.initPages());
		resizeObserver.observe(this.slider);

		this.slider.addEventListener("scroll", this.update.bind(this));
		this.prevButton.addEventListener("click", this.onButtonClick.bind(this));
		this.nextButton.addEventListener("click", this.onButtonClick.bind(this));
	}

	initPages() {
		if (!this.sliderItems.length === 0) return;
		this.slidesPerPage = Math.floor(
			this.slider.clientWidth / this.sliderItems[0].clientWidth,
		);
		this.totalPages = this.sliderItems.length - this.slidesPerPage + 1;
		this.update();
	}

	update() {
		if (!this.pageCount || !this.pageTotal) return;
		this.currentPage =
			Math.round(this.slider.scrollLeft / this.sliderItems[0].clientWidth) + 1;

		if (this.currentPage === 1) {
			this.prevButton.setAttribute("disabled", true);
		} else {
			this.prevButton.removeAttribute("disabled");
		}

		if (this.currentPage === this.totalPages) {
			this.nextButton.setAttribute("disabled", true);
		} else {
			this.nextButton.removeAttribute("disabled");
		}

		this.pageCount.textContent = this.currentPage;
		this.pageTotal.textContent = this.totalPages;
	}

	onButtonClick(event) {
		event.preventDefault();
		const slideScrollPosition =
			event.currentTarget.name === "next"
				? this.slider.scrollLeft + this.sliderItems[0].clientWidth
				: this.slider.scrollLeft - this.sliderItems[0].clientWidth;
		this.slider.scrollTo({
			left: slideScrollPosition,
		});
	}
}

customElements.define("slider-component", SliderComponent);

class VariantSelects extends HTMLElement {
	constructor() {
		super();
		this.addEventListener("change", this.onVariantChange);
	}

	onVariantChange() {
		this.updateOptions();
		this.updateMasterId();
		this.toggleAddButton(true, "", false);
		this.updatePickupAvailability();
		this.updateVariantStatuses();

		if (!this.currentVariant) {
			this.toggleAddButton(true, "", true);
			this.setUnavailable();
		} else {
			this.updateMedia();
			this.updateMediaSub();
			this.updateURL();
			this.updateVariantInput();
			this.renderProductInfo();
		}
	}

	updateOptions() {
		const fieldsets = Array.from(this.querySelectorAll(".js-radio-colors"));

		this.options = Array.from(
			this.querySelectorAll("select"),
			(select) => select.value,
		).concat(
			fieldsets.map((fieldset) => {

				return Array.from(fieldset.querySelectorAll("input")).find(
					(radio) => radio.checked,
				).value;
			})
		);
	}

	updateMasterId() {
		if (this.variantData || this.querySelector('[type="application/json"]')) {
			this.currentVariant = this.getVariantData().find((variant) => {
				this.options.sort();
				variant.options.sort();

				return !variant.options.map((option, index) => {
					return this.options[index] === option;
				}).includes(false);
			});
		}
	}

	updateMedia() {
		if (!this.currentVariant || !this.currentVariant?.featured_media) return;

		const newMedia = document.querySelector(
			`[data-media-id="${this.dataset.section}-${this.currentVariant.featured_media.id}"]`,
		);

		$(".js-media-list").flickity("destroy");

		if (!newMedia) return;

		const parent = newMedia.parentElement;

		parent.prepend(newMedia);

		window.setTimeout(() => {
			parent.scroll(0, 0);
		});

		$(".js-media-list").flickity({
			pageDots: false,
			prevNextButtons: false,
			adaptiveHeight: true,
			wrapAround: true,
			fade: true,
		});
	}

	updateMediaSub() {
		if (!this.currentVariant || !this.currentVariant?.featured_media) return;

		const newMediaSub = document.querySelector(
			`[data-media-sub-id="${this.dataset.section}-${this.currentVariant.featured_media.id}"]`,
		);

		$(".js-media-sublist").flickity("destroy");

		if (!newMediaSub) return;

		const parentSub = newMediaSub.parentElement;

		parentSub.prepend(newMediaSub);

		window.setTimeout(() => {
			parentSub.scroll(0, 0);
		});

		$(".js-media-sublist").flickity({
			asNavFor: ".product__media-list",
			contain: true,
			pageDots: false,
			prevNextButtons: false,
		});
	}

	updateURL() {
		if (!this.classList.contains("variant-selects--quick-view")) {
			if (!this.currentVariant) return;
			window.history.replaceState(
				{},
				"",
				`${this.dataset.url}?variant=${this.currentVariant.id}`,
			);
		}
	}

	updateVariantInput() {
		const productForms = document.querySelectorAll(
			`#product-form-${this.dataset.section}, #product-form-installment`,
		);
		productForms.forEach((productForm) => {
			const input = productForm.querySelector('input[name="id"]');
			input.value = this.currentVariant.id;
			input.dispatchEvent(new Event("change", { bubbles: true }));
		});
	}

	updateVariantStatuses() {
		const selectedOptionOneVariants = this.variantData.filter(
			(variant) => this.querySelector(":checked").value === variant.option1,
		);
		const inputWrappers = [...this.querySelectorAll(".product-form__wrapper")];
		inputWrappers.forEach((option, index) => {
			if (index === 0) return;
			const optionInputs = [
				...option.querySelectorAll('input[type="radio"], option'),
			];
			const previousOptionSelected =
				inputWrappers[index - 1].querySelector(":checked").value;
			const availableOptionInputsValue = selectedOptionOneVariants
				.filter(
					(variant) =>
						variant.available &&
						variant[`option${index}`] === previousOptionSelected,
				)
				.map((variantOption) => variantOption[`option${index + 1}`]);
			this.setInputAvailability(optionInputs, availableOptionInputsValue);
		});
	}

	setInputAvailability(listOfOptions, listOfAvailableOptions) {
		listOfOptions.forEach((input) => {
			if (listOfAvailableOptions.includes(input.getAttribute("value"))) {
				if (input.tagName === 'OPTION') {
					input.innerText = input.getAttribute("value");
				} else if (input.tagName === 'INPUT') {
					input.classList.remove("disabled");
				}
			} else {
				if (input.tagName === 'OPTION') {
					input.innerText = window.variantStrings.unavailable_with_option.replace(
						"[value]",
						input.getAttribute("value"),
					);
				} else if (input.tagName === 'INPUT') {
					input.classList.add("disabled");
				}
			}
		});
	}

	updatePickupAvailability() {
		const pickUpAvailability = document.querySelector('pickup-availability');
		if (!pickUpAvailability) return;

		if (this.currentVariant && this.currentVariant.available) {
			pickUpAvailability.fetchAvailability(this.currentVariant.id);
		} else {
			pickUpAvailability.removeAttribute('available');
			pickUpAvailability.innerHTML = '';
		}
	}

	renderProductInfo() {
		const requestedVariantId = this.currentVariant.id;
		const sectionId = this.dataset.originalSection ? this.dataset.originalSection : this.dataset.section;

		fetch(`${this.dataset.url}?variant=${this.currentVariant.id}&section_id=${this.dataset.originalSection ? this.dataset.originalSection : this.dataset.section}`)
			.then((response) => response.text())
			.then((responseText) => {
				if (this.currentVariant.id !== requestedVariantId) return;

				const html = new DOMParser().parseFromString(responseText, 'text/html')
				const destination = document.getElementById(`price-${this.dataset.section}`);
				const source = html.getElementById(`price-${this.dataset.originalSection ? this.dataset.originalSection : this.dataset.section}`);
				const skuSource = html.getElementById(`Sku-${this.dataset.originalSection ? this.dataset.originalSection : this.dataset.section}`);
				const skuDestination = document.getElementById(`Sku-${this.dataset.section}`);
				const inventorySource = html.getElementById(`Inventory-${this.dataset.originalSection ? this.dataset.originalSection : this.dataset.section}`);
				const inventoryDestination = document.getElementById(`Inventory-${this.dataset.section}`);

				if (source && destination) destination.innerHTML = source.innerHTML;
				if (inventorySource && inventoryDestination) inventoryDestination.innerHTML = inventorySource.innerHTML;
				if (skuSource && skuDestination) {
					skuDestination.innerHTML = skuSource.innerHTML;
					skuDestination.classList.toggle('visibility-hidden', skuSource.classList.contains('visibility-hidden'));
				}

				const price = document.getElementById(`price-${this.dataset.section}`);

				if (price) price.classList.remove('visibility-hidden');

				if (inventoryDestination) inventoryDestination.classList.toggle('visibility-hidden', inventorySource.innerText === '');

				const addButtonUpdated = html.getElementById(`ProductSubmitButton-${sectionId}`);
				this.toggleAddButton(addButtonUpdated ? addButtonUpdated.hasAttribute('disabled') : true, window.variantStrings.soldOut);
			});
	}

	toggleAddButton(disable = true, text, modifyClass = true) {
		const productForm = document.getElementById(`product-form-${this.dataset.section}`);
		if (!productForm) return;
		const addButton = productForm.querySelector('[name="add"]');
		if (!addButton) return;

		if (disable) {
			addButton.setAttribute('disabled', 'disabled');
			if (text) addButton.textContent = text;
		} else {
			addButton.removeAttribute('disabled');
			addButton.textContent = window.variantStrings.addToCart;
		}

		if (!modifyClass) return;
	}

	setUnavailable() {
		const button = document.getElementById(`product-form-${this.dataset.section}`);
		const addButton = button.querySelector('[name="add"]');
		const price = document.getElementById(`price-${this.dataset.section}`);
		const inventory = document.getElementById(`Inventory-${this.dataset.section}`);
		const sku = document.getElementById(`Sku-${this.dataset.section}`);
		if (!addButton) return;
		addButton.textContent = window.variantStrings.unavailable;
		document.getElementById(`price-${this.dataset.section}`)?.classList.add("visibility-hidden");
		if (price) price.classList.add('visibility-hidden');
		if (inventory) inventory.classList.add("visibility-hidden");
		if (sku) sku.classList.add('visibility-hidden');
	}

	getVariantData() {
		this.variantData =
			this.variantData ||
			JSON.parse(this.querySelector('[type="application/json"]').textContent);
		return this.variantData;
	}
}

customElements.define("variant-selects", VariantSelects);

class VariantRadios extends VariantSelects {
	constructor() {
		super();
	}

	setInputAvailability(listOfOptions, listOfAvailableOptions) {
		listOfOptions.forEach((input) => {
			if (listOfAvailableOptions.includes(input.getAttribute("value"))) {
				input.classList.remove("disabled");
			} else {
				input.classList.add("disabled");
			}
		});
	}

	updateOptions() {
		const fieldsets = Array.from(this.querySelectorAll("fieldset"));
		this.options = fieldsets.map((fieldset) => {
			return Array.from(fieldset.querySelectorAll("input")).find(
				(radio) => radio.checked,
			).value;
		});
	}
}

customElements.define("variant-radios", VariantRadios);

function initModal(cl) {
	const options = {
		touch: false,
		scrolling: "no",
		wrapCSS: cl ? cl : "",
		closeClick: false,
		openEffect: "none",
		closeEffect: "none",
		tpl: {
			closeBtn:
				'<a href="#" class="modal-close-button fancybox-close-button" onclick="$.fancybox.close()"><svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" role="presentation" class="icon icon-close" fill="none" viewBox="0 0 14 14">\n' +
				'<rect y="12.728" width="18" height="1.5" transform="rotate(-45 0 12.728)" fill="currentColor"/>\n' +
				'<rect x="1.06055" width="18" height="1.5" transform="rotate(45 1.06055 0)" fill="currentColor"/>\n' +
				"</svg></a>",
		},
		beforeShow: function () {
			$("body").css({ "overflow-y": "hidden" });
		},
		afterClose: function () {
			$("body").css({ "overflow-y": "visible" });
		},
	};

	$(".modal").fancybox(options);
}

window.onload = function () {
	const coolimageScript = document.querySelectorAll(
		'script[src*="cool-image-magnifier"]',
	);
	let coolimageGallery = document.querySelector(".product__media-wrapper");

	if (coolimageScript.length > 0 && coolimageGallery) {
		coolimageGallery.classList.add("cool-image-custom");
	}
};
