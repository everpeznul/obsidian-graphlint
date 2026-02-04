class Repository {
    constructor(plugin) {
        this.plugin = plugin;
    }

    async find(graph, reqTitle, create = true) {
        let reqFile;

        if (graph.path.includes('void') && reqTitle.split('.').length === 1) {
            reqFile = graph.files.find(file => file.basename === reqTitle);
        } else {
            reqFile = graph.files.find(file => file.basename.endsWith(reqTitle));
        }

        if (!reqFile) {
            if (create) {
                reqFile = await this.#createAndUpdateFile(graph, reqTitle);
            } else {
                console.error(`Не удалось найти: "${reqTitle}" в "${graph.path}"`);
                return null;
            }
        }

        const fileTitle = reqFile.basename;
        const reqText = await this.plugin.app.vault.read(reqFile);

        return [fileTitle, reqText];
    }

    async #createAndUpdateFile(graph, reqTitle) {
        try {
            await this.plugin.app.vault.create(
                graph.path + reqTitle + '.md',
                '\n# temp'
            );
            console.log(`Заметка "${reqTitle}" создана в "${graph.path}"`);
        } catch (error) {
            console.error(`Ошибка создания "${reqTitle}": ${error}`);
            throw error;
        }

        const filesNew = await this.plugin.app.vault.getMarkdownFiles();
        graph.files = filesNew.filter(file => file.path.startsWith(graph.path));
        graph.files.sort((a, b) => a.basename.localeCompare(b.basename));

        const reqFile = graph.files.find(file => file.basename.endsWith(reqTitle));

        const { updateNote } = require('../utils/services/updater');
        await updateNote(this.plugin, reqFile, graph, graph);

        return reqFile;
    }

    createGraph(files, path, aliases) {
        return {
            files,
            path,
            alias: aliases
        };
    }
}

module.exports = { Repository };
