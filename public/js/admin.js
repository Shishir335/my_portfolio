// Admin Panel Authentication & Profile Management Logic
document.addEventListener('DOMContentLoaded', () => {
  const loginView = document.getElementById('admin-login-view');
  const dashboardView = document.getElementById('admin-dashboard-view');
  const logoutBtn = document.getElementById('admin-logout-btn');
  
  const loginForm = document.getElementById('admin-login-form');
  const loginEmail = document.getElementById('login-email');
  const loginPassword = document.getElementById('login-password');
  const loginErrorMsg = document.getElementById('login-error-msg');
  const loginSubmitBtn = document.getElementById('login-submit-btn');

  const profileForm = document.getElementById('admin-profile-form');
  const avatarPreview = document.getElementById('admin-avatar-preview');
  const photoInput = document.getElementById('admin-photo-input');
  const triggerPhotoUpload = document.getElementById('trigger-photo-upload');
  const choosePhotoBtn = document.getElementById('choose-photo-btn');
  
  const nameInput = document.getElementById('admin-name-input');
  const emailDisplay = document.getElementById('admin-email-display');
  const birthDateInput = document.getElementById('admin-birthdate-input');
  const genderInput = document.getElementById('admin-gender-input');
  const saveProfileBtn = document.getElementById('save-profile-btn');
  
  const toast = document.getElementById('admin-toast');

  let selectedPhotoFile = null;

  const showToast = (message, type = 'success', duration = 3000) => {
    if (!toast) return;
    toast.textContent = message;
    toast.className = `admin-toast ${type}`;
    toast.style.display = 'block';

    setTimeout(() => {
      toast.style.display = 'none';
    }, duration);
  };

  const getToken = () => localStorage.getItem('admin_jwt_token');
  const setToken = (token) => localStorage.setItem('admin_jwt_token', token);
  const clearToken = () => localStorage.removeItem('admin_jwt_token');

  // Check auth state
  const checkAuth = async () => {
    const token = getToken();
    if (!token) {
      showLoginView();
      return;
    }

    try {
      const res = await fetch('/api/v1/admin/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await res.json();
      if (res.ok && data.status === 'success') {
        populateDashboard(data.data.user);
        showDashboardView();
      } else {
        clearToken();
        showLoginView();
      }
    } catch (err) {
      console.error('Auth verification error:', err);
      showLoginView();
    }
  };

  const showLoginView = () => {
    loginView.style.display = 'block';
    dashboardView.style.display = 'none';
    if (logoutBtn) logoutBtn.style.display = 'none';
  };

  const showDashboardView = () => {
    loginView.style.display = 'none';
    dashboardView.style.display = 'block';
    if (logoutBtn) logoutBtn.style.display = 'inline-flex';
  };

  const populateDashboard = (user) => {
    if (user.name) nameInput.value = user.name;
    if (user.email) emailDisplay.value = user.email;
    if (user.birthDate) birthDateInput.value = user.birthDate;
    if (user.gender) genderInput.value = user.gender;
    if (user.photo) avatarPreview.src = user.photo;
  };

  // 1. Handle Admin Login
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      loginErrorMsg.style.display = 'none';
      loginSubmitBtn.disabled = true;
      loginSubmitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Authenticating...';

      try {
        const res = await fetch('/api/v1/admin/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: loginEmail.value.trim(),
            password: loginPassword.value
          })
        });

        const data = await res.json();
        if (res.ok && data.status === 'success') {
          setToken(data.token);
          showToast('Welcome back, Admin!', 'success');
          await checkAuth();
        } else {
          loginErrorMsg.textContent = data.message || 'Invalid email or password';
          loginErrorMsg.style.display = 'block';
        }
      } catch (err) {
        loginErrorMsg.textContent = 'Server connection error. Please try again.';
        loginErrorMsg.style.display = 'block';
      } finally {
        loginSubmitBtn.disabled = false;
        loginSubmitBtn.innerHTML = '<i class="fa-solid fa-lock-open"></i> Access Admin Panel';
      }
    });
  }

  // 2. Photo Upload Triggers
  const openPhotoPicker = () => photoInput.click();
  if (triggerPhotoUpload) triggerPhotoUpload.addEventListener('click', openPhotoPicker);
  if (choosePhotoBtn) choosePhotoBtn.addEventListener('click', openPhotoPicker);

  if (photoInput) {
    photoInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      if (!file.type.startsWith('image/')) {
        showToast('Please select a valid image file', 'error');
        return;
      }

      selectedPhotoFile = file;
      const reader = new FileReader();
      reader.onload = (event) => {
        avatarPreview.src = event.target.result;
      };
      reader.readAsDataURL(file);
    });
  }

  // 3. Save Profile Changes
  if (profileForm) {
    profileForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const token = getToken();
      if (!token) {
        showLoginView();
        return;
      }

      saveProfileBtn.disabled = true;
      saveProfileBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';

      const formData = new FormData();
      formData.append('name', nameInput.value.trim());
      formData.append('birthDate', birthDateInput.value);
      formData.append('gender', genderInput.value);

      if (selectedPhotoFile) {
        formData.append('photo', selectedPhotoFile);
      }

      try {
        const res = await fetch('/api/v1/admin/profile', {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });

        const data = await res.json();
        if (res.ok && data.status === 'success') {
          showToast('Profile updated successfully!', 'success');
          populateDashboard(data.data.user);
          selectedPhotoFile = null;

          // Clear local cache on main site so fresh server avatar loads
          localStorage.removeItem('custom_avatar_data');
        } else {
          showToast(data.message || 'Failed to update profile', 'error');
        }
      } catch (err) {
        showToast('Error connecting to server', 'error');
      } finally {
        saveProfileBtn.disabled = false;
        saveProfileBtn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Save Profile Changes';
      }
    });
  }

  // 4. Handle Logout
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      clearToken();
      showToast('Logged out successfully', 'success');
      showLoginView();
    });
  }

  // Initialize Auth Check
  checkAuth();
});
