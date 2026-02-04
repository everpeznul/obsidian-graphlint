const { Periodic } = require('../periodic');

class Yearly extends Periodic {
    constructor(title, text) {
        super(title, text);
    }

    async findFounder(repository, graph, celestia) {
        const plugin = repository.plugin;
        const yearMatch = this.title.match(/(\d{4})/);
        if (!yearMatch) return null;

        const year = yearMatch[1];
        
        if (year !== plugin.settings.periodic.templates.yearly) {
            return await repository.find(graph, plugin.settings.periodic.templates.yearly);
        } else {
            return await repository.find(celestia, plugin.settings.periodic.celestia_paths.yearly);
        }
    }

    async findAncestor(repository, graph, celestia) {
        return this.findFounder(repository, graph, celestia);
    }

    async findFather(repository, graph, celestia) {
        return this.findFounder(repository, graph, celestia);
    }
}

module.exports = { Yearly };
