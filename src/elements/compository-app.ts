import { Constructor, css, html, LitElement, property } from 'lit-element';
import { ScopedElementsMixin as Scoped } from '@open-wc/scoped-elements';
import { BlockyBlockBoard } from '@compository/blocky';
import { CompositoryComposeZomes } from './compository-compose-zomes';
import { AdminWebsocket, CellId } from '@holochain/conductor-api';
import { Card } from 'scoped-material-components/mwc-card';
import {
  membraneContext,
  MembraneContextProvider,
} from '@holochain-open-dev/membrane-context';
import Navigo from 'navigo';
import { serializeHash } from '@holochain-open-dev/common';
import { CircularProgress } from 'scoped-material-components/mwc-circular-progress';

const root = null;
const useHash = true; // Defaults to: false
const hash = '#'; // Defaults to: '#'
const router = new Navigo(root, useHash, hash);

export class CompositoryApp extends membraneContext(
  Scoped(LitElement) as Constructor<LitElement>
) {
  @property({ type: Array })
  generatedCellIdToShow: CellId | undefined = undefined;

  @property({ type: Array })
  _loading = false;

  static get scopedElements() {
    return {
      'membrane-context-provider': MembraneContextProvider,
      'compository-compose-zomes': CompositoryComposeZomes,
      'blocky-block-board': BlockyBlockBoard,
      'mwc-card': Card,
      'mwc-circular-progress': CircularProgress,
    };
  }

  async loadCellId(dnaHash: string) {
    this._loading = true;
    const cellIds = await (this.membraneContext
      .adminWebsocket as AdminWebsocket).listCellIds();
    this.generatedCellIdToShow = cellIds.find(
      cellId => serializeHash(cellId[0]) === dnaHash
    );

    this._loading = false;
  }

  firstUpdated() {
    router
      .on({
        '/dna/:dna': params => {
          this.loadCellId(params.dna);
        },
        '*': () => {
          this.generatedCellIdToShow = undefined;
        },
      })
      .resolve();
  }

  onCellInstalled(e: CustomEvent) {
    const cellId = e.detail.cellId;
    router.navigate(`/dna/${serializeHash(cellId[0])}`);
  }

  static get styles() {
    return css`
      :host {
        display: flex;
      }
    `;
  }

  render() {
    return html`
      ${this.generatedCellIdToShow
        ? html`
            <membrane-context-provider
              .appWebsocket=${this.membraneContext.appWebsocket}
              .cellId=${this.generatedCellIdToShow}
            >
              <blocky-block-board
                style="flex: 1;"
                .compositoryCellId=${this.membraneContext.cellId}
              ></blocky-block-board>
            </membrane-context-provider>
          `
        : html`
            <div
              style="flex: 1; display: flex; align-items: center; justify-content: center"
            >
              ${this._loading
                ? html`<mwc-circular-progress></mwc-circular-progress>`
                : html`
                    <mwc-card style="width: 400px;">
                      <compository-compose-zomes
                        style="margin: 8px;"
                        @dna-installed=${(e: CustomEvent) =>
                          this.onCellInstalled(e)}
                      ></compository-compose-zomes>
                    </mwc-card>
                  `}
            </div>
          `}
    `;
  }
}
