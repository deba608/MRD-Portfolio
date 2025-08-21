// Portfolio Website JavaScript - 3D Interactive Experience

class PortfolioWebsite {
    constructor() {
        this.currentTheme = localStorage.getItem('theme') || 'light';
        this.currentProjectIndex = 0;
        this.isMenuOpen = false;
        this.particles = [];
        this.mouse = { x: 0, y: 0 };

        this.init();
    }

    init() {
        this.loadData();
        this.setupTheme();
        this.setupEventListeners();
        this.setupAnimations();
        this.setupParticles();
        this.setupCustomCursor();
        this.setupIntersectionObserver();
        this.setupMagneticEffect();
        this.populateContent();

        // Hide loading screen after everything is loaded
        setTimeout(() => {
            const loading = document.querySelector('.loading');
            if (loading) {
                loading.classList.add('hide');
                setTimeout(() => loading.remove(), 500);
            }
        }, 1000);
    }

    loadData() {
        // Data will be loaded from data.js file
        if (typeof portfolioData !== 'undefined') {
            this.data = portfolioData;
            console.log('Data loaded successfully:', this.data);
        } else {
            console.error('Portfolio data not found!');
        }
    }

    setupTheme() {
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        const themeToggle = document.getElementById('theme-toggle');
        const icon = themeToggle.querySelector('i');

        if (this.currentTheme === 'dark') {
            icon.classList.replace('fa-moon', 'fa-sun');
        } else {
            icon.classList.replace('fa-sun', 'fa-moon');
        }
    }

    setupEventListeners() {
        // Theme Toggle
        const themeToggle = document.getElementById('theme-toggle');
        themeToggle.addEventListener('click', () => this.toggleTheme());

        // Menu Toggle
        const menuToggle = document.getElementById('menu-toggle');
        menuToggle.addEventListener('click', () => this.toggleMenu());

        // Navigation Links
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => this.handleNavigation(e));
        });

        // Smooth Scrolling
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = anchor.getAttribute('href');
                const target = document.querySelector(targetId);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });

        // Project Carousel
        const prevBtn = document.getElementById('prev-project');
        const nextBtn = document.getElementById('next-project');
        if (prevBtn) prevBtn.addEventListener('click', () => this.prevProject());
        if (nextBtn) nextBtn.addEventListener('click', () => this.nextProject());

        // Contact Form
        const contactForm = document.getElementById('contact-form');
        if (contactForm) {
            contactForm.addEventListener('submit', (e) => this.handleContactForm(e));
        }

        // Download CV
        const downloadCV = document.getElementById('download-cv');
        if (downloadCV) {
            downloadCV.addEventListener('click', () => this.downloadCV());
        }

        // Mouse Events for Custom Cursor and Magnetic Effect
        document.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        document.addEventListener('scroll', () => this.handleScroll());
        window.addEventListener('resize', () => this.handleResize());
    }

    setupAnimations() {
        // Glitch text effect
        const glitchText = document.querySelector('.glitch-text');
        if (glitchText) {
            setInterval(() => {
                if (Math.random() > 0.95) {
                    glitchText.style.animation = 'none';
                    setTimeout(() => {
                        glitchText.style.animation = '';
                    }, 100);
                }
            }, 1000);
        }

        // Floating animations for various elements
        this.setupFloatingAnimations();

        // Text reveal animations
        this.setupTextRevealAnimations();
    }

    setupFloatingAnimations() {
        const floatingElements = document.querySelectorAll('.floating');
        floatingElements.forEach(element => {
            const randomDelay = Math.random() * 2;
            element.style.animationDelay = `${randomDelay}s`;
        });
    }

    setupTextRevealAnimations() {
        // Animated text reveal for hero section
        const heroName = document.getElementById('hero-name');
        if (heroName && this.data) {
            const name = this.data.personal.name;
            heroName.textContent = '';

            name.split('').forEach((char, index) => {
                const span = document.createElement('span');
                span.textContent = char === ' ' ? '\u00A0' : char;
                span.style.animationDelay = `${index * 0.1}s`;
                span.style.opacity = '0';
                span.style.animation = 'letterReveal 0.5s ease forwards';
                heroName.appendChild(span);
            });
        }
    }

    setupParticles() {
        const canvas = document.getElementById('particles-canvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        // Create particles
        for (let i = 0; i < 100; i++) {
            this.particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2,
                radius: Math.random() * 3 + 1,
                opacity: Math.random() * 0.5 + 0.3
            });
        }

        this.animateParticles(ctx, canvas);
    }

    animateParticles(ctx, canvas) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const theme = document.documentElement.getAttribute('data-theme');
        const particleColor = theme === 'dark' ? '255, 255, 255' : '102, 126, 234';

        this.particles.forEach(particle => {
            // Update position
            particle.x += particle.vx;
            particle.y += particle.vy;

            // Wrap around edges
            if (particle.x < 0) particle.x = canvas.width;
            if (particle.x > canvas.width) particle.x = 0;
            if (particle.y < 0) particle.y = canvas.height;
            if (particle.y > canvas.height) particle.y = 0;

            // Mouse interaction
            const dx = this.mouse.x - particle.x;
            const dy = this.mouse.y - particle.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 100) {
                particle.x -= dx * 0.01;
                particle.y -= dy * 0.01;
            }

            // Draw particle
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${particleColor}, ${particle.opacity})`;
            ctx.fill();
        });

        // Draw connections
        this.particles.forEach((particle, i) => {
            for (let j = i + 1; j < this.particles.length; j++) {
                const other = this.particles[j];
                const dx = particle.x - other.x;
                const dy = particle.y - other.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 100) {
                    ctx.beginPath();
                    ctx.moveTo(particle.x, particle.y);
                    ctx.lineTo(other.x, other.y);
                    ctx.strokeStyle = `rgba(${particleColor}, ${0.1 * (1 - distance / 100)})`;
                    ctx.stroke();
                }
            }
        });

        requestAnimationFrame(() => this.animateParticles(ctx, canvas));
    }

    setupCustomCursor() {
        const cursor = document.querySelector('.cursor');
        const follower = document.querySelector('.cursor-follower');

        // Only setup custom cursor on devices that support hover
        if (!cursor || !follower || !window.matchMedia('(hover: hover)').matches) {
            if (cursor) cursor.style.display = 'none';
            if (follower) follower.style.display = 'none';
            return;
        }

        let mouseX = 0, mouseY = 0;
        let followerX = 0, followerY = 0;

        // Animate cursor follower
        const animateFollower = () => {
            followerX += (mouseX - followerX) * 0.1;
            followerY += (mouseY - followerY) * 0.1;

            follower.style.left = followerX - 20 + 'px';
            follower.style.top = followerY - 20 + 'px';

            requestAnimationFrame(animateFollower);
        };

        animateFollower();

        // Cursor interactions
        const interactiveElements = document.querySelectorAll('a, button, .nav-link, .project-card, .skill-card');

        interactiveElements.forEach(element => {
            element.addEventListener('mouseenter', () => {
                cursor.style.transform = 'scale(1.5)';
                follower.style.transform = 'scale(1.2)';
            });

            element.addEventListener('mouseleave', () => {
                cursor.style.transform = 'scale(1)';
                follower.style.transform = 'scale(1)';
            });
        });
    }

    setupIntersectionObserver() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');

                    // Animate skill progress bars
                    if (entry.target.classList.contains('skill-card')) {
                        const progressBar = entry.target.querySelector('.skill-progress-bar');
                        if (progressBar) {
                            const width = progressBar.dataset.width || '80';
                            setTimeout(() => {
                                progressBar.style.width = width + '%';
                            }, 200);
                        }
                    }

                    // Update navigation
                    this.updateActiveNavLink(entry.target.id);
                }
            });
        }, observerOptions);

        // Observe sections and animated elements
        const sections = document.querySelectorAll('section');
        const animatedElements = document.querySelectorAll('.fade-in, .slide-in-left, .slide-in-right, .scale-in');

        sections.forEach(section => observer.observe(section));
        animatedElements.forEach(element => observer.observe(element));
    }

    setupMagneticEffect() {
        const magneticElements = document.querySelectorAll('.btn-3d, .social-link, .carousel-btn');

        magneticElements.forEach(element => {
            element.classList.add('magnetic');

            // Only add magnetic effect on devices that support hover
            if (window.matchMedia('(hover: hover)').matches) {
                element.addEventListener('mousemove', (e) => {
                    const rect = element.getBoundingClientRect();
                    const x = e.clientX - rect.left - rect.width / 2;
                    const y = e.clientY - rect.top - rect.height / 2;

                    const strength = 0.3;
                    element.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
                });

                element.addEventListener('mouseleave', () => {
                    element.style.transform = 'translate(0px, 0px)';
                });
            }
        });
    }

    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        localStorage.setItem('theme', this.currentTheme);

        const themeToggle = document.getElementById('theme-toggle');
        const icon = themeToggle.querySelector('i');

        if (this.currentTheme === 'dark') {
            icon.classList.replace('fa-moon', 'fa-sun');
        } else {
            icon.classList.replace('fa-sun', 'fa-moon');
        }
    }

    toggleMenu() {
        this.isMenuOpen = !this.isMenuOpen;
        const navLinks = document.querySelector('.nav-links');
        const menuToggle = document.getElementById('menu-toggle');

        if (this.isMenuOpen) {
            navLinks.classList.add('active');
            menuToggle.classList.add('active');
        } else {
            navLinks.classList.remove('active');
            menuToggle.classList.remove('active');
        }
    }

    handleNavigation(e) {
        e.preventDefault();
        const targetId = e.target.getAttribute('href');
        const target = document.querySelector(targetId);

        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });

            // Close mobile menu if open
            if (this.isMenuOpen) {
                this.toggleMenu();
            }
        }
    }

    updateActiveNavLink(activeId) {
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${activeId}`) {
                link.classList.add('active');
            }
        });
    }

    handleMouseMove(e) {
        this.mouse.x = e.clientX;
        this.mouse.y = e.clientY;

        // Update custom cursor
        const cursor = document.querySelector('.cursor');
        if (cursor && window.matchMedia('(hover: hover)').matches) {
            cursor.style.left = e.clientX - 10 + 'px';
            cursor.style.top = e.clientY - 10 + 'px';
        }

        // Parallax effect for hero section
        const heroSection = document.querySelector('.home-section');
        if (heroSection && window.matchMedia('(hover: hover)').matches) {
            const x = (e.clientX - window.innerWidth / 2) * 0.01;
            const y = (e.clientY - window.innerHeight / 2) * 0.01;
            heroSection.style.transform = `translate(${x}px, ${y}px)`;
        }
    }

    handleScroll() {
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.5;

        // Parallax effect for background
        const particlesCanvas = document.getElementById('particles-canvas');
        if (particlesCanvas) {
            particlesCanvas.style.transform = `translateY(${rate}px)`;
        }

        // Header background opacity
        const nav = document.querySelector('.nav-container');
        if (nav) {
            const opacity = Math.min(scrolled / 100, 1);
            nav.style.backgroundColor = `rgba(var(--glass-bg), ${0.25 + opacity * 0.75})`;
        }
    }

    handleResize() {
        const canvas = document.getElementById('particles-canvas');
        if (canvas) {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        
        // Close mobile menu on resize to larger screen
        if (window.innerWidth > 1024 && this.isMenuOpen) {
            this.toggleMenu();
        }
        
        // Add smooth scroll behavior
        const offset = 80; // Account for fixed header
        const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - offset;
        
        window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
        });
        
        // Update particle count based on screen size
        this.updateParticleCount();
    }
    
    updateParticleCount() {
        const canvas = document.getElementById('particles-canvas');
        if (!canvas) return;
        
        // Reduce particles on smaller screens for better performance
        const screenWidth = window.innerWidth;
        let targetCount = 100;
        
        if (screenWidth < 480) {
            targetCount = 30;
        } else if (screenWidth < 768) {
            targetCount = 50;
        } else if (screenWidth < 1024) {
            targetCount = 70;
        }
        
        // Adjust particle array
        if (this.particles.length > targetCount) {
            this.particles = this.particles.slice(0, targetCount);
        } else if (this.particles.length < targetCount) {
            const canvas = document.getElementById('particles-canvas');
            for (let i = this.particles.length; i < targetCount; i++) {
                this.particles.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    vx: (Math.random() - 0.5) * 2,
                    vy: (Math.random() - 0.5) * 2,
                    radius: Math.random() * 3 + 1,
                    opacity: Math.random() * 0.5 + 0.3
                });
            }
        }
    }

    populateContent() {
        if (!this.data) return;

        // Personal Information
        this.populatePersonalInfo();

        // Education Timeline
        this.populateEducation();

        // Experience Grid
        this.populateExperience();

        // Projects
        this.populateProjects();

        // Skills
        this.populateSkills();

        // Achievements
        this.populateAchievements();

        // Contact Information
        this.populateContact();

        // Re-setup intersection observer after content is populated
        setTimeout(() => {
            this.setupIntersectionObserver();
        }, 100);
    }

    populatePersonalInfo() {
        const { personal, social } = this.data;

        // Hero section
        const heroName = document.getElementById('hero-name');
        const heroSubtitle = document.getElementById('hero-subtitle');

        if (heroName) heroName.textContent = personal.name;
        if (heroSubtitle) heroSubtitle.textContent = personal.title;

        // Bio section
        const bioDescription = document.getElementById('bio-description');
        const experienceYears = document.getElementById('experience-years');
        const projectsCompleted = document.getElementById('projects-completed');
        const clientsServed = document.getElementById('clients-served');

        if (bioDescription) bioDescription.textContent = personal.bio;
        if (experienceYears) experienceYears.textContent = personal.stats.experience;
        if (projectsCompleted) projectsCompleted.textContent = personal.stats.projects;
        if (clientsServed) clientsServed.textContent = personal.stats.clients;

        // Social links
        const socialLinks = {
            'github-link': social.github,
            'linkedin-link': social.linkedin,
            'instagram-link': social.instagram,
            'leetcode-link': social.leetcode,
            'gfg-link': social.gfg
        };

        Object.entries(socialLinks).forEach(([id, url]) => {
            const link = document.getElementById(id);
            if (link) link.href = url;
        });
    }

    populateEducation() {
        const educationTimeline = document.getElementById('education-timeline');
        if (!educationTimeline || !this.data.education) return;

        educationTimeline.innerHTML = '';

        this.data.education.forEach((edu, index) => {
            const timelineItem = document.createElement('div');
            timelineItem.className = 'timeline-item fade-in';
            timelineItem.style.animationDelay = `${index * 0.2}s`;

            timelineItem.innerHTML = `
                <div class="timeline-content">
                    <div class="timeline-date">${edu.year}</div>
                    <h3 class="timeline-title">${edu.degree}</h3>
                    <div class="timeline-subtitle">${edu.institution}</div>
                    <div class="timeline-description">${edu.description}</div>
                </div>
            `;

            educationTimeline.appendChild(timelineItem);
        });

        console.log('Education populated:', this.data.education.length, 'items');
    }

    populateExperience() {
        const experienceGrid = document.getElementById('experience-grid');
        if (!experienceGrid || !this.data.experience) return;

        experienceGrid.innerHTML = '';

        this.data.experience.forEach((exp, index) => {
            const experienceCard = document.createElement('div');
            experienceCard.className = 'experience-card scale-in';
            experienceCard.style.animationDelay = `${index * 0.1}s`;

            const skillTags = exp.technologies.map(tech =>
                `<span class="skill-tag">${tech}</span>`
            ).join('');

            experienceCard.innerHTML = `
                <div class="experience-header">
                    <div class="experience-icon">
                        <i class="${exp.icon}"></i>
                    </div>
                    <div class="experience-details">
                        <h3>${exp.position}</h3>
                        <div class="company">${exp.company}</div>
                    </div>
                </div>
                <div class="experience-period">${exp.period}</div>
                <div class="experience-location">
                    <i class="fas fa-map-marker-alt"></i>
                    ${exp.location || 'Remote'}
                </div>
                <div class="experience-description">${exp.description}</div>
                <div class="experience-skills">${skillTags}</div>
            `;

            experienceGrid.appendChild(experienceCard);
        });
    }

    populateProjects() {
        const projectsContainer = document.getElementById('projects-container');
        if (!projectsContainer || !this.data.projects) return;

        projectsContainer.innerHTML = '';

        this.data.projects.forEach((project, index) => {
            const projectCard = document.createElement('div');
            projectCard.className = 'project-card';

            const techIcons = {
                'React': 'fab fa-react',
                'Vue.js': 'fab fa-vuejs',
                'Angular': 'fab fa-angular',
                'JavaScript': 'fab fa-js-square',
                'TypeScript': 'fab fa-js-square',
                'Node.js': 'fab fa-node-js',
                'Python': 'fab fa-python',
                'Java': 'fab fa-java',
                'PHP': 'fab fa-php',
                'HTML': 'fab fa-html5',
                'CSS': 'fab fa-css3-alt',
                'SASS': 'fab fa-sass',
                'MongoDB': 'fas fa-database',
                'PostgreSQL': 'fas fa-database',
                'MySQL': 'fas fa-database',
                'Firebase': 'fas fa-fire',
                'AWS': 'fab fa-aws',
                'Google Cloud': 'fab fa-google',
                'Docker': 'fab fa-docker',
                'Git': 'fab fa-git-alt',
                'GitHub': 'fab fa-github',
                'Figma': 'fab fa-figma',
                'Tailwind': 'fas fa-wind',
                'Bootstrap': 'fab fa-bootstrap',
                'Express': 'fas fa-server',
                'GraphQL': 'fas fa-project-diagram',
                'Redux': 'fas fa-layer-group',
                'Webpack': 'fas fa-cube',
                'Vite': 'fas fa-bolt',
                'Three.js': 'fas fa-cube',
                'Chart.js': 'fas fa-chart-bar',
                'Stripe': 'fab fa-stripe',
                'PWA': 'fas fa-mobile-alt',
                'API': 'fas fa-plug',
                'Vuetify': 'fab fa-vuejs',
                'OpenWeather': 'fas fa-cloud-sun',
                'Spring Boot': 'fas fa-leaf',
                'Quarkus': 'fas fa-leaf',
                'Netlify': 'fas fa-cloud-upload-alt',
                'Vercel': 'fas fa-rocket',
                'Canva': 'fas fa-paint-brush',
                'PowerPoint': 'fas fa-file-powerpoint',
                'MS Word': 'fas fa-file-word',
                'MS Excel': 'fas fa-file-excel'
                
            };

            const techTags = project.technologies.map(tech => {
                const icon = techIcons[tech] || 'fas fa-code';
                return `<span class="tech-tag" title="${tech}"><i class="${icon}"></i></span>`;
            }).join('');

            projectCard.innerHTML = `
                <img src="${project.image}" alt="${project.title}" class="project-image">
                <div class="project-content">
                    <h3 class="project-title">${project.title}</h3>
                    <p class="project-description">${project.description}</p>
                    <div class="project-tech">${techTags}</div>
                    <div class="project-links">
                        <a href="${project.liveUrl}" class="project-link" target="_blank">
                            <i class="fas fa-external-link-alt"></i> Live Demo
                        </a>
                        <a href="${project.githubUrl}" class="project-link" target="_blank">
                            <i class="fab fa-github"></i> Source Code
                        </a>
                    </div>
                </div>
            `;

            projectsContainer.appendChild(projectCard);
        });
    }

    populateSkills() {
        const skillsGrid = document.getElementById('skills-grid');
        if (!skillsGrid || !this.data.skills) return;

        skillsGrid.innerHTML = '';

        this.data.skills.forEach((skill, index) => {
            const skillCard = document.createElement('div');
            skillCard.className = 'skill-card fade-in';
            skillCard.style.animationDelay = `${index * 0.1}s`;

            skillCard.innerHTML = `
                <div class="skill-icon">
                    <i class="${skill.icon}"></i>
                </div>
                <div class="skill-info">
                    <div class="skill-header">
                        <div class="skill-name">${skill.name}</div>
                        <div class="skill-level">${skill.level}</div>
                    </div>
                    <div class="skill-progress">
                        <div class="skill-progress-bar" data-width="${skill.percentage}"></div>
                    </div>
                </div>
            `;

            skillsGrid.appendChild(skillCard);
        });
    }

    populateAchievements() {
        const achievementsGrid = document.getElementById('achievements-grid');
        if (!achievementsGrid || !this.data.achievements) return;

        achievementsGrid.innerHTML = '';

        this.data.achievements.forEach((achievement, index) => {
            const achievementCard = document.createElement('div');
            achievementCard.className = 'achievement-card slide-in-left';
            achievementCard.style.animationDelay = `${index * 0.1}s`;

            achievementCard.innerHTML = `
                <div class="achievement-icon">
                    <i class="${achievement.icon}"></i>
                </div>
                <div class="achievement-info">
                    <h3 class="achievement-title">${achievement.title}</h3>
                    <div class="achievement-organization">${achievement.organization}</div>
                    <div class="achievement-date">${achievement.date}</div>
                </div>
            `;

            achievementsGrid.appendChild(achievementCard);
        });

        console.log('Achievements populated:', this.data.achievements.length, 'items');
    }

    populateContact() {
        const { contact } = this.data;

        const contactEmail = document.getElementById('contact-email');
        const contactPhone = document.getElementById('contact-phone');
        const contactLocation = document.getElementById('contact-location');

        if (contactEmail) contactEmail.textContent = contact.email;
        if (contactPhone) contactPhone.textContent = contact.phone;
        if (contactLocation) contactLocation.textContent = contact.location;
    }

    prevProject() {
        const container = document.getElementById('projects-container');
        if (!container) return;

        this.currentProjectIndex = Math.max(0, this.currentProjectIndex - 1);
        container.scrollTo({
            left: this.currentProjectIndex * 370,
            behavior: 'smooth'
        });
    }

    nextProject() {
        const container = document.getElementById('projects-container');
        if (!container) return;

        const maxIndex = Math.max(0, this.data.projects.length - 3);
        this.currentProjectIndex = Math.min(maxIndex, this.currentProjectIndex + 1);
        container.scrollTo({
            left: this.currentProjectIndex * 370,
            behavior: 'smooth'
        });
    }

    handleContactForm(e) {
        e.preventDefault();

        const formData = new FormData(e.target);
        const name = formData.get('name') || document.getElementById('name').value;
        const email = formData.get('email') || document.getElementById('email').value;
        const message = formData.get('message') || document.getElementById('message').value;

        // Simulate form submission
        const submitBtn = e.target.querySelector('.submit-btn');
        const originalText = submitBtn.innerHTML;

        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        submitBtn.disabled = true;

        setTimeout(() => {
            submitBtn.innerHTML = '<i class="fas fa-check"></i> Message Sent!';

            setTimeout(() => {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
                e.target.reset();
            }, 2000);
        }, 2000);
    }

    downloadCV() {
        // Simulate CV download
        const link = document.createElement('a');
        link.href = this.data.personal.cvUrl || '#';

        // Get the actual filename from cvUrl (so it works for .docx, .pdf, etc.)
        const fileName = this.data.personal.cvUrl.split('/').pop();
        link.download = fileName;
        
        // For better mobile support
        if (this.data.personal.cvUrl && this.data.personal.cvUrl !== '#') {
            link.target = '_blank';
        }

        link.click();

        // Show download notification
        this.showNotification(`${fileName} downloaded successfully!`, 'success');
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check' : 'info'}-circle"></i>
            <span>${message}</span>
        `;

        notification.style.cssText = `
            position: fixed;
            top: clamp(20px, 5vw, 30px);
            right: clamp(20px, 5vw, 30px);
            left: clamp(20px, 5vw, auto);
            max-width: calc(100vw - 40px);
            background: var(--glass-bg);
            backdrop-filter: blur(20px);
            border: 1px solid var(--glass-border);
            border-radius: 10px;
            padding: clamp(0.75rem, 2vw, 1rem) clamp(1rem, 3vw, 1.5rem);
            color: var(--text-primary);
            z-index: 10000;
            display: flex;
            align-items: center;
            gap: clamp(0.5rem, 1vw, 0.75rem);
            opacity: 0;
            transform: translateX(100%);
            transition: all 0.3s ease;
            font-size: clamp(0.85rem, 2vw, 0.95rem);
            box-shadow: 0 10px 30px var(--shadow-medium);
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0)';
        }, 100);

        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
    
    // Add touch event handlers for better mobile experience
    setupTouchEvents() {
        // Prevent zoom on double tap for buttons
        const buttons = document.querySelectorAll('.btn-3d, .carousel-btn, .theme-toggle, .menu-toggle');
        buttons.forEach(button => {
            button.addEventListener('touchend', (e) => {
                e.preventDefault();
                button.click();
            });
        });
    }
}

// Utility functions
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
    }
}

// CSS animations for letter reveal
const style = document.createElement('style');
style.textContent = `
    @keyframes letterReveal {
        0% { opacity: 0; transform: translateY(50px) rotateX(90deg); }
        100% { opacity: 1; transform: translateY(0) rotateX(0deg); }
    }
`;
document.head.appendChild(style);

// Initialize the portfolio when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PortfolioWebsite();
    
    
    // Add viewport meta tag if not present for better mobile experience
    if (!document.querySelector('meta[name="viewport"]')) {
        const viewport = document.createElement('meta');
        viewport.name = 'viewport';
        viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes';
        document.head.appendChild(viewport);
    }
});

// Handle orientation change
window.addEventListener('orientationchange', () => setTimeout(() => window.location.reload(), 500));

// Add loading screen if it doesn't exist
if (!document.querySelector('.loading')) {
    const loadingScreen = document.createElement('div');
    loadingScreen.className = 'loading';
    loadingScreen.innerHTML = '<div class="spinner"></div>';
    document.body.appendChild(loadingScreen);
}