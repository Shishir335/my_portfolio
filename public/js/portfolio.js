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
      const endpoint = endpointSelect ? endpointSelect.value : '/api/v1/admin/public-profile';
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

  // 4. Custom Avatar Photo Upload & Persistence
  const heroAvatarImg = document.getElementById('hero-avatar-img');
  const avatarFileInput = document.getElementById('avatar-file-input');
  const uploadAvatarBtn = document.getElementById('upload-avatar-btn');
  const resetAvatarBtn = document.getElementById('reset-avatar-btn');
  const avatarToast = document.getElementById('avatar-toast');

  if (heroAvatarImg && avatarFileInput && uploadAvatarBtn) {
    let toastTimeout = null;

    const showToast = (message, type = 'success', duration = 3000) => {
      if (!avatarToast) return;
      if (toastTimeout) clearTimeout(toastTimeout);

      avatarToast.textContent = message;
      avatarToast.className = `avatar-upload-toast ${type}`;
      avatarToast.style.display = 'block';

      if (duration > 0) {
        toastTimeout = setTimeout(() => {
          avatarToast.style.display = 'none';
        }, duration);
      }
    };

    const updateAvatarSrc = (src, isCustom = false) => {
      heroAvatarImg.src = src;
      if (resetAvatarBtn) {
        resetAvatarBtn.style.display = isCustom ? 'flex' : 'none';
      }
    };

    // Check cached avatar in localStorage for instant render
    const cachedAvatar = localStorage.getItem('custom_avatar_data');
    if (cachedAvatar) {
      updateAvatarSrc(cachedAvatar, true);
    }

    // Fetch public profile data from server on load
    fetch('/api/v1/admin/public-profile')
      .then(res => res.json())
      .then(resData => {
        if (resData.status === 'success' && resData.data) {
          const profile = resData.data;
          if (profile.photo && !cachedAvatar) {
            updateAvatarSrc(profile.photo, profile.photo !== '/img/avatar.png');
          }
        }
      })
      .catch(() => {
        // Fallback silently if offline or server API not ready
      });

    // Trigger file chooser
    uploadAvatarBtn.addEventListener('click', () => {
      avatarFileInput.click();
    });

    // Handle file selection
    avatarFileInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      if (!file.type.startsWith('image/')) {
        showToast('Please select a valid image file', 'error');
        return;
      }

      showToast('Processing photo...', 'loading', 0);

      // Instant client-side preview with FileReader
      const reader = new FileReader();
      reader.onload = async (event) => {
        const previewUrl = event.target.result;
        updateAvatarSrc(previewUrl, true);

        // Store local copy for offline persistence
        try {
          localStorage.setItem('custom_avatar_data', previewUrl);
        } catch (err) {
          console.warn('LocalStorage quota exceeded for image data:', err);
        }

        // Upload to Express backend
        const formData = new FormData();
        formData.append('photo', file);

        try {
          const response = await fetch('/api/v1/upload-avatar', {
            method: 'POST',
            body: formData
          });

          const result = await response.json();
          if (response.ok && result.status === 'success') {
            showToast('Photo uploaded successfully!', 'success', 3000);
            if (result.data && result.data.avatarUrl) {
              updateAvatarSrc(result.data.avatarUrl, true);
            }
          } else {
            showToast(result.message || 'Error saving photo to server', 'error', 4000);
          }
        } catch (err) {
          showToast('Photo saved locally (server offline)', 'success', 3000);
        }
      };

      reader.readAsDataURL(file);
    });

    // Handle reset to default avatar
    if (resetAvatarBtn) {
      resetAvatarBtn.addEventListener('click', async () => {
        localStorage.removeItem('custom_avatar_data');
        updateAvatarSrc('/img/avatar.png', false);
        avatarFileInput.value = '';

        try {
          await fetch('/api/v1/upload-avatar', { method: 'DELETE' });
        } catch (err) {
          // ignore network error on reset
        }

        showToast('Restored default photo', 'success', 2500);
      });
    }
  }
});
