// Advanced Particle System for Portfolio Website

class ParticleSystem {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.particles = [];
        this.mouse = { x: 0, y: 0 };
        this.particleCount = 150;
        this.currentSection = 'home';
        
        this.resize();
        this.init();
        this.animate();
        
        // Mouse tracking
        window.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });
        
        // Resize handler
        window.addEventListener('resize', () => this.resize());
        
        // Section tracking for particle intensity
        this.setupSectionTracking();
    }
    
    setupSectionTracking() {
        const sections = document.querySelectorAll('section');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
                    this.currentSection = entry.target.id;
                }
            });
        }, { threshold: 0.5 });
        
        sections.forEach(section => observer.observe(section));
    }
    
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    init() {
        this.particles = [];
        
        for (let i = 0; i < this.particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2,
                radius: Math.random() * 3 + 1,
                opacity: Math.random() * 0.5 + 0.3,
                originalRadius: Math.random() * 3 + 1,
                pulse: Math.random() * Math.PI * 2,
                color: this.getRandomColor()
            });
        }
    }
    
    getRandomColor() {
        const colors = [
            { r: 102, g: 126, b: 234 }, // Primary blue
            { r: 240, g: 147, b: 251 }, // Accent pink
            { r: 118, g: 75, b: 162 },  // Secondary purple
        ];
        
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    updateParticle(particle) {
        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;
        
        // Wrap around edges
        if (particle.x < 0) particle.x = this.canvas.width;
        if (particle.x > this.canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = this.canvas.height;
        if (particle.y > this.canvas.height) particle.y = 0;
        
        // Mouse interaction
        const dx = this.mouse.x - particle.x;
        const dy = this.mouse.y - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 150) {
            const force = (150 - distance) / 150;
            const angle = Math.atan2(dy, dx);
            particle.vx -= Math.cos(angle) * force * 0.1;
            particle.vy -= Math.sin(angle) * force * 0.1;
            
            // Increase radius on mouse proximity
            particle.radius = particle.originalRadius * (1 + force * 2);
            particle.opacity = Math.min(1, particle.opacity + force * 0.3);
        } else {
            // Return to original size
            particle.radius += (particle.originalRadius - particle.radius) * 0.1;
            particle.opacity += (0.5 - particle.opacity) * 0.1;
        }
        
        // Subtle pulsing effect
        particle.pulse += 0.05;
        const pulseRadius = particle.originalRadius + Math.sin(particle.pulse) * 0.5;
        particle.radius = Math.max(particle.radius, pulseRadius);
        
        // Apply friction to velocity
        particle.vx *= 0.99;
        particle.vy *= 0.99;
        
        // Add slight random movement
        particle.vx += (Math.random() - 0.5) * 0.02;
        particle.vy += (Math.random() - 0.5) * 0.02;
        
        // Limit velocity
        const maxVelocity = 3;
        const velocity = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy);
        if (velocity > maxVelocity) {
            particle.vx = (particle.vx / velocity) * maxVelocity;
            particle.vy = (particle.vy / velocity) * maxVelocity;
        }
    }
    
    drawParticle(particle) {
        const theme = document.documentElement.getAttribute('data-theme');
        const isDark = theme === 'dark';
        
        // Create gradient for particle
        const gradient = this.ctx.createRadialGradient(
            particle.x, particle.y, 0,
            particle.x, particle.y, particle.radius * 2
        );
        
        const { r, g, b } = particle.color;
        gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${particle.opacity})`);
        gradient.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, ${particle.opacity * 0.5})`);
        gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
        
        // Draw particle with glow effect
        this.ctx.beginPath();
        this.ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = gradient;
        this.ctx.fill();
        
        // Add extra glow for larger particles
        if (particle.radius > particle.originalRadius * 1.5) {
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.radius * 1.5, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${particle.opacity * 0.1})`;
            this.ctx.fill();
        }
    }
    
    drawConnections() {
        const theme = document.documentElement.getAttribute('data-theme');
        const isDark = theme === 'dark';
        const connectionColor = isDark ? '255, 255, 255' : '102, 126, 234';
        const isHome = this.currentSection === 'home';
        const connectionOpacity = isHome ? 0.2 : 0.1;
        
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const particle1 = this.particles[i];
                const particle2 = this.particles[j];
                
                const dx = particle1.x - particle2.x;
                const dy = particle1.y - particle2.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 120) {
                    const opacity = (1 - distance / 120) * connectionOpacity;
                    
                    // Create gradient for connection line
                    const gradient = this.ctx.createLinearGradient(
                        particle1.x, particle1.y,
                        particle2.x, particle2.y
                    );
                    
                    gradient.addColorStop(0, `rgba(${particle1.color.r}, ${particle1.color.g}, ${particle1.color.b}, ${opacity})`);
                    gradient.addColorStop(1, `rgba(${particle2.color.r}, ${particle2.color.g}, ${particle2.color.b}, ${opacity})`);
                    
                    this.ctx.beginPath();
                    this.ctx.moveTo(particle1.x, particle1.y);
                    this.ctx.lineTo(particle2.x, particle2.y);
                    this.ctx.strokeStyle = gradient;
                    this.ctx.lineWidth = 1;
                    this.ctx.stroke();
                }
            }
        }
    }
    
    drawMouseEffect() {
        const theme = document.documentElement.getAttribute('data-theme');
        const isDark = theme === 'dark';
        
        // Create ripple effect around mouse
        const gradient = this.ctx.createRadialGradient(
            this.mouse.x, this.mouse.y, 0,
            this.mouse.x, this.mouse.y, 100
        );
        
        gradient.addColorStop(0, isDark ? 'rgba(102, 126, 234, 0.1)' : 'rgba(102, 126, 234, 0.05)');
        gradient.addColorStop(0.5, isDark ? 'rgba(240, 147, 251, 0.05)' : 'rgba(240, 147, 251, 0.02)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        this.ctx.beginPath();
        this.ctx.arc(this.mouse.x, this.mouse.y, 100, 0, Math.PI * 2);
        this.ctx.fillStyle = gradient;
        this.ctx.fill();
    }
    
    animate() {
        // Adjust particle opacity based on current section
        const isHome = this.currentSection === 'home';
        const baseOpacity = isHome ? 0.8 : 0.3;
        
        // Clear canvas with fade effect
        const fadeAmount = isHome ? 0.05 : 0.08;
        this.ctx.fillStyle = document.documentElement.getAttribute('data-theme') === 'dark' 
            ? `rgba(15, 15, 15, ${fadeAmount})` 
            : `rgba(255, 255, 255, ${fadeAmount})`;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Adjust particle properties based on section
        this.particles.forEach(particle => {
            particle.baseOpacity = particle.baseOpacity || particle.opacity;
            particle.opacity = particle.baseOpacity * baseOpacity;
        });
        
        // Update and draw connections first (so they appear behind particles)
        if (isHome) {
            this.drawConnections();
        }
        
        // Draw mouse effect
        if (isHome) {
            this.drawMouseEffect();
        }
        
        // Update and draw particles
        this.particles.forEach(particle => {
            this.updateParticle(particle);
            this.drawParticle(particle);
        });
        
        requestAnimationFrame(() => this.animate());
    }
}

// Enhanced Galaxy Particle System
class GalaxyParticleSystem extends ParticleSystem {
    constructor(canvas) {
        super(canvas);
        this.centerX = this.canvas.width / 2;
        this.centerY = this.canvas.height / 2;
        this.galaxyRotation = 0;
    }
    
    init() {
        this.particles = [];
        
        for (let i = 0; i < this.particleCount; i++) {
            const angle = (Math.PI * 2 * i) / this.particleCount;
            const radius = Math.random() * 300 + 50;
            const spiralOffset = angle * 2;
            
            this.particles.push({
                angle: angle,
                radius: radius,
                x: this.centerX + Math.cos(angle + spiralOffset) * radius,
                y: this.centerY + Math.sin(angle + spiralOffset) * radius,
                vx: 0,
                vy: 0,
                originalRadius: Math.random() * 2 + 1,
                radius: Math.random() * 2 + 1,
                opacity: Math.random() * 0.8 + 0.2,
                pulse: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.02,
                color: this.getGalaxyColor(radius)
            });
        }
    }
    
    getGalaxyColor(radius) {
        const colors = [
            { r: 147, g: 197, b: 253 }, // Light blue (outer)
            { r: 99, g: 102, b: 241 },  // Blue
            { r: 168, g: 85, b: 247 },  // Purple
            { r: 236, g: 72, b: 153 },  // Pink (inner)
        ];
        
        const colorIndex = Math.floor((radius / 350) * colors.length);
        return colors[Math.min(colorIndex, colors.length - 1)];
    }
    
    updateParticle(particle) {
        // Rotate around center
        particle.angle += particle.rotationSpeed;
        
        const spiralOffset = particle.angle * 2;
        particle.x = this.centerX + Math.cos(particle.angle + spiralOffset + this.galaxyRotation) * particle.radius;
        particle.y = this.centerY + Math.sin(particle.angle + spiralOffset + this.galaxyRotation) * particle.radius;
        
        // Mouse interaction
        const dx = this.mouse.x - particle.x;
        const dy = this.mouse.y - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 100) {
            const force = (100 - distance) / 100;
            particle.radius += force * 20;
            particle.opacity = Math.min(1, particle.opacity + force * 0.3);
        } else {
            particle.radius += (particle.originalRadius - particle.radius) * 0.1;
        }
        
        // Pulsing effect
        particle.pulse += 0.03;
        particle.opacity += Math.sin(particle.pulse) * 0.1;
    }
    
    animate() {
        this.ctx.fillStyle = document.documentElement.getAttribute('data-theme') === 'dark' 
            ? 'rgba(15, 15, 15, 0.1)' 
            : 'rgba(255, 255, 255, 0.1)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.galaxyRotation += 0.001;
        this.centerX = this.canvas.width / 2;
        this.centerY = this.canvas.height / 2;
        
        // Draw galaxy arms
        this.drawGalaxyArms();
        
        // Update and draw particles
        this.particles.forEach(particle => {
            this.updateParticle(particle);
            this.drawParticle(particle);
        });
        
        requestAnimationFrame(() => this.animate());
    }
    
    drawGalaxyArms() {
        const armCount = 3;
        for (let arm = 0; arm < armCount; arm++) {
            const armAngle = (Math.PI * 2 * arm) / armCount + this.galaxyRotation;
            
            this.ctx.beginPath();
            this.ctx.moveTo(this.centerX, this.centerY);
            
            for (let r = 0; r < 300; r += 5) {
                const angle = armAngle + (r * 0.02);
                const x = this.centerX + Math.cos(angle) * r;
                const y = this.centerY + Math.sin(angle) * r;
                this.ctx.lineTo(x, y);
            }
            
            const gradient = this.ctx.createLinearGradient(
                this.centerX, this.centerY,
                this.centerX + Math.cos(armAngle) * 300,
                this.centerY + Math.sin(armAngle) * 300
            );
            
            gradient.addColorStop(0, 'rgba(236, 72, 153, 0.2)');
            gradient.addColorStop(0.5, 'rgba(168, 85, 247, 0.1)');
            gradient.addColorStop(1, 'rgba(147, 197, 253, 0.05)');
            
            this.ctx.strokeStyle = gradient;
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
        }
    }
}

// Initialize particle system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('particles-canvas');
    if (canvas) {
        // Choose between regular particle system or galaxy system
        const useGalaxy = Math.random() > 0.5; // 50% chance for galaxy effect
        
        if (useGalaxy) {
            new GalaxyParticleSystem(canvas);
        } else {
            new ParticleSystem(canvas);
        }
    }
});