import { AbstractInputSuggest, App, TFolder } from 'obsidian';

export class FolderSuggest extends AbstractInputSuggest<string> {
  content: Set<string>;

  constructor(inputEl: HTMLInputElement, app: App) {
    super(app, inputEl);
    this.content = new Set(this.getAllFolders(app));
  }

  getSuggestions(inputStr: string): string[] {
    const lowerCaseInputStr = inputStr.toLowerCase();
    return [...this.content].filter((folder) =>
      folder.toLowerCase().includes(lowerCaseInputStr)
    );
  }

  renderSuggestion(folder: string, el: HTMLElement): void {
    el.setText(folder);
  }

  selectSuggestion(folder: string, evt: MouseEvent | KeyboardEvent): void {
    console.log(`Selected folder: ${folder}`); // Debug log
    this.setValue(folder);
    this.close();
  }

  getAllFolders(app: App): string[] {
    const folders: Set<string> = new Set();
    const rootFolder = app.vault.getRoot();
    this.getFoldersRecursively(rootFolder, folders);
    return Array.from(folders).sort();
  }

  getFoldersRecursively(folder: TFolder, folders: Set<string>) {
    folders.add(folder.path);
    folder.children.forEach(child => {
      if (child instanceof TFolder) {
        this.getFoldersRecursively(child, folders);
      }
    });
  }
}