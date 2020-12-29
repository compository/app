import { Constructor, LitElement } from 'lit-element';
import { MembraneContextProvider } from '@holochain-open-dev/membrane-context';
import { CellId } from '@holochain/conductor-api';
import { BlockyBlockBoard } from '@compository/blocky';
import { TopAppBar } from 'scoped-material-components/mwc-top-app-bar';
import { IconButton } from 'scoped-material-components/mwc-icon-button';
import { HodCreateProfileForm } from '@holochain-open-dev/profiles';
declare const CompositoryDisplayDna_base: Constructor<LitElement> & Constructor<{
    membraneContext: import("@holochain-open-dev/membrane-context").MembraneContext;
}>;
export declare class CompositoryDisplayDna extends CompositoryDisplayDna_base {
    cellIdToDisplay: CellId;
    compositoryCellId: CellId;
    _profilesZomeExistsInDna: boolean;
    _profileAlreadyCreated: boolean;
    get board(): BlockyBlockBoard;
    static get styles(): import("lit-element").CSSResult[];
    firstUpdated(): Promise<void>;
    render(): import("lit-element").TemplateResult;
    static get scopedElements(): {
        'membrane-context-provider': typeof MembraneContextProvider;
        'blocky-block-board': typeof BlockyBlockBoard;
        'mwc-top-app-bar': typeof TopAppBar;
        'mwc-icon-button': typeof IconButton;
        'hod-create-profile-form': typeof HodCreateProfileForm;
    };
}
export {};
