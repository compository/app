import { css, html, LitElement, property } from 'lit-element';
import { Scoped } from 'scoped-elements';
import { BlockyBlockBoard } from 'blocky';
import { CompositoryComposeZomes } from './compository-compose-zomes';
import { CellId } from '@holochain/conductor-api';
import { membraneContext } from 'holochain-membrane-context';
import Navigo from 'navigo';
import { deserializeHash, serializeHash } from '@holochain-open-dev/common';

const root = null;
const useHash = true; // Defaults to: false
const hash = '#!'; // Defaults to: '#'
const router = new Navigo(root, useHash, hash);

export class CompositoryApp extends membraneContext(Scoped(LitElement)) {
  @property({ type: Array })
  generatedCellIdToShow: CellId | undefined = undefined;

  static get scopedElements() {
    return {
      'compository-compose-zomes': CompositoryComposeZomes,
      'blocky-block-board': BlockyBlockBoard,
    };
  }

  firstUpdated() {
    router
      .on({
        '/dna/:dna/:agent': params => {
          this.generatedCellIdToShow = [
            deserializeHash(params.dna) as any,
            deserializeHash(params.agent) as any,
          ];
        },
        '*': () => {
          this.generatedCellIdToShow = undefined;
        },
      })
      .resolve();
  }

  onCellInstalled(e: CustomEvent) {
    const cellId = e.detail.cellId;
    router.navigate(
      `/dna/${serializeHash(cellId[0])}/${serializeHash(cellId[1])}`
    );
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
            <blocky-block-board
              style="flex: 1;"
              .cellId=${this.generatedCellIdToShow}
              .compositoryCellId=${this.cellId}
            ></blocky-block-board>
          `
        : html`
            <compository-compose-zomes
              @dna-installed=${(e: CustomEvent) => this.onCellInstalled(e)}
            ></compository-compose-zomes>
          `}
    `;
  }
}
