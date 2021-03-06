const APIKEY = "87337df5190b4447f246a4872658a898";
let baseURL = 'https://api.themoviedb.org/3/';

let configData = null;
let baseImageURL = null;

//Configure the api and the urls for later use
function configTMDB() {
    fetchFunc(`${baseURL}configuration?api_key=${APIKEY}`)
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
let request;
let sessionID = localStorage.getItem('sessionID')
let accountID;
let usersList;


const poster = document.querySelector(".results");
const overlay = document.querySelector("overlay");
const formSections = document.querySelectorAll(".intro")
const forms = document.querySelectorAll("form")
const userForm = forms[0]
const uploadList =forms[1]
const submitChoices = forms[2]

if (sessionID !== null) {
    sessionID = localStorage.getItem("sessionID");
    formSections[0].classList.add("hide");
    formSections[1].classList.remove("hide")
}
//Get 3rd party approval through TMDB
userForm.addEventListener("submit", function(event){userAuth(event)})
//Create Session ID then gets users watchlist
uploadList.addEventListener("submit", function(event){upload(event)})
//Gets films from users list1
submitChoices.addEventListener("submit", function(event){getFilms(event)})

//Authenticates the users tmdb account
function userAuth(event) {
    event.preventDefault();
    formSections[0].classList.add("hide")
    
    //Get request token and open autehntication window for user
    fetchFunc(`${baseURL}authentication/token/new?api_key=${APIKEY}`)
        .then(json => json.request_token)
        .then((json) => {
            request = json
            window.open(`https://www.themoviedb.org/authenticate/${json}`) 
        })
        .then(formSections[1].classList.remove("hide"))
}

// Upload from users info
function upload(event) {
    event.preventDefault();

    formSections[1].classList.add("hide")
    if (sessionID === null) {
        generateSession()
        .then(response => getWatchlist(response))
        .then(formSections[2].classList.remove("hide"))
    } else {
        getWatchlist(sessionID)
        .then(formSections[2].classList.remove("hide"))
    }
}

//Generates a session id
async function generateSession() {    
    
    const data = {"request_token": request}
    //Creates sesssion id
    const sessionPromise = await fetch(`${baseURL}authentication/session/new?api_key=${APIKEY}`, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
    const sessionJSON = await sessionPromise.json();
    sessionID = sessionJSON.session_id;
    localStorage.setItem("sessionID", sessionID);
    return sessionID;

}
//Gets users watchlist
async function getWatchlist(session) {
    //Gets a users account id
    const response = await fetchFunc(`${baseURL}account?api_key=${APIKEY}&session_id=${session}`);
    accountID = response.id;
    let usersListPromise = await fetchFunc(`${baseURL}account/${accountID}/watchlist/movies?api_key=${APIKEY}&language=en-US&session_id=${session}&sort_by=created_at.asc`);
    usersList = usersListPromise.results;
    selectors(usersList);
    //Setting max number of films to be selected
    submitChoices.number_returned.max = usersList.length;
    return usersList;
}

//Generic fetch to json
async function fetchFunc(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(response.status);
        return response.json();
    } catch (error) {
        console.log(error);
        poster.innerHTML = `Oops having trouble here ${error}`
    }
}

/*
Functions for options in dropdown menus
*/
        
//Directing to each individual option selector
function selectors(filmList) {
    let genreIds = [];
    let languageIsos = [];
    let decades = [];
    filmList.forEach(element => {
        options(element['genre_ids'], genreIds);    
        options([element.original_language], languageIsos);
        let year = element.release_date.substring(0,4);
        decadeOptions(year, decades);
    });
    //Gets names from the ids and isos in the apis output
    const genreNames = idToName(genreObj, genreIds);
    const languageNames = idToName(languageObj, languageIsos);

    //Adding available genres to html
    const genreDropdown = document.querySelector("#genre");
    const langDropdown = document.querySelector("#language");
    const decadeDropdown = document.querySelector("#decade");
    
    //Adding availables to dropdowns
    addDropdown(genreNames, genreDropdown)
    addDropdown(languageNames, langDropdown)
    //Decade Dropdown
    for (let decade in decades) {
        const option = document.createElement("option")
        option.value = decades[decade]
        option.textContent = String(decades[decade]) + 's'
        decadeDropdown.append(option)
    }
}

//Decade Functions
function decadeOptions(filmYear, available) {
    let decade = Math.floor(filmYear/10) * 10;
    if (!available.includes(decade)) {
        available.push(decade)
    }
    return available.sort()
}


function objectCodes(codes, key, value) {
    const codeObj = {}
    codes.forEach((e) => {
        codeObj[e[key]] = e[value] 
    })
    return codeObj
}

function options(current, available) {
    current.forEach(element => {
        if (!available.includes(element)) {
            available.push(element)
        }
    })
    return available
}

function idToName(obj, ids) {
    const names = [];
    console.log(obj)
    ids.forEach((id) => {
        names.push([obj[id],id])
    });
    return names.sort()
}

function nameToId(names) {
    names.forEach((name, index) => {
        names[index] = Object.keys(genreObj).find(key => genreObj[key] === name)
    })
}

function addDropdown(idNames, dropdown) {
    for (let element in idNames) {
        const option = document.createElement("option");
        option.value = idNames[element][1];
        option.textContent = idNames[element][0];
        dropdown.append(option)
    }
}
/*
Get valid films based on user requirements re initialising the output area for the new films
*/
function getFilms(event) {
    event.preventDefault();
    const films = usersList
    //Reset output areas
    poster.innerHTML=""
    overlay.innerHTML=""
    
    //Sets users choice of film
    const formData = new FormData(submitChoices);
    const userFilm = Object.fromEntries(formData)
    //Filters films to get list of all to users requirements 
    const validFilms = films.filter((item) => {

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
async function filmOutput(films) {
    //Takes available films, shuffles and picks first 5
    films = films.sort(() => Math.random() - 0.5)
    let numberToReturn = parseInt(submitChoices.number_returned.value) - 1
    if (films.length -1 <= numberToReturn) {
        numberToReturn = films.length -1
    }
    //Pick films
    for(let i=0; i<=numberToReturn; i++) {
        let film = films[i]
        const details = await filmOverlay(film)
        poster.append(pickPoster(film))
        overlay.append(details)
    }
    overlayEvents() 
}

// Poster image
function pickPoster(film) {
    //Create div for posterimage to be added to
    const posterBox = document.createElement("article")
    posterBox.classList.add("poster-box", "grid", "center")
    //Add the film poster to image tag
    const poster = document.createElement("img")
    poster.src = baseImageURL + "w500" + film.poster_path
    poster.alt = "Poster for " + film.title
    poster.className = "poster";
    //Append the image to the div made for the poster
    posterBox.append(poster);
    posterBox.tabIndex = 0
    //Append to the rest of the posters on the page
    return posterBox
}

//Overlay for films
async function filmOverlay(film) {
    //Setup overlay
    const filmOverlay = document.createElement("div");
    filmOverlay.classList.add("film-overlay", "center", "width-lg", "grid");

    const leftFilm = leftContent(film)
    const rightFilm = await rightContent(film)
    //Add the x to close the overlay
    const span = document.createElement("span");
    span.className = "close"
    span.innerHTML = `&times;`
    
    //Appending to the div for the specific overlay
    filmOverlay.append(span, leftFilm, rightFilm);
    return filmOverlay
}

//Title and synopsis
function leftContent(film) {
    const leftFilm  = document.createElement("section")
    leftFilm.className = "left-film"

    //Film Title
    const heading = document.createElement("h2");
    heading.textContent = film.title;
    heading.className = "film-name"

    //Film Overview
    const overview = document.createElement("p")
    overview.textContent = film.overview
    overview.className = "film-overview"

    leftFilm.append(heading,overview);
    return leftFilm
}

//Details
async function rightContent(film) {


    const rightFilm = document.createElement("section");
    rightFilm.className = "right-film";
    
    const director = document.createElement("h3")
    const directedBy = await pickedDirector(film)
    director.textContent = `Directed By - ${directedBy}`

    const genre = document.createElement("h3");
    const genres = pickedGenre(film.genre_ids);
    genre.textContent = `Genre - ${genres.join(", ")}`
    nameToId(film.genre_ids)

    const year = document.createElement("h3");
    year.textContent = `Released - ${pickedYear(film.release_date)}`;

    const streaming = document.createElement("a");
    const streamingURL = await services(film);
    streaming.textContent = `Where it's streaming`;
    streaming.href = streamingURL
    streaming.target = "_blank"
    streaming.rel = "noopener noreferrer"

    
    rightFilm.append(director, genre, year, streaming);
    return rightFilm
    //})
}

async function pickedDirector(film) {
    const credits = await fetchFunc(`${baseURL}movie/${film.id}/credits?api_key=${APIKEY}&language=en-us`)
    
    const directors = credits["crew"].filter((member) => {
        if (member["job"] === "Director") {
            return true
        }
        return false
    })
    return directors[0]["name"]
    
}

function pickedGenre(genres) {
    const names = genres
    genres.forEach((e,index) => {
        names[index] = genreObj[e]
    })
    return names
}

function pickedYear(date) {
    return date.substring(0,4)
}

async function services(film) {
    
    try {
        const providers = await fetchFunc(`${baseURL}movie/${film.id}/watch/providers?api_key=${APIKEY}`);
        const ukProvider = providers["results"]["GB"]["link"]
        return ukProvider
    } catch (error) {
        console.log(error);
        return "" //Change to something different?
    }
}

function overlayEvents() {

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