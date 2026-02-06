import { App, PluginSettingTab, Setting, Plugin } from 'obsidian';

interface PathsSettings {
  void: string;
  celestia: string;
}

interface AliasesSettings {
  void: {
    founder: string;
    ancestor: string;
    father: string;
  };
  celestia: {
    founder: string;
    ancestor: string;
    father: string;
  };
}

interface TagsSettings {
  mapping: {
    [key: string]: string;
  };
}

interface PeriodicSettings {
  templates: {
    daily: string;
    weekly: string;
    monthly: string;
    quarterly: string;
    yearly: string;
  };
  celestia_paths: {
    daily: string;
    weekly: string;
    monthly: string;
    quarterly: string;
    yearly: string;
  };
}

interface EventSettings {
  types: string[];
}

export interface PluginSettings {
  paths: PathsSettings;
  aliases: AliasesSettings;
  tags: TagsSettings;
  periodic: PeriodicSettings;
  event: EventSettings;
}

export const DEFAULT_SETTINGS: PluginSettings = {
  paths: {
    void: 'master/<9> void/',
    celestia: 'master/<-9> celestia/',
  },

  aliases: {
    void: {
      founder: 'herald',
      ancestor: 'bubble',
      father: 'arm',
    },
    celestia: {
      founder: 'archont',
      ancestor: 'band',
      father: 'mate',
    },
  },

  tags: {
    mapping: {
      '❤️‍🔥': 'реализация',
      '🪨': 'личное',
      '🌊': 'духовность',
      '🌬️': 'саморазвитие',
    },
  },

  periodic: {
    templates: {
      daily: '0000-00-00',
      weekly: '0000-W00',
      monthly: '0000-00',
      quarterly: '0000-Q0',
      yearly: '0000',
    },
    celestia_paths: {
      daily: '❤️‍🔥.календарь.периодические.периодическая.daily',
      weekly: '❤️‍🔥.календарь.периодические.периодическая.weekly',
      monthly: '❤️‍🔥.календарь.периодические.периодическая.monthly',
      quarterly: '❤️‍🔥.календарь.периодические.периодическая.quarterly',
      yearly: '❤️‍🔥.календарь.периодические.периодическая.monthly',
    },
  },

  event: {
    types: ['Сон', 'Мысль', 'Анализ', 'Самоанализ'],
  },
};

export class PeriodicNotesSettingTab extends PluginSettingTab {
  plugin: Plugin & { settings: PluginSettings; saveSettings: () => Promise<void> };

  constructor(
    app: App,
    plugin: Plugin & { settings: PluginSettings; saveSettings: () => Promise<void> }
  ) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    containerEl.createEl('h2', { text: 'Periodic Notes Linker - Настройки' });

    // Секция: Пути
    containerEl.createEl('h3', { text: 'Пути к папкам' });

    new Setting(containerEl)
      .setName('Путь к Void')
      .setDesc('Путь к папке с заметками Void')
      .addText((text) =>
        text
          .setPlaceholder('master/<9> void/')
          .setValue(this.plugin.settings.paths.void)
          .onChange(async (value: string) => {
            this.plugin.settings.paths.void = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName('Путь к Celestia')
      .setDesc('Путь к папке с заметками Celestia')
      .addText((text) =>
        text
          .setPlaceholder('master/<-9> celestia/')
          .setValue(this.plugin.settings.paths.celestia)
          .onChange(async (value: string) => {
            this.plugin.settings.paths.celestia = value;
            await this.plugin.saveSettings();
          })
      );

    // Секция: Алиасы Void
    containerEl.createEl('h3', { text: 'Алиасы для Void' });

    new Setting(containerEl).setName('Void: Основатель (Founder)').addText((text) =>
      text
        .setPlaceholder('herald')
        .setValue(this.plugin.settings.aliases.void.founder)
        .onChange(async (value: string) => {
          this.plugin.settings.aliases.void.founder = value;
          await this.plugin.saveSettings();
        })
    );

    new Setting(containerEl).setName('Void: Предок (Ancestor)').addText((text) =>
      text
        .setPlaceholder('bubble')
        .setValue(this.plugin.settings.aliases.void.ancestor)
        .onChange(async (value: string) => {
          this.plugin.settings.aliases.void.ancestor = value;
          await this.plugin.saveSettings();
        })
    );

    new Setting(containerEl).setName('Void: Родитель (Father)').addText((text) =>
      text
        .setPlaceholder('arm')
        .setValue(this.plugin.settings.aliases.void.father)
        .onChange(async (value: string) => {
          this.plugin.settings.aliases.void.father = value;
          await this.plugin.saveSettings();
        })
    );

    // Секция: Алиасы Celestia
    containerEl.createEl('h3', { text: 'Алиасы для Celestia' });

    new Setting(containerEl).setName('Celestia: Основатель (Founder)').addText((text) =>
      text
        .setPlaceholder('archont')
        .setValue(this.plugin.settings.aliases.celestia.founder)
        .onChange(async (value: string) => {
          this.plugin.settings.aliases.celestia.founder = value;
          await this.plugin.saveSettings();
        })
    );

    new Setting(containerEl).setName('Celestia: Предок (Ancestor)').addText((text) =>
      text
        .setPlaceholder('band')
        .setValue(this.plugin.settings.aliases.celestia.ancestor)
        .onChange(async (value: string) => {
          this.plugin.settings.aliases.celestia.ancestor = value;
          await this.plugin.saveSettings();
        })
    );

    new Setting(containerEl).setName('Celestia: Родитель (Father)').addText((text) =>
      text
        .setPlaceholder('mate')
        .setValue(this.plugin.settings.aliases.celestia.father)
        .onChange(async (value: string) => {
          this.plugin.settings.aliases.celestia.father = value;
          await this.plugin.saveSettings();
        })
    );

    // Секция: Маппинг тегов
    containerEl.createEl('h3', { text: 'Маппинг тегов' });

    const tagMappings: Array<{ emoji: string; name: string; key: string }> = [
      { emoji: '❤️‍🔥', name: 'Реализация', key: '❤️‍🔥' },
      { emoji: '🪨', name: 'Личное', key: '🪨' },
      { emoji: '🌊', name: 'Духовность', key: '🌊' },
      { emoji: '🌬️', name: 'Саморазвитие', key: '🌬️' },
    ];

    tagMappings.forEach(({ emoji, name, key }) => {
      new Setting(containerEl).setName(`${emoji} →`).addText((text) =>
        text
          .setPlaceholder(name.toLowerCase())
          .setValue(this.plugin.settings.tags.mapping[key])
          .onChange(async (value: string) => {
            this.plugin.settings.tags.mapping[key] = value;
            await this.plugin.saveSettings();
          })
      );
    });

    // Секция: Шаблоны периодических заметок
    containerEl.createEl('h3', { text: 'Шаблоны периодических заметок' });

    new Setting(containerEl).setName('Шаблон Daily').addText((text) =>
      text
        .setPlaceholder('0000-00-00')
        .setValue(this.plugin.settings.periodic.templates.daily)
        .onChange(async (value: string) => {
          this.plugin.settings.periodic.templates.daily = value;
          await this.plugin.saveSettings();
        })
    );

    new Setting(containerEl).setName('Шаблон Weekly').addText((text) =>
      text
        .setPlaceholder('0000-W00')
        .setValue(this.plugin.settings.periodic.templates.weekly)
        .onChange(async (value: string) => {
          this.plugin.settings.periodic.templates.weekly = value;
          await this.plugin.saveSettings();
        })
    );

    new Setting(containerEl).setName('Шаблон Monthly').addText((text) =>
      text
        .setPlaceholder('0000-00')
        .setValue(this.plugin.settings.periodic.templates.monthly)
        .onChange(async (value: string) => {
          this.plugin.settings.periodic.templates.monthly = value;
          await this.plugin.saveSettings();
        })
    );

    new Setting(containerEl).setName('Шаблон Quarterly').addText((text) =>
      text
        .setPlaceholder('0000-Q0')
        .setValue(this.plugin.settings.periodic.templates.quarterly)
        .onChange(async (value: string) => {
          this.plugin.settings.periodic.templates.quarterly = value;
          await this.plugin.saveSettings();
        })
    );

    new Setting(containerEl).setName('Шаблон Yearly').addText((text) =>
      text
        .setPlaceholder('0000')
        .setValue(this.plugin.settings.periodic.templates.yearly)
        .onChange(async (value: string) => {
          this.plugin.settings.periodic.templates.yearly = value;
          await this.plugin.saveSettings();
        })
    );

    // Секция: Пути к периодическим в Celestia
    containerEl.createEl('h3', { text: 'Пути к периодическим заметкам в Celestia' });

    new Setting(containerEl).setName('Daily путь').addText((text) =>
      text
        .setPlaceholder('❤️‍🔥.календарь.периодические.периодическая.daily')
        .setValue(this.plugin.settings.periodic.celestia_paths.daily)
        .onChange(async (value: string) => {
          this.plugin.settings.periodic.celestia_paths.daily = value;
          await this.plugin.saveSettings();
        })
    );

    new Setting(containerEl).setName('Weekly путь').addText((text) =>
      text
        .setValue(this.plugin.settings.periodic.celestia_paths.weekly)
        .onChange(async (value: string) => {
          this.plugin.settings.periodic.celestia_paths.weekly = value;
          await this.plugin.saveSettings();
        })
    );

    new Setting(containerEl).setName('Monthly путь').addText((text) =>
      text
        .setValue(this.plugin.settings.periodic.celestia_paths.monthly)
        .onChange(async (value: string) => {
          this.plugin.settings.periodic.celestia_paths.monthly = value;
          await this.plugin.saveSettings();
        })
    );

    new Setting(containerEl).setName('Quarterly путь').addText((text) =>
      text
        .setValue(this.plugin.settings.periodic.celestia_paths.quarterly)
        .onChange(async (value: string) => {
          this.plugin.settings.periodic.celestia_paths.quarterly = value;
          await this.plugin.saveSettings();
        })
    );

    new Setting(containerEl).setName('Yearly путь').addText((text) =>
      text
        .setValue(this.plugin.settings.periodic.celestia_paths.yearly)
        .onChange(async (value: string) => {
          this.plugin.settings.periodic.celestia_paths.yearly = value;
          await this.plugin.saveSettings();
        })
    );

    // Секция: Типы событий
    containerEl.createEl('h3', { text: 'Типы событий' });

    new Setting(containerEl)
      .setName('Типы событий')
      .setDesc('Введите типы событий через запятую')
      .addText((text) =>
        text
          .setPlaceholder('Сон, Мысль, Анализ, Самоанализ')
          .setValue(this.plugin.settings.event.types.join(', '))
          .onChange(async (value: string) => {
            this.plugin.settings.event.types = value.split(',').map((s) => s.trim());
            await this.plugin.saveSettings();
          })
      );

    // Кнопка сброса
    new Setting(containerEl)
      .setName('Сбросить настройки')
      .setDesc('Вернуть все настройки к значениям по умолчанию')
      .addButton((button) =>
        button
          .setButtonText('Сбросить')
          .setWarning()
          .onClick(async () => {
            this.plugin.settings = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
            await this.plugin.saveSettings();
            this.display();
          })
      );
  }
}
