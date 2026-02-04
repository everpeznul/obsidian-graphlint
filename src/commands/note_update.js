const { Repository } = require('../repository/find');
const { updateNote } = require('../utils/services/updater');
const { Notice } = require('obsidian');

async function updateNoteLinks(plugin) {
    const repository = new Repository(plugin);
    const allFiles = await plugin.app.vault.getMarkdownFiles();
    
    const voidFiles = allFiles.filter(file => 
        file.path.startsWith(plugin.settings.paths.void)
    );
    const celestiaFiles = allFiles.filter(file => 
        file.path.startsWith(plugin.settings.paths.celestia)
    );

    const VOID = repository.createGraph(
        voidFiles, 
        plugin.settings.paths.void, 
        plugin.settings.aliases.void
    );
    const CELESTIA = repository.createGraph(
        celestiaFiles, 
        plugin.settings.paths.celestia, 
        plugin.settings.aliases.celestia
    );

    VOID.files.sort((a, b) => a.basename.localeCompare(b.basename));
    CELESTIA.files.sort((a, b) => a.basename.localeCompare(b.basename));

    const file = plugin.app.workspace.getActiveFile();
    
    let targetGraph;
    if (file.path.includes(plugin.settings.paths.void)) {
        targetGraph = VOID;
    } else if (file.path.includes(plugin.settings.paths.celestia)) {
        targetGraph = CELESTIA;
    } else {
        new Notice('Файл не принадлежит ни к VOID, ни к CELESTIA.');
        return;
    }

    await updateNote(plugin, file, targetGraph, CELESTIA);
}

module.exports = { updateNoteLinks };
