export function updateCanonicalLinks(fullUrl) {
  let [collectionUrl, urlParams] = fullUrl.includes('?') ? fullUrl.split('?') : [fullUrl, ''];
  let url = '';
  const urlParts = urlParams.includes('&') ? urlParams.split('&') : [urlParams];
  if (theme.noIndexFilters && theme.noIndexFilters.length > 0) {
    urlParts.forEach((filter) => {
      console.log(filter);
      const lowercaseFilter = filter.toLowerCase();
      let useFilter = theme.noIndexFilters.every((noIndexName) => lowercaseFilter.indexOf(noIndexName) === -1);
      if (theme.alwaysIndexFilters && theme.alwaysIndexFilters.includes(filter)) useFilter = true;
      if (useFilter) url = '?' + filter;
    });
  }

  const jsonLdScript = document.querySelector('[type="application/ld+json"]');
  const oldJson = jsonLdScript.innerHTML;
  let [preLinkJson, postLinkJson] = oldJson.split('"@id": "');
  postLinkJson = postLinkJson.split(postLinkJson.split('"')[0])[1];
  console.log(`${preLinkJson}"@id": "${collectionUrl}${url}${postLinkJson}`);
  jsonLdScript.innerHTML = `${preLinkJson}"@id": "${collectionUrl}${url}${postLinkJson}`;

  const canonicalLink = document.querySelector('[rel="canonical"]');

  canonicalLink.href = `${collectionUrl.indexOf(theme.url) === -1 ? theme.url : ''}${collectionUrl}${url}`;
}

export const debounce = (fn, delay) => {
  let timeOutId;
  return function (...args) {
    if (timeOutId) {
      clearTimeout(timeOutId);
    }
    timeOutId = setTimeout(() => {
      fn(...args);
    }, delay);
  };
};

export async function getPDPData(collectionURL) {
  const collection = collectionURL ? `&collection=${collectionURL}` : '';
  const queryString = `${collection}`;

  const urlParam = `${collectionURL}?sections=pdp-promotional-items${queryString}`;

  console.log('URL Param:', urlParam);

  return fetch(urlParam, {
    method: 'get',
    headers: {
      Accept: 'application/json, text/plain, */*',
      'Content-Type': 'application/json',
    },
  }).then((response) => {
    return response.text();
  });
}

export async function getFetchResponse(url, token) {
  const headers = {
    Accept: '*/*',
    'Content-Type': 'application/json',
  };
  if (token) {
    headers.Authorization = token;
  }
  const response = await fetch(url, {
    method: 'GET',
    headers,
  });
  return response;
}

export async function loadCollectionData() {
  if (sessionStorage.getItem('collectionHandle')) {
    const url = sessionStorage.getItem('collectionHandle').split('.myshopify.com')[1];
    const endpoint =
      window.location.hostname === '127.0.0.1'
        ? `http://127.0.0.1:9292${url}`
        : `https://${window.location.hostname}${url}`;

    const viewId = '?view=fit';

    const data = await getJsonData(`${endpoint}${viewId}`);
    return data.products;
  }
}

export function sortObjectsByAttribute(objectsArray, attribute) {
  return objectsArray.sort((a, b) => {
    const valueA = a[attribute].toLowerCase();
    const valueB = b[attribute].toLowerCase();

    if (valueA < valueB) {
      return -1;
    }
    if (valueA > valueB) {
      return 1;
    }
    return 0;
  });
}

// Lock Scrolling
var siteContainerEl = document.querySelector('[data-site-container]');

export function lockScrolling() {
  siteContainerEl.style.overflowY = 'hidden';
  siteContainerEl.style.height = '100dvh';
}

// Unlock Scrolling
export function unlockScrolling() {
  siteContainerEl.style.removeProperty('overflow');
  siteContainerEl.style.height = 'auto';
}

export function setCookie(name, value, days) {
  let expires = '';

  if (days && days !== '') {
    let date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = '; expires=' + date.toUTCString();
  } else {
    expires = '; expires=""';
  }

  document.cookie = `${name}=${value}${expires}; path=/`;
}

export function getCookie(name) {
  let nameEquals = name + '=';
  let ca = document.cookie.split(';');

  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') c = c.substring(1);
    if (c.indexOf(nameEquals) != -1) return c.substring(nameEquals.length, c.length);
  }

  return null;
}

export function initWishlistButtons(container = document, selector = '.wishlist-add') {
  let onSuccessList = function (listContents) {
    listContents.forEach((listItem) => {
      const swymButton = document.querySelector(`[data-epi="${listItem.epi}"]`);
      if (swymButton) swymButton.classList.add('swym-added');
    });
  };
  let onSuccess = function (lists) {
    lists.forEach((list) => {
      window._swat.fetchListCtx({ lid: list.lid }, onSuccessList, onError);
    });
  };
  let onError = function (error) {
    console.log('Error while fetching all Lists', error);
  };
  window._swat.fetchLists({
    callbackFn: onSuccess,
    errorFn: onError,
  });

  const callback = function () {
    console.log('added to wishlist');
  }; // callback can be replaced if needed
  const wishlistButtons = container.querySelectorAll(selector);
  wishlistButtons.forEach((button) => {
    button.addEventListener('click', (e) => {
      e.preventDefault();
      const buttonNode = e.target.closest('button');
      const variants = {};
      variants[buttonNode.dataset.variantTitle] = Number(buttonNode.dataset.epi);
      const buttonData = {
        epi: Number(buttonNode.dataset.epi),
        du: buttonNode.dataset.du,
        empi: Number(buttonNode.dataset.empi),
        iu: buttonNode.dataset.iu,
        pr: Number(buttonNode.dataset.pr.replace('£', '')) / 100,
        cprops: {}, // can be used to customise event in future
        variants: variants,
      };

      if (buttonNode.classList.contains('swym-added')) {
        buttonNode.classList.remove('swym-added');
        window._swat.removeFromWishList(buttonData);
      } else {
        buttonNode.classList.add('swym-added');
        window._swat.addToWishList(buttonData, callback);
      }
    });
  });
}

/**
 * Make a JSON GET request.
 *
 * @param {string} url - The URL to send the GET request to.
 * @returns {Promise} A Promise that resolves with the JSON response from the server.
 */
export async function getJsonFetchResponse(url) {
  const response = await fetch(url, {
    method: 'get',
    headers: {
      Accept: 'application/json, text/plain, */*',
      'Content-Type': 'application/json',
    },
  });
  const json = await response.json();
  return json;
}

/**
 * Make a JSON POST request.
 *
 * @param {string} url - The URL to send the POST request to.
 * @param {Object} data - The data to be sent in the request body (will be JSON.stringify'd).
 * @param {Object} [headers={}] - Optional headers to include in the request.
 * @returns {Promise} A Promise that resolves with the JSON response from the server.
 */
export async function makeJsonPostRequest(url, data, headers = {}) {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }
  const jsonResponse = await response.json();
  return jsonResponse;
}

/**
Asynchronously retrieves parameters for a given item.
Constructs a URL based on the item's handle or mappings.core.url.
Modifies the URL query string based on specified parameters.
@param {object} item - The item for which parameters are to be retrieved, including the SS mappings object and product handle.
@param {string} item.handle - The handle of the item if mappings.core.url unavailable.
@param {object} item.params - Additional parameters for customizing the request, inc lazyload, showWishlist, showStrips, showReviews, showRoundels, index & altImage.
@param {string} item.intellisuggestData - IntelliSuggest data for the item, required for Beacon tracking.
@param {string} item.intellisuggestSignature - IntelliSuggest signature for the item, required for Beacon tracking.
@returns {Promise<Response>} - A promise that resolves with the Shopify API response.
*/
export async function getParamsItem(item) {
  const url = item.handle ? `/products/${item.handle}` : item.mappings.core.url;

  const lazyload = item.params && item.params.lazyload ? '' : '&lazyload=false';
  const isSlide = item.params && item.params.isSlide ? '&slide=true' : '';
  const showWishlist = item.params && item.params.showWishlist == 'false' ? '&wishlist=false' : '';
  const showStrips = item.params && item.params.showStrips == 'false' ? '&featureStrips=false' : '';
  const showReviews = item.params && item.params.showReviews == 'false' ? '&reviews=false' : '';
  const showRoundels = item.params && item.params.showRoundels == 'false' ? '&roundels=false' : '';
  const altImage = item.params && item.params.altImage == 'true' ? '&alternatePicture=true' : '';
  const index = item.params && item.params.index !== undefined ? `&index=${item.params.index}` : '';
  const intellisuggestData = item.intellisuggestData ? `&intellisuggestData=${item.intellisuggestData}` : '';
  const intellisuggestSignature = item.intellisuggestSignature
    ? `&intellisuggestSignature=${item.intellisuggestSignature}`
    : '';

  const queryString = `${lazyload}${isSlide}${showReviews}${showRoundels}${altImage}${showWishlist}${showStrips}${intellisuggestData}${intellisuggestSignature}${index}`;
  const urlParam = `${url}?sections=product-list-item${queryString}`;
  const shopifyResponse = await fetch(urlParam, {
    method: 'get',
    headers: {
      Accept: 'application/json, text/plain, */*',
      'Content-Type': 'application/json',
    },
  });
  return shopifyResponse;
}

export async function getJsonData(endpoint) {
  try {
    let response = await fetch(endpoint);
    if (!response.ok) {
      throw new Error(`HTTP error for endpoint ${endpoint} - Status: ${response.status}`);
    }
    let data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching data:', error);
    return {};
  }
}

export async function getGADataItem(item, i) {
  // we receive an SS Item
  // we use the handle to get some shopify data
  // other parts of the data will be provided by what's in the SS item
  // perhaps we should make the call to transformSSData here
  // then merge with what's returned
  // item id and item_name need an ss fallback as required
  const url = item.handle ? `/products/${item.handle}` : item.mappings.core.url;
  const viewId = '?view=gaData';
  const data = await getJsonData(`${url}${viewId}`);
  const gaProductJson = await data;
  const amalgamatedData = transformSSData(item, gaProductJson.product, i);

  return amalgamatedData;
}

export async function getNonLazyLoadedItem(item) {
  const urlParam = `/products/${item.handle}?sections=product-list-item&lazyload=false`;
  const shopifyResponse = await fetch(urlParam, {
    method: 'get',
    headers: {
      Accept: 'application/json, text/plain, */*',
      'Content-Type': 'application/json',
    },
  });
  return shopifyResponse;
}

export async function getProductItem(item) {
  const urlParam = `/products/${item.handle}?sections=product-list-item`;
  const shopifyResponse = await fetch(urlParam, {
    method: 'get',
    headers: {
      Accept: 'application/json, text/plain, */*',
      'Content-Type': 'application/json',
    },
  });
  return shopifyResponse;
}

export function transformSSData(ssItem, gaItem = {}, index) {
  const item = ssItem.mappings ? { id: ssItem.id, ...ssItem.mappings.core } : ssItem;
  const data = {
    index,
    discount: item.msrp - item.price,
    item_brand: item.brand,
    price: item.price,
    quantity: 1,
  };
  if (item.product_type_unigram) data['item_variant'] = item.product_type_unigram;
  if (!gaItem.item_id) data['item_id'] = item.id;
  if (!gaItem.item_name) data['item_name'] = item.name;
  if (ssItem.mappings) {
    data['item_category4'] = 'Rec: ' + ssItem.params.placementTag;
  } else if (theme.relativeItemCategory) {
    data['item_category4'] = theme.relativeItemCategory;
  }
  return { ...data, ...gaItem };
}

export function sendGA4Data(items, eventName, itemListId = theme.collectionName, itemListName = theme.collectionTitle) {
  console.log(eventName);
  console.log({
    item_list_id: itemListId ? itemListId : '',
    item_list_name: itemListName ? itemListName : theme.relativeItemCategory,
    items,
  });
  gtag('event', eventName, {
    item_list_id: itemListId ? itemListId : '',
    item_list_name: itemListName ? itemListName : theme.relativeItemCategory,
    items,
  });
}
