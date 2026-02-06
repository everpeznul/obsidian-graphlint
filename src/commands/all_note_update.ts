import { TFile, Plugin } from 'obsidian';
import { Repo, IGraph } from '../repository/repo';
import { Updater } from '../utils/services/updater';
import { PluginSettings } from '../settings/settings';

type Graph = IGraph;

interface ObsidianPlugin extends Plugin {
  settings: PluginSettings;
}

export async function updateAllLinks(plugin: ObsidianPlugin): Promise<void> {
  const repository = new Repo(plugin);
  const updater = new Updater(plugin);
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

  // Сортируем только Celestia
  CELESTIA.files.sort((a, b) => a.basename.localeCompare(b.basename));

  // 1. Celestia последовательно
  console.log(`Начало Celestia (${CELESTIA.files.length} файлов)`);
  for (const file of CELESTIA.files) {
    await updater.update(file, CELESTIA, CELESTIA);
  }
  console.log('✓ Celestia завершена');

  // 2. Делим Void
  const rootFiles: TFile[] = [];
  const nestedFiles: TFile[] = [];

  for (const file of VOID.files) {
    if (file.basename.includes('.')) {
      nestedFiles.push(file);
    } else {
      rootFiles.push(file);
    }
  }

  // 3. Корневые батчами по 50
  console.log(`Начало корневых Void (${rootFiles.length} файлов)`);
  await processBatch(rootFiles, 50, updater, VOID, CELESTIA);
  console.log('✓ Корневые Void завершены');

  // 4. Вложенные батчами по 200
  console.log(`Начало вложенных Void (${nestedFiles.length} файлов)`);
  await processBatch(nestedFiles, 200, updater, VOID, CELESTIA);
  console.log('✓ Вложенные Void завершены');
}

async function processBatch(
  files: TFile[],
  batchSize: number,
  updater: Updater,
  graph: IGraph,
  celestia: IGraph
): Promise<void> {
  for (let i = 0; i < files.length; i += batchSize) {
    const batch = files.slice(i, i + batchSize);
    await Promise.all(batch.map((file) => updater.update(file, graph, celestia)));
  }
}
