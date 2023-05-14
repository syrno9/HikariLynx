# HikariLynx

HikariLynx is a modified fork of [Aleph](https://gitgud.io/8chan/Aleph) written for [hikari3.ch](https://hikari3.ch/).

## Installation ##
You can install the frontend anywhere you want, just be sure to set the current location in your global settings.
Best practices dictate you rename the folder to `fe` and place it in the `Lynxchan/src/` directory. This is the default location. User node will need to be able to see all files, and ideally will own them.

## Customization ##

This fork contains a number of customization choices for 8chan. If you wish to swap in your own assets, you can simply replace the existing files with your own. Otherwise, you will need to modify templateSettings.json so the backend can locate your assets. Note that every theme CSS contains a different logo, which is separate from the sitewid logo used on error pages and elsewhere. If you wish, you can simply revert these all back to `/.static/logo.png`, and replace that with your own logo. Other images, including default banners and thumbnails, can be found in the `templates/image/` directory. To refresh the frontend and reload default images, run `lynxchan -nd -r`.

The favicon in the static directory is served from mongo and will need to be uploaded into MongoDB manually. To do this you need to get the mongofiles tool and run  `mongofiles -h localhost -d {dbName} -l {/path/to/yourfavicon} put /favicon.ico`

This front end currently requires you to set the URI of the overboard as "overboard".
