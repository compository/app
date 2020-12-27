import {
  Constructor,
  css,
  html,
  LitElement,
  property,
  query,
} from 'lit-element';
import { ScopedElementsMixin as Scoped } from '@open-wc/scoped-elements';
import { BlockyBlockBoard } from '@compository/blocky';
import type { BlockBoard } from 'block-board';
import { CompositoryComposeZomes } from './compository-compose-zomes';
import { AppWebsocket, AdminWebsocket, CellId } from '@holochain/conductor-api';
import { Card } from 'scoped-material-components/mwc-card';
import {
  membraneContext,
  MembraneContextProvider,
} from '@holochain-open-dev/membrane-context';
import { serializeHash } from '@holochain-open-dev/common';
import { CircularProgress } from 'scoped-material-components/mwc-circular-progress';
import { List } from 'scoped-material-components/mwc-list';
import { ListItem } from 'scoped-material-components/mwc-list-item';
import { sharedStyles } from './sharedStyles';
import { router } from '../router';
import { CompositoryDisplayDna } from './compository-display-dna';
import { ADMIN_URL, APP_URL, COMPOSITORY_DNA_HASH } from '../constants';
import { CompositoryService, Dictionary } from '@compository/lib';

export class CompositoryApp extends (Scoped(
  LitElement
) as Constructor<LitElement>) {
  @property({ type: Array })
  _installedCellIds: Array<CellId> = [];

  @property({ type: Array })
  _selectedCellId: CellId | undefined = undefined;

  @property({ type: Array })
  _loading = true;
  @query('#context-provider')
  _contextProvider!: MembraneContextProvider;

  _dnaTemplateNames: Dictionary<string> = {};

  static get scopedElements() {
    return {
      'membrane-context-provider': MembraneContextProvider,
      'compository-compose-zomes': CompositoryComposeZomes,
      'compository-display-dna': CompositoryDisplayDna,
      'mwc-card': Card,
      'mwc-circular-progress': CircularProgress,
      'mwc-list': List,
      'mwc-list-item': ListItem,
    };
  }

  async loadCellsIds() {
    this._loading = true;
    this._installedCellIds = await (this._contextProvider
      .adminWebsocket as AdminWebsocket).listCellIds();

    const instantiatedDnaHashes = this._installedCellIds
      .map(cellId => serializeHash(cellId[0]))
      .filter(hash => hash !== COMPOSITORY_DNA_HASH);

    this._dnaTemplateNames = await this.fetchDnaTemplateNames(
      this._contextProvider.appWebsocket,
      this._contextProvider.cellId as CellId,
      instantiatedDnaHashes
    );
    this._loading = false;
  }

  async firstUpdated() {
    await this.connectToHolochain();
    router
      .on({
        '/dna/:dna': async params => {
          await this.loadCellsIds();
          this._selectedCellId = this._installedCellIds.find(
            cellId => serializeHash(cellId[0]) === params.dna
          );
        },
        '*': async () => {
          await this.loadCellsIds();
          this._selectedCellId = undefined;
        },
      })
      .resolve();
  }

  async connectToHolochain() {
    const admin = await AdminWebsocket.connect(ADMIN_URL);
    const app = await AppWebsocket.connect(APP_URL);

    this._installedCellIds = await admin.listCellIds();

    const compositoryCellId = this._installedCellIds.find(
      cellId => serializeHash(cellId[0]) === COMPOSITORY_DNA_HASH
    );

    this._contextProvider.adminWebsocket = admin;
    this._contextProvider.appWebsocket = app;
    this._contextProvider.cellId = compositoryCellId as CellId;

    await this.loadCellsIds();
  }

  async fetchDnaTemplateNames(
    appWebsocket: AppWebsocket,
    compositoryCellId: CellId,
    instantiatedDnaHashes: string[]
  ): Promise<Dictionary<string>> {
    const compositoryService = new CompositoryService(
      appWebsocket,
      compositoryCellId
    );
    const promises = instantiatedDnaHashes.map(hash =>
      compositoryService.getTemplateForDna(hash)
    );

    const templates = await Promise.all(promises);
    const names: Dictionary<string> = {};
    for (let i = 0; i < templates.length; i++) {
      names[instantiatedDnaHashes[i]] = templates[i].dnaTemplate.name;
    }
    return names;
  }

  onCellInstalled(e: CustomEvent) {
    const cellId = e.detail.cellId;
    router.navigate(`/dna/${serializeHash(cellId[0])}`);
  }

  static get styles() {
    return [
      css`
        :host {
          display: flex;
        }
      `,
      sharedStyles,
    ];
  }

  getNonCompositoryCellIds() {
    return this._installedCellIds.filter(
      cellId => serializeHash(cellId[0]) !== COMPOSITORY_DNA_HASH
    );
  }

  renderInstalledCells() {
    return html` <mwc-card style="margin-right: 24px; width: 400px;">
      <div style="margin: 16px;" class="column fill">
        <span class="title">Installed DNAs</span>
        ${this.getNonCompositoryCellIds().length === 0
          ? html`
              <div class="fill center-content">
                <span>You don't have any generated DNAs installed yet</span>
              </div>
            `
          : html`
              <mwc-list>
                ${this.getNonCompositoryCellIds().map(
                  cellId =>
                    html`<mwc-list-item
                      @click=${() =>
                        router.navigate(`/dna/${serializeHash(cellId[0])}`)}
                      twoline
                    >
                      <span
                        >${this._dnaTemplateNames[
                          serializeHash(cellId[0])
                        ]}</span
                      >
                      <span slot="secondary">${serializeHash(cellId[0])}</span>
                    </mwc-list-item>`
                )}
              </mwc-list>
            `}
      </div>
    </mwc-card>`;
  }

  render() {
    return html`
      <membrane-context-provider id="context-provider">
        ${this._loading
          ? html`<div class="fill center-content">
              <mwc-circular-progress indeterminate></mwc-circular-progress>
            </div>`
          : this._selectedCellId
          ? html`<compository-display-dna
              style="flex: 1;"
              .cellIdToDisplay=${this._selectedCellId}
              .compositoryCellId=${this._contextProvider.cellId}
            ></compository-display-dna>`
          : html`
              <div class="fill center-content">
                <div class="row">
                  ${this.renderInstalledCells()}
                  <mwc-card style="width: 400px;">
                    <compository-compose-zomes
                      class="fill"
                      style="margin: 16px;"
                      @dna-installed=${(e: CustomEvent) =>
                        this.onCellInstalled(e)}
                    ></compository-compose-zomes>
                  </mwc-card>
                </div>
              </div>
            `}
      </membrane-context-provider>
    `;
  }
}
