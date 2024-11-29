const API_KEY = 'api_key=a306f6ab5d09bef9530951ee7289f8be';
const BASE_URL = 'https://api.themoviedb.org/3';
const MOVIE_API_URL = BASE_URL + '/discover/movie?sort_by=popularity.desc&' + API_KEY;
const TV_API_URL = BASE_URL + '/discover/tv?sort_by=popularity.desc&' + API_KEY;
const MOVIE_GENRE_URL = BASE_URL + '/discover/movie?' + API_KEY + '&with_genres=';
const TV_GENRE_URL = BASE_URL + '/discover/tv?' + API_KEY + '&with_genres=';
const IMG_URL = 'https://image.tmdb.org/t/p/w500';
const searchMovieURL = BASE_URL + '/search/movie?' + API_KEY;
const searchTVURL = BASE_URL + '/search/tv?' + API_KEY;
const BOLLYWOOD_MOVIE_API_URL = BASE_URL + '/discover/movie?with_original_language=hi&sort_by=popularity.desc&' + API_KEY;
const BOLLYWOOD_TV_API_URL = BASE_URL + '/discover/tv?with_original_language=hi&sort_by=popularity.desc&' + API_KEY;
const BOLLYWOOD_MOVIE_GENRE_URL = BASE_URL + '/discover/movie?' + API_KEY + '&with_original_language=hi&with_genres=';
const BOLLYWOOD_TV_GENRE_URL = BASE_URL + '/discover/tv?' + API_KEY + '&with_original_language=hi&with_genres=';
const GENRE_API_URL_MOVIE = BASE_URL + '/genre/movie/list?' + API_KEY;
const GENRE_API_URL_TV = BASE_URL + '/genre/tv/list?' + API_KEY;

document.addEventListener('DOMContentLoaded', () => {
    const searchForm = document.getElementById('form');
    const searchInput = document.getElementById('search');
    const checkbox = document.getElementById('check');
    const main = document.getElementById('main');
    const loadingIcon = document.getElementById('loading');
    const paginationContainer = document.getElementById('pagination');
    const movieButton = document.getElementById('movie-button');
    const tvButton = document.getElementById('tv-button');
    const bollywoodMovieButton = document.getElementById('bollywood-movie-button');
    const bollywoodTVButton = document.getElementById('bollywood-tv-button');
    const logo = document.querySelector('.logo a');
    const homeButton = document.querySelector('nav ul li a.active');

    let currentPage = parseInt(sessionStorage.getItem('currentPage')) || 1;
    let currentQuery = sessionStorage.getItem('currentQuery') || '';
    let currentSearchType = sessionStorage.getItem('currentSearchType') || 'movie';
    let currentGenreId = sessionStorage.getItem('currentGenreId') || null;
    let currentGenreType = sessionStorage.getItem('currentGenreType') || null;

    fetchGenres(GENRE_API_URL_MOVIE, 'movie');
    fetchGenres(GENRE_API_URL_TV, 'tv');
    fetchGenres(GENRE_API_URL_MOVIE, 'bollywood-movie');
    fetchGenres(GENRE_API_URL_TV, 'bollywood-tv');

    function fetchGenres(url, type) {
        fetch(url)
            .then(response => response.json())
            .then(data => {
                const genreContainer = document.querySelector(`.dropdown-content[data-type="${type}"]`);
                data.genres.forEach(genre => {
                    const genreElement = document.createElement('a');
                    genreElement.href = '#';
                    genreElement.textContent = genre.name;
                    genreElement.setAttribute('data-genre', genre.id);
                    genreElement.addEventListener('click', (e) => {
                        e.preventDefault();
                        currentPage = 1;
                        switch(type) {
                            case 'movie':
                                currentSearchType = 'movie';
                                currentGenreType = 'movie';
                                getMoviesByGenre(genre.id);
                                break;
                            case 'tv':
                                currentSearchType = 'tv';
                                currentGenreType = 'tv';
                                getTVByGenre(genre.id);
                                break;
                            case 'bollywood-movie':
                                currentSearchType = 'bollywood-movie';
                                currentGenreType = 'bollywood-movie';
                                getBollywoodMoviesByGenre(genre.id);
                                break;
                            case 'bollywood-tv':
                                currentSearchType = 'bollywood-tv';
                                currentGenreType = 'bollywood-tv';
                                getBollywoodTVByGenre(genre.id);
                                break;
                        }
                        updateSessionStorage();
                    });
                    genreContainer.appendChild(genreElement);
                });
            })
            .catch(error => console.error('Error fetching genres:', error));
    }

    function getMoviesByGenre(genreId) {
        currentGenreId = genreId;
        currentGenreType = 'movie';
        const url = MOVIE_GENRE_URL + genreId + '&page=' + currentPage;
        fetchAndShowResults(url);
    }

    function getTVByGenre(genreId) {
        currentGenreId = genreId;
        currentGenreType = 'tv';
        const url = TV_GENRE_URL + genreId + '&page=' + currentPage;
        fetchAndShowResults(url);
    }

    function getBollywoodMoviesByGenre(genreId) {
        currentGenreId = genreId;
        currentGenreType = 'bollywood-movie';
        const url = BOLLYWOOD_MOVIE_GENRE_URL + genreId + '&page=' + currentPage;
        fetchAndShowResults(url);
    }

    function getBollywoodTVByGenre(genreId) {
        currentGenreId = genreId;
        currentGenreType = 'bollywood-tv';
        const url = BOLLYWOOD_TV_GENRE_URL + genreId + '&page=' + currentPage;
        fetchAndShowResults(url);
    }

    function fetchAndShowResults(url) {
        showLoadingIcon();
        fetch(url)
            .then(res => res.json())
            .then(data => {
                hideLoadingIcon();
                showResults(data.results);
                createPagination(data.total_pages, data.page);
            })
            .catch(error => {
                hideLoadingIcon();
                console.error('Error fetching results:', error);
            });
    }

    // Initial load based on stored values
    if (currentQuery) {
        performSearch(currentQuery, currentPage);
    } else if (currentGenreId && currentGenreType) {
        switch(currentGenreType) {
            case 'movie':
                getMoviesByGenre(currentGenreId);
                break;
            case 'tv':
                getTVByGenre(currentGenreId);
                break;
            case 'bollywood-movie':
                getBollywoodMoviesByGenre(currentGenreId);
                break;
            case 'bollywood-tv':
                getBollywoodTVByGenre(currentGenreId);
                break;
        }
    } else {
        getMovies(MOVIE_API_URL + '&page=' + currentPage);
    }

    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const query = searchInput.value.trim();
        if (query) {
            currentPage = 1;
            currentQuery = query;
            performSearch(query, currentPage);
            checkbox.checked = false;
        }
    });

    document.getElementById('cricketLive').addEventListener('click', function(event) {
        event.preventDefault();
        window.location.href = "LiveTv.html";
        sessionStorage.setItem('streamingUrl', 'https://rips.in/player.php?ch=4');
        sessionStorage.setItem('streamingUrl1', 'https://rips.in/player.php?ch=3');
        sessionStorage.setItem('streamingUrl2', 'https://rips.in/player.php?ch=6');
    });

    function performSearch(query, page) {
        showLoadingIcon();
        let url;
        switch(currentSearchType) {
            case 'movie':
                url = `${searchMovieURL}&query=${query}&page=${page}`;
                break;
            case 'tv':
                url = `${searchTVURL}&query=${query}&page=${page}`;
                break;
            case 'bollywood-movie':
                url = `${searchMovieURL}&with_original_language=hi&query=${query}&page=${page}`;
                break;
            case 'bollywood-tv':
                url = `${searchTVURL}&with_original_language=hi&query=${query}&page=${page}`;
                break;
        }

        fetch(url)
            .then(response => response.json())
            .then(data => {
                hideLoadingIcon();
                if (data.results.length > 0) {
                    showResults(data.results);
                    createPagination(data.total_pages, data.page, query);
                } else {
                    main.innerHTML = '<p>No results found</p>';
                    paginationContainer.innerHTML = '';
                }
            })
            .catch(error => {
                hideLoadingIcon();
                console.error('Error:', error);
            });
    }

    function goToHomePage(e) {
        e.preventDefault();
        currentPage = 1;
        currentQuery = '';
        currentSearchType = 'movie';
        currentGenreId = null;
        currentGenreType = null;
        updateSessionStorage();
        getMovies(MOVIE_API_URL + '&page=1');
    }

    logo.addEventListener('click', goToHomePage);
    homeButton.addEventListener('click', goToHomePage);

    function showResults(results) {
        main.innerHTML = '';
        results.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.classList.add('movie');
            itemElement.innerHTML = `
                <img src="${IMG_URL + item.poster_path}" alt="${item.title || item.name}" data-id="${item.id}">
                <div class="movie-info">
                    <h3>${item.title || item.name}</h3>
                    <span class="${getColor(item.vote_average)}">${item.vote_average.toFixed(1)}</span>
                </div>
                <div class="overview">
                    <h3>Overview</h3>
                    ${item.overview}
                </div>
            `;
            main.appendChild(itemElement);
    
            const poster = itemElement.querySelector('img');
            poster.addEventListener('click', () => {
                redirectToDetailsPage(item.id, currentSearchType);
            });
        });
    }

    function createPagination(totalPages, currentPageNumber, query = '') {
        paginationContainer.innerHTML = '';
        
        const previousButton = document.createElement('button');
        previousButton.textContent = 'Previous';
        previousButton.disabled = currentPageNumber === 1;
        previousButton.addEventListener('click', () => {
            if (currentPageNumber > 1) {
                currentPage--;
                updateSessionStorage();
                location.reload();
            }
        });

        const nextButton = document.createElement('button');
        nextButton.textContent = 'Next';
        nextButton.disabled = currentPageNumber === totalPages;
        nextButton.addEventListener('click', () => {
            if (currentPageNumber < totalPages) {
                currentPage++;
                updateSessionStorage();
                location.reload();
            }
        });

        paginationContainer.appendChild(previousButton);
        paginationContainer.appendChild(document.createTextNode(`Page ${currentPageNumber} of ${totalPages}`));
        paginationContainer.appendChild(nextButton);
    }

    function updateSessionStorage() {
        sessionStorage.setItem('currentPage', currentPage);
        sessionStorage.setItem('currentQuery', currentQuery);
        sessionStorage.setItem('currentSearchType', currentSearchType);
        if (currentGenreId) sessionStorage.setItem('currentGenreId', currentGenreId);
        if (currentGenreType) sessionStorage.setItem('currentGenreType', currentGenreType);
    }

    function getMovies(url) {
        fetchAndShowResults(url);
    }

    function showLoadingIcon() {
        loadingIcon.style.display = 'block';
    }

    function hideLoadingIcon() {
        loadingIcon.style.display = 'none';
    }

    function getColor(vote) {
        if (vote >= 8) return 'green';
        else if (vote >= 5) return 'orange';
        else return 'red';
    }

    function redirectToDetailsPage(id, type) {
        window.location.href = `details.html?id=${id}&type=${type}`;
    }

    movieButton.addEventListener('click', () => {
        currentSearchType = 'movie';
        currentPage = 1;
        currentQuery = '';
        currentGenreId = null;
        currentGenreType = null;
        updateSessionStorage();
        getMovies(MOVIE_API_URL + '&page=1');
    });

    tvButton.addEventListener('click', () => {
        currentSearchType = 'tv';
        currentPage = 1;
        currentQuery = '';
        currentGenreId = null;
        currentGenreType = null;
        updateSessionStorage();
        getMovies(TV_API_URL + '&page=1');
    });

    bollywoodMovieButton.addEventListener('click', () => {
        currentSearchType = 'bollywood-movie';
        currentPage = 1;
        currentQuery = '';
        currentGenreId = null;
        currentGenreType = null;
        updateSessionStorage();
        getMovies(BOLLYWOOD_MOVIE_API_URL + '&page=1');
    });

    bollywoodTVButton.addEventListener('click', () => {
        currentSearchType = 'bollywood-tv';
        currentPage = 1;
        currentQuery = '';
        currentGenreId = null;
        currentGenreType = null;
        updateSessionStorage();
        getMovies(BOLLYWOOD_TV_API_URL + '&page=1');
    });
});