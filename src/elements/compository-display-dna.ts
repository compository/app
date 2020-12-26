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
import { AppWebsocket, CellId } from '@holochain/conductor-api';
import { router } from '../router';
import { serializeHash } from '@holochain-open-dev/common';

import { BlockyBlockBoard } from '@compository/blocky';
import { TopAppBar } from 'scoped-material-components/mwc-top-app-bar';
import { IconButton } from 'scoped-material-components/mwc-icon-button';
import { sharedStyles } from './sharedStyles';
import {
  HodCreateProfileForm,
  HodProfilePrompt,
  ProfilesService,
} from '@holochain-open-dev/profiles';
import { CompositoryService } from '@compository/lib';

export class CompositoryDisplayDna extends membraneContext(
  Scoped(LitElement) as Constructor<LitElement>
) {
  @property({ type: Array })
  cellIdToDisplay!: CellId;
  @property({ type: Array })
  compositoryCellId!: CellId;

  @property({ type: Boolean })
  _profilesZomeExistsInDna = false;
  @property({ type: Boolean })
  _profileAlreadyCreated = false;

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

  async firstUpdated() {
    const compositoryService = new CompositoryService(
      this.membraneContext.appWebsocket as AppWebsocket,
      this.compositoryCellId
    );
    const dnaTemplate = await compositoryService.getTemplateForDna(
      serializeHash(this.cellIdToDisplay[0])
    );
    this._profilesZomeExistsInDna = !!dnaTemplate.dnaTemplate.zome_defs.find(
      zome => zome.name === 'profiles'
    );

    if (this._profilesZomeExistsInDna) {
      const profileService = new ProfilesService(
        this.membraneContext.appWebsocket as AppWebsocket,
        this.cellIdToDisplay
      );

      const myProfile = await profileService.getMyProfile();
      this._profileAlreadyCreated = !!myProfile;
    }
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
        <div style="width: 100vw; height: 100%; display: flex;">
          ${
            !this._profilesZomeExistsInDna || this._profileAlreadyCreated
              ? html`
                  <blocky-block-board
                    id="block-board"
                    style="flex: 1;"
                    .compositoryCellId=${this.compositoryCellId}
                  ></blocky-block-board>
                `
              : html`
                  <div
                    style="flex: 1; display: flex; align-items: center; justify-content: center;"
                  >
                    <hod-create-profile-form
                      @profile-created=${() =>
                        (this._profileAlreadyCreated = true)}
                    ></hod-create-profile-form>
                  </div>
                `
          }
            </div>
        </div>
      </mwc-top-app-bar>
    </membrane-context-provider>`;
  }

  static get scopedElements() {
    return {
      'membrane-context-provider': MembraneContextProvider,
      'blocky-block-board': BlockyBlockBoard,
      'mwc-top-app-bar': TopAppBar,
      'mwc-icon-button': IconButton,
      'hod-create-profile-form': HodCreateProfileForm,
    };
  }
}
