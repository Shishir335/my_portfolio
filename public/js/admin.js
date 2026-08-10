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

  const aboutBadgeInput = document.getElementById('admin-about-badge-input');
  const aboutTitleInput = document.getElementById('admin-about-title-input');
  const aboutBioInput = document.getElementById('admin-about-bio-input');
  const statYearsInput = document.getElementById('admin-stat-years-input');
  const statAppsInput = document.getElementById('admin-stat-apps-input');
  const statCrashFreeInput = document.getElementById('admin-stat-crashfree-input');
  const statUsersInput = document.getElementById('admin-stat-users-input');

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

  // Initialize Flatpickr Datepicker for Birth Date
  let fpInstance = null;
  if (birthDateInput && typeof flatpickr !== 'undefined') {
    fpInstance = flatpickr(birthDateInput, {
      dateFormat: 'Y-m-d',
      maxDate: 'today',
      defaultDate: '1998-05-15',
      altInput: true,
      altFormat: 'F j, Y',
      theme: 'dark',
      animate: true,
      disableMobile: true
    });

    const calendarIcon = document.getElementById('calendar-icon-btn');
    if (calendarIcon && fpInstance) {
      calendarIcon.addEventListener('click', () => fpInstance.open());
    }
  }

  const populateDashboard = (user) => {
    if (!user) return;
    try {
      if (user.name && nameInput) nameInput.value = user.name;
      if (user.email && emailDisplay) emailDisplay.value = user.email;
      if (user.birthDate && birthDateInput) {
        if (fpInstance) {
          try {
            fpInstance.setDate(user.birthDate, false);
          } catch (e) {
            birthDateInput.value = user.birthDate;
          }
        } else {
          birthDateInput.value = user.birthDate;
        }
      }
      if (user.gender && genderInput) genderInput.value = user.gender;
      if (user.photo && avatarPreview) avatarPreview.src = user.photo;

      if (user.aboutBadge && aboutBadgeInput) aboutBadgeInput.value = user.aboutBadge;
      if (user.aboutTitle && aboutTitleInput) aboutTitleInput.value = user.aboutTitle;
      if (user.aboutBio && aboutBioInput) aboutBioInput.value = user.aboutBio;
      if (user.statYearsExp && statYearsInput) statYearsInput.value = user.statYearsExp;
      if (user.statApps && statAppsInput) statAppsInput.value = user.statApps;
      if (user.statCrashFree && statCrashFreeInput) statCrashFreeInput.value = user.statCrashFree;
      if (user.statUsers && statUsersInput) statUsersInput.value = user.statUsers;
    } catch (e) {
      console.error('Error populating dashboard:', e);
    }
  };

  // 1. Handle Admin Login
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      loginErrorMsg.style.display = 'none';
      loginSubmitBtn.disabled = true;
      loginSubmitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Authenticating...';

      let res, data;
      try {
        res = await fetch('/api/v1/admin/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: loginEmail.value.trim(),
            password: loginPassword.value
          })
        });

        data = await res.json();
      } catch (err) {
        console.error('Login request error:', err);
        loginErrorMsg.textContent = 'Server connection error. Please try again.';
        loginErrorMsg.style.display = 'block';
        loginSubmitBtn.disabled = false;
        loginSubmitBtn.innerHTML = '<i class="fa-solid fa-lock-open"></i> Access Admin Panel';
        return;
      }

      if (res.ok && data && data.status === 'success') {
        setToken(data.token);
        showToast('Welcome back, Admin!', 'success');
        if (data.data && data.data.user) {
          populateDashboard(data.data.user);
          showDashboardView();
        }
        try {
          await checkAuth();
        } catch (e) {
          console.error('Post-login checkAuth error:', e);
        }
      } else {
        loginErrorMsg.textContent = (data && data.message) ? data.message : 'Invalid email or password';
        loginErrorMsg.style.display = 'block';
      }

      loginSubmitBtn.disabled = false;
      loginSubmitBtn.innerHTML = '<i class="fa-solid fa-lock-open"></i> Access Admin Panel';
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

      let res;
      try {
        const nameVal = nameInput ? nameInput.value.trim() : '';
        const birthVal = birthDateInput ? birthDateInput.value : null;
        const genderVal = genderInput ? genderInput.value : 'prefer-not-to-say';

        if (selectedPhotoFile) {
          const formData = new FormData();
          formData.append('name', nameVal);
          if (birthVal) formData.append('birthDate', birthVal);
          formData.append('gender', genderVal);

          if (aboutBadgeInput) formData.append('aboutBadge', aboutBadgeInput.value.trim());
          if (aboutTitleInput) formData.append('aboutTitle', aboutTitleInput.value.trim());
          if (aboutBioInput) formData.append('aboutBio', aboutBioInput.value.trim());
          if (statYearsInput) formData.append('statYearsExp', statYearsInput.value.trim());
          if (statAppsInput) formData.append('statApps', statAppsInput.value.trim());
          if (statCrashFreeInput) formData.append('statCrashFree', statCrashFreeInput.value.trim());
          if (statUsersInput) formData.append('statUsers', statUsersInput.value.trim());
          formData.append('photo', selectedPhotoFile);

          res = await fetch('/api/v1/admin/profile', {
            method: 'PATCH',
            headers: {
              'Authorization': `Bearer ${token}`
            },
            body: formData
          });
        } else {
          const payload = {
            name: nameVal,
            birthDate: birthVal || null,
            gender: genderVal,
            aboutBadge: aboutBadgeInput ? aboutBadgeInput.value.trim() : '',
            aboutTitle: aboutTitleInput ? aboutTitleInput.value.trim() : '',
            aboutBio: aboutBioInput ? aboutBioInput.value.trim() : '',
            statYearsExp: statYearsInput ? statYearsInput.value.trim() : '',
            statApps: statAppsInput ? statAppsInput.value.trim() : '',
            statCrashFree: statCrashFreeInput ? statCrashFreeInput.value.trim() : '',
            statUsers: statUsersInput ? statUsersInput.value.trim() : ''
          };

          res = await fetch('/api/v1/admin/profile', {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
          });
        }

        let data = {};
        try {
          data = await res.json();
        } catch (jsonErr) {
          console.error('Failed to parse JSON response:', jsonErr);
        }

        if (res.ok && data && data.status === 'success') {
          showToast('Profile updated successfully!', 'success');
          if (data.data && data.data.user) {
            populateDashboard(data.data.user);
          }
          selectedPhotoFile = null;
          localStorage.removeItem('custom_avatar_data');
        } else {
          const errMsg = (data && data.message) ? data.message : `Failed to save changes (${res.status})`;
          showToast(errMsg, 'error');
        }
      } catch (err) {
        console.error('Save Profile Exception:', err);
        showToast(err.message || 'Error updating profile', 'error');
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
