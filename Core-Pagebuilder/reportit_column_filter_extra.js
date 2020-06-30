$( document ).ready(function() {
  // Handler for .ready() called.

console.log('adding reportit extras');
$('body').on('click', '.select2-results__option', function(e){
  var x= this.id.replace('select2-','#').replace('-results','').replace('-filter-','-filter-wrapper-');
  console.log('click-unshowing '+x);
  $(x).removeClass('shown');
});
$('body').on('mousedown', '.select2-results__option', function(e){
  var x= this.id.replace('select2-','#').replace('-results','').replace('-filter-','-filter-wrapper-');
  console.log('mousedown-unshowing '+x);
  $(x).removeClass('shown');
});
$('body').on('mouseleave', '.select2-results__options', function(e){
  var x= this.id.replace('select2-','#').replace('-results','').replace('-filter-','-filter-wrapper-');
  console.log('unshowing '+x);
  $(x).removeClass('shown');
});
$('body').on('mouseenter', '.select2-results__options', function(e){
  var x= this.id.replace('select2-','#').replace('-results','').replace('-filter-','-filter-wrapper-');
  console.log('showing '+x);
  $(x).addClass('shown');
});

var style = $('<style>td, th, .select2-results li {font-size:11px} .yadcf-filter-wrapper {display:none !important}div.yadcf-filter-wrapper.shown, th:hover  div.yadcf-filter-wrapper {  display: block !important;}</style>');
$('html > head').append(style);
});
