const searchInput = document.getElementById("search");
const direktoriesList = document.getElementById("suggestions");
const repoList = document.getElementById("repos");
let selectedRepos = [];

function debounce(func, wait) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

async function fetchRepos(query) {
  if (!query) {
    direktoriesList.style.display = "none";
    return;
  }
  try {
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
//
function renderVariant(repo) {
  const li = document.createElement("li");
  li.className = "item";
  li.textContent = repo.fullname;

  li.addEventListener("click", () => {
    addRepo(repo);
    searchInput.value = "";
    direktoriesList.style.display = "none";
  });

  return li;
}
//
function renderRepo(repo) {
  const li = document.createElement("li");
  li.className = "result";

  li.innerHTML = `
    <div class="info">
      <div>Name: ${repo.fullname}</div>
      <div>Owner: ${repo.owner.login}</div>
      <div>Stars: ${repo.stargazers_count}</div>
    </div>
    <button class="delete-btn" data-id="${repo.id}"></button>
  `;

  li.querySelector(".delete-btn").addEventListener("click", () =>
    removeRepo(repo.id)
  );

  return li;
}

function displayAutocomplete(repos) {
  direktoriesList.innerHTML = "";
  if (repos.length === 0) {
    direktoriesList.style.display = "none";
    return;
  }
  repos.forEach((repo) => {
    direktoriesList.appendChild(renderVariant(repo));
  });

  direktoriesList.style.display = "block";
}

function addRepo(repo) {
  selectedRepos.push(repo);
  renderRepoList();
}

function removeRepo(repoId) {
  selectedRepos = selectedRepos.filter((r) => r.id !== repoId);

  renderRepoList();
}

function renderRepoList() {
  repoList.innerHTML = "";

  selectedRepos.forEach((repo) => {
    const li = document.createElement("li");
    li.className = "result";

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

  document.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", () =>
      removeRepo(parseInt(btn.getAttribute("data-id")))
    );
  });
}

const debouncedFetch = debounce(fetchRepos, 4000);

searchInput.addEventListener("input", function (event) {
  const query = event.target.value;
  fetchRepos(query);
});
