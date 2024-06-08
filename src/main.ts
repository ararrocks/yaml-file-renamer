import { Plugin, TFile } from 'obsidian';
import matter from 'gray-matter';
import RenameOnYAMLSettingTab from './settings-tab';

const ILLEGAL_CHARACTERS = /[\\/:*?"<>|[\](){}]/g;
const BRACKETS_AND_PARENS = /[()[\]{}]/g;

interface FolderSetting {
  folderPath: string;
  fileNameTemplate: string;
}

interface MyPluginSettings {
  folderSettings: FolderSetting[];
}

const DEFAULT_SETTINGS: MyPluginSettings = {
  folderSettings: []
};

export default class RenameOnYAMLPlugin extends Plugin {
  settings: MyPluginSettings;

  async onload() {
    await this.loadSettings();
    this.addSettingTab(new RenameOnYAMLSettingTab(this.app, this));

    this.registerEvent(
      this.app.vault.on('modify', this.handleFileChange.bind(this))
    );
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  async handleFileChange(file: TFile) {
    if (file.extension !== 'md') return;

    const content = await this.app.vault.read(file);
    const { data } = matter(content);

    if (data) {
      for (const folderSetting of this.settings.folderSettings) {
        if (file.path.startsWith(folderSetting.folderPath)) {
          let newFileName = folderSetting.fileNameTemplate;

          // Replace placeholders with YAML values
          for (const key in data) {
            if (data.hasOwnProperty(key)) {
              newFileName = newFileName.replace(`{${key}}`, data[key]);
            }
          }

          // Remove brackets and parentheses
          newFileName = newFileName.replace(BRACKETS_AND_PARENS, '');

          // Ensure the new file name is valid
          if (ILLEGAL_CHARACTERS.test(newFileName)) {
            new Notice('The generated file name contains illegal characters.');
            return;
          }

          // Ensure the new file name ends with .md
          if (!newFileName.endsWith('.md')) {
            newFileName += '.md';
          }

          // Check if the new file name already exists
          const filePath = file.path.split('/').slice(0, -1).join('/');
          const newFilePath = `${filePath}/${newFileName}`;
          if (await this.app.vault.adapter.exists(newFilePath)) {
            new Notice(`A file named "${newFileName}" already exists.`);
            return;
          }

          if (file.name !== newFileName) {
            await this.app.vault.rename(file, newFilePath);
          }
          break;
        }
      }
    }
  }
}