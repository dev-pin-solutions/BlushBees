// popup-shadow.js
// This version uses a Shadow DOM-based custom element to encapsulate your widget.
// Updated for better mobile responsiveness with Tailwind CSS, ensuring larger text,
// bigger inputs, and a taller modal on smaller screens.

// 1) Define a custom element class
class MyWidget extends HTMLElement {
    constructor() {
      super();
      // Attach a shadow root so that styles are scoped
      this.shadow = this.attachShadow({ mode: 'open' });
    }
  
    connectedCallback() {
      ///////////////////////////////////////////////////////////////////////
      // ADDED => Create a reference to your shadow root
      ///////////////////////////////////////////////////////////////////////
      const shadow = this.shadow;  // <-- ADDED
      ///////////////////////////////////////////////////////////////////////
      // "document.activeElement" won't see inside the Shadow DOM,
      // so we must use `shadow.activeElement` instead.
      ///////////////////////////////////////////////////////////////////////
  
      // NOTE: We remove "document.addEventListener('DOMContentLoaded', ...)" because
      // the code is now executed inside connectedCallback of our custom element.
  
      ///////////////////////////////////////////////////////////////////////
      // (1) Add this new helper function at the top of connectedCallback()
      ///////////////////////////////////////////////////////////////////////
      function getOrCreateTrackingId() {
        // Try localStorage first (so we reuse the same ID on subsequent visits)
        let storedId = localStorage.getItem('myTrackingId');
        if (!storedId) {
          storedId = 'ID_' + Math.random().toString(36).substr(2, 9);
          localStorage.setItem('myTrackingId', storedId);
        }
        return storedId;
      }
  
      ///////////////////////////////////////////////////////////////////////
      // 1) Create a dedicated container for the entire widget
      ///////////////////////////////////////////////////////////////////////
      const widgetContainer = document.createElement('div');
      widgetContainer.id = 'myWidgetContainer';
  
      // Instead of appending to the body, append to the shadow root
      this.shadow.appendChild(widgetContainer);
  
      ///////////////////////////////////////////////////////////////////////
      // 2) Load Tailwind CSS into the Shadow Root
      ///////////////////////////////////////////////////////////////////////
      const link = document.createElement('link');
      link.href = 'https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css';
      link.rel = 'stylesheet';
      // Append to the shadow root so Tailwind doesn't affect the global page
      this.shadow.appendChild(link);
  
      ///////////////////////////////////////////////////////////////////////
      // 3) Define our shared styles (prefixed with #myWidgetContainer)
      ///////////////////////////////////////////////////////////////////////
      const styleElement = document.createElement('style');
      styleElement.textContent = `
      /* Scale up the popup on medium+ screens but keep it taller on mobile */
      #myWidgetContainer #popupContainer {
          transition: transform 0.3s ease-in-out;
      }
      @media (min-width: 768px) {
          #myWidgetContainer #popupContainer {
              transform: scale(1);
          }
      }
  
      /* Smooth ring spin */
      @keyframes ringSpin {
        0%   { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      #myWidgetContainer .ring-spin {
        animation: ringSpin 2s linear infinite;
      }
  
      /* Single-run ping animation */
      @keyframes pingOnce {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(2.5); opacity: 0.5; }
          100% { transform: scale(2); opacity: 0; }
      }
      #myWidgetContainer .animate-ping-once {
          animation: pingOnce 1.5s cubic-bezier(0.4, 0, 0.2, 1) 1;
      }
  
      /* Fade-in animation for the popup container */
      @keyframes popupFadeIn {
          from { opacity: 0}
          to { opacity: 1}
      }
      #myWidgetContainer #popupContainer {
          animation: popupFadeIn 0.5s ease-out forwards;
      }
  
      /* Fade-out animations */
      @keyframes fadeOut {
          from { opacity: 1; transform: scale(1); }
          to { opacity: 0; transform: scale(0.9); }
      }
      #myWidgetContainer .fade-out {
          animation: fadeOut 0.5s ease-in forwards;
      }
  
      /* Breathing animation */
      @keyframes breathe {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.10); }
      }
      #myWidgetContainer .breathe {
          animation: breathe 2s ease-in-out infinite;
      }
  
      /* "Thanks!" overlay */
      #myWidgetContainer #thanksOverlay {
          opacity: 0; /* Start hidden */
          transition: opacity 0.5s ease-in-out; /* Smooth fade-in transition */
          animation: fadeInOverlay 0.5s ease-in-out forwards; /* Add animation */
      }
  
      @keyframes fadeInOverlay {
          from { opacity: 0; }
          to { opacity: 1; }
      }
  
      #myWidgetContainer .loading-dots {
          font-size: 0.4em;  /* Make dots smaller */
          margin-left: 0.5em;
      }
  
      @keyframes highlightPulse {
          0%, 100% { transform: scale(1); }
          50%      { transform: scale(1.1); }
      }
      #myWidgetContainer .highlight-pulse {
          animation: highlightPulse 0.6s ease-in-out infinite alternate;
      }
  
      /* Minimal custom dropdown styling */
      #myWidgetContainer .dropdown-list {
          min-width: 180px;
          border: 1px solid #ccc;
          background-color: #fff;
          border-radius: 0.25rem;
          max-height: 200px;
          overflow-y: auto;
      }
      #myWidgetContainer .dropdown-list li {
          display: flex;
          align-items: center;
          gap: 0.5rem;
      }
  
      /* Smooth spin animation for toggling checkbox */
      @keyframes spinCheck {
        0% {
          transform: scale(1) rotate(0deg);
        }
        50% {
          transform: scale(1.1) rotate(180deg);
        }
        100% {
          transform: scale(1) rotate(360deg);
        }
      }
      #myWidgetContainer .spin-anim {
        animation: spinCheck 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      }

      #myWidgetContainer .custom-name-width {
        @media (min-width: 768px) { 
          max-width: 26.25rem !important; 
        }
      }

      /* Container for the custom checkbox */
      #myWidgetContainer .custom-checkbox-container {
        width: 28px;
        height: 28px;
        position: relative;
        display: inline-block;
        cursor: pointer;
        flex-shrink: 0;
        margin-top: 2px;
      }
      /* The hidden native checkbox */
      #myWidgetContainer .custom-checkbox-input {
        position: absolute;
        width: 100%;
        height: 100%;
        opacity: 0;
        cursor: pointer;
        z-index: 2;
      }
      /* The styled box:
         - Gray or green border
         - Transparent interior
      */
      #myWidgetContainer .custom-checkbox-box {
        width: 100%;
        height: 100%;
        border: 2px solid #ccc; /* Start off gray */
        border-radius: 4px;
        background-color: transparent;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      /* The check icon is hidden by default */
      #myWidgetContainer .check-icon {
        display: none;
        width: 20px;
        height: 20px;
        color: #10B981; /* stroke color via stroke="currentColor" */
        fill: none;
      }
      /* Show the check icon when checkbox is checked */
      #myWidgetContainer .custom-checkbox-input:checked ~ .custom-checkbox-box .check-icon {
        display: block;
      }
      /* Show the green border + checkmark icon only when checked */
      #myWidgetContainer .custom-checkbox-input:checked ~ .custom-checkbox-box {
          border-color: #10B981; /* Green outline */
      }
  
      /* Pulsing effect for toggling */
      @keyframes clickHerePulse {
        0%, 100%   { transform: scale(1); }
        20%        { transform: scale(1.15); }
        40%        { transform: scale(0.9); }
        60%        { transform: scale(1.1); }
        80%        { transform: scale(0.95); }
      }
      #myWidgetContainer .checkbox-green {
        border-color: #10B981 !important;
      }
      @keyframes flashGreenBorder {
        0%, 100% {
          border-color: #ccc;      /* Gray */
        }
        50% {
          border-color: #10B981;   /* Green */
        }
      }
      #myWidgetContainer .flash-green-border {
        animation: flashGreenBorder 1s ease-in-out infinite;
      }
  
      /* Additional custom classes */
      @keyframes scalePulse {
        0%, 100% {
          transform: scale(1);
        }
        50% {
          transform: scale(1.15);
        }
      }
      #myWidgetContainer .z-custom-popup {
        z-index: 9999999999; /* Updated: Now extremely high for the closest layer */
      }
      #myWidgetContainer .scale-pulse {
        animation: scalePulse 1s infinite ease-in-out;
      }
  
      /* Combine border color flashes + enlargement into one animation */
      @keyframes borderAndScale {
        0%, 100% {
          border-color: #ccc;
          transform: scale(1);
        }
        20% {
          transform: scale(1.15);
        }
        40% {
          transform: scale(0.9);
        }
        50% {
          border-color: #10B981;
          transform: scale(1.05);
        }
        60% {
          transform: scale(1.1);
        }
        80% {
          transform: scale(0.95);
        }
      }
      #myWidgetContainer .border-and-scale {
        animation: borderAndScale 1.5s infinite ease-in-out;
      }
  
      /* Apply base font-size only on screens smaller than 768px */
      @media (max-width: 767px) {
        #myWidgetContainer input,
        #myWidgetContainer select,
        #myWidgetContainer textarea,
        #myWidgetContainer button#countrySelectBtn,
        #myWidgetContainer .dropdown-list li,
        #myWidgetContainer #countrySearchInput {
          font-size: 16px !important;
          -webkit-text-size-adjust: 100%;
        }
      }
      @media (max-width: 767px) {
        #myWidgetContainer #popupContainer {
          transform: scale(0.8); /* Adjust the scale value as needed */
        }
      }
      `;
      // Append these scoped styles to the shadow root
      this.shadow.appendChild(styleElement);
  
      ///////////////////////////////////////////////////////////////////////
      // 4) Extra style for continuous pulsing + ensuring spinner visibility
      ///////////////////////////////////////////////////////////////////////
      const enlargeStyleTag = document.createElement('style');
      enlargeStyleTag.textContent = `
          @keyframes continuousPulse {
              0% { transform: scale(1); }
              50% { transform: scale(1.10); }
              100% { transform: scale(1); }
          }
          #myWidgetContainer .enlarge-effect {
              animation: continuousPulse 1s ease-in-out infinite;
          }
          #myWidgetContainer #spinner {
              z-index: 1000; /* Ensure visibility above elements */
          }
      `;
      this.shadow.appendChild(enlargeStyleTag);
  
      ///////////////////////////////////////////////////////////////////////
      // 5) Create the popup HTML, wrapped within #myWidgetContainer
      ///////////////////////////////////////////////////////////////////////
      const popupHTML = `
          <div id="popup"
               class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 hidden z-50 z-custom-popup overflow-y-auto"
          >
              <!-- Outer Container => For background and layout -->
              <div id="popupContainer"
                   class="
                      w-full
                      max-w-full
                      md:max-w-2xl
                      bg-[#fafafa]
                      rounded-lg
                      shadow-lg
                      relative
                      p-4
                      md:p-6
                      text-xl
                      md:text-base
                      min-h-[90vh]
                      md:min-h-0
                   "
                   style="background-color: #fafafa;"
              >
                  <!-- Close button (scaled for all breakpoints) -->
                  <span
                      class="close absolute top-2 left-2 text-3xl md:text-xl text-gray-600 hover:text-gray-900 cursor-pointer"
                  >
                      &times;
                  </span>
  
                  <!-- Title: ensure at least 18px on mobile, larger on MD+ -->
                  <h2 class="text-[18px] md:text-2xl font-bold text-center mb-6 mt-2">
                      Add to Cart
                  </h2>
  
                  <!-- "Thanks!" overlay -->
                  <div
                      id="thanksOverlay"
                      class="transition-all duration-500 ease-in-out
                             absolute inset-0 bg-green-200 bg-opacity-90 rounded-lg z-50 flex items-center justify-center
                             hidden"
                  >
                      <div class="relative flex flex-col items-center">
                          <h3 class="text-3xl md:text-2xl font-bold text-green-800 mb-2">Continuing to Checkout...</h3>
                      </div>
                  </div>
  
                  <!-- Inner container => white background with border -->
                  <div class="bg-white border border-gray-200 rounded-lg p-4 md:p-6">
                      <form class="space-y-6">
                          <!-- Name -->
                          <div class="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:gap-2">
                              <!-- Label: 18px on mobile -->
                              <label
                                  for="name"
                                  class="md:w-32 font-medium text-[18px] md:text-lg text-gray-700 text-left whitespace-nowrap"
                              >
                                  Name *
                              </label>
                              <div class="w-full custom-name-width">
                                  <!-- Input: 18px on mobile -->
                                  <input
                                      type="text"
                                      id="name"
                                      placeholder="Full Name"
                                      required
                                      class="
                                          w-full
                                          p-3
                                          md:p-2
                                          border border-gray-300
                                          rounded
                                          focus:outline-none
                                          focus:ring-1
                                          focus:ring-green-500
                                          text-[18px]
                                          md:text-base
                                          md:ml-4
                                      "
                                  >
                              </div>
                          </div>
  
                          <!-- Country code dropdown + phone -->
                          <div class="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:gap-2 mt-2">
                              <!-- Label: 18px on mobile -->
                              <label
                                  for="phone"
                                  class="md:w-32 font-medium text-[18px] md:text-lg text-gray-700 text-left whitespace-nowrap"
                              >
                                  Phone number *
                              </label>
                              <div class="w-full md:max-w-md">
                                  <div class="flex items-center md:space-x-6 space-x-2">
                                      <div class="relative w-24">
                                          <button
                                              id="countrySelectBtn"
                                              type="button"
                                              class="
                                                  w-full
                                                  p-4
                                                  md:p-2
                                                  border border-gray-300
                                                  rounded
                                                  hover:bg-gray-50
                                                  focus:outline-none
                                                  focus:ring-1
                                                  focus:ring-green-500
                                                  flex items-center
                                                  justify-between
                                                  text-[18px]
                                                  md:text-base
                                                  md:ml-4
                                                  md:mr-4
                                              "
                                          >
                                              <img
                                                  id="countryFlagImg"
                                                  src="https://flagcdn.com/32x24/us.png"
                                                  alt="United States"
                                                  class="inline-block w-4 h-3 mr-1"
                                              >
                                              <span
                                                  id="countryDisplay"
                                              >
                                                  +1
                                              </span>
                                              <svg
                                                  class="ml-1 w-3 h-3 text-gray-500"
                                                  fill="none"
                                                  stroke="currentColor"
                                                  viewBox="0 0 24 24"
                                                  xmlns="http://www.w3.org/2000/svg"
                                              >
                                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                        d="M19 9l-7 7-7-7">
                                                  </path>
                                              </svg>
                                          </button>
                                          <ul
                                              id="countrySelectList"
                                              class="dropdown-list absolute left-0 mt-1 w-full shadow-lg rounded hidden z-10"
                                          >
                                              <!-- Populated via JS -->
                                          </ul>
                                      </div>
                                      <!-- Input at 18px -->
                                      <input
                                          type="text"
                                          id="phone"
                                          placeholder="Number"
                                          required
                                          class="
                                              w-full
                                              p-3
                                              md:p-2
                                              border border-gray-300
                                              rounded
                                              focus:outline-none
                                              focus:ring-1
                                              focus:ring-green-500
                                              text-[18px]
                                              md:text-base
                                              md:ml-4
                                          "
                                      >
                                  </div>
                              </div>
                          </div>
  
                          <!-- Consent checkbox + Confirm button side by side -->
                          <div class="space-y-4">
                              <div class="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
                                  <!-- Custom Checkbox Wrapper -->
                                  <div class="flex items-center space-x-2 w-full md:w-3/4 justify-center md:justify-start">
                                      <label class="custom-checkbox-container">
                                          <!-- Hidden native checkbox -->
                                          <input
                                              type="checkbox"
                                              id="consent"
                                              class="custom-checkbox-input"
                                          />
                                          <!-- The styled box plus check icon -->
                                          <div class="custom-checkbox-box">
                                              <!-- Thin, clean checkmark -->
                                              <svg
                                                  class="check-icon"
                                                  viewBox="0 0 24 24"
                                                  stroke="currentColor"
                                                  stroke-width="2"
                                                  stroke-linecap="round"
                                                  stroke-linejoin="round"
                                              >
                                                  <path d="M20 6L9 17l-5-5" />
                                              </svg>
                                          </div>
                                      </label>
  
                                      <!-- This text remains at default scale -->
                                      <label for="consent"
                                          class="pl-2 text-base text-gray-700 flex-1 text-center md:text-left"
                                      >
                                          By checking this box, you consent to receive marketing SMS + Whatsapp messages
                                          from Blushbees at the number provided.
                                      </label>
                                  </div>
  
                                  <!-- Confirm button (moved left, simple styling) -->
                                  <div class="relative flex items-center w-full md:w-auto justify-center hover:justify-center transition-all duration-300">
                                      <button
                                          type="button"
                                          id="confirm"
                                          class="
                                              bg-gray-300
                                              text-gray-500
                                              cursor-not-allowed
                                              px-8 py-4
                                              text-2xl
                                              md:px-8
                                              md:py-4
                                              md:text-xl
                                              rounded
                                          "
                                      >
                                          Continue
                                      </button>
  
                                      <!-- Spinner container (placed to the right of the Check/Confirm button) -->
                                      <div
                                        id="spinner"
                                        class="hidden ml-3 relative flex items-center justify-center h-8 w-8 ring-spin"
                                      >
                                        <!-- 8 small green dots arranged around the ring -->
                                        <div
                                          class="absolute bg-green-500 rounded-full"
                                          style="height: 3px; width: 3px; transform: rotate(0deg) translateX(10px);"
                                        ></div>
                                        <div
                                          class="absolute bg-green-500 rounded-full"
                                          style="height: 3px; width: 3px; transform: rotate(45deg) translateX(10px);"
                                        ></div>
                                        <div
                                          class="absolute bg-green-500 rounded-full"
                                          style="height: 3px; width: 3px; transform: rotate(90deg) translateX(10px);"
                                        ></div>
                                        <div
                                          class="absolute bg-green-500 rounded-full"
                                          style="height: 3px; width: 3px; transform: rotate(135deg) translateX(10px);"
                                        ></div>
                                        <div
                                          class="absolute bg-green-500 rounded-full"
                                          style="height: 3px; width: 3px; transform: rotate(180deg) translateX(10px);"
                                        ></div>
                                        <div
                                          class="absolute bg-green-500 rounded-full"
                                          style="height: 3px; width: 3px; transform: rotate(225deg) translateX(10px);"
                                        ></div>
                                        <div
                                          class="absolute bg-green-500 rounded-full"
                                          style="height: 3px; width: 3px; transform: rotate(270deg) translateX(10px);"
                                        ></div>
                                        <div
                                          class="absolute bg-green-500 rounded-full"
                                          style="height: 3px; width: 3px; transform: rotate(315deg) translateX(10px);"
                                        ></div>
                                      </div>
                                  </div>
                              </div>
                          </div>
                      </form>
                  </div>
  
                  <!-- Button row, outside the inner container -->
                  <div class="flex items-center justify-center mt-10 md:mt-12">
                      <button
                          type="button"
                          id="checkoutBtn"
                          class="
                            border border-gray-300
                            rounded-lg
                            px-6 py-3
                            md:px-4 md:py-2
                            text-lg
                            md:text-base
                            bg-white
                            text-gray-800
                            hover:bg-gray-100
                            transition-colors
                            duration-200
                            focus:outline-none
                            focus:ring-2 focus:ring-gray-300
                          "
                      >
                          Continue to Checkout
                      </button>
                  </div>
              </div>
          </div>
      `;
  
      ///////////////////////////////////////////////////////////////////////
      // 6) Insert our popup markup inside #myWidgetContainer
      ///////////////////////////////////////////////////////////////////////
      widgetContainer.insertAdjacentHTML('beforeend', popupHTML);
  
      ///////////////////////////////////////////////////////////////////////
      // 7) JavaScript logic: now use widgetContainer.querySelector(...)
      ///////////////////////////////////////////////////////////////////////
      const popup = widgetContainer.querySelector('#popup');
      const popupContainer = widgetContainer.querySelector('#popupContainer');
      const closePopupButton = widgetContainer.querySelector('.close');
      const confirmButton = widgetContainer.querySelector('#confirm');
      const nameInput = widgetContainer.querySelector('#name');
      const consentCheckbox = widgetContainer.querySelector('#consent');
      const thanksOverlay = widgetContainer.querySelector('#thanksOverlay');
      const checkoutBtn = widgetContainer.querySelector('#checkoutBtn');
  
      // Elements for the new country dropdown & phone
      const countrySelectBtn = widgetContainer.querySelector('#countrySelectBtn');
      const countrySelectList = widgetContainer.querySelector('#countrySelectList');
      const countryFlagImg = widgetContainer.querySelector('#countryFlagImg');
      const countryDisplay = widgetContainer.querySelector('#countryDisplay');
      const phoneInput = widgetContainer.querySelector('#phone');
  
      let isConfirmed = false;
      let isSubmitted = false;
      let thanksShown = false;
  
      ///////////////////////////////////////////////////////////////////////
      // 1) The updated countries array with only United States, Canada, and UK
      ///////////////////////////////////////////////////////////////////////
      const countries = [
        {
          "name": "Afghanistan",
          "code": "+93",
          "phoneMin": 9,
          "phoneMax": 9,
          "flagUrl": "https://flagcdn.com/32x24/af.png"
        },
        {
          "name": "Albania",
          "code": "+355",
          "phoneMin": 3,
          "phoneMax": 9,
          "flagUrl": "https://flagcdn.com/32x24/al.png"
        },
        {
          "name": "Algeria",
          "code": "+213",
          "phoneMin": 8,
          "phoneMax": 10,
          "flagUrl": "https://flagcdn.com/32x24/dz.png"
        },
        {
          "name": "Andorra",
          "code": "+376",
          "phoneMin": 6,
          "phoneMax": 9,
          "flagUrl": "https://flagcdn.com/32x24/ad.png"
        },
        {
          "name": "Angola",
          "code": "+244",
          "phoneMin": 9,
          "phoneMax": 9,
          "flagUrl": "https://flagcdn.com/32x24/ao.png"
        },
        {
          "name": "Antigua and Barbuda",
          "code": "+1-268",
          "phoneMin": 7,
          "phoneMax": 7,
          "flagUrl": "https://flagcdn.com/32x24/ag.png"
        },
        {
          "name": "Argentina",
          "code": "+54",
          "phoneMin": 10,
          "phoneMax": 11,
          "flagUrl": "https://flagcdn.com/32x24/ar.png"
        },
        {
          "name": "Armenia",
          "code": "+374",
          "phoneMin": 8,
          "phoneMax": 8,
          "flagUrl": "https://flagcdn.com/32x24/am.png"
        },
        {
          "name": "Australia",
          "code": "+61",
          "phoneMin": 5,
          "phoneMax": 15,
          "flagUrl": "https://flagcdn.com/32x24/au.png"
        },
        {
          "name": "Austria",
          "code": "+43",
          "phoneMin": 4,
          "phoneMax": 13,
          "flagUrl": "https://flagcdn.com/32x24/at.png"
        },
        {
          "name": "Azerbaijan",
          "code": "+994",
          "phoneMin": 8,
          "phoneMax": 9,
          "flagUrl": "https://flagcdn.com/32x24/az.png"
        },
        {
          "name": "Bahamas",
          "code": "+1-242",
          "phoneMin": 7,
          "phoneMax": 7,
          "flagUrl": "https://flagcdn.com/32x24/bs.png"
        },
        {
          "name": "Bahrain",
          "code": "+973",
          "phoneMin": 8,
          "phoneMax": 8,
          "flagUrl": "https://flagcdn.com/32x24/bh.png"
        },
        {
          "name": "Bangladesh",
          "code": "+880",
          "phoneMin": 6,
          "phoneMax": 11,
          "flagUrl": "https://flagcdn.com/32x24/bd.png"
        },
        {
          "name": "Barbados",
          "code": "+1-246",
          "phoneMin": 7,
          "phoneMax": 7,
          "flagUrl": "https://flagcdn.com/32x24/bb.png"
        },
        {
          "name": "Belarus",
          "code": "+375",
          "phoneMin": 9,
          "phoneMax": 10,
          "flagUrl": "https://flagcdn.com/32x24/by.png"
        },
        {
          "name": "Belgium",
          "code": "+32",
          "phoneMin": 8,
          "phoneMax": 9,
          "flagUrl": "https://flagcdn.com/32x24/be.png"
        },
        {
          "name": "Belize",
          "code": "+501",
          "phoneMin": 7,
          "phoneMax": 7,
          "flagUrl": "https://flagcdn.com/32x24/bz.png"
        },
        {
          "name": "Benin",
          "code": "+229",
          "phoneMin": 8,
          "phoneMax": 8,
          "flagUrl": "https://flagcdn.com/32x24/bj.png"
        },
        {
          "name": "Bhutan",
          "code": "+975",
          "phoneMin": 7,
          "phoneMax": 8,
          "flagUrl": "https://flagcdn.com/32x24/bt.png"
        },
        {
          "name": "Bolivia",
          "code": "+591",
          "phoneMin": 8,
          "phoneMax": 8,
          "flagUrl": "https://flagcdn.com/32x24/bo.png"
        },
        {
          "name": "Bosnia and Herzegovina",
          "code": "+387",
          "phoneMin": 8,
          "phoneMax": 8,
          "flagUrl": "https://flagcdn.com/32x24/ba.png"
        },
        {
          "name": "Botswana",
          "code": "+267",
          "phoneMin": 7,
          "phoneMax": 8,
          "flagUrl": "https://flagcdn.com/32x24/bw.png"
        },
        {
          "name": "Brazil",
          "code": "+55",
          "phoneMin": 10,
          "phoneMax": 11,
          "flagUrl": "https://flagcdn.com/32x24/br.png"
        },
        {
          "name": "Brunei",
          "code": "+673",
          "phoneMin": 7,
          "phoneMax": 7,
          "flagUrl": "https://flagcdn.com/32x24/bn.png"
        },
        {
          "name": "Bulgaria",
          "code": "+359",
          "phoneMin": 7,
          "phoneMax": 9,
          "flagUrl": "https://flagcdn.com/32x24/bg.png"
        },
        {
          "name": "Burkina Faso",
          "code": "+226",
          "phoneMin": 8,
          "phoneMax": 8,
          "flagUrl": "https://flagcdn.com/32x24/bf.png"
        },
        {
          "name": "Burundi",
          "code": "+257",
          "phoneMin": 8,
          "phoneMax": 8,
          "flagUrl": "https://flagcdn.com/32x24/bi.png"
        },
        {
          "name": "Côte d Ivoire",
          "code": "+225",
          "phoneMin": 8,
          "phoneMax": 8,
          "flagUrl": "https://flagcdn.com/32x24/ci.png"
        },
        {
          "name": "Cabo Verde",
          "code": "+238",
          "phoneMin": 7,
          "phoneMax": 7,
          "flagUrl": "https://flagcdn.com/32x24/cv.png"
        },
        {
          "name": "Cambodia",
          "code": "+855",
          "phoneMin": 8,
          "phoneMax": 8,
          "flagUrl": "https://flagcdn.com/32x24/kh.png"
        },
        {
          "name": "Cameroon",
          "code": "+237",
          "phoneMin": 8,
          "phoneMax": 8,
          "flagUrl": "https://flagcdn.com/32x24/cm.png"
        },
        {
          "name": "Canada",
          "code": "+1",
          "phoneMin": 10,
          "phoneMax": 10,
          "flagUrl": "https://flagcdn.com/32x24/ca.png"
        },
        {
          "name": "Central African Republic",
          "code": "+236",
          "phoneMin": 8,
          "phoneMax": 8,
          "flagUrl": "https://flagcdn.com/32x24/cf.png"
        },
        {
          "name": "Chad",
          "code": "+235",
          "phoneMin": 8,
          "phoneMax": 8,
          "flagUrl": "https://flagcdn.com/32x24/td.png"
        },
        {
          "name": "Chile",
          "code": "+56",
          "phoneMin": 8,
          "phoneMax": 9,
          "flagUrl": "https://flagcdn.com/32x24/cl.png"
        },
        {
          "name": "China",
          "code": "+86",
          "phoneMin": 5,
          "phoneMax": 12,
          "flagUrl": "https://flagcdn.com/32x24/cn.png"
        },
        {
          "name": "Colombia",
          "code": "+57",
          "phoneMin": 8,
          "phoneMax": 10,
          "flagUrl": "https://flagcdn.com/32x24/co.png"
        },
        {
          "name": "Comoros",
          "code": "+269",
          "phoneMin": 7,
          "phoneMax": 7,
          "flagUrl": "https://flagcdn.com/32x24/km.png"
        },
        {
          "name": "Costa Rica",
          "code": "+506",
          "phoneMin": 8,
          "phoneMax": 8,
          "flagUrl": "https://flagcdn.com/32x24/cr.png"
        },
        {
          "name": "Croatia",
          "code": "+385",
          "phoneMin": 8,
          "phoneMax": 12,
          "flagUrl": "https://flagcdn.com/32x24/hr.png"
        },
        {
          "name": "Cuba",
          "code": "+53",
          "phoneMin": 6,
          "phoneMax": 8,
          "flagUrl": "https://flagcdn.com/32x24/cu.png"
        },
        {
          "name": "Cyprus",
          "code": "+357",
          "phoneMin": 8,
          "phoneMax": 11,
          "flagUrl": "https://flagcdn.com/32x24/cy.png"
        },
        {
          "name": "Czech Republic",
          "code": "+420",
          "phoneMin": 4,
          "phoneMax": 12,
          "flagUrl": "https://flagcdn.com/32x24/cz.png"
        },
        {
          "name": "Democratic Republic of the Congo",
          "code": "+243",
          "phoneMin": 5,
          "phoneMax": 9,
          "flagUrl": "https://flagcdn.com/32x24/cd.png"
        },
        {
          "name": "Denmark",
          "code": "+45",
          "phoneMin": 8,
          "phoneMax": 8,
          "flagUrl": "https://flagcdn.com/32x24/dk.png"
        },
        {
          "name": "Djibouti",
          "code": "+253",
          "phoneMin": 6,
          "phoneMax": 6,
          "flagUrl": "https://flagcdn.com/32x24/dj.png"
        },
        {
          "name": "Dominica",
          "code": "+1-767",
          "phoneMin": 7,
          "phoneMax": 7,
          "flagUrl": "https://flagcdn.com/32x24/dm.png"
        },
        {
          "name": "Dominican Republic",
          "code": "+1-809",
          "phoneMin": 7,
          "phoneMax": 7,
          "flagUrl": "https://flagcdn.com/32x24/do.png"
        },
        {
          "name": "Ecuador",
          "code": "+593",
          "phoneMin": 8,
          "phoneMax": 8,
          "flagUrl": "https://flagcdn.com/32x24/ec.png"
        },
        {
          "name": "Egypt",
          "code": "+20",
          "phoneMin": 7,
          "phoneMax": 11,
          "flagUrl": "https://flagcdn.com/32x24/eg.png"
        },
        {
          "name": "El Salvador",
          "code": "+503",
          "phoneMin": 7,
          "phoneMax": 11,
          "flagUrl": "https://flagcdn.com/32x24/sv.png"
        },
        {
          "name": "Equatorial Guinea",
          "code": "+240",
          "phoneMin": 9,
          "phoneMax": 9,
          "flagUrl": "https://flagcdn.com/32x24/gq.png"
        },
        {
          "name": "Eritrea",
          "code": "+291",
          "phoneMin": 7,
          "phoneMax": 7,
          "flagUrl": "https://flagcdn.com/32x24/er.png"
        },
        {
          "name": "Estonia",
          "code": "+372",
          "phoneMin": 7,
          "phoneMax": 10,
          "flagUrl": "https://flagcdn.com/32x24/ee.png"
        },
        {
          "name": "Eswatini",
          "code": "+268",
          "phoneMin": 7,
          "phoneMax": 8,
          "flagUrl": "https://flagcdn.com/32x24/sz.png"
        },
        {
          "name": "Ethiopia",
          "code": "+251",
          "phoneMin": 9,
          "phoneMax": 9,
          "flagUrl": "https://flagcdn.com/32x24/et.png"
        },
        {
          "name": "Federated States of Micronesia",
          "code": "+691",
          "phoneMin": 7,
          "phoneMax": 7,
          "flagUrl": "https://flagcdn.com/32x24/fm.png"
        },
        {
          "name": "Fiji",
          "code": "+679",
          "phoneMin": 7,
          "phoneMax": 7,
          "flagUrl": "https://flagcdn.com/32x24/fj.png"
        },
        {
          "name": "Finland",
          "code": "+358",
          "phoneMin": 5,
          "phoneMax": 12,
          "flagUrl": "https://flagcdn.com/32x24/fi.png"
        },
        {
          "name": "France",
          "code": "+33",
          "phoneMin": 9,
          "phoneMax": 9,
          "flagUrl": "https://flagcdn.com/32x24/fr.png"
        },
        {
          "name": "Gabon",
          "code": "+241",
          "phoneMin": 6,
          "phoneMax": 7,
          "flagUrl": "https://flagcdn.com/32x24/ga.png"
        },
        {
          "name": "Gambia",
          "code": "+220",
          "phoneMin": 7,
          "phoneMax": 7,
          "flagUrl": "https://flagcdn.com/32x24/gm.png"
        },
        {
          "name": "Georgia",
          "code": "+995",
          "phoneMin": 9,
          "phoneMax": 9,
          "flagUrl": "https://flagcdn.com/32x24/ge.png"
        },
        {
          "name": "Germany",
          "code": "+49",
          "phoneMin": 6,
          "phoneMax": 13,
          "flagUrl": "https://flagcdn.com/32x24/de.png"
        },
        {
          "name": "Ghana",
          "code": "+233",
          "phoneMin": 5,
          "phoneMax": 9,
          "flagUrl": "https://flagcdn.com/32x24/gh.png"
        },
        {
          "name": "Greece",
          "code": "+30",
          "phoneMin": 10,
          "phoneMax": 10,
          "flagUrl": "https://flagcdn.com/32x24/gr.png"
        },
        {
          "name": "Grenada",
          "code": "+1-473",
          "phoneMin": 7,
          "phoneMax": 7,
          "flagUrl": "https://flagcdn.com/32x24/gd.png"
        },
        {
          "name": "Guatemala",
          "code": "+502",
          "phoneMin": 8,
          "phoneMax": 8,
          "flagUrl": "https://flagcdn.com/32x24/gt.png"
        },
        {
          "name": "Guinea",
          "code": "+224",
          "phoneMin": 8,
          "phoneMax": 8,
          "flagUrl": "https://flagcdn.com/32x24/gn.png"
        },
        {
          "name": "Guinea-Bissau",
          "code": "+245",
          "phoneMin": 7,
          "phoneMax": 7,
          "flagUrl": "https://flagcdn.com/32x24/gw.png"
        },
        {
          "name": "Guyana",
          "code": "+592",
          "phoneMin": 7,
          "phoneMax": 7,
          "flagUrl": "https://flagcdn.com/32x24/gy.png"
        },
        {
          "name": "Haiti",
          "code": "+509",
          "phoneMin": 8,
          "phoneMax": 8,
          "flagUrl": "https://flagcdn.com/32x24/ht.png"
        },
        {
          "name": "Honduras",
          "code": "+504",
          "phoneMin": 8,
          "phoneMax": 8,
          "flagUrl": "https://flagcdn.com/32x24/hn.png"
        },
        {
          "name": "Hungary",
          "code": "+36",
          "phoneMin": 8,
          "phoneMax": 9,
          "flagUrl": "https://flagcdn.com/32x24/hu.png"
        },
        {
          "name": "Iceland",
          "code": "+354",
          "phoneMin": 7,
          "phoneMax": 9,
          "flagUrl": "https://flagcdn.com/32x24/is.png"
        },
        {
          "name": "India",
          "code": "+91",
          "phoneMin": 7,
          "phoneMax": 10,
          "flagUrl": "https://flagcdn.com/32x24/in.png"
        },
        {
          "name": "Indonesia",
          "code": "+62",
          "phoneMin": 5,
          "phoneMax": 12,
          "flagUrl": "https://flagcdn.com/32x24/id.png"
        },
        {
          "name": "Iran",
          "code": "+98",
          "phoneMin": 6,
          "phoneMax": 10,
          "flagUrl": "https://flagcdn.com/32x24/ir.png"
        },
        {
          "name": "Iraq",
          "code": "+964",
          "phoneMin": 8,
          "phoneMax": 10,
          "flagUrl": "https://flagcdn.com/32x24/iq.png"
        },
        {
          "name": "Ireland",
          "code": "+353",
          "phoneMin": 7,
          "phoneMax": 11,
          "flagUrl": "https://flagcdn.com/32x24/ie.png"
        },
        {
          "name": "Israel",
          "code": "+972",
          "phoneMin": 8,
          "phoneMax": 9,
          "flagUrl": "https://flagcdn.com/32x24/il.png"
        },
        {
          "name": "Italy",
          "code": "+39",
          "phoneMin": 9,
          "phoneMax": 11,
          "flagUrl": "https://flagcdn.com/32x24/it.png"
        },
        {
          "name": "Jamaica",
          "code": "+1-876",
          "phoneMin": 7,
          "phoneMax": 7,
          "flagUrl": "https://flagcdn.com/32x24/jm.png"
        },
        {
          "name": "Japan",
          "code": "+81",
          "phoneMin": 5,
          "phoneMax": 13,
          "flagUrl": "https://flagcdn.com/32x24/jp.png"
        },
        {
          "name": "Jordan",
          "code": "+962",
          "phoneMin": 5,
          "phoneMax": 9,
          "flagUrl": "https://flagcdn.com/32x24/jo.png"
        },
        {
          "name": "Kazakhstan",
          "code": "+7",
          "phoneMin": 10,
          "phoneMax": 10,
          "flagUrl": "https://flagcdn.com/32x24/kz.png"
        },
        {
          "name": "Kenya",
          "code": "+254",
          "phoneMin": 6,
          "phoneMax": 10,
          "flagUrl": "https://flagcdn.com/32x24/ke.png"
        },
        {
          "name": "Kiribati",
          "code": "+686",
          "phoneMin": 5,
          "phoneMax": 5,
          "flagUrl": "https://flagcdn.com/32x24/ki.png"
        },
        {
          "name": "Kosovo",
          "code": "+383",
          "phoneMin": 7,
          "phoneMax": 9,
          "flagUrl": "https://flagcdn.com/32x24/xk.png"
        },
        {
          "name": "Kuwait",
          "code": "+965",
          "phoneMin": 7,
          "phoneMax": 8,
          "flagUrl": "https://flagcdn.com/32x24/kw.png"
        },
        {
          "name": "Kyrgyzstan",
          "code": "+996",
          "phoneMin": 9,
          "phoneMax": 9,
          "flagUrl": "https://flagcdn.com/32x24/kg.png"
        },
        {
          "name": "Laos",
          "code": "+856",
          "phoneMin": 8,
          "phoneMax": 10,
          "flagUrl": "https://flagcdn.com/32x24/la.png"
        },
        {
          "name": "Latvia",
          "code": "+371",
          "phoneMin": 7,
          "phoneMax": 8,
          "flagUrl": "https://flagcdn.com/32x24/lv.png"
        },
        {
          "name": "Lebanon",
          "code": "+961",
          "phoneMin": 7,
          "phoneMax": 8,
          "flagUrl": "https://flagcdn.com/32x24/lb.png"
        },
        {
          "name": "Lesotho",
          "code": "+266",
          "phoneMin": 8,
          "phoneMax": 8,
          "flagUrl": "https://flagcdn.com/32x24/ls.png"
        },
        {
          "name": "Liberia",
          "code": "+231",
          "phoneMin": 7,
          "phoneMax": 8,
          "flagUrl": "https://flagcdn.com/32x24/lr.png"
        },
        {
          "name": "Libya",
          "code": "+218",
          "phoneMin": 8,
          "phoneMax": 9,
          "flagUrl": "https://flagcdn.com/32x24/ly.png"
        },
        {
          "name": "Liechtenstein",
          "code": "+423",
          "phoneMin": 7,
          "phoneMax": 9,
          "flagUrl": "https://flagcdn.com/32x24/li.png"
        },
        {
          "name": "Lithuania",
          "code": "+370",
          "phoneMin": 8,
          "phoneMax": 8,
          "flagUrl": "https://flagcdn.com/32x24/lt.png"
        },
        {
          "name": "Luxembourg",
          "code": "+352",
          "phoneMin": 4,
          "phoneMax": 11,
          "flagUrl": "https://flagcdn.com/32x24/lu.png"
        },
        {
          "name": "Russia",
          "code": "+7",
          "phoneMin": 10,
          "phoneMax": 10,
          "flagUrl": "https://flagcdn.com/32x24/ru.png"
        },
        {
          "name": "Rwanda",
          "code": "+250",
          "phoneMin": 9,
          "phoneMax": 9,
          "flagUrl": "https://flagcdn.com/32x24/rw.png"
        },
        {
          "name": "St Kitts and Nevis",
          "code": "+1-869",
          "phoneMin": 7,
          "phoneMax": 7,
          "flagUrl": "https://flagcdn.com/32x24/kn.png"
        },
        {
          "name": "St Lucia",
          "code": "+1-758",
          "phoneMin": 7,
          "phoneMax": 7,
          "flagUrl": "https://flagcdn.com/32x24/lc.png"
        },
        {
          "name": "Saint Vincent and the Grenadines",
          "code": "+1-784",
          "phoneMin": 7,
          "phoneMax": 7,
          "flagUrl": "https://flagcdn.com/32x24/vc.png"
        },
        {
          "name": "Samoa",
          "code": "+685",
          "phoneMin": 3,
          "phoneMax": 7,
          "flagUrl": "https://flagcdn.com/32x24/ws.png"
        },
        {
          "name": "San Marino",
          "code": "+378",
          "phoneMin": 6,
          "phoneMax": 10,
          "flagUrl": "https://flagcdn.com/32x24/sm.png"
        },
        {
          "name": "Sao Tome and Principe",
          "code": "+239",
          "phoneMin": 7,
          "phoneMax": 7,
          "flagUrl": "https://flagcdn.com/32x24/st.png"
        },
        {
          "name": "Saudi Arabia",
          "code": "+966",
          "phoneMin": 8,
          "phoneMax": 9,
          "flagUrl": "https://flagcdn.com/32x24/sa.png"
        },
        {
          "name": "Senegal",
          "code": "+221",
          "phoneMin": 9,
          "phoneMax": 9,
          "flagUrl": "https://flagcdn.com/32x24/sn.png"
        },
        {
          "name": "Serbia",
          "code": "+381",
          "phoneMin": 4,
          "phoneMax": 12,
          "flagUrl": "https://flagcdn.com/32x24/rs.png"
        },
        {
          "name": "Seychelles",
          "code": "+248",
          "phoneMin": 7,
          "phoneMax": 7,
          "flagUrl": "https://flagcdn.com/32x24/sc.png"
        },
        {
          "name": "Sierra Leone",
          "code": "+232",
          "phoneMin": 8,
          "phoneMax": 8,
          "flagUrl": "https://flagcdn.com/32x24/sl.png"
        },
        {
          "name": "Singapore",
          "code": "+65",
          "phoneMin": 8,
          "phoneMax": 12,
          "flagUrl": "https://flagcdn.com/32x24/sg.png"
        },
        {
          "name": "Slovakia",
          "code": "+421",
          "phoneMin": 4,
          "phoneMax": 9,
          "flagUrl": "https://flagcdn.com/32x24/sk.png"
        },
        {
          "name": "Slovenia",
          "code": "+386",
          "phoneMin": 8,
          "phoneMax": 8,
          "flagUrl": "https://flagcdn.com/32x24/si.png"
        },
        {
          "name": "Solomon Islands",
          "code": "+677",
          "phoneMin": 5,
          "phoneMax": 5,
          "flagUrl": "https://flagcdn.com/32x24/sb.png"
        },
        {
          "name": "Somalia",
          "code": "+252",
          "phoneMin": 5,
          "phoneMax": 8,
          "flagUrl": "https://flagcdn.com/32x24/so.png"
        },
        {
          "name": "South Africa",
          "code": "+27",
          "phoneMin": 9,
          "phoneMax": 9,
          "flagUrl": "https://flagcdn.com/32x24/za.png"
        },
        {
          "name": "South Korea",
          "code": "+82",
          "phoneMin": 8,
          "phoneMax": 11,
          "flagUrl": "https://flagcdn.com/32x24/kr.png"
        },
        {
          "name": "South Sudan",
          "code": "+211",
          "phoneMin": 7,
          "phoneMax": 9,
          "flagUrl": "https://flagcdn.com/32x24/ss.png"
        },
        {
          "name": "Spain",
          "code": "+34",
          "phoneMin": 9,
          "phoneMax": 9,
          "flagUrl": "https://flagcdn.com/32x24/es.png"
        },
        {
          "name": "Sri Lanka",
          "code": "+94",
          "phoneMin": 9,
          "phoneMax": 10,
          "flagUrl": "https://flagcdn.com/32x24/lk.png"
        },
        {
          "name": "Sudan",
          "code": "+249",
          "phoneMin": 9,
          "phoneMax": 9,
          "flagUrl": "https://flagcdn.com/32x24/sd.png"
        },
        {
          "name": "Suriname",
          "code": "+597",
          "phoneMin": 6,
          "phoneMax": 7,
          "flagUrl": "https://flagcdn.com/32x24/sr.png"
        },
        {
          "name": "Sweden",
          "code": "+46",
          "phoneMin": 7,
          "phoneMax": 13,
          "flagUrl": "https://flagcdn.com/32x24/se.png"
        },
        {
          "name": "Switzerland",
          "code": "+41",
          "phoneMin": 4,
          "phoneMax": 12,
          "flagUrl": "https://flagcdn.com/32x24/ch.png"
        },
        {
          "name": "Syria",
          "code": "+963",
          "phoneMin": 8,
          "phoneMax": 10,
          "flagUrl": "https://flagcdn.com/32x24/sy.png"
        },
        {
          "name": "Taiwan",
          "code": "+886",
          "phoneMin": 8,
          "phoneMax": 9,
          "flagUrl": "https://flagcdn.com/32x24/tw.png"
        },
        {
          "name": "Tajikistan",
          "code": "+992",
          "phoneMin": 9,
          "phoneMax": 9,
          "flagUrl": "https://flagcdn.com/32x24/tj.png"
        },
        {
          "name": "Tanzania",
          "code": "+255",
          "phoneMin": 9,
          "phoneMax": 9,
          "flagUrl": "https://flagcdn.com/32x24/tz.png"
        },
        {
          "name": "Thailand",
          "code": "+66",
          "phoneMin": 8,
          "phoneMax": 9,
          "flagUrl": "https://flagcdn.com/32x24/th.png"
        },
        {
          "name": "Timor-Leste",
          "code": "+670",
          "phoneMin": 7,
          "phoneMax": 8,
          "flagUrl": "https://flagcdn.com/32x24/tl.png"
        },
        {
          "name": "Togo",
          "code": "+228",
          "phoneMin": 8,
          "phoneMax": 8,
          "flagUrl": "https://flagcdn.com/32x24/tg.png"
        },
        {
          "name": "Tonga",
          "code": "+676",
          "phoneMin": 5,
          "phoneMax": 7,
          "flagUrl": "https://flagcdn.com/32x24/to.png"
        },
        {
          "name": "Trinidad and Tobago",
          "code": "+1-868",
          "phoneMin": 7,
          "phoneMax": 7,
          "flagUrl": "https://flagcdn.com/32x24/tt.png"
        },
        {
          "name": "Tunisia",
          "code": "+216",
          "phoneMin": 8,
          "phoneMax": 8,
          "flagUrl": "https://flagcdn.com/32x24/tn.png"
        },
        {
          "name": "Turkey",
          "code": "+90",
          "phoneMin": 10,
          "phoneMax": 10,
          "flagUrl": "https://flagcdn.com/32x24/tr.png"
        },
        {
          "name": "Turkmenistan",
          "code": "+993",
          "phoneMin": 8,
          "phoneMax": 8,
          "flagUrl": "https://flagcdn.com/32x24/tm.png"
        },
        {
          "name": "Tuvalu",
          "code": "+688",
          "phoneMin": 5,
          "phoneMax": 6,
          "flagUrl": "https://flagcdn.com/32x24/tv.png"
        },
        {
          "name": "Uganda",
          "code": "+256",
          "phoneMin": 9,
          "phoneMax": 9,
          "flagUrl": "https://flagcdn.com/32x24/ug.png"
        },
        {
          "name": "Ukraine",
          "code": "+380",
          "phoneMin": 9,
          "phoneMax": 9,
          "flagUrl": "https://flagcdn.com/32x24/ua.png"
        },
        {
          "name": "United Arab Emirates",
          "code": "+971",
          "phoneMin": 8,
          "phoneMax": 9,
          "flagUrl": "https://flagcdn.com/32x24/ae.png"
        },
        {
          "name": "United Kingdom",
          "code": "+44",
          "phoneMin": 7,
          "phoneMax": 10,
          "flagUrl": "https://flagcdn.com/32x24/gb.png"
        },
        {
          "name": "United States",
          "code": "+1",
          "phoneMin": 10,
          "phoneMax": 10,
          "flagUrl": "https://flagcdn.com/32x24/us.png"
        },
        {
          "name": "Uruguay",
          "code": "+598",
          "phoneMin": 4,
          "phoneMax": 11,
          "flagUrl": "https://flagcdn.com/32x24/uy.png"
        },
        {
          "name": "Uzbekistan",
          "code": "+998",
          "phoneMin": 9,
          "phoneMax": 9,
          "flagUrl": "https://flagcdn.com/32x24/uz.png"
        },
        {
          "name": "Vanuatu",
          "code": "+678",
          "phoneMin": 5,
          "phoneMax": 7,
          "flagUrl": "https://flagcdn.com/32x24/vu.png"
        },
        {
          "name": "Vatican City",
          "code": "+39-06",
          "phoneMin": 6,
          "phoneMax": 9,
          "flagUrl": "https://flagcdn.com/32x24/va.png"
        },
        {
          "name": "Venezuela",
          "code": "+58",
          "phoneMin": 10,
          "phoneMax": 10,
          "flagUrl": "https://flagcdn.com/32x24/ve.png"
        },
        {
          "name": "Vietnam",
          "code": "+84",
          "phoneMin": 7,
          "phoneMax": 10,
          "flagUrl": "https://flagcdn.com/32x24/vn.png"
        },
        {
          "name": "Yemen",
          "code": "+967",
          "phoneMin": 6,
          "phoneMax": 9,
          "flagUrl": "https://flagcdn.com/32x24/ye.png"
        },
        {
          "name": "Zambia",
          "code": "+260",
          "phoneMin": 9,
          "phoneMax": 9,
          "flagUrl": "https://flagcdn.com/32x24/zm.png"
        },
        {
          "name": "Zimbabwe",
          "code": "+263",
          "phoneMin": 5,
          "phoneMax": 10,
          "flagUrl": "https://flagcdn.com/32x24/zw.png"
        },
        {
          "name": "Norway",
          "code": "+47",
          "phoneMin": 5,
          "phoneMax": 8,
          "flagUrl": "https://flagcdn.com/32x24/no.png"
        },
        {
          "name": "Netherlands",
          "code": "+31",
          "phoneMin": 9,
          "phoneMax": 9,
          "flagUrl": "https://flagcdn.com/32x24/nl.png"
        },
        {
          "name": "Romania",
          "code": "+40",
          "phoneMin": 9,
          "phoneMax": 9,
          "flagUrl": "https://flagcdn.com/32x24/ro.png"
        },
        {
          "name": "Poland",
          "code": "+48",
          "phoneMin": 6,
          "phoneMax": 9,
          "flagUrl": "https://flagcdn.com/32x24/pl.png"
        },
        {
          "name": "Peru",
          "code": "+51",
          "phoneMin": 8,
          "phoneMax": 11,
          "flagUrl": "https://flagcdn.com/32x24/pe.png"
        },
        {
          "name": "Mexico",
          "code": "+52",
          "phoneMin": 10,
          "phoneMax": 10,
          "flagUrl": "https://flagcdn.com/32x24/mx.png"
        },
        {
          "name": "Malaysia",
          "code": "+60",
          "phoneMin": 7,
          "phoneMax": 11,
          "flagUrl": "https://flagcdn.com/32x24/my.png"
        },
        {
          "name": "Philippines",
          "code": "+63",
          "phoneMin": 8,
          "phoneMax": 10,
          "flagUrl": "https://flagcdn.com/32x24/ph.png"
        },
        {
          "name": "New Zealand",
          "code": "+64",
          "phoneMin": 3,
          "phoneMax": 10,
          "flagUrl": "https://flagcdn.com/32x24/nz.png"
        },
        {
          "name": "Pakistan",
          "code": "+92",
          "phoneMin": 8,
          "phoneMax": 11,
          "flagUrl": "https://flagcdn.com/32x24/pk.png"
        },
        {
          "name": "Myanmar (Burma)",
          "code": "+95",
          "phoneMin": 7,
          "phoneMax": 10,
          "flagUrl": "https://flagcdn.com/32x24/mm.png"
        },
        {
          "name": "Morocco",
          "code": "+212",
          "phoneMin": 9,
          "phoneMax": 10,
          "flagUrl": "https://flagcdn.com/32x24/ma.png"
        },
        {
          "name": "Mauritius",
          "code": "+230",
          "phoneMin": 7,
          "phoneMax": 7,
          "flagUrl": "https://flagcdn.com/32x24/mu.png"
        },
        {
          "name": "Nigeria",
          "code": "+234",
          "phoneMin": 7,
          "phoneMax": 10,
          "flagUrl": "https://flagcdn.com/32x24/ng.png"
        },
        {
          "name": "Mauritania",
          "code": "+222",
          "phoneMin": 7,
          "phoneMax": 7,
          "flagUrl": "https://flagcdn.com/32x24/mr.png"
        },
        {
          "name": "Mali",
          "code": "+223",
          "phoneMin": 8,
          "phoneMax": 8,
          "flagUrl": "https://flagcdn.com/32x24/ml.png"
        },
        {
          "name": "Niger",
          "code": "+227",
          "phoneMin": 8,
          "phoneMax": 8,
          "flagUrl": "https://flagcdn.com/32x24/ne.png"
        },
        {
          "name": "Republic of the Congo",
          "code": "+242",
          "phoneMin": 8,
          "phoneMax": 8,
          "flagUrl": "https://flagcdn.com/32x24/cg.png"
        },
        {
          "name": "Mozambique",
          "code": "+258",
          "phoneMin": 8,
          "phoneMax": 9,
          "flagUrl": "https://flagcdn.com/32x24/mz.png"
        },
        {
          "name": "Madagascar",
          "code": "+261",
          "phoneMin": 9,
          "phoneMax": 10,
          "flagUrl": "https://flagcdn.com/32x24/mg.png"
        },
        {
          "name": "Malawi",
          "code": "+265",
          "phoneMin": 7,
          "phoneMax": 8,
          "flagUrl": "https://flagcdn.com/32x24/mw.png"
        },
        {
          "name": "Namibia",
          "code": "+264",
          "phoneMin": 6,
          "phoneMax": 10,
          "flagUrl": "https://flagcdn.com/32x24/na.png"
        },
        {
          "name": "Nepal",
          "code": "+977",
          "phoneMin": 8,
          "phoneMax": 10,
          "flagUrl": "https://flagcdn.com/32x24/np.png"
        },
        {
          "name": "Portugal",
          "code": "+351",
          "phoneMin": 9,
          "phoneMax": 11,
          "flagUrl": "https://flagcdn.com/32x24/pt.png"
        },
        {
          "name": "Oman",
          "code": "+968",
          "phoneMin": 7,
          "phoneMax": 8,
          "flagUrl": "https://flagcdn.com/32x24/om.png"
        },
        {
          "name": "Qatar",
          "code": "+974",
          "phoneMin": 3,
          "phoneMax": 8,
          "flagUrl": "https://flagcdn.com/32x24/qa.png"
        },
        {
          "name": "Maldives",
          "code": "+960",
          "phoneMin": 7,
          "phoneMax": 7,
          "flagUrl": "https://flagcdn.com/32x24/mv.png"
        },
        {
          "name": "Malta",
          "code": "+356",
          "phoneMin": 8,
          "phoneMax": 8,
          "flagUrl": "https://flagcdn.com/32x24/mt.png"
        },
        {
          "name": "Moldova",
          "code": "+373",
          "phoneMin": 8,
          "phoneMax": 8,
          "flagUrl": "https://flagcdn.com/32x24/md.png"
        },
        {
          "name": "Montenegro",
          "code": "+382",
          "phoneMin": 4,
          "phoneMax": 12,
          "flagUrl": "https://flagcdn.com/32x24/me.png"
        },
        {
          "name": "North Macedonia",
          "code": "+389",
          "phoneMin": 8,
          "phoneMax": 9,
          "flagUrl": "https://flagcdn.com/32x24/mk.png"
        },
        {
          "name": "Nicaragua",
          "code": "+505",
          "phoneMin": 8,
          "phoneMax": 8,
          "flagUrl": "https://flagcdn.com/32x24/ni.png"
        },
        {
          "name": "Panama",
          "code": "+507",
          "phoneMin": 7,
          "phoneMax": 8,
          "flagUrl": "https://flagcdn.com/32x24/pa.png"
        },
        {
          "name": "Paraguay",
          "code": "+595",
          "phoneMin": 5,
          "phoneMax": 9,
          "flagUrl": "https://flagcdn.com/32x24/py.png"
        },
        {
          "name": "Mongolia",
          "code": "+976",
          "phoneMin": 7,
          "phoneMax": 8,
          "flagUrl": "https://flagcdn.com/32x24/mn.png"
        },
        {
          "name": "Papua New Guinea",
          "code": "+675",
          "phoneMin": 4,
          "phoneMax": 11,
          "flagUrl": "https://flagcdn.com/32x24/pg.png"
        },
        {
          "name": "Marshall Islands",
          "code": "+692",
          "phoneMin": 7,
          "phoneMax": 7,
          "flagUrl": "https://flagcdn.com/32x24/mh.png"
        },
        {
          "name": "Palau",
          "code": "+680",
          "phoneMin": 7,
          "phoneMax": 7,
          "flagUrl": "https://flagcdn.com/32x24/pw.png"
        },
        {
          "name": "Nauru",
          "code": "+674",
          "phoneMin": 4,
          "phoneMax": 7,
          "flagUrl": "https://flagcdn.com/32x24/nr.png"
        },
        {
          "name": "North Korea",
          "code": "+850",
          "phoneMin": 6,
          "phoneMax": 17,
          "flagUrl": "https://flagcdn.com/32x24/kp.png"
        },
        {
          "name": "Hong Kong",
          "code": "+852",
          "phoneMin": 4,
          "phoneMax": 9,
          "flagUrl": "https://flagcdn.com/32x24/hk.png"
        },
        {
          "name": "Macau",
          "code": "+853",
          "phoneMin": 7,
          "phoneMax": 8,
          "flagUrl": "https://flagcdn.com/32x24/mo.png"
        }
      ];
  
      ///////////////////////////////////////////////////////////////////////
      // 2) Simple phone format patterns (you can expand later)
      ///////////////////////////////////////////////////////////////////////
      const phoneFormats = {
        '+1': '(###) ###-####',          // US, also often used for Canada
        '+1-268': '(###) ###-####',      // Antigua and Barbuda
        '+1-242': '(###) ###-####',      // Bahamas
        '+1-246': '(###) ###-####',      // Barbados
        '+1-473': '(###) ###-####',      // Grenada
        '+1-767': '(###) ###-####',      // Dominica
        '+1-784': '(###) ###-####',      // Saint Vincent
        '+1-809': '(###) ###-####',      // Dominican Republic
        '+1-868': '(###) ###-####',      // Trinidad
        '+1-869': '(###) ###-####',      // St Kitts
        '+1-876': '(###) ###-####',      // Jamaica
        '+45': '## ## ## ##',            // Denmark
        '+44': '#### ######',            // UK
        '+91': '#####-#####',            // India
        '+81': '##-####-####',           // Japan
        '+49': '####-########',          // Germany
        '+39': '### ## ## ####',         // Italy
        '+34': '### ### ###',            // Spain
        '+33': '## ## ## ## ##',         // France
        '+7': '(###) ###-##-##',         // Russia
        '+86': '### #### ####',          // China
        '+90': '### ### ## ##',          // Turkey
        '+212': '## #### ####',          // Morocco
        '+213': '### ## ## ##',          // Algeria
        '+216': '## ### ###',            // Tunisia
        '+20': '(###) ###-####',         // Egypt
        '+27': '## ### ####',            // South Africa
        '+30': '## ### ####',            // Greece
        '+31': '## ### ####',            // Netherlands
        '+32': '## ### ####',            // Belgium
        '+36': '## ### ####',            // Hungary
        '+39-06': '### #### ####',       // Vatican City
        '+40': '## ### ####',            // Romania
        '+41': '## ### ## ##',           // Switzerland
        '+43': '### #### ####',          // Austria
        '+46': '## ### ####',            // Sweden
        '+47': '### ## ###',             // Norway
        '+48': '###-###-###',            // Poland
        '+51': '### ### ###',            // Peru
        '+52': '(###) ###-####',         // Mexico
        '+53': '## ### ####',            // Cuba
        '+54': '(###) ###-####',         // Argentina
        '+55': '(##) #####-####',        // Brazil
        '+56': '## #### ####',           // Chile
        '+57': '(###) ###-####',         // Colombia
        '+58': '###-### ####',           // Venezuela
        '+60': '##-### ####',            // Malaysia
        '+62': '###-###-###',            // Indonesia
        '+63': '#### ### ####',          // Philippines
        '+64': '## ### ####',            // New Zealand
        '+65': '#### ####',              // Singapore
        '+66': '## #### ####',           // Thailand
        '+82': '##-###-####',            // South Korea
        '+84': '#### ######',            // Vietnam
        '+92': '### ### ####',           // Pakistan
        '+94': '## ### ####',            // Sri Lanka
        '+95': '### ### ####',           // Myanmar (Burma)
        '+98': '### #######',            // Iran
        '+211': '## ### ####',           // South Sudan
        '+218': '## ### ####',           // Libya
        '+220': '### ####',              // Gambia
        '+221': '## ### ####',           // Senegal
        '+222': '## ## ## ##',           // Mauritania
        '+223': '## ## ## ##',           // Mali
        '+224': '## ### ####',           // Guinea
        '+225': '## ## ## ####',         // Ivory Coast
        '+226': '## ## ## ##',           // Burkina Faso
        '+227': '## ## ## ##',           // Niger
        '+228': '## ## ## ##',           // Togo
        '+230': '### ####',              // Mauritius
        '+233': '## ### ####',           // Ghana
        '+234': '## ### ####',           // Nigeria
        '+235': '## ## ## ##',           // Chad
        '+236': '## ## ## ##',           // CAR
        '+237': '## ## ## ##',           // Cameroon
        '+238': '### ## ##',             // Cabo Verde
        '+239': '## ## ## ##',           // Sao Tome
        '+240': '### ### ####',          // Eq. Guinea
        '+241': '## ## ## ##',           // Gabon
        '+242': '## ## ## ##',           // Republic of Congo
        '+243': '### ### ####',          // DRC
        '+244': '### ### ####',          // Angola
        '+245': '## ### ##',             // Guinea-Bissau
        '+246': '(###) ###-####',        // partial guess for other +1 ...
        '+249': '## ### ####',           // Sudan
        '+250': '## #### ###',           // Rwanda
        '+251': '## ### ####',           // Ethiopia
        '+252': '## ### ####',           // Somalia
        '+253': '## ## ## ##',           // Djibouti
        '+254': '### ### ###',           // Kenya
        '+255': '## ### ####',           // Tanzania
        '+256': '### ### ###',           // Uganda
        '+257': '## ## ## ##',           // Burundi
        '+258': '## ### ####',           // Mozambique
        '+260': '## ### ####',           // Zambia
        '+261': '## ## ### ##',          // Madagascar
        '+263': '## ### ####',           // Zimbabwe
        '+264': '## ### ####',           // Namibia
        '+265': '## ### ####',           // Malawi
        '+266': '## ## ####',            // Lesotho
        '+267': '## ### ###',            // Botswana
        '+268': '#### ####',             // Eswatini
        '+269': '## ## ####',            // Comoros
        '+291': '## ### ##',             // Eritrea
        '+93': '### ### ###',            // Afghanistan
        '+355': '### ### ###',           // Albania
        '+376': '### ###',               // Andorra
        '+994': '### ### ###',           // Azerbaijan
        '+973': '## ## ## ##',           // Bahrain
        '+880': '### ### ####',          // Bangladesh
        '+375': '### ### ###',           // Belarus
        '+501': '### ####',              // Belize
        '+975': '### ####',              // Bhutan
        '+591': '### ### ###',           // Bolivia
        '+387': '### ### ###',           // Bosnia and Herzegovina
        '+673': '### ####',              // Brunei
        '+359': '### ### ###',           // Bulgaria
        '+855': '### ### ###',           // Cambodia
        '+506': '## ## ## ##',           // Costa Rica
        '+385': '### ### ###',           // Croatia
        '+357': '## ## ## ##',           // Cyprus
        '+420': '### ### ###',           // Czech Republic
        '+593': '### ### ###',           // Ecuador
        '+503': '## ## ## ##',           // El Salvador
        // etc. (there are many more entries in the actual code) ...
        '+998': '### ### ###',           // Uzbekistan
        '+678': '### ####',              // Vanuatu
        '+39-06': '### #### ####',       // Vatican City
        '+58': '###-### ####',           // Venezuela
        '+84': '#### ######',            // Vietnam
        '+967': '### ### ###',           // Yemen
        "+374": "## ### ###",
        // Australia (+61): phoneMin=8, phoneMax=9
        // Commonly written "+61 4xx xxx xxx" for mobiles or similar for landlines
        "+61": "## #### ####",
        // Benin (+229): phoneMin=8, phoneMax=8
        "+229": "## ## ## ##",
        // Estonia (+372): phoneMin=7, phoneMax=9
        "+372": "### #### ###",
        // Federated States of Micronesia (+691): phoneMin=7, phoneMax=7
        "+691": "### ####",
        // Fiji (+679): phoneMin=7, phoneMax=7
        "+679": "### ####",
        // Finland (+358): phoneMin=7, phoneMax=10
        // Actual formats vary widely; this is just a placeholder
        "+358": "## ### ## ##",
        // Georgia (+995): phoneMin=7, phoneMax=9
        "+995": "### #### ##",
        // Guatemala (+502): phoneMin=8, phoneMax=8
        "+502": "## ## ## ##",
        // Guyana (+592): phoneMin=7, phoneMax=7
        "+592": "### ####",
        // Haiti (+509): phoneMin=7, phoneMax=8
        "+509": "## ## ####",
        // Honduras (+504): phoneMin=7, phoneMax=8
        "+504": "#### ####",
        // Iceland (+354): phoneMin=7, phoneMax=7
        "+354": "### ####",
        // Iraq (+964): phoneMin=7, phoneMax=10
        "+964": "### ### ####",
        // Ireland (+353): phoneMin=7, phoneMax=9
        "+353": "### #### ###",
        // Israel (+972): phoneMin=8, phoneMax=9
        "+972": "## #### ####",
        // Jordan (+962): phoneMin=7, phoneMax=9
        "+962": "### #### ###",
        // Kiribati (+686): phoneMin=5, phoneMax=8
        "+686": "#### ####",
        // Kosovo (+383): phoneMin=7, phoneMax=9
        "+383": "### #### ##",
        // Kuwait (+965): phoneMin=8, phoneMax=8
        "+965": "#### ####",
        // Kyrgyzstan (+996): phoneMin=6, phoneMax=9
        "+996": "### ### ###",
        // Laos (+856): phoneMin=7, phoneMax=10
        "+856": "## ### ####",
        // Latvia (+371): phoneMin=8, phoneMax=8
        "+371": "## ## ## ##",
        // Lebanon (+961): phoneMin=7, phoneMax=8
        "+961": "## ### ###",
        // Liberia (+231): phoneMin=7, phoneMax=9
        "+231": "## ### ####",
        // Liechtenstein (+423): phoneMin=7, phoneMax=9
        "+423": "### ### ###",
        // Lithuania (+370): phoneMin=8, phoneMax=9
        "+370": "## ## ## ###",
        // Luxembourg (+352): phoneMin=7, phoneMax=9
        "+352": "### ### ###",
        // Samoa (+685): phoneMin=5, phoneMax=7
        "+685": "### ####",
        // San Marino (+378): phoneMin=6, phoneMax=10
        "+378": "### ## ####",
        // Saudi Arabia (+966): phoneMin=9, phoneMax=9
        "+966": "## ### ####",
        // Serbia (+381): phoneMin=6, phoneMax=9
        "+381": "### ### ###",
        // Seychelles (+248): phoneMin=7, phoneMax=7
        "+248": "### ####",
        // Sierra Leone (+232): phoneMin=7, phoneMax=8
        "+232": "## ### ####",
        // Slovakia (+421): phoneMin=8, phoneMax=9
        "+421": "### ### ###",
        // Slovenia (+386): phoneMin=8, phoneMax=9
        "+386": "## ### ####",
        // Solomon Islands (+677): phoneMin=5, phoneMax=7
        "+677": "### ####",
        // Suriname (+597): phoneMin=6, phoneMax=7
        "+597": "### ####",
        // Syria (+963): phoneMin=7, phoneMax=9
        "+963": "### #### ###",
        // Taiwan (+886): phoneMin=8, phoneMax=9
        "+886": "### #### ###",
        // Tajikistan (+992): phoneMin=7, phoneMax=9
        "+992": "### ### ###",
        // Timor-Leste (+670): phoneMin=7, phoneMax=8
        "+670": "## ## ####",
        // Tonga (+676): phoneMin=5, phoneMax=7
        "+676": "### ####",
        // Turkmenistan (+993): phoneMin=7, phoneMax=8
        "+993": "### #### ##",
        // Tuvalu (+688): phoneMin=5, phoneMax=6
        "+688": "## ###",
        // Ukraine (+380): phoneMin=7, phoneMax=9
        "+380": "### ### ###",
        // United Arab Emirates (+971): phoneMin=8, phoneMax=9
        "+971": "## ### ####",
        // Uruguay (+598): phoneMin=7, phoneMax=9
        "+598": "### ### ####",
        '+977': '### #### ###', // Nepal
        '+351': '## ### ####', // Portugal
        '+968': '## ### ####', // Oman
        '+974': '## ### ####', // Qatar
        '+960': '### ####', // Maldives
        '+356': '#### ####', // Malta
        '+373': '#### ####', // Moldova (8 digits after +373)
        '+382': '### #### ##', // Montenegro
        '+389': '## ### ###', // North Macedonia
        '+505': '#### ####', // Nicaragua
        '+507': '### ####', // Panama
        '+595': '### ### ###', // Paraguay
        '+976': '## #### ##', // Mongolia
        '+675': '### ####', // Papua New Guinea
        '+692': '### ####', // Marshall Islands
        '+680': '### ####', // Palau
        '+674': '### ####', // Nauru
        '+850': '### ### ####', // North Korea (variable length)
        '+852': '#### ####', // Hong Kong
        '+853': '#### ####', // Macau
      };
  
      ///////////////////////////////////////////////////////////////////////
      // 3) The specialized area codes for Canada (to differentiate from US)
      ///////////////////////////////////////////////////////////////////////
      const canadianAreaCodes = [
        '204','226','236','249','250','289','306','343','365','387','403','416',
        '418','431','437','438','450','506','514','519','579','581','587','600',
        '604','613','639','647','672','683','705','709','742','778','780','782',
        '807','819','825','867','873','902','905'
      ];
  
      ///////////////////////////////////////////////////////////////////////
      // 4) The findBestCountryMatch function that picks US vs. Canada
      ///////////////////////////////////////////////////////////////////////
      function findBestCountryMatch(rawText, countriesList) {
        // Strip out all non-numeric except '+' from the front
        let normalized = rawText.replace(/[^\+\d]/g, '');
        if (!normalized.startsWith('+')) {
          return null;
        }
  
        // Start from the longest possible substring
        for (let length = normalized.length; length > 1; length--) {
          const candidate = normalized.slice(0, length);
          // Filter countries whose code matches "candidate"
          const allMatches = countriesList.filter(c => {
            const storedCodeNorm = c.code.replace(/[^\+\d]/g, '');
            return candidate === storedCodeNorm;
          });
  
          if (allMatches.length > 0) {
            // If the matched code is '+1', decide if Canada or US
            if (allMatches.some(m => m.code === '+1')) {
              const leftover = normalized.slice(length);
              const first3 = leftover.slice(0, 3);
              const isCanadian = canadianAreaCodes.includes(first3);
              // If area code is Canadian, pick Canada; otherwise default US
              const matchedCountry = isCanadian
                ? countriesList.find(c => c.name === 'Canada')
                : countriesList.find(c => c.name === 'United States');
              if (matchedCountry) {
                return {
                  match: matchedCountry,
                  leftover: leftover
                };
              }
            } else {
              // It's a non-' +1' code (e.g., '+44')
              return {
                match: allMatches[0],
                leftover: normalized.slice(length)
              };
            }
          }
        }
        // No match found => null
        return null;
      }
  
      ///////////////////////////////////////////////////////////////////////
      // Helper to set the default country in the UI
      ///////////////////////////////////////////////////////////////////////
      function setDefaultCountry(countryName) {
        let c;
        if (countryName === 'United States') {
          c = countries.find(x => x.name === 'United States');
        } else {
          c = countries.find(x => x.name === countryName) ||
              countries.find(x => x.code === countryName);
        }
        if (!c) {
          console.warn(`No such country: ${countryName}. Falling back to United States.`);
          c = countries.find(x => x.name === 'United States');
        }
        countryFlagImg.src = c.flagUrl;
        countryFlagImg.alt = c.name;
        countryDisplay.textContent = c.code;
  
        // Reset phone input
        phoneInput.value = '';
        phoneInput.setAttribute('minlength', c.phoneMin);
        phoneInput.removeAttribute('maxlength');
      }
  
      // 1) Try to detect user's country via IP-based geolocation
      fetch('https://ipinfo.io/json')
        .then(res => res.json())
        .then(data => {
          // data.country might be "US", "CA", "GB", etc.
          const detectedIsoCode = data.country; 

          // 1) Extended ISO => Country "name" mapping
          const isoToNameMap = {
            "AF": "Afghanistan",
            "AL": "Albania",
            "DZ": "Algeria",
            "AD": "Andorra",
            "AO": "Angola",
            "AG": "Antigua and Barbuda",
            "AR": "Argentina",
            "AM": "Armenia",
            "AU": "Australia",
            "AT": "Austria",
            "AZ": "Azerbaijan",
            "BS": "Bahamas",
            "BH": "Bahrain",
            "BD": "Bangladesh",
            "BB": "Barbados",
            "BY": "Belarus",
            "BE": "Belgium",
            "BZ": "Belize",
            "BJ": "Benin",
            "BT": "Bhutan",
            "BO": "Bolivia",
            "BA": "Bosnia and Herzegovina",
            "BW": "Botswana",
            "BR": "Brazil",
            "BN": "Brunei",          // if present in your list
            "BG": "Bulgaria",
            "BF": "Burkina Faso",
            "BI": "Burundi",
            "KH": "Cambodia",
            "CM": "Cameroon",
            "CA": "Canada",
            "CV": "Cabo Verde",
            "CF": "Central African Republic",
            "TD": "Chad",
            "CL": "Chile",
            "CN": "China",
            "CO": "Colombia",
            "KM": "Comoros",
            "CR": "Costa Rica",
            "HR": "Croatia",
            "CU": "Cuba",
            "CY": "Cyprus",
            "CZ": "Czech Republic",
            "CD": "Democratic Republic of the Congo",
            "DK": "Denmark",
            "DJ": "Djibouti",
            "DM": "Dominica",
            "DO": "Dominican Republic",
            "EC": "Ecuador",
            "EG": "Egypt",
            "SV": "El Salvador",
            "GQ": "Equatorial Guinea",  // if present
            "ER": "Eritrea",            // if present
            "EE": "Estonia",            // if present
            "SZ": "Eswatini",           // if present
            "ET": "Ethiopia",
            "FJ": "Fiji",               // if present
            "FI": "Finland",            // if present
            "FR": "France",
            "GA": "Gabon",              // if present
            "GM": "Gambia",
            "GE": "Georgia",            // if present
            "DE": "Germany",
            "GH": "Ghana",
            "GR": "Greece",
            "GD": "Grenada",
            "GT": "Guatemala",
            "GN": "Guinea",
            "GW": "Guinea-Bissau",      // if present
            "GY": "Guyana",
            "HT": "Haiti",
            "HN": "Honduras",
            "HU": "Hungary",
            "IS": "Iceland",
            "IN": "India",
            "ID": "Indonesia",
            "IR": "Iran",
            "IQ": "Iraq",
            "IE": "Ireland",
            "IL": "Israel",
            "IT": "Italy",
            "JM": "Jamaica",
            "JP": "Japan",
            "JO": "Jordan",
            "KZ": "Kazakhstan",
            "KE": "Kenya",
            "KI": "Kiribati",
            "XK": "Kosovo",             // Commonly used code for Kosovo
            "KW": "Kuwait",
            "KG": "Kyrgyzstan",         // if present
            "LA": "Laos",               // if present
            "LV": "Latvia",             // if present
            "LB": "Lebanon",            // if present
            "LS": "Lesotho",            // if present
            "LR": "Liberia",            // if present
            "LY": "Libya",              // if present
            "LI": "Liechtenstein",      // if present
            "LT": "Lithuania",          // if present
            "LU": "Luxembourg",         // if present
            "MG": "Madagascar",
            "MW": "Malawi",
            "MY": "Malaysia",
            "MV": "Maldives",
            "ML": "Mali",
            "MT": "Malta",
            "MH": "Marshall Islands",
            "MR": "Mauritania",
            "MU": "Mauritius",
            "MX": "Mexico",
            "FM": "Micronesia",         // if present
            "MD": "Moldova",
            "MC": "Monaco",             // if present
            "MN": "Mongolia",
            "ME": "Montenegro",
            "MA": "Morocco",
            "MZ": "Mozambique",
            "MM": "Myanmar (Burma)",
            "NA": "Namibia",
            "NR": "Nauru",
            "NP": "Nepal",
            "NL": "Netherlands",
            "NZ": "New Zealand",
            "NI": "Nicaragua",
            "NE": "Niger",
            "NG": "Nigeria",
            "KP": "North Korea",
            "MK": "North Macedonia",
            "NO": "Norway",
            "OM": "Oman",
            "PK": "Pakistan",
            "PW": "Palau",
            "PA": "Panama",
            "PG": "Papua New Guinea",
            "PY": "Paraguay",
            "PE": "Peru",
            "PH": "Philippines",
            "PL": "Poland",
            "PT": "Portugal",
            "QA": "Qatar",
            "CG": "Republic of the Congo",
            "RO": "Romania",
            "RU": "Russia",
            "RW": "Rwanda",
            "SA": "Saudi Arabia",
            "SN": "Senegal",
            "RS": "Serbia",
            "SC": "Seychelles",         // if present
            "SL": "Sierra Leone",       // if present
            "SG": "Singapore",
            "SK": "Slovakia",
            "SI": "Slovenia",
            "SB": "Solomon Islands",    // if present
            "SO": "Somalia",            // if present
            "ZA": "South Africa",
            "KR": "South Korea",
            "SS": "South Sudan",        // if present
            "ES": "Spain",
            "LK": "Sri Lanka",          // if present
            "SD": "Sudan",              // if present
            "SR": "Suriname",           // if present
            "SE": "Sweden",
            "CH": "Switzerland",
            "SY": "Syria",
            "TW": "Taiwan",
            "TJ": "Tajikistan",
            "TZ": "Tanzania",
            "TH": "Thailand",
            "TL": "Timor-Leste",
            "TG": "Togo",
            "TO": "Tonga",
            "TT": "Trinidad and Tobago",
            "TN": "Tunisia",
            "TR": "Turkey",
            "TM": "Turkmenistan",
            "TV": "Tuvalu",
            "UG": "Uganda",
            "UA": "Ukraine",
            "AE": "United Arab Emirates",
            "GB": "United Kingdom",
            "US": "United States",
            "UY": "Uruguay",
            "UZ": "Uzbekistan",
            "VU": "Vanuatu",
            "VA": "Vatican City",
            "VE": "Venezuela",
            "VN": "Vietnam",
            "YE": "Yemen",
            "ZM": "Zambia",
            "ZW": "Zimbabwe"
          };

          // If we have a match, use it; otherwise, default to "United States"
          const countryName = isoToNameMap[detectedIsoCode] || "United States";
          setDefaultCountry(countryName);
        })
        .catch(() => {
          // If the API fails (network error, etc.), default to "United States"
          setDefaultCountry('United States');
        });
  
      ///////////////////////////////////////////////////////////////////////
      // Build the country dropdown list with a search box
      ///////////////////////////////////////////////////////////////////////
      function buildCountryList(searchTerm = '') {
        // Clear old list
        countrySelectList.innerHTML = '';
  
        // The sticky search <li> ...
        const searchLi = document.createElement('li');
        searchLi.className = 'sticky top-0 bg-white z-10';
  
        const searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.id = 'countrySearchInput';
        searchInput.placeholder = 'Search';
        searchInput.className = `
          w-full
          p-3
          md:p-2
          border border-gray-300
          rounded
          focus:outline-none
          focus:ring-1
          focus:ring-green-500
          text-[18px] md:text-base
        `;
        searchInput.value = searchTerm;
  
        searchLi.appendChild(searchInput);
        countrySelectList.appendChild(searchLi);
  
        // Filter countries
        const normalizedTerm = searchTerm.toLowerCase();
        const filteredCountries = countries.filter((c) => {
          return (
            c.name.toLowerCase().includes(normalizedTerm) ||
            c.code.toLowerCase().includes(normalizedTerm)
          );
        });
  
        // Build <li> for each filtered country
        filteredCountries.forEach((c) => {
          const li = document.createElement('li');
          li.className = `
            px-3 py-3
            md:px-2 md:py-2
            hover:bg-gray-100
            cursor-pointer
            text-[18px] md:text-base
          `;
          li.innerHTML = `
            <img src="${c.flagUrl}" alt="${c.name}" class="w-5 h-3" />
            <span>${c.name}</span>
          `;
          li.addEventListener('click', () => {
            countryFlagImg.src = c.flagUrl;
            countryFlagImg.alt = c.name;
            countryDisplay.textContent = c.code;
            phoneInput.value = '';
            phoneInput.setAttribute('minlength', c.phoneMin);
            phoneInput.removeAttribute('maxlength');
            countrySelectList.classList.add('hidden');
          });
          countrySelectList.appendChild(li);
        });
  
        ///////////////////////////////////////////////////////////////////////
        // Here is the CRUCIAL part:
        // Replace `document.activeElement` with "shadow.activeElement"
        ///////////////////////////////////////////////////////////////////////
        searchInput.addEventListener('input', (e) => {
          const wasFocused = (shadow.activeElement === searchInput); // <-- ADDED
          const start = searchInput.selectionStart;
          const end = searchInput.selectionEnd;
  
          // Rebuild the entire list based on the new search term
          buildCountryList(e.target.value);
  
          // After rebuilding, if the input WAS focused, refocus the new input
          if (wasFocused) {
            const newSearchInput = countrySelectList.querySelector('#countrySearchInput');
            newSearchInput.focus();
            newSearchInput.setSelectionRange(start, end);
          }
        });
      }
  
      // Call buildCountryList initially
      buildCountryList();
  
      // Toggle the country dropdown on button click
      countrySelectBtn.addEventListener('click', () => {
        countrySelectList.classList.toggle('hidden');
      });
  
      // Instead of window, attach the "outside click" logic to the shadow root
      this.shadow.addEventListener('click', (e) => {
        if (!countrySelectBtn.contains(e.target) && !countrySelectList.contains(e.target)) {
          countrySelectList.classList.add('hidden');
        }
      });
  
      ///////////////////////////////////////////////////////////////////////
      // If there's an external button with ID="openPopup", open the popup
      // (This references the global document, but we keep it "as-is" per "no omissions"
      ///////////////////////////////////////////////////////////////////////
      const openPopupButton = document.getElementById('openPopup');
      if (openPopupButton) {
        openPopupButton.addEventListener('click', () => {
          if (!localStorage.getItem('myTrackingId')) {
            popup.classList.remove('hidden');
            popupContainer.style.animation = 'popupFadeIn 0.5s ease-out forwards';
          }
        });
      }
  
      ///////////////////////////////////////////////////////////////////////
      // Close the popup by clicking the cross
      ///////////////////////////////////////////////////////////////////////
      if (closePopupButton) {
        closePopupButton.addEventListener('click', () => {
          popup.classList.add('hidden');
          popupContainer.style.animation = '';
        });
      }
  
      ///////////////////////////////////////////////////////////////////////
      // Helper to format phone number
      ///////////////////////////////////////////////////////////////////////
      function formatPhoneNumber(phoneNumber, format) {
        let formattedNumber = '';
        let numberIndex = 0;
  
        // A) Fill the format placeholders up to as many digits as we have
        for (let i = 0; i < format.length; i++) {
          if (format[i] === '#') {
            if (numberIndex < phoneNumber.length) {
              formattedNumber += phoneNumber[numberIndex];
              numberIndex++;
            } else {
              break;
            }
          } else {
            formattedNumber += format[i];
          }
        }
  
        // B) If we still have leftover digits after filling placeholders,
        //    append them (no spaces/dashes), respecting phoneMax
        if (numberIndex < phoneNumber.length) {
          formattedNumber += phoneNumber.slice(numberIndex);
        }
  
        // C) Remove any trailing non-digit characters
        while (formattedNumber.length > 0 && !/\d$/.test(formattedNumber)) {
          formattedNumber = formattedNumber.slice(0, -1);
        }
        return formattedNumber;
      }
  
      ///////////////////////////////////////////////////////////////////////
      // Helpers to count digits & restore cursor
      ///////////////////////////////////////////////////////////////////////
      function countDigitsBefore(value, cursorIndex) {
        let count = 0;
        for (let i = 0; i < cursorIndex; i++) {
          if (/\d/.test(value[i])) {
            count++;
          }
        }
        return count;
      }
  
      function findIndexForDigitCount(formattedValue, digitCount) {
        if (digitCount <= 0) return 0;
        let count = 0;
        for (let i = 0; i < formattedValue.length; i++) {
          if (/\d/.test(formattedValue[i])) {
            count++;
            if (count === digitCount) {
              return i + 1;
            }
          }
        }
        return formattedValue.length;
      }
  
      ///////////////////////////////////////////////////////////////////////
      // Listen to phone input changes & format
      ///////////////////////////////////////////////////////////////////////
      phoneInput.addEventListener('input', (e) => {
        const inputEl = e.target;
        const rawTypedValue = inputEl.value;
  
        // A) Try to detect a leading +XX code
        let matchedCountry = null;
        let leftoverAfterCode = null;
        const matchResult = findBestCountryMatch(rawTypedValue, countries);
        if (matchResult && matchResult.match) {
          matchedCountry = matchResult.match;
          leftoverAfterCode = matchResult.leftover;
          countryFlagImg.src = matchedCountry.flagUrl;
          countryFlagImg.alt = matchedCountry.name;
          countryDisplay.textContent = matchedCountry.code;
        }
  
        // B) Count digits to the left of cursor
        const oldCursorPos = inputEl.selectionStart;
        const digitsBeforeCursor = countDigitsBefore(rawTypedValue, oldCursorPos);
  
        // C) Extract digits only from leftover or entire string
        let digitsOnly;
        if (matchedCountry) {
          digitsOnly = leftoverAfterCode.replace(/\D/g, '');
        } else {
          digitsOnly = rawTypedValue.replace(/\D/g, '');
        }
  
        // D) Enforce phoneMax
        const currentCode = countryDisplay.textContent;
        const currentCountry = countries.find(c => c.code === currentCode) || {};
        const phoneMax = currentCountry.phoneMax ?? 15;
        if (digitsOnly.length > phoneMax) {
          digitsOnly = digitsOnly.slice(0, phoneMax);
        }
  
        // E) Format the string (with leftover digits appended if needed)
        const formatPattern = phoneFormats[currentCode] || '';
        const formattedNumber = formatPhoneNumber(digitsOnly, formatPattern);
  
        // F) Keep a leading plus if typed but not matched
        let finalText = formattedNumber;
        if (!matchedCountry && rawTypedValue.trim().startsWith('+')) {
          finalText = '+' + finalText;
        }
  
        // G) Overwrite input
        inputEl.value = finalText;
  
        // H) Restore cursor
        const newCursorPos = findIndexForDigitCount(finalText, digitsBeforeCursor);
        inputEl.setSelectionRange(newCursorPos, newCursorPos);
  
        // I) Update button states
        updateButtonState();
      });
  
      ///////////////////////////////////////////////////////////////////////
      // Confirm button logic
      ///////////////////////////////////////////////////////////////////////
      // Update the button text from "Check" to "Continue"
      confirmButton.textContent = 'Continue';
      let phoneNumberForFutureUse = null;
  
      confirmButton.addEventListener('click', () => {
        if (isButtonClickable()) {
          // The moment they confirm, create the ID for the first time
          const trackingId = getOrCreateTrackingId();

          // 1) Grab data from your inputs
          const nameVal = nameInput.value.trim();
          const rawPhoneVal = phoneInput.value.trim(); 
          const hasConsent = consentCheckbox.checked ? "Yes" : "No";
          const code = countryDisplay.textContent.trim(); 

          // 2) Strip out parentheses, dashes, spaces, etc. from the phone input
          const onlyDigits = rawPhoneVal.replace(/[^\d]/g, '');

          // 3) Combine them => e.g. "+45 61354711"
          const fullNumber = code + " " + onlyDigits;

          // Show the green overlay immediately
          showThanksOverlay();
          isSubmitted = true;
          updateButtonState();

          // 4) Update cart attributes (including the tracking ID)
          fetch('/cart/update.js', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              attributes: {
                "myTrackingId": trackingId,
                "SMS Name": nameVal,
                "SMS Phone": fullNumber, 
                "SMS Consent": hasConsent
              }
            })
          }).catch(err => console.warn("Cart update failed:", err));

          // 5) POST to Make.com (Integromat) webhook and include the current URL
          fetch('https://hook.eu2.make.com/rlfqgjum19bpbqoe92hd86n03x1sthij', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              trackingId,
              name: nameVal,
              phone: fullNumber,
              consent: hasConsent,
              cartUrl: window.location.href // <--- ADDED
            })
          }).catch(err => console.warn("Webhook failed:", err));
        }
      });
  
      ///////////////////////////////////////////////////////////////////////
      // Determine button clickable state
      ///////////////////////////////////////////////////////////////////////
      function isButtonClickable() {
        const nameFilled = nameInput.value.trim() !== '';
        const phoneValue = phoneInput.value.replace(/[^\d]/g, '');
        const phoneLen = phoneValue.length;
        const currentCode = countryDisplay.textContent;
        const countryObj = countries.find(c => c.code === currentCode) || {};
        const phoneMin = countryObj.phoneMin || 1;
        const phoneMax = countryObj.phoneMax || 15;
        const phoneValidLength = (phoneLen >= phoneMin && phoneLen <= phoneMax);
        return (
          consentCheckbox.checked &&
          !isSubmitted &&
          nameFilled &&
          phoneValidLength
        );
      }
  
      ///////////////////////////////////////////////////////////////////////
      // Update button + checkbox animations
      ///////////////////////////////////////////////////////////////////////
      function updateButtonState() {
        const clickable = isButtonClickable();
        confirmButton.classList.toggle('enlarge-effect', clickable);
  
        confirmButton.classList.toggle('bg-green-500', clickable);
        confirmButton.classList.toggle('hover:bg-green-600', clickable);
        confirmButton.classList.toggle('bg-gray-300', !clickable);
        confirmButton.classList.toggle('cursor-pointer', clickable);
        confirmButton.classList.toggle('cursor-not-allowed', !clickable);
        confirmButton.classList.toggle('text-white', clickable);
        confirmButton.classList.toggle('text-gray-500', !clickable);
  
        const nameFilled = nameInput.value.trim() !== '';
        const phoneValue = phoneInput.value.replace(/[^\d]/g, '');
        const phoneLen = phoneValue.length;
        const currentCode = countryDisplay.textContent;
        const countryObj = countries.find(c => c.code === currentCode) || {};
        const phoneMin = countryObj.phoneMin || 1;
        const phoneMax = countryObj.phoneMax || 15;
        const phoneIsValid = (phoneLen >= phoneMin && phoneLen <= phoneMax);
        const isChecked = consentCheckbox.checked;
  
        const boxElement = getCheckboxBox();
        if (phoneIsValid && nameFilled && !isChecked) {
          boxElement?.classList.add('border-and-scale');
          boxElement?.classList.remove('checkbox-green');
        } else if (phoneIsValid && nameFilled && isChecked) {
          boxElement?.classList.remove('border-and-scale');
          boxElement?.classList.add('checkbox-green');
        } else if (phoneLen > 0 && !isChecked) {
          boxElement?.classList.add('border-and-scale');
          boxElement?.classList.remove('checkbox-green');
        } else {
          boxElement?.classList.remove('border-and-scale', 'checkbox-green');
        }
      }
  
      ///////////////////////////////////////////////////////////////////////
      // Show "Thanks" overlay
      ///////////////////////////////////////////////////////////////////////
      function showThanksOverlay() {
        if (!thanksShown) {
          thanksShown = true;
          thanksOverlay.classList.remove('hidden');
          thanksOverlay.style.opacity = '1'; // fade in

          // Close the popup after 1 second
          setTimeout(() => {
            popup.classList.add('hidden');
          }, 1000);
        }
      }
  
      ///////////////////////////////////////////////////////////////////////
      // React to consent, name
      ///////////////////////////////////////////////////////////////////////
      consentCheckbox.addEventListener('change', () => {
        if (!consentCheckbox.checked) {
          isConfirmed = false;
          isSubmitted = false;
        }
        updateButtonState();
      });
      nameInput.addEventListener("input", updateButtonState);
  
      ///////////////////////////////////////////////////////////////////////
      // "Continue to Checkout" logic
      ///////////////////////////////////////////////////////////////////////
      checkoutBtn.addEventListener('click', () => {
        popup.classList.add('hidden');
        popupContainer.style.animation = '';
      });
  
      ///////////////////////////////////////////////////////////////////////
      // Spin animation on checkbox toggles
      ///////////////////////////////////////////////////////////////////////
      widgetContainer.querySelectorAll('.custom-checkbox-input').forEach((checkbox) => {
        checkbox.addEventListener('change', () => {
          const box = checkbox.nextElementSibling;
          box.classList.remove('spin-anim');
          void box.offsetWidth; // Force reflow
          box.classList.add('spin-anim');
        });
      });
  
      ///////////////////////////////////////////////////////////////////////
      // Helper to get the .custom-checkbox-box element
      ///////////////////////////////////////////////////////////////////////
      function getCheckboxBox() {
        const checkboxInput = widgetContainer.querySelector('#consent');
        return checkboxInput ? checkboxInput.nextElementSibling : null;
      }
  
      ///////////////////////////////////////////////////////////////////////
      // (Optional) Open the popup when the user clicks an add-to-cart button
      ///////////////////////////////////////////////////////////////////////
      const addToCartBtn = document.querySelector('form[action^="/cart/add"] button[type="submit"]');
      if (addToCartBtn) {
        addToCartBtn.addEventListener('click', () => {
          setTimeout(() => {
            if (!localStorage.getItem('myTrackingId')) {
              popup.classList.remove('hidden');
            }
          }, 750);
        });
      }
    }
  }
  
  // 2) Register the custom element
  customElements.define('my-widget', MyWidget);  
  /*
    USAGE:
    - Include this script file in your HTML.
    - Then place <my-widget></my-widget> somewhere in your HTML.
    - That area will render the entire popup code in a Shadow DOM,
      shielding your existing site layout from Tailwind's resets.
  */
