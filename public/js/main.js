// ===============================
// main.js for TogetAI
// ===============================

// ---------- Smooth Scrolling ----------
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", function (e) {
        if (this.getAttribute("href") !== "#") {
            e.preventDefault();
            document.querySelector(this.getAttribute("href")).scrollIntoView({
                behavior: "smooth"
            });
        }
    });
});

// ---------- Typewriter Headline ----------
function typeWriterEffect(element, text, speed = 100) {
    let i = 0;
    function typing() {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
            setTimeout(typing, speed);
        }
    }
    typing();
}
const headline = document.querySelector(".typewriter");
if (headline) {
    const text = headline.getAttribute("data-text") || "Welcome to TogetAI";
    headline.innerHTML = "";
    typeWriterEffect(headline, text, 80);
}

// ---------- Floating Smiley Animation ----------
function floatingEmoji() {
    const container = document.body;
    const emoji = document.createElement("div");
    emoji.textContent = "😊";
    emoji.classList.add("floating-emoji");

    emoji.style.left = Math.random() * window.innerWidth + "px";
    container.appendChild(emoji);

    setTimeout(() => {
        emoji.remove();
    }, 5000);
}
setInterval(floatingEmoji, 4000);

// ---------- Fade-in on Scroll ----------
const faders = document.querySelectorAll(".fade-in");
const appearOptions = { threshold: 0.2, rootMargin: "0px 0px -50px 0px" };

const appearOnScroll = new IntersectionObserver(function (entries, observer) {
    entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("appear");
        observer.unobserve(entry.target);
    });
}, appearOptions);

faders.forEach(fader => {
    appearOnScroll.observe(fader);
});

// ---------- AI Agent Modal ----------
const aiBtn = document.querySelector("#open-ai-agent");
const aiModal = document.querySelector("#ai-agent-modal");
const closeBtn = document.querySelector("#close-ai-agent");

if (aiBtn && aiModal && closeBtn) {
    aiBtn.addEventListener("click", () => {
        aiModal.classList.add("show");
    });

    closeBtn.addEventListener("click", () => {
        aiModal.classList.remove("show");
    });

    window.addEventListener("click", (e) => {
        if (e.target === aiModal) {
            aiModal.classList.remove("show");
        }
    });
}

// ---------- Feedback Form Submission ----------
const feedbackForm = document.getElementById("feedbackForm");
if (feedbackForm) {
    feedbackForm.addEventListener("submit", async function (e) {
        e.preventDefault();

        const formData = {
            creatorType: document.getElementById("creatorType").value,
            name: document.getElementById("name").value,
            email: document.getElementById("email").value,
            instagram: document.getElementById("instagram").value,
            rating: document.getElementById("rating").value,
            message: document.getElementById("message").value
        };

        try {
            const response = await fetch("/submit-feedback", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                alert("Thank you for your feedback!");
                feedbackForm.reset();
            } else {
                alert("Something went wrong. Please try again.");
            }
        } catch (err) {
            console.error(err);
            alert("Error connecting to server.");
        }
    });
}

// ---------- Extra Futuristic Animation ----------
document.addEventListener("mousemove", (e) => {
    const cursor = document.querySelector(".cursor-glow");
    if (cursor) {
        cursor.style.top = e.pageY + "px";
        cursor.style.left = e.pageX + "px";
    }
});