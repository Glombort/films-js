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
document.getElementById("pick-btn").onclick = function() {chooserFunc()};
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
        filmSearch(films[i].name, films[i].year, i + 1)
    }
}

//Search for films based on name, year of release to pick the correct
function filmSearch(keyword, year, index) {
    let url = ''.concat(baseURL, 'search/movie?api_key=', APIKEY, '&query=', keyword);
    fetch(url)
    .then(result=>result.json())
    .then((data)=>{
        let i =0
        while (data.results[i].release_date.substring(0,4) != year) {
            i++
        }
        filmOutput(data.results[i], index);        
    })
}

//Output to the correct part of index.html for the title, overview and image
function filmOutput(data, index) {
    let title = `<h2>${data.title}</h2>`;
    let overview = `<p>${data.overview}</p>`;
    console.log(data.release_date.substring(0,4))
    document.getElementById('film-' + String(index)).innerHTML = title + overview;
}