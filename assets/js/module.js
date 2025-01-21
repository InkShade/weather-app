'use strict';

export const weekDayNames = [
  "Svētdiena",
  "Pirmdiena",
  "Otrdiena",
  "Trešdiena",
  "Ceturdiena",
  "Piektdiena",
  "Sestdiena"
];

export const monthNames = [
  "Janvāris",
  "Februāris",
  "Marts",
  "Aprils",
  "Maijs",
  "Jūnijs",
  "Jūlijs",
  "Augusts",
  "Septembris",
  "Oktobris",
  "Novembris",
  "Decembris"
];

/**
 * @param {number} dateUnix Unix datums sekundēs
 * @param {number} timezone Laika joslas maiņa no UTC sekundēs
 * @returns {string} Datuma virkne. formāts: "pirmdiena, 1. maijs"
 */
export const getDate = function (dateUnix, timezone) {
  const date = new Date((dateUnix + timezone) * 1000);
  const weekDayName = weekDayNames[date.getUTCDay()];
  const monthName = monthNames[date.getUTCMonth()];

  return `${weekDayName} ${date.getUTCDate()}, ${monthName}`;
}
/**
 * @param {number} timeUnix Unix datums sekundēs
 * @param {number} timezone Laika joslas maiņa no UTC sekundēs
 * @returns {string} Laika virkne. formāts: "HH AM/PM"
 */
export const getHours = function (timeUnix, timezone) {
  const date = new Date((timeUnix + timezone) * 1000);
  const hours = date.getUTCHours();
  const period = hours == 0 ? "0:00" : ":00";

  return `${hours}${period}`;
}
