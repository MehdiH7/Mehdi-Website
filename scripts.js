document.addEventListener("DOMContentLoaded", () => {
  initializeOverlay();
  initializeFilters();
  initializeLoadingAnimation();
  initializeScrollEffects();
  initializeTextReveal();
  initializeScrollProgress();
  initializeStatsAnimation();
  initializeCardTiltEffects();
  initializeCursorGlow();
  initializeMobileMenu();
  initializeSmoothScrolling();
  setNightMode(); 
  setInterval(setNightMode, 60000);
});

function initializeOverlay() {
  const clickableElements = document.querySelectorAll(
    ".service-card.modern, .nav-link, .btn-primary, .btn-secondary"
  );
  const overlay = document.getElementById("overlay");
  const closeBtn = document.getElementById("close-btn");

  function openOverlay(contentId) {
    document.querySelectorAll(".content-section").forEach((section) => {
      section.classList.remove("active");
    });
    document.getElementById(contentId).classList.add("active");
    overlay.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  clickableElements.forEach((element) => {
    element.addEventListener("click", (event) => {
      event.preventDefault();
      const contentId = element.getAttribute("data-content");
      if (contentId) {
        openOverlay(contentId);
      }
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      overlay.classList.remove("active");
      document.body.style.overflow = "auto";
    });
  }

  // Close overlay when clicking outside content
  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) {
      overlay.classList.remove("active");
      document.body.style.overflow = "auto";
    }
  });
}

function initializeFilters() {
  const yearFilter = document.getElementById("year-filter");
  const authorFilter = document.getElementById("author-filter");
  const publicationList = document.getElementById("publication-list");
  
  if (!yearFilter || !authorFilter || !publicationList) return;
  
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

  setTimeout(() => {
    overlayCircle.classList.add("hidden");
    mainContent.classList.remove("hidden");
    // Trigger initial scroll effects check
    checkScrollEffects();
  }, 2000);
}

// Initialize scroll effects for revealing content on scroll
function initializeScrollEffects() {
  // Add scroll event listener
  window.addEventListener('scroll', checkScrollEffects);
  
  // Add scroll observer for smoother effects
  if ('IntersectionObserver' in window) {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          // Stop observing after it becomes visible
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);
    
    // Observe elements
    document.querySelectorAll('.profile-section, .service-card').forEach(el => {
      observer.observe(el);
    });
  }
}

// Initialize text reveal animation
function initializeTextReveal() {
  // Select all headings and paragraphs within header
  const textElements = document.querySelectorAll('header h1, header h2, header p');
  
  // Prepare each element for text reveal
  textElements.forEach(element => {
    const originalText = element.innerText;
    const originalHTML = element.innerHTML;
    
    // Skip if the element contains HTML tags
    if (originalHTML !== originalText) return;
    
    // Create span for each character
    const wrappedText = originalText.split('').map(char => {
      return char === ' ' ? ' ' : `<span class="reveal-char">${char}</span>`;
    }).join('');
    
    // Replace content
    element.innerHTML = wrappedText;
    
    // Set initial state for each character
    const chars = element.querySelectorAll('.reveal-char');
    chars.forEach((char, index) => {
      char.style.opacity = '0';
      char.style.transform = 'translateY(20px)';
      char.style.transition = `opacity 0.3s ease, transform 0.3s ease`;
      char.style.transitionDelay = `${index * 0.02}s`;
    });
    
    // Store the info for later use by scroll handler
    element.dataset.revealed = 'false';
    element.dataset.charCount = chars.length;
  });
}

// Subtle 3D tilt for cards
function initializeCardTiltEffects() {
  const tiltElements = document.querySelectorAll('.service-card.modern, .stat-item');
  if (!tiltElements.length) return;

  tiltElements.forEach((el) => {
    const maxTilt = 5; // degrees
    const scaleOnHover = 1.05;

    function handleMove(e) {
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width; // 0..1
      const y = (e.clientY - rect.top) / rect.height; // 0..1
      const rotateY = (x - 0.5) * (maxTilt * 2);
      const rotateX = -(y - 0.5) * (maxTilt * 2);
      el.style.setProperty('--rx', rotateX.toFixed(2) + 'deg');
      el.style.setProperty('--ry', rotateY.toFixed(2) + 'deg');
      el.style.setProperty('--scale', scaleOnHover);
    }

    function resetTilt() {
      el.style.setProperty('--rx', '0deg');
      el.style.setProperty('--ry', '0deg');
      el.style.setProperty('--scale', '1');
    }

    el.addEventListener('mousemove', handleMove);
    el.addEventListener('mouseleave', resetTilt);
    el.addEventListener('mouseenter', (e) => handleMove(e));
  });
}

// Cursor glow that follows the mouse
function initializeCursorGlow() {
  if (document.getElementById('cursor-glow')) return;
  const glow = document.createElement('div');
  glow.id = 'cursor-glow';
  document.body.appendChild(glow);

  const smoothing = 0.12;
  let targetX = window.innerWidth / 2;
  let targetY = window.innerHeight / 2;
  let currentX = targetX;
  let currentY = targetY;
  let rafId = null;

  function animate() {
    currentX += (targetX - currentX) * smoothing;
    currentY += (targetY - currentY) * smoothing;
    glow.style.left = `${currentX}px`;
    glow.style.top = `${currentY}px`;
    rafId = requestAnimationFrame(animate);
  }

  function onMove(e) {
    targetX = e.clientX;
    targetY = e.clientY;
    if (!rafId) animate();
  }

  function onLeave() {
    cancelAnimationFrame(rafId);
    rafId = null;
  }

  window.addEventListener('mousemove', onMove);
  window.addEventListener('mouseout', onLeave);
}

// Initialize parallax images
function initializeParallaxImages() {
  // Create a scroll-linked image container
  const profileCard = document.querySelector('.profile-card');
  if (!profileCard) return;
  
  // Get the profile image
  const profileImg = profileCard.querySelector('img');
  if (!profileImg) return;
  
  // Create an animation wrapper for the image
  const animWrapper = document.createElement('div');
  animWrapper.className = 'image-scroll-wrapper';
  animWrapper.style.position = 'relative';
  animWrapper.style.overflow = 'hidden';
  animWrapper.style.width = '150px';
  animWrapper.style.height = '150px';
  animWrapper.style.borderRadius = '50%';
  animWrapper.style.margin = '0 auto';
  
  // Style the image for animation
  profileImg.style.width = '100%';
  profileImg.style.height = '100%';
  profileImg.style.objectFit = 'cover';
  profileImg.style.transition = 'transform 0.1s ease-out';
  
  // Insert the wrapper
  profileImg.parentNode.insertBefore(animWrapper, profileImg);
  animWrapper.appendChild(profileImg);
  
  // Add gentle rotation to image based on scroll
  window.addEventListener('scroll', () => {
    const scrollPercent = window.scrollY / (document.body.scrollHeight - window.innerHeight);
    const rotationAmount = scrollPercent * 360;
    profileImg.style.transform = `rotate(${rotationAmount}deg)`;
  });
}

// Check and update elements visibility based on scroll position
function checkScrollEffects() {
  // Fallback for browsers without IntersectionObserver
  if (!('IntersectionObserver' in window)) {
    const elements = document.querySelectorAll('.service-card.modern, .stat-item');
    const windowHeight = window.innerHeight;
    
    elements.forEach(el => {
      const rect = el.getBoundingClientRect();
      // If element is in viewport
      if (rect.top <= windowHeight * 0.9) {
        el.classList.add('visible');
      }
    });
  }
  
  // Add parallax effect to hero elements
  const scrollPosition = window.scrollY;
  const hero = document.querySelector('.hero');
  if (hero) {
    const heroHeight = hero.offsetHeight;
    const scrollPercent = scrollPosition / heroHeight;
    
    // Parallax effect for hero image
    const heroImage = document.querySelector('.hero-image');
    if (heroImage) {
      heroImage.style.transform = `translateY(${scrollPosition * 0.3}px)`;
    }
    
    // Parallax effect for floating elements
    document.querySelectorAll('.floating-element').forEach((element, index) => {
      const speed = 0.1 + (index * 0.05);
      element.style.transform = `translateY(${scrollPosition * speed}px)`;
    });
  }
  
  // Reveal text character by character based on scroll position
  document.querySelectorAll('.hero-title .title-line, .hero-description').forEach(element => {
    if (element.dataset.revealed === 'true') return;
    
    const rect = element.getBoundingClientRect();
    const isVisible = rect.top <= window.innerHeight * 0.8;
    
    if (isVisible) {
      const chars = element.querySelectorAll('.reveal-char');
      
      chars.forEach((char, index) => {
        setTimeout(() => {
          char.style.opacity = '1';
          char.style.transform = 'translateY(0)';
        }, index * 20);
      });
      
      element.dataset.revealed = 'true';
    }
  });
  
  // Update service cards with scroll-linked effect
  document.querySelectorAll('.service-card.modern').forEach((card, index) => {
    const scrollPercent = window.scrollY / (document.body.scrollHeight - window.innerHeight);
    const cardPosition = index / document.querySelectorAll('.service-card.modern').length;
    
    // Calculate proximity between scroll position and card position
    const proximity = Math.abs(scrollPercent - cardPosition);
    
    // Apply scale based on proximity (closer to current scroll = larger)
    const scale = 1 + (0.05 * (1 - Math.min(proximity * 3, 1)));
    
    // Apply scale via CSS variable to preserve tilt transforms
    card.style.setProperty('--scale', scale.toFixed(3));
  });
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

// Initialize scroll progress indicator
function initializeScrollProgress() {
  const progressBar = document.getElementById('scroll-progress');
  if (!progressBar) return;
  
  window.addEventListener('scroll', () => {
    const windowHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrolled = window.scrollY;
    const progress = (scrolled / windowHeight) * 100;
    
    progressBar.style.width = `${progress}%`;
  });
}

// Initialize stats animation
function initializeStatsAnimation() {
  const statNumbers = document.querySelectorAll('.stat-number');
  
  const animateNumber = (element) => {
    const target = parseInt(element.getAttribute('data-target'));
    const duration = 2000; // 2 seconds
    const start = performance.now();
    
    const updateNumber = (currentTime) => {
      const elapsed = currentTime - start;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const current = Math.floor(easeOutQuart * target);
      
      element.textContent = current;
      
      if (progress < 1) {
        requestAnimationFrame(updateNumber);
      } else {
        element.textContent = target;
      }
    };
    
    requestAnimationFrame(updateNumber);
  };
  
  // Use Intersection Observer to trigger animation when stats come into view
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const statNumber = entry.target.querySelector('.stat-number');
        if (statNumber && !statNumber.classList.contains('animated')) {
          statNumber.classList.add('animated');
          animateNumber(statNumber);
        }
      }
    });
  }, { threshold: 0.5 });
  
  // Observe each stat item
  document.querySelectorAll('.stat-item').forEach(item => {
    observer.observe(item);
  });
}

// Initialize mobile menu
function initializeMobileMenu() {
  const navToggle = document.querySelector('.nav-toggle');
  const navMenu = document.querySelector('.nav-menu');
  
  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      navMenu.classList.toggle('active');
      navToggle.classList.toggle('active');
    });
    
    // Close menu when clicking on a link
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        navToggle.classList.remove('active');
      });
    });
  }
}

// Initialize smooth scrolling for navigation
function initializeSmoothScrolling() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
}
