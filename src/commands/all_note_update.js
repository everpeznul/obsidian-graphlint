const { Repository } = require('../repository/find');
const { updateNote } = require('../utils/services/updater');

async function updateAllLinks(plugin) {
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

    for (const file of CELESTIA.files) {
        await updateNote(plugin, file, CELESTIA, CELESTIA);
    }

    for (const file of VOID.files) {
        await updateNote(plugin, file, VOID, CELESTIA);
    }
}

module.exports = { updateAllLinks };
