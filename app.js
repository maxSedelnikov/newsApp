// Custom Http Module
function customHttp() {
  return {
    get(url, cb) {
      try {
        const xhr = new XMLHttpRequest();
        xhr.open("GET", url);
        xhr.addEventListener("load", () => {
          if (Math.floor(xhr.status / 100) !== 2) {
            cb(`Error. Status code: ${xhr.status}`, xhr);
            return;
          }
          const response = JSON.parse(xhr.responseText);
          cb(null, response);
        });

        xhr.addEventListener("error", () => {
          cb(`Error. Status code: ${xhr.status}`, xhr);
        });

        xhr.send();
      } catch (error) {
        cb(error);
      }
    },
    post(url, body, headers, cb) {
      try {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", url);
        xhr.addEventListener("load", () => {
          if (Math.floor(xhr.status / 100) !== 2) {
            cb(`Error. Status code: ${xhr.status}`, xhr);
            return;
          }
          const response = JSON.parse(xhr.responseText);
          cb(null, response);
        });

        xhr.addEventListener("error", () => {
          cb(`Error. Status code: ${xhr.status}`, xhr);
        });

        if (headers) {
          Object.entries(headers).forEach(([key, value]) => {
            xhr.setRequestHeader(key, value);
          });
        }

        xhr.send(JSON.stringify(body));
      } catch (error) {
        cb(error);
      }
    },
  };
}
// Init http module
const http = customHttp();

const newsService = (function () {
  const apiKey = "9e5c2cd906b14f5aac0ac3bb0fc4d70a";
  const apiUrl = "https://news-api-v2.herokuapp.com";

  return {
    topHeadlines(country = "ua", category = "business", cb) {
      http.get(
        `${apiUrl}/top-headlines?country=${country}&category=${category}&apiKey=${apiKey}`,
        cb
      );
    },
    everything(query, cb) {
      http.get(`${apiUrl}/everything?q=${query}&apiKey=${apiKey}`, cb);
    },
  };
})();

// elements
const newsContainer = document.querySelector(".news-container .row");
const form = document.forms["newsControls"];
const countrySelect = form.elements["country"];
const categorySelect = form.elements["category"];
const searhInput = form.elements["search"];

form.addEventListener("submit", (e) => {
  e.preventDefault();
  loadNews();
});

//  init selects
document.addEventListener("DOMContentLoaded", function () {
  M.AutoInit();
  loadNews();
});

// Load news function
function loadNews() {
  showLoader();

  const country = countrySelect.value;
  const category = categorySelect.value;
  const searchText = searhInput.value;

  if (!searchText) {
    newsService.topHeadlines(country, category, onGetResponse);
  } else {
    newsService.everything(searchText, onGetResponse);
  }
}

// function on get response from server
function onGetResponse(err, res) {
  removePreloader();

  if (err) {
    showAlert(err, "error-msg");
    return;
  }

  if (!res.articles.length) {
    // show empty message
    showEmptySearchCard();
    return;
  }

  res.articles.forEach((articleItem) => {
    if (!articleItem.urlToImage) {
      articleItem.urlToImage = "no-image.jpg";
    }
  });

  renderNews(res.articles);
}

// function render news
function renderNews(news) {
  //const newsContainer = document.querySelector(".news-container .row");
  //if (newsContainer.children.length) clearContainer(newsContainer);
  checkEmptyContainer();
  let fragment = "";

  news.forEach((newsItem) => {
    const element = newsTemplate(newsItem);
    fragment += element;
  });

  newsContainer.insertAdjacentHTML("afterbegin", fragment);
}

function checkEmptyContainer() {
  if (newsContainer.children.length) clearContainer(newsContainer);
}

// function clear container
function clearContainer(container) {
  let child = container.lastElementChild;

  while (child) {
    container.removeChild(child);
    child = container.lastElementChild;
  }
}

// news item template function
function newsTemplate({ urlToImage, title, url, description }) {
  return `
    <div class="col s12">
      <div class="card hoverable">
        <div class="card-image">
          <img src="${urlToImage}">
          <span class="card-title">${title || ""}</span>
        </div>
        <div class="card-content">
          <p>${description || ""}</p>
        </div>
        <div class="card-action">
          <a href="${url}">Read more</a>
        </div>
      </div>
    </div>
  `;
}

// empty response card
function showEmptySearchCard() {
  checkEmptyContainer();

  const fragment = `
  <div class="col s12">
    <div class="card horizontal">
      <div class="card-stacked">
        <div class="card-content">
          <p>No search result</p>
        </div>
      </div>
    </div>
  </div>
  `;

  newsContainer.insertAdjacentHTML("afterbegin", fragment);
}

// alerts
function showAlert(msg, type = "success") {
  M.toast({ html: msg, classes: type });
}

// show prealoader
function showLoader() {
  document.body.insertAdjacentHTML(
    "afterbegin",
    `
    <div class="progress">
      <div class="indeterminate"></div>
    </div>
  `
  );
}

// remove prealoader
function removePreloader() {
  const loader = document.querySelector(".progress");

  if (loader) loader.remove();
}
