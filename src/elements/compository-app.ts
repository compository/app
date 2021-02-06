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
import { BlockyDnaBoard } from '@compository/blocky';
import { serializeHash } from '@holochain-open-dev/common';
import { CircularProgress } from 'scoped-material-components/mwc-circular-progress';
import { sharedStyles } from './sharedStyles';
import { router } from '../router';
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
import { Button } from 'scoped-material-components/mwc-button';
import { DiscoverDnas } from './compository-discover-dnas';

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

  @property({ type: String })
  _nonexistingDna: string | undefined = undefined;

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
              this._nonexistingDna = params.dna;
              this._loading = false;
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

  onCellInstalled(e: CustomEvent) {
    const cellId = e.detail.cellId;
    router.navigate(`/dna/${serializeHash(cellId[0])}`);
  }

  renderNonexistingDna() {
    return html`
      <div class="fill center-content">
        <mwc-card style="width: 800px;">
          <div class="column" style="margin: 16px">
            <span class="title" style="margin-bottom: 24px;">
              DNA not found
            </span>
            <span style="margin-bottom: 16px;">
              The DNA with hash "${this._nonexistingDna}" doesn't seem to exist
              in the compository.
            </span>
            <span style="margin-bottom: 16px;">
              Make sure the DNA hash in the URL is correct and try again.
            </span>

            <div class="column" style="align-items: flex-end">
              <mwc-button
                label="Go back"
                @click=${() => {
                  this._nonexistingDna = undefined;
                  router.navigate('/');
                }}
              ></mwc-button>
            </div></div
        ></mwc-card>
      </div>
    `;
  }

  renderHolochainNotPresent() {
    return html` <div class="column fill center-content">
      <mwc-card style="width: 1100px; margin-bottom: 48px;">
        <div class="column" style="margin: 16px">
          <span class="title" style="margin-bottom: 24px; font-size: 32px;"
            >Compository</span
          >
          <span style="margin-bottom: 16px"
            >Play with holochain in a new way, by generating new DNAs on the fly
            and composing UIs to suit your unique purposes.</span
          >
          <span style="margin-bottom: 16px"
            >Please note! This is an experiment, not ready to use in any kind of
            production environment. This web app and the compository DNA will
            suffer a lot of changes, so expect rapid iteration and things
            breaking.
          </span>
          <span
            >Try it out by following the instructions below! What would be awesome to add to the compository? Are
            you excited to play with this in some way? Tell us in the
            <a
              href="https://forum.holochain.org/t/introducing-the-compository/4486"
              >Holochain Forum</a
            >.</span
          >

          <hr>

          <span style="font-size: 20px; margin-top: 16px; margin-bottom: 8px;"
            >Running Without a Terminal</span
          >
          <ul>
            <li>
              First, download and install
              <a href="${DOCKER_DESTKOP_URL}">docker desktop</a>.
            </li>
            <li>
              On Windows, download and execute
              <a href="assets/compository-launch.bat">this file</a>. You can
              clean up the persistent storage executing
              <a href="assets/compository-cleanup.bat">this file</a>.
            </li>
            <li>
              On MacOs, download and extract <a href="assets/compository-commands.zip">this zip</a> and execute
             the "compository-launch.command" file</a>. You can
              clean up the persistent storage executing the "compository-cleanup.command" file.
            </li>
            <li><strong>Lastly, navigate to <a href="http://localhost:8888/">http://localhost:8888/</a> to enter the web app.</strong></li>
          </ul>

          <span style="font-size: 20px; margin-bottom: 16px; margin-top: 16px;"
            >Running Inside a Terminal</span
          >

          <span style="margin-bottom: 20px;">
            Assuming you have docker already installed, <strong>run this</strong>:
          </span>

          <pre style="margin: 4px 0;">
docker run -it --init -v compository:/database -p 22222:22222 -p 22223:22223 -p 8888:8888 guillemcordoba/compository:0.4
          </pre>
          <span style="margin-bottom: 16px;"><strong>Lastly, navigate to <a href="http://localhost:8888/">http://localhost:8888/</a> to enter the web app.</strong></span>
          <span>
            You can clean up the persistent storage by removing the docker
            volume with these commands:
          </span>
          <pre>docker rm $(docker ps -a -f status=exited -q)</pre>
          <pre style="margin: 0;">docker volume rm --force compository</pre>
        </div>
      </mwc-card>
    </div>`;
  }

  renderContent() {
    if (this._loading)
      return html`<div class="fill center-content">
        <mwc-circular-progress indeterminate></mwc-circular-progress>
      </div>`;
    if (!this._holochainPresent) return this.renderHolochainNotPresent();
    if (this._selectedCellId)
      return html`<blocky-dna-board
        style="flex: 1;"
        .cellIdToDisplay=${this._selectedCellId}
        .compositoryCellId=${this._compositoryCellId}
        @navigate-back=${() => router.navigate('/')}
      ></blocky-dna-board>`;
    else if (this._nonexistingDna) return this.renderNonexistingDna();
    else
      return html`
        <mwc-top-app-bar style="flex: 1; display: flex;">
          <div slot="title">Compository</div>

          <mwc-button
            slot="actionItems"
            label="How to publish your zome"
            style="--mdc-theme-primary: white;"
            @click=${() =>
              (location.href = 'https://github.com/compository/cli')}
          ></mwc-button>

          <div class="fill row" style="width: 100vw; height: 100%; ">
            <div class="column fill">
              <compository-installed-cells
                class="fill"
                style="margin: 32px; margin-right: 0; margin-bottom: 0;"
              ></compository-installed-cells>
              <compository-discover-dnas
                class="fill"
                style="margin: 32px; margin-right: 0;"
                @dna-installed=${(e: CustomEvent) => {
                  this._selectedCellId = e.detail.cellId;
                  this._loading = false;
                }}
              ></compository-discover-dnas>
            </div>

            <compository-compose-zomes
              style="margin: 32px;"
              class="fill"
              @dna-installed=${(e: CustomEvent) => this.onCellInstalled(e)}
            ></compository-compose-zomes>
          </div>
        </mwc-top-app-bar>
      `;
  }

  render() {
    return html`
      <membrane-context-provider id="context-provider">
        ${this.renderContent()}
      </membrane-context-provider>
    `;
  }

  static get scopedElements() {
    return {
      'membrane-context-provider': MembraneContextProvider,
      'compository-compose-zomes': CompositoryComposeZomes,
      'blocky-dna-board': BlockyDnaBoard,
      'compository-install-dna-dialog': CompositoryInstallDnaDialog,
      'compository-installed-cells': CompositoryInstalledCells,
      'mwc-circular-progress': CircularProgress,
      'mwc-top-app-bar': TopAppBar,
      'mwc-button': Button,
      'mwc-card': Card,
      'compository-discover-dnas': DiscoverDnas,
    };
  }

  static get styles() {
    return [
      css`
        :host {
          display: flex;
        }
        li {
          margin-bottom: 8px;
        }
      `,
      sharedStyles,
    ];
  }
}
