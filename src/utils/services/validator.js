class Validator {
    static isDream(note) {
        return note.title.startsWith('сон.');
    }

    static isThought(note) {
        return note.title.startsWith('мысль.');
    }

    static isDaily(note) {
        return /^\d{4}-\d{2}-\d{2}$/.test(note.title);
    }

    static isWeekly(note) {
        return /^\d{4}-W\d{2}$/.test(note.title);
    }

    static isMonthly(note) {
        return /^\d{4}-\d{2}$/.test(note.title);
    }

    static isQuarterly(note) {
        return /^\d{4}-Q\d{1}$/.test(note.title);
    }

    static isYearly(note) {
        return /^\d{4}$/.test(note.title);
    }

    static hasDate(note) {
        const match = note.title.match(/(\d{4}-\d{2}-\d{2})/);
        return match ? [match[1], true] : [null, false];
    }

    static hasWeek(note) {
        const match = note.title.match(/(\d{4}-W\d{2})/);
        return match ? [match[1], true] : [null, false];
    }

    static hasMonth(note) {
        const match = note.title.match(/(\d{4}-\d{2})/);
        return match ? [match[1], true] : [null, false];
    }

    static hasQuarter(note) {
        const match = note.title.match(/(\d{4}-Q\d{1})/);
        return match ? [match[1], true] : [null, false];
    }

    static hasYear(note) {
        const match = note.title.match(/(\d{4})/);
        return match ? [match[1], true] : [null, false];
    }
}

module.exports = { Validator };
