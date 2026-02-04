const { Notice } = require('obsidian');

async function createNewEvent(plugin) {
    const file = plugin.app.workspace.getActiveFile();
    const title = file.basename;

    if (!/^\d{4}-\d{2}-\d{2}$/.test(title)) {
        new Notice('Заметка не является ежедневной');
        return;
    }

    const allFiles = await plugin.app.vault.getMarkdownFiles();
    const voidFiles = allFiles.filter(file => 
        file.path.startsWith(plugin.settings.paths.void)
    );

    // Используем встроенный suggester если есть templater, иначе простой prompt
    let eventType;
    if (plugin.app.plugins.plugins.templater) {
        eventType = await plugin.app.plugins.plugins.templater.templater
            .current_functions_object.system.suggester(
                plugin.settings.event.types,
                plugin.settings.event.types
            );
    } else {
        // Fallback на простой выбор
        eventType = plugin.settings.event.types[0];
    }
    
    if (!eventType) return;

    const eventPrefix = eventType.charAt(0).toLowerCase() + eventType.slice(1);
    const eventFiles = voidFiles.filter(file =>
        file.basename.startsWith(`${eventPrefix}.${title}.<`)
    );

    let maxNumber = 0;
    eventFiles.forEach(file => {
        const match = file.basename.match(/<(\d+)>/);
        if (match) {
            const number = parseInt(match[1]);
            if (number > maxNumber) maxNumber = number;
        }
    });

    const newFileName = `${plugin.settings.paths.void}${eventPrefix}.${title}.<${maxNumber + 1}>.md`;
    
    try {
        await plugin.app.vault.create(newFileName, '');
        new Notice(`Создан: ${eventPrefix}.<${maxNumber + 1}>`);
    } catch (error) {
        console.error(`Ошибка создания: ${error}`);
        new Notice('Ошибка при создании файла');
    }
}

module.exports = { createNewEvent };
