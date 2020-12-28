import {
  Constructor,
  css,
  html,
  LitElement,
  property,
  query,
} from 'lit-element';
import { ScopedElementsMixin as Scoped } from '@open-wc/scoped-elements';
import { CompositoryComposeZomes } from './compository-compose-zomes';
import { AppWebsocket, AdminWebsocket, CellId } from '@holochain/conductor-api';
import { Card } from 'scoped-material-components/mwc-card';
import { MembraneContextProvider } from '@holochain-open-dev/membrane-context';
import { serializeHash } from '@holochain-open-dev/common';
import { CircularProgress } from 'scoped-material-components/mwc-circular-progress';
import { List } from 'scoped-material-components/mwc-list';
import { ListItem } from 'scoped-material-components/mwc-list-item';
import { sharedStyles } from './sharedStyles';
import { router } from '../router';
import { CompositoryDisplayDna } from './compository-display-dna';
import {
  ADMIN_URL,
  APP_URL,
  COMPOSITORY_DNA_HASH,
  EXECUTABLE_URL,
} from '../constants';
import {
  CompositoryInstallDnaDialog,
  CompositoryService,
  Dictionary,
  generateDnaFile,
} from '@compository/lib';
import { CompositoryInstalledCells } from './compository-installed-cells';
import { TopAppBar } from 'scoped-material-components/mwc-top-app-bar';

export class CompositoryApp extends (Scoped(
  LitElement
) as Constructor<LitElement>) {
  @property({ type: Array })
  _selectedCellId: CellId | undefined = undefined;

  @property({ type: Array })
  _holochainPresent = false;
  @property({ type: Array })
  _loading = true;
  @query('#context-provider')
  _contextProvider!: MembraneContextProvider;
  @query('#install-dialog')
  _installDnaDialog!: CompositoryInstallDnaDialog;

  _appWebsocket!: AppWebsocket;
  _adminWebsocket!: AdminWebsocket;
  _compositoryCellId!: CellId;

  async firstUpdated() {
    try {
      await this.connectToHolochain();
      this._holochainPresent = true;

      router
        .on({
          '/dna/:dna': async params => {
            const cellIds = await this._adminWebsocket.listCellIds();
            this._selectedCellId = cellIds.find(
              cellId => serializeHash(cellId[0]) === params.dna
            );

            if (!this._selectedCellId) {
              this.displayInstallDna(params.dna);
            }
          },
          '*': async () => {
            this._selectedCellId = undefined;
          },
        })
        .resolve();
    } catch (e) {
      this._holochainPresent = false;
    } finally {
      this._loading = false;
    }
  }

  async connectToHolochain() {
    this._adminWebsocket = await AdminWebsocket.connect(ADMIN_URL);
    this._appWebsocket = await AppWebsocket.connect(APP_URL);

    const cellIds = await this._adminWebsocket.listCellIds();

    this._compositoryCellId = cellIds.find(
      cellId => serializeHash(cellId[0]) === COMPOSITORY_DNA_HASH
    ) as CellId;

    this._contextProvider.adminWebsocket = this._adminWebsocket;
    this._contextProvider.appWebsocket = this._appWebsocket;
    this._contextProvider.cellId = this._compositoryCellId;
  }

  get _compositoryService(): CompositoryService {
    return new CompositoryService(this._appWebsocket, this._compositoryCellId);
  }

  async displayInstallDna(dnaHash: string) {
    this._loading = true;
    const template = await this._compositoryService.getTemplateForDna(dnaHash);

    const dnaFile = await generateDnaFile(
      this._compositoryService,
      template.dnaTemplate,
      template.properties,
      template.uuid
    );

    this._installDnaDialog.dnaFile = dnaFile;
    this._installDnaDialog.open();

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

  renderHolochainNotPresent() {
    return html` <div class="fill center-content">
      <mwc-card style="width: 600px;">
        <div class="column" style="margin: 16px">
          <span class="title" style="margin-bottom: 16px;"
            >Holochain conductor not found</span
          >
          <span style="margin-bottom: 12px;"
            >It seems that you don't have the compository executable running
            with admin URL at ${ADMIN_URL}.
          </span>
          <span style="margin-bottom: 12px;"
            >Download
            <a href="${EXECUTABLE_URL}">the compository executable</a>, run it
            locally on your machine and refresh this page.
          </span>
          <span>
            We have binaries ready for linux and macos. On Windows, download the
            linux executable and run it inside a
            <a
              href="https://www.omgubuntu.co.uk/how-to-install-wsl2-on-windows-10"
              >WSL environment</a
            >.
          </span>
        </div></mwc-card
      >
    </div>`;
  }

  renderContent() {
    if (this._loading)
      return html`<div class="fill center-content">
        <mwc-circular-progress indeterminate></mwc-circular-progress>
      </div>`;
    if (!this._holochainPresent) return this.renderHolochainNotPresent();
    if (this._selectedCellId)
      return html`<compository-display-dna
        style="flex: 1;"
        .cellIdToDisplay=${this._selectedCellId}
        .compositoryCellId=${this._contextProvider.cellId}
      ></compository-display-dna>`;
    else
      return html`
    <mwc-top-app-bar style="flex: 1; display: flex;">
    <div slot="title">Compository</div>

  <div class="fill row" style="width: 100vw; height: 100%; ">
      <compository-installed-cells class="fill"
      style="margin: 32px; margin-right: 0;"
      ></compository-installed-cells>
      
        <compository-compose-zomes
        style="margin: 32px;"
          class="fill"
          @dna-installed=${(e: CustomEvent) => this.onCellInstalled(e)}
        ></compository-compose-zomes>
      </mwc-card>
  
  </div>
  </mwc-top-app-bar>
`;
  }

  render() {
    return html`
      <compository-install-dna-dialog
        id="install-dialog"
      ></compository-install-dna-dialog>
      <membrane-context-provider id="context-provider">
        ${this.renderContent()}
      </membrane-context-provider>
    `;
  }

  static get scopedElements() {
    return {
      'membrane-context-provider': MembraneContextProvider,
      'compository-compose-zomes': CompositoryComposeZomes,
      'compository-display-dna': CompositoryDisplayDna,
      'compository-install-dna-dialog': CompositoryInstallDnaDialog,
      'compository-installed-cells': CompositoryInstalledCells,
      'mwc-circular-progress': CircularProgress,
      'mwc-top-app-bar': TopAppBar,
      'mwc-card': Card,
    };
  }
}
