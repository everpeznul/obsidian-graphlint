const { Plugin, Notice } = require('obsidian');
const { updateNoteLinks } = require('./src/commands/note_update');
const { updateAllLinks } = require('./src/commands/all_note_update');
const { createNewEvent } = require('./src/commands/new_event');
const { ConfirmationModal } = require('./src/ui/modal');
const config = require('./src/config/config.yaml');

class PeriodicNotesPlugin extends Plugin {
    async onload() {
        global.periodicPlugin = this;

        this.addCommand({
            id: 'update-links-of-note',
            name: 'Update Links of Note',
            callback: async () => {
                new Notice('Начато обновление ссылок заметки');
                await updateNoteLinks(this);
                new Notice('Обновление ссылок заметки закончено');
            },
        });

        this.addCommand({
            id: 'update-links-of-vault',
            name: 'Update Links of Vault',
            callback: async () => {
                new ConfirmationModal(
                    this.app,
                    'Это действие обновит ссылки во всех файлах. Вы уверены?',
                    async () => {
                        new Notice('Начато обновление ссылок хранилища');
                        await updateAllLinks(this);
                        new Notice('Обновление ссылок хранилища закончено');
                    }
                ).open();
            },
        });

        this.addCommand({
            id: 'create-new-periodic',
            name: 'Create New Periodic Event',
            callback: async () => {
                new Notice('Создание начато');
                await createNewEvent(this);
                new Notice('Создание закончено');
            },
        });
    }

    onunload() {
        global.periodicPlugin = null;
    }
}

module.exports = PeriodicNotesPlugin;
