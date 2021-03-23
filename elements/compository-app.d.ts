import { AppWebsocket, AdminWebsocket, CellId } from '@holochain/conductor-api';
import { BaseElement } from '@holochain-open-dev/common';
import { InstallDnaDialog, CompositoryService } from '@compository/lib';
export declare class CompositoryApp extends BaseElement {
    _selectedCellId: CellId | undefined;
    _holochainPresent: boolean;
    _loading: boolean;
    _installDnaDialog: InstallDnaDialog;
    _nonexistingDna: string | undefined;
    _activeView: 'home' | 'dna' | 'non-existing-dna' | 'publish-zome';
    _appWebsocket: AppWebsocket;
    _adminWebsocket: AdminWebsocket;
    _compositoryCellId: CellId;
    get _compositoryService(): CompositoryService;
    firstUpdated(): Promise<void>;
    connectToHolochain(): Promise<void>;
    onCellInstalled(e: CustomEvent): void;
    renderNonexistingDna(): import("lit-element").TemplateResult;
    renderHolochainNotPresent(): import("lit-element").TemplateResult;
    renderPublishZome(): import("lit-element").TemplateResult;
    render(): import("lit-element").TemplateResult;
    getScopedElements(): any;
    static get styles(): import("lit-element").CSSResult[];
}
