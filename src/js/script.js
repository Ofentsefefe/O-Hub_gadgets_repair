// ========== COLLAPSIBLE PRICING SECTIONS TOGGLE ==========
// This makes pricing sections act like buttons - click to show/hide tables

// Track which sections are open
let openSections = {
    iphoneScreen: false,
    iphoneBattery: false,
    android: false
};

// Toggle function for pricing sections
function togglePricingSection(sectionName) {
    let section = null;
    let toggleBtn = null;
    
    switch(sectionName) {
        case 'iphoneScreen':
            section = document.getElementById('iphoneScreenPricing');
            toggleBtn = document.getElementById('iphoneScreenToggleBtn');
            break;
        case 'iphoneBattery':
            section = document.getElementById('iphoneBatteryPricing');
            toggleBtn = document.getElementById('iphoneBatteryToggleBtn');
            break;
        case 'android':
            section = document.getElementById('androidPricing');
            toggleBtn = document.getElementById('androidToggleBtn');
            break;
    }
    
    if (!section) return;
    
    // Toggle the 'open' class on section
    if (section.classList.contains('open')) {
        // Close section
        section.classList.remove('open');
        section.style.maxHeight = '0';
        section.style.opacity = '0';
        section.style.margin = '0';
        section.style.padding = '0';
        
        // Update button arrow
        if (toggleBtn) {
            const arrow = toggleBtn.querySelector('.toggle-arrow i');
            if (arrow) {
                arrow.classList.remove('fa-chevron-up');
                arrow.classList.add('fa-chevron-down');
            }
            // Remove active class
            toggleBtn.classList.remove('active');
        }
        
        openSections[sectionName] = false;
    } else {
        // Open section
        section.classList.add('open');
        section.style.maxHeight = section.scrollHeight + 'px';
        section.style.opacity = '1';
        section.style.margin = '20px 0 30px';
        section.style.padding = '1.8rem';
        
        // Update button arrow
        if (toggleBtn) {
            const arrow = toggleBtn.querySelector('.toggle-arrow i');
            if (arrow) {
                arrow.classList.remove('fa-chevron-down');
                arrow.classList.add('fa-chevron-up');
            }
            // Add active class
            toggleBtn.classList.add('active');
            
            // Add shake animation for fun
            toggleBtn.style.animation = 'shake 0.5s ease';
            setTimeout(() => {
                if (toggleBtn) toggleBtn.style.animation = '';
            }, 500);
        }
        
        openSections[sectionName] = true;
        
        // Show floating message
        let message = '';
        if (sectionName === 'iphoneScreen') message = '📱 iPhone screen pricing table expanded!';
        else if (sectionName === 'iphoneBattery') message = '🔋 iPhone battery pricing table expanded!';
        else message = '🤖 Contact us for Android repair quotes!';
        showFloatingMessage(message, 'info');
    }
}

// Initialize collapsible sections on page load
document.addEventListener('DOMContentLoaded', function() {
    // Hide all pricing sections initially
    const iphoneScreenSection = document.getElementById('iphoneScreenPricing');
    const iphoneBatterySection = document.getElementById('iphoneBatteryPricing');
    const androidSection = document.getElementById('androidPricing');
    
    // Set initial hidden state with proper CSS
    if (iphoneScreenSection) {
        iphoneScreenSection.style.maxHeight = '0';
        iphoneScreenSection.style.opacity = '0';
        iphoneScreenSection.style.overflow = 'hidden';
        iphoneScreenSection.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
        iphoneScreenSection.style.padding = '0 1.8rem';
        iphoneScreenSection.style.margin = '0';
        iphoneScreenSection.classList.remove('open');
    }
    
    if (iphoneBatterySection) {
        iphoneBatterySection.style.maxHeight = '0';
        iphoneBatterySection.style.opacity = '0';
        iphoneBatterySection.style.overflow = 'hidden';
        iphoneBatterySection.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
        iphoneBatterySection.style.padding = '0 1.8rem';
        iphoneBatterySection.style.margin = '0';
        iphoneBatterySection.classList.remove('open');
    }
    
    if (androidSection) {
        androidSection.style.maxHeight = '0';
        androidSection.style.opacity = '0';
        androidSection.style.overflow = 'hidden';
        androidSection.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
        androidSection.style.padding = '0 1.8rem';
        androidSection.style.margin = '0';
        androidSection.classList.remove('open');
    }
    
    // Optional: Auto-open the iPhone screen pricing from URL hash if needed
    if (window.location.hash === '#iphone-screen') {
        setTimeout(() => togglePricingSection('iphoneScreen'), 500);
    }
    if (window.location.hash === '#iphone-battery') {
        setTimeout(() => togglePricingSection('iphoneBattery'), 500);
    }
});

// Also update the card click handlers to open the corresponding pricing section
// Add this to the existing getCardMapping function
function updateCardMappings() {
    const serviceCards = document.querySelectorAll(".card");
    serviceCards.forEach(card => {
        const titleElement = card.querySelector("h3");
        if (titleElement) {
            const cardTitle = titleElement.innerText;
            card.addEventListener("click", (e) => {
                e.stopPropagation();
                
                // Open the corresponding pricing section if needed
                if (cardTitle.includes("iPhone Screens")) {
                    if (!openSections.iphoneScreen) {
                        togglePricingSection('iphoneScreen');
                    }
                } else if (cardTitle.includes("iPhone Battery")) {
                    if (!openSections.iphoneBattery) {
                        togglePricingSection('iphoneBattery');
                    }
                } else if (cardTitle.includes("Android")) {
                    if (!openSections.android) {
                        togglePricingSection('android');
                    }
                }
                
                // Get mapping and scroll
                const mapping = getCardMapping(cardTitle);
                if (mapping) {
                    showFloatingMessage(mapping.message, "info");
                    
                    // Scroll to appropriate section
                    switch(mapping.section) {
                        case "iphone-screen":
                            const iphoneScreenBtn = document.querySelector("#iphoneScreenToggleBtn");
                            if (iphoneScreenBtn) iphoneScreenBtn.scrollIntoView({ behavior: "smooth", block: "start" });
                            break;
                        case "iphone-battery":
                            const iphoneBatteryBtn = document.querySelector("#iphoneBatteryToggleBtn");
                            if (iphoneBatteryBtn) iphoneBatteryBtn.scrollIntoView({ behavior: "smooth", block: "start" });
                            break;
                        case "android":
                            const androidBtn = document.querySelector("#androidToggleBtn");
                            if (androidBtn) androidBtn.scrollIntoView({ behavior: "smooth", block: "start" });
                            break;
                        default:
                            const section = document.querySelector(mapping.section === "laptop" ? ".laptops-showcase" : "#bookingForm");
                            if (section) section.scrollIntoView({ behavior: "smooth", block: "start" });
                    }
                }
            });
        }
    });
}

// Call this after DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    updateCardMappings();
});

// ... (rest of your existing JavaScript code remains the same)
// SEARCH FUNCTIONALITY with smooth filtering
const searchInput = document.getElementById("search");
const serviceCards = document.querySelectorAll(".card");

if (searchInput) {
    searchInput.addEventListener("keyup", (e) => {
        const term = e.target.value.toLowerCase().trim();
        
        serviceCards.forEach(card => {
            const dataName = card.getAttribute("data-name") || "";
            const cardText = card.innerText.toLowerCase();
            const matches = dataName.includes(term) || cardText.includes(term);
            
            if (term === "" || matches) {
                card.style.display = "block";
                card.style.animation = "fadeSlideUp 0.3s ease-out";
            } else {
                card.style.display = "none";
            }
        });
        
        // add subtle effect if no results
        const visibleCards = document.querySelectorAll(".card[style='display: block'], .card:not([style*='none'])");
        if (visibleCards.length === 0 && term !== "") {
            let noResultMsg = document.querySelector(".no-result-message");
            if (!noResultMsg) {
                const msg = document.createElement("div");
                msg.className = "no-result-message";
                msg.innerHTML = `<i class="fas fa-search"></i> No repairs found for "${term}" — try RAM, SSD, Screen, iPhone, Battery`;
                msg.style.textAlign = "center";
                msg.style.padding = "2rem";
                msg.style.color = "#94a3b8";
                document.querySelector(".cards").after(msg);
            }
        } else {
            const existingMsg = document.querySelector(".no-result-message");
            if (existingMsg) existingMsg.remove();
        }
    });
}

// ========== CARD CLICK NAVIGATION TO RELEVANT SECTIONS ==========
// Updated mapping for all service cards
function getCardMapping(cardTitle) {
    if (cardTitle.includes("RAM")) {
        return { message: "💾 Showing RAM upgrade pricing options →", section: "laptop" };
    }
    if (cardTitle.includes("SSD")) {
        return { message: "⚡ Fast SSD upgrades - check our laptop deals →", section: "laptop" };
    }
    if (cardTitle.includes("Laptop Screen")) {
        return { message: "🖥️ Laptop screen repair - contact us for a quote →", section: "contact" };
    }
    if (cardTitle.includes("iPhone Screens")) {
        return { message: "📱 iPhone screen replacement - scroll to see all iPhone pricing →", section: "iphone-screen" };
    }
    if (cardTitle.includes("Android Screen")) {
        return { message: "🤖 Android screen repair - get a free quote below →", section: "android" };
    }
    if (cardTitle.includes("iPhone Battery")) {
        return { message: "🔋 iPhone battery replacement - check pricing table →", section: "iphone-battery" };
    }
    if (cardTitle.includes("Android Battery")) {
        return { message: "🔋 Android battery replacement - request a quote →", section: "android" };
    }
    return null;
}

// Add click handlers to all service cards
serviceCards.forEach(card => {
    const titleElement = card.querySelector("h3");
    if (titleElement) {
        const cardTitle = titleElement.innerText;
        
        card.addEventListener("click", (e) => {
            e.stopPropagation();
            const mapping = getCardMapping(cardTitle);
            
            if (mapping) {
                showFloatingMessage(mapping.message, "info");
                
                // Scroll to appropriate section
                switch(mapping.section) {
                    case "iphone-screen":
                        const iphoneScreenSection = document.querySelector("#iphone-screen-pricing");
                        if (iphoneScreenSection) {
                            iphoneScreenSection.scrollIntoView({ behavior: "smooth", block: "start" });
                            highlightElement(iphoneScreenSection);
                        }
                        break;
                    case "iphone-battery":
                        const iphoneBatterySection = document.querySelector("#iphone-battery-pricing");
                        if (iphoneBatterySection) {
                            iphoneBatterySection.scrollIntoView({ behavior: "smooth", block: "start" });
                            highlightElement(iphoneBatterySection);
                        }
                        break;
                    case "android":
                        const androidSection = document.querySelector("#android-pricing");
                        if (androidSection) {
                            androidSection.scrollIntoView({ behavior: "smooth", block: "start" });
                            highlightElement(androidSection);
                        }
                        break;
                    case "laptop":
                        const laptopSection = document.querySelector(".laptops-showcase");
                        if (laptopSection) {
                            laptopSection.scrollIntoView({ behavior: "smooth", block: "start" });
                            highlightElement(laptopSection);
                        }
                        break;
                    case "contact":
                        const contactForm = document.querySelector("#bookingForm");
                        if (contactForm) {
                            contactForm.closest(".form-card").scrollIntoView({ behavior: "smooth", block: "center" });
                            highlightElement(contactForm.closest(".form-card"));
                        }
                        break;
                    default:
                        const pricingSection = document.querySelector(".pricing-showcase");
                        if (pricingSection) {
                            pricingSection.scrollIntoView({ behavior: "smooth", block: "center" });
                        }
                }
            } else {
                showFloatingMessage("🔧 Click on any service to see pricing!", "info");
            }
        });
    }
});

// Helper function to highlight an element temporarily
function highlightElement(element) {
    if (!element) return;
    element.style.animation = "pulseHighlight 0.8s ease";
    setTimeout(() => {
        element.style.animation = "";
    }, 800);
}

// Laptop cards click handler
const laptopCards = document.querySelectorAll(".laptop-card");
laptopCards.forEach((laptop) => {
    laptop.addEventListener("click", () => {
        const laptopName = laptop.querySelector("h3")?.innerText || "Laptop";
        showFloatingMessage(`🛒 Want to repair a ${laptopName} laptop? Book a repair below!`, "info");
        
        const bookingForm = document.querySelector("#bookingForm");
        if (bookingForm) {
            bookingForm.closest(".form-card").scrollIntoView({ 
                behavior: "smooth", 
                block: "center" 
            });
            
            const deviceInput = document.querySelector("#bookingDevice");
            if (deviceInput) {
                deviceInput.value = laptopName;
                highlightElement(deviceInput);
            }
        }
    });
});

// Device images click handler
const deviceImages = document.querySelectorAll(".device-img-card");
deviceImages.forEach(device => {
    device.addEventListener("click", () => {
        const deviceName = device.querySelector("span")?.innerText || "Device";
        showFloatingMessage(`📱 ${deviceName} repairs available. Check pricing table above!`, "info");
        
        const pricingTable = document.querySelector(".pricing-table");
        if (pricingTable) {
            highlightElement(pricingTable);
        }
    });
});

// BOOKING FORM
const bookingFormElem = document.getElementById("bookingForm");
if (bookingFormElem) {
    bookingFormElem.addEventListener("submit", function(e) {
        e.preventDefault();
        const nameInput = document.querySelector("#bookingName");
        const deviceInput = document.querySelector("#bookingDevice");
        const problemInput = document.querySelector("#bookingProblem");
        
        if (nameInput && nameInput.value.trim() === "") {
            showFloatingMessage("✨ Please enter your name to book a repair.", "warning");
            nameInput.focus();
            return;
        }
        
        if (deviceInput && deviceInput.value.trim() === "") {
            showFloatingMessage("📱 Please tell us your device model.", "warning");
            deviceInput.focus();
            return;
        }
        
        if (problemInput && problemInput.value.trim() === "") {
            showFloatingMessage("⚠️ Please describe the problem.", "warning");
            problemInput.focus();
            return;
        }
        
        showFloatingMessage("✅ Booking submitted! Ofentse will WhatsApp you within 30min.", "success");
        this.reset();
    });
}

// CONTACT FORM
const contactForm = document.getElementById("contactForm");
if (contactForm) {
    contactForm.addEventListener("submit", function(e) {
        e.preventDefault();
        const nameField = document.querySelector("#contactName");
        const emailField = document.querySelector("#contactEmail");
        const messageField = document.querySelector("#contactMessage");
        
        if (nameField && nameField.value.trim() === "") {
            showFloatingMessage("📝 Please enter your name.", "warning");
            nameField.focus();
            return;
        }
        
        if (emailField && emailField.value && !emailField.value.includes("@")) {
            showFloatingMessage("📧 Please enter a valid email address.", "warning");
            emailField.focus();
            return;
        }
        
        if (messageField && messageField.value.trim() === "") {
            showFloatingMessage("💬 Please enter your message.", "warning");
            messageField.focus();
            return;
        }
        
        showFloatingMessage("📨 Message sent! We'll reply within 2 hours.", "success");
        this.reset();
    });
}

// SELL BROKEN LAPTOP HANDLER
const sellBtn = document.getElementById("sellBrokenBtn");
if (sellBtn) {
    sellBtn.addEventListener("click", () => {
        showFloatingMessage("💰 Great! WhatsApp us your laptop model for an instant quote!", "cash");
        
        const whatsappBtn = document.querySelector(".whatsapp");
        if (whatsappBtn) {
            highlightElement(whatsappBtn);
        }
    });
}

// FLOATING MESSAGE FUNCTION
function showFloatingMessage(text, type = "info") {
    const existingToast = document.querySelector(".floating-toast");
    if (existingToast) existingToast.remove();
    
    let toast = document.createElement("div");
    toast.className = "floating-toast";
    toast.innerText = text;
    
    if (type === "cash") {
        toast.style.background = "linear-gradient(135deg, #fbbf24, #f59e0b)";
        toast.style.color = "#0f172a";
        toast.style.border = "none";
    } else if (type === "warning") {
        toast.style.borderColor = "#f97316";
        toast.style.color = "#f97316";
    } else if (type === "success") {
        toast.style.borderColor = "#10b981";
        toast.style.color = "#10b981";
    }
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transition = "0.3s";
        setTimeout(() => toast.remove(), 400);
    }, 3000);
}

// SCROLL ANIMATION OBSERVER
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.animation = "fadeSlideUp 0.5s ease forwards";
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll(".card, .pricing-showcase, .gallery-item, .form-card, .laptop-card, .buy-broken-card, .doctor-profile").forEach(el => {
    el.style.opacity = "0";
    observer.observe(el);
});

// SEARCH PLACEHOLDER ENHANCEMENT
if (searchInput) {
    searchInput.addEventListener("focus", () => {
        searchInput.placeholder = "e.g., 'iPhone screen', 'RAM', 'Battery' ...";
    });
    searchInput.addEventListener("blur", () => {
        searchInput.placeholder = "Search repairs... (e.g., RAM, Screen, Battery)";
    });
}

console.log("The-O-Hub — Fully functional repair website with click-to-pricing navigation!");
