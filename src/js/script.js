// ========== JSONBin.io CONFIGURATION ==========
const JSONBIN_BIN_ID = "69fa543936566621a82beb26";  // BIN ID
const JSONBIN_API_KEY = "$2a$10$s4WYHMR7tDGutbSmYTI2FOZ4xUEvBgAiaxnS/DoUlUl/kFWi.DBDW";  // API KEY

// ========== GLOBAL VARIABLES ==========
let reviews = [];
let isOnline = navigator.onLine;
let syncInProgress = false;

// ========== CLOUD SYNC FUNCTIONS ==========
function updateCloudStatus(message, type = "syncing") {
    const statusDiv = document.getElementById('cloudSyncStatus');
    if (!statusDiv) return;
    
    if (type === "syncing") {
        statusDiv.innerHTML = `<i class="fas fa-cloud-upload-alt fa-fw"></i> ${message}`;
        statusDiv.className = "cloud-status";
        statusDiv.style.color = "var(--primary)";
    } else if (type === "success") {
        statusDiv.innerHTML = `<i class="fas fa-check-circle fa-fw"></i> ${message}`;
        statusDiv.className = "cloud-status success";
        setTimeout(() => {
            if (statusDiv.innerHTML.includes("Synced")) {
                statusDiv.style.opacity = "0.5";
            }
        }, 3000);
    } else if (type === "error") {
        statusDiv.innerHTML = `<i class="fas fa-exclamation-triangle fa-fw"></i> ${message}`;
        statusDiv.className = "cloud-status error";
    }
}

// Load reviews from JSONBin cloud
async function loadReviewsFromCloud() {
    if (!JSONBIN_BIN_ID || JSONBIN_BIN_ID === "69fa543936566621a82beb26") {
        console.warn("JSONBin not configured, using localStorage fallback");
        loadReviewsFromLocal();
        updateCloudStatus("Demo mode - Reviews saved locally only", "error");
        return;
    }
    
    updateCloudStatus("Syncing with cloud...", "syncing");
    
    try {
        const response = await fetch(`https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}/latest`, {
            method: 'GET',
            headers: {
                'X-Master-Key': JSONBIN_API_KEY,
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const data = await response.json();
        
        if (data.record && data.record.reviews) {
            reviews = data.record.reviews;
            // Also save to localStorage as backup
            localStorage.setItem('theOhubReviews', JSON.stringify(reviews));
            updateCloudStatus(`✓ Synced ${reviews.length} reviews from cloud`, "success");
        } else {
            // No reviews in cloud yet, check localStorage
            loadReviewsFromLocal();
        }
    } catch (error) {
        console.error("Cloud sync error:", error);
        updateCloudStatus("⚠️ Offline mode - Using local reviews", "error");
        loadReviewsFromLocal();
    }
    
    updateReviewUI();
    updateDoctorStats();
}

// Load reviews from localStorage (fallback)
function loadReviewsFromLocal() {
    const stored = localStorage.getItem('theOhubReviews');
    if (stored) {
        reviews = JSON.parse(stored);
    } else {
        // Default reviews
        reviews = [
            { id: Date.now() + 1, name: "Thabo Mbeki", rating: 5, text: "Fixed my water-damaged iPhone in 2 hours! Amazing service!", date: new Date().toLocaleDateString() },
            { id: Date.now() + 2, name: "Lerato Smith", rating: 4, text: "SSD upgrade made my laptop fly. Very professional.", date: new Date().toLocaleDateString() },
            { id: Date.now() + 3, name: "Sipho Dlamini", rating: 5, text: "Best repair shop in Joburg! My MacBook works like new.", date: new Date().toLocaleDateString() }
        ];
        saveReviewsToLocal();
    }
}

// Save reviews to JSONBin cloud
async function saveReviewsToCloud() {
    if (!JSONBIN_BIN_ID || JSONBIN_BIN_ID === "69fa543936566621a82beb26") {
        saveReviewsToLocal();
        return;
    }
    
    if (syncInProgress) return;
    syncInProgress = true;
    
    try {
        const response = await fetch(`https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}`, {
            method: 'PUT',
            headers: {
                'X-Master-Key': JSONBIN_API_KEY,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ reviews: reviews })
        });
        
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        updateCloudStatus("✓ Synced to cloud", "success");
        // Also save to localStorage as backup
        saveReviewsToLocal();
    } catch (error) {
        console.error("Cloud save error:", error);
        updateCloudStatus("⚠️ Saved locally (offline)", "error");
        saveReviewsToLocal();
    } finally {
        syncInProgress = false;
    }
}

// Save reviews to localStorage (backup)
function saveReviewsToLocal() {
    localStorage.setItem('theOhubReviews', JSON.stringify(reviews));
}

// Main save function (tries cloud, falls back to local)
async function saveReviews() {
    await saveReviewsToCloud();
}

// ========== REVIEW SYSTEM WITH DOCTOR PROFILE SYNC ==========
function updateDoctorStats() {
    const doctorStatsContainer = document.getElementById('doctorStats');
    if (!doctorStatsContainer) return;
    
    const totalReviews = reviews.length;
    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = totalReviews > 0 ? (totalRating / totalReviews).toFixed(2) : 0;
    
    // Calculate number of devices fixed (estimate based on reviews)
    const devicesFixed = totalReviews * 2;
    
    // Update the doctor stats HTML
    doctorStatsContainer.innerHTML = `
        <div class="stat"><i class="fas fa-wrench"></i> ${devicesFixed}+ Devices Fixed</div>
        <div class="stat"><i class="fas fa-star"></i> ${averageRating} ⭐ (${totalReviews} reviews)</div>
        <div class="stat"><i class="fas fa-certificate"></i> Apple & Samsung Certified</div>
    `;
    
    // Update the doctor-title area with live rating
    const doctorTitle = document.querySelector('.doctor-title');
    if (doctorTitle) {
        let existingRating = doctorTitle.querySelector('.live-rating');
        if (!existingRating) {
            existingRating = document.createElement('span');
            existingRating.className = 'live-rating';
            doctorTitle.appendChild(existingRating);
        }
        if (totalReviews > 0) {
            existingRating.innerHTML = ` | ⭐ ${averageRating}/5 (${totalReviews} reviews)`;
        } else {
            existingRating.innerHTML = ` | ⭐ No reviews yet`;
        }
    }
    
    // Update doctor badge based on review count
    const doctorBadge = document.querySelector('.doctor-badge');
    if (doctorBadge) {
        if (totalReviews >= 10) {
            doctorBadge.innerHTML = '<i class="fas fa-check-circle"></i> Verified Pro';
            doctorBadge.style.background = '#10b981';
        } else if (totalReviews >= 5) {
            doctorBadge.innerHTML = '<i class="fas fa-star"></i> Rising Star';
            doctorBadge.style.background = '#fbbf24';
            doctorBadge.style.color = '#0f172a';
        } else {
            doctorBadge.innerHTML = '<i class="fas fa-stethoscope"></i> Repair Doctor';
            doctorBadge.style.background = 'var(--primary)';
            doctorBadge.style.color = '#0f172a';
        }
    }
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
        updateDoctorStats();
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
                
            </div>
        </div>
    `).join('');
    
    document.querySelectorAll('.delete-review').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const id = parseInt(btn.getAttribute('data-id'));
            await deleteReviewById(id);
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
    
    updateDoctorStats();
}

async function deleteReviewById(id) {
    reviews = reviews.filter(r => r.id !== id);
    await saveReviews();
    updateReviewUI();
    showFloatingMessage('🗑️ Review deleted successfully!', 'success');
}

async function addReview(name, rating, text) {
    const newReview = {
        id: Date.now(),
        name: name.trim(),
        rating: parseInt(rating),
        text: text.trim(),
        date: new Date().toLocaleDateString()
    };
    reviews.push(newReview);
    await saveReviews();
    updateReviewUI();
    
    // Show special message for milestone reviews
    if (reviews.length === 5) {
        showFloatingMessage('🎉 5 reviews! You\'re helping us grow! 🎉', 'success');
    } else if (reviews.length === 10) {
        showFloatingMessage('🏆 10 reviews! Thank you for your trust! 🏆', 'success');
    } else {
        showFloatingMessage('🎉 Thank you for your review! 🎉', 'success');
    }
    
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
    submitReviewBtn.addEventListener("click", async () => {
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
        
        await addReview(nameInput.value, selectedRating.value, reviewTextarea.value);
        
        // Clear form
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

// ========== ONLINE/OFFLINE DETECTION ==========
window.addEventListener('online', () => {
    showFloatingMessage("🌐 Back online! Syncing reviews...", "success");
    loadReviewsFromCloud();
});

window.addEventListener('offline', () => {
    showFloatingMessage("📡 You're offline. Reviews saved locally.", "warning");
    updateCloudStatus("Offline mode", "error");
});

// ========== INITIALIZATION ==========
document.addEventListener('DOMContentLoaded', async function() {
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
    
    // Load reviews from cloud
    await loadReviewsFromCloud();
    
    // Enhance search placeholder
    if (searchInput) {
        searchInput.addEventListener("focus", () => {
            searchInput.placeholder = "e.g., 'iPhone screen', 'RAM', 'Battery' ...";
        });
        searchInput.addEventListener("blur", () => {
            searchInput.placeholder = "Search repairs... (e.g., RAM, Screen, Battery)";
        });
    }
    
    // Add offline indicator if needed
    if (!navigator.onLine) {
        const offlineBadge = document.createElement('div');
        offlineBadge.className = 'offline-badge';
        offlineBadge.innerHTML = '<i class="fas fa-wifi"></i> Offline Mode';
        document.body.appendChild(offlineBadge);
    }
    
    console.log("The-O-Hub — Cloud-synced reviews & doctor profile connected!");
});
