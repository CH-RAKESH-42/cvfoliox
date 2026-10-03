const createClient = window.supabase?.createClient || window.createClient || null;

const SUPABASE_URL = "https://kkoxwexpyklequnggehf.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_YfzSToiBLw_ygRwfP4DLdQ_ao-hQORG";
const hasSupabaseConfig = SUPABASE_URL.startsWith("https://") &&
    !SUPABASE_URL.includes("YOUR_") &&
    !SUPABASE_ANON_KEY.includes("YOUR_");
const supabaseClient = hasSupabaseConfig && createClient ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

const defaultContent = {
    name: "Chamakuri Rakesh",
    role: "Aspiring Python Developer",
    about: "I am a motivated aspiring Python developer who enjoys solving real-world problems with clean, practical code. I like turning ideas into working apps, learning by building, and continuously improving my skills in backend logic, automation, and web development.",
    education: [
        {
            title: "Bachelor of Technology / Relevant Degree",
            place: "College or University",
            detail: "Focused on fundamentals in programming, problem solving, software development, and technology-driven learning.",
            date: "2021 - 2025"
        }
    ],
    achievements: [
        {
            title: "Python & Web Development Learning Journey",
            detail: "Built various projects that strengthened my understanding of Python, JavaScript, HTML, CSS, and full-stack project workflows.",
            date: "2024 - 2025"
        },
        {
            title: "Portfolio Project",
            detail: "Created a portfolio website to showcase my projects, education, technical skills, and professional growth.",
            date: "2025"
        }
    ],
    projects: [
        {
            title: "Portfolio Website",
            detail: "Designed and developed a personal portfolio to present my background, education, achievements, and technical work in a clean, modern layout.",
            technologies: "HTML, CSS, JavaScript",
            url: ""
        },
        {
            title: "Python Utility Projects",
            detail: "Explored automation, data handling, and backend scripts to improve productivity and practice real-world problem solving with Python.",
            technologies: "Python, Automation",
            url: ""
        },
        {
            title: "Small Web Applications",
            detail: "Worked on learning-focused web projects to strengthen frontend design skills, layout logic, and user experience principles.",
            technologies: "HTML, CSS, JavaScript",
            url: ""
        }
    ],
    skills: ["Python", "HTML", "CSS", "JavaScript", "Git", "GitHub", "SQL", "Supabase", "Problem Solving"],
    resume: {
        description: "Open to internships, junior developer roles, and learning opportunities where I can contribute and keep growing as a software developer.",
        url: ""
    },
    contact: {
        description: "I’m open to collaborations, internships, and opportunities where I can contribute with code and learn from a strong team.",
        email: "rakesh.dev@example.com"
    },
    socials: {
        github: "https://github.com/",
        linkedin: "https://www.linkedin.com/",
        instagram: "https://www.instagram.com/"
    }
};

let portfolio = structuredClone(defaultContent);
let activeSection = "home";
const LOCAL_PORTFOLIO_KEY = "portfolio_local_content";

const $ = (selector) => document.querySelector(selector);
const sections = [...document.querySelectorAll(".page-section, .content-section")];
const navLinks = [...document.querySelectorAll(".nav-link")];
const loginDialog = $("#loginDialog");
const editorDialog = $("#editorDialog");

function loadLocalPortfolio() {
    try {
        const raw = localStorage.getItem(LOCAL_PORTFOLIO_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object") {
            return { ...structuredClone(defaultContent), ...parsed };
        }
    } catch (error) {
        console.warn("Saved local portfolio could not be read:", error);
    }
    return null;
}

function saveLocalPortfolio(content) {
    localStorage.setItem(LOCAL_PORTFOLIO_KEY, JSON.stringify(content));
}

function safeExternalUrl(value) {
    if (typeof value !== "string") return "";
    try {
        const url = new URL(value);
        return ["https:", "http:"].includes(url.protocol) ? url.href : "";
    } catch {
        return "";
    }
}

function resolveSocialUrl(key, value) {
    const fallbackMap = {
        github: "https://github.com/",
        linkedin: "https://www.linkedin.com/",
        instagram: "https://www.instagram.com/"
    };
    const fallback = fallbackMap[key] || "";

    if (typeof value !== "string" || !value.trim()) return fallback;

    const trimmed = value.trim();
    if (trimmed.includes("your-username")) return fallback;

    return safeExternalUrl(trimmed) || fallback;
}

function showSection(sectionId, updateHistory = true) {
    const target = sections.find((section) => section.id === sectionId);
    if (!target) return;

    activeSection = sectionId;
    sections.forEach((section) => {
        section.classList.toggle("active-section", section.id === sectionId);
        section.hidden = section.id !== sectionId;
    });
    navLinks.forEach((link) => link.classList.toggle("active", link.dataset.section === sectionId));

    if (updateHistory && window.location.hash !== `#${sectionId}`) {
        history.pushState(null, "", `#${sectionId}`);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
}

function addTextElement(parent, tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    element.textContent = text ?? "";
    parent.append(element);
    return element;
}

function renderSocials() {
    const container = $("#socialLinks");
    container.replaceChildren();
    const accounts = [
        ["github", "GitHub", "fa-brands fa-github"],
        ["linkedin", "LinkedIn", "fa-brands fa-linkedin-in"],
        ["instagram", "Instagram", "fa-brands fa-instagram"]
    ];
    accounts.forEach(([key, label, icon]) => {
        const url = resolveSocialUrl(key, portfolio.socials?.[key]);
        const link = document.createElement("a");
        link.className = "social-link";
        const isPlaceholder = !url || url.includes("your-username");
        if (isPlaceholder) {
            link.classList.add("is-placeholder");
            link.href = "#";
            link.title = `Add your ${label} URL in the owner editor`;
            link.addEventListener("click", (event) => event.preventDefault());
        } else {
            link.href = url;
            link.target = "_blank";
            link.rel = "noopener noreferrer";
        }
        link.setAttribute("aria-label", label);
        const glyph = document.createElement("i");
        glyph.className = icon;
        glyph.setAttribute("aria-hidden", "true");
        link.append(glyph);
        container.append(link);
    });
}

function renderList(target, entries, projectMode = false) {
    target.replaceChildren();
    if (!Array.isArray(entries)) return;
    entries.forEach((entry) => {
        const item = document.createElement("article");
        item.className = "portfolio-item";
        const title = typeof entry === "string" ? entry : entry.title;
        addTextElement(item, "h3", "", title || "Portfolio item");
        if (entry.date || entry.place || entry.technologies) {
            addTextElement(item, "span", "item-meta", [entry.date, entry.place, entry.technologies].filter(Boolean).join(" · "));
        }
        const details = typeof entry === "string" ? "" : entry.detail;
        if (details) addTextElement(item, "p", "", details);
        const url = projectMode ? safeExternalUrl(entry.url) : "";
        if (url) {
            const link = addTextElement(item, "a", "", "View project ↗");
            link.href = url;
            link.target = "_blank";
            link.rel = "noopener noreferrer";
        }
        target.append(item);
    });
}

function renderPortfolio() {
    $("#heroName").textContent = portfolio.name || defaultContent.name;
    document.title = `${portfolio.name || defaultContent.name} | Portfolio`;
    $("#heroRole").textContent = portfolio.role || defaultContent.role;
    $("#aboutContent").textContent = portfolio.about || "Add your introduction in the owner editor.";
    renderList($("#educationContent"), portfolio.education);
    renderList($("#achievementsContent"), portfolio.achievements);
    renderList($("#projectsContent"), portfolio.projects, true);

    const skills = $("#skillsContent");
    skills.replaceChildren();
    (Array.isArray(portfolio.skills) ? portfolio.skills : []).forEach((skill) => {
        addTextElement(skills, "span", "skill-tag", skill);
    });

    $("#resumeDescription").textContent = portfolio.resume?.description || "Add a resume description in the owner editor.";
    const resumeUrl = safeExternalUrl(portfolio.resume?.url);
    $("#resumeLink").hidden = !resumeUrl;
    if (resumeUrl) $("#resumeLink").href = resumeUrl;

    $("#contactDescription").textContent = portfolio.contact?.description || "";
    const email = portfolio.contact?.email || "";
    const emailLink = $("#contactEmail");
    emailLink.hidden = !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!emailLink.hidden) {
        emailLink.href = `mailto:${email}`;
        emailLink.textContent = email;
    }
    renderSocials();
}

function setMessage(element, text, isError = false) {
    element.textContent = text;
    element.classList.toggle("error", isError);
}

function setOwnerMode(isOwner) {
    $("#ownerControls").hidden = !isOwner;
    $("#ownerLoginTrigger").hidden = isOwner;
    document.querySelectorAll("[data-open-editor]").forEach((button) => {
        button.hidden = !isOwner;
    });
}

async function loadPortfolio() {
    if (!supabaseClient) {
        const localContent = loadLocalPortfolio();
        if (localContent) {
            portfolio = localContent;
            renderPortfolio();
        }
        return;
    }
    const { data, error } = await supabaseClient
        .from("portfolio_content")
        .select("content")
        .eq("id", true)
        .maybeSingle();
    if (error) {
        console.error("Could not load portfolio content:", error.message);
        return;
    }
    if (data?.content && typeof data.content === "object") {
        portfolio = { ...structuredClone(defaultContent), ...data.content };
        renderPortfolio();
    }
}

async function checkOwnerSession() {
    if (!supabaseClient) return;
    const { data } = await supabaseClient.auth.getSession();
    setOwnerMode(Boolean(data.session));
    supabaseClient.auth.onAuthStateChange((_event, session) => {
        setOwnerMode(Boolean(session));
    });
}

function validateContent(value) {
    const requiredStrings = ["name", "role", "about"];
    for (const key of requiredStrings) {
        if (typeof value[key] !== "string" || !value[key].trim()) {
            throw new Error(`"${key}" must be a non-empty string.`);
        }
    }
    for (const key of ["education", "achievements", "projects", "skills"]) {
        if (!Array.isArray(value[key])) throw new Error(`"${key}" must be a JSON array.`);
    }
    for (const key of ["resume", "contact", "socials"]) {
        if (!value[key] || typeof value[key] !== "object" || Array.isArray(value[key])) {
            throw new Error(`"${key}" must be a JSON object.`);
        }
    }
    return value;
}

document.addEventListener("DOMContentLoaded", async () => {
    $("#currentYear").textContent = new Date().getFullYear();
    setOwnerMode(false);
    renderPortfolio();

    const initialSection = window.location.hash.slice(1);
    showSection(sections.some((section) => section.id === initialSection) ? initialSection : "home", false);

    document.querySelectorAll("[data-section]").forEach((button) => {
        button.addEventListener("click", () => showSection(button.dataset.section));
    });
    window.addEventListener("popstate", () => {
        const sectionId = window.location.hash.slice(1);
        showSection(sections.some((section) => section.id === sectionId) ? sectionId : "home", false);
    });

    document.querySelectorAll("[data-close-dialog]").forEach((button) => {
        button.addEventListener("click", () => document.getElementById(button.dataset.closeDialog).close());
    });
    [loginDialog, editorDialog].forEach((dialog) => {
        dialog.addEventListener("click", (event) => {
            if (event.target === dialog) dialog.close();
        });
    });

    $("#ownerLoginTrigger").addEventListener("click", () => {
        if (!supabaseClient) {
            setMessage($("#loginMessage"), "Add your Supabase project URL and anon key in script.js, then set up the database.", true);
        } else {
            setMessage($("#loginMessage"), "");
        }
        loginDialog.showModal();
    });

    $("#loginForm").addEventListener("submit", async (event) => {
        event.preventDefault();
        if (!supabaseClient) return;
        const submit = event.currentTarget.querySelector("[type=submit]");
        submit.disabled = true;
        setMessage($("#loginMessage"), "Signing in…");
        const { error } = await supabaseClient.auth.signInWithPassword({
            email: $("#ownerEmail").value.trim(),
            password: $("#ownerPassword").value
        });
        submit.disabled = false;
        if (error) {
            setMessage($("#loginMessage"), `Login failed: ${error.message}`, true);
            return;
        }
        event.currentTarget.reset();
        loginDialog.close();
        await loadPortfolio();
    });

    document.querySelectorAll("#editPortfolioButton, [data-open-editor]").forEach((button) => {
        button.addEventListener("click", () => {
        $("#portfolioJson").value = JSON.stringify(portfolio, null, 2);
        setMessage($("#editorMessage"), "");
        editorDialog.showModal();
        });
    });

    $("#editorForm").addEventListener("submit", async (event) => {
        event.preventDefault();
        const message = $("#editorMessage");
        let updatedContent;
        try {
            updatedContent = validateContent(JSON.parse($("#portfolioJson").value));
        } catch (error) {
            setMessage(message, error.message || "Please check the JSON syntax.", true);
            return;
        }
        if (!supabaseClient) {
            saveLocalPortfolio(updatedContent);
            portfolio = updatedContent;
            renderPortfolio();
            setMessage(message, "Saved locally. Your portfolio is updated in this browser.");
            return;
        }
        const submit = event.currentTarget.querySelector("[type=submit]");
        submit.disabled = true;
        setMessage(message, "Saving…");
        const { data: sessionData } = await supabaseClient.auth.getSession();
        if (!sessionData.session) {
            submit.disabled = false;
            setOwnerMode(false);
            setMessage(message, "Your owner session ended. Sign in again.", true);
            return;
        }
        const { data, error } = await supabaseClient
            .from("portfolio_content")
            .update({ content: updatedContent })
            .eq("id", true)
            .select("id");
        submit.disabled = false;
        if (error || !data?.length) {
            setMessage(message, error ? `Save failed: ${error.message}` : "Save failed: no portfolio row was updated. Check the owner account in Supabase.", true);
            return;
        }
        portfolio = updatedContent;
        renderPortfolio();
        setMessage(message, "Saved. Your public portfolio is updated.");
    });

    $("#signOutButton").addEventListener("click", async () => {
        if (supabaseClient) await supabaseClient.auth.signOut();
        setOwnerMode(false);
    });

    await Promise.all([loadPortfolio(), checkOwnerSession()]);
});
