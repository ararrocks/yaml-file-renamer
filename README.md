# yaml-file-renamer
Obsidian Plugin: Renames a file when defined YAML properties changed


# WARNING
please backup before use - this is only my second plugin and this one actually renames files on system level - so make sure everything is backed up!


# using
- Define settings with placeholder values in curly brackets {YAML-Property}
- You can add all file-name legal characters as well.

# Example
if your YAML properties are "first-name" and "last-name" then you can set "{last-name}, {first-name}". 

# Info
- if the folder is set multiple times, you get a visual warning. the rename happens on the first setting in the list that matches
- if illegal characters are in the file name the rename will not happen
- you can not create new folders by setting the filename to "{foldername}/{filename}" (yet)
- "[[Links to Files]]" work, the brackets get stripped

let me know if anything is odd
