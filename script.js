// Enkel JS för scroll, formulärmeddelande, årtal och GA4-events

const SHEET_WEBAPP_URL = "https://script.google.com/macros/s/AKfycbz2C12RGtULRbjQ0nSz7Oq9b4UqqzXgwuaBeGorcWyZ2bNbQ8NsjhsfptarRSf5fwDViQ/exec";

document.addEventListener("DOMContentLoaded", function () {
  const ctaButton = document.getElementById("cta-button");
  const pricingCta = document.getElementById("pricing-cta");
  const bookingSection = document.getElementById("booking");
  const bookingForm = document.getElementById("booking-form");
  const formMessage = document.getElementById("form-message");
  const yearSpan = document.getElementById("year");
  const granInfoLink = document.getElementById("gran-info-link");

  // Wrapper runt gtag så sidan inte kraschar om GA saknas
  function trackEvent(name, params) {
    if (typeof gtag === "function") {
      gtag("event", name, params || {});
    }
  }

  // Sätt aktuellt år i footern
  if (yearSpan) {
    const currentYear = new Date().getFullYear();
    yearSpan.textContent = currentYear;
  }

  // Scrolla ner till bokningsdelen
  function scrollToBooking() {
    if (!bookingSection) return;
    bookingSection.scrollIntoView({ behavior: "smooth" });
  }

  if (ctaButton) {
    ctaButton.addEventListener("click", function () {
      scrollToBooking();
      // GA4: booking_start från hero
      trackEvent("booking_start", { cta_location: "hero" });
    });
  }

  if (pricingCta) {
    pricingCta.addEventListener("click", function () {
      scrollToBooking();
      // GA4: booking_start från pris-kortet
      trackEvent("booking_start", { cta_location: "pricing" });
    });
  }

  if (granInfoLink) {
    granInfoLink.addEventListener("click", function (event) {
      event.preventDefault();
      alert(
        "Exempel: Granen transporteras till en återvinningsanläggning, flisas och används som biobränsle eller kompost. (Skoluppgift – ingen riktig hantering sker.)"
      );
      // GA4: klick på info-länken
      trackEvent("gran_info_clicked");
    });
  }

// Fånga formuläret (förenklad fejk-submit för kurs)
if (bookingForm) {
  bookingForm.addEventListener("submit", function (event) {
    event.preventDefault(); // stoppar riktig submit

    const name = document.getElementById("name").value.trim();
    const address = document.getElementById("address").value.trim();
    const zipcode = document.getElementById("zipcode").value.trim();
    const city = document.getElementById("city").value.trim();
    const date = document.getElementById("date").value;
    const email = document.getElementById("email").value.trim();
    const terms = document.getElementById("terms").checked;

    // enkel validering
    if (!name || !address || !zipcode || !city || !date || !email) {
      formMessage.textContent =
        "Fyll i alla obligatoriska fält (*) innan du skickar.";
      formMessage.style.color = "#f25b5b";
      return;
    }

    if (!terms) {
      formMessage.textContent = "Du måste godkänna villkoren.";
      formMessage.style.color = "#f25b5b";
      return;
    }

    // UI: visa direkt att något händer
    formMessage.textContent = "Skickar bokningsförfrågan...";
    formMessage.style.color = "#ffffff";

    // Payload till Google Sheet-backend (PII stannar där)
    const payload = {
      address: address,
      zipcode: zipcode,
      city: city,
      // valfritt: för analys i sheet (kan tas bort)
      pickup_date: date,
      price: 299
    };

    // 1) Skicka till Sheets (Apps Script Web App) för returning-check
    fetch(SHEET_WEBAPP_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
      .then((r) => r.json())
      .then((data) => {
        const isReturning = !!data.returning;

        // 2) GA4: huvudkonvertering (som du redan har)
        trackEvent("booking_complete", {
          service_type: "standard",
          zipcode: zipcode,
          city: city,
          pickup_date: date,
          price: 299,
        });

        // 3) GA4: PII-fritt returning-event
        trackEvent("returning_booking", {
          returning: isReturning ? "yes" : "no"
        });

        // 4) UI-feedback (för skol-demo)
        formMessage.textContent = isReturning
          ? "Tack! Din bokningsförfrågan är skickad. (Demo: vi ser att detta verkar vara en återkommande adress från förra året.)"
          : "Tack! Din bokningsförfrågan är skickad. (Fejk för demo)";
        formMessage.style.color = "#1fd38a";

        bookingForm.reset();

        setTimeout(() => {
          formMessage.textContent = "";
        }, 6000);
      })
      .catch(() => {
        // Fallback: om Sheets-backenden failar, logga ändå booking_complete
        trackEvent("booking_complete", {
          service_type: "standard",
          zipcode: zipcode,
          city: city,
          pickup_date: date,
          price: 299,
        });

        formMessage.textContent =
          "Tack! Din bokningsförfrågan är skickad. (Demo – kunde inte verifiera återkommande adress just nu)";
        formMessage.style.color = "#1fd38a";

        bookingForm.reset();

        setTimeout(() => {
          formMessage.textContent = "";
        }, 6000);
      });
  });
}
