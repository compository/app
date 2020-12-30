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
import { sharedStyles } from './sharedStyles';
import { router } from '../router';
import { CompositoryDisplayDna } from './compository-display-dna';
import {
  ADMIN_URL,
  APP_URL,
  COMPOSITORY_DNA_HASH,
  DOCKER_DESTKOP_URL,
} from '../constants';
import {
  CompositoryInstallDnaDialog,
  CompositoryService,
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

    if (!this._compositoryCellId) throw new Error('Compository DNA not found');

    this._contextProvider.adminWebsocket = this._adminWebsocket;
    this._contextProvider.appWebsocket = this._appWebsocket;
    this._contextProvider.cellId = this._compositoryCellId;
  }

  get _compositoryService(): CompositoryService {
    return new CompositoryService(this._appWebsocket, this._compositoryCellId);
  }

  async displayInstallDna(dnaHash: string) {
    this._loading = true;
    try {
      const template = await this._compositoryService.getTemplateForDna(
        dnaHash
      );

      const dnaFile = await generateDnaFile(
        this._compositoryService,
        template.dnaTemplate,
        template.properties,
        template.uuid
      );

      this._installDnaDialog.dnaFile = dnaFile;
      this._installDnaDialog.open();
    } catch (e) {
      this.displayInstallDna(dnaHash);
    }
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
      <mwc-card style="width: 900px;">
        <div class="column" style="margin: 16px">
          <span class="title" style="margin-bottom: 16px;"
            >Holochain conductor not found</span
          >
          <span style="margin-bottom: 12px;"
            >It seems that you don't have the compository docker container
            running with admin URL at <i>${ADMIN_URL}</i>.
          </span>
          <span style="margin-bottom: 12px;"
            >Run the docker image with this command:
          </span>
          <pre>
          docker run -it --init -v $(pwd)/database:/database -p 22222:22222 -p 22223:22223 guillemcordoba/compository:0.2
          </pre
          >
          <span style="margin-top: 12px;">
            If you don't have docker installed and are on windows, install the
            <a href="${DOCKER_DESTKOP_URL}">docker desktop</a> and execute this
            file.
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
      <membrane-context-provider id="context-provider">
        <compository-install-dna-dialog
          @dna-installed=${(e: CustomEvent) => {
            this._selectedCellId = e.detail.cellId;
            this._loading = false;
          }}
          id="install-dialog"
        ></compository-install-dna-dialog>
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
