window.$ = window.jQuery = require('jquery');
global.Tether = require('tether');
var bootstrap = require('bootstrap');

$('.dropdown-chevron-mobile').on('click', function(e) {
  $('.subcategory').toggleClass("open");
  $('.dropdown-chevron-mobile').toggleClass("open");
  e.preventDefault();
});
