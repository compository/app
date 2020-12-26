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
  membraneContext,
  MembraneContextProvider,
} from '@holochain-open-dev/membrane-context';
import { CellId } from '@holochain/conductor-api';
import { router } from '../router';
import { serializeHash } from '@holochain-open-dev/common';
import { BlockyBlockBoard } from '@compository/blocky';
import { TopAppBar } from 'scoped-material-components/mwc-top-app-bar';
import { IconButton } from 'scoped-material-components/mwc-icon-button';
import { sharedStyles } from './sharedStyles';

export class CompositoryDisplayDna extends membraneContext(
  Scoped(LitElement) as Constructor<LitElement>
) {
  @property({ type: Array })
  cellIdToDisplay!: CellId;
  @property({ type: Array })
  compositoryCellId!: CellId;

  @query('#block-board')
  _board!: BlockyBlockBoard;

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

  render() {
    return html`<membrane-context-provider
      .appWebsocket=${this.membraneContext.appWebsocket}
      .cellId=${this.cellIdToDisplay}
    >
      <mwc-top-app-bar style="flex: 1; display: flex;">
        <mwc-icon-button
          icon="arrow_back"
          slot="navigationIcon"
          @click=${() => router.navigate(`/`)}
        ></mwc-icon-button>
        <div slot="title">${serializeHash(this.cellIdToDisplay[0])}</div>

        <mwc-icon-button
          icon="edit"
          slot="actionItems"
          @click=${() => {
            this._board.editing = true;
            this.requestUpdate();
          }}
        ></mwc-icon-button>
        <blocky-block-board
          id="block-board"
          style="width: 100vw; height: 100%; flex: 1;"
          .compositoryCellId=${this.compositoryCellId}
        ></blocky-block-board>
      </mwc-top-app-bar>
    </membrane-context-provider>`;
  }

  static get scopedElements() {
    return {
      'membrane-context-provider': MembraneContextProvider,
      'blocky-block-board': BlockyBlockBoard,
      'mwc-top-app-bar': TopAppBar,
      'mwc-icon-button': IconButton,
    };
  }
}
