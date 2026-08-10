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

      if (user.skills && Array.isArray(user.skills)) {
        currentSkills = user.skills;
        renderSkillsEditor();
      }

      if (user.projects && Array.isArray(user.projects)) {
        currentProjects = user.projects;
        renderProjectsEditor();
      }

      if (user.experiences && Array.isArray(user.experiences)) {
        currentExperiences = user.experiences;
        renderExperienceEditor();
      }
    } catch (e) {
      console.error('Error populating dashboard:', e);
    }
  };

  // Drawer Navigation Tabs Switching
  const drawerBtns = document.querySelectorAll('.admin-drawer-btn');
  const tabPanes = document.querySelectorAll('.admin-tab-pane');

  drawerBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTabId = btn.getAttribute('data-tab');
      drawerBtns.forEach(b => b.classList.remove('active'));
      tabPanes.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const activePane = document.getElementById(targetTabId);
      if (activePane) activePane.classList.add('active');
    });
  });

  // Skills Section Editor
  let currentSkills = [];
  const skillsContainer = document.getElementById('admin-skills-editor-container');
  const addSkillBtn = document.getElementById('add-skill-card-btn');

  const renderSkillsEditor = () => {
    if (!skillsContainer) return;
    skillsContainer.innerHTML = '';

    currentSkills.forEach((skill, index) => {
      const card = document.createElement('div');
      card.style.cssText = 'background: rgba(15, 23, 42, 0.6); border: 1px solid var(--border-color); border-radius: 8px; padding: 16px; position: relative;';

      card.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <h4 style="font-size: 0.95rem; font-weight: 600; color: var(--flutter-cyan);">Skill Card #${index + 1}</h4>
          <button type="button" class="btn btn-sm" style="color: #ef4444; background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.2); padding: 4px 10px;" onclick="removeSkillCard(${index})">
            <i class="fa-solid fa-trash"></i> Remove
          </button>
        </div>
        <div style="display: flex; flex-direction: column; gap: 12px;">
          <div>
            <label style="font-size: 0.8rem; color: var(--text-muted);">Title</label>
            <input type="text" class="skill-input-title" data-index="${index}" value="${skill.title || ''}" placeholder="e.g. Flutter & Dart Core" style="width: 100%; padding: 8px 12px; border-radius: 6px; background: #090d16; border: 1px solid var(--border-color); color: #fff; font-size: 0.9rem; margin-top: 4px;">
          </div>
          <div>
            <label style="font-size: 0.8rem; color: var(--text-muted);">Description</label>
            <textarea class="skill-input-desc" data-index="${index}" rows="2" placeholder="Describe key mastery focus..." style="width: 100%; padding: 8px 12px; border-radius: 6px; background: #090d16; border: 1px solid var(--border-color); color: #fff; font-size: 0.9rem; margin-top: 4px; resize: vertical;">${skill.description || ''}</textarea>
          </div>
          <div>
            <label style="font-size: 0.8rem; color: var(--text-muted);">Tags (comma separated)</label>
            <input type="text" class="skill-input-tags" data-index="${index}" value="${(skill.tags || []).join(', ')}" placeholder="e.g. Flutter 3.x, Dart 3, Isolates" style="width: 100%; padding: 8px 12px; border-radius: 6px; background: #090d16; border: 1px solid var(--border-color); color: #fff; font-size: 0.9rem; margin-top: 4px;">
          </div>
        </div>
      `;

      skillsContainer.appendChild(card);
    });
  };

  window.removeSkillCard = (index) => {
    currentSkills.splice(index, 1);
    renderSkillsEditor();
  };

  if (addSkillBtn) {
    addSkillBtn.addEventListener('click', () => {
      currentSkills.push({
        title: 'New Skill Focus',
        description: 'Describe your expertise in this category...',
        tags: ['Skill 1', 'Skill 2'],
        icon: 'fa-solid fa-code',
        color: '#00D2FF'
      });
      renderSkillsEditor();
    });
  }

  const collectSkillsData = () => {
    const titleInputs = document.querySelectorAll('.skill-input-title');
    const descInputs = document.querySelectorAll('.skill-input-desc');
    const tagsInputs = document.querySelectorAll('.skill-input-tags');

    const updatedSkills = [];
    titleInputs.forEach((input, index) => {
      const title = input.value.trim();
      const description = descInputs[index] ? descInputs[index].value.trim() : '';
      const tagsStr = tagsInputs[index] ? tagsInputs[index].value : '';
      const tags = tagsStr.split(',').map(t => t.trim()).filter(Boolean);

      if (title) {
        updatedSkills.push({
          title,
          description,
          tags,
          icon: currentSkills[index]?.icon || 'fa-solid fa-code',
          color: currentSkills[index]?.color || '#00D2FF'
        });
      }
    });

    return updatedSkills;
  };

  // Projects Section Editor
  let currentProjects = [];
  const projectsContainer = document.getElementById('admin-projects-editor-container');
  const addProjectBtn = document.getElementById('add-project-card-btn');

  const renderProjectsEditor = () => {
    if (!projectsContainer) return;
    projectsContainer.innerHTML = '';

    currentProjects.forEach((proj, index) => {
      const card = document.createElement('div');
      card.style.cssText = 'background: rgba(15, 23, 42, 0.6); border: 1px solid var(--border-color); border-radius: 8px; padding: 16px; position: relative;';

      card.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <h4 style="font-size: 0.95rem; font-weight: 600; color: var(--flutter-cyan);">Project Card #${index + 1}</h4>
          <button type="button" class="btn btn-sm" style="color: #ef4444; background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.2); padding: 4px 10px;" onclick="removeProjectCard(${index})">
            <i class="fa-solid fa-trash"></i> Remove
          </button>
        </div>
        <div style="display: flex; flex-direction: column; gap: 12px;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <div>
              <label style="font-size: 0.8rem; color: var(--text-muted);">Title</label>
              <input type="text" class="proj-input-title" data-index="${index}" value="${proj.title || ''}" placeholder="e.g. CryptoPulse Dashboard" style="width: 100%; padding: 8px 12px; border-radius: 6px; background: #090d16; border: 1px solid var(--border-color); color: #fff; font-size: 0.9rem; margin-top: 4px;">
            </div>
            <div>
              <label style="font-size: 0.8rem; color: var(--text-muted);">Category / Badge</label>
              <input type="text" class="proj-input-badge" data-index="${index}" value="${proj.badge || ''}" placeholder="e.g. Flutter & Web" style="width: 100%; padding: 8px 12px; border-radius: 6px; background: #090d16; border: 1px solid var(--border-color); color: #fff; font-size: 0.9rem; margin-top: 4px;">
            </div>
          </div>
          <div>
            <label style="font-size: 0.8rem; color: var(--text-muted);">Description</label>
            <textarea class="proj-input-desc" data-index="${index}" rows="2" placeholder="Describe key features & tech stack..." style="width: 100%; padding: 8px 12px; border-radius: 6px; background: #090d16; border: 1px solid var(--border-color); color: #fff; font-size: 0.9rem; margin-top: 4px; resize: vertical;">${proj.description || ''}</textarea>
          </div>
          <div>
            <label style="font-size: 0.8rem; color: var(--text-muted);">Tags (comma separated)</label>
            <input type="text" class="proj-input-tags" data-index="${index}" value="${(proj.tags || []).join(', ')}" placeholder="e.g. Flutter 3.x, Riverpod, WebSockets" style="width: 100%; padding: 8px 12px; border-radius: 6px; background: #090d16; border: 1px solid var(--border-color); color: #fff; font-size: 0.9rem; margin-top: 4px;">
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <div>
              <label style="font-size: 0.8rem; color: var(--text-muted);">GitHub Repo URL</label>
              <input type="text" class="proj-input-github" data-index="${index}" value="${proj.githubLink || ''}" placeholder="https://github.com/..." style="width: 100%; padding: 8px 12px; border-radius: 6px; background: #090d16; border: 1px solid var(--border-color); color: #fff; font-size: 0.9rem; margin-top: 4px;">
            </div>
            <div>
              <label style="font-size: 0.8rem; color: var(--text-muted);">Live Demo / Store URL</label>
              <input type="text" class="proj-input-demo" data-index="${index}" value="${proj.demoLink || ''}" placeholder="https://..." style="width: 100%; padding: 8px 12px; border-radius: 6px; background: #090d16; border: 1px solid var(--border-color); color: #fff; font-size: 0.9rem; margin-top: 4px;">
            </div>
          </div>
        </div>
      `;

      projectsContainer.appendChild(card);
    });
  };

  window.removeProjectCard = (index) => {
    currentProjects.splice(index, 1);
    renderProjectsEditor();
  };

  if (addProjectBtn) {
    addProjectBtn.addEventListener('click', () => {
      currentProjects.push({
        title: 'New Featured Project',
        badge: 'Mobile App',
        description: 'Describe application architecture and features...',
        image: '/img/app_showcase.png',
        tags: ['Flutter', 'Riverpod'],
        githubLink: 'https://github.com/Shishir335',
        demoLink: 'https://github.com/Shishir335'
      });
      renderProjectsEditor();
    });
  }

  const collectProjectsData = () => {
    const titleInputs = document.querySelectorAll('.proj-input-title');
    const badgeInputs = document.querySelectorAll('.proj-input-badge');
    const descInputs = document.querySelectorAll('.proj-input-desc');
    const tagsInputs = document.querySelectorAll('.proj-input-tags');
    const githubInputs = document.querySelectorAll('.proj-input-github');
    const demoInputs = document.querySelectorAll('.proj-input-demo');

    const updatedProjects = [];
    titleInputs.forEach((input, index) => {
      const title = input.value.trim();
      const badge = badgeInputs[index] ? badgeInputs[index].value.trim() : 'Mobile App';
      const description = descInputs[index] ? descInputs[index].value.trim() : '';
      const tagsStr = tagsInputs[index] ? tagsInputs[index].value : '';
      const tags = tagsStr.split(',').map(t => t.trim()).filter(Boolean);
      const githubLink = githubInputs[index] ? githubInputs[index].value.trim() : '';
      const demoLink = demoInputs[index] ? demoInputs[index].value.trim() : '';

      if (title) {
        updatedProjects.push({
          title,
          badge,
          description,
          image: currentProjects[index]?.image || '/img/app_showcase.png',
          tags,
          githubLink,
          demoLink
        });
      }
    });

    return updatedProjects;
  };

  // Experience Section Editor
  let currentExperiences = [];
  const experienceContainer = document.getElementById('admin-experience-editor-container');
  const addExperienceBtn = document.getElementById('add-experience-card-btn');

  const renderExperienceEditor = () => {
    if (!experienceContainer) return;
    experienceContainer.innerHTML = '';

    currentExperiences.forEach((exp, index) => {
      const card = document.createElement('div');
      card.style.cssText = 'background: rgba(15, 23, 42, 0.6); border: 1px solid var(--border-color); border-radius: 8px; padding: 16px; position: relative;';

      card.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <h4 style="font-size: 0.95rem; font-weight: 600; color: var(--flutter-cyan);">Experience #${index + 1}</h4>
          <button type="button" class="btn btn-sm" style="color: #ef4444; background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.2); padding: 4px 10px;" onclick="removeExperienceCard(${index})">
            <i class="fa-solid fa-trash"></i> Remove
          </button>
        </div>
        <div style="display: flex; flex-direction: column; gap: 12px;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <div>
              <label style="font-size: 0.8rem; color: var(--text-muted);">Job Role / Title</label>
              <input type="text" class="exp-input-role" data-index="${index}" value="${exp.role || ''}" placeholder="e.g. Senior Flutter Engineer" style="width: 100%; padding: 8px 12px; border-radius: 6px; background: #090d16; border: 1px solid var(--border-color); color: #fff; font-size: 0.9rem; margin-top: 4px;">
            </div>
            <div>
              <label style="font-size: 0.8rem; color: var(--text-muted);">Company Name</label>
              <input type="text" class="exp-input-company" data-index="${index}" value="${exp.company || ''}" placeholder="e.g. TechCorp Solutions" style="width: 100%; padding: 8px 12px; border-radius: 6px; background: #090d16; border: 1px solid var(--border-color); color: #fff; font-size: 0.9rem; margin-top: 4px;">
            </div>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <div>
              <label style="font-size: 0.8rem; color: var(--text-muted);">Duration / Timeline</label>
              <input type="text" class="exp-input-duration" data-index="${index}" value="${exp.duration || ''}" placeholder="e.g. 2022 - Present" style="width: 100%; padding: 8px 12px; border-radius: 6px; background: #090d16; border: 1px solid var(--border-color); color: #fff; font-size: 0.9rem; margin-top: 4px;">
            </div>
            <div>
              <label style="font-size: 0.8rem; color: var(--text-muted);">Location</label>
              <input type="text" class="exp-input-location" data-index="${index}" value="${exp.location || ''}" placeholder="e.g. Remote / San Francisco, CA" style="width: 100%; padding: 8px 12px; border-radius: 6px; background: #090d16; border: 1px solid var(--border-color); color: #fff; font-size: 0.9rem; margin-top: 4px;">
            </div>
          </div>
          <div>
            <label style="font-size: 0.8rem; color: var(--text-muted);">Summary Description</label>
            <textarea class="exp-input-desc" data-index="${index}" rows="2" placeholder="Brief summary of responsibilities..." style="width: 100%; padding: 8px 12px; border-radius: 6px; background: #090d16; border: 1px solid var(--border-color); color: #fff; font-size: 0.9rem; margin-top: 4px; resize: vertical;">${exp.description || ''}</textarea>
          </div>
          <div>
            <label style="font-size: 0.8rem; color: var(--text-muted);">Key Highlights & Accomplishments (one bullet point per line)</label>
            <textarea class="exp-input-highlights" data-index="${index}" rows="5" placeholder="Enter each bullet point on a new line..." style="width: 100%; padding: 8px 12px; border-radius: 6px; background: #090d16; border: 1px solid var(--border-color); color: #fff; font-size: 0.9rem; margin-top: 4px; resize: vertical;">${(exp.highlights || []).join('\n')}</textarea>
          </div>
        </div>
      `;

      experienceContainer.appendChild(card);
    });
  };

  window.removeExperienceCard = (index) => {
    currentExperiences.splice(index, 1);
    renderExperienceEditor();
  };

  if (addExperienceBtn) {
    addExperienceBtn.addEventListener('click', () => {
      currentExperiences.push({
        role: 'Senior Software Engineer (Mobile, Flutter)',
        company: 'Bini Fintech Limited',
        duration: '07/2023 - Present',
        location: 'Dhaka, Bangladesh',
        description: 'Describe key responsibilities and impact...',
        highlights: ['Leading the Flutter development team...', 'Architecting and developing cross-platform applications...']
      });
      renderExperienceEditor();
    });
  }

  const collectExperienceData = () => {
    const roleInputs = document.querySelectorAll('.exp-input-role');
    const companyInputs = document.querySelectorAll('.exp-input-company');
    const durationInputs = document.querySelectorAll('.exp-input-duration');
    const locationInputs = document.querySelectorAll('.exp-input-location');
    const descInputs = document.querySelectorAll('.exp-input-desc');
    const highlightsInputs = document.querySelectorAll('.exp-input-highlights');

    const updatedExperiences = [];
    roleInputs.forEach((input, index) => {
      const role = input.value.trim();
      const company = companyInputs[index] ? companyInputs[index].value.trim() : '';
      const duration = durationInputs[index] ? durationInputs[index].value.trim() : '';
      const location = locationInputs[index] ? locationInputs[index].value.trim() : '';
      const description = descInputs[index] ? descInputs[index].value.trim() : '';
      const highlightsStr = highlightsInputs[index] ? highlightsInputs[index].value : '';
      const highlights = highlightsStr.split('\n').map(h => h.trim().replace(/^[•\-\*]\s*/, '')).filter(Boolean);

      if (role) {
        updatedExperiences.push({
          role,
          company,
          duration,
          location,
          description,
          highlights
        });
      }
    });

    return updatedExperiences;
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

        const skillsData = collectSkillsData();
        const projectsData = collectProjectsData();
        const experiencesData = collectExperienceData();

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
          formData.append('skills', JSON.stringify(skillsData));
          formData.append('projects', JSON.stringify(projectsData));
          formData.append('experiences', JSON.stringify(experiencesData));
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
            statUsers: statUsersInput ? statUsersInput.value.trim() : '',
            skills: skillsData,
            projects: projectsData,
            experiences: experiencesData
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
