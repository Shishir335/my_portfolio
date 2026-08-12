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
  const widget1TitleInput = document.getElementById('admin-widget1-title-input');
  const widget1SubtitleInput = document.getElementById('admin-widget1-subtitle-input');
  const widget2TitleInput = document.getElementById('admin-widget2-title-input');
  const widget2SubtitleInput = document.getElementById('admin-widget2-subtitle-input');
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

  const careerStartDateInput = document.getElementById('admin-career-startdate-input');
  let fpCareerInstance = null;

  const calculateYearsOfExp = (startDateStr) => {
    if (!startDateStr) return null;
    const startDate = new Date(startDateStr);
    if (isNaN(startDate.getTime())) return null;
    const now = new Date();
    let years = now.getFullYear() - startDate.getFullYear();
    const monthDiff = now.getMonth() - startDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < startDate.getDate())) {
      years--;
    }
    return years > 0 ? `${years}+` : '1+';
  };

  if (careerStartDateInput && typeof flatpickr !== 'undefined') {
    fpCareerInstance = flatpickr(careerStartDateInput, {
      dateFormat: 'Y-m-d',
      maxDate: 'today',
      defaultDate: '2020-01-01',
      altInput: true,
      altFormat: 'F j, Y',
      theme: 'dark',
      animate: true,
      disableMobile: true
    });

    const careerCalendarIcon = document.getElementById('career-calendar-icon-btn');
    if (careerCalendarIcon && fpCareerInstance) {
      careerCalendarIcon.addEventListener('click', () => fpCareerInstance.open());
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
      if (user.widget1Title && widget1TitleInput) widget1TitleInput.value = user.widget1Title;
      if (user.widget1Subtitle && widget1SubtitleInput) widget1SubtitleInput.value = user.widget1Subtitle;
      if (user.widget2Title && widget2TitleInput) widget2TitleInput.value = user.widget2Title;
      if (user.widget2Subtitle && widget2SubtitleInput) widget2SubtitleInput.value = user.widget2Subtitle;
      if (user.careerStartDate && careerStartDateInput) {
        if (fpCareerInstance) {
          try {
            fpCareerInstance.setDate(user.careerStartDate, false);
          } catch (e) {
            careerStartDateInput.value = user.careerStartDate;
          }
        } else {
          careerStartDateInput.value = user.careerStartDate;
        }
      }

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

  const escapeHtml = (str) => {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  };

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
          <button type="button" class="btn btn-sm btn-remove-skill" data-index="${index}" onclick="removeSkillCard(${index})" style="color: #ef4444; background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.2); padding: 4px 10px; cursor: pointer;">
            <i class="fa-solid fa-trash"></i> Remove
          </button>
        </div>
        <div style="display: flex; flex-direction: column; gap: 12px;">
          <div>
            <label style="font-size: 0.8rem; color: var(--text-muted);">Title</label>
            <input type="text" class="skill-input-title" data-index="${index}" value="${escapeHtml(skill.title || '')}" placeholder="e.g. Flutter & Dart Core" style="width: 100%; padding: 8px 12px; border-radius: 6px; background: #090d16; border: 1px solid var(--border-color); color: #fff; font-size: 0.9rem; margin-top: 4px;">
          </div>
          <div>
            <label style="font-size: 0.8rem; color: var(--text-muted);">Description</label>
            <textarea class="skill-input-desc" data-index="${index}" rows="2" placeholder="Describe key mastery focus..." style="width: 100%; padding: 8px 12px; border-radius: 6px; background: #090d16; border: 1px solid var(--border-color); color: #fff; font-size: 0.9rem; margin-top: 4px; resize: vertical;">${escapeHtml(skill.description || '')}</textarea>
          </div>
          <div>
            <label style="font-size: 0.8rem; color: var(--text-muted);">Tags (comma separated)</label>
            <input type="text" class="skill-input-tags" data-index="${index}" value="${escapeHtml((skill.tags || []).join(', '))}" placeholder="e.g. Flutter 3.x, Dart 3, Isolates" style="width: 100%; padding: 8px 12px; border-radius: 6px; background: #090d16; border: 1px solid var(--border-color); color: #fff; font-size: 0.9rem; margin-top: 4px;">
          </div>
        </div>
      `;

      skillsContainer.appendChild(card);
    });
  };

  const removeSkillCard = (index) => {
    currentSkills = collectSkillsData(true);
    currentSkills.splice(index, 1);
    renderSkillsEditor();
  };
  window.removeSkillCard = removeSkillCard;

  if (skillsContainer) {
    skillsContainer.addEventListener('click', (e) => {
      const btn = e.target.closest('.btn-remove-skill');
      if (btn) {
        e.preventDefault();
        e.stopPropagation();
        const idx = parseInt(btn.getAttribute('data-index'), 10);
        if (!isNaN(idx)) removeSkillCard(idx);
      }
    });
  }

  if (addSkillBtn) {
    addSkillBtn.addEventListener('click', () => {
      currentSkills = collectSkillsData(true);
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

  const collectSkillsData = (includeAll = false) => {
    const titleInputs = document.querySelectorAll('.skill-input-title');
    const descInputs = document.querySelectorAll('.skill-input-desc');
    const tagsInputs = document.querySelectorAll('.skill-input-tags');

    const updatedSkills = [];
    titleInputs.forEach((input, index) => {
      const title = input.value.trim();
      const description = descInputs[index] ? descInputs[index].value.trim() : '';
      const tagsStr = tagsInputs[index] ? tagsInputs[index].value : '';
      const tags = tagsStr.split(',').map(t => t.trim()).filter(Boolean);

      if (includeAll || title) {
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
  const selectedProjectFiles = {};
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
          <button type="button" class="btn btn-sm btn-remove-project" data-index="${index}" onclick="removeProjectCard(${index})" style="color: #ef4444; background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.2); padding: 4px 10px; cursor: pointer;">
            <i class="fa-solid fa-trash"></i> Remove
          </button>
        </div>
        <div style="display: flex; flex-direction: column; gap: 12px;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <div>
              <label style="font-size: 0.8rem; color: var(--text-muted);">Title</label>
              <input type="text" class="proj-input-title" data-index="${index}" value="${escapeHtml(proj.title || '')}" placeholder="e.g. CryptoPulse Dashboard" style="width: 100%; padding: 8px 12px; border-radius: 6px; background: #090d16; border: 1px solid var(--border-color); color: #fff; font-size: 0.9rem; margin-top: 4px;">
            </div>
            <div>
              <label style="font-size: 0.8rem; color: var(--text-muted);">Category / Badge</label>
              <input type="text" class="proj-input-badge" data-index="${index}" value="${escapeHtml(proj.badge || '')}" placeholder="e.g. Flutter & Web" style="width: 100%; padding: 8px 12px; border-radius: 6px; background: #090d16; border: 1px solid var(--border-color); color: #fff; font-size: 0.9rem; margin-top: 4px;">
            </div>
          </div>
          <div>
            <label style="font-size: 0.8rem; color: var(--text-muted);">Description</label>
            <textarea class="proj-input-desc" data-index="${index}" rows="2" placeholder="Describe key features & tech stack..." style="width: 100%; padding: 8px 12px; border-radius: 6px; background: #090d16; border: 1px solid var(--border-color); color: #fff; font-size: 0.9rem; margin-top: 4px; resize: vertical;">${escapeHtml(proj.description || '')}</textarea>
          </div>
          <div>
            <label style="font-size: 0.8rem; color: var(--text-muted);">Tags (comma separated)</label>
            <input type="text" class="proj-input-tags" data-index="${index}" value="${escapeHtml((proj.tags || []).join(', '))}" placeholder="e.g. Flutter 3.x, Riverpod, WebSockets" style="width: 100%; padding: 8px 12px; border-radius: 6px; background: #090d16; border: 1px solid var(--border-color); color: #fff; font-size: 0.9rem; margin-top: 4px;">
          </div>
          <div>
            <label style="font-size: 0.8rem; color: var(--text-muted);"><i class="fa-solid fa-image" style="color: var(--flutter-cyan); margin-right: 4px;"></i> Project Cover Image</label>
            <div style="display: flex; align-items: center; gap: 16px; margin-top: 6px; background: #090d16; padding: 12px; border-radius: 6px; border: 1px solid var(--border-color);">
              <img id="proj-img-preview-${index}" src="${escapeHtml(proj.image || '/img/app_showcase.png')}" alt="Preview" style="width: 100px; height: 60px; object-fit: cover; border-radius: 6px; border: 1px solid var(--border-color);" onerror="this.onerror=null; this.src='/img/app_showcase.png';">
              <div style="flex: 1; display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
                <label class="btn btn-sm btn-outline" style="cursor: pointer; display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px; font-size: 0.85rem;">
                  <i class="fa-solid fa-cloud-arrow-up"></i> Select New Image
                  <input type="file" class="proj-input-file" data-index="${index}" accept="image/*" style="display: none;">
                </label>
                <input type="hidden" class="proj-input-image" data-index="${index}" value="${escapeHtml(proj.image || '/img/app_showcase.png')}">
                <span id="proj-img-filename-${index}" style="font-size: 0.8rem; color: var(--text-muted);">${selectedProjectFiles[index] ? selectedProjectFiles[index].name : (proj.image ? 'Image set' : 'No image file uploaded')}</span>
              </div>
            </div>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <div>
              <label style="font-size: 0.8rem; color: var(--text-muted);"><i class="fa-brands fa-google-play" style="color: #34d399; margin-right: 4px;"></i> Google Play Store URL</label>
              <input type="text" class="proj-input-playstore" data-index="${index}" value="${escapeHtml(proj.playStoreLink || (proj.demoLink && proj.demoLink.includes('play.google') ? proj.demoLink : '') || '')}" placeholder="https://play.google.com/store/apps/details?id=..." style="width: 100%; padding: 8px 12px; border-radius: 6px; background: #090d16; border: 1px solid var(--border-color); color: #fff; font-size: 0.9rem; margin-top: 4px;">
            </div>
            <div>
              <label style="font-size: 0.8rem; color: var(--text-muted);"><i class="fa-brands fa-apple" style="color: #60a5fa; margin-right: 4px;"></i> Apple App Store URL</label>
              <input type="text" class="proj-input-appstore" data-index="${index}" value="${escapeHtml(proj.appStoreLink || (proj.demoLink && proj.demoLink.includes('apple') ? proj.demoLink : '') || '')}" placeholder="https://apps.apple.com/app/..." style="width: 100%; padding: 8px 12px; border-radius: 6px; background: #090d16; border: 1px solid var(--border-color); color: #fff; font-size: 0.9rem; margin-top: 4px;">
            </div>
          </div>
        </div>
      `;

      projectsContainer.appendChild(card);
    });
  };

  const removeProjectCard = (index) => {
    currentProjects = collectProjectsData(true);
    currentProjects.splice(index, 1);
    delete selectedProjectFiles[index];
    renderProjectsEditor();
  };
  window.removeProjectCard = removeProjectCard;

  if (projectsContainer) {
    projectsContainer.addEventListener('click', (e) => {
      const btn = e.target.closest('.btn-remove-project');
      if (btn) {
        e.preventDefault();
        e.stopPropagation();
        const idx = parseInt(btn.getAttribute('data-index'), 10);
        if (!isNaN(idx)) removeProjectCard(idx);
      }
    });

    projectsContainer.addEventListener('change', (e) => {
      if (e.target.classList.contains('proj-input-file')) {
        const index = parseInt(e.target.getAttribute('data-index'), 10);
        const file = e.target.files[0];
        if (file) {
          selectedProjectFiles[index] = file;
          const previewImg = document.getElementById(`proj-img-preview-${index}`);
          const filenameSpan = document.getElementById(`proj-img-filename-${index}`);
          if (filenameSpan) filenameSpan.textContent = file.name;
          if (previewImg) {
            const reader = new FileReader();
            reader.onload = (evt) => {
              previewImg.src = evt.target.result;
            };
            reader.readAsDataURL(file);
          }
        }
      }
    });
  }

  if (addProjectBtn) {
    addProjectBtn.addEventListener('click', () => {
      currentProjects = collectProjectsData(true);
      currentProjects.push({
        title: 'New Featured Project',
        badge: 'Mobile App',
        description: 'Describe application architecture and features...',
        image: '/img/app_showcase.png',
        tags: ['Flutter', 'Riverpod'],
        playStoreLink: 'https://play.google.com/store/apps',
        appStoreLink: 'https://apps.apple.com/app'
      });
      renderProjectsEditor();
    });
  }

  const collectProjectsData = (includeAll = false) => {
    const titleInputs = document.querySelectorAll('.proj-input-title');
    const badgeInputs = document.querySelectorAll('.proj-input-badge');
    const descInputs = document.querySelectorAll('.proj-input-desc');
    const tagsInputs = document.querySelectorAll('.proj-input-tags');
    const imageInputs = document.querySelectorAll('.proj-input-image');
    const playStoreInputs = document.querySelectorAll('.proj-input-playstore');
    const appStoreInputs = document.querySelectorAll('.proj-input-appstore');

    const updatedProjects = [];
    titleInputs.forEach((input, index) => {
      const title = input.value.trim();
      const badge = badgeInputs[index] ? badgeInputs[index].value.trim() : 'Mobile App';
      const description = descInputs[index] ? descInputs[index].value.trim() : '';
      const tagsStr = tagsInputs[index] ? tagsInputs[index].value : '';
      const tags = tagsStr.split(',').map(t => t.trim()).filter(Boolean);
      const imageVal = imageInputs[index] ? imageInputs[index].value.trim() : '';
      const image = imageVal || '/img/app_showcase.png';
      const playStoreLink = playStoreInputs[index] ? playStoreInputs[index].value.trim() : '';
      const appStoreLink = appStoreInputs[index] ? appStoreInputs[index].value.trim() : '';

      if (includeAll || title) {
        updatedProjects.push({
          title,
          badge,
          description,
          image,
          tags,
          playStoreLink,
          appStoreLink
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
          <button type="button" class="btn btn-sm btn-remove-exp" data-index="${index}" onclick="removeExperienceCard(${index})" style="color: #ef4444; background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.2); padding: 4px 10px; cursor: pointer;">
            <i class="fa-solid fa-trash"></i> Remove
          </button>
        </div>
        <div style="display: flex; flex-direction: column; gap: 12px;">
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <div>
              <label style="font-size: 0.8rem; color: var(--text-muted);">Job Role / Title</label>
              <input type="text" class="exp-input-role" data-index="${index}" value="${escapeHtml(exp.role || '')}" placeholder="e.g. Senior Flutter Engineer" style="width: 100%; padding: 8px 12px; border-radius: 6px; background: #090d16; border: 1px solid var(--border-color); color: #fff; font-size: 0.9rem; margin-top: 4px;">
            </div>
            <div>
              <label style="font-size: 0.8rem; color: var(--text-muted);">Company Name</label>
              <input type="text" class="exp-input-company" data-index="${index}" value="${escapeHtml(exp.company || '')}" placeholder="e.g. TechCorp Solutions" style="width: 100%; padding: 8px 12px; border-radius: 6px; background: #090d16; border: 1px solid var(--border-color); color: #fff; font-size: 0.9rem; margin-top: 4px;">
            </div>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
            <div>
              <label style="font-size: 0.8rem; color: var(--text-muted);">Duration / Timeline</label>
              <input type="text" class="exp-input-duration" data-index="${index}" value="${escapeHtml(exp.duration || '')}" placeholder="e.g. 2022 - Present" style="width: 100%; padding: 8px 12px; border-radius: 6px; background: #090d16; border: 1px solid var(--border-color); color: #fff; font-size: 0.9rem; margin-top: 4px;">
            </div>
            <div>
              <label style="font-size: 0.8rem; color: var(--text-muted);">Location</label>
              <input type="text" class="exp-input-location" data-index="${index}" value="${escapeHtml(exp.location || '')}" placeholder="e.g. Remote / San Francisco, CA" style="width: 100%; padding: 8px 12px; border-radius: 6px; background: #090d16; border: 1px solid var(--border-color); color: #fff; font-size: 0.9rem; margin-top: 4px;">
            </div>
          </div>
          <div>
            <label style="font-size: 0.8rem; color: var(--text-muted);">Summary Description</label>
            <textarea class="exp-input-desc" data-index="${index}" rows="2" placeholder="Brief summary of responsibilities..." style="width: 100%; padding: 8px 12px; border-radius: 6px; background: #090d16; border: 1px solid var(--border-color); color: #fff; font-size: 0.9rem; margin-top: 4px; resize: vertical;">${escapeHtml(exp.description || '')}</textarea>
          </div>
          <div>
            <label style="font-size: 0.8rem; color: var(--text-muted);">Key Highlights & Accomplishments (one bullet point per line)</label>
            <textarea class="exp-input-highlights" data-index="${index}" rows="5" placeholder="Enter each bullet point on a new line..." style="width: 100%; padding: 8px 12px; border-radius: 6px; background: #090d16; border: 1px solid var(--border-color); color: #fff; font-size: 0.9rem; margin-top: 4px; resize: vertical;">${escapeHtml((exp.highlights || []).join('\n'))}</textarea>
          </div>
        </div>
      `;

      experienceContainer.appendChild(card);
    });
  };

  const removeExperienceCard = (index) => {
    currentExperiences = collectExperienceData(true);
    currentExperiences.splice(index, 1);
    renderExperienceEditor();
  };
  window.removeExperienceCard = removeExperienceCard;

  if (experienceContainer) {
    experienceContainer.addEventListener('click', (e) => {
      const btn = e.target.closest('.btn-remove-exp');
      if (btn) {
        e.preventDefault();
        e.stopPropagation();
        const idx = parseInt(btn.getAttribute('data-index'), 10);
        if (!isNaN(idx)) removeExperienceCard(idx);
      }
    });
  }

  if (addExperienceBtn) {
    addExperienceBtn.addEventListener('click', () => {
      currentExperiences = collectExperienceData(true);
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

  const collectExperienceData = (includeAll = false) => {
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

      if (includeAll || role) {
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

        const hasProjectFiles = Object.keys(selectedProjectFiles).some(idx => selectedProjectFiles[idx]);

        if (selectedPhotoFile || hasProjectFiles) {
          const formData = new FormData();
          formData.append('name', nameVal);
          if (birthVal) formData.append('birthDate', birthVal);
          formData.append('gender', genderVal);

          if (aboutBadgeInput) formData.append('aboutBadge', aboutBadgeInput.value.trim());
          if (aboutTitleInput) formData.append('aboutTitle', aboutTitleInput.value.trim());
          if (aboutBioInput) formData.append('aboutBio', aboutBioInput.value.trim());
          if (widget1TitleInput) formData.append('widget1Title', widget1TitleInput.value.trim());
          if (widget1SubtitleInput) formData.append('widget1Subtitle', widget1SubtitleInput.value.trim());
          if (widget2TitleInput) formData.append('widget2Title', widget2TitleInput.value.trim());
          if (widget2SubtitleInput) formData.append('widget2Subtitle', widget2SubtitleInput.value.trim());
          if (careerStartDateInput && careerStartDateInput.value) {
            formData.append('careerStartDate', careerStartDateInput.value.trim());
          }
          if (statAppsInput) formData.append('statApps', statAppsInput.value.trim());
          if (statCrashFreeInput) formData.append('statCrashFree', statCrashFreeInput.value.trim());
          if (statUsersInput) formData.append('statUsers', statUsersInput.value.trim());
          formData.append('skills', JSON.stringify(skillsData));
          formData.append('projects', JSON.stringify(projectsData));
          formData.append('experiences', JSON.stringify(experiencesData));

          if (selectedPhotoFile) {
            formData.append('photo', selectedPhotoFile);
          }

          Object.keys(selectedProjectFiles).forEach(idx => {
            if (selectedProjectFiles[idx]) {
              formData.append(`project_image_${idx}`, selectedProjectFiles[idx]);
            }
          });

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
            widget1Title: widget1TitleInput ? widget1TitleInput.value.trim() : '',
            widget1Subtitle: widget1SubtitleInput ? widget1SubtitleInput.value.trim() : '',
            widget2Title: widget2TitleInput ? widget2TitleInput.value.trim() : '',
            widget2Subtitle: widget2SubtitleInput ? widget2SubtitleInput.value.trim() : '',
            careerStartDate: careerStartDateInput && careerStartDateInput.value ? careerStartDateInput.value.trim() : null,
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

  // 5. Messages Inbox Management
  const messagesContainer = document.getElementById('admin-messages-container');
  const refreshMessagesBtn = document.getElementById('refresh-messages-btn');
  const unreadBadge = document.getElementById('admin-unread-badge');

  const fetchContactMessages = async () => {
    const token = getToken();
    if (!token || !messagesContainer) return;

    try {
      const res = await fetch('/api/v1/admin/messages', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();

      if (res.ok && data && data.data && Array.isArray(data.data.messages)) {
        const messages = data.data.messages;

        if (messages.length === 0) {
          messagesContainer.innerHTML = `
            <div style="text-align: center; padding: 40px 20px; color: var(--text-muted);">
              <i class="fa-solid fa-inbox" style="font-size: 2.5rem; margin-bottom: 12px; opacity: 0.5;"></i>
              <p>No messages received yet. Messages submitted via the 'Get In Touch' form will appear here.</p>
            </div>
          `;
          if (unreadBadge) unreadBadge.style.display = 'none';
          return;
        }

        let unreadCount = 0;
        messagesContainer.innerHTML = '';
        messages.forEach(msg => {
          if (!msg.isRead) unreadCount++;
          const dateStr = new Date(msg.createdAt).toLocaleString();

          const card = document.createElement('div');
          card.style.cssText = `background: rgba(15, 23, 42, 0.6); border: 1px solid ${msg.isRead ? 'var(--border-color)' : 'var(--flutter-cyan)'}; border-radius: 10px; padding: 18px; position: relative; transition: all 0.2s ease;`;

          card.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; margin-bottom: 10px;">
              <div>
                <h4 style="font-size: 1.05rem; font-weight: 700; color: #fff; margin-bottom: 2px;">${msg.name}</h4>
                <a href="mailto:${msg.email}" style="font-size: 0.88rem; color: var(--flutter-cyan); text-decoration: none;"><i class="fa-solid fa-envelope"></i> ${msg.email}</a>
              </div>
              <div style="display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 0.8rem; color: var(--text-muted);">${dateStr}</span>
                <button type="button" class="btn btn-sm" style="color: #ef4444; background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.2); padding: 4px 10px;" onclick="deleteContactMsg('${msg._id}')">
                  <i class="fa-solid fa-trash"></i>
                </button>
              </div>
            </div>
            ${msg.subject ? `<div style="font-size: 0.9rem; font-weight: 600; color: var(--text-main); margin-bottom: 8px;">Subject: ${msg.subject}</div>` : ''}
            <div style="font-size: 0.92rem; color: var(--text-muted); line-height: 1.6; white-space: pre-wrap; background: #090d16; padding: 12px; border-radius: 6px; border: 1px solid var(--border-color);">${msg.message}</div>
          `;

          messagesContainer.appendChild(card);
        });

        if (unreadBadge) {
          if (unreadCount > 0) {
            unreadBadge.textContent = unreadCount;
            unreadBadge.style.display = 'inline-block';
          } else {
            unreadBadge.style.display = 'none';
          }
        }
      }
    } catch (err) {
      console.error('Fetch messages error:', err);
    }
  };

  window.deleteContactMsg = async (id) => {
    if (!confirm('Are you sure you want to delete this message?')) return;
    const token = getToken();
    if (!token) return;

    try {
      const res = await fetch(`/api/v1/admin/messages/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        showToast('Message deleted successfully', 'success');
        fetchContactMessages();
      } else {
        showToast('Failed to delete message', 'error');
      }
    } catch (e) {
      showToast('Error deleting message', 'error');
    }
  };

  if (refreshMessagesBtn) {
    refreshMessagesBtn.addEventListener('click', fetchContactMessages);
  }

  // Also fetch messages on tab switch to tab-messages
  drawerBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      if (btn.getAttribute('data-tab') === 'tab-messages') {
        fetchContactMessages();
      }
    });
  });

  // Change Password Handler
  const currentPasswordInput = document.getElementById('current-password-input');
  const newPasswordInput = document.getElementById('new-password-input');
  const confirmPasswordInput = document.getElementById('confirm-password-input');
  const changePasswordBtn = document.getElementById('change-password-btn');

  if (changePasswordBtn) {
    changePasswordBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      const currentPassword = currentPasswordInput ? currentPasswordInput.value : '';
      const password = newPasswordInput ? newPasswordInput.value : '';
      const confirmPassword = confirmPasswordInput ? confirmPasswordInput.value : '';

      if (!currentPassword || !password || !confirmPassword) {
        showToast('Please fill in all password fields.', 'error');
        return;
      }

      if (password !== confirmPassword) {
        showToast('New passwords do not match!', 'error');
        return;
      }

      if (password.length < 8) {
        showToast('New password must be at least 8 characters long.', 'error');
        return;
      }

      const token = getToken();
      if (!token) return;

      changePasswordBtn.disabled = true;
      changePasswordBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Updating...';

      try {
        const res = await fetch('/api/v1/admin/change-password', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ currentPassword, password, confirmPassword })
        });

        const data = await res.json();

        if (res.ok && data.status === 'success') {
          showToast('Password changed successfully!', 'success');
          if (data.token) {
            setToken(data.token);
          }
          if (currentPasswordInput) currentPasswordInput.value = '';
          if (newPasswordInput) newPasswordInput.value = '';
          if (confirmPasswordInput) confirmPasswordInput.value = '';
        } else {
          showToast(data.message || 'Failed to update password.', 'error');
        }
      } catch (err) {
        showToast('An error occurred while updating password.', 'error');
      } finally {
        changePasswordBtn.disabled = false;
        changePasswordBtn.innerHTML = '<i class="fa-solid fa-shield-halved"></i> Update Password';
      }
    });
  }

  // Initialize Auth Check
  checkAuth().then(() => fetchContactMessages());
});
