const themeBtn = document.getElementById("theme-btn");
const siteBody = document.querySelector("body");
const filterButton = document.getElementById("filter-btn");
const filterDropdown = document.querySelector(".filter-dropdown");
const regionButtons = document.querySelectorAll(".region-btn");
const filterBtnText = document.getElementById("filter-btn-text");
const cancelFilterButton = document.getElementById("cancel-filter-btn");
const searchInput = document.getElementById("search-input");
const cancelUserInputBtn = document.getElementById("cancel-user-input-btn");
const countryListSection = document.getElementById("country-list");
const countrySelected = document.getElementById("country-selected");
const backBtn = document.getElementById("back-btn");
const topBtnContainer = document.querySelector(".top-btn-container");

// =========================================================================================================
//                                            BUTTONS AND INPUT
// =========================================================================================================

// ================================
// THEME BUTTON
// ================================

// for toggling on/off light-mode theme
themeBtn.addEventListener("click", () => {
  siteBody.classList.toggle("light-mode");
});

// ================================
// REGION FILTER BUTTONS
// ================================

// for toggling display of box with region buttons (Africa, Americas etc.)
filterButton.addEventListener("click", (e) => {
  e.stopPropagation();
  filterDropdown.classList.toggle("active");
});

let region = "";
// region buttons functionality
regionButtons.forEach((regionButton) => {
  regionButton.addEventListener("click", () => {
    // adds to section with list of countries class of "country-filtered-list"
    if (!countryListSection.classList.contains("country-filtered-list")) countryListSection.classList.add("country-filtered-list");

    cardDisplayReset();
    region = regionButton.textContent;

    // "America" => "Americas" for same spelling in country.region
    if (region == "America") region += "s";

    filterByRegion(region.toLowerCase());

    // resets "cardCount" and "cardFilteredCount" triggers "showFilteredCards" function if search input isn't empty -> if it is, triggers fake input function
    if (searchInput.value == "") {
      cardCount = 0;
      cardFilteredCount = 0;
      showFilteredCards();
    } else {
      userInputTextFilter();
    }

    // sets text on region filter accordingly
    filterBtnText.textContent = `Region: ${region}`;

    // displays cancelling region filter button (cross)
    cancelFilterButton.style.display = "flex";

    // toggles off display of box with region buttons
    filterButton.click();
  });
});

// ================================
// CANCEL REGION FILTER BUTTON
// ================================

// cross button functionality for cancelling chosen region filter
cancelFilterButton.addEventListener("click", () => {
  // removes from section with list of countries class of "country-filtered-list"
  countryListSection.classList.remove("country-filtered-list");

  // hides cancelling region filter button (cross)
  cancelFilterButton.style.display = "none";

  // sets text on region filter to orignal
  filterBtnText.textContent = "Filter by Region";

  cardDisplayReset();

  // search input is empty resets "cardCount" and triggers "showCards" function
  if (searchInput.value == "") {
    cardCount = 0;
    showCards();
  }
});

// helper function for region filtering - hides country cards accordingly
function filterByRegion(clickedRegion) {
  countryCardList.forEach((countryCard) => {
    if (!countryCard.classList.contains(clickedRegion)) {
      countryCard.style.display = "none";
      countryCard.classList.add("filtered");
    }
  });
}

/** fakes search user input for triggering, typed beforehand, value in search input*/
function userInputTextFilter() {
  let fakeUserInput = new Event("input", {
    bubbles: true,
    cancelable: true,
  });
  searchInput.dispatchEvent(fakeUserInput);
}

/** hides all country cards, removes "filtered" class from them and triggers search user input if it wasn't empty */
function cardDisplayReset() {
  countryCardList.forEach((countryCard) => {
    countryCard.style.display = "none";
    if (countryCard.classList.contains("filtered")) countryCard.classList.remove("filtered");
  });

  if (searchInput.value != "") userInputTextFilter();
}

// ================================
// FLAG SEARCH BAR
// ================================

searchInput.value = "";
searchInput.addEventListener("input", () => {
  let userInput = searchInput.value.toLowerCase().trim().replaceAll(" ", "");
  countryCardList.forEach((countryCard) => {
    if (!countryCard.id.replaceAll("-", "").includes(userInput) && !countryCard.classList.contains("filtered")) {
      countryCard.style.display = "none";
    } else if (!countryCard.classList.contains("filtered")) {
      countryCard.style.display = "flex";
    }
  });

  searchInput.value != "" ? (cancelUserInputBtn.style.display = "flex") : (cancelUserInputBtn.style.display = "none");
});

// ================================
// CANCEL SEARCH BAR VALUE
// ================================

// for reseting user search input
cancelUserInputBtn.addEventListener("click", () => {
  // removes text from search input
  searchInput.value = "";

  // removes button from search input
  cancelUserInputBtn.style.display = "none";

  // if there isn't chosen region filter -> resets "cardCount" and triggers "showCards" function
  // if there is chosen region filter -> resets "cardFilteredCount" and triggers "showFilteredCards" function
  cardCount = 0;
  cardFilteredCount = 0;
  if (!countryListSection.classList.contains("country-filtered-list")) {
    showCards();
  } else {
    showFilteredCards();
  }
});

// ================================
// BACK BUTTON
// ================================

let savedWindowScrollPosition = 0;
// back button functionality
backBtn.addEventListener("click", () => {
  // works only if country card was clicked
  if (siteBody.classList.contains("clicked-country-active")) {
    siteReset();

    // sets "active" class accordingly to cotainer of "bring to top page" button
    if (savedWindowScrollPosition > 500 && !topBtnContainer.classList.contains("active")) {
      topBtnContainer.classList.add("active");
    }

    // scrolls back to where user clicked country card
    window.scrollTo(0, savedWindowScrollPosition);
  }
});

/**removes all children nodes from "countrySelected" section and removes "clicked-country-active" class from site body */
function siteReset() {
  countrySelected.innerHTML = "";
  siteBody.classList.remove("clicked-country-active");
}

// ================================
// TOP BUTTON
// ================================

// arrow button to scroll back to top of the page
topBtnContainer.addEventListener("click", () => {
  window.scrollTo(0, 0);
});

// =========================================================================================================
//                                            COUNTRY CARDS
// =========================================================================================================

// ================================
// JSON FETCH
// ================================

const restCountriesVer = "v3.1";
const restCountriesFields = "flags,name,tld,cca3,currencies,capital,region,subregion,languages,borders,maps,population";
fetch(`https://restcountries.com/${restCountriesVer}/all?${restCountriesFields}`, { cache: "no-store" })
  .then((response) => response.json())
  .then((data) => {
    // saves fetched data to global variable "countryData"
    countryData = data;

    renderFlagCards();
    showCards();

    // after rendering all country cards, selects all of them and stores in global variable "countryCardList"
    countryCardList = document.querySelectorAll(".country-card");
  });

// ================================
// FLAG CARD RENDERING FUNCTION
// ================================

/**creates all country cards from global variable and gives them functionalities */
function renderFlagCards() {
  countryData.forEach((country) => {
    const countryCard = document.createElement("li");
    const countryFlag = document.createElement("div");
    const countryFlagImage = document.createElement("img");
    const countryDetails = document.createElement("div");
    const countryName = document.createElement("h2");
    const countryPopulationTxt = document.createElement("p");
    const countryPopulation = document.createElement("span");
    const countryRegionTxt = document.createElement("p");
    const countryRegion = document.createElement("span");
    const countryCapitalTxt = document.createElement("p");

    countryCard.classList.add("country-card");
    countryCard.classList.add(country.region.toLowerCase());
    let countryCardId = country.name.official.toLowerCase();
    if (countryCardId.includes(" ")) countryCardId = countryCardId.replaceAll(" ", "-");
    countryCard.id = countryCardId;

    countryFlag.classList.add("country-flag");
    countryFlagImage.src = country.flags.svg;
    countryFlagImage.alt = "country-flag";

    countryDetails.classList.add("country-details");

    countryName.textContent = country.name.official;

    countryPopulationTxt.textContent = "Population: ";
    countryPopulation.textContent = comaInserter(country.population);

    /**inserts coma every third digit to population number */
    function comaInserter(populationNumber) {
      const numberArray = [];
      if (populationNumber.toString().length < 4) {
        numberArray.push(populationNumber);
      } else {
        for (let i = populationNumber; i > 1; i /= 1000) {
          Math.floor(i) < 999 ? numberArray.unshift(Math.floor(i)) : numberArray.unshift(Math.floor(i % 1000));
        }
      }
      return numberArray.join(",");
    }

    countryRegionTxt.textContent = "Region: ";
    countryRegion.textContent = country.region;

    countryCapitalTxt.textContent = "Capital: ";
    if (country.capital) {
      const countryCapital = document.createElement("span");
      countryCapital.textContent = country.capital[0];
      countryCapitalTxt.appendChild(countryCapital);
    }

    countryFlag.appendChild(countryFlagImage);
    countryPopulationTxt.appendChild(countryPopulation);
    countryRegionTxt.appendChild(countryRegion);
    countryDetails.appendChild(countryName);
    countryDetails.appendChild(countryPopulationTxt);
    countryDetails.appendChild(countryRegionTxt);
    countryDetails.appendChild(countryCapitalTxt);
    countryCard.appendChild(countryFlag);
    countryCard.appendChild(countryDetails);
    countryListSection.appendChild(countryCard);

    // ================================
    // CLICKED COUNTRY CARD RENDER
    // ================================

    // creates selected (clicked) country elements, including clicked border country
    countryCard.addEventListener("click", () => {
      // toggles off display of box with region buttons if it was opened
      if (filterDropdown.classList.contains("active")) filterButton.click();

      // when country card is clicked adds "clicked-country-active" class to body
      // and removes class "active" from "bring me to top" button
      siteBody.classList.add("clicked-country-active");
      topBtnContainer.classList.remove("active");

      const countryFlagSelected = document.createElement("div");
      const countryDetailsSelected = document.createElement("div");
      const countryNameSelected = document.createElement("h1");
      const countryDetailsSelectedContent = document.createElement("div");
      const countryDetails1Selected = document.createElement("div");
      const nativeNameTxt = document.createElement("p");
      const subRegionTxt = document.createElement("p");
      const subRegion = document.createElement("span");
      const countryDetails2Selected = document.createElement("div");
      const topLevelDomainTxt = document.createElement("p");
      const topLevelDomain = document.createElement("span");
      const currenciesTxt = document.createElement("p");
      const languagesTxt = document.createElement("p");
      const takeMeThereLink = document.createElement("a");
      const borderCountries = document.createElement("div");
      const borderCountriesTxt = document.createElement("h2");
      const borderCountryButtonsContainer = document.createElement("div");

      let selectedCountryFlag = countryFlagImage.cloneNode(true);
      let selectedCountryPopulation = countryPopulationTxt.cloneNode(true);
      let selectedCountryRegion = countryRegionTxt.cloneNode(true);
      let selectedCountryCapital = countryCapitalTxt.cloneNode(true);

      countryFlagSelected.classList.add("country-flag-selected");

      countryDetailsSelected.classList.add("country-details-selected");

      countryNameSelected.id = "country-name-selected";
      countryNameSelected.textContent = countryName.textContent;

      countryDetailsSelectedContent.classList.add("country-details-selected-content");

      countryDetails1Selected.classList.add("country-details-1-selected");

      nativeNameTxt.id = "native-name-selected";
      nativeNameTxt.textContent = "Native Name: ";
      for (const property in country.name.nativeName) {
        const nativeName = document.createElement("span");
        nativeName.textContent = `${property}: ${country.name.nativeName[property].official}`;
        nativeNameTxt.appendChild(nativeName);
      }

      subRegionTxt.textContent = "Sub Region: ";
      subRegion.textContent = country.subregion;

      countryDetails2Selected.classList.add("country-details-2-selected");

      topLevelDomainTxt.textContent = "Top Level Domain: ";
      topLevelDomain.textContent = country.tld[0];

      currenciesTxt.id = "currencies-selected";
      currenciesTxt.textContent = "Currencies: ";
      for (const property in country.currencies) {
        const currencies = document.createElement("span");
        currencies.textContent = `${property}: ${country.currencies[property].name} (${country.currencies[property].symbol})`;
        currenciesTxt.appendChild(currencies);
      }

      languagesTxt.id = "languages-selected";
      languagesTxt.textContent = "Languages: ";
      for (const property in country.languages) {
        const languages = document.createElement("span");
        languages.textContent = `${property}: ${country.languages[property]}`;
        languagesTxt.appendChild(languages);
      }

      takeMeThereLink.id = "take-me-there-link";
      takeMeThereLink.textContent = "Take me there...";
      takeMeThereLink.href = country.maps.googleMaps;
      takeMeThereLink.target = "_blank";

      borderCountries.classList.add("border-countries");
      borderCountryButtonsContainer.classList.add("border-country-buttons-container");

      let nameOfSelectedCountryBorderName = "";
      let borderCountryBtnId = "";
      if (country.borders) {
        borderCountriesTxt.textContent = "Border Countries:";

        // ================================
        // COUNTRY BORDER BUTTONS
        // ================================

        // creates selected country from clicked border
        country.borders.forEach((countryBorder) => {
          const borderCountryBtn = document.createElement("button");
          borderCountryBtn.classList.add("border-country-btn");

          getFullBorderCountryName(countryBorder);

          borderCountryBtn.id = borderCountryBtnId;
          borderCountryBtn.textContent = nameOfSelectedCountryBorderName;

          borderCountryButtonsContainer.appendChild(borderCountryBtn);

          borderCountryBtn.addEventListener("click", () => {
            countryCardList.forEach((countryCard) => {
              if (countryCard.id == borderCountryBtn.id) {
                siteReset();
                countryCard.click();
              }
            });
          });

          /** country.borders has only cca3 names and this function looks for appropriate full official name of country */
          function getFullBorderCountryName(selectedCountryBorder) {
            countryData.forEach((country) => {
              if (country.cca3 == selectedCountryBorder) {
                nameOfSelectedCountryBorderName = country.name.official;
                borderCountryBtnId = country.name.official.toLowerCase();

                if (borderCountryBtnId.includes(" ")) {
                  borderCountryBtnId = borderCountryBtnId.replaceAll(" ", "-");
                }
              }
            });
          }
        });
      } else {
        borderCountriesTxt.textContent = "Border Countries: None";
      }

      countryFlagSelected.appendChild(selectedCountryFlag);
      subRegionTxt.appendChild(subRegion);
      topLevelDomainTxt.appendChild(topLevelDomain);
      countryDetails1Selected.appendChild(nativeNameTxt);
      countryDetails1Selected.appendChild(selectedCountryPopulation);
      countryDetails1Selected.appendChild(selectedCountryRegion);
      countryDetails1Selected.appendChild(subRegionTxt);
      countryDetails1Selected.appendChild(selectedCountryCapital);
      countryDetails2Selected.appendChild(topLevelDomainTxt);
      countryDetails2Selected.appendChild(currenciesTxt);
      countryDetails2Selected.appendChild(languagesTxt);
      countryDetails2Selected.appendChild(takeMeThereLink);
      countryDetailsSelectedContent.appendChild(countryDetails1Selected);
      countryDetailsSelectedContent.appendChild(countryDetails2Selected);
      borderCountries.appendChild(borderCountriesTxt);
      borderCountries.appendChild(borderCountryButtonsContainer);
      countryDetailsSelected.appendChild(countryNameSelected);
      countryDetailsSelected.appendChild(countryDetailsSelectedContent);
      countryDetailsSelected.appendChild(borderCountries);
      countrySelected.appendChild(countryFlagSelected);
      countrySelected.appendChild(countryDetailsSelected);
    });
  });
}

// =========================================================================================================
//                                            WINDOW EVENTS
// =========================================================================================================

// ================================
// COUNTRY LIST DISPLAY
// ================================

let cardCount = 0;
/**for displaying first 50 cards and loading next cards on reaching screen bottom, on country list screen without chosen region and without search user input*/
function showCards() {
  let maxCardCount = 50 + cardCount;

  // doesn't let "maxCardCount" to go over number of all country cards
  if (maxCardCount > countryListSection.children.length) maxCardCount = countryListSection.children.length;

  // shows 0-49 cards -> reach bottom -> loads 50-99 cards etc.
  for (let i = cardCount; i < maxCardCount; i++) {
    countryListSection.children[i].style.display = "flex";
  }
  cardCount += 50;
}

// ================================
// REGION LIST DISPLAY
// ================================

let cardFilteredCount = 0;
/**for displaying first 10 cards and loading next cards on reaching screen bottom, on country list screen with chosen region but without search user input*/
function showFilteredCards() {
  const countryIndexArray = [];
  let maxCardFilteredCount = 10 + cardFilteredCount;

  // with chosen region, stores appropriate index's into array "countryIndexArray"
  for (let i = 0; i < countryCardList.length; i++) {
    if (countryCardList[i].classList.contains(region.toLowerCase())) countryIndexArray.push(i);
  }

  // doesn't let "maxCardFilteredCount" to go over number of filtered by region country cards
  if (maxCardFilteredCount > countryIndexArray.length) maxCardFilteredCount = countryIndexArray.length;

  // shows 0-9 cards -> reach bottom -> loads 10-19 cards etc.
  for (let i = cardFilteredCount; i < maxCardFilteredCount; i++) {
    countryCardList[countryIndexArray[i]].style.display = "flex";
  }
  cardFilteredCount += 10;
}

// ================================
// WINDOW EVENTS
// ================================

// gives functionality for scrolling on site
window.addEventListener("scroll", () => {
  // for displaying and removing "bring to top" button accrordingly
  if (topBtnContainer.classList.contains("active") && window.scrollY <= 500) {
    topBtnContainer.classList.remove("active");
  } else if (!topBtnContainer.classList.contains("active") && window.scrollY > 500) {
    topBtnContainer.classList.add("active");
  }

  // only works on country list screen and not clicked country
  if (!siteBody.classList.contains("clicked-country-active")) {
    // saves user scroll position
    savedWindowScrollPosition = window.scrollY;

    // doesn't let next functions to trigger if all country cards are already on screen
    if (cardCount > countryListSection.children.length) return;

    // depending, if countries are filtered by region triggers "showFilteredCards" function, if not -> triggers "showCards"
    let stopper = false;
    if (window.scrollY >= siteBody.scrollHeight - 1000 && !stopper && countryListSection.classList.contains("country-filtered-list")) {
      stopper = true;
      showFilteredCards();
    } else if (window.scrollY >= siteBody.scrollHeight - 1300 && !stopper && !countryListSection.classList.contains("country-filtered-list")) {
      stopper = true;
      showCards();
    }

    // blocks flags from showing up which aren't currently searched
    if (searchInput.value != "") {
      userInputTextFilter();
    }
  }
});

// for closing region box when clicked outside of its boundries
window.addEventListener("click", () => {
  if (filterDropdown.classList.contains("active")) {
    filterButton.click();
  }
});
