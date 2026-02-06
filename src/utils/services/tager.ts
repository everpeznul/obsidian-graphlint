import { createNote } from './validator';
import { Note } from '../../models/note/note';
import { Repo } from '../../repository/repo';
import { IGraph } from '../../repository/repo';

type Graph = IGraph;
type Celestia = IGraph;

export class Tager {
  private repository: Repo;

  constructor(repository: Repo) {
    this.repository = repository;
  }

  async tag(note: Note, graph: Graph, celestia: Celestia): Promise<string> {
    return this.getMainTag(note, graph, celestia);
  }

  private async getMainTag(note: Note, graph: Graph, celestia: Celestia): Promise<string> {
    const plugin = this.repository.plugin;

    const founderResult = await note.findFounder(this.repository, graph, celestia);
    if (!founderResult) {
      return '';
    }

    const [founderName, founderText] = founderResult;
    const founderNote = createNote(founderName, founderText, plugin);

    const rootResult = await founderNote.findFounder(this.repository, celestia, celestia);
    if (!rootResult) {
      return '';
    }

    const [rootName] = rootResult;

    for (const [marker, tagName] of Object.entries(plugin.settings.tags.mapping)) {
      if (rootName.includes(marker)) {
        return `#${tagName}`;
      }
    }

    return '';
  }
}
