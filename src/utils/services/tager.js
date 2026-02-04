const { createNote } = require('./typer');

class Tager {
    constructor(repository) {
        this.repository = repository;
    }

    async generateTags(note, graph, celestia) {
        const mainTag = await this.#getMainTag(note, graph, celestia);
        return mainTag;
    }

    async #getMainTag(note, graph, celestia) {
        const plugin = this.repository.plugin;
        
        const [founderTitle, founderText] = await note.findFounder(this.repository, graph, celestia);
        const founderNote = createNote(founderTitle, founderText, plugin);
        
        const [rootTitle, rootText] = await founderNote.findFounder(this.repository, celestia, celestia);

        for (const [marker, tagName] of Object.entries(plugin.settings.tags.mapping)) {
            if (rootTitle.includes(marker)) {
                return `#${tagName}`;
            }
        }

        return '';
    }
}

module.exports = { Tager };
