let cInfo = "https://raw.githubusercontent.com/mledoze/countries/master/countries.json";
let dkkToDenmark = "https://gist.githubusercontent.com/Goles/3196253/raw/9ca4e7e62ea5ad935bb3580dc0a07d9df033b451/CountryCodes.json"
let countryCurrency = "https://raw.githubusercontent.com/samayo/country-json/master/src/country-by-currency-name.json"
let countryInfo;
let isoToCountry;
let currencyInWorld;

// let countryName;
// let code;
// let country;
// let info;
// let currency;
// let currencyCountry

// let iso = "JP";


// function preload() {
//   countryInfo = loadJSON(cInfo);
//   isoToCountry = loadJSON(dkkToDenmark);
//   currencyInWorld = loadJSON(countryCurrency);
// }


//converts ISO code into Country name
function convertIsoToCountry(iso) {
  //since JSON File consists of Objects you cant take length - convert it to array using keys function
  let keys = Object.keys(isoToCountry);
  for (let i = 0; i < keys.length; i++) {
    let code = isoToCountry[i].code;
    if (iso == code) {
      let country = isoToCountry[i].name;
      return(country);
    }
  }
}

//Add information from different countries
function countryToInformation(country) {
  for (let i = 0; i < 247; i++) {
    let countryName = countryInfo[i].name.common;
    if (countryName == country) {
      let info = countryInfo[i].subregion
      return(info);
    }

  }
}

//add currency to country
function countryToCurrency(country) {
  for (let i = 0; i < 242; i++) {
    let currency = currencyInWorld[i].country;
    if (country == currency) {
      let currencyCountry = currencyInWorld[i].currency_name
      return(currencyCountry);
    }
  }

}

// function setup() {
//   createCanvas(600, 400);
//   convertIsoToCountry();
//   countryToInformation();
//   countryToCurrency();
//
    // let countryName = convertIsoToCountry(iso);
    // let countryInfo = countryToInformation(countryName);
    // let currency = countryToCurrency(countryName);
//
//  text("Hello from " + country + " \nIf you don't know where it is it's " + info + "\nHope all is well \nI spend " + currencyCountry +
//  " all the time" ,200,200)
// }



//
//
//   for (let i = 0; i < 200; i++) {
//   countryName = countryInfo[i].name.official;
// }
//
//    text("Hello from " + countryName + "\n \nI hope all is well",100,100);
// }
//
//
//
//
// function draw() {
//
//
//
//
// }
