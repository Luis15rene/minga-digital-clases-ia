// Configuración global y inicialización
document.addEventListener('DOMContentLoaded', function() {
    initializeNavigation();
    initializeNeuralAnimation();
    initializeLazyLoading();
    initializeScrollEffects();
    initializeForms();
    initializeModal();
    initializeAccessibility();
});

// Navegación responsive y funcionalidad del menú
function initializeNavigation() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const header = document.querySelector('.header');

    // Toggle del menú hamburguesa
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
            
            // Actualizar aria-expanded
            const isExpanded = navMenu.classList.contains('active');
            hamburger.setAttribute('aria-expanded', isExpanded);
        });

        // Cerrar menú al hacer click en un enlace
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
                hamburger.setAttribute('aria-expanded', 'false');
            });
        });

        // Cerrar menú al hacer click fuera
        document.addEventListener('click', function(event) {
            if (!hamburger.contains(event.target) && !navMenu.contains(event.target)) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
                hamburger.setAttribute('aria-expanded', 'false');
            }
        });
    }

    // Efecto de scroll en el header
    let lastScrollTop = 0;
    window.addEventListener('scroll', debounce(function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        
        lastScrollTop = scrollTop;
    }, 10));

    // Manejo de dropdowns con teclado
    const dropdowns = document.querySelectorAll('.dropdown');
    dropdowns.forEach(dropdown => {
        const link = dropdown.querySelector('.nav-link');
        const content = dropdown.querySelector('.dropdown-content');
        
        if (link && content) {
            link.addEventListener('keydown', function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    const isExpanded = link.getAttribute('aria-expanded') === 'true';
                    link.setAttribute('aria-expanded', !isExpanded);
                    content.style.display = isExpanded ? 'none' : 'block';
                }
            });
        }
    });
}

// Animación de redes neuronales en canvas
function initializeNeuralAnimation() {
    const canvas = document.getElementById('neuralCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationId;
    let isVisible = false;

    // Configurar canvas
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    resizeCanvas();
    window.addEventListener('resize', debounce(resizeCanvas, 250));

    // Nodos de la red neuronal
    const nodes = [];
    const connections = [];
    const nodeCount = Math.min(50, Math.floor(window.innerWidth / 30));

    // Crear nodos
    function createNodes() {
        nodes.length = 0;
        for (let i = 0; i < nodeCount; i++) {
            nodes.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                radius: Math.random() * 3 + 1,
                opacity: Math.random() * 0.5 + 0.3,
                pulsePhase: Math.random() * Math.PI * 2
            });
        }
    }

    createNodes();

    // Crear conexiones
    function createConnections() {
        connections.length = 0;
        const maxDistance = Math.min(150, window.innerWidth / 8);
        
        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                const distance = Math.sqrt(
                    Math.pow(nodes[i].x - nodes[j].x, 2) + 
                    Math.pow(nodes[i].y - nodes[j].y, 2)
                );
                if (distance < maxDistance) {
                    connections.push({
                        from: i,
                        to: j,
                        opacity: (maxDistance - distance) / maxDistance * 0.3
                    });
                }
            }
        }
    }

    // Animar
    function animate() {
        if (!isVisible) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const time = Date.now() * 0.001;

        // Actualizar posiciones de nodos
        nodes.forEach(node => {
            node.x += node.vx;
            node.y += node.vy;

            // Rebotar en los bordes
            if (node.x < 0 || node.x > canvas.width) node.vx *= -1;
            if (node.y < 0 || node.y > canvas.height) node.vy *= -1;

            // Mantener dentro del canvas
            node.x = Math.max(0, Math.min(canvas.width, node.x));
            node.y = Math.max(0, Math.min(canvas.height, node.y));

            // Efecto de pulso
            node.pulsePhase += 0.02;
        });

        // Recrear conexiones
        createConnections();

        // Dibujar conexiones
        connections.forEach(connection => {
            const fromNode = nodes[connection.from];
            const toNode = nodes[connection.to];
            
            ctx.beginPath();
            ctx.moveTo(fromNode.x, fromNode.y);
            ctx.lineTo(toNode.x, toNode.y);
            ctx.strokeStyle = `rgba(231, 183, 70, ${connection.opacity})`;
            ctx.lineWidth = 1;
            ctx.stroke();
        });

        // Dibujar nodos
        nodes.forEach(node => {
            const pulseScale = 1 + Math.sin(node.pulsePhase) * 0.2;
            const currentRadius = node.radius * pulseScale;
            
            // Nodo principal
            ctx.beginPath();
            ctx.arc(node.x, node.y, currentRadius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(231, 183, 70, ${node.opacity})`;
            ctx.fill();
            
            // Efecto de halo
            ctx.beginPath();
            ctx.arc(node.x, node.y, currentRadius + 2, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(231, 183, 70, ${node.opacity * 0.3})`;
            ctx.lineWidth = 1;
            ctx.stroke();
        });

        animationId = requestAnimationFrame(animate);
    }

    // Observer para optimizar rendimiento
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            isVisible = entry.isIntersecting;
            if (isVisible) {
                animate();
            } else {
                cancelAnimationFrame(animationId);
            }
        });
    }, { threshold: 0.1 });

    observer.observe(canvas);

    // Pausar animación cuando la pestaña no está activa
    document.addEventListener('visibilitychange', function() {
        if (document.hidden) {
            cancelAnimationFrame(animationId);
        } else if (isVisible) {
            animate();
        }
    });
}

// Lazy loading para imágenes y videos
function initializeLazyLoading() {
    const lazyElements = document.querySelectorAll('img[loading="lazy"], video[loading="lazy"]');
    
    if ('IntersectionObserver' in window) {
        const lazyObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const element = entry.target;
                    
                    if (element.tagName === 'IMG') {
                        if (element.dataset.src) {
                            element.src = element.dataset.src;
                            element.removeAttribute('data-src');
                        }
                    } else if (element.tagName === 'VIDEO') {
                        if (element.dataset.src) {
                            element.src = element.dataset.src;
                            element.removeAttribute('data-src');
                        }
                        element.load();
                    }
                    
                    element.classList.add('loaded');
                    lazyObserver.unobserve(element);
                }
            });
        }, {
            rootMargin: '50px 0px',
            threshold: 0.01
        });

        lazyElements.forEach(element => {
            element.classList.add('lazy');
            lazyObserver.observe(element);
        });
    } else {
        // Fallback para navegadores sin soporte de IntersectionObserver
        lazyElements.forEach(element => {
            if (element.dataset.src) {
                element.src = element.dataset.src;
                element.removeAttribute('data-src');
            }
            element.classList.add('loaded');
        });
    }
}

// Efectos de scroll y animaciones
function initializeScrollEffects() {
    // Smooth scroll para enlaces internos
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = target.offsetTop - headerHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });

                // Actualizar focus para accesibilidad
                target.setAttribute('tabindex', '-1');
                target.focus();
                target.addEventListener('blur', function() {
                    target.removeAttribute('tabindex');
                }, { once: true });
            }
        });
    });

    // Animación de elementos al hacer scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const scrollObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);

    // Observar elementos que deben animarse
    const animatedElements = document.querySelectorAll(`
        .level-section, 
        .resource-card, 
        .community-section, 
        .module-card,
        .article-placeholder,
        .professor-content
    `);
    
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        scrollObserver.observe(el);
    });

    // Parallax suave para el hero
    const hero = document.querySelector('.hero');
    if (hero) {
        window.addEventListener('scroll', debounce(function() {
            const scrolled = window.pageYOffset;
            const rate = scrolled * -0.5;
            hero.style.transform = `translateY(${rate}px)`;
        }, 10));
    }
}

// Manejo de formularios
function initializeForms() {
    // Formulario de registro
    const registrationForm = document.getElementById('registrationForm');
    if (registrationForm) {
        registrationForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Validación básica
            const formData = new FormData(this);
            const data = {
                nombre: formData.get('nombre'),
                direccion: formData.get('direccion'),
                celular: formData.get('celular')
            };

            // Validar campos requeridos
            if (!data.nombre || !data.direccion || !data.celular) {
                showNotification('Por favor, completa todos los campos requeridos.', 'warning');
                return;
            }

            // Validar formato de celular (básico)
            const celularRegex = /^[+]?[\d\s\-\(\)]{8,}$/;
            if (!celularRegex.test(data.celular)) {
                showNotification('Por favor, ingresa un número de celular válido.', 'warning');
                return;
            }

            // Simular envío (en producción, esto se enviará a Formspree)
            showNotification('¡Registro exitoso! Te contactaremos pronto.', 'success');
            this.reset();
            
            // En producción, el formulario se enviará automáticamente a Formspree
            // debido al action="https://formspree.io/f/YOUR_FORM_ID"
        });

        // Validación en tiempo real
        const inputs = registrationForm.querySelectorAll('input[required]');
        inputs.forEach(input => {
            input.addEventListener('blur', function() {
                validateField(this);
            });

            input.addEventListener('input', function() {
                clearFieldError(this);
            });
        });
    }

    // Formulario de newsletter
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const emailInput = this.querySelector('input[type="email"]');
            const email = emailInput.value.trim();
            
            if (!email) {
                showNotification('Por favor, ingresa tu correo electrónico.', 'warning');
                return;
            }

            // Validar formato de email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                showNotification('Por favor, ingresa un correo electrónico válido.', 'warning');
                return;
            }

            showNotification('¡Suscripción exitosa! Gracias por unirte.', 'success');
            this.reset();
        });
    }
}

// Validación de campos
function validateField(field) {
    const value = field.value.trim();
    const fieldName = field.getAttribute('name');
    
    clearFieldError(field);
    
    if (field.hasAttribute('required') && !value) {
        showFieldError(field, 'Este campo es requerido.');
        return false;
    }
    
    if (fieldName === 'celular' && value) {
        const celularRegex = /^[+]?[\d\s\-\(\)]{8,}$/;
        if (!celularRegex.test(value)) {
            showFieldError(field, 'Ingresa un número de celular válido.');
            return false;
        }
    }
    
    if (field.type === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            showFieldError(field, 'Ingresa un correo electrónico válido.');
            return false;
        }
    }
    
    return true;
}

function showFieldError(field, message) {
    field.classList.add('error');
    field.setAttribute('aria-invalid', 'true');
    
    let errorElement = field.parentNode.querySelector('.field-error');
    if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.className = 'field-error';
        errorElement.setAttribute('role', 'alert');
        field.parentNode.appendChild(errorElement);
    }
    
    errorElement.textContent = message;
    field.setAttribute('aria-describedby', errorElement.id || 'field-error');
}

function clearFieldError(field) {
    field.classList.remove('error');
    field.removeAttribute('aria-invalid');
    
    const errorElement = field.parentNode.querySelector('.field-error');
    if (errorElement) {
        errorElement.remove();
    }
}

// Modal para video de propósitos
function initializeModal() {
    const modal = document.getElementById('purpose-video-modal');
    const openBtn = document.querySelector('.purpose-video-btn');
    const closeBtn = document.querySelector('.modal-close');
    const iframe = document.getElementById('purpose-video-iframe');
    
    if (!modal || !openBtn || !closeBtn) return;

    // Abrir modal
    openBtn.addEventListener('click', function() {
        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
        
        // Cargar video (placeholder URL - reemplazar con URL real)
        iframe.src = 'https://www.youtube.com/embed/dQw4w9WgXcQ';
        
        // Focus en el modal para accesibilidad
        modal.focus();
        
        // Prevenir scroll del body
        document.body.style.overflow = 'hidden';
    });

    // Cerrar modal
    function closeModal() {
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
        
        // Detener video
        iframe.src = '';
        
        // Restaurar scroll del body
        document.body.style.overflow = '';
        
        // Devolver focus al botón que abrió el modal
        openBtn.focus();
    }

    closeBtn.addEventListener('click', closeModal);

    // Cerrar con Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModal();
        }
    });

    // Cerrar al hacer click fuera del contenido
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Trap focus dentro del modal
    modal.addEventListener('keydown', function(e) {
        if (e.key === 'Tab') {
            const focusableElements = modal.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];

            if (e.shiftKey) {
                if (document.activeElement === firstElement) {
                    lastElement.focus();
                    e.preventDefault();
                }
            } else {
                if (document.activeElement === lastElement) {
                    firstElement.focus();
                    e.preventDefault();
                }
            }
        }
    });
}

// Mejoras de accesibilidad
function initializeAccessibility() {
    // Indicador de focus visible
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Tab') {
            document.body.classList.add('keyboard-navigation');
        }
    });

    document.addEventListener('mousedown', function() {
        document.body.classList.remove('keyboard-navigation');
    });

    // Anunciar cambios de página para lectores de pantalla
    const sections = document.querySelectorAll('section[id]');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const sectionTitle = entry.target.querySelector('h2, h3');
                if (sectionTitle) {
                    announceToScreenReader(`Navegando a: ${sectionTitle.textContent}`);
                }
            }
        });
    }, { threshold: 0.5 });

    sections.forEach(section => observer.observe(section));

    // Mejorar navegación por teclado en cards
    const cards = document.querySelectorAll('.module-card, .resource-card');
    cards.forEach(card => {
        card.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
    });
}

// Notificaciones
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.setAttribute('role', 'alert');
    notification.setAttribute('aria-live', 'polite');
    
    const colors = {
        success: '#28A745',
        warning: '#FFC107',
        danger: '#DC3545',
        info: '#17A2B8'
    };

    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close" aria-label="Cerrar notificación">&times;</button>
        </div>
    `;
    
    // Estilos para la notificación
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${colors[type] || colors.info};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.2);
        z-index: 10000;
        max-width: 400px;
        animation: slideInRight 0.3s ease;
        font-family: var(--fuente-principal);
    `;

    const content = notification.querySelector('.notification-content');
    content.style.cssText = `
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
    `;

    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.style.cssText = `
        background: none;
        border: none;
        color: white;
        font-size: 1.2rem;
        cursor: pointer;
        padding: 0;
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: background-color 0.2s ease;
    `;

    closeBtn.addEventListener('click', () => notification.remove());
    closeBtn.addEventListener('mouseenter', () => {
        closeBtn.style.backgroundColor = 'rgba(255,255,255,0.2)';
    });
    closeBtn.addEventListener('mouseleave', () => {
        closeBtn.style.backgroundColor = 'transparent';
    });

    document.body.appendChild(notification);

    // Auto-remover después de 5 segundos
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

// Anunciar a lectores de pantalla
function announceToScreenReader(message) {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    setTimeout(() => {
        document.body.removeChild(announcement);
    }, 1000);
}

// Utilidades
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Agregar estilos de animación dinámicamente
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .keyboard-navigation *:focus {
        outline: 3px solid var(--amarillo-tierra) !important;
        outline-offset: 2px !important;
    }
    
    .field-error {
        color: var(--danger);
        font-size: 0.875rem;
        margin-top: 0.25rem;
        display: block;
    }
    
    .form-group input.error {
        border-color: var(--danger);
        box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.1);
    }
    
    .animate-in {
        animation: fadeInUp 0.6s ease forwards;
    }
`;
document.head.appendChild(style);

// Manejo de errores globales
window.addEventListener('error', function(e) {
    console.error('Error en la aplicación:', e.error);
    // En producción, aquí podrías enviar el error a un servicio de monitoreo
});

// Optimización de rendimiento
if ('requestIdleCallback' in window) {
    requestIdleCallback(function() {
        // Tareas de baja prioridad
        console.log('Algoritmos y Raíces - Sitio web cargado completamente');
    });
}

// Preload de recursos críticos
function preloadCriticalResources() {
    const criticalImages = [
        'assets/images/profesor-luis-urra.jpg',
        'assets/images/profesor-luis-urra-bio.jpg'
    ];
    
    criticalImages.forEach(src => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = src;
        document.head.appendChild(link);
    });
}

// Ejecutar preload cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', preloadCriticalResources);
} else {
    preloadCriticalResources();
}

