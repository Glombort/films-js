const posterBox = document.querySelectorAll(".poster-box")
const filmOverlay = document.querySelectorAll('.film-overlay')

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

//Get Request A Token
function getRequest() {
    return fetch(`${baseURL}authentication/token/new?api_key=${APIKEY}`)
.then(response => response.json())
.then(json => json.request_token)
}


//Get 3rd party approval through TMDB
const userForm = document.querySelectorAll("form")[0]
userForm.addEventListener("submit", function(event){userList(event)})

//Create Session ID
const userSession = document.querySelectorAll("form")[1]
userSession.addEventListener("submit", function(event){generateSession(event)})
const sessionID = ["6fdbf6fd5fa3ac27c21b0861ab8ef354ed60328e"]
const accountID = []

//Gets users watchlist
const usersList = []
const watchlist = document.querySelectorAll("form")[2]
watchlist.addEventListener("submit", function(event){getWatchlist(event)})



//Gets users watchlist
const getfilms = document.querySelectorAll("form")[3]
getfilms.addEventListener("submit", function(event){getFilms(event,usersList)})


let request = ""
function userList(event) {
    event.preventDefault();
    userForm.classList.toggle("hide")
    userSession.classList.toggle("hide")
    const requestPromise = getRequest().then((json) => {
        request=json
        window.open(`https://www.themoviedb.org/authenticate/${json}`)
    })
}



function generateSession(event) {
    event.preventDefault();
    userSession.classList.toggle("hide")
    watchlist.classList.toggle("hide")
    const data = {"request_token": request}
    const id = fetch(`${baseURL}authentication/session/new?api_key=${APIKEY}`, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(response => {
        console.log(response)
        return response.session_id})
    .then(response => {
        sessionID.push(response)
        return sessionID
    })

}

function getWatchlist(event) {
    event.preventDefault();
    watchlist.classList.toggle("hide")
    getfilms.classList.toggle("hide")
    const account = fetch(`${baseURL}account?api_key=${APIKEY}&session_id=${sessionID[0]}`)
    .then(response => response.json())
    .then(response => response.id)
    .then(response => {
        accountID.push(response)
        return accountID
    })

    const watchList = fetch(`${baseURL}account/${accountID[0]}/watchlist/movies?api_key=${APIKEY}&language=en-US&session_id=${sessionID[0]}&sort_by=created_at.asc`)
    .then(response => response.json())
    .then(response => response.results)
    .then(response => {
        selectors(response)
        response.forEach((film) => usersList.push(film))
        return usersList
    })
    
    // .then(response => filmOutput(response))
}

/*
Functions for options in dropdown menus
*/
const genreObj = fetch(`${baseURL}genre/movie/list?api_key=${APIKEY}&language=en-US`)
        .then(response => response.json())
        .then(response => response['genres'])
        .then(response => {
            const genreObj = {}
            response.forEach((e) => {
                genreObj[e['id']] = e['name'] 
            })
            return genreObj
        })
        
//Directing to each individual option selector
function selectors(filmList) {
    let genreIds = []
    let languages = []
    let decades = []
    filmList.forEach(element => {
        genreOptions(element['genre_ids'], genreIds);    
        languageOptions(element.original_language, languages)
        let year = element.release_date.substring(0,4)
        decadeOptions(year, decades)
    });
    const genreNames = genreIdToName(genreIds)
    
    //Adding available genres to html
    const genreDropdown = document.querySelector("#genre")
    genreNames.then(response => response.sort())
    .then(response => {
        for (let genre in response) {
            const option = document.createElement("option")
            option.value = response[genre][1]
            console.log(response[genre])
            option.textContent = response[genre][0]
            genreDropdown.append(option)
        }
   })
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
    return available
}


function genreIdToName(ids) {
    const genreNames = []
    return genreObj.then(response => {
        ids.forEach((id) => {
            genreNames.push([response[id],id])
        })
        return genreNames
    })
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



function getFilms(event, films) {
    event.preventDefault();

    //Reset output areas
    posterBox.forEach((poster) => poster.innerHTML="")
    filmOverlay.forEach((inner) => inner.innerHTML="")
    //console.log(films)
    
    //Sets users choice of film
    const formData = new FormData(getfilms);
    const userFilm = Object.fromEntries(formData)
    console.log(userFilm)
    console.log(films)
    //Filters films to get list of all to users requirements 
    const validFilms = films.filter((item) => {
        // for (let key in userFilm) {
        //     // if (item[key] === undefined) {
        //     //     console.log(userFilm['original_language'])
        //     //     return false;
        //     // }
            
        // }
        // console.log(userFilm.original_language)
        //const validRun = runtimeFilter(item.runtime, userFilm.runtime)
        //const validGenre = genreFilter(item.genre, userFilm.genre)
        const validLang = languageFilter(item.original_language, userFilm['original_language'])
        const validYear = decadeFilter(item.release_date, userFilm['release_date'])
        return ( validLang);})

    filmOutput(validFilms)
        
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
    if (userLanguage == 'any-lang') {
        return true
    }
    return filmLanguage === userLanguage;
}
//Selects decade
function decadeFilter(filmYear, userDecade) {
    if (userDecade === 'any-decade') {
        return true
    }
    let decadeFilm = Math.floor(filmYear / 10) * 10;
    let decadeUser = Math.floor(filmYear / 10) * 10;
    return decadeFilm === parseInt(decadeUser);
}

/*
Output Area
*/



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

//Output to the correct part of index.html for the title, overview and image
function filmOutput(data) {
    console.log(data)
    for(let i=0; i<=4; i++) {
        let film = data[i]
        const leftFilm = document.createElement("section")
        leftFilm.className = "left-film"
        
        const rightFilm = document.createElement("section")
        rightFilm.className = "left-film"

        const heading = document.createElement("h2");
        heading.textContent = film.title;
        heading.className = "film-name"

        const overview = document.createElement("p")
        overview.textContent = film.overview
        overview.className = "film-overview"

        // const director = document.createElement("h3")
        // director.textContent = film.director
        
        // const genre = document.createElement("h3")
        // genre.textContent = film.genre

        // const year = document.createElement("h3")
        // year.textContent = film.year
        
        const poster = document.createElement("img")
        poster.src = baseImageURL + "w500" + film.poster_path
        poster.alt = "Poster for " + film.title
        poster.className = "poster";
        
        leftFilm.append(heading,overview);
        //rightFilm.append(director, genre, year);
        filmOverlay[i].append(leftFilm, rightFilm)
        posterBox[i].append(poster);
        posterBox[i].tabIndex = 0
    }
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