# Basic SiteFarm One subtheme starterkit

This starterkit is meant as a one-off starting point to customize the SiteFarm 
One parent theme. This is perfect for doing simple things like adding or 
tweaking some CSS or Javascript. In addition it provides some guidelines for 
overriding [Twig](http://twig.sensiolabs.org/) templates which contain the HTML for the site.

General Drupal theming documentation can be found here: [https://www.drupal.org/docs/8/theming](https://www.drupal.org/docs/8/theming)

# Folder Structure

```
|-- config/
|-- css/
|-- images/
|-- js/
|-- templates/
|-- .gitignore
|-- logo.svg
|-- THEMENAME.info
|-- THEMENAME.libraries.yml
|-- THEMENAME.theme
```

## 1. config/
This folder contains configuration that is installed only on the initial install.

**install/THEMENAME.settings.yml**: This file contains all 
default settings and should initially be a clone of what is in the 
sitefarm_one.settings.yml file.

[https://www.drupal.org/docs/8/theming-drupal-8/creating-advanced-theme-settings](https://www.drupal.org/docs/8/theming-drupal-8/creating-advanced-theme-settings)

**schema/THEMENAME.schema.yml**: This file is used by Drupal to 
provide translations for items like the THEMENAME.settings.yml file.

[https://www.drupal.org/docs/8/api/configuration-api/configuration-schemametadata](https://www.drupal.org/docs/8/api/configuration-api/configuration-schemametadata)

## 2. css/
All CSS files should go in this directory

**style.css**: All global styles including any overrides should go in this file.

**ckeditor**: When using the CKEditor WYSIWYG, it is helpful to see the styles 
which will be applied in the actual theme. This file allows styles to be 
injected into the editor so that a user gets a better idea of how text and 
components like buttons, lists, and links will really look. Sitefarm One already
provides many defaults, so most likely this file will not have much in it.

## 3. images/
Image files like jpeg, gif, png, or svg should be added to this directory.


## 4. js/
Javascript files belong in this directory. A default `scripts.js` file is already
available for use.

**scripts.js**: This file contains an [IIEF](https://en.wikipedia.org/wiki/Immediately-invoked_function_expression) closure passing in jQuery so that the `$` 
can be used instead of having to type out `jQuery`. Drupal uses jQuery in 
noConflict mode so the `$` is normally not mapped to jQuery. Also a Drupal 
Behavior called `customBehavior` has been added as an example. Behaviors are 
helpful for allowing your javascript to work nicely with Drupal and Drupal's 
Ajax system.

More information on using Javascript in Drupal can be found here: [https://www.drupal.org/docs/8/api/javascript-api/javascript-api-overview](https://www.drupal.org/docs/8/api/javascript-api/javascript-api-overview)

## 5. templates/
The `templates` directory allows [Twig](http://twig.sensiolabs.org/) files to be
added so that HTML markup can be overridden or customized. These files end with
`.html.twig`. For example: `block.html.twig` or `node--teaser.html.twig`.

Drupal auto-detects twig files based on [naming conventions](https://www.drupal.org/docs/8/theming/twig/twig-template-naming-conventions).
So if you name a Twig file correctly, Drupal will automatically use it.

In addition you can suggest templates for use when certain conditions are met.

This link provides documentation for working with Drupal 8 templates: 
[https://www.drupal.org/docs/8/theming/twig/working-with-twig-templates](https://www.drupal.org/docs/8/theming/twig/working-with-twig-templates)

## Files
**.gitignore**: This tells Git what files and directories should not be
committed to a Git repository. You may add in extra items to ignore.
             
**logo.svg**: This image file should be replaced with your site's own logo file.
It should be named `logo.EXTENSION`. It's preferable to use a `.svg` file. 
Although regular `.jpeg` and `.png` files are acceptable.

**THEMENAME.info**: This is the main file which declares a theme to Drupal. It 
contains information about the theme, declares the parent theme, adds libraries,
and declares regions where content can be placed. It also allows for [overriding 
libraries](https://www.drupal.org/docs/8/theming-drupal-8/adding-stylesheets-css-and-javascript-js-to-a-drupal-8-theme#override-extend)
in the parent SiteFarm One theme.

[https://www.drupal.org/docs/8/theming-drupal-8/defining-a-theme-with-an-infoyml-file](https://www.drupal.org/docs/8/theming-drupal-8/defining-a-theme-with-an-infoyml-file)

**THEMENAME.libraries**: Libraries for CSS and Javascript can be defined here. By 
default this file declares 2 CSS files and 1 Javascript file. These will be 
loaded into the site. More libraries or dependencies can be declared if needed.

[https://www.drupal.org/docs/8/theming-drupal-8/adding-stylesheets-css-and-javascript-js-to-a-drupal-8-theme](https://www.drupal.org/docs/8/theming-drupal-8/adding-stylesheets-css-and-javascript-js-to-a-drupal-8-theme)

**THEMENAME.theme**: This file is for more advanced users. It allows a developer to 
alter Drupal's output before it gets to a Twig template. It uses PHP and Drupal 
Hooks to change variables and data that is eventually passed to a template. This
is also where any theme suggestions would be located.

[https://www.drupal.org/docs/8/theming-drupal-8/modifying-attributes-in-a-theme-file](https://www.drupal.org/docs/8/theming-drupal-8/modifying-attributes-in-a-theme-file)