const filmPromise = fetch("./js/films_list.json")
.then(response => {
   return response.json();
})

document.getElementById("pick-btn").onclick = function() {chooserFunc()};
function chooserFunc() {
    let userRuntime = document.getElementById('runtime').value;
    let userGenre = document.getElementById('genre').value;
    let userLanguage = document.getElementById('language').value;
    let userDecade = document.getElementById('decade').value;
    var userFilm = {
        "genre": userGenre,
        "language": userLanguage,
        "runtime": userRuntime,
        "year": userDecade
        };
    let validFilms = filmPromise.then((films) => films.filter(function(item) {
        for (var key in userFilm) {
            if (item[key] === undefined)
                return false;
            }
        return runtimeFilter(item['runtime'], userFilm['runtime']) &&
        runtimeFilter(item['genre'], userFilm['genre']) &&
        runtimeFilter(item['language'], userFilm['language']) &&
        runtimeFilter(item['year'], userFilm['year']);
    })).then(films => {document.getElementById('title-1').innerHTML = films[0].name})
    
}


function runtimeFilter(filmRun, userRun) {
    return filmRun <= (userRun + 10);
}

function genreFilter(filmGen, userGen) {
    return filmGen.includes(userGen);
}

function languageFilter(filmLang, userLang) {
    return filmLang === userLang;
}

function decadeFilter(filmDec, userDec) {
    let decade = Math.floor(filmDec.year/10) * 10;
    return decade === userDec;
}