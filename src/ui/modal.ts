import { App, Modal } from 'obsidian';

export class ConfirmationModal extends Modal {
  private message: string;
  private action: () => Promise<void>;

  constructor(app: App, message: string, action: () => Promise<void>) {
    super(app);
    this.message = message;
    this.action = action;
  }

  onOpen(): void {
    const { contentEl } = this;

    this.modalEl.addClass('confirm-modal');
    contentEl.createEl('p', { text: this.message });

    const buttonContainer = contentEl.createDiv('modal-button-container');

    buttonContainer
      .createEl('button', { text: 'Отмена' })
      .addEventListener('click', () => this.close());

    const confirmBtn = buttonContainer.createEl('button', {
      attr: { type: 'submit' },
      cls: 'mod-cta',
      text: 'Подтвердить',
    });

    confirmBtn.addEventListener('click', async () => {
      this.close();
      await this.action();
    });

    setTimeout(() => confirmBtn.focus(), 50);
  }

  onClose(): void {
    const { contentEl } = this;
    contentEl.empty();
  }
}
