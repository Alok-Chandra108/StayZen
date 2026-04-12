(function () {
    'use strict';
  
    // Fetch all the forms we want to apply custom Bootstrap validation styles to
    const forms = document.querySelectorAll('.needs-validation');
  
    // Loop over them and prevent submission
    Array.prototype.slice.call(forms)
      .forEach(function (form) {
        form.addEventListener('submit', function (event) {
          if (!form.checkValidity()) {
            event.preventDefault();
            event.stopPropagation();
          } else {
            // --- NEW: Brutalist Submission Feedback ---
            const submitBtn = form.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.innerText = "PUBLISHING... // PLEASE WAIT";
                submitBtn.style.opacity = "0.7";
                submitBtn.style.pointerEvents = "none";
                submitBtn.style.background = "#888";
            }
          }
  
          form.classList.add('was-validated');
        }, false);
      });
})();

// FIX: Safe check for password element to prevent errors on listing pages
(function() {
    const passwordInput = document.getElementById('password');
    if (passwordInput) {
        passwordInput.addEventListener('input', function () {
            const input = this;
            if (input.value.length >= 7) {
                input.classList.add('is-valid');
                input.classList.remove('is-invalid');
            } else {
                input.classList.remove('is-valid');
                input.classList.add('is-invalid');
            }
        });
    }
})();
