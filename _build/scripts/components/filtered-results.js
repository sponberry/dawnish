import { updateCanonicalLinks, getJsonData } from "../theme/helpers";
// import { addVehicleAttributesToCart } from './add-vehicle-to-cart';

const themeName = theme.template.indexOf('.') > 0 ? theme.template.split('.')[0] : theme.template;
const sectionName = theme.template.indexOf('.') > 0 ? theme.template.split('.').join('-') : theme.template;

const selectors = {
  collectionBreadcrumbs: `[data-${themeName}-breadcrumbs]`,
  collectionImage: `[data-${themeName}-image]`,
  collectionTitle: `[data-${themeName}-title]`,
  collectionCount: `[data-${themeName}-count]`,
  collectionDescription: `[data-${themeName}-description]`,
  collectionView: `[data-${themeName}-view]`,
  collectionSort: `[data-${themeName}-sort]`,
  collectionProducts: `[data-${themeName}-products]`,
  collectionEmpty: `[data-${themeName}-empty]`,
  collectionEmptyBack: `[data-${themeName}-empty-back]`,
  collectionEmptyClear: `[data-${themeName}-empty-clear]`,
  collectionScrollTarget: `[data-${themeName}-scroll-target]`,
  collectionPagination: `[data-${themeName}-pagination]`,
  collectionPaginationLess: `[data-${themeName}-pagination-less]`,
  collectionPaginationLessBtn: `[data-${themeName}-pagination-less-btn]`,
  collectionPaginationMore: `[data-${themeName}-pagination-more]`,
  collectionPaginationMoreBtn: `[data-${themeName}-pagination-more-btn]`,
  collectionEmptyBack: `[data-${themeName}-empty-back]`,
  filtersToggle: `[data-${themeName}-filters-toggle]`,
  filters: `[data-${themeName}-filters]`,
  filtersClear: `[data-clear-filter-link]`,
  filtersApply: `[data-${themeName}-filters-apply]`,
  filtersCategory: `[data-${themeName}-filters-category]`,
  filtersCategoryToggle: `[data-${themeName}-filters-category-toggle]`,
  filtersCategoryContent: `[data-${themeName}-filters-category-content]`,
  filtersLink: `[data-${themeName}-filters-link]`,
  storefrontFiltersForm: '[data-storefront-filter-form]',
  activeFiltersContainer: '.active-filters',
  priceRangeSlider: "[data-price-range-slider]",
  minValueInput: "[data-min-value-input]",
  maxValueInput: "[data-max-value-input]",
  resultsContainer: "#results-container",
  storefrontFiltersForm: "[data-storefront-filter-form]",
  filtersOpen: `[data-${themeName}-filters-open]`,
  filtersClose: `[data-${themeName}-filters-close]`,
  filtersOverlay: "[data-filters-overlay]",
  noJsLink: "#no-js-link-text",
  jsonLd: '[type="application/ld+json"]',
  canonicalLink: '[rel="canonical"]',
  productItem: '.snippet-product-item',
  contentToggles: '[data-filters-content-toggle]',
  rearTab: '#Filter-rear-match-tab',
  frontTab: '#Filter-front-match-tab',
  triplePackCount: "#triple-pack-count-container",
  twinPackCount: "#twin-pack-count-container",
  rearPackCount: "#rear-pack-count-container",
  frontPackCount: "#front-pack-count-container",
};

const classes = {
  active: "is-active",
  disabled: "is-disabled",
  loading: "is-loading",
  visible: "is-visible",
  grid: "is-grid",
  list: "is-list",
};

const initFilters = {
  onFiltersInit(container, additionalSectionsArray) {
    this.initElements();
    this.sectionsToRender = additionalSectionsArray ? [sectionName, ...additionalSectionsArray] : [sectionName];
    this.template = themeName;
    if (theme.enableInfiniteResults) {
      this.resultsPageSectionName = "collection-results";
    }

    // Props
    this.props = {};
    this.props.isAjax = container.hasAttribute(`data-${themeName}-ajax`) ? true : false;
    this.props.sortbyParam = "sort_by";
    this.props.pageParam = "page";
    this.props.mql = window.matchMedia(`(min-width: ${window.theme.breakpoints.lg}px)`);

    // State
    this.state = {};
    this.state.isFetching = false;
    this.state.lastClicked = null;
    this.togglesArray = [];

    this.props.mql.addListener((event) => {
      return this.filterCategoryVisiblity();
    });

    this.applyDefaultFilters();

    // Init
    if (!this.props.isAjax) {
      this.initNoAjax();
    } else {
      this.initAjax(false, this.lastButtonClicked);
      this.closeFilters();
    }

    // Ensure back button reloads results
    window.onpopstate = function(e) {
      window.location.href = window.location.href;
    };
  },

  async applyDefaultFilters() {
    // Default pack type
    const vrmRedirect = sessionStorage.getItem("collectionRedirect") ? true : false;

    if (vrmRedirect && window.location.href.indexOf('?') === -1) {
      this.lastButtonClicked = 'bgFilterApplied';
      const bgFilterSuccessful = await this.getCollectionResults(`${window.location.href}?${theme.bgFilter}`, true, true, this.lastButtonClicked);
      if (bgFilterSuccessful === false) await this.getCollectionResults(`${window.location.href}?${theme.bgFilterFallback}`, true, true, this.lastButtonClicked);
      this.setLoaded();
    } else {
      this.setLoaded();
    };
  },

  initElements() {
    this.elements = {};
    this.elements.collectionDescriptionToggle = document.querySelector(selectors.collectionDescriptionToggle) || null;
    this.elements.collectionDescriptionExtraText = document.querySelector(selectors.collectionDescriptionExtraText) || null;
    this.elements.collectionView = document.querySelector(selectors.collectionView) || null;
    this.elements.collectionSort = document.querySelector(selectors.collectionSort) || null;
    this.elements.collectionProducts = document.querySelector(selectors.collectionProducts) || null;
    this.elements.filters = document.querySelector(selectors.filters) || null;
    this.elements.filtersCategories = document.querySelectorAll(selectors.filtersCategory);
    this.elements.filtersCategoryToggles = document.querySelectorAll(selectors.filtersCategoryToggle);
    this.elements.filtersLinks = document.querySelectorAll(selectors.filtersLink);
    this.elements.filtersClear = document.querySelectorAll(selectors.filtersClear) || null;
    this.elements.filtersApply = document.querySelector(selectors.filtersApply) || null;
    this.elements.filtersOverlay = document.querySelector(selectors.filtersOverlay) || null;
    this.elements.filtersClose = document.querySelector(selectors.filtersClose) || null;
    this.elements.resultsContainer = document.querySelector(selectors.resultsContainer) || null;
    this.elements.storefrontFiltersForm = document.querySelector(selectors.storefrontFiltersForm) || null;
    this.elements.priceRangeSliders = document.querySelectorAll(selectors.priceRangeSlider) || null;
    this.elements.minValueInput = document.querySelector(selectors.minValueInput) || null;
    this.elements.maxValueInput = document.querySelector(selectors.maxValueInput) || null;
    this.elements.collectionDescription = document.querySelector(selectors.collectionDescription) || null;
    this.elements.collectionPagination = document.querySelector(selectors.collectionPagination) || null;
    this.elements.filtersOpen = document.querySelector(selectors.filtersOpen) || null;
    this.elements.filtersClose = document.querySelector(selectors.filtersClose) || null;
    this.elements.filtersOverlay = document.querySelector(selectors.filtersOverlay) || null;
    this.backBtn = document.querySelector(selectors.collectionEmptyBack);
    this.elements.productItems = document.querySelectorAll(selectors.productItem);
    if (theme.enableInfiniteResults) {
      this.elements.collectionPaginationLess = document.querySelector(selectors.collectionPaginationLess) || null;
      this.elements.collectionPaginationLessBtn = document.querySelector(selectors.collectionPaginationLessBtn) || null;
      this.elements.collectionPaginationMore = document.querySelector(selectors.collectionPaginationMore) || null;
      this.elements.collectionPaginationMoreBtn = document.querySelector(selectors.collectionPaginationMoreBtn) || null;
    }
    this.elements.contentToggles = document.querySelectorAll(selectors.contentToggles);
  },

  initNoAjax() {
    this.initFilters();
    this.initSort();
    this.filterCategoryVisiblity();

    this.priceRangeInit();

    if (this.backBtn) this.backBtn.addEventListener("click", this.onClickEmptyBack.bind(this));
  },

  priceRangeInit() {
    // Price range sliders update inputs
    if (this.elements.priceRangeSliders.length > 0) {
      this.elements.priceRangeSliders.forEach((rangeSlider) => {
        rangeSlider.addEventListener('change', (e) => {
          e.preventDefault();
          if (e.target.dataset.priceRangeSlider === 'min') {
            const minValue = Number(e.target.value).toFixed(2);
            this.elements.minValueInput.value = minValue;
            const event = new Event('change');
            this.elements.minValueInput.dispatchEvent(event);
          } else {
            const maxValue = Number(e.target.value).toFixed(2);
            this.elements.maxValueInput.value = maxValue;
            const event = new Event('change');
            this.elements.maxValueInput.dispatchEvent(event);
          }
        });
      });
    }

    // Price range inputs trigger AJAX
    if (this.elements.maxValueInput && this.elements.minValueInput) {
      const priceRangeInputs = [this.elements.maxValueInput, this.elements.minValueInput];

      priceRangeInputs.forEach((inputs) => {
        inputs.addEventListener('change', (e) => {
          e.preventDefault();
          let url = window.location.href;

          if (url.includes(e.target.name)) {
            const [urlFirstPart, urlSecondPart] = url.split(`${e.target.name}=`);
            let oldValue = urlSecondPart;
            if (urlSecondPart.includes('&')) {
              oldValue = urlSecondPart.substring(0, urlSecondPart.indexOf('&'));
            }
            url = url.replace(oldValue, e.target.value);
          } else {
            if (url.includes('?')) {
              if (url.endsWith('?')) {
                url += `${e.target.name}=${e.target.value}`;
              } else {
                url += `&${e.target.name}=${e.target.value}`;
              }
            } else {
              url += `?${e.target.name}=${e.target.value}`;
            }
          }

          console.log(url);
          if (this.props.isAjax) {
            this.getCollectionResults(url);
          } else {
            window.location.href = url;
          }
        });
      });
    }
  },

  initAjax(reinitialise = false, lastButtonClicked = false) {
    this.initElements();
    this.initFilters();
    this.filterCategoryVisiblity(lastButtonClicked);
    this.initAjaxLinks();
    this.initAjaxClear();
    this.initAjaxSort();
    this.initAjaxPagination();
    this.initFilterTabs();
    // addVehicleAttributesToCart();
    if (reinitialise && theme.quickCart) new theme.quickCart.constructor();
    if (reinitialise && window.theme.productItemController) window.theme.productItemController.initialiseAccordions();
    if (this.backBtn) this.backBtn.addEventListener("click", this.onClickEmptyBack.bind(this));
  },

  setState(key, value) {
    if (typeof key !== "undefined" && this.state.hasOwnProperty(key) && typeof value !== "undefined") {
      console.log("Updating State:", {
        key,
        value,
      });
      this.state[key] = value;
      console.log("Updated State:", this.state);
    }
    return this.state;
  },

  async initMatchStringTab(matchStrings, selector, countSelector, collectionHandle) {
    const filters = matchStrings.map(matchString => `filter.p.m.custom.match_string=${matchString}`);
    const tabUrl = window.location.href.split('?')[0] + '?' + filters.join('&');
    const tabNode = document.querySelector(selector);
    tabNode.setAttribute('href', tabUrl);
    tabNode.removeAttribute('disabled');
    tabNode.removeAttribute('hidden');

    const tabbedResults = await getJsonData(`${collectionHandle}?view=product-count&${filters.join('&')}`);
    const countText = tabNode.querySelector(countSelector);
    if (tabbedResults && tabbedResults.productCount) {
      countText.innerText = `${tabbedResults.productCount} Available`;
    } else {
      countText.innerText = `Products Available`;
    }
  },

  async initFilterTabs() {
    const collectionHandle = sessionStorage.getItem('collectionHandle');
    if (!collectionHandle) return;

    // Pack Type Tabs
    const rearMatchStrings = sessionStorage.getItem('rearMatchStrings')?.split('|');
    const frontMatchStrings = sessionStorage.getItem('frontMatchStrings')?.split('|');

    if (rearMatchStrings) this.initMatchStringTab(rearMatchStrings, selectors.rearTab, selectors.rearPackCount, collectionHandle);
    if (frontMatchStrings) this.initMatchStringTab(frontMatchStrings, selectors.frontTab, selectors.frontPackCount, collectionHandle);

    const filterTabCounts = await getJsonData(`${collectionHandle}?view=pack-size`);
    console.log(filterTabCounts);
    if (filterTabCounts && filterTabCounts.tripleCount) {
      const tripleTabCountText = document.querySelector(selectors.triplePackCount);
      if (tripleTabCountText) tripleTabCountText.innerText = `${filterTabCounts.tripleCount} Available`
    }
    if (filterTabCounts && filterTabCounts.twinCount) {
      const twinTabCountText = document.querySelector(selectors.twinPackCount);
      if (twinTabCountText) twinTabCountText.innerText = `${filterTabCounts.twinCount} Available`
    }
  },

  initSort() {
    if (this.elements.collectionSort) {
      this.elements.collectionSort.addEventListener("change", this.onSort.bind(this));
    }
  },

  onSort(event) {
    this.lastButtonClicked = 'sort';
    // Grab the current query params
    let sortElement = event.currentTarget,
      queryParams = new URLSearchParams(location.search);

    // Grab the selected option
    let selected = sortElement.options[sortElement.selectedIndex];

    // Update the query params and trigger a page reload
    queryParams.set("sort_by", selected.value);
    window.location.search = queryParams;
  },

  initFilters() {
    if (!this.elements.filters) return;

    if (this.elements.filtersOpen) {
      this.elements.filtersOpen.addEventListener("click", this.onClickFiltersOpen.bind(this));
    }

    if (this.elements.filtersCategoryToggles.length) {
      this.elements.filtersCategoryToggles.forEach((filtersCategoryToggle) => {
        if (this.togglesArray.includes(filtersCategoryToggle.id)) return;
        filtersCategoryToggle.addEventListener("click", this.onClickFiltersCategoryToggle.bind(this));
        this.togglesArray = [ ...this.togglesArray, filtersCategoryToggle.id ];
      });
    }

    if (this.elements.storefrontFiltersForm) {
      const filterCheckboxes = this.elements.storefrontFiltersForm.querySelectorAll("input");

      filterCheckboxes.forEach((input) => {
        if (input.type === "checkbox") input.removeAttribute("disabled");
        if (!this.props.isAjax) {
          input.addEventListener("change", (e) => {
            localStorage.setItem("prevUrl", window.location.href);
            this.elements.storefrontFiltersForm.submit();
          });
        }
      });

      const noJsLinks = this.elements.storefrontFiltersForm.querySelectorAll(selectors.noJsLink);

      noJsLinks.forEach((linkText) => {
        linkText.remove();
      });
    }

    if (this.props.isAjax === true) {
      if (this.elements.filtersApply) {
        this.elements.filtersApply.addEventListener("click", this.onClickFiltersApply.bind(this));
      }

      if (this.elements.filtersClose) {
        this.elements.filtersClose.addEventListener("click", this.onClickFiltersClose.bind(this));
      }

      if (this.elements.contentToggles) {
        this.elements.contentToggles.forEach((contentToggle) => {
          contentToggle.addEventListener("click", this.onClickContentToggle.bind(this));
        }); 
      }
    }
  },

  initFiltersOpen() {
    if (!this.elements.filtersOpen) return;
    if (!this.elements.filters) return;

    this.elements.filtersOpen.addEventListener("click", this.onClickFiltersOpen.bind(this));
  },

  initFiltersAccordions() {
    if (!this.elements.filters) return;

    if (this.elements.filtersCategoryToggles.length) {
      this.elements.filtersCategoryToggles.forEach((filtersCategoryToggle) => {
        filtersCategoryToggle.addEventListener("click", this.onClickFiltersCategoryToggle.bind(this));
      });
    }
  },

  onClickFiltersOpen(event) {
    event.preventDefault();

    if (!this.elements.filters.classList.contains(classes.visible)) {
      return this.openFilters();
    }
  },

  onClickFiltersCategoryToggle(event) {
    event.preventDefault();

    const filtersCategory = event.target.closest(".category");
    const filtersCategoryToggle = filtersCategory.firstElementChild;

    if (!filtersCategory.classList.contains(classes.active)) {
      filtersCategoryToggle.setAttribute("aria-expanded", true);
    } else {
      filtersCategoryToggle.setAttribute("aria-expanded", false);
    }
    filtersCategory.classList.toggle(classes.active);
  },

  onClickContentToggle(event) {
    event.preventDefault();

    const relatedList = document.querySelector(`[aria-label="${event.target.dataset.filtersContentToggle}"]`);

    if (event.target.classList.contains(classes.active)) {
      relatedList.classList.remove(classes.active);
      event.target.classList.remove(classes.active);
    } else {
      relatedList.classList.add(classes.active);
      event.target.classList.add(classes.active);
    }
    
  },

  onClickFiltersApply(event) {
    event.preventDefault();

    return this.closeFilters();
  },

  onClickFiltersClose(event) {
    event.preventDefault();

    if (this.elements.filters.classList.contains(classes.visible)) {
      return this.closeFilters();
    }
  },

  openFilters() {
    this.lastButtonClicked = "filter";
    if (this.elements.filters) {
      this.elements.filters.classList.add(classes.visible);
      this.elements.filtersOverlay.classList.add(classes.active);
    }
    
  },

  closeFilters() {
    this.lastButtonClicked = "filter";
    if (this.elements.filters) {
      this.elements.filters.classList.remove(classes.visible);
      this.elements.filtersOverlay.classList.remove(classes.active);
    }
  },

  filterCategoryVisiblity(lastButtonClicked = false) {
    if (this.props.mql.matches) {
      this.elements.filtersCategoryToggles.forEach((filtersCategoryToggle) => {
        filtersCategoryToggle.setAttribute(`aria-expanded`, true);
        filtersCategoryToggle.parentNode.classList.add(classes.active);
      });
    } else {
      console.log('LAST BUTTON CLICKED:', this.lastButtonClicked);
      // This one is in for the Search page, the condition further into the function checking for sort does the logic for collection pages
      if (this.lastButtonClicked == 'sort') {
        this.elements.filtersOverlay.classList.remove(classes.active);
      } 

      this.elements.filtersCategoryToggles.forEach((filtersCategoryToggle) => {
        filtersCategoryToggle.setAttribute(`aria-expanded`, false);
        filtersCategoryToggle.parentNode.classList.remove(classes.active);

        const filterInputs = filtersCategoryToggle.nextElementSibling.querySelectorAll("input");

        filterInputs.forEach((input) => {
          if (((input.dataset.minValueInput == "" || input.dataset.maxValueInput == "") && input.value) || (input.type == "checkbox" && input.checked)) {
            filtersCategoryToggle.setAttribute(`aria-expanded`, true);
            filtersCategoryToggle.parentNode.classList.add(classes.active);

            if (this.lastButtonClicked != "pagination" && this.lastButtonClicked != "tab" && this.lastButtonClicked != "rear_tab" && this.lastButtonClicked != "front_tab" && lastButtonClicked != 'bgFilterApplied' && this.lastButtonClicked != "sort") {
              this.openFilters();
            } else {
              this.elements.filtersOverlay.classList.remove(classes.active);
            }
          } else if (this.lastButtonClicked == "clear" || this.lastButtonClicked == "pagination" || this.lastButtonClicked == "tab" || this.lastButtonClicked == "rear_tab" || this.lastButtonClicked == "front_tab") {
            this.elements.filtersOverlay.classList.remove(classes.active);
          }
        });
      });
    }
  },

  pushState(url, props = {}) {
    if (!url) return;
    if (url == "") return;
    window.history.pushState(props, null, url);
  },

  initAjaxLinks() {
    if (this.elements.filtersLinks && this.elements.filtersLinks.length) {
      this.elements.filtersLinks.forEach((link) => {
        link.addEventListener("click", this.onClickAjaxLink.bind(this));
      });
    }

    if (!this.elements.storefrontFiltersForm) return;

    // All storefront list filters
    const filterCheckboxes = this.elements.storefrontFiltersForm.querySelectorAll("input");

    filterCheckboxes.forEach((input) => {
      if (input.type === "checkbox") input.addEventListener("change", this.onSelectAjaxFilter.bind(this));
    });

    // Storefront filters form for mobile & price range on desktop
    this.elements.storefrontFiltersForm.addEventListener("submit", this.onSelectAjaxFilter.bind(this));

    this.priceRangeInit();

    window.theme.productItemController.toggleProductItems();
  },

  async onSelectAjaxFilter(event) {
    event.preventDefault();
    const form = event.target.type === "checkbox" ? null : event.target;

    if (form) {
      // submit buttons appear only on mobile and for price range
      const collectionHandle = document.querySelector("#collection-handle").innerHTML;
      const sectionLoadPath = `/collections/${collectionHandle}/?`;

      let url = sectionLoadPath;
      const formData = new FormData(form);
      for (var pair of formData.entries()) {
        const filterParamName = pair[0];
        const filterValue = pair[1];
        if (filterValue.length > 0) {
          url += `${filterParamName}=${filterValue}&`;
        }
      }
      console.log(url);
      await this.getCollectionResults(url);

      this.closeFilters();
    } else {
      const btn = event.currentTarget,
        url = btn.hasAttribute("data-url") ? btn.getAttribute("data-url") : null;

      (btn.hasAttribute("checked")) ? this.lastButtonClicked = "clear" : null
      console.log("AJAX Link:", url);

      this.setState("lastClicked", btn);

      await this.getCollectionResults(url);
    };
    sessionStorage.removeItem("collectionRedirect");
  },

  async onClickAjaxLink(event) {
    event.preventDefault();

    const btn = event.currentTarget,
      url = btn.hasAttribute("href") ? btn.getAttribute("href") : null,
      isActive = btn.parentNode.classList.contains(classes.active);

    console.log("AJAX Link:", url);

    this.setState("lastClicked", btn);
    if (btn.hasAttribute("data-filter-tab")) this.lastButtonClicked = "tab";
    if (btn.id === selectors.rearTab.replace('#', '')) this.lastButtonClicked = "rear_tab"
    if (btn.id === selectors.frontTab.replace('#', '')) this.lastButtonClicked = "front_tab"

    await this.getCollectionResults(url);
    if (isActive) {
      btn.parentNode.classList.remove(classes.active);
      btn.blur();
    };
    sessionStorage.removeItem("collectionRedirect");
  },

  initAjaxClear() {
    const filtersClear = document.querySelectorAll(selectors.filtersClear);
    if (!filtersClear.length > 0) return;

    filtersClear.forEach((link) => {
      link.addEventListener("click", this.onClickAjaxClear.bind(this));
    });
  },

  async onClickAjaxClear(event) {
    event.preventDefault();
    const btn = event.currentTarget;
    const url = btn.hasAttribute("href") ? btn.getAttribute("href") : null;

    this.lastButtonClicked = "clear";
    console.log("AJAX Clear:", url);

    await this.getCollectionResults(url);
  },

  initAjaxSort() {
    if (!this.elements.collectionSort) return;

    this.onChangeAjaxSort = this.onChangeAjaxSort.bind(this);
    this.elements.collectionSort.addEventListener("change", this.onChangeAjaxSort);
  },

  async onChangeAjaxSort(event) {
    this.lastButtonClicked = 'sort';
    let sortElement = event.currentTarget,
      queryParams = new URLSearchParams(window.location.search),
      selectedOption = sortElement.options[sortElement.selectedIndex],
      newSortbyValue = selectedOption.value || "manual";

    queryParams.set(this.props.sortbyParam, newSortbyValue);
    queryParams.set(this.props.pageParam, 1);

    const url = `${location.pathname}?${queryParams}`;

    await this.getCollectionResults(url);

    //uncomment below if sort by is included outside of filters menu
    //this.closeFilters();
  },

  initAjaxPagination() {
    if (this.elements.collectionPagination) {
      let paginationLinks = [...this.elements.collectionPagination.querySelectorAll("a")];
      paginationLinks.forEach((paginationLink) => {
        paginationLink.addEventListener("click", this.onClickAjaxPagination.bind(this));
      });
    }

    if (theme.enableInfiniteResults) {
      if (this.elements.collectionPaginationLessBtn) {
        this.elements.collectionPaginationLessBtn.addEventListener("click", this.onClickAjaxPaginationDirection.bind(this));
      }
      if (this.elements.collectionPaginationMoreBtn) {
        this.elements.collectionPaginationMoreBtn.addEventListener("click", this.onClickAjaxPaginationDirection.bind(this));
      }
    }
  },

  async onClickAjaxPagination(event) {
    event.preventDefault();

    this.lastButtonClicked = "pagination";

    const btn = event.currentTarget,
      url = btn.hasAttribute("href") ? btn.getAttribute("href") : null;

    const response = await this.getCollectionResults(url);

    const resultsContainer = document.getElementById('results-container');
    if (resultsContainer) {
      const y = (resultsContainer.getBoundingClientRect().top + window.scrollY) - 150;
      window.scroll({
        top: y,
        behavior: 'smooth'
      });
    };

    console.log("Response: ", response);
  },

  async onClickAjaxPaginationDirection(event) {
    event.preventDefault();

    this.lastButtonClicked = "pagination";

    const isMoreButton = event.target.dataset.collectionPaginationMoreBtn === undefined ? event.target.dataset.searchPaginationMoreBtn === undefined ? false : true : true; // checking for both search and collection buttons as datasets will be different
    const direction = isMoreButton ? "next" : "previous";

    const btn = event.target,
      btnUrl = btn.hasAttribute("href") ? btn.getAttribute("href") : null,
      urlArray = btnUrl.split("?"),
      url = `?${urlArray[urlArray.length - 1]}`;

    const response = await this.getCollectionResultsPage(url, direction);

    console.log("Response: ", response);
  },

  validateUrlParameter(url) {
    if (!url) throw new Error("The `url` parameter is required to render new section.");
    if (url === "" || url === "#") throw new Error("The `url` parameter must not be an empty string or hash.");
    // if error not thrown returns true
    return true;
  },

  async getCollectionResults(url, disableHistory=false, checkResults=false, lastButtonClicked=false) {
    if (!this.validateUrlParameter(url)) return;

    // Before the request
    this.setState("isFetching", true);
    this.setLoading();

    const urlParam = url.indexOf("?") === -1 ? `${url}?sections=${this.sectionsToRender.join(",")}` : `${url}&sections=${this.sectionsToRender.join(",")}`;
    let shopifyResponse = await fetch(urlParam, {
      method: "get",
      headers: {
        Accept: "application/json, text/plain, */*",
        "Content-Type": "application/json",
      },
    });
    const ShopifyJsonData = await shopifyResponse.json();

    console.log("shopifyResponse", shopifyResponse);


    // update all sections
    let success = true;
    this.sectionsToRender.forEach((sectionName) => {
      if (checkResults && ShopifyJsonData[sectionName].indexOf('data-collection-empty') !== -1) {
        success = false;
        return false;
      };
      this.updateSection(`.section-${sectionName}`, ShopifyJsonData[sectionName]);
    });
    if (!success) return false;

    if (this.template === "collection") {
      updateCanonicalLinks(url);
    }

    this.initAjax(true, lastButtonClicked);
    this.setLoaded();

    const collectionSection = document.querySelector("[data-page-title]");
    if (collectionSection) document.title = collectionSection.dataset.pageTitle;

    // Product Reviews - uncommment if used in theme
    //ProductReviews();

    // Update history
    if (!disableHistory) {
      this.pushState(url, {
        prevUrl: window.location.href,
      });
    };
    this.updateRelHeadTags(url);

    return true;
  },

  async getCollectionResultsPage(url, direction) {
    if (!this.validateUrlParameter(url)) return;

    // Before the request
    this.setState("isFetching", true);
    this.setLoading();

    //document.querySelector(`.section-${this.resultsPageSectionName}`)
    const urlParam = url.indexOf("?") === -1 ? `${url}?sections=${this.resultsPageSectionName}&paginateby=${theme.paginateValue}` : `${url}&sections=${this.resultsPageSectionName}&paginateby=${theme.paginateValue}`;
    let shopifyResponse = await fetch(urlParam, {
      method: "get",
      headers: {
        Accept: "application/json, text/plain, */*",
        "Content-Type": "application/json",
      },
    });
    const ShopifyJsonData = await shopifyResponse.json();

    console.log("shopifyResponse", shopifyResponse);

    const resultsPageFull = ShopifyJsonData[this.resultsPageSectionName].replace(`<section id="shopify-section-${this.resultsPageSectionName}" class="shopify-section">`, "").replace("</section>", "");
    const resultsPageElements = resultsPageFull.split("<div hidden data-split></div>");

    let resultsPage = resultsPageElements.length === 1 ? resultsPageElements[0] : null;
    let paginationLessElement = null;
    let paginatioMoreElement = null;

    if (!resultsPage) {
      if (resultsPageElements.length === 3) {
        paginationLessElement = resultsPageElements[0];
        resultsPage = resultsPageElements[1];
        paginatioMoreElement = resultsPageElements[2];
        this.updateRelHeadTags(url);
      } else if (resultsPageElements[0].includes(`data-${themeName}-pagination-less`)) {
        paginationLessElement = resultsPageElements[0];
        resultsPage = resultsPageElements[1];
        this.updateRelHeadTags(url, 'prev');
      } else {
        resultsPage = resultsPageElements[0];
        paginatioMoreElement = resultsPageElements[1];
        this.updateRelHeadTags(url, 'next');
      }
    }

    if (direction === "next") {
      document.querySelector(selectors.collectionPaginationMore).remove();
      this.elements.collectionProducts.innerHTML += resultsPage;
      this.elements.resultsContainer.innerHTML = this.elements.resultsContainer.innerHTML + paginatioMoreElement;
    } else if (direction === "previous") {
      document.querySelector(selectors.collectionPaginationLess).remove();
      this.elements.collectionProducts.innerHTML = resultsPage + this.elements.collectionProducts.innerHTML;
      this.elements.resultsContainer.innerHTML = paginationLessElement + this.elements.resultsContainer.innerHTML;
    }

    this.setState("isFetching", false);
    this.initAjax(true);
    this.setLoaded();

    // Update history
    this.pushState(url, {
      prevUrl: window.location.href,
    });
  },

  updateSection(selector, sectionData) {
    const section = document.querySelector(selector);
    if (section) {
      const allDataElement = document.createElement("div");
      allDataElement.innerHTML = sectionData;
      const sectionHtml = allDataElement.querySelector("[data-section-type]").innerHTML;
      section.innerHTML = sectionHtml;
    } else {
      console.error(`section not found ${selector}`, sectionData);
    }
  },

  updateRelHeadTags(url, tags='all') {
    console.log('tags')
    const pageNumber = url.indexOf('page') === -1 ? null : Number(url.split('page=')[1]);
    if (!pageNumber) return;

    function returnNewUrlValue(pageAddition) {
      return `${url.split('page=')[0]}page=${pageNumber + pageAddition}`
    };

    function createLinkTag(type, url) {
      const newLinkTag = document.createElement('link');
      newLinkTag.setAttribute('rel', type);
      newLinkTag.setAttribute('href', url);
      console.log(newLinkTag);
      return newLinkTag;
    }

    const linkPrevTag = document.querySelector('[rel="prev"]')
    const linkNextTag = document.querySelector('[rel="next"]')

    if (tags === 'all' || tags === 'prev') {
      if (linkPrevTag) {
        linkPrevTag.setAttribute('href', returnNewUrlValue(-1));
      } else {
        document.querySelector('head').appendChild(createLinkTag('prev', returnNewUrlValue(-1)));
      }
      if (tags === 'prev' && linkNextTag) linkNextTag.remove();
    };
    if (tags === 'all' || tags === 'next') {
      if (linkNextTag) {
        linkNextTag.setAttribute('href', returnNewUrlValue(1));
      } else {
        document.querySelector('head').appendChild(createLinkTag('next', returnNewUrlValue(1)));
      }
      if (tags === 'next' && linkPrevTag) linkPrevTag.remove();
    };
  },

  setLoaded() {
    if (this.elements.resultsContainer) {
      this.elements.resultsContainer.classList.remove(classes.loading);
    };
    if (this.lastButtonClicked === "rear_tab") {
      const rearTab = document.querySelector(selectors.rearTab);
      rearTab.classList.add(classes.active);
    };
    if (this.lastButtonClicked === "front_tab") {
      const frontTab = document.querySelector(selectors.frontTab);
      frontTab.classList.add(classes.active);
    };
  },

  setLoading() {
    if (this.elements.resultsContainer) {
      this.elements.resultsContainer.classList.add(classes.loading);
    }
    this.elements.productItems.forEach(item => {
      const buttons = item.querySelectorAll('a');
      buttons.forEach(button => button.setAttribute("disabled", "disabled"));
    })
  },

  onClickEmptyBack(event) {
    event.preventDefault();

    if (this.props.isAjax) {
      window.location.href = document.referrer;
    } else {
      window.location.href = localStorage.getItem("prevUrl");
    }
  },

  onError(ex) {
    console.warn("Collection:", ex);

    // Recover the UI
    this.setState("isFetching", false);
    this.enableUI();
  },
};

export default initFilters;