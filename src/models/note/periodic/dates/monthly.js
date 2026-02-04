const { Periodic } = require('../periodic');

class Monthly extends Periodic {
    constructor(title, text) {
        super(title, text);
    }

    async findFounder(repository, graph, celestia) {
        const plugin = repository.plugin;
        const monthMatch = this.title.match(/(\d{4}-\d{2})/);
        if (!monthMatch) return null;

        const month = monthMatch[1];
        
        if (month !== plugin.settings.periodic.templates.monthly) {
            return await repository.find(graph, plugin.settings.periodic.templates.monthly);
        } else {
            return await repository.find(celestia, plugin.settings.periodic.celestia_paths.monthly);
        }
    }

    async findAncestor(repository, graph, celestia) {
        return this.findFounder(repository, graph, celestia);
    }

    async findFather(repository, graph, celestia) {
        return this.findFounder(repository, graph, celestia);
    }
}

module.exports = { Monthly };
