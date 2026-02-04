const { createNote } = require('./typer');
const { Linker } = require('./linker');
const { Tager } = require('./tager');
const { Repository } = require('../../repository/find');

async function updateNote(plugin, file, graph, celestia) {
    console.log(`\n---------------------------\n"${file.basename}"\n---------------------------`);

    const repository = new Repository(plugin);
    const title = file.basename;
    const text = await plugin.app.vault.read(file);
    const note = createNote(title, text, plugin);

    const linker = new Linker(repository);
    const tager = new Tager(repository);

    const links = await linker.generateLinks(note, graph, celestia);
    const tags = await tager.generateTags(note, graph, celestia);
    const metadata = getFileMetadata(file);

    const newText = formatNoteText(note, links, tags, metadata);
    await plugin.app.vault.modify(file, newText);
}

function getFileMetadata(file) {
    const { ctime, mtime } = file.stat;
    return {
        createdAt: formatDate(ctime),
        updatedAt: formatDate(mtime)
    };
}

function formatDate(timestamp) {
    return new Date(timestamp).toISOString().split('T')[0];
}

function formatNoteText(note, links, tags, metadata) {
    return [
        `[Дата создания:: [[${metadata.createdAt}]]]`,
        `[Дата изменения:: [[${metadata.updatedAt}]]]`,
        links,
        `\n${tags}\n`,
        `# ${note.head}\n`,
        note.content
    ].join('\n');
}

module.exports = { updateNote };
