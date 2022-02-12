const results = document.querySelector(".results");
const overlay = document.querySelector(".overlay");

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

//Setting variables for getting items
const request = []
const sessionID = []
const accountID = []
const usersList = []

//Get 3rd party approval through TMDB
const userForm = document.querySelectorAll("form")[0]
userForm.addEventListener("submit", function(event){userAuth(event)})

//Create Session ID
const userSession = document.querySelectorAll("form")[1]
userSession.addEventListener("submit", function(event){generateSession(event)})

//Gets users watchlist
const watchlist = document.querySelectorAll("form")[2]
watchlist.addEventListener("submit", function(event){getWatchlist(event)})

//Gets films from users list1
const submitChoices = document.querySelectorAll("form")[3]
submitChoices.addEventListener("submit", function(event){getFilms(event,usersList)})

//Authenticates the users tmdb account
function userAuth(event) {
    event.preventDefault();
    userForm.classList.toggle("hide")
    userSession.classList.toggle("hide")
    //Get request token and open autehntication window for user
    fetch(`${baseURL}authentication/token/new?api_key=${APIKEY}`)
        .then(response => response.json())
        .then(json => json.request_token)
        .then((json) => {
            request.push(json)
            window.open(`https://www.themoviedb.org/authenticate/${json}`)
        })
}

//Generates a session id
function generateSession(event) {
    event.preventDefault();
    userSession.classList.toggle("hide")
    watchlist.classList.toggle("hide")
    
    const data = {"request_token": request[0]}
    //Creates sesssion id
    fetch(`${baseURL}authentication/session/new?api_key=${APIKEY}`, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(response => {
        return response.session_id})
    .then(response => {
        sessionID.push(response)
        return sessionID
    })

}

//Gets users watchlist
function getWatchlist(event) {
    event.preventDefault();
    watchlist.classList.toggle("hide")
    submitChoices.classList.toggle("hide")

    //Gets a users account id
    fetch(`${baseURL}account?api_key=${APIKEY}&session_id=${sessionID[0]}`)
    .then(response => response.json())
    .then(response => response.id)
    .then(response => {
        accountID.push(response)
        return accountID
    })

    //Gets users created watchlist
    fetch(`${baseURL}account/${accountID[0]}/watchlist/movies?api_key=${APIKEY}&language=en-US&session_id=${sessionID[0]}&sort_by=created_at.asc`)
    .then(response => response.json())
    .then(response => response.results)
    .then(response => {
        selectors(response)
        response.forEach((film) => usersList.push(film))
        return usersList
    })
}

/*
Functions for options in dropdown menus
*/
        
//Directing to each individual option selector
function selectors(filmList) {
    let genreIds = []
    let languageIsos = []
    let decades = []
    filmList.forEach(element => {
        genreOptions(element['genre_ids'], genreIds);    
        languageOptions(element.original_language, languageIsos)
        let year = element.release_date.substring(0,4)
        decadeOptions(year, decades)
    });
    //Gets names from the ids and isos in the apis output
    const genreNames = genreIdToName(genreIds)
    const languageNames = langIsoToName(languageIsos)
    //Adding available genres to html
    const genreDropdown = document.querySelector("#genre")
    genreNames.then(response => response.sort())
    .then(response => {
        for (let genre in response) {
            const option = document.createElement("option")
            option.value = response[genre][1]
            option.textContent = response[genre][0]
            genreDropdown.append(option)
        }
   })
    //Adding available languages to html
    const langDropdown = document.querySelector("#language");
    languageNames.then(response => response.sort())
    .then(response => {
        for (let language in response) {
            const option = document.createElement("option")
            option.value = response[language][1]
            option.textContent = response[language][0]
            langDropdown.append(option)
        }
    })
    
    //Adding available decades to html
    const decadeDropdown = document.querySelector("#decade")
    for (let decade in decades) {
        const option = document.createElement("option")
        option.value = decades[decade]
        option.textContent = String(decades[decade]) + 's'
        decadeDropdown.append(option)
    }
}


//Genre Functions
function genreOptions(filmGenre, available) {
    filmGenre.forEach((genre) => {
        if (!available.includes(genre)) {
            available.push(genre)
        }
    })
    return available
}

//Genre id to genre name object
const genreObj = fetch(`${baseURL}genre/movie/list?api_key=${APIKEY}&language=en-US`)
    .then(response => response.json())
    .then(response => response['genres'])
    .then(response => {
        const genreObj = {}
        response.forEach((e) => {
            genreObj[e['id']] = e['name'] 
        })
        return genreObj
    });
//Turns genre ids from watchlist to [genre_name, genre_id] for name and value of genre dropdown element 
function genreIdToName(ids) {
    const genreNames = []
    return genreObj.then(response => {
        ids.forEach((id) => {
            genreNames.push([response[id],id])
        })
        return genreNames
    })
}

//Language Functions
function languageOptions(filmLanguage, available) {
    if (!available.includes(filmLanguage)) {
        available.push(filmLanguage)
    }
    return available.sort()
}

//Creating the langugage id to english name object
const languageObj = fetch(`${baseURL}configuration/languages?api_key=${APIKEY}`)
    .then(response => response.json())
    .then(response => {
        const languageObj = {}
        response.forEach((e) => {
            languageObj[e['iso_639_1']] = e['english_name'] 
        })
        return languageObj
    });

//Turns language isos from watchlist to [language_name, language_iso] for name and value of language dropdown element
function langIsoToName(isos) {
    const languageNames = []
    return languageObj.then(response => {
        isos.forEach((iso) => {
            languageNames.push([response[iso],iso])
        })
        return languageNames
    })
}

//Decade Functions
function decadeOptions(filmYear, available) {
    let decade = Math.floor(filmYear/10) * 10;
    if (!available.includes(decade)) {
        available.push(decade)
    }
    return available.sort()
}


/*
Get valid films based on user requirements re initialising the output area for the new films
*/
function getFilms(event, films) {
    event.preventDefault();

    //Reset output areas
    results.innerHTML=""
    overlay.innerHTML=""
    
    //Sets users choice of film
    const formData = new FormData(submitChoices);
    const userFilm = Object.fromEntries(formData)
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
        const validGenre = genreFilter(item.genre_ids, userFilm.genre_ids)
        const validLang = languageFilter(item.original_language, userFilm['original_language'])
        const validYear = decadeFilter(item.release_date, userFilm['release_date'])
        return (validGenre && validLang && validYear);});
    //Go to output functions
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
    return filmGenre.includes(parseInt(userGenre));
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
    filmYear = filmYear.substring(0,4);
    let decadeFilm = Math.floor(filmYear / 10) * 10;
    return decadeFilm === parseInt(userDecade);
}

/*
Output Area
*/

//Output to the correct part of index.html for the title, overview and image
function filmOutput(films) {
    //Takes available films, shuffles and picks first 5
    films = films.sort(() => Math.random() - 0.5)
    //Pick 5 films
    for(let i=0; i<=4; i++) {
        //Initialise film being added
        let film = films[i]

        //Create div for posterimage to be added to
        const posterBox = document.createElement("article")
        posterBox.className="poster-box"
        //Add the film poster to image tag
        const poster = document.createElement("img")
        poster.src = baseImageURL + "w500" + film.poster_path
        poster.alt = "Poster for " + film.title
        poster.className = "poster";
        //Append the image to the div made for the poster
        posterBox.append(poster);
        posterBox.tabIndex = 0
        //Append to the rest of the posters on the page
        results.append(posterBox)

        //Setup overlay
        const filmOverlay = document.createElement("div");
        filmOverlay.classList.add("film-overlay", "center", "width-lg");
        //Add the x to close the overlay
        const span = document.createElement("span");
        span.className = "close"
        span.innerHTML = `&times;`
        //Add the box for left side of the overlay
        const leftFilm  = document.createElement("section")
        leftFilm.className = "left-film"
        //Add the box for the right side of the overlay
        const rightFilm = document.createElement("section")
        rightFilm.className = "left-film"
        //Add the title of the film to the left overlay
        const heading = document.createElement("h2");
        heading.textContent = film.title;
        heading.className = "film-name"
        //Add the overview of the film to the left overlay
        const overview = document.createElement("p")
        overview.textContent = film.overview
        overview.className = "film-overview"
/*
To be added again to right side when found out how to add fetch these from tmdb again
*/
        // const director = document.createElement("h3")
        // director.textContent = film.director
        
        // const genre = document.createElement("h3")
        // genre.textContent = film.genre

        // const year = document.createElement("h3")
        // year.textContent = film.year
        
        //Appending the items to the left and right side of the overlay
        leftFilm.append(heading,overview);
        //rightFilm.append(director, genre, year);
        //Appending to the div for the specific overlay
        filmOverlay.append(span, leftFilm, rightFilm);
        //Appending to the div for all overlays
        overlay.append(filmOverlay);
    }

    /*
        Overlay functions
    */
    //Getting the divs of the posters and overlays to make interactive
    const posterBox = document.querySelectorAll('.poster-box')
    const filmOverlay = document.querySelectorAll('.film-overlay')
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
}