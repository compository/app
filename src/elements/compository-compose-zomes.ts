import { html, LitElement, property, query } from 'lit-element';
import { Scoped } from 'scoped-elements';
import {
  DnaTemplate,
  Hashed,
  ZomeDef,
  ZomeDefReference,
  CompositoryService,
  generateDna,
  downloadFile,
  CompositoryInstallDnaDialog,
} from 'compository';
import { List } from 'scoped-material-components/dist/mwc-list';
import { Button } from 'scoped-material-components/dist/mwc-button';
import { CheckListItem } from 'scoped-material-components/dist/mwc-check-list-item';
import { CircularProgress } from 'scoped-material-components/dist/mwc-circular-progress';
import { membraneContext } from 'holochain-membrane-context';
import { sharedStyles } from './sharedStyles';
import { AppWebsocket, CellId } from '@holochain/conductor-api';

export class CompositoryComposeZomes extends membraneContext(
  Scoped(LitElement)
) {
  @property()
  zomeDefs!: Array<Hashed<ZomeDef>>;

  @query('#install-dna-dialog')
  _installDnaDialog!: CompositoryInstallDnaDialog;

  _selectedIndexes: Set<number> = new Set();

  static get styles() {
    return sharedStyles;
  }

  static get scopedElements() {
    return {
      'mwc-list': List,
      'mwc-check-list-item': CheckListItem,
      'mwc-circular-progress': CircularProgress,
      'mwc-button': Button,
      'compository-install-dna-dialog': CompositoryInstallDnaDialog,
    };
  }

  get _compositoryService() {
    return new CompositoryService(this.appWebsocket as AppWebsocket, this.cellId as CellId);
  }

  connectedCallback() {
    super.connectedCallback();
  }

  async firstUpdated() {
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
      name: 'adf',
      zome_defs: zomeDefReferences,
    };

    const dnaTemplateHash = await this._compositoryService.publishDnaTemplate(
      dnaTemplate
    );

    const dnaFile = await generateDna(
      '/node_modules/bundle_dna/bundle_dna_bg.wasm',
      this._compositoryService,
      dnaTemplateHash,
      '',
      []
    );

    downloadFile(dnaFile);

    this._installDnaDialog.open();
  }

  render() {
    if (!this.zomeDefs)
      return html`<mwc-circular-progress></mwc-circular-progress>`;

    return html` <compository-install-dna-dialog
        id="install-dna-dialog"
      ></compository-install-dna-dialog>
      <div class="column">
        <mwc-list
          multi
          @selected=${(e: CustomEvent) =>
            (this._selectedIndexes = e.detail.index)}
        >
          ${this.zomeDefs.map(
            zomeDef => html`
              <mwc-check-list-item>${zomeDef.content.name}</mwc-check-list-item>
            `
          )}
        </mwc-list>

        <mwc-button
          label="CREATE DNA TEMPLATE"
          @click=${() => this.createDnaTemplate()}
        ></mwc-button>
      </div>`;
  }
}
