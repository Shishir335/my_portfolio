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

  // 2. Contact Form Submission (Toast Simulation)
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      alert('Thank you for reaching out! Your message has been sent successfully. I will get back to you shortly.');
      contactForm.reset();
    });
  }

  // 4. Hero Avatar Loading with Shimmer Effect
  const heroAvatarImg = document.getElementById('hero-avatar-img');
  const avatarContainer = document.getElementById('avatar-container') || (heroAvatarImg ? heroAvatarImg.parentElement : null);

  if (heroAvatarImg) {
    if (avatarContainer) avatarContainer.classList.add('shimmer-loading');
    heroAvatarImg.style.opacity = '0';

    fetch('/api/v1/admin/public-profile')
      .then(res => res.json())
      .then(resData => {
        if (resData.status === 'success' && resData.data) {
          const d = resData.data;
          const badgeEl = document.getElementById('hero-badge-text');
          const titleEl = document.getElementById('hero-title-text');
          const bioEl = document.getElementById('hero-subtitle-text');
          const yearsEl = document.getElementById('stat-years-exp');
          const appsEl = document.getElementById('stat-apps-count');
          const crashEl = document.getElementById('stat-crash-free');
          const usersEl = document.getElementById('stat-active-users');

          if (d.aboutBadge && badgeEl) badgeEl.textContent = d.aboutBadge;
          if (d.aboutTitle && titleEl) titleEl.textContent = d.aboutTitle;
          if (d.aboutBio && bioEl) bioEl.textContent = d.aboutBio;
          if (d.statYearsExp && yearsEl) yearsEl.textContent = d.statYearsExp;
          if (d.statApps && appsEl) appsEl.textContent = d.statApps;
          if (d.statCrashFree && crashEl) crashEl.textContent = d.statCrashFree;
          if (d.statUsers && usersEl) usersEl.textContent = d.statUsers;

          if (d.skills && Array.isArray(d.skills) && d.skills.length > 0) {
            const skillsContainer = document.getElementById('skills-cards-container');
            if (skillsContainer) {
              skillsContainer.innerHTML = '';
              d.skills.forEach(skill => {
                const card = document.createElement('div');
                card.className = 'skill-card';

                const tagsHtml = (skill.tags || []).map(tag => `<span class="skill-tag">${tag}</span>`).join('');
                const icon = skill.icon || 'fa-solid fa-code';
                const color = skill.color || '#00D2FF';

                card.innerHTML = `
                  <div class="skill-icon-box" style="color: ${color}; background: ${color}1a;"><i class="${icon}"></i></div>
                  <h3 class="skill-title">${skill.title || ''}</h3>
                  <p class="project-desc">${skill.description || ''}</p>
                  <div class="skill-tags">
                    ${tagsHtml}
                  </div>
                `;
                skillsContainer.appendChild(card);
              });
            }
          }

          if (d.projects && Array.isArray(d.projects) && d.projects.length > 0) {
            const projectsContainer = document.getElementById('projects-cards-container');
            if (projectsContainer) {
              projectsContainer.innerHTML = '';
              d.projects.forEach(proj => {
                const card = document.createElement('div');
                card.className = 'project-card';

                const tagsHtml = (proj.tags || []).map(tag => `<span class="tech-badge">${tag}</span>`).join('');
                const img = proj.image || '/img/app_showcase.png';
                const demoLink = proj.demoLink || proj.githubLink || '#';

                card.innerHTML = `
                  <div class="project-img-wrapper">
                    <img src="${img}" alt="${proj.title || 'Project'}" class="project-img">
                    <div class="project-overlay">
                      <a href="${demoLink}" target="_blank" rel="noopener" class="btn btn-primary"><i class="fa-solid fa-eye"></i> View Project</a>
                    </div>
                  </div>
                  <div class="project-info">
                    <span class="project-category">${proj.badge || 'Mobile App'}</span>
                    <h3 class="project-name">${proj.title || ''}</h3>
                    <p class="project-desc">${proj.description || ''}</p>
                    <div class="project-tech">
                      ${tagsHtml}
                    </div>
                  </div>
                `;
                projectsContainer.appendChild(card);
              });
            }
          }
        }

        const photoUrl = (resData.status === 'success' && resData.data && resData.data.photo)
          ? resData.data.photo
          : '/img/avatar.png';

        // Preload image before displaying to avoid any visual flicker
        const imgPreloader = new Image();
        imgPreloader.src = photoUrl;
        imgPreloader.onload = () => {
          heroAvatarImg.src = photoUrl;
          if (avatarContainer) avatarContainer.classList.remove('shimmer-loading');
          heroAvatarImg.style.opacity = '1';
        };
        imgPreloader.onerror = () => {
          heroAvatarImg.src = '/img/avatar.png';
          if (avatarContainer) avatarContainer.classList.remove('shimmer-loading');
          heroAvatarImg.style.opacity = '1';
        };
      })
      .catch(() => {
        const fallbackUrl = '/img/avatar.png';
        const imgPreloader = new Image();
        imgPreloader.src = fallbackUrl;
        imgPreloader.onload = () => {
          heroAvatarImg.src = fallbackUrl;
          if (avatarContainer) avatarContainer.classList.remove('shimmer-loading');
          heroAvatarImg.style.opacity = '1';
        };
      });
  }

  // 5. ScrollSpy & Navigation Indicator Update
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');

  const updateActiveNavLink = () => {
    let currentSectionId = '';
    const scrollPos = window.scrollY + 220;

    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        currentSectionId = section.getAttribute('id');
      }
    });

    if (currentSectionId) {
      navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${currentSectionId}`) {
          link.classList.add('active');
        }
      });
    }
  };

  window.addEventListener('scroll', updateActiveNavLink);
  updateActiveNavLink();
});
