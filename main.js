const { Plugin, Notice } = require('obsidian');
const { updateNoteLinks } = require('./src/commands/note_update');
const { updateAllLinks } = require('./src/commands/all_note_update');
const { createNewEvent } = require('./src/commands/new_event');
const { ConfirmationModal } = require('./src/ui/modal');
const { PeriodicNotesSettingTab, DEFAULT_SETTINGS } = require('./src/settings/settings');

module.exports = class PeriodicNotesPlugin extends Plugin {
    async onload() {
        console.log('Загрузка Periodic Notes Linker');

        // Загрузка настроек
        await this.loadSettings();

        // Добавление вкладки настроек
        this.addSettingTab(new PeriodicNotesSettingTab(this.app, this));

        // Команды...
        this.addCommand({
            id: 'update-links-of-note',
            name: 'Обновить ссылки заметки',
            callback: async () => {
                new Notice('Начато обновление ссылок заметки');
                try {
                    await updateNoteLinks(this);
                    new Notice('Обновление ссылок заметки закончено');
                } catch (error) {
                    new Notice('Ошибка при обновлении ссылок');
                    console.error(error);
                }
            },
        });

        this.addCommand({
            id: 'update-links-of-vault',
            name: 'Обновить ссылки хранилища',
            callback: async () => {
                new ConfirmationModal(
                    this.app,
                    'Это действие обновит ссылки во всех файлах. Вы уверены?',
                    async () => {
                        new Notice('Начато обновление ссылок хранилища');
                        try {
                            await updateAllLinks(this);
                            new Notice('Обновление ссылок хранилища закончено');
                        } catch (error) {
                            new Notice('Ошибка при обновлении хранилища');
                            console.error(error);
                        }
                    }
                ).open();
            },
        });

        this.addCommand({
            id: 'create-new-periodic',
            name: 'Создать новое периодическое событие',
            callback: async () => {
                new Notice('Создание начато');
                try {
                    await createNewEvent(this);
                    new Notice('Создание закончено');
                } catch (error) {
                    new Notice('Ошибка при создании');
                    console.error(error);
                }
            },
        });
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }

    onunload() {
        console.log('Выгрузка Periodic Notes Linker');
    }
};
