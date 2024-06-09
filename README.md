# yaml-file-renamer
Obsidian Plugin: Renames a file when defined YAML properties changed


# WARNING
please backup before use - this is only my second plugin and this one actually renames files on system level - so make sure everything is backed up!
ONLY tested on Mac!

# installation
copy "yaml-file-rename" folder (the one with main.js and manifest.json) into your plugins folder. activate in settings after restart

# using
- Define settings with placeholder values in curly brackets {YAML-Property}
- You can add all file-name legal characters as well.
- {date} fields need a format set in (): {date(YYYY-MM-DD)}

# Example
if your YAML properties are "first-name" and "last-name" then you can set "{last-name}, {first-name}". 

# Info
- if the folder is set multiple times, you get a visual warning. the rename happens on the first setting in the list that matches
- if illegal characters are in the file name the rename will not happen
- you can not create new folders by setting the filename to "{foldername}/{filename}" (yet)
- "[[Links to Files]]" work, the brackets get stripped
- in the console you get an information about the recognized changes in the YAML and the rename (from-to)

# known limitations
- its only changin the name of the active file - no background updates recognized for performance
- there is no setting to run this only shortcut 

let me know if anything is odd
