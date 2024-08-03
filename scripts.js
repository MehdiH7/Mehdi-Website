document.addEventListener("DOMContentLoaded", () => {
  initializeOverlay();
  initializeFilters();
  initializeLoadingAnimation();
  setNightMode(); 
  setInterval(setNightMode, 60000);
});

function initializeOverlay() {
  const clickableElements = document.querySelectorAll(
    ".service-card, .top-menu ul li a"
  );
  const overlay = document.getElementById("overlay");
  const closeBtn = document.getElementById("close-btn");

  function openOverlay(contentId) {
    document.querySelectorAll(".content-section").forEach((section) => {
      section.classList.remove("active");
    });
    document.getElementById(contentId).classList.add("active");
    overlay.style.left = "0";
  }

  clickableElements.forEach((element) => {
    element.addEventListener("click", (event) => {
      event.preventDefault();
      const contentId = element.getAttribute("data-content");
      openOverlay(contentId);
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      overlay.style.left = "-100%";
    });
  }
}

function initializeFilters() {
  const yearFilter = document.getElementById("year-filter");
  const authorFilter = document.getElementById("author-filter");
  const publicationList = document.getElementById("publication-list");
  const publications = publicationList.querySelectorAll("li");

  yearFilter.addEventListener("change", filterPublications);
  authorFilter.addEventListener("change", filterPublications);

  function filterPublications() {
    const selectedYear = yearFilter.value;
    const selectedAuthor = authorFilter.value.toLowerCase();

    publications.forEach((pub) => {
      const pubYear = pub.getAttribute("data-year");
      const pubAuthors = pub.getAttribute("data-authors").toLowerCase();

      const matchesYear = selectedYear === "" || pubYear === selectedYear;
      const matchesAuthor =
        selectedAuthor === "" || pubAuthors.includes(selectedAuthor);

      pub.style.display = matchesYear && matchesAuthor ? "" : "none";
    });
  }
}

function initializeLoadingAnimation() {
  const overlayCircle = document.getElementById("overlay-circle");
  const mainContent = document.getElementById("main-content");
  const loadingText = document.getElementById("loading-text");

  setTimeout(() => {
    overlayCircle.classList.add("expanding");
  }, 100);

  setTimeout(() => {
    overlayCircle.style.display = "none";
    mainContent.classList.add("visible");
  }, 1600);
}

function initializeLoadingAnimation() {
  const overlayCircle = document.getElementById("overlay-circle");
  const mainContent = document.getElementById("main-content");
  const loadingText = document.getElementById("loading-text");

  setTimeout(() => {
    overlayCircle.classList.add("expanding");
  }, 100);

  setTimeout(() => {
    overlayCircle.style.display = "none";
    mainContent.classList.add("visible");
  }, 1600);
}

function setNightMode() {
  const currentHour = new Date().getHours();
  const body = document.body;
  
  if (currentHour >= 20 || currentHour < 6) {
    body.classList.add('night-mode');
  } else {
    body.classList.remove('night-mode');
  }
}
