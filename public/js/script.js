(function () {
    'use strict';
  
    // Fetch all the forms we want to apply custom Bootstrap validation styles to
    var forms = document.querySelectorAll('.needs-validation')
  
    // Loop over them and prevent submission
    Array.prototype.slice.call(forms)
      .forEach(function (form) {
        form.addEventListener('submit', function (event) {
          if (!form.checkValidity()) {
            event.preventDefault()
            event.stopPropagation()
          }
  
          form.classList.add('was-validated')
        }, false)
      })
  })()


  document.getElementById('password').addEventListener('input', function () {
  const input = this;
  if (input.value.length >= 7) {
    input.classList.add('is-valid');
    input.classList.remove('is-invalid');
  } else {
    input.classList.remove('is-valid');
    input.classList.add('is-invalid');
  }
});


  //Tax-info toggle button
  // let priceToggle = document.getElementById("switchCheckDefault");
  //   priceToggle.addEventListener("click", () => {
  //       let taxInfo = document.getElementsByClassName("tax-info");
  //       for(info of taxInfo) {
  //           if(info.style.display != "inline"){
  //               info.style.display = "inline";
  //           } else {
  //               info.style.display = "none";
  //           }
  //       }
  //   })
