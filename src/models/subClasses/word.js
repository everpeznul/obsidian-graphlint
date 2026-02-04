class Word {
    constructor(word) {
        this.text = word;
        this.#parseWord();
    }

    #orderMatch = null;
    #categoryMatch = null;

    #parseWord() {
        this.#orderMatch = this.text.match(/<\d+>([^.]+)/);
        this.content = this.#orderMatch ? this.#orderMatch[1] : this.text;

        this.#categoryMatch = this.content.match(/([^.]+)%/);
        this.content = this.#categoryMatch ? this.#categoryMatch[1] : this.content;
    }

    hasOrder() {
        return !!this.#orderMatch;
    }

    isOrder() {
        return /^<\d+>$/.test(this.text);
    }

    isCategory() {
        return !!this.#categoryMatch;
    }

    getFContent() {
        if (this.isOrder()) {
            return this.text.replace('<', '').replace('>', '');
        }

        const contentParts = this.content.split('_').map(part => 
            part.charAt(0).toUpperCase() + part.slice(1)
        );

        return contentParts.join(' ');
    }
}

module.exports = { Word };
