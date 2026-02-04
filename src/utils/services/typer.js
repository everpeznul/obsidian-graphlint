const { Note } = require('../../models/note/note');
const { Daily } = require('../../models/note/periodic/dates/daily');
const { Weekly } = require('../../models/note/periodic/dates/weekly');
const { Monthly } = require('../../models/note/periodic/dates/monthly');
const { Quarterly } = require('../../models/note/periodic/dates/quarterly');
const { Yearly } = require('../../models/note/periodic/dates/yearly');
const { Dream } = require('../../models/note/periodic/event/dream');
const { Thought } = require('../../models/note/periodic/event/thought');
const { Validator } = require('./validaytor');

function createNote(title, text, plugin) {
    const note = new Note(title, text);

    if (Validator.isThought(note)) {
        return new Thought(title, text, plugin);
    } else if (Validator.isDream(note)) {
        return new Dream(title, text, plugin);
    } else if (Validator.isDaily(note)) {
        return new Daily(title, text);
    } else if (Validator.isWeekly(note)) {
        return new Weekly(title, text);
    } else if (Validator.isMonthly(note)) {
        return new Monthly(title, text);
    } else if (Validator.isQuarterly(note)) {
        return new Quarterly(title, text);
    } else if (Validator.isYearly(note)) {
        return new Yearly(title, text);
    }

    return note;
}

module.exports = { createNote };
