import { Constructor, LitElement } from 'lit-element';
import { CompositoryComposeZomes } from './compository-compose-zomes';
import { AppWebsocket, AdminWebsocket, CellId } from '@holochain/conductor-api';
import { Card } from 'scoped-material-components/mwc-card';
import { MembraneContextProvider } from '@holochain-open-dev/membrane-context';
import { BlockyDnaBoard } from '@compository/blocky';
import { CircularProgress } from 'scoped-material-components/mwc-circular-progress';
import { CompositoryInstallDnaDialog, CompositoryService } from '@compository/lib';
import { CompositoryInstalledCells } from './compository-installed-cells';
import { TopAppBar } from 'scoped-material-components/mwc-top-app-bar';
import { Button } from 'scoped-material-components/mwc-button';
import { DiscoverDnas } from './compository-discover-dnas';
declare const CompositoryApp_base: Constructor<LitElement>;
export declare class CompositoryApp extends CompositoryApp_base {
    _selectedCellId: CellId | undefined;
    _holochainPresent: boolean;
    _loading: boolean;
    _contextProvider: MembraneContextProvider;
    _installDnaDialog: CompositoryInstallDnaDialog;
    _nonexistingDna: string | undefined;
    _appWebsocket: AppWebsocket;
    _adminWebsocket: AdminWebsocket;
    _compositoryCellId: CellId;
    firstUpdated(): Promise<void>;
    connectToHolochain(): Promise<void>;
    get _compositoryService(): CompositoryService;
    onCellInstalled(e: CustomEvent): void;
    renderNonexistingDna(): import("lit-element").TemplateResult;
    renderHolochainNotPresent(): import("lit-element").TemplateResult;
    renderContent(): import("lit-element").TemplateResult;
    render(): import("lit-element").TemplateResult;
    static get scopedElements(): {
        'membrane-context-provider': typeof MembraneContextProvider;
        'compository-compose-zomes': typeof CompositoryComposeZomes;
        'blocky-dna-board': typeof BlockyDnaBoard;
        'compository-install-dna-dialog': typeof CompositoryInstallDnaDialog;
        'compository-installed-cells': typeof CompositoryInstalledCells;
        'mwc-circular-progress': typeof CircularProgress;
        'mwc-top-app-bar': typeof TopAppBar;
        'mwc-button': typeof Button;
        'mwc-card': typeof Card;
        'compository-discover-dnas': typeof DiscoverDnas;
    };
    static get styles(): import("lit-element").CSSResult[];
}
export {};
