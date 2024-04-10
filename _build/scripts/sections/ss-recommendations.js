import { getJsonFetchResponse, makeJsonPostRequest, getParamsItem, getCookie, getGADataItem, sendGA4Data } from "../plugins-imports/helpers";
const uuid = require('uuid');

const selectors = {
  recsContainer: "[data-ss-recommendations]",
  title: "[data-recs-title]",
  cartRecs: ".section-cart",
  productItem: ".product-list-item",
  slide: '.slick-slide',
  activeSlideClass: 'slick-active',
  indexAttr: 'data-index',
  skuAttr: 'data-product-sku',
}

const recommendations = {
  onLoad() {
    this.endpoints = {
      recommendations: `https://${theme.siteId}.a.searchspring.io/boost/${theme.siteId}/recommend?`,
      beacon: 'https://beacon.searchspring.io/beacon'
    }
    this.container = document.querySelector(selectors.recsContainer);
    this.title = document.querySelector(selectors.title);
    this.productItemSection = 'product-list-item';
    this.placementSettings = this.container.dataset;
    this.placementParams = {
      showReviews: this.placementSettings.enableReviews,
      showWishlist: this.placementSettings.enableWishlist,
      showStrips: this.placementSettings.enableStrips,
      showRoundels: this.placementSettings.enableRoundels,
      altImage: this.placementSettings.altImage,
      lazyload: false,
      isSlide: true,
      placementTag: this.placementSettings.tags
    };

  this.classes = {
      grid: 'is-grid',
      loadingSpinner: 'loading-spinner',
      loading: "is-loading",
    };

    this.setupCookieVariables();
    this.loadRecommendedResults();  
  },

  setupCookieVariables () {
    this.pageLoadId = uuid.v4();
    this.userId = getCookie('ssUserId');
    this.isuid = getCookie('_isuid');
    this.sessionId = getCookie('ssSessionIdNamespace');
    this.storedShopper = getCookie('ssShopperId');
    this.cart = getCookie('ssCartProducts');
    const viewedProducts = getCookie('ssViewedProducts');
    this.lastViewed = viewedProducts ? viewedProducts.split('%2C').join(',') : ''; 
  },

  createTemplateBeaconData(isParent=false) {
    const data = {
      category : "searchspring.recommendations.user-interactions",
      context : {
        pageLoadId : this.pageLoadId,
        userId : this.userId,
        sessionId : this.sessionId,
        website : {
          trackingCode : theme.siteId
        }
      },
      event: {
        context : {
          type : "product-recommendation",
          tag : this.placementSettings.tags,
        },
      },
    };
    if (isParent) {
      data.event.profile = { 
        tag : this.placementSettings.tags,
        seed : [""]
      };
      if (this.placementSettings.placement) data.event.profile.placement = this.placementSettings.placement;
    }
    if (this.placementSettings.placement) data.event.context.placement = this.placementSettings.placement;
    return data;
  },

  /**
   * Sends tracking data based on recommendations user interaction.
   *
   * @param {Array} activeItems - An array of products returned by the Searchspring API, pre-filtered to ensure they are relevant to the interaction data sent.
   * @param {String} type - The type of interaction - render, impression, interaction, click.
   *
  */
  async sendBeaconData(activeItems=[], type) {
    const beaconDataPayoad = [];
    const parentEventId = uuid.v4();
    const parentDataPayload = {
      ...this.createTemplateBeaconData(true),
      id: parentEventId,
      type: type === 'interaction' ? 'profile.click' : `profile.${type}`,
    };
    beaconDataPayoad.push(parentDataPayload);

    activeItems.forEach(item => {
      const childEventId = uuid.v4();
      const childDataPayload = {
        ...this.createTemplateBeaconData(),
        id: childEventId,
        pid: parentEventId,
        type: type === 'interaction' ? 'profile.product.impression' : `profile.product.${type}`,
      };
      childDataPayload.event.product = {
        id: item.id,
        mappings: item.mappings
      };
      beaconDataPayoad.push(childDataPayload);
    });

    const responseJson = makeJsonPostRequest(this.endpoints.beacon, beaconDataPayoad);
    return responseJson;
  },

  getActiveItems() {
    const allSlides = [...this.container.querySelectorAll(selectors.slide)];
    const activeSlides = allSlides.filter(slide => slide.classList.contains(selectors.activeSlideClass));
    const activeItems = [];
    activeSlides.forEach(slide => {
      const productItemNode = slide.querySelector(selectors.productItem);
      const index = productItemNode && productItemNode.hasAttribute(selectors.indexAttr) ? productItemNode.getAttribute(selectors.indexAttr) : false;
      if(index) {
        activeItems.push(this.currentResultsArray[index]);
      }
    });
    return activeItems;
  },

  addItemClickListeners() {
    const allItems = this.container.querySelectorAll(selectors.productItem);
    async function handleClick(e) {
      if (this.clickLogged === true) return;
      e.preventDefault();
      const productItem = e.target.classList.contains(selectors.productItem.replace('.', '')) ? e.target : e.target.closest(selectors.productItem);
      const clickedItem = this.currentResultsArray[productItem.dataset.index];
      console.log('current results length: ', this.currentResultsArray.length);
      console.log(clickedItem, productItem.dataset.index);
      if (clickedItem && clickedItem.id && clickedItem.mappings && this.gaItems) {
        const gaItem = this.gaItems.find(item => String(item.item_id) === productItem.getAttribute(selectors.skuAttr));
        sendGA4Data([gaItem], "select_item", this.placementSettings.tags, `Recommendation Placement: ${this.placementSettings.tags}`);
        await this.sendBeaconData([clickedItem], 'click');
      }
      this.clickLogged = true;
      e.target.click();
    }
    allItems.forEach(item => {
      item.addEventListener('click', handleClick.bind(this));
    });
  },

  addIntersectionObserver(element) {
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: theme.recPercentVisible
    };
    const handleIntersection = (entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const activeItems = this.getActiveItems();
          this.sendBeaconData(activeItems, 'impression');
        } 
      });
    };
    const observer = new IntersectionObserver(handleIntersection, options);
    observer.observe(element);
  },

  async loadRecommendedResults() {
    if (!this.placementSettings.tags) {
      console.error('At least one recommendations placement tag must be specified to load recommendations');
      this.title.setAttribute('hidden', 'hidden');
      return;
    }

    this.setLoading();
    const jsonResponse = await this.getSearchspringSearchApiResults();
    let resultsArray = jsonResponse.map(placement => placement.results).flat(1);
    resultsArray = resultsArray.filter(product => product.id !== this.placementSettings.productId);
    this.currentResultsArray = resultsArray;

    // logic here to pass enableReviews etc inside load of product items
    resultsArray.forEach((arrayItem, index) => arrayItem.params = { ...this.placementParams, index });
    const productItems = resultsArray ? await resultsArray.map(getParamsItem) : [];

    Promise.all(productItems).then((productItemResponses) => {
      const productItemValues = productItemResponses.map((item) => item.json());

      Promise.all(productItemValues).then((values) => {
        const resultsHtml = values.map(value => value[this.productItemSection]).join('');
        this.container.innerHTML = resultsHtml;
        if (this.placementSettings.enableSlider == 'true') this.initSlider();
        this.addItemClickListeners();
        this.setLoaded();
      });
    });
  },

  async getSearchspringSearchApiResults() {
    const product = this.placementSettings.product ? `&product=${this.placementSettings.product}` : '';
    const categories = this.placementSettings.categories ? `&categories=${this.placementSettings.categories}` : '';
    const brands = this.placementSettings.brands ? `&brands=${this.placementSettings.brands}` : '';
    const queryString = `tags=${this.placementSettings.tags}&shopper=${this.storedShopper}&cart=${this.cart}&lastViewed=${this.lastViewed}&limits=${this.placementSettings.limit}${product}${categories}${brands}`;
    const url = `${this.endpoints.recommendations}${queryString}`;
    const json = await getJsonFetchResponse(url);

    return json;
  },

  setLoading() {
    const spinner = document.createElement('div');
    spinner.classList.add(this.classes.loadingSpinner);
    this.container.appendChild(spinner);
    this.container.classList.add(this.classes.loading);
  },

  async setLoaded() {
    this.container.classList.remove(this.classes.loading);
    theme.wishlistModal();
    const gaDataItems = this.currentResultsArray.map(getGADataItem);
    const gaDataItemsValues = await Promise.all(gaDataItems);
    this.gaItems = gaDataItemsValues;

    this.sendBeaconData(this.currentResultsArray, 'render');
    sendGA4Data(this.gaItems, "view_item_list", this.placementSettings.tags, `Recommendation Placement: ${this.placementSettings.tags}`);
    this.addIntersectionObserver(this.container);
  },

  initSlider() {
    const cartRecs = document.querySelector(selectors.cartRecs);

    $('[data-ss-recommendations]').slick({
      autoplay: false,
      slidesToShow: cartRecs ? 3 : 4,
      slidesToScroll: 1,
      arrows: true,
      prevArrow: '<i class="icon-chevron-left"></i>',
      nextArrow: '<i class="icon-chevron-right"></i>',
      swipe: true,
      responsive: [
        {
          breakpoint: 1023,
          settings: {
            slidesToShow: 2,
          },
        },
      ],
    });
    $('[data-ss-recommendations]').on('afterChange', function(event, slick, direction){
      const activeItems = this.getActiveItems();
      this.sendBeaconData(activeItems, 'interaction');
    }.bind(this));
  }
};

const recsFunc = (function() {
  recommendations.onLoad()
})();

theme.sections.register('searchspring-recommendations', recsFunc);
