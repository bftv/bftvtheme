# Templates

This directory is for overwriting templates so that custom HTML can be used.

This link provides documentation for working with Drupal 8 templates: 
[https://www.drupal.org/docs/8/theming/twig/working-with-twig-templates](https://www.drupal.org/docs/8/theming/twig/working-with-twig-templates)

## Overwriting Templates

To overwrite a template from SiteFarm One, find the desired template file in 
`sitefarm_one/templates/` and copy it to this directory. Drupal will now load
this template with any modifications made to it instead of the original.

If a template is not found in SiteFarm One then it may be found in Drupal Core.
SiteFarm One uses `Classy` as its parent theme so you can look into 
`core/themes/classy/templates` to find even more.

## Conditional Overwrites with Theme Suggestions

It's possible that you only want to apply a template in certain circumstances. 
Drupal allows you to provide a Theme Suggestion so that Drupal will look for a 
specific template name when a condition is met.

[Theme Suggestion Hook Documentation](https://api.drupal.org/api/drupal/core!lib!Drupal!Core!Render!theme.api.php/function/hook_theme_suggestions_HOOK_alter)

In the THEMENAME.theme file, add a theme suggestion hook and provide a 
template name as a suggestion for Drupal to find your custom template.

**Always remember to rebuild the site's Cache so that Drupal will find the new 
Template**
