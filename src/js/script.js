// ========== COLLAPSIBLE PRICING SECTIONS TOGGLE ==========
let openSections = {
    iphoneScreen: false,
    iphoneBattery: false,
    android: false
};

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
    
    if (section.classList.contains('open')) {
        section.classList.remove('open');
        section.style.maxHeight = '0';
        section.style.opacity = '0';
        section.style.margin = '0';
        section.style.padding = '0';
        
        if (toggleBtn) {
            const arrow = toggleBtn.querySelector('.toggle-arrow i');
            if (arrow) {
                arrow.classList.remove('fa-chevron-up');
                arrow.classList.add('fa-chevron-down');
            }
            toggleBtn.classList.remove('active');
        }
        openSections[sectionName] = false;
    } else {
        section.classList.add('open');
        section.style.maxHeight = section.scrollHeight + 'px';
        section.style.opacity = '1';
        section.style.margin = '20px 0 30px';
        section.style.padding = '1.8rem';
        
        if (toggleBtn) {
            const arrow = toggleBtn.querySelector('.toggle-arrow i');
            if (arrow) {
                arrow.classList.remove('fa-chevron-down');
                arrow.classList.add('fa-chevron-up');
            }
            toggleBtn.classList.add('active');
            
            toggleBtn.style.animation = 'shake 0.5s ease';
            setTimeout(() => {
                if (toggleBtn) toggleBtn.style.animation = '';
            }, 500);
        }
        openSections[sectionName] = true;
        
        let message = '';
        if (sectionName === 'iphoneScreen') message = '📱 iPhone screen pricing table expanded!';
        else if (sectionName === 'iphoneBattery') message = '🔋 iPhone battery pricing table expanded!';
        else message = '🤖 Contact us for Android repair quotes!';
        showFloatingMessage(message, 'info');
    }
}

// ========== REVIEW SYSTEM ==========
let reviews = [];

function loadReviewsFromStorage() {
    const stored = localStorage.getItem('theOhubReviews');
    if(stored) {
        reviews = JSON.parse(stored);
    } else {
        reviews = [
            { id: Date.now() + 1, name: "Thabo Mbeki", rating: 5, text: "Fixed my water-damaged iPhone in 2 hours! Amazing service!", date: new Date().toLocaleDateString() },
            { id: Date.now() + 2, name: "Lerato Smith", rating: 4, text: "SSD upgrade made my laptop fly. Very professional.", date: new Date().toLocaleDateString() },
            { id: Date.now() + 3, name: "Sipho Dlamini", rating: 5, text: "Best repair shop in Joburg! My MacBook works like new.", date: new Date().toLocaleDateString() }
        ];
        saveReviewsToStorage();
    }
    updateReviewUI();
}

function saveReviewsToStorage() {
    localStorage.setItem('theOhubReviews', JSON.stringify(reviews));
}

function updateReviewUI() {
    const reviewsContainer = document.getElementById('reviewsList');
    const avgRatingSpan = document.getElementById('avgRating');
    const reviewCountSpan = document.getElementById('reviewCount');
    const avgStarsDisplay = document.getElementById('avgStarsDisplay');
    
    if(reviews.length === 0) {
        reviewsContainer.innerHTML = '<div class="empty-reviews">✨ No reviews yet. Be the first to share your experience! ✨</div>';
        avgRatingSpan.innerText = '0.0';
        reviewCountSpan.innerText = '0';
        avgStarsDisplay.innerHTML = '☆☆☆☆☆';
        return;
    }
    
    const sortedReviews = [...reviews].reverse();
    reviewsContainer.innerHTML = sortedReviews.map(rev => `
        <div class="review-card" data-id="${rev.id}">
            <div class="reviewer-name"><i class="fas fa-user-circle"></i> ${escapeHtml(rev.name)}</div>
            <div class="review-stars">${'★'.repeat(rev.rating)}${'☆'.repeat(5-rev.rating)}</div>
            <div class="review-text">${escapeHtml(rev.text)}</div>
            <div class="review-date">
                <span><i class="far fa-calendar-alt"></i> ${rev.date}</span>
                <button class="delete-review" data-id="${rev.id}"><i class="fas fa-trash-alt"></i> Delete</button>
            </div>
        </div>
    `).join('');
    
    document.querySelectorAll('.delete-review').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = parseInt(btn.getAttribute('data-id'));
            deleteReviewById(id);
        });
    });
    
    const total = reviews.reduce((sum, r) => sum + r.rating, 0);
    const avg = total / reviews.length;
    avgRatingSpan.innerText = avg.toFixed(1);
    reviewCountSpan.innerText = reviews.length;
    const fullStars = Math.floor(avg);
    const halfStar = (avg - fullStars) >= 0.5 ? 1 : 0;
    let starsHtml = '★'.repeat(fullStars) + (halfStar ? '½' : '') + '☆'.repeat(5 - fullStars - halfStar);
    avgStarsDisplay.innerHTML = starsHtml;
}

function deleteReviewById(id) {
    reviews = reviews.filter(r => r.id !== id);
    saveReviewsToStorage();
    updateReviewUI();
    showFloatingMessage('🗑️ Review deleted successfully!', 'success');
}

function addReview(name, rating, text) {
    const newReview = {
        id: Date.now(),
        name: name.trim(),
        rating: parseInt(rating),
        text: text.trim(),
        date: new Date().toLocaleDateString()
    };
    reviews.push(newReview);
    saveReviewsToStorage();
    updateReviewUI();
    return true;
}

function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// ========== SEARCH FUNCTIONALITY ==========
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

// ========== CARD CLICK HANDLERS ==========
serviceCards.forEach(card => {
    const titleElement = card.querySelector("h3");
    if (titleElement) {
        const cardTitle = titleElement.innerText;
        card.addEventListener("click", (e) => {
            e.stopPropagation();
            let message = `🔧 ${cardTitle} - Click the pricing button above for details!`;
            showFloatingMessage(message, "info");
            
            if (cardTitle.includes("iPhone Screens")) {
                const btn = document.getElementById("iphoneScreenToggleBtn");
                if (btn) btn.scrollIntoView({ behavior: "smooth", block: "start" });
            } else if (cardTitle.includes("iPhone Battery")) {
                const btn = document.getElementById("iphoneBatteryToggleBtn");
                if (btn) btn.scrollIntoView({ behavior: "smooth", block: "start" });
            } else if (cardTitle.includes("Android")) {
                const btn = document.getElementById("androidToggleBtn");
                if (btn) btn.scrollIntoView({ behavior: "smooth", block: "start" });
            } else {
                const bookingForm = document.querySelector("#bookingForm");
                if (bookingForm) bookingForm.scrollIntoView({ behavior: "smooth", block: "center" });
            }
        });
    }
});

// Laptop cards click handler
const laptopCards = document.querySelectorAll(".laptop-card");
laptopCards.forEach((laptop) => {
    laptop.addEventListener("click", () => {
        const laptopName = laptop.querySelector("h3")?.innerText || "Laptop";
        showFloatingMessage(`🛒 Want to repair a ${laptopName} laptop? Book a repair below!`, "info");
        const bookingForm = document.querySelector("#bookingForm");
        if (bookingForm) {
            bookingForm.scrollIntoView({ behavior: "smooth", block: "center" });
            const deviceInput = document.querySelector("#bookingDevice");
            if (deviceInput) deviceInput.value = laptopName;
        }
    });
});

// ========== FORM HANDLERS ==========
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

// Sell broken laptop handler
const sellBtn = document.getElementById("sellBrokenBtn");
if (sellBtn) {
    sellBtn.addEventListener("click", () => {
        showFloatingMessage("💰 Great! WhatsApp us your laptop model for an instant quote!", "cash");
        const whatsappBtn = document.querySelector(".whatsapp");
        if (whatsappBtn) {
            whatsappBtn.style.animation = "pulseGold 0.5s ease";
            setTimeout(() => { whatsappBtn.style.animation = ""; }, 500);
        }
    });
}

// Submit review handler
const submitReviewBtn = document.getElementById("submitReviewBtn");
if (submitReviewBtn) {
    submitReviewBtn.addEventListener("click", () => {
        const nameInput = document.getElementById("reviewerName");
        const reviewTextarea = document.getElementById("reviewText");
        const selectedRating = document.querySelector('input[name="rating"]:checked');
        
        if (!nameInput || nameInput.value.trim() === "") {
            showFloatingMessage("✨ Please enter your name.", "warning");
            nameInput.focus();
            return;
        }
        if (!selectedRating) {
            showFloatingMessage("⭐ Please select a star rating.", "warning");
            return;
        }
        if (!reviewTextarea || reviewTextarea.value.trim() === "") {
            showFloatingMessage("💬 Please write your review.", "warning");
            reviewTextarea.focus();
            return;
        }
        if (reviewTextarea.value.trim().length < 5) {
            showFloatingMessage("📝 Please write at least 5 characters.", "warning");
            return;
        }
        
        addReview(nameInput.value, selectedRating.value, reviewTextarea.value);
        showFloatingMessage("🎉 Thank you for your review! 🎉", "success");
        
        nameInput.value = "";
        reviewTextarea.value = "";
        if (selectedRating) selectedRating.checked = false;
    });
}

// ========== FLOATING MESSAGE FUNCTION ==========
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

// ========== SCROLL ANIMATION OBSERVER ==========
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.animation = "fadeSlideUp 0.5s ease forwards";
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll(".card, .pricing-showcase, .gallery-item, .form-card, .laptop-card, .buy-broken-card, .doctor-profile, .reviews-section").forEach(el => {
    el.style.opacity = "0";
    observer.observe(el);
});

// ========== INITIALIZATION ==========
document.addEventListener('DOMContentLoaded', function() {
    // Initialize collapsible sections
    const iphoneScreenSection = document.getElementById('iphoneScreenPricing');
    const iphoneBatterySection = document.getElementById('iphoneBatteryPricing');
    const androidSection = document.getElementById('androidPricing');
    
    const sections = [iphoneScreenSection, iphoneBatterySection, androidSection];
    sections.forEach(section => {
        if (section) {
            section.style.maxHeight = '0';
            section.style.opacity = '0';
            section.style.overflow = 'hidden';
            section.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
            section.style.padding = '0 1.8rem';
            section.style.margin = '0';
            section.classList.remove('open');
        }
    });
    
    // Load reviews
    loadReviewsFromStorage();
    
    // Enhance search placeholder
    if (searchInput) {
        searchInput.addEventListener("focus", () => {
            searchInput.placeholder = "e.g., 'iPhone screen', 'RAM', 'Battery' ...";
        });
        searchInput.addEventListener("blur", () => {
            searchInput.placeholder = "Search repairs... (e.g., RAM, Screen, Battery)";
        });
    }
    
    console.log("The-O-Hub — Fully functional repair website with review system!");
});
