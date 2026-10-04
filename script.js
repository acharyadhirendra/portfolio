"use strict";

// Set to your real email address
const CONTACT_EMAIL = "your-email@example.com";

// 1. Footer year
document.getElementById("year").textContent = new Date().getFullYear();

// 2. Mobile menu
const menuBtn = document.querySelector(".menu-btn");
const nav = document.getElementById("nav");

function setMenu(open) {
  nav.classList.toggle("open", open);
  menuBtn.setAttribute("aria-expanded", String(open));
  menuBtn.textContent = open ? "Close" : "Menu";
}

menuBtn.addEventListener("click", () => {
  setMenu(!nav.classList.contains("open"));
});

nav.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => setMenu(false));
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") setMenu(false);
});

// 3. Highlight the nav link for the section in view
const navLinks = [...nav.querySelectorAll("a")];
const sections = navLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((link) => {
        link.classList.toggle(
          "active",
          link.getAttribute("href") === "#" + entry.target.id
        );
      });
    });
  },
  { rootMargin: "-40% 0px -55% 0px" }
);

sections.forEach((section) => observer.observe(section));

// 4. Hide the portrait photo if the file is missing, so the initials show
const portraitImg = document.querySelector(".portrait img");
portraitImg.addEventListener("error", () => portraitImg.remove());

// 5. Contact form: validate, then open the visitor's email app
const form = document.getElementById("contact-form");
const status = form.querySelector(".form-status");

const rules = {
  name: (v) => (v.trim().length >= 2 ? "" : "Enter your name."),
  email: (v) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())
      ? ""
      : "Enter a valid email address, like name@example.com.",
  message: (v) =>
    v.trim().length >= 10 ? "" : "Write a message of at least 10 characters.",
};

function validateField(field) {
  const message = rules[field.name](field.value);
  form.querySelector(`[data-for="${field.name}"]`).textContent = message;
  field.setAttribute("aria-invalid", message ? "true" : "false");
  return !message;
}

Object.keys(rules).forEach((name) => {
  const field = form.elements[name];
  field.addEventListener("blur", () => validateField(field));
  field.addEventListener("input", () => {
    if (field.getAttribute("aria-invalid") === "true") validateField(field);
  });
});

form.addEventListener("submit", (e) => {
  e.preventDefault();
  status.textContent = "";

  const fields = Object.keys(rules).map((name) => form.elements[name]);
  const results = fields.map(validateField);
  const firstInvalid = fields[results.indexOf(false)];

  if (firstInvalid) {
    firstInvalid.focus();
    return;
  }

  const subject = encodeURIComponent("Portfolio message from " + form.elements.name.value.trim());
  const body = encodeURIComponent(
    form.elements.message.value.trim() +
      "\n\nFrom: " + form.elements.name.value.trim() +
      " (" + form.elements.email.value.trim() + ")"
  );

  window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
  status.textContent = "Opening your email app to send the message.";
  form.reset();
  fields.forEach((f) => f.removeAttribute("aria-invalid"));
});