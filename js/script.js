const filmPromise = fetch("./js/films_list.json")
.then(response => {
   return response.json();
})

document.getElementById("pick-btn").onclick = function() {chooserFunc()};
function chooserFunc() {
    //Sets users choice of film
    var userFilm = {
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
function decadeFilter(filmDecade, userDecade) {
    if (userDecade === 'any-decade') {
        return true
    }
    let decade = Math.floor(filmDecade/10) * 10;
    return decade === parseInt(userDecade);
}