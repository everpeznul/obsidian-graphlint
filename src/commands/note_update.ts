import { TFile, Notice, Plugin } from 'obsidian';
import { Repo, IGraph } from '../repository/repo';
import { Updater } from '../utils/services/updater';
import { PluginSettings } from '../settings/settings';

type Graph = IGraph;

interface ObsidianPlugin extends Plugin {
  settings: PluginSettings;
}

export async function updateNoteLinks(plugin: ObsidianPlugin): Promise<void> {
  const repository = new Repo(plugin);
  const allFiles = plugin.app.vault.getMarkdownFiles();

  const voidFiles = allFiles.filter((file: TFile) =>
    file.path.startsWith(plugin.settings.paths.void)
  );
  const celestiaFiles = allFiles.filter((file: TFile) =>
    file.path.startsWith(plugin.settings.paths.celestia)
  );

  const VOID: Graph = repository.createGraph(
    voidFiles,
    plugin.settings.paths.void,
    plugin.settings.aliases.void
  );
  const CELESTIA: Graph = repository.createGraph(
    celestiaFiles,
    plugin.settings.paths.celestia,
    plugin.settings.aliases.celestia
  );

  VOID.files.sort((a, b) => a.basename.localeCompare(b.basename));
  CELESTIA.files.sort((a, b) => a.basename.localeCompare(b.basename));

  const file = plugin.app.workspace.getActiveFile();

  if (!file) {
    new Notice('Нет активного файла.');
    return;
  }

  let targetGraph: Graph;
  if (file.path.includes(plugin.settings.paths.void)) {
    targetGraph = VOID;
  } else if (file.path.includes(plugin.settings.paths.celestia)) {
    targetGraph = CELESTIA;
  } else {
    new Notice('Файл не принадлежит ни к VOID, ни к CELESTIA.');
    return;
  }

  const updater = new Updater(plugin);
  await updater.update(file, targetGraph, CELESTIA);
}
