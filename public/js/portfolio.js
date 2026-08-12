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

  // 2. Real Contact Form Submission
  const contactForm = document.getElementById('contact-form');
  const nameInput = document.getElementById('contact-name-input');
  const emailInput = document.getElementById('contact-email-input');
  const messageInput = document.getElementById('contact-message-input');
  const submitBtn = document.getElementById('contact-submit-btn');

  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!nameInput || !emailInput || !messageInput) return;

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Sending Message...';
      }

      try {
        const res = await fetch('/api/v1/admin/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: nameInput.value.trim(),
            email: emailInput.value.trim(),
            message: messageInput.value.trim()
          })
        });

        const data = await res.json();
        if (res.ok && data.status === 'success') {
          alert('Thank you for reaching out! Your message has been saved to the Admin Inbox.');
          contactForm.reset();
        } else {
          alert(data.message || 'Failed to send message. Please try again.');
        }
      } catch (err) {
        console.error('Contact form submission error:', err);
        alert('Connection error. Please try again later.');
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Send Message';
        }
      }
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
          const widget1TitleEl = document.getElementById('widget1-title-text');
          const widget1SubtitleEl = document.getElementById('widget1-subtitle-text');
          const widget2TitleEl = document.getElementById('widget2-title-text');
          const widget2SubtitleEl = document.getElementById('widget2-subtitle-text');
          const yearsEl = document.getElementById('stat-years-exp');
          const appsEl = document.getElementById('stat-apps-count');
          const crashEl = document.getElementById('stat-crash-free');
          const usersEl = document.getElementById('stat-active-users');

          if (d.aboutBadge && badgeEl) badgeEl.textContent = d.aboutBadge;
          if (d.aboutTitle && titleEl) titleEl.textContent = d.aboutTitle;
          if (d.aboutBio && bioEl) bioEl.textContent = d.aboutBio;
          if (d.widget1Title && widget1TitleEl) widget1TitleEl.textContent = d.widget1Title;
          if (d.widget1Subtitle && widget1SubtitleEl) widget1SubtitleEl.textContent = d.widget1Subtitle;
          if (d.widget2Title && widget2TitleEl) widget2TitleEl.textContent = d.widget2Title;
          if (d.widget2Subtitle && widget2SubtitleEl) widget2SubtitleEl.textContent = d.widget2Subtitle;
          
          if (d.careerStartDate && yearsEl) {
            const startDate = new Date(d.careerStartDate);
            if (!isNaN(startDate.getTime())) {
              const now = new Date();
              let yrs = now.getFullYear() - startDate.getFullYear();
              const monthDiff = now.getMonth() - startDate.getMonth();
              if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < startDate.getDate())) {
                yrs--;
              }
              yearsEl.textContent = yrs > 0 ? `${yrs}+` : '1+';
            }
          }

          if (d.statApps && appsEl) appsEl.textContent = d.statApps;
          if (d.statCrashFree && crashEl) crashEl.textContent = d.statCrashFree;
          if (d.statUsers && usersEl) usersEl.textContent = d.statUsers;

          if (d.socialLinks) {
            const githubEl = document.getElementById('social-github-link');
            const linkedinEl = document.getElementById('social-linkedin-link');
            const facebookEl = document.getElementById('social-facebook-link');
            const whatsappEl = document.getElementById('social-whatsapp-link');
            const emailEl = document.getElementById('social-email-link');

            if (d.socialLinks.github && githubEl) githubEl.href = d.socialLinks.github;
            if (d.socialLinks.linkedin && linkedinEl) linkedinEl.href = d.socialLinks.linkedin;
            if (d.socialLinks.facebook && facebookEl) facebookEl.href = d.socialLinks.facebook;
            if (d.socialLinks.whatsapp && whatsappEl) {
              const wa = d.socialLinks.whatsapp.trim();
              whatsappEl.href = wa.startsWith('http') || wa.startsWith('https') ? wa : `https://wa.me/${wa.replace(/[^0-9]/g, '')}`;
            }
            if (d.socialLinks.email && emailEl) {
              const em = d.socialLinks.email.trim();
              emailEl.href = em.startsWith('mailto:') ? em : `mailto:${em}`;
            }
          }

          const footerTextEl = document.getElementById('footer-copyright-text');
          if (d.footerText && footerTextEl) {
            footerTextEl.textContent = d.footerText;
          }

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
                const img = (proj.image && proj.image.trim()) ? proj.image.trim() : '/img/app_showcase.png';

                // Determine Play Store and App Store URLs
                let playStore = proj.playStoreLink || (proj.demoLink && proj.demoLink.includes('play.google') ? proj.demoLink : '');
                let appStore = proj.appStoreLink || (proj.demoLink && proj.demoLink.includes('apple') ? proj.demoLink : '');

                // Fallbacks if neither is explicit
                if (!playStore && !appStore) {
                  playStore = proj.demoLink || 'https://play.google.com/store/apps';
                  appStore = 'https://apps.apple.com/app';
                }

                let storeButtonsHtml = '';
                if (playStore) {
                  storeButtonsHtml += `<a href="${playStore}" target="_blank" rel="noopener" class="btn-store btn-playstore"><i class="fa-brands fa-google-play"></i> Play Store</a>`;
                }
                if (appStore) {
                  storeButtonsHtml += `<a href="${appStore}" target="_blank" rel="noopener" class="btn-store btn-appstore"><i class="fa-brands fa-apple"></i> App Store</a>`;
                }

                card.innerHTML = `
                  <div class="project-img-wrapper">
                    <img src="${img}" alt="${proj.title || 'Project'}" class="project-img" onerror="this.onerror=null; this.src='/img/app_showcase.png';">
                    <div class="project-overlay">
                      <div class="store-buttons-wrapper">
                        ${storeButtonsHtml}
                      </div>
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

          if (d.experiences && Array.isArray(d.experiences) && d.experiences.length > 0) {
            const expContainer = document.getElementById('experience-timeline-container');
            if (expContainer) {
              expContainer.innerHTML = '';
              d.experiences.forEach(exp => {
                const item = document.createElement('div');
                item.className = 'timeline-item';

                const highlightsHtml = (exp.highlights || []).map(h => `
                  <li><span>${h}</span></li>
                `).join('');

                item.innerHTML = `
                  <div class="timeline-dot"></div>
                  <div class="timeline-card">
                    <div class="timeline-header">
                      <h3 class="timeline-role">${exp.role || ''}</h3>
                      <span class="timeline-duration">${exp.duration || ''}</span>
                    </div>
                    <div class="timeline-subheader">
                      <span class="timeline-company">${exp.company || ''}</span>
                      ${exp.location ? `<span class="timeline-location">${exp.location}</span>` : ''}
                    </div>
                    ${highlightsHtml ? `<ul class="timeline-highlights-list">${highlightsHtml}</ul>` : ''}
                  </div>
                `;
                expContainer.appendChild(item);
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
