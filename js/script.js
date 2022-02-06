const filmPromise = fetch("./js/films_list.json")
.then(response => {
   return response.json();
})

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
    for (let genre in genres) {
        document.getElementById('genre').innerHTML += `<option value="${genres[genre]}">${genres[genre][0].toUpperCase() + genres[genre].substring(1)}</option>`
    }
    //Adding available languages to html
    for (let language in languages) {
        document.getElementById('language').innerHTML += `<option value="${languages[language]}">${languages[language][0].toUpperCase() + languages[language].substring(1)}</option>`
    }
    //Adding available decades to html
    for (let decade in decades) {
        document.getElementById('decade').innerHTML += `<option value="${decades[decade]}">${String(decades[decade]) + 's'}</option>`
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
document.getElementById("pick-btn").onclick = function() {chooserFunc(), showBtn()};
function chooserFunc() {
    //Sets users choice of film
    let userFilm = {
        "genre": document.getElementById('genre').value,
        "language": document.getElementById('language').value,
        "runtime": document.getElementById('runtime').value,
        "year": document.getElementById('decade').value
        };
    //Filters films to get list of all to users requirements 
    let validFilms = filmPromise.then((films) => films.filter(function(item) {
        for (var key in userFilm) {
            if (item[key] === undefined)
                return false;
            }
        return (runtimeFilter(item['runtime'], userFilm['runtime']) && genreFilter(item['genre'], userFilm['genre']) && languageFilter(item['language'], userFilm['language']) && decadeFilter(item['year'], userFilm['year']));}))
        .then(films => filmsChosen(films))
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
        filmSearch(films[i], i + 1,films)
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
}

//Output to the correct part of index.html for the title, overview and image
function filmOutput(data, index, film) {
    console.log(data)
    let title = `<h2 class="film-name">${data.title}</h2>`;
    let overview = `<p class="film-overview">${data.overview}</p>`;
    let director = `<h3>Director - ${film.director}</h3>`
    let genre = `<h3>Genres - ${film.genre}</h3>`
    let year = `<h3>Year - ${film.year}</h3>`
    
    let poster = `<img src="${baseImageURL}w500${data.poster_path}" alt="Poster for ${data.title}" class="poster">`;
    console.log(data.release_date.substring(0,4))
    document.getElementById('left-film-' + String(index)).innerHTML = title + overview;
    document.getElementById('right-film-' +String(index)).innerHTML = director + genre + year;
    document.getElementById('filmBtn-' + String(index)).innerHTML = poster;
    document.getElementById('out-' + String(index)).tabIndex = 0
}




/*
Overlay functions
*/

function showBtn() {
    document.getElementById("filmBtn-1").style.display = "inherit"
    document.getElementById("filmBtn-2").style.display = "inherit"
    document.getElementById("filmBtn-3").style.display = "inherit"
    document.getElementById("filmBtn-4").style.display = "inherit"
    document.getElementById("filmBtn-5").style.display = "inherit"
}


let overlay = document.getElementById("overlay");

document.getElementById("filmBtn-1").onclick = function() {overlayFunc(1)};
document.getElementById("filmBtn-2").onclick = function() {overlayFunc(2)};
document.getElementById("filmBtn-3").onclick = function() {overlayFunc(3)};
document.getElementById("filmBtn-4").onclick = function() {overlayFunc(4)};
document.getElementById("filmBtn-5").onclick = function() {overlayFunc(5)};

function overlayFunc(index) {
    overlay.style.display = "block"
    document.getElementById("film-" + String(index)).style.display = "flex"
}


document.getElementById("close-1").onclick = function() {closeFunc(1)};
document.getElementById("close-2").onclick = function() {closeFunc(2)};
document.getElementById("close-3").onclick = function() {closeFunc(3)};
document.getElementById("close-4").onclick = function() {closeFunc(4)};
document.getElementById("close-5").onclick = function() {closeFunc(5)};

// When the user clicks on <span> (x), close the overlay
function closeFunc(index) {
    overlay.style.display = "none";
    document.getElementById("film-" + String(index)).style.display = "none"
  }


// When the user clicks anywhere outside of the overlay, close it
window.onclick = function(event) {
  if (event.target == overlay) {
    
    for(let i = 1; i<=5; i++) {
        document.getElementById("film-" + String(i)).style.display = "none"
    }
    overlay.style.display = "none";
  }
}