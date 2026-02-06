import { Note } from '../../models/note/note';
import { Daily } from '../../models/note/periodic/dates/daily';
import { Weekly } from '../../models/note/periodic/dates/weekly';
import { Monthly } from '../../models/note/periodic/dates/monthly';
import { Quarterly } from '../../models/note/periodic/dates/quarterly';
import { Yearly } from '../../models/note/periodic/dates/yearly';
import { Dream } from '../../models/note/periodic/event/dream';
import { Thought } from '../../models/note/periodic/event/thought';
import { Plugin } from 'obsidian';
import { PluginSettings } from '../../settings/settings';

interface ObsidianPlugin extends Plugin {
  settings: PluginSettings;
}

export class Validator {
  static isDream(note: Note): boolean {
    return note.title.startsWith('сон.');
  }

  static isThought(note: Note): boolean {
    return note.title.startsWith('мысль.');
  }

  static isDaily(note: Note): boolean {
    return /^\d{4}-\d{2}-\d{2}$/.test(note.title);
  }

  static isWeekly(note: Note): boolean {
    return /^\d{4}-W\d{2}$/.test(note.title);
  }

  static isMonthly(note: Note): boolean {
    return /^\d{4}-\d{2}$/.test(note.title);
  }

  static isQuarterly(note: Note): boolean {
    return /^\d{4}-Q\d{1}$/.test(note.title);
  }

  static isYearly(note: Note): boolean {
    return /^\d{4}$/.test(note.title);
  }

  static hasDate(note: Note): [string | null, boolean] {
    const match = note.name.match(/(\d{4}-\d{2}-\d{2})/);
    return match ? [match[1], true] : [null, false];
  }

  static hasWeek(note: Note): [string | null, boolean] {
    const match = note.name.match(/(\d{4}-W\d{2})/);
    return match ? [match[1], true] : [null, false];
  }

  static hasMonth(note: Note): [string | null, boolean] {
    const match = note.name.match(/(\d{4}-\d{2})/);
    return match ? [match[1], true] : [null, false];
  }

  static hasQuarter(note: Note): [string | null, boolean] {
    const match = note.name.match(/(\d{4}-Q\d{1})/);
    return match ? [match[1], true] : [null, false];
  }

  static hasYear(note: Note): [string | null, boolean] {
    const match = note.name.match(/(\d{4})/);
    return match ? [match[1], true] : [null, false];
  }
}

export function createNote(title: string, text: string, plugin?: ObsidianPlugin): Note {
  const note = new Note(title, text);

  if (Validator.isThought(note) && plugin) {
    return new Thought(title, text);
  } else if (Validator.isDream(note) && plugin) {
    return new Dream(title, text);
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
