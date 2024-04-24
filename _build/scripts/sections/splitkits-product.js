// import { formatMoney } from '@shopify/theme-currency';
// import { getUrlWithVariant, ProductForm } from '@shopify/theme-product-form';
// import QuantityInput from '../components/quantity-input';

// const selectors = {
//   form: '[data-product-form]',
//   productFormVariantId: '[data-product-form-variant-id]',
//   featuredImagesSlider: '[data-product-images-slider]',
//   featuredImagesSliderPrev: '[data-product-images-slider-prev]',
//   featuredImagesSliderNext: '[data-product-images-slider-next]',
//   thumbnailImagesSlider: '[data-product-thumbnails-slider]',
//   priceContainer: '[data-product-price-container]',
//   priceOriginal: '[data-product-price-original]',
//   priceSaving: '[data-product-price-saving]',
//   price: '[data-product-price]',
//   unavailable: '[data-product-unavailable]',
//   submitButton: '[data-product-submit-button]',
//   submitButtonText: '[data-product-submit-button-text]',
//   qtyContainer: '[data-product-qty]',
//   qtyInput: '[data-product-qty-input]',
//   qtyMinus: '[data-product-qty-minus]',
//   qtyPlus: '[data-product-qty-plus]',
//   descriptionToggle: '[data-product-description-toggle]',
//   descriptionContent: '[data-product-description-content]',
//   productImageSlider: '[data-product-media-feature-slider]',
//   gradeInfoOption: '#grade-type',
//   productOption: 'data-option-position',
//   productPriceAttribute: 'data-product-item-price',
//   styleOptionTab: '[data-option-tab-control]',
//   styleOptionTabContent: '[data-option-tab-content]',
//   styleTopOptionTab: '[data-Top-option-tab-control]',
//   styleTopOptionTabContent: '[data-Top-option-tab-content]',
//   styleBottomOptionTab: '[data-Bottom-option-tab-control]',
//   styleBottomOptionTabContent: '[data-Bottom-option-tab-content]',
//   colourOptionTab: '[data-colour-tab-control]',
//   colourOptionTopTab: '[data-colour-top-tab-control]',
//   colourOptionBottomTab: '[data-colour-bottom-tab-control]',
//   colourOptionTabContent: '[data-colour-tab-content]',
//   colourOptionTopTabContent: '[data-colour-top-tab-content]',
//   colourOptionBottomTabContent: '[data-colour-bottom-tab-content]',
//   colourOptions: 'data-colour-option',
//   finishOptions: 'data-finish-option',
//   styleType: 'data-style-type',
//   selectedColourConfig: '[data-selected-colour]',
//   selectedFinishConfig: '[data-selected-finish]',
//   styleRadioButtons: '[name="options[Style]"]',
//   firstPaletteContainer: '#first-palette-container',
//   secondPaletteContainer: '#second-palette-container',
//   paletteStyleCoverageArea: 'data-style-coverage-area',
//   defaultImg: 'data-default-image',
//   featureImage: '.feature',
//   productMedia: '.product-media',
//   disclaimer: '[data-disclaimer-statement]',
// };

// const classes = {
//   active: 'is-active',
//   visible: 'is-visible',
//   loading: 'is-loading',
//   scrolled: 'scrolled-image',
// };

// register('product', {
//   async onLoad() {
//     let productFormElement = document.querySelector(selectors.form),
//       productHandle = productFormElement.dataset.productHandle;

//     // Fetch the product data
//     this.product = await this.getProductJson(productHandle);

//     // Init Quantity
//     this.initQuantity();

//     // Init Description Read More Button
//     this.initDescription();

//     const default_variant_id = productFormElement.dataset.productVariant;
//     if (default_variant_id) {
//       const default_variant_obj = this.product.variants.filter((x) => x.id === parseInt(default_variant_id, 10))[0];
//       if (default_variant_obj) this.updateImageSelected(default_variant_obj);
//     }

//     const tabSets = [
//       [selectors.styleOptionTab, selectors.styleOptionTabContent],
//       [selectors.styleBottomOptionTab, selectors.styleBottomOptionTabContent],
//       [selectors.styleTopOptionTab, selectors.styleTopOptionTabContent],
//       [selectors.colourOptionTab, selectors.colourOptionTabContent],
//       [selectors.colourOptionTopTab, selectors.colourOptionTopTabContent],
//       [selectors.colourOptionBottomTab, selectors.colourOptionBottomTabContent],
//     ];
//     tabSets.forEach((tabSet) => {
//       this.initOptionTabs(tabSet[0], tabSet[1]);
//     });

//     const screenWidth = window.innerWidth;
//     if (screenWidth < 1024) {
//       this.addMobileImageScroll();
//     }

//     // Initialise the Product Form last
//     let productHasOptions = this.checkProductHasOptions(this.product);
//     if (productHasOptions) {
//       this.productForm = new ProductForm(productFormElement, this.product, {
//         onOptionChange: this.onOptionChange.bind(this),
//         onQuantityChange: this.onQuantityChange.bind(this),
//         onPropertyChange: this.onPropertyChange.bind(this),
//         onFormSubmit: this.onFormSubmit.bind(this),
//       });

//       const styleRadioButtons = document.querySelectorAll(`[${selectors.colourOptions}]`);
//       styleRadioButtons.forEach((styleRadio) => {
//         styleRadio.addEventListener('change', this.onStyleSwatchChange.bind(this));
//       });

//       this.onProductPageLoad(this.productForm);
//     }
//   },

//   onUnload() {
//     console.log('Section "product":', 'Unloaded!');
//   },

//   addMobileImageScroll() {
//     const featureImageContainer = document.querySelector(selectors.featureImage);
//     const productMediaContainer = document.querySelector(selectors.productMedia);

//     let scrolling = false;
//     let scrollInteger = 0;

//     document.querySelector('.site-container').addEventListener('scroll', function (e) {
//       scrolling = true;
//       scrollInteger = e.target.scrollTop;
//     });

//     setInterval(() => {
//       if (scrolling) {
//         scrolling = false;
//         if (scrollInteger > 0) {
//           if (!featureImageContainer.classList.contains(classes.scrolled)) {
//             featureImageContainer.classList.add(classes.scrolled);
//             productMediaContainer.classList.add(classes.scrolled);
//           }
//         } else {
//           if (featureImageContainer.classList.contains(classes.scrolled)) {
//             featureImageContainer.classList.remove(classes.scrolled);
//             productMediaContainer.classList.remove(classes.scrolled);
//           }
//         }
//       }
//     }, 300);
//   },

//   initOptionTabs(tabButtonsSelector, tabPanesSelector) {
//     const tabButtons = document.querySelectorAll(tabButtonsSelector);
//     const tabPanels = document.querySelectorAll(tabPanesSelector);

//     function changeTab(e) {
//       e.preventDefault();
//       if (e.code) {
//         if (e.code !== 'ArrowRight' && e.code !== 'ArrowLeft') {
//           return;
//         }
//       }
//       let targetNode;
//       if (e.target.type === 'button' || e.target.type === 'radio') {
//         targetNode = e.target;
//       } else {
//         targetNode = e.target.closest('button');
//       }
//       targetNode.classList.add(classes.active);
//       targetNode.setAttribute('aria-selected', true);
//       const tabToSelectId = targetNode.getAttribute('aria-controls');
//       tabPanels.forEach((tabPane) => {
//         if (tabPane.id === tabToSelectId) {
//           tabPane.classList.add(classes.active);
//         } else {
//           tabPane.classList.remove(classes.active);
//         }
//       });
//       tabButtons.forEach((button) => {
//         if (button.getAttribute('aria-controls') !== tabToSelectId) {
//           button.classList.remove(classes.active);
//           button.setAttribute('aria-selected', false);
//         }
//       });
//     }

//     tabButtons.forEach((button) => {
//       button.addEventListener('click', changeTab);
//       button.addEventListener('keydown', changeTab);
//     });
//   },

//   onProductPageLoad(productForm) {
//     console.log('Product page load');
//     if (!productForm) {
//       console.warn("Product form hasn't loaded");
//       return;
//     }

//     if (productForm.variant()) {
//       let current_variant = this.productForm.variant();
//       this.updatePrice(current_variant);

//       let sliderElement = document.querySelector(selectors.productImageSlider);
//       if (sliderElement) {
//         this.imagesSlider = sliderElement.hasOwnProperty('swiper') && sliderElement.swiper ? sliderElement.swiper : null;
//       }
//       this.updateProductImage(current_variant);
//     }

//     this.convertUrlStringtoProperties();
//   },

//   convertUrlStringtoProperties() {
//     const queryString = window.location.href.split('?')[1];
//     const queryParamsArray = queryString ? queryString.split('&') : null;
//     if (queryParamsArray) {
//       queryParamsArray.forEach((param) => {
//         if (!param.includes('variant')) {
//           const [propertyName, propertyValue] = param.split('=');
//           const inputSelector = `[name="${this.dehandleizeString(propertyName)}" i][value="${this.dehandleizeString(propertyValue)}" i]`;
//           const matchingInput = document.querySelector(inputSelector);
//           if (matchingInput) {
//             matchingInput.click();
//           }
//         }
//       });
//     }
//   },

//   initDescription() {
//     const descriptionToggle = this.container.querySelector(selectors.descriptionToggle),
//       descriptionContent = this.container.querySelector(selectors.descriptionContent);

//     if (!descriptionToggle || !descriptionContent) return;

//     descriptionToggle.addEventListener('click', (event) => {
//       if (descriptionContent.hasAttribute('hidden')) {
//         descriptionToggle.parentNode.removeChild(descriptionToggle);
//         descriptionContent.removeAttribute('hidden');
//       }
//     });
//   },

//   checkProductHasOptions(product = {}) {
//     if (product.hasOwnProperty('options') && Array.isArray(product.options) && product.options.length > 0) {
//       if (product.options.filter((o) => o.hasOwnProperty('name') && o.name !== 'Title').length) {
//         return true;
//       }

//       if (product.options.filter((o) => o.hasOwnProperty('values') && o.values.indexOf('Default Title') === -1).length) {
//         return true;
//       }
//     }

//     return false;
//   },

//   async getProductJson(handle) {
//     return fetch(`/products/${handle}.js`).then((response) => {
//       return response.json();
//     });
//   },

//   onOptionChange(event) {
//     let variant = event.dataset.variant;
//     const secondPaletteDiv = document.querySelector(selectors.secondPaletteContainer);
//     const firstPaletteDiv = document.querySelector(selectors.firstPaletteContainer);

//     if (event.target.value === 'Both') {
//       firstPaletteDiv.hidden = 'true';
//       secondPaletteDiv.removeAttribute('hidden');
//       this.fetchUpdatedColoursImage(null, true);
//     } else if (event.target.value === 'Top' || event.target.value === 'Bottom') {
//       firstPaletteDiv.removeAttribute('hidden');
//       secondPaletteDiv.hidden = 'true';
//       this.fetchUpdatedColoursImage(null, true);
//     }

//     console.log('Option:', variant);

//     this.updateSelectedVariant(variant);
//     this.updatePrice(variant);
//     this.updateSubmitButton(variant);
//     this.updateBrowserHistory(event.dataset);
//     this.updateSelectedOptions(variant);
//   },

//   updateSelectedOptions(variant) {
//     const optionDisplayElements = document.querySelectorAll('[' + selectors.productOption + ']');
//     optionDisplayElements.forEach((option) => {
//       const optionPosition = option.getAttribute(selectors.productOption);
//       option.innerHTML = variant[`option${optionPosition}`];
//     });
//   },

//   onQuantityChange(event) {
//     console.log('Quantity:', event.dataset);
//   },

//   onStyleSwatchChange(event) {
//     const coverageArea = event.target.getAttribute(selectors.paletteStyleCoverageArea);

//     if (coverageArea === 'Top' || coverageArea === 'Bottom') {
//       const firstPaletteCheckedRadio = document.querySelector('input[name="properties[Colour]"]:checked');
//       if (firstPaletteCheckedRadio) {
//         firstPaletteCheckedRadio.checked = false;
//       }
//     } else {
//       const topPaletteCheckedRadio = document.querySelector('input[name="properties[Colour Top]"]:checked');
//       if (topPaletteCheckedRadio) {
//         topPaletteCheckedRadio.checked = false;
//       }
//       const bottomPaletteCheckedRadio = document.querySelector('input[name="properties[Colour Bottom]"]:checked');
//       if (bottomPaletteCheckedRadio) {
//         bottomPaletteCheckedRadio.checked = false;
//       }
//     }

//     const parentUl = event.target.closest('ul');
//     if (!parentUl.classList.contains(classes.active)) {
//       document.querySelector(`[aria-controls="${parentUl.id}" i]`).click();
//     }
//   },

//   handleizeString(string) {
//     return string.toLowerCase().trim().replace(/ /g, '-').replace(/--/g, '-');
//   },

//   dehandleizeString(string) {
//     return string.replace(/-/g, ' ');
//   },

//   onPropertyChange(event) {
//     console.log('Property:', event.dataset);
//     let imageHandle = this.product.title.split(' |')[0].replace('.', '-').replace(' ', '-').toLowerCase();

//     if (event.target.hasAttribute(selectors.colourOptions)) {
//       const selectedColour = event.target.getAttribute(selectors.colourOptions);
//       const colourConfigDisplay = document.querySelector(selectors.selectedColourConfig);
//       if (event.target.name.includes('Top')) {
//         const colourBottom = event.dataset.properties['Colour Bottom'] ? event.dataset.properties['Colour Bottom'].split('|')[0] : '';
//         colourConfigDisplay.innerHTML = `${selectedColour} / ${colourBottom}`;
//         imageHandle = colourBottom.length > 1 ? `${imageHandle}-top-${selectedColour}-bottom-${colourBottom}` : `${imageHandle}-top-${selectedColour}`;
//       } else if (event.target.name.includes('Bottom')) {
//         const colourTop = event.dataset.properties['Colour Top'] ? event.dataset.properties['Colour Top'].split('|')[0] : '';
//         colourConfigDisplay.innerHTML = `${colourTop} / ${selectedColour}`;
//         imageHandle = colourTop.length > 1 ? `${imageHandle}-top-${colourTop}-bottom-${selectedColour}` : `${imageHandle}-bottom-${selectedColour}`;
//       } else {
//         let noCoverage = true;
//         event.dataset.options.forEach((option) => {
//           if (option.value === 'Top') {
//             imageHandle = `${imageHandle}-top-${selectedColour}`;
//             noCoverage = false;
//           } else if (option.value === 'Bottom') {
//             imageHandle = `${imageHandle}-bottom-${selectedColour}`;
//             noCoverage = false;
//           }
//           if (noCoverage) {
//             imageHandle = `${imageHandle}-${selectedColour}`;
//           }
//         });
//         colourConfigDisplay.innerHTML = selectedColour;
//       }

//       const selectedStyleType = event.target.getAttribute(selectors.styleType);
//       const styleOptions = document.querySelectorAll(selectors.styleRadioButtons);
//       styleOptions.forEach((radioButton) => {
//         if (radioButton.value === selectedStyleType) {
//           radioButton.click();
//           return;
//         }
//       });

//       const updatedHandle = this.handleizeString(imageHandle);

//       this.fetchUpdatedColoursImage(updatedHandle);
//     }

//     if (event.target.hasAttribute(selectors.finishOptions)) {
//       const finishConfigDisplay = document.querySelector(selectors.selectedFinishConfig);
//       finishConfigDisplay.innerHTML = event.target.getAttribute(selectors.finishOptions);
//     }

//     this.updateBrowserHistory(event.dataset);
//   },

//   onFormSubmit(event) {
//     // event.preventDefault();
//     console.log('Submit:', event.dataset);
//   },

//   updateSelectedVariant(variant) {
//     let productFormVariantId = this.container.querySelector(selectors.productFormVariantId);
//     productFormVariantId.value = variant.id;
//   },

//   updatePrice(variant) {
//     let unavailable = this.container.querySelector(selectors.unavailable),
//       priceContainer = this.container.querySelector(selectors.priceContainer),
//       priceOriginal = this.container.querySelector(selectors.priceOriginal),
//       priceSaving = this.container.querySelector(selectors.priceSaving),
//       price = this.container.querySelector(selectors.price);

//     if (variant && price) {
      // price.innerHTML = formatMoney(variant.price, theme.moneyFormat);

//       if (priceOriginal) {
        // priceOriginal.innerHTML = formatMoney(variant.compare_at_price || 0, theme.moneyFormat);

//         if (variant.compare_at_price) {
//           priceOriginal.hidden = false;
//         } else {
//           priceOriginal.hidden = true;
//         }
//       }

//       if (priceSaving) {
//         if (variant.compare_at_price) {
//           priceSaving.innerHTML = `${100 - Math.ceil((variant.price * 100) / variant.compare_at_price)}%`;
//         } else {
//           priceSaving.innerHTML = ``;
//         }
//       }

//       if (variant.available && variant.available === true) {
//         priceContainer.hidden = false;
//       } else {
//         priceContainer.hidden = true;
//       }
//     }
//   },

//   updateSubmitButton(variant) {
//     let submitButton = this.container.querySelector(selectors.submitButton),
//       submitButtonText = this.container.querySelector(selectors.submitButtonText);

//     if (!variant) {
//       submitButton.disabled = true;
//       submitButtonText.innerText = theme.strings.unavailable;
//     } else if (variant.available) {
//       submitButton.disabled = false;
//       submitButtonText.innerText = theme.strings.addToCart;
//     } else {
//       submitButton.disabled = true;
//       submitButtonText.innerText = theme.strings.soldOut;
//     }
//   },

//   updateProductImage(variant) {
//     console.log('updateProductImage(): loaded');
//     if (!variant) return;

//     let variantImageId = variant.featured_media ? variant.featured_media.id : null;
//     if (!variantImageId) return;
//     if (!this.imagesSlider || !this.imagesSlider.slides) return;

//     let slides = this.imagesSlider.slides;

//     if (!slides) {
//       console.warn('no slider found for image selection');
//       return;
//     }

//     let slideMediaIds = [...slides].map((slide) => parseInt(slide.dataset.productMediaId, 10)).filter((x) => Boolean(x));

//     let variantSlideMediaIndex = slideMediaIds.indexOf(variantImageId);

//     if (variantSlideMediaIndex != -1) this.imagesSlider.slideTo(variantSlideMediaIndex);

//     console.log('Update Variant Image:', {
//       variant,
//     });
//   },

//   fetchUpdatedColoursImage(imageHandle, reset = false) {
//     const picture = document.querySelector('picture');
//     const image = picture.querySelector('img');
//     if (reset) {
//       const originalImageUrl = image.getAttribute(selectors.defaultImg);
//       image.setAttribute('src', originalImageUrl);
//       return;
//     }
//     const srcSets = picture.querySelectorAll('source');
//     srcSets.forEach((source) => source.remove());
//     const featureImageContainer = document.querySelector(selectors.featureImage);
//     featureImageContainer.classList.add(classes.loading);
//     image.setAttribute('src', `https://cdn.shopify.com/s/files/1/0555/7216/8841/files/${imageHandle}.png`);
//     document.querySelector(selectors.disclaimer).classList.add(classes.visible);
//   },

//   updateBrowserHistory(dataset) {
//     const variant = dataset ? dataset.variant : null;

//     if (!variant) return;
//     let url = getUrlWithVariant(window.location.href.split('&properties')[0], variant.id);
//     let propertiesQuerystring = '';

//     if (dataset.properties) {
//       for (var prop in dataset.properties) {
//         const propertyName = this.handleizeString(prop);
//         const propertyValue = this.handleizeString(dataset.properties[prop]);
//         const propertyUrlSegment = `&properties[${propertyName}]=${propertyValue}`;
//         propertiesQuerystring += propertyUrlSegment;
//       }
//     }

//     if (propertiesQuerystring.includes('[colour-top]') || propertiesQuerystring.includes('[colour-bottom]')) {
//       if (propertiesQuerystring.includes('[colour]')) {
//         let bothSelected = false;
//         dataset.options.forEach((option) => {
//           if (option.value === 'Both') {
//             bothSelected = true;
//           }
//         });
//         if (bothSelected) {
//           const [discardedString, ...queryParamsArray] = propertiesQuerystring.split('&properties[colour]')[1].split('&');
//           propertiesQuerystring = `&${queryParamsArray.join('&')}`;
//         } else {
//           const queryParamsArray = propertiesQuerystring.split('&');
//           propertiesQuerystring = '';
//           queryParamsArray.forEach((queryParam) => {
//             if (queryParam.includes('[colour]') || queryParam.includes('[finish]')) {
//               propertiesQuerystring += `&${queryParam}`;
//             }
//           });
//         }
//       }
//     }

//     url = url + propertiesQuerystring;

//     window.history.replaceState({ path: url }, '', url);
//   },

//   initQuantity() {
//     let qtyContainerElement = document.querySelector(selectors.qtyContainer),
//       qtyInputElement = qtyContainerElement.querySelector(selectors.qtyInput),
//       qtyMinusElement = qtyContainerElement.querySelector(selectors.qtyMinus),
//       qtyPlusElement = qtyContainerElement.querySelector(selectors.qtyPlus);

//     if (qtyContainerElement && qtyInputElement && qtyMinusElement && qtyPlusElement) {
//       return new QuantityInput(qtyContainerElement, qtyInputElement, qtyPlusElement, qtyMinusElement);
//     }

//     return;
//   },
// });
