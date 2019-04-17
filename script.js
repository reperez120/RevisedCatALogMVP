'use strict';

const state = {
  searchArea: null,
  traits: [],
  limitResults: 10,
}

const cat = 'cat'
const catApiUrl = 'https://api.thecatapi.com/v1/breeds';
let petFinderToken
const petFinderUrl = 'https://api.petfinder.com/v2/animals';
const petOptions = {
  headers: new Headers({
  "Authorization": `Bearer ${petFinderToken}`
  })
};

function getPetFinderToken() {
  const url = 'https://api.petfinder.com/v2/oauth2/token'
  return fetch(url, {
    method: 'POST',
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: 'grant_type=client_credentials&client_id=8VHjo56KesqnXAKMOPSPUodvTGOrp5taxiTZaMCZCO87bxxPor&client_secret=RVTINAgCa6frkrot0LPro4B219oirtCu7Bf8LSZa'
  })
    .then(res => res.json())
}

function formatQueryParams(params) {
  const queryItems = Object.keys(params)
    .map(key => `${encodeURIComponent(key)}=${params[key]}`)
  return queryItems.join('&');
}

function runCatData() {
  return fetch(catApiUrl) 
    .then(response => response.json())
    .then(data => {
      let filtered = data
        .filter(data => { 
          if (state.traits.includes('dog-friendly'))     
            return data.dog_friendly === 5
          else return data
        })
        .filter(data => { 
          if (state.traits.includes('child-friendly'))   
            return data.child_friendly === 5
          else return data
        })
        .filter(data => { 
          if (state.traits.includes('low-grooming-needs'))
            return data.grooming <= 1
          else return data
        })
        .filter(data => { 
          if (state.traits.includes('adaptability'))
            return data.hypoallergenic === 5
          else return data
        })
        .filter(data => { 
          if (state.traits.includes('social'))
            return data.social_needs === 5
          else return data
        })
        .filter(data => { 
          if (state.traits.includes('stranger-friendly'))
            return data.stranger_friendly === 5
          else return data
        })
        .filter(data => {
          if (state.traits.includes('energetic'))
            return data.energy === 5
          else return data
        })
      const breedNames = [];
      filtered.forEach(breed => {
        breedNames.push(breed.name)
      })
      if (Array.isArray(breedNames) && breedNames.length) {
      return breedNames;
      }
      throw new Error(results.statusText);
      })
    .then(breeds => getCats(cat, state.searchArea, breeds))
    .catch(err => {
       $('#js-error-message').text(`Something went wrong: ${err.message}`);
     });
  }

function getCats(type, searchArea, breeds) {
  const params = {
    type: cat,
    location: searchArea,
    breeds: breeds.join(','),
  }
  const petOptions = {
    headers: new Headers({
      "Authorization": `Bearer ${petFinderToken}`
    })
  }
  const queryString = formatQueryParams(params);
  const url = petFinderUrl + '?' + queryString;
  fetch(url, petOptions)
    .then(results => {
      if (results.ok) {
        return results.json()
      }
      throw new Error(results.statusText);
    })
    .then(displayResults)
    .catch(err => {
      $('#js-error-message').text(`Something went wrong: ${err.message}`);
     });
}

function displayResults(responseJson) {
  let html = ''
  for (let i = 0; i < responseJson.animals.length; i++){
    html += '<div class="item">'
    const header = `<h5 class="cat-name"><a href="${responseJson.animals[i].url}">${responseJson.animals[i].name}</a></h5>`
    html += header
    const description = `<p>${responseJson.animals[i].description || 'No description available'}</p>`
    html += description 
    if (responseJson.animals[i].photos.length) {
      const photos = responseJson.animals[i].photos
      for (let photo of photos) {
        html += `<img src="${photo.small}" class="banner-img" alt="photo of ${responseJson.animals[i].name} the cat"/>`
      }
    }
    html += '</div>'
  }
  $('.results-wrapper').html(html);
}

function watchForm() {
  $(".submitButton").click(event => {
    event.preventDefault();
    state.traits = []
    $('input[name=trait]:checked').each((idx, trait) => {
      state.traits.push(trait.value)
    });
     const zipCode = $('#geo-area').val();
    state.searchArea = parseInt(zipCode);
    runCatData(); 
  });
}

getPetFinderToken()
  .then(res => {
    setInterval(function () { 
      getPetFinderToken()
        .then(res => {
          petFinderToken = res.access_token
        })
    }, res.expires_in)
    petFinderToken = res.access_token
    $(watchForm)
  })
