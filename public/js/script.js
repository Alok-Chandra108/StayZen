// Example starter JavaScript for disabling form submissions if there are invalid fields
(function () {
    'use strict'
  
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



//   document.addEventListener("DOMContentLoaded", () => {
//   const form = document.querySelector("form");
//   if (!form) {
//     console.warn("Form not found on the page.");
//     return;
//   }

//   form.addEventListener("submit", function (e) {
//     const amenities = document.querySelectorAll('input[name="listing[amenities][]"]:checked');
//     const tags = document.querySelectorAll('select[name="listing[tags][]"] option:checked');

//     if (amenities.length === 0) {
//       e.preventDefault();
//       alert("Please select at least one amenity.");
//       return;
//     }

//     if (tags.length === 0) {
//       e.preventDefault();
//       alert("Please select at least one tag.");
//       return;
//     }
//   });
// });
