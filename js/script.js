const posterBox = document.querySelectorAll(".poster-box")
const filmOverlay = document.querySelectorAll('.film-overlay')

const filmPromise = fetch("./js/films_list.json")
.then(response => {
   return response.json();
}).catch(console.error)

//Gets options for user to select from
const selectionPromise = filmPromise.then(response => selectors(response))

/*
Functions for options in dropdown menus
*/

//Directing to each individual option selector
function selectors(filmList) {
    let genres = []
    let languages = []
    let decades = []
    filmList.forEach(element => {
        genreOptions(element['genre'], genres);    
        languageOptions(element['language'], languages)
        decadeOptions(element['year'], decades)
    });
    //Adding available genres to html
    const genreDropdown = document.querySelector("#genre")
    for (let genre in genres) {
        const option = document.createElement("option")
        option.value = genres[genre]
        option.textContent = genres[genre][0].toUpperCase() + genres[genre].substring(1)
        genreDropdown.append(option)
    }
    //Adding available languages to html
    const langDropdown = document.querySelector("#language");
    for (let language in languages) {
        const option = document.createElement("option")
        option.value = languages[language]
        option.textContent = languages[language][0].toUpperCase() + languages[language].substring(1)
        langDropdown.append(option)
    }
    //Adding available decades to html
    const decadeDropdown = document.querySelector("#decade")
    for (let decade in decades) {
        const option = document.createElement("option")
        option.value = decades[decade]
        option.textContent = String(decades[decade]) + 's'
        decadeDropdown.append(option)
    }
}

//Going through the genres
function genreOptions(filmGenre, available) {
    filmGenre.forEach((genre) => {
        if (!available.includes(genre)) {
            available.push(genre)
        }
    })
    return available.sort()
}

//Going through the languages
function languageOptions(filmLanguage, available) {
    if (!available.includes(filmLanguage)) {
        available.push(filmLanguage)
    }
    return available.sort()
}

//Going through years for decades
function decadeOptions(filmYear, available) {
    let decade = Math.floor(filmYear/10) * 10;
    if (!available.includes(decade)) {
        available.push(decade)
    }
    return available.sort()
}

// Form submission
const form = document.querySelector("form");
form.addEventListener("submit", function(event){chooserFunc(event)})

function chooserFunc(event) {
    event.preventDefault();

    //Reset output areas
    posterBox.forEach((poster) => poster.innerHTML="")
    filmOverlay.forEach((inner) => inner.innerHTML="")
    
    
    //Sets users choice of film
    const formData = new FormData(form);
    const userFilm = Object.fromEntries(formData)

    //Filters films to get list of all to users requirements 
    const validFilms = filmPromise.then((films) => films.filter(function(item) {
        for (let key in userFilm) {
            if (item[key] === undefined) {
                return false;
            }
        }
        const validRun = runtimeFilter(item.runtime, userFilm.runtime)
        const validGenre = genreFilter(item.genre, userFilm.genre)
        const validLang = languageFilter(item.language, userFilm.language)
        const validYear = decadeFilter(item.year, userFilm.year)
        return (validRun && validGenre && validLang && validYear);}))
        .then(films => filmsChosen(films))
        .catch(console.error)
}

/*
Choice filter functions
*/

//Allows for +10 mins
function runtimeFilter(filmRuntime, userRuntime) {
    if (userRuntime == 0) {
        return true
    }
    return filmRuntime <= (parseInt(userRuntime) + 10);
}
//Checks a film contains the users selected genre
function genreFilter(filmGenre, userGenre) {
    if (userGenre === 'any-genre') {
        return true
    }
    return filmGenre.includes(userGenre);
}
//Selects language
function languageFilter(filmLanguage, userLanguage) {
    if (userLanguage === 'any-lang') {
        return true
    }
    return filmLanguage === userLanguage;
}
//Selects decade
function decadeFilter(filmYear, userDecade) {
    if (userDecade === 'any-decade') {
        return true
    }
    let decade = Math.floor(filmYear / 10) * 10;
    return decade === parseInt(userDecade);
}

/*
Output Area
*/

const APIKEY = "87337df5190b4447f246a4872658a898";
let baseURL = 'https://api.themoviedb.org/3/';
let configData = null;
let baseImageURL = null;

//Configure the api and the urls for later use
function configTMDB() {
    let url = "".concat(baseURL, 'configuration?api_key=', APIKEY); 
    fetch(url)
    .then((result)=>{
        return result.json();
    })
    .then((data)=>{
        baseImageURL = data.images.secure_base_url;
        configData = data.images;
        console.log('config fetched');
    })
    .catch(function(err){
        alert(err);
    });
}
document.addEventListener('DOMContentLoaded', configTMDB);

//Takes available films, shuffles and picks first 5
function filmsChosen(films) {
    //Random Shuffle of array
    films = films.sort(() => Math.random() - 0.5)
    //Pick 5 films
    for (let i=0; i<=4; i++) {
        console.log(films[i].name)
        filmSearch(films[i], i,films)
    }
}

//Search for films based on name, year of release to pick the correct
function filmSearch(film, index) {
    let url = ''.concat(baseURL, 'search/movie?api_key=', APIKEY, '&query=', film.name);
    fetch(url)
    .then(result=>result.json())
    .then((data)=>{
        let i =0
        while (data.results[i].release_date.substring(0,4) != film.year) {
            i++
        }
        filmOutput(data.results[i], index, film);        
    })
    .catch(console.error)
}

//Output to the correct part of index.html for the title, overview and image
function filmOutput(data, index, film) {
    const leftFilm = document.createElement("section")
    leftFilm.className = "left-film"
    
    const rightFilm = document.createElement("section")
    rightFilm.className = "left-film"

    const heading = document.createElement("h2");
    heading.textContent = film.name;
    heading.className = "film-name"

    const overview = document.createElement("p")
    overview.textContent = data.overview
    overview.className = "film-overview"

    const director = document.createElement("h3")
    director.textContent = film.director

    const genre = document.createElement("h3")
    genre.textContent = film.genre

    const year = document.createElement("h3")
    year.textContent = film.year
    
    const poster = document.createElement("img")
    poster.src = baseImageURL + "w500" + data.poster_path
    poster.alt = "Poster for " + data.title
    poster.className = "poster";
    
    leftFilm.append(heading,overview);
    rightFilm.append(director, genre, year);
    filmOverlay[index].append(leftFilm, rightFilm)
    posterBox[index].append(poster);
    posterBox[index].tabIndex = 0
}

/*
Overlay functions
*/
const overlay = document.querySelector(".overlay");
const closeBox = document.querySelectorAll(".close")

//Turning posters into buttons to open overlay
posterBox.forEach((button, index) => {
    button.addEventListener("click", () => {
        overlay.style.display = "block"
        filmOverlay[index].style.display = "flex"
    });
  });

//Setting close for clicking x
closeBox.forEach((button, index) => {
    button.addEventListener("click", () => {
        overlay.style.display = "none"
        filmOverlay[index].style.display = "none"
    });
  });

// When the user clicks anywhere outside of the overlay, close it
window.onclick = function(event) {
  if (event.target == overlay) {
    filmOverlay.forEach((film) => {
        film.style.display = "none"
    })    
    overlay.style.display = "none";
  }
}