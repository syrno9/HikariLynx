document.getElementById('submitBtn').addEventListener('click', toggleForm);
  function toggleForm() {
    var formFieldset = document.getElementById('newPostFieldset');
    var submitButton = document.getElementById('submitButton');
    
    if (formFieldset.style.display === 'none') {
      formFieldset.style.display = 'inline-block';
      submitButton.style.display = 'none';
    } else {
      formFieldset.style.display = 'none';
    }
  }