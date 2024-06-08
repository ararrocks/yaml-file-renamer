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
  private trackedKeys: string[] = [];
  private previousMetadata: { [key: string]: any } = {};

  async onload() {
    await this.loadSettings();
    this.addSettingTab(new RenameOnYAMLSettingTab(this.app, this));

    this.updateTrackedKeys();

    this.registerEvent(
      this.app.workspace.on('file-open', this.initializeMetadataCache.bind(this))
    );

    this.registerEvent(
      this.app.vault.on('modify', this.handleFileChange.bind(this))
    );

    this.registerEvent(
      this.app.metadataCache.on('changed', (file: TFile, data, cachedData) => {
        const metadata = cachedData?.frontmatter;
        if (metadata) {
          this.checkAndLogChanges(file.path, metadata);
        }
      })
    );
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    this.updateTrackedKeys();
  }

  async saveSettings() {
    await this.saveData(this.settings);
    this.updateTrackedKeys();
  }

  updateTrackedKeys() {
    this.trackedKeys = [];
    for (const folderSetting of this.settings.folderSettings) {
      const matches = folderSetting.fileNameTemplate.match(/{(.*?)}/g);
      if (matches) {
        for (const match of matches) {
          const key = match.replace(/[{}]/g, '');
          if (!this.trackedKeys.includes(key)) {
            this.trackedKeys.push(key);
          }
        }
      }
    }
  }

  async handleFileChange(file: TFile) {
    if (file.extension !== 'md') return;

    const content = await this.app.vault.read(file);
    const { data } = matter(content);

    if (data) {
      const hasTrackedKeyChanged = this.trackedKeys.some(key => data.hasOwnProperty(key) && (!this.previousMetadata[file.path] || this.previousMetadata[file.path][key] !== data[key]));
      
      if (!hasTrackedKeyChanged) return; // Exit if no tracked key has changed

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

          if (file.name !== newFileName && newFileName !== null && newFileName !== '' && newFileName !== 'null') {
            
            console.log(newFileName);
            await this.app.vault.rename(file, newFilePath);
          }
          break;
        }
      }

      // Update previous metadata after handling changes
      this.updatePreviousMetadata(file.path, data);
    }
  }

  initializeMetadataCache(file: TFile) {
    if (!file || file.extension !== 'md') return;

    this.app.vault.read(file).then(content => {
      const { data } = matter(content);
      if (data) {
        this.updatePreviousMetadata(file.path, data);
      }
    });
  }

  private checkAndLogChanges(filePath: string, metadata: any) {
    const changedKeys: { [key: string]: any } = {};

    this.trackedKeys.forEach(key => {
      if (metadata.hasOwnProperty(key)) {
        if (!this.previousMetadata[filePath] || this.previousMetadata[filePath][key] !== metadata[key]) {
          changedKeys[key] = metadata[key];
        }
      }
    });

    if (Object.keys(changedKeys).length > 0) {
      console.log('Tracked keys have changed:', changedKeys);
      this.updatePreviousMetadata(filePath, metadata); // Update the previous metadata with the new changes
    }
  }

  private updatePreviousMetadata(filePath: string, metadata: { [key: string]: any }) {
    if (!this.previousMetadata[filePath]) {
      this.previousMetadata[filePath] = {};
    }
    this.trackedKeys.forEach(key => {
      if (metadata.hasOwnProperty(key)) {
        this.previousMetadata[filePath][key] = metadata[key];
      }
    });
  }

  onunload() {
    console.log('Unloading RenameOnYAMLPlugin');
  }
}