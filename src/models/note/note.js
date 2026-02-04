const { Word } = require('../subClasses/word.js');

class Note {
    constructor(title, text) {
        this.title = title;
        this.text = text;
        this.words = this.#parseWords();
        this.len = this.words.length;
        this.name = this.words[this.len - 1];
        this.head = this.#generateHead();
        this.content = this.#extractContent();
    }

    #parseWords() {
        return this.title.split('.').map(word => new Word(word));
    }

    #generateHead() {
        if (this.name.isOrder()) {
            return [
                this.name.getFContent(),
                this.words[this.len - 2].getFContent()
            ].join(' ');
        }
        return this.name.getFContent();
    }

    #extractContent() {
        return this.text.split(/^# .*$/gm).pop();
    }

    getWords(start = 0, end = this.len) {
        return this.words.slice(start, end).map(word => word.text);
    }

    getLink(identifier) {
        return `[${identifier}:: [[${this.title}#${this.head}|${this.head}]]]`;
    }

    async findFounder(repository, graph, celestia) {
        const founderTitle = this.words[0].text;
        console.log(`Note founder: "${founderTitle}"`);
        return await repository.find(graph, founderTitle);
    }

    async findAncestor(repository, graph, celestia) {
        let ancestorTitle;

        if (this.len > 2) {
            for (let i = this.len - 2; i >= 0; i--) {
                if (!this.words[i].isCategory()) {
                    ancestorTitle = this.getWords(0, i + 1).join('.');
                    break;
                }
            }
        } else {
            ancestorTitle = this.words[0].text;
        }

        console.log(`Note ancestor: "${ancestorTitle}"`);
        return await repository.find(graph, ancestorTitle);
    }

    async findFather(repository, graph, celestia) {
        if (this.len > 1) {
            const fatherTitle = this.getWords(0, this.len - 1).join('.');
            console.log(`Note father: "${fatherTitle}"`);

            let father = await repository.find(graph, fatherTitle, false);

            if (!father && fatherTitle.endsWith('%')) {
                const altTitle = fatherTitle.slice(0, -1);
                console.log(`Note father_alt: "${altTitle}"`);
                father = await repository.find(graph, altTitle);
            }

            return father;
        }
        return null;
    }
}

module.exports = { Note };
