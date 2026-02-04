const { Validator } = require('./validaytor');
const { Note } = require('../../models/note/note');

class Linker {
    constructor(repository) {
        this.repository = repository;
    }

    async generateLinks(note, graph, celestia) {
        const connections = await this.#findConnections(note, graph, celestia);
        return this.#formatLinks(connections, note, graph, celestia);
    }

    async #findConnections(note, graph, celestia) {
        let founder, ancestor, father;

        if (note.len === 1 && this.#isPeriodic(note)) {
            const isTemplate = this.#isTemplate(note);
            const targetGraph = isTemplate ? celestia : graph;
            
            [founder, ] = await note.findFounder(this.repository, targetGraph, celestia);
            [ancestor, ] = await note.findAncestor(this.repository, targetGraph, celestia);
            [father, ] = await note.findFather(this.repository, targetGraph, celestia);
        } else if (note.len === 1) {
            [founder, ] = await note.findFounder(this.repository, celestia, celestia);
            founder = new Note(founder[0], founder[1]);
            ancestor = founder;
            father = founder;
        } else {
            [founder, ] = await note.findFounder(this.repository, graph, celestia);
            [ancestor, ] = await note.findAncestor(this.repository, graph, celestia);
            [father, ] = await note.findFather(this.repository, graph, celestia);
        }

        return { founder, ancestor, father };
    }

    #isPeriodic(note) {
        return Validator.isDaily(note) || Validator.isWeekly(note) || 
               Validator.isMonthly(note) || Validator.isQuarterly(note) || 
               Validator.isYearly(note);
    }

    #isTemplate(note) {
        return note.title === '0000-00-00' || note.title === '0000-W00' ||
               note.title === '0000-00' || note.title === '0000-Q0' || 
               note.title === '0000';
    }

    #formatLinks(connections, note, graph, celestia) {
        const { founder, ancestor, father } = connections;
        
        let links = [
            founder.getLink(graph.alias.founder),
            ancestor.getLink(graph.alias.ancestor),
            father.getLink(graph.alias.father)
        ];

        links[1] += this.#addPeriodicLinks(note, graph);

        return links.join('\n');
    }

    #addPeriodicLinks(note, graph) {
        let additionalLinks = '';

        const [date, hasDate] = Validator.hasDate(note);
        if (hasDate) {
            additionalLinks += `\n[${graph.alias.ancestor}:: [[${date}#${date}|${date}]]]`;
            
            const week = this.#getWeekFromDate(date);
            if (week) {
                additionalLinks += `\n[${graph.alias.ancestor}:: [[${week}#${week}|${week}]]]`;
            }
            
            const quarter = this.#getQuarterFromDate(date);
            if (quarter) {
                additionalLinks += `\n[${graph.alias.ancestor}:: [[${quarter}#${quarter}|${quarter}]]]`;
            }
        }

        const [week, hasWeek] = Validator.hasWeek(note);
        if (hasWeek && Validator.isWeekly(note)) {
            const month = this.#getMonthFromWeek(week);
            if (month) {
                additionalLinks += `\n[${graph.alias.ancestor}:: [[${month}#${month}|${month}]]]`;
            }
            
            const quarter = this.#getQuarterFromWeek(week);
            if (quarter) {
                additionalLinks += `\n[${graph.alias.ancestor}:: [[${quarter}#${quarter}|${quarter}]]]`;
            }
        }

        const [month, hasMonth] = Validator.hasMonth(note);
        if (hasMonth && Validator.isMonthly(note)) {
            const quarter = this.#getQuarterFromMonth(month);
            if (quarter) {
                additionalLinks += `\n[${graph.alias.ancestor}:: [[${quarter}#${quarter}|${quarter}]]]`;
            }
        }

        return additionalLinks;
    }

    #getWeekFromDate(dateStr) {
        const date = new Date(dateStr);
        if (isNaN(date)) return null;

        const day = date.getDay() || 7;
        date.setDate(date.getDate() + 4 - day);

        const yearStart = new Date(date.getFullYear(), 0, 1);
        const diff = (date - yearStart) / 86400000;
        const week = Math.ceil((diff + 1) / 7);

        return `${date.getFullYear()}-W${String(week).padStart(2, '0')}`;
    }

    #getQuarterFromDate(dateStr) {
        const match = dateStr.match(/^(\d{4})-(\d{2})/);
        if (!match) return null;
        
        const quarter = Math.ceil(parseInt(match[2]) / 3);
        return `${match[1]}-Q${quarter}`;
    }

    #getMonthFromWeek(weekTitle) {
        const match = weekTitle.match(/^(\d{4})-W(\d{2})$/);
        if (!match) return null;
        
        const year = parseInt(match[1]);
        const week = parseInt(match[2]);
        
        const jan4 = new Date(year, 0, 4);
        const firstWeekStart = new Date(jan4.getTime() - (jan4.getDay() || 7 - 1) * 24 * 60 * 60 * 1000);
        const weekStart = new Date(firstWeekStart.getTime() + (week - 1) * 7 * 24 * 60 * 60 * 1000);
        
        const monthNum = String(weekStart.getMonth() + 1).padStart(2, '0');
        return `${weekStart.getFullYear()}-${monthNum}`;
    }

    #getQuarterFromWeek(weekTitle) {
        const month = this.#getMonthFromWeek(weekTitle);
        return month ? this.#getQuarterFromMonth(month) : null;
    }

    #getQuarterFromMonth(monthTitle) {
        const match = monthTitle.match(/^(\d{4})-(\d{2})$/);
        if (!match) return null;
        
        const quarter = Math.ceil(parseInt(match[2]) / 3);
        return `${match[1]}-Q${quarter}`;
    }
}

module.exports = { Linker };
