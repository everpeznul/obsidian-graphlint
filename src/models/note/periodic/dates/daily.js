const { Periodic } = require('../periodic');

class Daily extends Periodic {
    constructor(title, text) {
        super(title, text);
    }

    async findFounder(repository, graph, celestia) {
        const plugin = repository.plugin;
        const dateMatch = this.title.match(/(\d{4}-\d{2}-\d{2})/);
        if (!dateMatch) return null;

        const date = dateMatch[1];
        
        if (date !== plugin.settings.periodic.templates.daily) {
            return await repository.find(graph, plugin.settings.periodic.templates.daily);
        } else {
            return await repository.find(celestia, plugin.settings.periodic.celestia_paths.daily);
        }
    }

    async findAncestor(repository, graph, celestia) {
        return this.findFounder(repository, graph, celestia);
    }

    async findFather(repository, graph, celestia) {
        return this.findFounder(repository, graph, celestia);
    }
}

module.exports = { Daily };
