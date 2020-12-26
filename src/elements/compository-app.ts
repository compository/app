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
import { TopAppBar } from 'scoped-material-components/mwc-top-app-bar';
import { IconButton } from 'scoped-material-components/mwc-icon-button';
import { sharedStyles } from './sharedStyles';
import { router } from '../router';
import { CompositoryDisplayDna } from './compository-display-dna';
import { ADMIN_URL, APP_URL, COMPOSITORY_DNA_HASH } from '../constants';

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

  async loadCellId(dnaHash: string) {
    this._loading = true;
    this._installedCellIds = await (this._contextProvider
      .adminWebsocket as AdminWebsocket).listCellIds();
    this._selectedCellId = this._installedCellIds.find(
      cellId => serializeHash(cellId[0]) === dnaHash
    );

    this._loading = false;
  }

  async firstUpdated() {
    await this.connectToHolochain();
    router
      .on({
        '/dna/:dna': params => {
          this.loadCellId(params.dna);
        },
        '*': () => {
          this._selectedCellId = undefined;
        },
      })
      .resolve();
  }

  async connectToHolochain() {
    const admin = await AdminWebsocket.connect(ADMIN_URL);
    const app = await AppWebsocket.connect(APP_URL);

    const cellIds = await admin.listCellIds();

    const compositoryCellId = cellIds.find(
      cellId => serializeHash(cellId[0]) === COMPOSITORY_DNA_HASH
    );

    this._contextProvider.adminWebsocket = admin;
    this._contextProvider.appWebsocket = app;
    this._contextProvider.cellId = compositoryCellId as CellId;

    this._loading = false;
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
      <div style="margin: 16px;" class="column">
        <span class="title">Installed DNAs</span>
        ${this.getNonCompositoryCellIds().length === 0
          ? html`
              <span
                style="align-self: center; justify-self: center; margin-top: 80px;"
                >You don't have any generated DNAs installed yet</span
              >
            `
          : html`
              <mwc-list>
                ${this.getNonCompositoryCellIds().map(
                  cellId =>
                    html`<mwc-list-item
                      @click=${() =>
                        router.navigate(`/dna/${serializeHash(cellId[0])}`)}
                      >${serializeHash(cellId[0])}</mwc-list-item
                    >`
                )}
              </mwc-list>
            `}
      </div>
    </mwc-card>`;
  }

  render() {
    return html`
      <div class="centering-frame">
        <membrane-context-provider id="context-provider">
          ${this._loading
            ? html`<mwc-circular-progress
                indeterminate
              ></mwc-circular-progress>`
            : this._selectedCellId
            ? html`<compository-display-dna
                style="flex: 1;"
                .cellIdToDisplay=${this._selectedCellId}
                .compositoryCellId=${this._contextProvider.cellId}
              ></compository-display-dna>`
            : html`
                <div class="row">
                  ${this.renderInstalledCells()}
                  <mwc-card style="width: 400px;">
                    <compository-compose-zomes
                      style="margin: 16px;"
                      @dna-installed=${(e: CustomEvent) =>
                        this.onCellInstalled(e)}
                    ></compository-compose-zomes>
                  </mwc-card>
                </div>
              `}
        </membrane-context-provider>
      </div>
    `;
  }
}
