const { Periodic } = require('../periodic');

class Thought extends Periodic {
    constructor(title, text, plugin) {
        super(title, text);
        this.plugin = plugin;
    }

    getHead() {
        const number = this.name.getFContent();
        const numbers = this.plugin?.settings?.numbers?.thought || {};
        return numbers[number] || number;
    }

    async findAncestor(repository, graph, celestia) {
        const dateMatch = this.title.match(/(\d{4}-\d{2}-\d{2})/);
        if (dateMatch) {
            const date = dateMatch[1];
            console.log(`Thought ancestor: "${date}"`);
            return await repository.find(graph, date);
        }
        return null;
    }

    async findFather(repository, graph, celestia) {
        return this.findFounder(repository, graph, celestia);
    }
}

module.exports = { Thought };
