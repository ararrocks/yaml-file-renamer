# yaml-file-renamer


![SCR-20240609-ldmn](https://github.com/ararrocks/yaml-file-renamer/assets/171629355/344e2723-8eb4-442f-a069-cc7da20799ec)



Obsidian Plugin: Renames a file when defined YAML properties changed


# WARNING
please backup before use - this is only my second plugin and this one actually renames files on system level - so make sure everything is backed up!
ONLY tested on Mac!

# installation
copy "yaml-file-rename" folder (the one with main.js and manifest.json) into your plugins folder. activate in settings after restart

# using
- Set the folder you want the setting to take effect in. You can have multiple settings for different folders.
- Define settings with placeholder values in curly brackets {YAML-Property}
- You can add all file-name legal characters as well.
- {date} fields need a format set in (): {date(YYYY-MM-DD)}
![SCR-20240609-lakc](https://github.com/ararrocks/yaml-file-renamer/assets/171629355/d70d8518-30b5-4c07-8a54-adbd86010478)

# Example
if your YAML properties are "first-name" and "last-name" then you can set "{last-name}, {first-name}". 

# Info
- if the folder is set multiple times, you get a visual warning. the rename happens on the first setting in the list that matches
- if illegal characters are in the file name the rename will not happen
- you can not create new folders by setting the filename to "{foldername}/{filename}" (yet)
- "[[Links to Files]]" work, the brackets get stripped
- in the console you get an information about the recognized changes in the YAML and the rename (from-to)
![SCR-20240609-labp](https://github.com/ararrocks/yaml-file-renamer/assets/171629355/a1503882-e4d2-4d25-b926-3717500b4bb3)

# known limitations
- its only changin the name of the active file - no background updates recognized for performance
- there is no setting to run this only shortcut 

let me know if anything is odd
