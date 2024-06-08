import { App, PluginSettingTab, Setting, Notice } from 'obsidian';
import RenameOnYAMLPlugin from './main';
import { FolderSuggest } from './folder-suggest';

const ILLEGAL_CHARACTERS = /[\\/:*?"<>|[\]()]/;  // Remove the global flag

// Add CSS dynamically
const css = `
  .illegal-character {
    border: 2px solid red !important;
    color: red !important;
  }
`;

const style = document.createElement('style');
style.textContent = css;
document.head.append(style);

export default class RenameOnYAMLSettingTab extends PluginSettingTab {
  plugin: RenameOnYAMLPlugin;

  constructor(app: App, plugin: RenameOnYAMLPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;

    containerEl.empty();

    containerEl.createEl('h2', { text: 'YAML File Renamer' });

    this.plugin.settings.folderSettings.forEach((setting, index) => {
      this.createFolderSetting(containerEl, setting, index);
    });

   
    new Setting(containerEl)
      .addButton((button) => {
        button.setButtonText('Add Folder Setting').onClick(() => {
          this.plugin.settings.folderSettings.push({ folderPath: '', fileNameTemplate: '' });
          this.display();
        });
      });
  }

  createFolderSetting(containerEl: HTMLElement, setting: FolderSetting, index: number): void {
    const validateInput = (inputEl: HTMLInputElement) => {
      if (ILLEGAL_CHARACTERS.test(inputEl.value)) {
        new Notice('The file name template contains illegal characters.');
        inputEl.classList.add('illegal-character');
      } else {
        inputEl.classList.remove('illegal-character');
      }
    };

    const validateFolderPath = (inputEl: HTMLInputElement) => {
      const isDuplicate = this.plugin.settings.folderSettings.some(
        (otherSetting, otherIndex) => otherIndex !== index && otherSetting.folderPath === inputEl.value
      );

      if (isDuplicate) {
        new Notice('The folder path is already set.');
        inputEl.classList.add('illegal-character');
      } else {
        inputEl.classList.remove('illegal-character');
      }
    };

    new Setting(containerEl)
      .setName(`Folder Setting ${index + 1}`)
      .setDesc('Set the folder path and rename pattern for files in this folder.')
      .addText(text => {
        const inputEl = text.setPlaceholder('Enter folder path')
          .setValue(setting.folderPath)
          .onChange(async (value) => {
            setting.folderPath = value;
            await this.plugin.saveSettings();
            validateFolderPath(inputEl);
          }).inputEl as HTMLInputElement;

        new FolderSuggest(inputEl, this.app);

        // Add blur event listener
        inputEl.addEventListener('blur', async () => {
          setting.folderPath = inputEl.value;
          await this.plugin.saveSettings();
          validateFolderPath(inputEl);
        });

        // Validate folder path on load
        validateFolderPath(inputEl);
      })
      .addText(text => {
        const inputEl = text.setPlaceholder('Enter file name template')
          .setValue(setting.fileNameTemplate)
          .onChange(async (value) => {
            setting.fileNameTemplate = value;
            await this.plugin.saveSettings();
            validateInput(inputEl);
          }).inputEl as HTMLInputElement;

        // Validate input on load
        validateInput(inputEl);

        // Add blur event listener
        inputEl.addEventListener('blur', async (e) => {
          const inputEl = e.target as HTMLInputElement;
          setting.fileNameTemplate = inputEl.value;
          await this.plugin.saveSettings();
          validateInput(inputEl);
        });
      })
      .addExtraButton((button) => {
        button.setIcon('trash').onClick(async () => {
          this.plugin.settings.folderSettings.splice(index, 1);
          await this.plugin.saveSettings();
          this.display();
        });
      });
  }
} 