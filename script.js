// Example: handle search and button click
document.querySelectorAll('.search-bar').forEach(function(form) {
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    const query = this.querySelector('input').value;
    alert('You searched for: ' + query);
  });
});

document.querySelectorAll('.all-studies-btn').forEach(function(btn) {
  btn.addEventListener('click', function() {
    window.location.href = 'all-studies.html';
  });
});

// Pagination click (placeholder)
document.querySelectorAll('.page-num, .page-nav').forEach(function(el) {
  el.addEventListener('click', function() {
    alert('Pagination clicked: ' + this.textContent.trim());
  });
}); 