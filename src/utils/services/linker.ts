import { Validator } from './validator';
import { Note } from '../../models/note/note';
import { Repo } from '../../repository/repo';
import { IGraph } from '../../repository/repo';

type Graph = IGraph;
type Celestia = IGraph;

interface Connections {
  founder: Note;
  father: Note;
}

function createLink(note: Note, alias: string): string {
  return `[${alias}:: [[${note.name}#${note.title}|${note.title}]]]`;
}

export class Linker {
  private repository: Repo;

  constructor(repository: Repo) {
    this.repository = repository;
  }

  async link(note: Note, graph: Graph, celestia: Celestia): Promise<string> {
    const connections = await this.findConnections(note, graph, celestia);
    return this.formatLinks(connections, note, graph);
  }

  private async findConnections(
    note: Note,
    graph: Graph,
    celestia: Celestia
  ): Promise<Connections> {
    let founder: Note;
    let father: Note;

    if (note.words.length === 1 && this.isPeriodic(note)) {
      const isTemplate = this.isTemplate(note);
      const targetGraph = isTemplate ? celestia : graph;

      const founderResult = await note.findFounder(this.repository, targetGraph, celestia);
      if (!founderResult) throw new Error(`Founder not found for ${note.title}`);
      const [founderName, founderText] = founderResult;
      founder = new Note(founderName, founderText);

      const fatherResult = await note.findFather(this.repository, targetGraph, celestia);
      if (!fatherResult) throw new Error(`Father not found for ${note.title}`);
      const [fatherName, fatherText] = fatherResult;
      father = new Note(fatherName, fatherText);
    } else if (note.words.length === 1) {
      const founderResult = await note.findFounder(this.repository, celestia, celestia);
      if (!founderResult) throw new Error(`Founder not found for ${note.title}`);
      const [founderName, founderText] = founderResult;
      founder = new Note(founderName, founderText);
      father = founder;
    } else {
      const founderResult = await note.findFounder(this.repository, graph, celestia);
      if (!founderResult) throw new Error(`Founder not found for ${note.title}`);
      const [founderName, founderText] = founderResult;
      founder = new Note(founderName, founderText);

      const fatherResult = await note.findFather(this.repository, graph, celestia);
      if (!fatherResult) throw new Error(`Father not found for ${note.title}`);
      const [fatherName, fatherText] = fatherResult;
      father = new Note(fatherName, fatherText);
    }

    return { founder, father };
  }

  private isPeriodic(note: Note): boolean {
    return (
      Validator.isDaily(note) ||
      Validator.isWeekly(note) ||
      Validator.isMonthly(note) ||
      Validator.isQuarterly(note) ||
      Validator.isYearly(note)
    );
  }

  private isTemplate(note: Note): boolean {
    return (
      note.title === '0000-00-00' ||
      note.title === '0000-W00' ||
      note.title === '0000-00' ||
      note.title === '0000-Q0' ||
      note.title === '0000'
    );
  }

  private formatLinks(connections: Connections, note: Note, graph: Graph): string {
    const { founder, father } = connections;

    const links = [
      createLink(founder, graph.alias.founder),
      createLink(father, graph.alias.father),
    ];

    const ancestorLinks = this.generateAncestorLinks(note, graph);
    if (ancestorLinks) {
      links.push(ancestorLinks);
    }

    return links.join('\n');
  }

  private generateAncestorLinks(note: Note, graph: Graph): string {
    const links: string[] = [];

    const isDaily = Validator.isDaily(note);
    const isWeekly = Validator.isWeekly(note);
    const isMonthly = Validator.isMonthly(note);
    const isQuarterly = Validator.isQuarterly(note);
    const isYearly = Validator.isYearly(note);

    // ---------- 1. Периодические заметки ----------

    // ЕЖЕДНЕВНАЯ: неделя + месяц + квартал + год (без дня)
    if (isDaily) {
      const date = note.title; // YYYY-MM-DD

      const week = this.getWeekFromDate(date);
      if (week) {
        links.push(`[${graph.alias.ancestor}:: [[${week}#${week}|${week}]]]`);
      }

      const month = date.slice(0, 7); // YYYY-MM
      links.push(`[${graph.alias.ancestor}:: [[${month}#${month}|${month}]]]`);

      const quarter = this.getQuarterFromDate(date);
      if (quarter) {
        links.push(`[${graph.alias.ancestor}:: [[${quarter}#${quarter}|${quarter}]]]`);
      }

      const year = date.slice(0, 4);
      links.push(`[${graph.alias.ancestor}:: [[${year}#${year}|${year}]]]`);

      return links.join('\n');
    }

    // ЕЖЕНЕДЕЛЬНАЯ: месяц + квартал + год (без недели)
    if (isWeekly) {
      const week = note.title; // YYYY-Www

      const month = this.getMonthFromWeek(week);
      if (month) {
        links.push(`[${graph.alias.ancestor}:: [[${month}#${month}|${month}]]]`);
      }

      const quarter = this.getQuarterFromWeek(week);
      if (quarter) {
        links.push(`[${graph.alias.ancestor}:: [[${quarter}#${quarter}|${quarter}]]]`);
      }

      const year = week.slice(0, 4);
      links.push(`[${graph.alias.ancestor}:: [[${year}#${year}|${year}]]]`);

      return links.join('\n');
    }

    // ЕЖЕМЕСЯЧНАЯ: квартал + год (без месяца)
    if (isMonthly) {
      const month = note.title; // YYYY-MM

      const quarter = this.getQuarterFromMonth(month);
      if (quarter) {
        links.push(`[${graph.alias.ancestor}:: [[${quarter}#${quarter}|${quarter}]]]`);
      }

      const year = month.slice(0, 4);
      links.push(`[${graph.alias.ancestor}:: [[${year}#${year}|${year}]]]`);

      return links.join('\n');
    }

    // ЕЖЕКВАРТАЛЬНАЯ: год (без квартала)
    if (isQuarterly) {
      const quarter = note.title; // YYYY-Qx

      const yearMatch = quarter.match(/^(\d{4})/);
      if (yearMatch) {
        const year = yearMatch[1];
        links.push(`[${graph.alias.ancestor}:: [[${year}#${year}|${year}]]]`);
      }

      return links.join('\n');
    }

    // ЕЖЕГОДНАЯ: предков выше уже нет, ничего не добавляем
    if (isYearly) {
      return '';
    }

    // ---------- 2. Обычные заметки с датами в имени ----------

    const [date, hasDate] = Validator.hasDate(note);
    if (hasDate && date !== null) {
      return `[${graph.alias.ancestor}:: [[${date}#${date}|${date}]]]`;
    }

    const [week, hasWeek] = Validator.hasWeek(note);
    if (hasWeek && week !== null) {
      return `[${graph.alias.ancestor}:: [[${week}#${week}|${week}]]]`;
    }

    const [month, hasMonth] = Validator.hasMonth(note);
    if (hasMonth && month !== null) {
      return `[${graph.alias.ancestor}:: [[${month}#${month}|${month}]]]`;
    }

    const [quarter, hasQuarter] = Validator.hasQuarter(note);
    if (hasQuarter && quarter !== null) {
      return `[${graph.alias.ancestor}:: [[${quarter}#${quarter}|${quarter}]]]`;
    }

    return '';
  }

  private getWeekFromDate(dateStr: string): string | null {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return null;

    const day = date.getDay() || 7;
    date.setDate(date.getDate() + 4 - day);

    const yearStart = new Date(date.getFullYear(), 0, 1);
    const diff = (date.getTime() - yearStart.getTime()) / 86400000;
    const week = Math.ceil((diff + 1) / 7);

    return `${date.getFullYear()}-W${String(week).padStart(2, '0')}`;
  }

  private getQuarterFromDate(dateStr: string): string | null {
    const match = dateStr.match(/^(\d{4})-(\d{2})/);
    if (!match) return null;

    const quarter = Math.ceil(parseInt(match[2]) / 3);
    return `${match[1]}-Q${quarter}`;
  }

  private getMonthFromWeek(weekTitle: string): string | null {
    const match = weekTitle.match(/^(\d{4})-W(\d{2})$/);
    if (!match) return null;

    const year = parseInt(match[1]);
    const week = parseInt(match[2]);

    const jan4 = new Date(year, 0, 4);
    const firstWeekStart = new Date(
      jan4.getTime() - (jan4.getDay() || 7 - 1) * 24 * 60 * 60 * 1000
    );
    const weekStart = new Date(firstWeekStart.getTime() + (week - 1) * 7 * 24 * 60 * 60 * 1000);

    const monthNum = String(weekStart.getMonth() + 1).padStart(2, '0');
    return `${weekStart.getFullYear()}-${monthNum}`;
  }

  private getQuarterFromWeek(weekTitle: string): string | null {
    const month = this.getMonthFromWeek(weekTitle);
    return month ? this.getQuarterFromMonth(month) : null;
  }

  private getQuarterFromMonth(monthTitle: string): string | null {
    const match = monthTitle.match(/^(\d{4})-(\d{2})$/);
    if (!match) return null;

    const quarter = Math.ceil(parseInt(match[2]) / 3);
    return `${match[1]}-Q${quarter}`;
  }
}
