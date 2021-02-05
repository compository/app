import { CompositoryService, Dictionary } from '@compository/lib';
import { serializeHash } from '@holochain-open-dev/common';
import { membraneContext } from '@holochain-open-dev/membrane-context';
import { CellId, AdminWebsocket, AppWebsocket } from '@holochain/conductor-api';
import { ScopedElementsMixin as Scoped } from '@open-wc/scoped-elements';
import {
  Constructor,
  html,
  LitElement,
  property,
  PropertyValues,
} from 'lit-element';
import { Card } from 'scoped-material-components/mwc-card';
import { CircularProgress } from 'scoped-material-components/mwc-circular-progress';
import { List } from 'scoped-material-components/mwc-list';
import { ListItem } from 'scoped-material-components/mwc-list-item';
import { COMPOSITORY_DNA_HASH } from '../constants';
import { router } from '../router';
import { sharedStyles } from './sharedStyles';

export class CompositoryInstalledCells extends membraneContext(
  Scoped(LitElement) as Constructor<LitElement>
) {
  @property({ type: Array })
  _installedCellIds!: Array<CellId>;

  _dnaTemplateNames: Dictionary<string> = {};

  firstUpdated() {
    this.loadCellsIds();
  }

  get _compositoryService(): CompositoryService {
    return new CompositoryService(
      this.membraneContext.appWebsocket as AppWebsocket,
      this.membraneContext.cellId as CellId
    );
  }

  async loadCellsIds() {
    const cellIds = await (this.membraneContext
      .adminWebsocket as AdminWebsocket).listCellIds();

    const instantiatedDnaHashes = cellIds
      .map(cellId => serializeHash(cellId[0]))
      .filter(hash => hash !== COMPOSITORY_DNA_HASH);

    this._dnaTemplateNames = await this.fetchDnaTemplateNames(
      instantiatedDnaHashes
    );

    this._installedCellIds = cellIds;
  }

  async fetchDnaTemplateNames(
    instantiatedDnaHashes: string[]
  ): Promise<Dictionary<string>> {
    const promises = instantiatedDnaHashes.map(hash =>
      this._compositoryService.getTemplateForDna(hash)
    );

    const templates = await Promise.all(promises);
    const names: Dictionary<string> = {};
    for (let i = 0; i < templates.length; i++) {
      names[instantiatedDnaHashes[i]] = templates[i].dnaTemplate.name;
    }
    return names;
  }

  getNonCompositoryCellIds() {
    return this._installedCellIds.filter(
      cellId => serializeHash(cellId[0]) !== COMPOSITORY_DNA_HASH
    );
  }

  render() {
    if (!this._installedCellIds)
      return html`<div class="fill center-content">
        <mwc-circular-progress indeterminate></mwc-circular-progress>
      </div>`;

    return html` <mwc-card class="fill">
      <div style="margin: 16px;" class="column fill">
        <span class="title">Installed DNAs</span>
        ${this.getNonCompositoryCellIds().length === 0
          ? html`
              <div class="fill center-content">
                <div style="margin: 32px; text-align: center;" class="column">
                  <span style="margin-bottom: 16px;" class="placeholder"
                    >You don't have any generated DNAs installed yet.</span
                  >
                  <span class="placeholder"
                    >Discover one of the DNAs available below, or compose some zomes to
                    generate one yourself!</span
                  >
                </div>
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

  static get styles() {
    return sharedStyles;
  }

  static get scopedElements() {
    return {
      'mwc-list': List,
      'mwc-list-item': ListItem,
      'mwc-card': Card,
      'mwc-circular-progress': CircularProgress,
    };
  }
}
