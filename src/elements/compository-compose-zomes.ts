import {
  Constructor,
  css,
  html,
  LitElement,
  property,
  query,
} from 'lit-element';
import { ScopedElementsMixin as Scoped } from '@open-wc/scoped-elements';
import {
  DnaTemplate,
  ZomeDef,
  ZomeDefReference,
  CompositoryService,
  generateDnaFile,
  CompositoryInstallDnaDialog,
  Dictionary,
} from '@compository/lib';
import { List } from 'scoped-material-components/mwc-list';
import { Button } from 'scoped-material-components/mwc-button';
import { CheckListItem } from 'scoped-material-components/mwc-check-list-item';
import { Snackbar } from 'scoped-material-components/mwc-snackbar';
import { CircularProgress } from 'scoped-material-components/mwc-circular-progress';
import { membraneContext } from '@holochain-open-dev/membrane-context';
import { sharedStyles } from './sharedStyles';
import { AppWebsocket, CellId } from '@holochain/conductor-api';
import { TextField } from 'scoped-material-components/mwc-textfield';
import { HoloHashed, serializeHash } from '@holochain-open-dev/core-types';
import { Card } from 'scoped-material-components/mwc-card';

export class CompositoryComposeZomes extends membraneContext(
  Scoped(LitElement) as Constructor<LitElement>
) {
  @property()
  zomeDefs!: Array<HoloHashed<ZomeDef>>;

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

  get _compositoryService() {
    return new CompositoryService(
      this.membraneContext.appWebsocket as AppWebsocket,
      this.membraneContext.cellId as CellId
    );
  }

  firstUpdated() {
    this.loadZomes();
  }

  async loadZomes() {
    // TODO: fix this
    const allZomeDefs = await this._compositoryService.getAllZomeDefs();

    const zomeDefsByName: Dictionary<HoloHashed<ZomeDef>> = {};
    for (const zomeDef of allZomeDefs) {
      zomeDefsByName[zomeDef.content.name] = zomeDef;
    }

    this.zomeDefs = Object.values(zomeDefsByName);
  }

  async createDnaTemplate() {
    const zomeDefs: Array<HoloHashed<ZomeDef>> = Array.from(
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
    try {
      const dnaTemplateHash = await this._compositoryService.publishDnaTemplate(
        dnaTemplate
      );

      const uuid = '';
      const properties: any[] = [];

      const dnaFile = await generateDnaFile(
        this._compositoryService,
        dnaTemplate,
        uuid,
        properties
      );

      await this._compositoryService.publishInstantiatedDna({
        dna_template_hash: dnaTemplateHash,
        instantiated_dna_hash: serializeHash(new Uint8Array(dnaFile.dna.hash)),
        properties,
        uuid,
      });

      this._installDnaDialog.dnaFile = dnaFile;
      this._installDnaDialog.open();
    } catch (e) {
      (this.shadowRoot?.getElementById('error-snackbar') as Snackbar).show();
    }
  }

  renderErrorSnackbar() {
    return html`
      <mwc-snackbar
        id="error-snackbar"
        labelText="Couldn't generate the DNA due to gossip inconsistencies. Please try again in a few minutes."
      ></mwc-snackbar>
    `;
  }

  render() {
    if (!this.zomeDefs)
      return html`<div class="fill center-content">
        <mwc-circular-progress indeterminate></mwc-circular-progress>
      </div>`;

    return html` ${this.renderErrorSnackbar()}
      <compository-install-dna-dialog
        id="install-dna-dialog"
      ></compository-install-dna-dialog>
      <mwc-card class="fill">
        <div class="column fill" style="margin: 16px; min-height: 0px;">
          <span class="title">Compose zomes</span>
          <mwc-list
            style="overflow-y: auto; flex: 1;"
            multi
            @selected=${(e: CustomEvent) =>
              (this._selectedIndexes = e.detail.index)}
          >
            ${this.zomeDefs.map(
              zomeDef => html`
                <mwc-check-list-item
                  .selected=${zomeDef.content.name === 'blocky' ||
                  zomeDef.content.name === 'profiles'}
                  .disabled=${zomeDef.content.name === 'blocky' ||
                  zomeDef.content.name === 'profiles'}
                >
                  ${zomeDef.content.name}
                </mwc-check-list-item>
              `
            )}
          </mwc-list>

          <div class="column">
            <mwc-textfield
              @input=${(e: CustomEvent) =>
                (this._templateName = (e.target as any).value)}
              label="Dna Template Name"
              style="margin-bottom: 16px;"
              required
            ></mwc-textfield>

            <mwc-button
              .disabled=${!this._templateName}
              raised
              label="GENERATE DNA"
              @click=${() => this.createDnaTemplate()}
            ></mwc-button>
          </div>
        </div>
      </mwc-card>`;
  }

  static get scopedElements() {
    return {
      'mwc-list': List,
      'mwc-check-list-item': CheckListItem,
      'mwc-circular-progress': CircularProgress,
      'mwc-button': Button,
      'mwc-textfield': TextField,
      'compository-install-dna-dialog': CompositoryInstallDnaDialog,
      'mwc-card': Card,
      'mwc-snackbar': Snackbar,
    };
  }
}
