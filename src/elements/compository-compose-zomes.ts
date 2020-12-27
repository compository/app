import {
  Constructor,
  css,
  html,
  LitElement,
  property,
  PropertyValues,
  query,
} from 'lit-element';
import { ScopedElementsMixin as Scoped } from '@open-wc/scoped-elements';
import {
  DnaTemplate,
  Hashed,
  ZomeDef,
  ZomeDefReference,
  CompositoryService,
  generateDna,
  downloadFile,
  CompositoryInstallDnaDialog,
} from '@compository/lib';
import { List } from 'scoped-material-components/mwc-list';
import { Button } from 'scoped-material-components/mwc-button';
import { CheckListItem } from 'scoped-material-components/mwc-check-list-item';
import { CircularProgress } from 'scoped-material-components/mwc-circular-progress';
import { membraneContext } from '@holochain-open-dev/membrane-context';
import { sharedStyles } from './sharedStyles';
import { AppWebsocket, CellId } from '@holochain/conductor-api';
import { TextField } from 'scoped-material-components/mwc-textfield';

export class CompositoryComposeZomes extends membraneContext(
  Scoped(LitElement) as Constructor<LitElement>
) {
  @property()
  zomeDefs!: Array<Hashed<ZomeDef>>;

  @query('#install-dna-dialog')
  _installDnaDialog!: CompositoryInstallDnaDialog;

  _selectedIndexes: Set<number> = new Set();
  @property()
  _templateName: string | undefined = undefined;

  static get styles() {
    return [
      sharedStyles,
      css`
        :host {
          display: flex;
        }
      `,
    ];
  }

  static get scopedElements() {
    return {
      'mwc-list': List,
      'mwc-check-list-item': CheckListItem,
      'mwc-circular-progress': CircularProgress,
      'mwc-button': Button,
      'mwc-textfield': TextField,
      'compository-install-dna-dialog': CompositoryInstallDnaDialog,
    };
  }

  get _compositoryService() {
    return new CompositoryService(
      this.membraneContext.appWebsocket as AppWebsocket,
      this.membraneContext.cellId as CellId
    );
  }

  updated(changedValues: PropertyValues) {
    super.updated(changedValues);
    if (
      changedValues.has('membraneContext') &&
      this.membraneContext.appWebsocket
    ) {
      this.loadZomes();
    }
  }

  async loadZomes() {
    this.zomeDefs = await this._compositoryService.getAllZomeDefs();
  }

  async createDnaTemplate() {
    const zomeDefs: Array<Hashed<ZomeDef>> = Array.from(
      this._selectedIndexes
    ).map(i => this.zomeDefs[i]);

    const zomeDefReferences: Array<ZomeDefReference> = zomeDefs.map(def => ({
      name: def.content.name,
      zome_def_hash: def.hash,
    }));
    const dnaTemplate: DnaTemplate = {
      name: this._templateName as string,
      zome_defs: zomeDefReferences,
    };

    const dnaTemplateHash = await this._compositoryService.publishDnaTemplate(
      dnaTemplate
    );

    const dnaFile = await generateDna(
      this._compositoryService,
      dnaTemplateHash,
      '',
      []
    );

    this._installDnaDialog.dnaFile = dnaFile;
    this._installDnaDialog.open();
  }

  render() {
    if (!this.zomeDefs)
      return html`<div class="fill center-content">
        <mwc-circular-progress indeterminate></mwc-circular-progress>
      </div>`;

    return html` <compository-install-dna-dialog
        id="install-dna-dialog"
      ></compository-install-dna-dialog>
      <div class="column fill">
        <span class="title">Compose zomes</span>
        <mwc-list
          multi
          @selected=${(e: CustomEvent) =>
            (this._selectedIndexes = e.detail.index)}
        >
          ${this.zomeDefs.map(
            zomeDef => html`
              <mwc-check-list-item
                .selected=${zomeDef.content.name === 'blocky'}
                .disabled=${zomeDef.content.name === 'blocky'}
              >
                ${zomeDef.content.name}
              </mwc-check-list-item>
            `
          )}
        </mwc-list>

        <mwc-textfield
          @input=${(e: CustomEvent) =>
            (this._templateName = (e.target as any).value)}
          label="Dna Template Name"
          style="margin-bottom: 16px;"
        ></mwc-textfield>

        <mwc-button
          .disabled=${!this._templateName}
          raised
          label="GENERATE DNA"
          @click=${() => this.createDnaTemplate()}
        ></mwc-button>
      </div>`;
  }
}
