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
