const { Note } = require('../note');

class Periodic extends Note {
    constructor(title, text) {
        super(title, text);
    }
}

module.exports = { Periodic };
