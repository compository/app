import { CompositoryService, Dictionary } from '@compository/lib';
import { CellId } from '@holochain/conductor-api';
import { Constructor, LitElement } from 'lit-element';
import { Card } from 'scoped-material-components/mwc-card';
import { CircularProgress } from 'scoped-material-components/mwc-circular-progress';
import { List } from 'scoped-material-components/mwc-list';
import { ListItem } from 'scoped-material-components/mwc-list-item';
declare const CompositoryInstalledCells_base: Constructor<LitElement> & Constructor<{
    membraneContext: import("@holochain-open-dev/membrane-context").MembraneContext;
}>;
export declare class CompositoryInstalledCells extends CompositoryInstalledCells_base {
    _installedCellIds: Array<CellId>;
    _dnaTemplateNames: Dictionary<string>;
    firstUpdated(): void;
    get _compositoryService(): CompositoryService;
    loadCellsIds(): Promise<void>;
    fetchDnaTemplateNames(instantiatedDnaHashes: string[]): Promise<Dictionary<string>>;
    getNonCompositoryCellIds(): CellId[];
    render(): import("lit-element").TemplateResult;
    static get styles(): import("lit-element").CSSResult;
    static get scopedElements(): {
        'mwc-list': typeof List;
        'mwc-list-item': typeof ListItem;
        'mwc-card': typeof Card;
        'mwc-circular-progress': typeof CircularProgress;
    };
}
export {};
