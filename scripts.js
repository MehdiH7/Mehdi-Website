document.addEventListener("DOMContentLoaded", () => {
  initializeOverlay();
  initializeFilters();
  initializeLoadingAnimation();
  initializeScrollEffects();
  initializeTextReveal();
  initializeParallaxImages();
  initializeScrollProgress();
  initializeServicesAnimation();
  initializeCardTiltEffects();
  initializeCursorGlow();
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
  const loadingText = document.getElementById("loading-text");

  setTimeout(() => {
    overlayCircle.classList.add("expanding");
  }, 100);

  setTimeout(() => {
    overlayCircle.style.display = "none";
    mainContent.classList.add("visible");
    // Trigger initial scroll effects check
    checkScrollEffects();
  }, 1600);
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
  const tiltElements = document.querySelectorAll('.service-card, .profile-card');
  if (!tiltElements.length) return;

  tiltElements.forEach((el) => {
    const maxTilt = 8; // degrees
    const scaleOnHover = 1.02;

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
    const elements = document.querySelectorAll('.profile-section, .service-card');
    const windowHeight = window.innerHeight;
    
    elements.forEach(el => {
      const rect = el.getBoundingClientRect();
      // If element is in viewport
      if (rect.top <= windowHeight * 0.9) {
        el.classList.add('visible');
      }
    });
  }
  
  // Add parallax effect to heading elements
  const scrollPosition = window.scrollY;
  document.querySelectorAll('header h1, header h2').forEach(el => {
    el.style.transform = `translateY(${scrollPosition * 0.2}px)`;
  });
  
  // Reveal text character by character based on scroll position
  document.querySelectorAll('header h1, header h2, header p').forEach(element => {
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
  document.querySelectorAll('.service-card').forEach((card, index) => {
    const scrollPercent = window.scrollY / (document.body.scrollHeight - window.innerHeight);
    const cardPosition = index / document.querySelectorAll('.service-card').length;
    
    // Calculate proximity between scroll position and card position
    const proximity = Math.abs(scrollPercent - cardPosition);
    
    // Apply scale based on proximity (closer to current scroll = larger)
    const scale = 1 + (0.1 * (1 - Math.min(proximity * 3, 1)));
    
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

// Initialize service cards scroll animation
function initializeServicesAnimation() {
  const canvas = document.getElementById('services-animation-canvas');
  const serviceCards = document.querySelectorAll('.service-card[data-animation="ready"]');
  
  if (!canvas || serviceCards.length === 0) return;
  
  const ctx = canvas.getContext('2d');
  const servicesContainer = canvas.parentElement;
  let animationFrameId = null;
  let particles = [];
  let connectionLines = [];
  
  // Colors from your CSS variables
  const colors = [
    '#1a73e8', // Publications
    '#615EFC', // Software
    '#7E8EF1', // Web Design
    '#34A853'  // Research Interests
  ];
  
  // Resize canvas to match container
  function resizeCanvas() {
    canvas.width = servicesContainer.offsetWidth;
    canvas.height = servicesContainer.offsetHeight;
    createParticles();
  }
  
  // Create particles for the animation
  function createParticles() {
    particles = [];
    // Create particle clusters for each service card
    serviceCards.forEach((card, index) => {
      const rect = card.getBoundingClientRect();
      const containerRect = servicesContainer.getBoundingClientRect();
      const cardX = rect.left - containerRect.left + rect.width / 2;
      const cardY = rect.top - containerRect.top + rect.height / 2;
      
      // Create particles around each card
      const particleCount = 20; // Adjust as needed
      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: cardX + (Math.random() - 0.5) * rect.width * 1.2,
          y: cardY + (Math.random() - 0.5) * rect.height * 1.2,
          size: Math.random() * 4 + 1,
          speedX: (Math.random() - 0.5) * 0.5,
          speedY: (Math.random() - 0.5) * 0.5,
          color: colors[index % colors.length],
          cardIndex: index,
          alpha: 0.1 + Math.random() * 0.3
        });
      }
    });
  }
  
  // Animate the particles
  function animate() {
    animationFrameId = requestAnimationFrame(animate);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Update and draw particles
    particles.forEach(particle => {
      // Move particles
      particle.x += particle.speedX;
      particle.y += particle.speedY;
      
      // Bounce off container edges
      const margin = 30;
      if (particle.x < margin || particle.x > canvas.width - margin) {
        particle.speedX *= -1;
      }
      if (particle.y < margin || particle.y > canvas.height - margin) {
        particle.speedY *= -1;
      }
      
      // Draw particle
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      ctx.fillStyle = particle.color + Math.floor(particle.alpha * 255).toString(16).padStart(2, '0');
      ctx.fill();
    });
    
    // Draw connection lines between particles of the same card
    ctx.lineWidth = 0.3;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        if (particles[i].cardIndex === particles[j].cardIndex) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          // Draw line if particles are close enough
          if (distance < 70) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = particles[i].color + '40'; // Semi-transparent
            ctx.stroke();
          }
        }
      }
    }
  }
  
  // Create card position mapping for scroll calculation
  const cardPositions = [];
  let cardsRevealed = 0;
  
  function calculateCardPositions() {
    cardPositions.length = 0;
    const windowHeight = window.innerHeight;
    const documentHeight = Math.max(
      document.body.scrollHeight,
      document.documentElement.scrollHeight,
      document.body.offsetHeight,
      document.documentElement.offsetHeight
    );
    
    // Use a percentage of the document height for better distribution
    const scrollableArea = documentHeight - windowHeight;
    const startTrigger = windowHeight * 0.2; // Start after scrolling 20% of viewport height
    const endTrigger = scrollableArea * 0.7; // End before reaching bottom
    const scrollRange = endTrigger - startTrigger;
    
    serviceCards.forEach((card, index) => {
      // Distribute card triggers evenly within the scroll range
      const triggerPos = startTrigger + (scrollRange * index / (serviceCards.length - 1 || 1));
      
      cardPositions.push({
        scrollTrigger: triggerPos,
        index: index,
        revealed: false
      });
    });
    
    // Handle case when page is already scrolled on load
    const currentScrollPos = window.scrollY;
    cardPositions.forEach(cardPos => {
      if (currentScrollPos >= cardPos.scrollTrigger) {
        cardPos.revealed = true;
        serviceCards[cardPos.index].setAttribute('data-animation', 'visible');
        cardsRevealed++;
      }
    });
    
    // If all cards are already revealed, show grid
    if (cardsRevealed === serviceCards.length) {
      revealAllCards();
    }
  }
  
  // Handle scroll to reveal cards
  function handleScroll() {
    const scrollPos = window.scrollY;
    
    // Check each card's trigger position
    cardPositions.forEach(cardPos => {
      if (!cardPos.revealed && scrollPos >= cardPos.scrollTrigger) {
        // Mark this card as revealed
        cardPos.revealed = true;
        cardsRevealed++;
        
        // Show the card with animation
        const card = serviceCards[cardPos.index];
        card.setAttribute('data-animation', 'visible');
        
        // Update particles for this card
        particles.forEach(particle => {
          if (particle.cardIndex === cardPos.index) {
            // Increase particle speed and alpha for revealed cards
            particle.alpha = 0.4 + Math.random() * 0.4;
            particle.speedX = (Math.random() - 0.5) * 1.2;
            particle.speedY = (Math.random() - 0.5) * 1.2;
          }
        });
        
        // If all cards are revealed, gradually transition to grid layout
        if (cardsRevealed === serviceCards.length) {
          setTimeout(() => {
            revealAllCards();
          }, 500);
        }
      }
    });
  }
  
  // Function to reveal all cards when scroll reaches bottom
  function revealAllCards() {
    serviceCards.forEach(card => {
      card.setAttribute('data-animation', 'visible');
    });
    servicesContainer.classList.add('all-visible');
  }
  
  // Set up Intersection Observer to detect when cards section is visible
  let sectionVisible = false;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      sectionVisible = entry.isIntersecting;
      
      if (sectionVisible) {
        if (!animationFrameId) {
          // Start animation
          animate();
          calculateCardPositions();
        }
      } else {
        // Stop animation when section not visible
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId);
          animationFrameId = null;
        }
      }
    });
  }, { threshold: 0.1 });
  
  // Start observing the services container
  observer.observe(servicesContainer);
  
  // Listen for scroll
  window.addEventListener('scroll', () => {
    if (sectionVisible) {
      handleScroll();
    }
  });
  
  // Listen for resize
  window.addEventListener('resize', () => {
    resizeCanvas();
    calculateCardPositions();
  });
  
  // Initial setup
  resizeCanvas();
  calculateCardPositions();
}
