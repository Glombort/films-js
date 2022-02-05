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
        .then(films => (document.getElementById('title-1').innerHTML=films[0].name))
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