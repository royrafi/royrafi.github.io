document
  .getElementById("contactForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const message = document.getElementById("message").value.trim();
    const formFeedback = document.getElementById("formFeedback");

    formFeedback.classList.add("hidden"); // Hide feedback initially

    if (name && email && message) {
      // Simulate form submission
      formFeedback.textContent =
        "Thank you for your message, " +
        name +
        "! I will get back to you soon.";
      formFeedback.className = "text-green-500 mt-4";
      formFeedback.classList.remove("hidden");
      this.reset(); // Clear the form fields
    } else {
      formFeedback.textContent = "Please fill out all fields.";
      formFeedback.className = "text-red-500 mt-4";
      formFeedback.classList.remove("hidden");
    }
  });
