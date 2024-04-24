import {
  // lockScrolling,
  // unlockScrolling,
  // getCookie,
  // setCookie,
  // getJsonFetchResponse,
  getParamsItem,
  // sendGA4Data,
  // getGADataItem
} from '../theme/helpers';
const uuid = require('uuid');

const themeName = theme.template;

const selectors = {
  collectionDescription: `[data-${themeName}-description]`,
  collectionView: `[data-${themeName}-view]`,
  collectionSort: `[data-${themeName}-sort]`,
  collectionProducts: `[data-${themeName}-products]`,
  collectionPagination: `[data-${themeName}-pagination]`,
  collectionPaginationLessBtn: `[data-${themeName}-pagination-less-btn]`,
  collectionPaginationMoreBtn: `[data-${themeName}-pagination-more-btn]`,
  collectionEmptyBack: `[data-${themeName}-empty-back]`,
  productItem: '.product-list-item',
  skuAttr: 'data-product-sku',
  filtersClear: '[data-clear-filter-link]',
  filtersApply: `[data-${themeName}-filters-apply]`,
  priceRangeSlider: '[data-price-range-slider]',
  minValueInput: '[data-min-value-input]',
  maxValueInput: '[data-max-value-input]',
  storefrontFiltersForm: '[data-storefront-filter-form]',

  filtersOpen: `[data-${themeName}-filters-open]`,
  sizesMenu: `[data-${themeName}-sizes-open]`,
  filtersClose: `[data-${themeName}-filters-close]`,
  filtersOverlay: '[data-filters-overlay]',
  resultsContainer: '[data-results-container]',
  filters: `[data-${themeName}-filters]`,
  filtersCategoryToggle: `[data-${themeName}-filters-category-toggle]`,
  filtersCategoryToggleTemplate: `[data-togglename-filters-category-toggle]`,
  filtersCategoryContent: `[data-${themeName}-filters-category-content]`,
  filtersCategoryContentTemplate: `[data-togglename-filters-category-content]`,
  filtersCategoryColumn: '.filters-categories-column',
  filtersContentColumn: '.filter-content-column',
  activeFiltersList: '.active-filters-list',
  filtersLink: `[id^=filter]`,
  filtersHeader: '[data-filters-header]',
  clearAllLink: '.clear-all-link',
  collectionPaginationLess: `[data-${themeName}-pagination-less]`,
  collectionPaginationMore: `[data-${themeName}-pagination-more]`,
  sortBy: '#sort-by',

  zeroResults: '[data-zero-results]',
  queryInfoAttr: 'data-query-info',
  didYouMeanAttr: 'data-did-you-mean',
  noResultsAttr: 'data-no-results',
  suggestLinkAttr: 'data-suggest-link',
  searchInput: '#search-input',
  collectionUtils: '[data-collection-utils]',
  // siteContainer: "[data-site-container]",
  gorgiasChatContainer: '#gorgias-chat-container',
  searchspringRecsContainer: '#ss-recs-container',

  siteContainer: '.site-container',
};

const classes = {
  active: 'is-active',
  disabled: 'is-disabled',
  loading: 'is-loading',
  visible: 'is-visible',
  grid: 'is-grid',
  list: 'is-list',
  sizeLinkAttr: 'data-size-link',
  loadingSpinner: 'loading-spinner',
  activeFilters: 'has-active-filters',
  empty: 'is-empty',
  hidden: 'is-hidden',
  scrolled: 'is-scrolled',
};

const searchspringEndpoints = {
  root: `https://${theme.siteId}.a.searchspring.io/api/`,
  search: `search/search.json?siteId=${theme.siteId}`,
  suggest: `suggest/query?siteId=${theme.siteId}`,
  autocomplete: `search/autocomplete.json?siteId=${theme.siteId}`,
};

const templateText = {
  value: 'template',
  label: 'Template',
  templateName: 'togglename',
  multiple: 'Multiple',
  variantSizeFilter: 'ss_filter_sizes',
};

function replaceLabels(string, filter) {
  return string
    .replaceAll(templateText.value, filter.field)
    .replace(templateText.label, filter.label)
    .replace(templateText.templateName, themeName);
}

const sectionCollection = {
  onFiltersInit(container) {
    this.initElements();
    this.captureTemplateNodes();
    this.productItemSection = 'product-list-item';
    this.template = themeName;

    // State
    this.state = {};
    this.state.isFetching = false;
    this.state.lastClicked = null;
    this.state.activeFilters = [];

    const hrefParts = window.location.href.indexOf('?') === -1 ? [] : window.location.href.split('?')[1].split('&');
    hrefParts.forEach((urlParam) => {
      if (urlParam.indexOf('filter.') !== -1) {
        const unescapedString = decodeURI(urlParam);
        this.state.activeFilters = [...this.state.activeFilters, unescapedString];
      } else if (urlParam.indexOf('page=') !== -1) {
        this.state.pageNum = urlParam.split('=')[1];
      } else if (urlParam.indexOf('sort') !== -1) {
        this.state.sortBy = urlParam;
      } else if (urlParam.indexOf('q=') !== -1) {
        // it's the query
      } else {
        console.error('Unknown URL param: ', urlParam);
      }
    });
    this.state.pageNum = this.state.pageNum || 0;
    this.state.activeFilterCat = 0;

    // Init
    this.initAjax();
    this.closeFilters();

    // Ensure back button reloads results
    window.onpopstate = function (e) {
      window.location.href = window.location.href;
    };

    // Searchspring filtering
    this.setUserId();
    this.setSessionId();
    this.newResultsPageLoad();

    window.checkProductWishlist();

    const screenWidth = window.innerWidth;
    if (screenWidth < 1024) {
      this.addMobileToolbarScroll(427);
    } else {
      this.addMobileToolbarScroll(655);
    }
  },

  getFiltersFromQueryString(queryString) {
    const unescapedString = decodeURI(queryString);
    const params = queryString.split('&');
    const filters = params.filter((param) => param.indexOf('filter.') !== -1);
    return filters;
  },

  captureTemplateNodes() {
    const button = document.querySelector(selectors.filtersCategoryToggleTemplate);
    if (button) this.templateButton = button.cloneNode(true);
    const content = document.querySelector(selectors.filtersCategoryContentTemplate);
    if (content) this.templateContent = content.cloneNode(true);
  },

  initElements() {
    this.elements = {};
    this.elements.resultsContainer = document.querySelector(selectors.resultsContainer) || null;
    this.elements.filters = document.querySelector(selectors.filters) || null;
    this.elements.filtersCategoryToggles = document.querySelectorAll(selectors.filtersCategoryToggle);
    this.elements.filtersCategoryContents = document.querySelectorAll(selectors.filtersCategoryContent);
    this.elements.filtersCategoryColumn = document.querySelector(selectors.filtersCategoryColumn);
    this.elements.filtersContentColumn = document.querySelector(selectors.filtersContentColumn);
    this.elements.activeFiltersList = document.querySelector(selectors.activeFiltersList);
    this.elements.filtersHeader = document.querySelector(selectors.filtersHeader);
    this.elements.filtersLinks = document.querySelectorAll(selectors.filtersLink);
    this.elements.filtersOpen = document.querySelector(selectors.filtersOpen) || null;
    this.elements.sizesMenu = document.querySelector(selectors.sizesMenu) || null;
    this.elements.filtersOverlay = document.querySelector(selectors.filtersOverlay) || null;
    this.elements.filtersClose = document.querySelectorAll(selectors.filtersClose) || null;
    this.elements.paginationLess = document.querySelector(selectors.collectionPaginationLess);
    this.elements.paginationMore = document.querySelector(selectors.collectionPaginationMore);
    this.elements.sortByMenu = document.querySelector(selectors.sortBy);
    this.elements.siteContainer = document.querySelector(selectors.siteContainer);
    this.elements.utils = document.querySelector(selectors.collectionUtils);
  },

  removeClearAll() {
    const existingClearAllLink = document.querySelector(selectors.clearAllLink);
    if (existingClearAllLink) existingClearAllLink.remove();
  },

  renderClearAll() {
    const existingClearAllLink = document.querySelector(selectors.clearAllLink);
    if (existingClearAllLink) return;

    const clearAllLink = document.createElement('a');
    clearAllLink.innerText = 'Clear All';
    const clearAllHref =
      window.location.href.indexOf('/search') === -1
        ? window.location.href.split('?')[0]
        : window.location.href.split('&')[0];
    clearAllLink.setAttribute('href', clearAllHref);
    clearAllLink.classList.add('clear-all-link');

    function handleClearAllClick(e) {
      e.preventDefault();
      this.state.activeFilters = [];
      this.state.activeFilterCat = 0;
      this.state.pageNum = 0;
      this.pushState(clearAllHref, {
        prevUrl: window.location.href,
      });
      this.newResultsPageLoad();
    }

    clearAllLink.addEventListener('click', handleClearAllClick.bind(this));
    this.elements.filtersHeader.insertBefore(clearAllLink, this.elements.filtersHeader.children[1]);
  },

  renderFilterElements(filter, buttonEl, valuesEl, i) {
    let filterToggle = replaceLabels(buttonEl, filter);
    if (this.state.activeFilterCat !== i && this.state.activeFilterCat !== filter.field)
      filterToggle = filterToggle.replace('aria-expanded="true"', '');
    filterToggle =
      filterToggle.slice(0, filterToggle.indexOf('">') + 1) +
      ` data-filter-name="${filter.field}"` +
      filterToggle.slice(filterToggle.indexOf('">') + 1, filterToggle.length);
    const filterContentString = replaceLabels(valuesEl, filter);
    const filterClearLinks = [];

    // Node Creation
    const valuesList = document.createElement('ul');
    filter.values.forEach((value) => {
      // only generates multi-checkbox currently
      const textSpan = document.createElement('span');
      textSpan.innerText = `${value.label} (${value.count})`;

      const filterNameDiv = document.createElement('div');
      filterNameDiv.classList.add('filter-name');

      const filterLink = document.createElement('a');
      const filterString = `filter.${filter.field}=${value.value}`;
      const filterUrlString = encodeURI(filterString);
      const href = `${
        window.location.href.indexOf('/search') === -1
          ? window.location.href.split('?')[0]
          : window.location.href.split('&')[0]
      }?${filterUrlString}`;

      filterLink.setAttribute('href', href);
      filterLink.setAttribute('id', filterString);
      if (value.count === 0) filterLink.setAttribute('disabled', 'disabled');

      const li = document.createElement('li');
      filterNameDiv.appendChild(textSpan);
      filterLink.appendChild(filterNameDiv);
      li.appendChild(filterLink);

      if (value.active) {
        filterNameDiv.classList.add('selected');
        filterLink.classList.add(classes.active);
        // Clear Link
        const filterClearLink = document.createElement('a');
        filterClearLink.setAttribute('href', href);
        filterClearLink.setAttribute('id', filterString);
        filterClearLink.classList.add(classes.active);
        filterClearLink.innerText = `${filter.label}: ${value.label}`;
        filterClearLink.setAttribute('aria-label', `Remove filter: ${filter.label} ${value.label} `);
        filterClearLinks.push(filterClearLink);

        if (filter.field === templateText.variantSizeFilter) {
          filterLink.setAttribute(classes.sizeLinkAttr, '');
          filterClearLink.setAttribute(classes.sizeLinkAttr, '');
        }
      }

      // Values List
      valuesList.appendChild(li);
    });

    if (filter.field === templateText.variantSizeFilter) {
      this.renderSizes(filter);
    }

    const parser = new DOMParser();
    const filterContent = parser.parseFromString(filterContentString, 'text/html').body.firstChild;
    if (this.state.activeFilterCat !== i && this.state.activeFilterCat !== filter.field)
      filterContent.classList.remove(classes.active);
    filterContent.appendChild(valuesList);

    return {
      filterToggle,
      filterContent,
      filterClearLinks,
    };
  },

  renderSizes(filterData) {
    const placeholder = document.createElement('option');
    placeholder.setAttribute('value', '');
    placeholder.innerText = this.elements.sizesMenu.getAttribute('placeholder');

    const tempMenu = this.elements.sizesMenu.cloneNode();
    tempMenu.appendChild(placeholder);

    let selectedValues = 0;
    filterData.values.forEach((filter) => {
      const filterString = `filter.${filterData.field}=${filter.value}`;
      const option = document.createElement('option');
      option.setAttribute('value', filter.value);
      option.innerText = filter.label;
      option.id = filterString;
      if (filter.active) {
        option.setAttribute('selected', 'selected');
        selectedValues += 1;
      }
      tempMenu.appendChild(option);
    });
    if (selectedValues === 0) placeholder.setAttribute('selected', 'selected');

    tempMenu.addEventListener('change', this.handleSizeChange.bind(this));
    this.elements.sizesMenu.replaceWith(tempMenu);
  },

  handleSizeChange(e) {
    const selectedFilterIndex = e.target.selectedIndex;
    const selectedFilter = e.target.children[selectedFilterIndex];
    const nonSizeFilters = this.state.activeFilters.filter((activeFilter) => activeFilter.indexOf('size') === -1);
    // const href = `${window.location.href.split('?')[0]}${nonSizeFilters.length > 0 ? '?' : ''}${nonSizeFilters.join('&')}&${selectedFilter.id}`;

    this.state.activeFilters = [...nonSizeFilters, selectedFilter.id];
    this.state.pageNum = 0;
    this.state.sortBy = null;
    this.state.activeFilter = 0;
    const href = this.createUrl();

    this.pushState(href, {
      prevUrl: window.location.href,
    });

    if (window.innerWidth > 960) {
      window.scrollTo(0, 0);
    }
    this.newResultsPageLoad();
  },

  handleSuggestClick(e) {
    theme.searchQuery = e.target.getAttribute(selectors.suggestLinkAttr);
    const searchInput = document.querySelector(selectors.searchInput);
    if (searchInput) searchInput.value = theme.searchQuery;
    this.newResultsPageLoad();

    const updatedHref = window.location.href.split('=')[0] + '=' + theme.searchQuery;
    this.pushState(updatedHref, {
      prevUrl: window.location.href,
    });
    this.renderQueryInfo();
  },

  createUrl(includePageNum = false) {
    const baseHref =
      window.location.href.indexOf('/search') === -1
        ? window.location.href.split('?')[0]
        : window.location.href.split('&')[0];
    const filters = this.state.activeFilters.join('&');
    const newUrl = `${baseHref}${baseHref.indexOf('?') === -1 ? '?' : '&'}${filters}${
      this.state.sortBy ? '&' + this.state.sortBy : ''
    }${this.state.pageNum > 0 && includePageNum ? '&' + this.state.pageNum : ''}`;
    return newUrl.replace('?&', '?');
  },

  renderQueryInfo(queryData) {
    const queryDataEl = document.querySelector(`[${selectors.queryInfoAttr}]`);
    queryDataEl.innerHTML = '';

    if (queryDataEl && queryData.corrected) {
      const infoString = queryDataEl
        .getAttribute(selectors.queryInfoAttr)
        .replace('X', queryData.corrected)
        .replace('Y', queryData.original);
      queryDataEl.innerHTML = infoString;
    } else if (queryDataEl && queryData.didYouMean) {
      const infoString = queryDataEl
        .getAttribute(selectors.didYouMeanAttr)
        .replace(
          'X',
          `<a class='highlighted' ${selectors.suggestLinkAttr}="${queryData.didYouMean.query}">${queryData.didYouMean.query}</a>`
        );
      queryDataEl.innerHTML = infoString;
      queryDataEl.children[0].addEventListener('click', this.handleSuggestClick.bind(this));
    } else if (queryDataEl && queryData == 'none') {
      const infoString = queryDataEl.getAttribute(selectors.noResultsAttr).replace('X', theme.searchQuery);
      queryDataEl.innerHTML = infoString;
    }

    queryDataEl.classList.remove(classes.hidden);
  },

  renderProductFilters(filtersData) {
    const newButton = this.templateButton.outerHTML.toString();
    const templateValuesClone = this.templateContent.cloneNode(true);
    templateValuesClone.querySelector('ul').remove();
    const newValues = templateValuesClone.outerHTML.toString();

    // remove Shopify filters
    this.elements.filtersCategoryToggles.forEach((toggle) => toggle.remove());
    this.elements.filtersCategoryContents.forEach((content) => content.remove());

    const filtersToggles = [];
    const filtersContents = [];
    const activeFilters = [];
    filtersData.forEach((filter, index) => {
      const { filterToggle, filterContent, filterClearLinks } = this.renderFilterElements(
        filter,
        newButton,
        newValues,
        index
      );

      filtersToggles.push(filterToggle);
      filtersContents.push(filterContent);
      filterClearLinks.forEach((link) => activeFilters.push(link));
    });
    const contents = document.createElement('div');
    filtersContents.forEach((filterContent) => contents.appendChild(filterContent));
    const clearLinks = document.createElement('div');
    activeFilters.forEach((clearLink) => clearLinks.appendChild(clearLink));

    this.elements.filtersCategoryColumn.innerHTML = filtersToggles.join('');
    this.elements.filtersContentColumn.innerHTML = contents.innerHTML;
    if (activeFilters.length !== 0) {
      this.elements.activeFiltersList.innerHTML = clearLinks.innerHTML;
      this.elements.activeFiltersList.classList.remove(classes.empty);
      this.elements.filters.classList.add(classes.activeFilters);
      this.renderClearAll();
    } else {
      this.elements.activeFiltersList.innerHTML = '';
      this.elements.activeFiltersList.classList.add(classes.empty);
      this.elements.filters.classList.remove(classes.activeFilters);
      this.removeClearAll();
    }
  },

  handleSortChange(e) {
    e.preventDefault();
    const selectedSortIndex = e.target.selectedIndex;
    const selectedSort = e.target.children[selectedSortIndex];

    this.state.sortBy = selectedSort.value;
    this.state.pageNum = 0;

    const updatedHref = this.createUrl();

    this.pushState(updatedHref, {
      prevUrl: window.location.href,
    });

    if (window.innerWidth > 960) {
      window.scrollTo(0, 0);
    }
    this.newResultsPageLoad();
  },

  renderSorting(sortingData) {
    this.elements.sortByMenu.innerHTML = '';
    const sortContainer = document.createElement('select');
    sortContainer.id = this.elements.sortByMenu.id;
    sortContainer.classList = this.elements.sortByMenu.classList;
    sortContainer.ariaLabel = this.elements.sortByMenu.ariaLabel;

    const placeholder = document.createElement('option');
    placeholder.setAttribute('value', '');
    placeholder.innerText = 'Sort By';
    sortContainer.appendChild(placeholder);

    sortingData.forEach((sortOption) => {
      const option = document.createElement('option');
      const value = `sort.${sortOption.field}=${sortOption.direction}`;
      option.value = value;
      if (this.state.sortBy === value) option.setAttribute('selected', '');
      option.innerText = sortOption.label;
      sortContainer.appendChild(option);
    });

    this.elements.sortByMenu.replaceWith(sortContainer);
    sortContainer.addEventListener('change', this.handleSortChange.bind(this));
  },

  async newResultsPageLoad() {
    this.setLoading();
    this.setPageLoadId();
    const jsonResponse = await this.getSearchspringSearchApiResults();

    // Render product grid
    const productItems = jsonResponse.results ? await jsonResponse.results.map(getParamsItem) : [];
    const gaDataItems = jsonResponse.results ? await jsonResponse.results.map(getGADataItem) : [];
    const gaDataItemsValues = await Promise.all(gaDataItems);
    this.gaItems = gaDataItemsValues;

    if (productItems.length === 0 && jsonResponse.merchandising && jsonResponse.merchandising.redirect.length > 0) {
      const redirectUrl = window.location.href.split('/')[0] + jsonResponse.merchandising.redirect;
      window.location.href = redirectUrl;
    } else if (productItems.length === 0 && themeName === 'search') {
      if (jsonResponse.didYouMean) {
        this.renderQueryInfo(jsonResponse);
      } else {
        this.renderQueryInfo('none');
      }
      const utilsSection = document.querySelector(selectors.collectionUtils);
      utilsSection.hidden = 'hidden';
      if (utilsSection.dataset.nostoEnabled === 'true') {
        utilsSection.innerHTML = `<h3 class="title has-text-centered is-spaced is-size-4 has-margin-bottom has-text-weight-normal has-font-tertiary">Bestsellers you might like</h3> <div class="nosto_element" id="search_no_results"></div>`;
      } else {
        utilsSection.innerHTML = '';
        const searchspringRecsContainer = document.querySelector(selectors.searchspringRecsContainer);
        searchspringRecsContainer.removeAttribute('hidden');
      }
    }
    Promise.all(productItems).then((productItemResponses) => {
      const productItemValues = productItemResponses.map((item) => item.json());

      Promise.all(productItemValues).then((values) => {
        const resultsHtml = values.map((value) => value[this.productItemSection]).join('');
        this.elements.resultsContainer.innerHTML = resultsHtml;

        const merchandisingBanners = jsonResponse.merchandising.content.inline;
        if (merchandisingBanners && merchandisingBanners.length > 0) {
          merchandisingBanners.forEach((banner) => {
            const bannerDiv = document.createElement('div');
            bannerDiv.classList.add('product-list-item');
            const lazyloadValue = banner.value.replace('src=', 'class="lazyload" data-src=');
            bannerDiv.innerHTML = lazyloadValue;
            this.elements.resultsContainer.insertBefore(
              bannerDiv,
              this.elements.resultsContainer.children[banner.config.position.index]
            );
          });
        }
        this.addItemClickListeners();
        this.setLoaded();
        sendGA4Data(this.gaItems, 'view_item_list');
      });
    });

    // Render filters
    if (jsonResponse.facets.length > 0) this.renderProductFilters(jsonResponse.facets);
    if (jsonResponse.sorting.options && jsonResponse.sorting.options.length > 0)
      this.renderSorting(jsonResponse.sorting.options);
    if (jsonResponse.query) this.renderQueryInfo(jsonResponse.query);

    // Render next & prev
    this.renderPagination(jsonResponse);

    this.initElements();
    this.initAjax();
  },

  addItemClickListeners() {
    const allItems = this.elements.resultsContainer.querySelectorAll(selectors.productItem);
    async function handleClick(e) {
      if (this.clickLogged === true) return;
      e.preventDefault();
      const productItem = e.target.classList.contains(selectors.productItem.replace('.', ''))
        ? e.target
        : e.target.closest(selectors.productItem);
      if (this.gaItems) {
        const gaItem = this.gaItems.find(
          (item) => String(item.item_id) === productItem.getAttribute(selectors.skuAttr)
        );
        if (gaItem) sendGA4Data([gaItem], 'select_item');
      }
      this.clickLogged = true;
      e.target.click();
    }
    allItems.forEach((item) => {
      item.addEventListener('click', handleClick.bind(this));
    });
  },

  onClickPagination(e) {
    const cleanedHref = window.location.href
      .replace(`&page=${this.state.pageNum}`, '')
      .replace(`?page=${this.state.pageNum}`, '');
    const selectedPage = e.target.getAttribute('data-page');
    const updatedHref =
      cleanedHref.indexOf('?') === -1 ? `${cleanedHref}?page=${selectedPage}` : `${cleanedHref}&page=${selectedPage}`;
    this.state.pageNum = selectedPage;
    this.newResultsPageLoad();
    this.pushState(updatedHref, {
      prevUrl: window.location.href,
    });
    const h1 = document.querySelector('h1');
    if (h1) h1.scrollIntoView();
  },

  renderPagination(resultsJson) {
    this.elements.paginationLess.innerHTML = '';
    this.elements.paginationMore.innerHTML = '';
    if (resultsJson.pagination.nextPage !== 0) {
      const nextButton = document.createElement('button');
      nextButton.classList.add('c-btn', 'main', 'primary');
      nextButton.addEventListener('click', this.onClickPagination.bind(this));
      nextButton.innerText = 'Next Page';
      nextButton.setAttribute('data-page', resultsJson.pagination.nextPage);
      this.elements.paginationMore.appendChild(nextButton);
    }
    if (resultsJson.pagination.previousPage !== 0) {
      const prevButton = document.createElement('button');
      prevButton.classList.add('c-btn', 'main', 'primary');
      prevButton.addEventListener('click', this.onClickPagination.bind(this));
      prevButton.innerText = 'Prev Page';
      prevButton.setAttribute('data-page', resultsJson.pagination.previousPage);
      this.elements.paginationLess.appendChild(prevButton);
    }
  },

  addBreakpointEventListeners() {
    window.addEventListener('breakpoint-down:lg', this.filterCategoryVisiblity.bind(this));
    window.addEventListener('breakpoint-up:lg', this.filterCategoryVisiblity.bind(this));
  },

  initNoAjax() {
    this.initFilters();
    this.initSort();

    if (this.backBtn) this.backBtn.addEventListener('click', this.onClickEmptyBack.bind(this));
  },

  initAjax(reinitialise = false) {
    this.initElements();
    this.initFilters();
    this.initAjaxLinks();
    // this.initAjaxClear();
    // this.initAjaxSort();
    // this.initAjaxPagination();
    if (reinitialise && theme.quickCart) new theme.quickCart.constructor();
    if (this.backBtn) this.backBtn.addEventListener('click', this.onClickEmptyBack.bind(this));
  },

  setState(key, value) {
    if (typeof key !== 'undefined' && this.state.hasOwnProperty(key) && typeof value !== 'undefined') {
      this.state[key] = value;
    }
    return this.state;
  },

  initSort() {
    if (this.elements.collectionSort) {
      this.elements.collectionSort.addEventListener('change', this.onSort.bind(this));
    }
  },

  onSort(event) {
    // Grab the current query params
    let sortElement = event.currentTarget,
      queryParams = new URLSearchParams(location.search);

    // Grab the selected option
    let selected = sortElement.options[sortElement.selectedIndex];

    // Update the query params and trigger a page reload
    queryParams.set('sort_by', selected.value);
    window.location.search = queryParams;
  },

  initFilters() {
    if (!this.elements.filters) return;

    if (this.elements.filtersOpen) {
      this.elements.filtersOpen.addEventListener('click', this.onClickFiltersOpen.bind(this));
    }

    if (this.elements.filtersCategoryToggles.length) {
      this.elements.filtersCategoryToggles.forEach((filtersCategoryToggle) => {
        filtersCategoryToggle.addEventListener('click', this.onClickFiltersCategoryToggle.bind(this));
      });
    }

    if (this.elements.filtersClose.length > 0) {
      this.elements.filtersClose.forEach((filterClose) =>
        filterClose.addEventListener('click', this.onClickFiltersClose.bind(this))
      );
      // this.elements.filtersClose.children.forEach(child => child.addEventListener("click", this.onClickFiltersClose.bind(this)));
    }

    if (this.elements.filtersApply) {
      this.elements.filtersApply.addEventListener('click', this.onClickFiltersApply.bind(this));
    }
  },

  initFiltersOpen() {
    if (!this.elements.filtersOpen) return;
    if (!this.elements.filters) return;

    this.elements.filtersOpen.addEventListener('click', this.onClickFiltersOpen.bind(this));
  },

  initFiltersAccordions() {
    if (!this.elements.filters) return;

    if (this.elements.filtersCategoryToggles.length) {
      this.elements.filtersCategoryToggles.forEach((filtersCategoryToggle) => {
        filtersCategoryToggle.addEventListener('click', this.onClickFiltersCategoryToggle.bind(this));
      });
    }
  },

  onClickFiltersOpen(event) {
    event.preventDefault();

    if (!this.elements.filters.classList.contains(classes.visible)) {
      if (window.innerWidth < 960) {
        window.scrollTo(0, 0);
      }

      lockScrolling();
      return this.openFilters();
    }
  },

  onClickFiltersCategoryToggle(event) {
    event.preventDefault();
    const filtersButton = event.target.closest('button');
    if (!filtersButton || !filtersButton.getAttribute('aria-controls'))
      throw new Error('No button or controlled category content specified.');

    const filterCategoryContent = document.getElementById(filtersButton.getAttribute('aria-controls'));
    if (!filterCategoryContent.classList.contains(classes.active)) {
      this.elements.filtersCategoryContents.forEach((toggle) => toggle.classList.remove(classes.active));
      filterCategoryContent.classList.add(classes.active);
      this.elements.filtersCategoryToggles.forEach((toggle) => toggle.setAttribute('aria-expanded', false));
      filtersButton.setAttribute('aria-expanded', true);

      this.state.activeFilterCat = filtersButton.dataset.filterName;
    }
  },

  onClickFiltersApply(event) {
    event.preventDefault();

    return this.closeFilters();
  },

  onClickFiltersClose(event) {
    event.preventDefault();

    if (this.elements.filters.classList.contains(classes.visible)) {
      unlockScrolling();
      return this.closeFilters();
    }
  },

  openFilters() {
    this.lastButtonClicked = 'filter';
    this.elements.filters.classList.add(classes.visible);
    this.elements.filtersOverlay.classList.add(classes.visible);
    this.elements.utils.classList.add(classes.active);
    const gorgiasChatContainer = document.querySelector(selectors.gorgiasChatContainer);
    if (gorgiasChatContainer) gorgiasChatContainer.setAttribute('style', 'display:none');
    lockScrolling();
  },

  closeFilters() {
    this.lastButtonClicked = 'filter';
    this.elements.filters.classList.remove(classes.visible);
    this.elements.filtersOverlay.classList.remove(classes.visible);
    this.elements.utils.classList.remove(classes.active);
    const gorgiasChatContainer = document.querySelector(selectors.gorgiasChatContainer);
    if (gorgiasChatContainer) gorgiasChatContainer.removeAttribute('style');
    unlockScrolling();
  },

  pushState(url, props = {}) {
    if (!url) return;
    if (url == '') return;
    window.history.pushState(props, null, url);
  },

  initAjaxLinks() {
    if (this.elements.filtersLinks && this.elements.filtersLinks.length) {
      this.elements.filtersLinks.forEach((link) => {
        link.addEventListener('click', this.onClickAjaxLink.bind(this));
      });
    }
  },

  async onClickAjaxLink(event) {
    event.preventDefault();

    const btn = event.currentTarget,
      // href = btn.hasAttribute("href") ? btn.getAttribute("href") : btn.getAttribute("data-href"),
      selectedFilter = btn.hasAttribute('id') ? btn.getAttribute('id') : null,
      isActive = btn.classList.contains(classes.active);

    this.setState('lastClicked', btn);
    // const pageReplacedHref = href.replace(`&page=${this.state.pageNum}`, '').replace(`?page=${this.state.pageNum}`, '?').replace(`?page=${this.state.pageNum}&`, '?');

    this.state.pageNum = 0;

    if (isActive) {
      this.state.activeFilters = this.state.activeFilters.filter((filter) => filter !== selectedFilter);
      this.newResultsPageLoad();
    } else {
      this.state.activeFilters.push(selectedFilter);
      this.newResultsPageLoad();
    }

    const href = this.createUrl();
    this.pushState(href, {
      prevUrl: window.location.href,
    });

    // if (this.template === "collection") {
    //   updateCanonicalLinks(href);
    // }
  },

  initAjaxPagination() {
    if (this.elements.collectionPagination) {
      let paginationLinks = [...this.elements.collectionPagination.querySelectorAll('a')];
      paginationLinks.forEach((paginationLink) => {
        paginationLink.addEventListener('click', this.onClickAjaxPagination.bind(this));
      });
    }

    if (theme.enableInfiniteResults) {
      if (this.elements.collectionPaginationLessBtn) {
        this.elements.collectionPaginationLessBtn.addEventListener(
          'click',
          this.onClickAjaxPaginationDirection.bind(this)
        );
      }
      if (this.elements.collectionPaginationMoreBtn) {
        this.elements.collectionPaginationMoreBtn.addEventListener(
          'click',
          this.onClickAjaxPaginationDirection.bind(this)
        );
      }
    }
  },

  async onClickAjaxPagination(event) {
    event.preventDefault();

    this.lastButtonClicked = 'pagination';

    const btn = event.currentTarget,
      url = btn.hasAttribute('href') ? btn.getAttribute('href') : null;

    const response = await this.getCollectionResults(url);
  },

  async onClickAjaxPaginationDirection(event) {
    event.preventDefault();

    this.lastButtonClicked = 'pagination';

    const isMoreButton =
      event.target.dataset.collectionPaginationMoreBtn === undefined
        ? event.target.dataset.searchPaginationMoreBtn === undefined
          ? false
          : true
        : true; // checking for both search and collection buttons as datasets will be different
    const direction = isMoreButton ? 'next' : 'previous';

    const btn = event.target,
      btnUrl = btn.hasAttribute('href') ? btn.getAttribute('href') : null,
      urlArray = btnUrl.split('?'),
      url = `?${urlArray[urlArray.length - 1]}`;

    const response = await this.getCollectionResultsPage(url, direction);
  },

  setUserId() {
    const storedId = getCookie('ssUserId');
    if (storedId) {
      this.userId = storedId;
    } else {
      const newUuid = uuid.v4();
      this.userId = newUuid;
      setCookie('ssUserId', newUuid, 365);
    }
  },

  setSessionId() {
    const storedId = getCookie('ssSessionIdNamespace');
    if (storedId) {
      this.sessionId = storedId;
    } else {
      const newUuid = uuid.v4();
      this.sessionId = newUuid;
      setCookie('ssSessionIdNamespace', newUuid);
    }
  },

  setPageLoadId() {
    const newUuid = uuid.v4();
    this.pageLoadId = newUuid;
  },

  async getSearchspringSearchApiResults() {
    const filtersString = this.state.activeFilters.length > 0 ? '&' + this.state.activeFilters.join('&') : '';
    const results = theme.collectionName
      ? `&bgfilter.collection_handle=${theme.collectionName}`
      : `&q=${theme.searchQuery}`;
    const domain =
      window.location.href.indexOf('/search') === -1
        ? window.location.href.split('?')[0]
        : window.location.href.split('&')[0];
    const queryString = `&resultsFormat=json&userId=${this.userId}&sessionId=${this.sessionId}&pageLoadId=${
      this.pageLoadId
    }&domain=${domain}&bgfilter.ss_is_published=1${results}${filtersString}&resultsPerPage=${theme.itemsPerPage}&page=${
      this.state.pageNum
    }&redirectResponse=minimal${this.state.sortBy ? `&${this.state.sortBy}` : ''}`;
    const url = `${searchspringEndpoints.root}${searchspringEndpoints.search}${queryString}`;
    const json = await getJsonFetchResponse(url);

    return json;
  },

  setLoading() {
    this.disableUI();
    const spinner = document.createElement('div');
    spinner.classList.add(classes.loadingSpinner);
    this.elements.resultsContainer.appendChild(spinner);
    this.elements.resultsContainer.classList.add(classes.loading);

    if (window.innerWidth < 960) {
      window.scrollTo(0, 0);
    }
  },

  setLoaded() {
    this.enableUI();
    this.elements.resultsContainer.classList.remove(classes.loading);
    theme.wishlistModal();
  },

  enableUI(blacklist = []) {
    // Enable bits of UI individually
    if (this.elements.filtersOpen && !blacklist.includes(this.elements.filtersOpen))
      this.elements.filtersOpen.removeAttribute('disabled');
    this.elements.filtersCategoryToggles.forEach((x) => x.removeAttribute('disabled'));
    this.elements.filtersLinks.forEach((x) => x.classList.remove(classes.disabled));
    if (this.elements.filtersClear && !blacklist.includes(this.elements.filtersClear))
      this.elements.filtersClear.forEach((link) => {
        link.classList.remove(classes.disabled);
      });
    if (this.elements.filtersApply && !blacklist.includes(this.elements.filtersApply))
      this.elements.filtersApply.removeAttribute('disabled');

    if (this.elements.collectionSort && !blacklist.includes(this.elements.collectionSort))
      this.elements.collectionSort.removeAttribute('disabled', true);
    if (this.elements.collectionProducts && !blacklist.includes(this.elements.collectionProducts))
      this.elements.collectionProducts.classList.remove(classes.loading);
    if (this.elements.collectionPagination && !blacklist.includes(this.elements.collectionPagination))
      this.elements.collectionPagination.classList.remove(classes.loading);

    if (theme.enableInfiniteResults) {
      if (this.elements.collectionPaginationMoreBtn && !blacklist.includes(this.elements.collectionPaginationMoreBtn))
        this.elements.collectionPaginationMoreBtn.classList.remove(classes.loading);
      if (this.elements.collectionPaginationLessBtn && !blacklist.includes(this.elements.collectionPaginationLessBtn))
        this.elements.collectionPaginationLessBtn.classList.remove(classes.loading);
    }
  },

  disableUI() {
    // Disable bits of UI individually
    if (this.elements.filtersOpen) this.elements.filtersOpen.setAttribute('disabled', true);
    this.elements.filtersCategoryToggles.forEach((x) => x.setAttribute('disabled', true));
    this.elements.filtersLinks.forEach((x) => x.classList.add(classes.disabled));
    if (this.elements.filtersClear)
      this.elements.filtersClear.forEach((link) => {
        link.classList.add(classes.disabled);
      });
    if (this.elements.filtersApply) this.elements.filtersApply.setAttribute('disabled', true);

    if (this.elements.collectionSort) this.elements.collectionSort.setAttribute('disabled', true);
    if (this.elements.collectionProducts) this.elements.collectionProducts.classList.add(classes.loading);
    if (this.elements.collectionPagination) this.elements.collectionPagination.classList.add(classes.loading);

    if (theme.enableInfiniteResults) {
      if (this.elements.collectionPaginationMoreBtn)
        this.elements.collectionPaginationMoreBtn.classList.add(classes.loading);
      if (this.elements.collectionPaginationLessBtn)
        this.elements.collectionPaginationLessBtn.classList.add(classes.loading);
    }
  },

  addMobileToolbarScroll(scrollThresholdInteger) {
    const toolbar = document.querySelector(selectors.collectionUtils);

    let scrolling = false;
    let scrollInteger = 0;

    const siteContainer = document.querySelector(selectors.siteContainer);
    siteContainer.addEventListener('scroll', function (e) {
      scrolling = true;
      scrollInteger = e.target.scrollTop;
    });

    setInterval(() => {
      if (scrolling) {
        scrolling = false;
        if (scrollInteger > scrollThresholdInteger) {
          if (!toolbar.classList.contains(classes.scrolled)) {
            toolbar.classList.add(classes.scrolled);
          }
        } else {
          if (toolbar.classList.contains(classes.scrolled)) {
            toolbar.classList.remove(classes.scrolled);
          }
        }
      }
    }, 300);
  },

  onClickEmptyBack(event) {
    event.preventDefault();
    window.location.href = document.referrer;
  },

  onError(ex) {
    console.warn('Collection:', ex);

    // Recover the UI
    this.setState('isFetching', false);
    this.enableUI();
  },
};

const section = document.getElementById(`section-${themeName}`);
sectionCollection.onFiltersInit(section);
