const { Periodic } = require('../periodic');

class Quarterly extends Periodic {
    constructor(title, text) {
        super(title, text);
    }

    async findFounder(repository, graph, celestia) {
        const plugin = repository.plugin;
        const quarterMatch = this.title.match(/(\d{4}-Q\d{1})/);
        if (!quarterMatch) return null;

        const quarter = quarterMatch[1];
        
        if (quarter !== plugin.settings.periodic.templates.quarterly) {
            return await repository.find(graph, plugin.settings.periodic.templates.quarterly);
        } else {
            return await repository.find(celestia, plugin.settings.periodic.celestia_paths.quarterly);
        }
    }

    async findAncestor(repository, graph, celestia) {
        return this.findFounder(repository, graph, celestia);
    }

    async findFather(repository, graph, celestia) {
        return this.findFounder(repository, graph, celestia);
    }
}

module.exports = { Quarterly };
