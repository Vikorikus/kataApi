const searchInput = document.getElementById("search");
const direktoriesList = document.getElementById("suggestions"); // подсказки ваиранты
const repoList = document.getElementById("repos");
let selectedRepos = []; // куда сохранять результаты

// задержка поиска
function debounce(func, wait) {
  let timeout; // таймер
  return function (...args) {
    clearTimeout(timeout);

    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

// берём данные с гитхаба
async function fetchRepos(query) {
  if (!query) {
    direktoriesList.style.display = "none";
    return;
  }
  try {
    // сам запрос через фетч
    const response = await fetch(
      `https://api.github.com/search/repositories?q=${encodeURIComponent(
        query
      )}&per_page=5`
    );

    const data = await response.json();
    displayAutocomplete(data.items);
  } catch (error) {
    console.error("Ошибка:", error);
  }
}

function displayAutocomplete(repos) {
  direktoriesList.innerHTML = "";
  if (repos.length === 0) {
    direktoriesList.style.display = "none";
    return;
  }
  repos.forEach((repo) => {
    const li = document.createElement("li");
    li.className = "item"; // ______________________не потерять класс стиля________________
    li.textContent = repo.full_name;
    // при нажатии добавить в список и очистить поле ввода
    li.addEventListener("click", () => {
      addRepo(repo);
      searchInput.value = "";
      direktoriesList.style.display = "none";
    });
    direktoriesList.appendChild(li);
  });
  // вновь показать подсказки
  direktoriesList.style.display = "block";
}

function addRepo(repo) {
  selectedRepos.push(repo);
  renderRepoList();
}

// для удаления репозиториев из списка
function removeRepo(repoId) {
  selectedRepos = selectedRepos.filter((r) => r.id !== repoId);
  // __________Заново отрисовать список___________
  renderRepoList();
}

// рендер списка репозиториев
function renderRepoList() {
  repoList.innerHTML = "";
  // новый элемент для каждого репозитория
  selectedRepos.forEach((repo) => {
    const li = document.createElement("li");
    li.className = "result"; // ______________не потерять класс стиля____________
    // добавление разметки + кнопки
    li.innerHTML = `
            <div class="info">
                <div>Name: ${repo.full_name}</div>
                <div>Owner: ${repo.owner.login}</div>
                <div>Stars: ${repo.stargazers_count}</div>
            </div>
            <button class="delete-btn" data-id="${repo.id}"></button>
        `;
    repoList.appendChild(li);
  });
  // кнопки удаления для добавленных репозиториев
  document.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", () =>
      removeRepo(parseInt(btn.getAttribute("data-id")))
    );
  });
}

// задержка для вывода
const debouncedFetch = debounce(fetchRepos, 400);

// запуск поиска сразу же после ввода текста в поле инпута
searchInput.addEventListener("input", function (event) {
  const query = event.target.value;
  fetchRepos(query); // Запускаем поиск с этим текстом
});
