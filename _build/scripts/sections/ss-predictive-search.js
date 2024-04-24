// import { debounce, getJsonFetchResponse, getNonLazyLoadedItem, getGADataItem, sendGA4Data } from '../theme/helpers';

// class SearchForm extends HTMLElement {
//   constructor() {
//     super();
//     this.input = this.querySelector('input[type="search"]');
//     this.resetButton = this.querySelector('button[type="reset"]');
//     this.resultsContainer = document.querySelector('#predictive-search-results');
//     this.searchCloseWrapper = document.querySelector('[data-close-search-modal]');
//     this.overlay = document.querySelector('[data-search-overlay]');
//     this.wrapper = document.querySelector('[data-predictive-search-wrapper]');
//     this.searchspringEndpoints = {
//       root: `https://${theme.siteId}.a.searchspring.io/api/`,
//       search: `search/search.json?siteId=${theme.siteId}`,
//       suggest: `suggest/query?siteId=${theme.siteId}`,
//       autocomplete: `search/autocomplete.json?siteId=${theme.siteId}`,
//       trending: `suggest/trending?siteId=${theme.siteId}&limit=6`,
//     };

//     this.classes = {
//       hidden: 'hidden',
//       visible: 'is-visible',
//       open: 'is-open',
//       loadingSpinner: 'loading-spinner',
//       loading: 'is-loading',
//     };

//     if (this.input) {
//       this.input.form.addEventListener('reset', this.onFormReset.bind(this));
//       this.input.addEventListener(
//         'input',
//         debounce((event) => {
//           this.onChange(event);
//         }, 300).bind(this)
//       );
//     }
//   }

//   toggleResetButton() {
//     const resetIsHidden = this.resetButton.classList.contains(this.classes.hidden);
//     if (this.input.value.length > 0 && resetIsHidden) {
//       this.resetButton.classList.remove(this.classes.hidden);
//     } else if (this.input.value.length === 0 && !resetIsHidden) {
//       this.resetButton.classList.add(this.classes.hidden);
//     }
//   }

//   onChange() {
//     this.toggleResetButton();
//   }

//   shouldResetForm() {
//     return !document.querySelector('[aria-selected="true"] a');
//   }

//   onFormReset(event) {
//     // Prevent default so the form reset doesn't set the value gotten from the url on page load
//     event.preventDefault();
//     // Don't reset if the user has selected an element on the predictive search dropdown
//     if (this.shouldResetForm()) {
//       this.input.value = '';
//       this.input.focus();
//       this.toggleResetButton();
//       this.loadSuggestedResults();
//     }
//   }
// }

// customElements.define('search-form', SearchForm);

// class PredictiveSearch extends SearchForm {
//   constructor() {
//     super();
//     this.cachedResults = {};
//     this.predictiveContainer = document.querySelector('[data-predictive-container]');
//     this.predictiveSearchResults = document.querySelector('[data-predictive-search]');
//     this.allPredictiveSearchInstances = document.querySelectorAll('predictive-search');
//     this.isOpen = false;
//     this.abortController = new AbortController();
//     this.searchTerm = '';

//     this.setupEventListeners();
//   }

//   setupEventListeners() {
//     this.input.form.addEventListener('submit', this.onFormSubmit.bind(this));

//     this.input.addEventListener('focus', this.onFocus.bind(this));
//     this.addEventListener('focusout', this.onFocusOut.bind(this));
//     this.predictiveContainer.addEventListener('focusout', this.onFocusOut.bind(this));
//     this.addEventListener('keyup', this.onKeyup.bind(this));
//     this.addEventListener('keydown', this.onKeydown.bind(this));
//     if (this.searchCloseWrapper) this.searchCloseWrapper.addEventListener('click', this.closeModal.bind(this));

//     this.loadSuggestedResults();
//   }

//   loadSuggestedResults() {
//     if (theme.search.suggested_content_enabled === 'true') {
//       const boundGetSearchResults = this.getSearchResults.bind(this);
//       const boundOpen = this.open.bind(this);
//       async function showSuggestionsModal(e) {
//         await boundGetSearchResults(null);
//         if (e.target.value.length > 0) boundGetSearchResults(e.target.value);
//         boundOpen();
//       }
//       function removeSuggestionsAfterEntry(e) {
//         this.input.removeEventListener('click', showSuggestionsModal);
//         this.input.removeEventListener('change', removeSuggestionsAfterEntry.bind(this));
//       }
//       this.input.addEventListener('click', showSuggestionsModal);
//       this.input.addEventListener('change', removeSuggestionsAfterEntry.bind(this));
//     }
//   }

//   getQuery() {
//     theme.relativeItemCategory = 'Autocomplete: ' + this.input.value.trim();
//     return this.input.value.trim();
//   }

//   onClickSearchClose() {
//     this.wrapper.classList.remove(this.classes.visible);
//     // this.searchCloseWrapper.classList.remove(this.classes.visible);
//   }

//   onChange() {
//     super.onChange();
//     const newSearchTerm = this.getQuery();
//     if (!this.searchTerm || !newSearchTerm.startsWith(this.searchTerm)) {
//       // Remove the results when they are no longer relevant for the new search term
//       // so they don't show up when the dropdown opens again
//       // const resultsWrapper = this.querySelector("#predictive-search-results-groups-wrapper");
//       // if (resultsWrapper) resultsWrapper.remove();
//     }

//     // Update the term asap, don't wait for the predictive search query to finish loading
//     this.updateSearchForTerm(this.searchTerm, newSearchTerm);

//     this.searchTerm = newSearchTerm;

//     if (!this.searchTerm.length) {
//       this.close(true);
//       return;
//     }

//     this.getSearchResults(this.searchTerm);
//   }

//   onFormSubmit(event) {
//     if (!this.getQuery().length || this.querySelector('[aria-selected="true"] a')) event.preventDefault();
//   }

//   onFormReset(event) {
//     super.onFormReset(event);
//     if (super.shouldResetForm()) {
//       this.searchTerm = '';
//       this.abortController.abort();
//       this.abortController = new AbortController();
//       this.closeResults(true);
//     }
//   }

//   onFocus() {
//     const currentSearchTerm = this.getQuery();

//     if (!currentSearchTerm.length && this.searchTerm.length === 0) return;

//     if (this.searchTerm !== currentSearchTerm) {
//       // Search term was changed from other search input, treat it as a user change
//       this.onChange();
//     } else if (this.getAttribute('results') === 'true') {
//       this.open();
//     } else {
//       this.getSearchResults(this.searchTerm);
//     }
//   }

//   onFocusOut() {
//     setTimeout(() => {
//       const oneActiveElement =
//         this.contains(document.activeElement) || this.predictiveContainer.contains(document.activeElement);
//       if (!oneActiveElement && !this.classList.contains(this.classes.open)) this.close();
//     });
//   }

//   onKeyup(event) {
//     if (!this.getQuery().length) this.close(true);
//     event.preventDefault();

//     switch (event.code) {
//       case 'ArrowUp':
//         this.switchOption('up');
//         break;
//       case 'ArrowDown':
//         this.switchOption('down');
//         break;
//       case 'Enter':
//         this.selectOption();
//         break;
//     }
//   }

//   onKeydown(event) {
//     // Prevent the cursor from moving in the input when using the up and down arrow keys
//     if (event.code === 'ArrowUp' || event.code === 'ArrowDown') {
//       event.preventDefault();
//     }
//   }

//   updateSearchForTerm(previousTerm, newTerm) {
//     let checkCount = 0;
//     const textInterval = setInterval(() => {
//       if (checkCount > 20) clearInterval(textInterval);
//       const searchForTextElement = document.querySelector('[data-predictive-search-search-for-text]');
//       if (searchForTextElement) {
//         clearInterval(textInterval);
//         const searchTermTextEl = searchForTextElement.querySelector('[data-autocomplete-search-term]');
//         if (searchTermTextEl) searchTermTextEl.innerText = newTerm;
//         searchForTextElement.parentNode.setAttribute('href', `${theme.shopUrl}/search?q=${newTerm}`);
//       } else checkCount += 1;
//     }, 200);
//   }

//   switchOption(direction) {
//     if (!this.getAttribute('open')) return;

//     const moveUp = direction === 'up';
//     const selectedElement = this.querySelector('[aria-selected="true"]');

//     // Filter out hidden elements (duplicated page and article resources) thanks
//     // to this https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/offsetParent
//     const allVisibleElements = Array.from(this.querySelectorAll('li, button.predictive-search__item')).filter(
//       (element) => element.offsetParent !== null
//     );
//     let activeElementIndex = 0;

//     if (moveUp && !selectedElement) return;

//     let selectedElementIndex = -1;
//     let i = 0;

//     while (selectedElementIndex === -1 && i <= allVisibleElements.length) {
//       if (allVisibleElements[i] === selectedElement) {
//         selectedElementIndex = i;
//       }
//       i++;
//     }

//     this.statusElement.textContent = '';

//     if (!moveUp && selectedElement) {
//       activeElementIndex = selectedElementIndex === allVisibleElements.length - 1 ? 0 : selectedElementIndex + 1;
//     } else if (moveUp) {
//       activeElementIndex = selectedElementIndex === 0 ? allVisibleElements.length - 1 : selectedElementIndex - 1;
//     }

//     if (activeElementIndex === selectedElementIndex) return;

//     const activeElement = allVisibleElements[activeElementIndex];

//     activeElement.setAttribute('aria-selected', true);
//     if (selectedElement) selectedElement.setAttribute('aria-selected', false);

//     this.input.setAttribute('aria-activedescendant', activeElement.id);
//   }

//   selectOption() {
//     const selectedOption = this.querySelector('[aria-selected="true"] a, button[aria-selected="true"]');

//     if (selectedOption) selectedOption.click();
//   }

//   async getSearchspringSearchApiResults(searchTerm, apiService) {
//     const queryString = `&q=${searchTerm}${
//       apiService === 'search' || apiService === 'autocomplete' ? '&resultsFormat=json' : ''
//     }`;
//     const url = `${this.searchspringEndpoints.root}${this.searchspringEndpoints[apiService]}${queryString}${
//       apiService === 'autocomplete' ? '&resultsPerPage=1000' : ''
//     }`;
//     const json = await getJsonFetchResponse(url);

//     return json;
//   }

//   async getSearchResults(searchTerm) {
//     if (searchTerm !== null) {
//       this.setLiveRegionLoadingState();

//       const queriesCol = document.querySelector('[data-suggestions-col]');
//       const resultsCol = document.querySelector('[data-results-col]');

//       // Populate Top Suggestions
//       const suggestedQueriesData = await this.getSearchspringSearchApiResults(searchTerm, 'suggest');
//       const queriesListEl = queriesCol.querySelector('ul');
//       queriesListEl.innerHTML = '';
//       const lowercaseTerm = searchTerm.toLowerCase();
//       const matchingSearches =
//         searchTerm.length > 2
//           ? theme.search.suggested_searches.filter((suggestion) => suggestion.toLowerCase().startsWith(lowercaseTerm))
//           : [];

//       const allSuggestions = [
//         ...matchingSearches,
//         ...suggestedQueriesData.alternatives,
//         { ...suggestedQueriesData.suggested },
//       ];
//       let populatedSuggestions = [];
//       const tempUl = document.createElement('ul');
//       allSuggestions.forEach((suggestion, i) => {
//         if (populatedSuggestions.length === 10) return;
//         const listItemEl = document.createElement('li');
//         const linkEL = document.createElement('a');
//         const completedSuggestions = suggestion.completed;
//         const suggestionText = suggestion.text;

//         let token = null;
//         if (completedSuggestions && completedSuggestions[0]) {
//           token = completedSuggestions[0].token;
//         } else if (suggestionText) {
//           token = suggestionText;
//         } else if (typeof suggestion === 'string') {
//           token = suggestion.toLowerCase();
//         }
//         if (!token || populatedSuggestions.includes(token)) return;
//         populatedSuggestions.push(token);
//         const innerHtml = token.replace(lowercaseTerm, `<span class="highlighted">${lowercaseTerm}</span>`);
//         linkEL.href = `${theme.shopUrl}/search?q=${token}`;
//         linkEL.innerHTML = innerHtml;
//         listItemEl.appendChild(linkEL);
//         tempUl.appendChild(listItemEl);
//       });
//       queriesListEl.innerHTML = tempUl.innerHTML;
//       if (queriesCol.hasAttribute('hidden')) queriesCol.removeAttribute('hidden');

//       // Populate Search Widget Results
//       const resultsData = await this.getSearchspringSearchApiResults(searchTerm, 'autocomplete');
//       const resultsListEl = resultsCol.querySelector('ul');
//       const productItems = resultsData.results ? await resultsData.results.slice(0, 4).map(getNonLazyLoadedItem) : [];
//       const gaDataItems = resultsData.results ? await resultsData.results.slice(0, 4).map(getGADataItem) : [];
//       const gaDataItemsValues = await Promise.all(gaDataItems);
//       this.gaItems = gaDataItemsValues;
//       sendGA4Data(this.gaItems, 'view_item_list', `Autocomplete: ${this.searchTerm}`);

//       Promise.all(productItems).then((productItemResponses) => {
//         const productItemValues = productItemResponses.map((item) => item.json());

//         Promise.all(productItemValues).then((values) => {
//           const resultsHtml = values.map((value) => value['product-list-item']).join('');
//           resultsListEl.innerHTML = resultsHtml;
//           theme.wishlistModal();
//           this.addItemClickListeners(resultsListEl);
//         });
//       });
//       const titleEl = document.querySelector('[data-results-title]');
//       if (titleEl) {
//         titleEl.removeAttribute('hidden');
//         const count = document.querySelector('[data-autocomplete-count]');
//         if (count)
//           count.innerText =
//             resultsData.results.length === 500 ? `${resultsData.results.length}+` : resultsData.results.length;
//         const term = document.querySelector('[data-autocomplete-search-term]');
//         if (term) term.innerHTML = `<span class="highlighted">"${searchTerm}"</span>`;
//       }
//       if (resultsCol.hasAttribute('hidden')) resultsCol.removeAttribute('hidden');
//     } else {
//       this.setLiveRegionLoadingState();

//       if (this.cachedResults['predictive-search-default-suggestions']) {
//         this.renderSearchResults(this.cachedResults['predictive-search-default-suggestions']);
//         return;
//       }
//       fetch(`${routes.root_url}?section_id=searchspring-predictive-search`, { signal: this.abortController.signal })
//         .then(async (response) => {
//           if (!response.ok) {
//             const errorText = await response.text();
//             var error = new Error(response.status + ' ' + errorText);
//             this.close();
//             throw error;
//           }

//           return response.text();
//         })
//         .then(async (text) => {
//           const resultsMarkup = new DOMParser()
//             .parseFromString(text, 'text/html')
//             .querySelector('#shopify-section-searchspring-predictive-search').innerHTML;
//           this.renderSearchResults(resultsMarkup);
//           this.allPredictiveSearchInstances.forEach((predictiveSearchInstance) => {
//             predictiveSearchInstance.cachedResults['predictive-search-default-suggestions'] = resultsMarkup;
//           });

//           // Populate Trending Results
//           if (theme.search.searchspring_trending_enabled) {
//             const queriesCol = document.querySelector('[data-suggestions-col]');
//             const trendingQueriesData = await this.getSearchspringSearchApiResults(searchTerm, 'trending');
//             if (trendingQueriesData.trending && trendingQueriesData.trending.queries) {
//               const trendingQueriesArray = trendingQueriesData.trending.queries;
//               const queriesListEl = queriesCol.querySelector('ul');
//               queriesListEl.innerHTML = '';
//               const tempUl = document.createElement('ul');
//               trendingQueriesArray.forEach((trendingResult) => {
//                 const listItemEl = document.createElement('li');
//                 const linkEL = document.createElement('a');
//                 const token = trendingResult.searchQuery;
//                 linkEL.href = `${theme.shopUrl}/search?q=${token}`;
//                 linkEL.innerText = token;
//                 listItemEl.appendChild(linkEL);
//                 tempUl.appendChild(listItemEl);
//               });
//               queriesListEl.innerHTML = tempUl.innerHTML;
//               if (queriesCol.hasAttribute('hidden')) queriesCol.removeAttribute('hidden');
//             }
//           }
//         })
//         .catch((error) => {
//           if (error && error.code === 20) {
//             // Code 20 means the call was aborted
//             return;
//           }
//           this.close();
//           throw error;
//         });
//     }
//     this.modalInterval = setInterval(this.checkForCloseButton.bind(this), 300);
//   }

//   addItemClickListeners(container) {
//     const allItems = container.querySelectorAll('.product-list-item');
//     async function handleClick(e) {
//       if (this.clickLogged === true) return;
//       e.preventDefault();
//       const productItem = e.target.classList.contains('product-list-item')
//         ? e.target
//         : e.target.closest('.product-list-item');
//       if (this.gaItems) {
//         const gaItem = this.gaItems.find(
//           (item) => String(item.item_id) === productItem.getAttribute('data-product-sku')
//         );
//         if (gaItem) sendGA4Data([gaItem], 'select_item', this.searchTerm, `Autocomplete: ${this.searchTerm}`);
//       }
//       this.clickLogged = true;
//       e.target.click();
//     }
//     allItems.forEach((item) => {
//       item.addEventListener('click', handleClick.bind(this));
//     });
//   }

//   checkForCloseButton() {
//     const modalClose = document.querySelector('[data-close-search-modal]');
//     if (modalClose) {
//       modalClose.addEventListener('click', this.closeModal.bind(this));
//       clearInterval(this.modalInterval);
//     }
//   }

//   setLiveRegionLoadingState() {
//     this.statusElement = this.statusElement || document.querySelector('.predictive-search-status');
//     this.loadingText = this.loadingText || this.getAttribute('data-loading-text');

//     this.setLiveRegionText(this.loadingText);
//     this.setAttribute('loading', true);
//     this.predictiveContainer.setAttribute('loading', true);

//     // const spinner = document.createElement('div');
//     // spinner.classList.add(this.classes.loadingSpinner);
//     // const loadingWrapper = this.querySelector(".loading-state");
//     // loadingWrapper.appendChild(spinner);
//     // loadingWrapper.classList.add(this.classes.loading);
//   }

//   setLiveRegionText(statusText) {
//     this.statusElement.setAttribute('aria-hidden', 'false');
//     this.statusElement.textContent = statusText;
//     // const loadingWrapper = this.querySelector(".loading-state");
//     // loadingWrapper.classList.remove(this.classes.loading);
//     // need to remove spinner??

//     setTimeout(() => {
//       this.statusElement.setAttribute('aria-hidden', 'true');
//     }, 1000);
//   }

//   renderSearchResults(resultsMarkup) {
//     this.predictiveSearchResults.innerHTML = resultsMarkup;
//     this.setAttribute('results', true);
//     this.predictiveContainer.setAttribute('results', true);

//     this.setLiveRegionResults();
//     this.open();
//   }

//   setLiveRegionResults() {
//     this.removeAttribute('loading');
//     this.predictiveContainer.removeAttribute('loading');
//     const liveRegionCount = document.querySelector('[data-predictive-search-live-region-count-value]');
//     if (liveRegionCount && liveRegionCount.textContent) this.setLiveRegionText(liveRegionCount.textContent);
//   }

//   getResultsMaxHeight() {
//     this.resultsMaxHeight =
//       window.innerHeight - document.querySelector('.section-header').getBoundingClientRect().bottom;
//     return this.resultsMaxHeight;
//   }

//   open() {
//     this.overlay.classList.add(this.classes.visible);
//     // this.searchCloseWrapper.classList.add(this.classes.visible);
//     this.predictiveSearchResults.style.maxHeight = this.resultsMaxHeight || `${this.getResultsMaxHeight()}px`;
//     this.setAttribute('open', true);
//     this.predictiveContainer.setAttribute('open', true);
//     this.input.setAttribute('aria-expanded', true);
//     this.isOpen = true;

//     this.checkForCloseButton();
//   }

//   close(clearSearchTerm = false) {
//     this.closeResults(clearSearchTerm);
//     this.isOpen = false;
//     //this.overlay.classList.remove("is-visible");
//   }

//   closeModal() {
//     this.closeResults(false);
//     this.isOpen = false;
//     this.overlay.classList.remove('is-visible');
//     document.activeElement.blur();
//   }

//   closeResults(clearSearchTerm = false) {
//     if (clearSearchTerm) {
//       this.input.value = '';
//       this.removeAttribute('results');
//       this.predictiveContainer.removeAttribute('results');
//     }

//     const selected = this.querySelector('[aria-selected="true"]');
//     if (selected) selected.setAttribute('aria-selected', false);

//     this.input.setAttribute('aria-activedescendant', '');
//     this.removeAttribute('loading');
//     this.predictiveContainer.removeAttribute('loading');
//     this.removeAttribute('open');
//     this.predictiveContainer.removeAttribute('open');
//     this.input.setAttribute('aria-expanded', false);
//     this.resultsMaxHeight = false;
//     this.predictiveContainer.removeAttribute('style');
//     this.overlay.classList.remove(this.classes.visible);
//   }
// }

// customElements.define('predictive-search', PredictiveSearch);
