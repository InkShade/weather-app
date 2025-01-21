'use strict';

import { fetchData, url } from "./api.js";
import * as module from "./module.js";

/**
 * Pievieno notikumu uztvērēju vairākiem elementiem
 * @param {NodeList} elements Elements mezglu masīvs
 * @param {string} eventType Notikuma veids, piemēram: "klikšķis", "virziet peles kursoru"
 * @param {Function} callback Callback funkcija
 */
const addEventOnElements = function (elements, eventType, callback) {
  for (const element of elements) element.addEventListener(eventType, callback);
}

/**
 * Pārslēgt meklēšanu mobilajās ierīcēs
 */
const searchView = document.querySelector("[data-search-view]");
const searchTogglers = document.querySelectorAll("[data-search-toggler]");

const toggleSearch = () => searchView.classList.toggle("active");
addEventOnElements(searchTogglers, "click", toggleSearch);

/**
 * MEKLĒŠANAS INTEGRĀCIJA
 */
const searchField = document.querySelector("[data-search-field]");
const searchResult = document.querySelector("[data-search-result]");

let searchTimeout = null;
const serachTimeoutDuration = 500;

searchField.addEventListener("input", function () {

  searchTimeout ?? clearTimeout(searchTimeout);

  if (!searchField.value) {
    searchResult.classList.remove("active");
    searchResult.innerHTML = "";
    searchField.classList.remove("searching");
  } else {
    searchField.classList.add("searching");
  }

  if (searchField.value) {
    searchTimeout = setTimeout(() => {
      fetchData(url.geo(searchField.value), function (locations) {
        searchField.classList.remove("searching");
        searchResult.classList.add("active");
        searchResult.innerHTML = `
          <ul class="view-list" data-search-list></ul>
        `;

        const /** {Mezglu saraksts} | [] */ items = [];

        for (const { name, lat, lon, country, state } of locations) {
          const searchItem = document.createElement("li");
          searchItem.classList.add("view-item");

          searchItem.innerHTML = `
            <span class="m-icon">location_on</span>

            <div>
              <p class="item-title">${name}</p>

              <p class="label-2 item-subtitle">${state || ""} ${country}</p>
            </div>

            <a href="#/weather?lat=${lat}&lon=${lon}" class="item-link has-state" aria-label="${name} weather" data-search-toggler></a>
          `;

          searchResult.querySelector("[data-search-list]").appendChild(searchItem);
          items.push(searchItem.querySelector("[data-search-toggler]"));
        }

        addEventOnElements(items, "click", function () {
          toggleSearch();
          searchResult.classList.remove("active");
        })
      });
    }, serachTimeoutDuration);
  }

});


const container = document.querySelector("[data-container]");
const loading = document.querySelector("[data-loading]");
const currentLocationBtn = document.querySelector("[data-current-location-btn]");
const errorContent = document.querySelector("[data-error-content]");

/**
 * Renderē visus laikapstākļu datus html lapā
 * 
 * @param {number} lat Platums
 * @param {number} lon Garums
 */
export const updateWeather = function (lat, lon) {

  loading.style.display = "grid";
  container.style.overflowY = "hidden";
  container.classList.remove("fade-in");
  errorContent.style.display = "none";

  const currentWeatherSection = document.querySelector("[data-current-weather]");
  const hourlySection = document.querySelector("[data-hourly-forecast]");
  const forecastSection = document.querySelector("[data-5-day-forecast]");

  currentWeatherSection.innerHTML = "";
  hourlySection.innerHTML = "";
  forecastSection.innerHTML = "";

  if (window.location.hash === "#/current-location") {
    currentLocationBtn.setAttribute("disabled", "");
  } else {
    currentLocationBtn.removeAttribute("disabled");
  }

  /**
   * PAŠREIZĒJĀ LAIKA SADAĻA
   */
  fetchData(url.currentWeather(lat, lon), function (currentWeather) {

    const {
      weather,
      dt: dateUnix,
      main: { temp },
      timezone
    } = currentWeather
    const [{ description, icon }] = weather;

    const card = document.createElement("div");
    card.classList.add("card", "card-lg", "current-weather-card");

    card.innerHTML = `
      <h2 class="title-2 card-title">Tagad</h2>

      <div class="weapper">
        <p class="heading">${parseInt(temp)}&deg;<sup>c</sup></p>

        <img src="./assets/images/weather_icons/${icon}.png" width="64" height="64" alt="${description}"
          class="weather-icon">
      </div>

      <p class="body-3">${description}</p>

      <ul class="meta-list">

        <li class="meta-item">
          <span class="m-icon">calendar_today</span>

          <p class="title-3 meta-text">${module.getDate(dateUnix, timezone)}</p>
        </li>

        <li class="meta-item">
          <span class="m-icon">location_on</span>

          <p class="title-3 meta-text" data-location></p>
        </li>

      </ul>
    `;

    fetchData(url.reverseGeo(lat, lon), function ([{ name, country }]) {
      card.querySelector("[data-location]").innerHTML = `${name}, ${country}`
    });

    currentWeatherSection.appendChild(card);

    /**
     * 24H PROGNOZES SADAĻA
     */
    fetchData(url.forecast(lat, lon), function (forecast) {

      const {
        list: forecastList,
        city: { timezone }
      } = forecast;

      hourlySection.innerHTML = `
        <h2 class="title-2">Šodien plkst</h2>

        <div class="slider-container">
          <ul class="slider-list" data-temp></ul>
        </div>
      `;

      for (const [index, data] of forecastList.entries()) {

        if (index > 7) break;

        const {
          dt: dateTimeUnix,
          main: { temp },
          weather,
        } = data
        const [{ icon, description }] = weather

        const tempLi = document.createElement("li");
        tempLi.classList.add("slider-item");

        tempLi.innerHTML = `
          <div class="card card-sm slider-card">

            <p class="body-3">${module.getHours(dateTimeUnix, timezone)}</p>

            <img src="./assets/images/weather_icons/${icon}.png" width="48" height="48" loading="lazy" alt="${description}"
              class="weather-icon" title="${description}">

            <p class="body-3">${parseInt(temp)}&deg;</p>

          </div>
        `;
        hourlySection.querySelector("[data-temp]").appendChild(tempLi);

        const windLi = document.createElement("li");
        windLi.classList.add("slider-item");

        windLi.innerHTML = `
        <div class="card card-sm slider-card">

          <p class="body-3">${module.getHours(dateTimeUnix, timezone)}</p>

        </div>
        `;

      }

      /**
       * 5 DIENU PROGNOZES SADAĻA
       */
      forecastSection.innerHTML = `
        <h2 class="title-2" id="forecast-label">5 Dienu prognoze</h2>

        <div class="card card-lg forecast-card">
          <ul data-forecast-list></ul>
        </div>
      `;

      for (let i = 7, len = forecastList.length; i < len; i += 8) {

        const {
          main: { temp_max },
          weather,
          dt_txt
        } = forecastList[i];
        const [{ icon, description }] = weather
        const date = new Date(dt_txt);

        const li = document.createElement("li");
        li.classList.add("card-item");

        li.innerHTML = `
          <div class="icon-wrapper">
            <img src="./assets/images/weather_icons/${icon}.png" width="36" height="36" alt="${description}"
              class="weather-icon" title="${description}">

            <span class="span">
              <p class="title-2">${parseInt(temp_max)}&deg;</p>
            </span>
          </div>

          <p class="label-1">${date.getDate()} ${module.monthNames[date.getUTCMonth()]}</p>

          <p class="label-1">${module.weekDayNames[date.getUTCDay()]}</p>
        `;
        forecastSection.querySelector("[data-forecast-list]").appendChild(li);

      }

      loading.style.display = "none";
      container.style.overflowY = "overlay";
      container.classList.add("fade-in");
    });

  });

}

export const error404 = () => errorContent.style.display = "flex";