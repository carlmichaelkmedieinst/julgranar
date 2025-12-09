// Enkel JS för scroll, formulärmeddelande och årtal

document.addEventListener("DOMContentLoaded", function () {
  const ctaButton = document.getElementById("cta-button");
  const pricingCta = document.getElementById("pricing-cta");
  const bookingSection = document.getElementById("booking");
  const bookingForm = document.getElementById("booking-form");
  const formMessage = document.getElementById("form-message");
  const yearSpan = document.getElementById("year");

  // Sätt aktuellt år i footern
  const currentYear = new Date().getFullYear();
  yearSpan.textContent = currentYear;

  // Scrolla ner till bokningsdelen
  function scrollToBooking() {
    if (!bookingSection) return;
    bookingSection.scrollIntoView({ behavior: "smooth" });
  }

  if (ctaButton) {
    ctaButton.addEventListener("click", scrollToBooking);
  }

  if (pricingCta) {
    pricingCta.addEventListener("click", scrollToBooking);
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
        formMessage.textContent = "Fyll i alla obligatoriska fält (*) innan du skickar.";
        formMessage.style.color = "#f25b5b";
        return;
      }

      if (!terms) {
        formMessage.textContent = "Du måste godkänna villkoren.";
        formMessage.style.color = "#f25b5b";
        return;
      }

      // Här hade du i verkligheten skickat till server / API.
      // För kurs/vibe-läge: visa bara ett "tack"-meddelande.
      formMessage.textContent = "Tack! Din bokningsförfrågan är skickad. (Fejk för demo)";
      formMessage.style.color = "#1fd38a";

      // Töm formuläret lite snyggt
      bookingForm.reset();

      // Ta bort meddelandet efter en stund (frivilligt)
      setTimeout(() => {
        formMessage.textContent = "";
      }, 6000);
    });
  }
});
