const { Has } = require('./note-subClasses');
const { Periodic } = require('./note-periodic');

class Weekly extends Periodic {
    constructor(TITLE, TEXT) {
        console.log('Weekly constructor');

        super(TITLE, TEXT);
    }

    async findFounder(graph, celestia) {
        let founder;

        let [date, ok] = Has.Week(this);
        if (ok && date !== '0000-W00') {
            founder = await this.find(graph, '0000-W00');
        } else if (ok && date === '0000-W00') {
            founder = await this.find(
                celestia,
                '❤️‍🔥.календарь.периодические.периодическая.weekly',
            );
        }

        console.log(`    Weekly founder:\n    "${date}"`);

        return founder;
    }

    async findAncestor(graph, celestia) {
        return this.findFounder(graph, celestia);
    }

    async findFather(graph, celestia) {
        return this.findFounder(graph, celestia);
    }
}

module.exports = {
    Weekly,
};
