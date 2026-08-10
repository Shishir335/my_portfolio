// Flutter Developer Portfolio Interactive Logic
document.addEventListener('DOMContentLoaded', () => {
  // 1. Navbar Scroll Effect
  const navbar = document.querySelector('.navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // 2. Interactive API Tester
  const apiBtn = document.getElementById('test-api-btn');
  const apiCodeDisplay = document.getElementById('api-code-output');
  const endpointSelect = document.getElementById('api-endpoint-select');
  const apiStatusBadge = document.getElementById('api-status-badge');

  if (apiBtn && apiCodeDisplay) {
    apiBtn.addEventListener('click', async () => {
      const endpoint = endpointSelect ? endpointSelect.value : '/api/v1/products';
      apiCodeDisplay.textContent = `// Fetching data from ${endpoint}...\nLoading...`;
      
      try {
        const startTime = performance.now();
        const response = await fetch(endpoint);
        const data = await response.json();
        const duration = Math.round(performance.now() - startTime);

        if (apiStatusBadge) {
          apiStatusBadge.textContent = `200 OK (${duration}ms)`;
          apiStatusBadge.style.background = 'rgba(16, 185, 129, 0.2)';
          apiStatusBadge.style.color = '#10b981';
        }

        apiCodeDisplay.textContent = JSON.stringify(data, null, 2);
      } catch (err) {
        if (apiStatusBadge) {
          apiStatusBadge.textContent = `Error`;
          apiStatusBadge.style.background = 'rgba(239, 68, 68, 0.2)';
          apiStatusBadge.style.color = '#ef4444';
        }
        apiCodeDisplay.textContent = `// Failed to fetch endpoint\n${err.message}`;
      }
    });
  }

  // 3. Contact Form Submission (Toast Simulation)
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      alert('Thank you for reaching out! Your message has been sent successfully. I will get back to you shortly.');
      contactForm.reset();
    });
  }
});
