// Add custom jQuery or Javascript here
// https://www.drupal.org/docs/8/api/javascript-api/javascript-api-overview
(function ($, Drupal) {
  "use strict";
  
  Drupal.behaviors.customBehavior = {
    attach: function (context, settings) {
      // perform jQuery as normal in here
    }
  };
  
})(jQuery, Drupal);
jQuery(document).ready(function ($) {
	$('a.actLink').each(function(){ 
		var base = "https://www.bftv.ucdavis.edu/tools/keycard-request?values=";
		var oldUrl = $(this).attr("href"); // Get current url
		oldUrl = oldUrl.substring(oldUrl.indexOf('request_type'));
		oldUrl = btoa(oldUrl);
		console.log(oldUrl);
		var newUrl = base+oldUrl;//oldUrl.replace("http://", "https://"); // Create new url
		$(this).attr("href", newUrl); // Set herf value
	});
	
	/* $('.daterangepickertest').daterangepicker({
		autoUpdateInput: false,
		locale: {
			cancelLabel: 'Clear'
		}
		"autoApply": true 
	});*/
	$(document).ajaxComplete(function() {
		$(function(){
			$('.daterangepickertest').daterangepicker({
				autoUpdateInput: false,
				locale: {
					cancelLabel: 'Clear'
				},
				"autoApply": true 
			});
			$('.daterangepickertest').on('apply.daterangepicker', function(ev, picker) {
				$(this).val(picker.startDate.format('MM/DD/YYYY') + ' - ' + picker.endDate.format('MM/DD/YYYY'));
			});
			$('.daterangepickertest').on('cancel.daterangepicker', function(ev, picker) {
				$(this).val('');
			});
		});
	}); 
	
	$(function(){
		$('.daterangepickertest').daterangepicker({
			autoUpdateInput: false,
			locale: {
				cancelLabel: 'Clear'
			},
			"autoApply": true 
		});
		$('.daterangepickertest').on('apply.daterangepicker', function(ev, picker) {
			$(this).val(picker.startDate.format('MM/DD/YYYY') + ' - ' + picker.endDate.format('MM/DD/YYYY'));
		});
		$('.daterangepickertest').on('cancel.daterangepicker', function(ev, picker) {
			$(this).val('');
		});
	});
});

