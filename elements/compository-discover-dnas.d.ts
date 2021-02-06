import { LitElement, Constructor } from 'lit-element';
import { CompositoryInstallDnaDialog, CompositoryService, Dictionary, GetTemplateForDnaOutput } from '@compository/lib';
import { Card } from 'scoped-material-components/mwc-card';
import { List } from 'scoped-material-components/mwc-list';
import { ListItem } from 'scoped-material-components/mwc-list-item';
import { CircularProgress } from 'scoped-material-components/mwc-circular-progress';
import { Button } from 'scoped-material-components/mwc-button';
declare const DiscoverDnas_base: Constructor<LitElement> & Constructor<{
    membraneContext: import("@holochain-open-dev/membrane-context").MembraneContext;
}>;
export declare class DiscoverDnas extends DiscoverDnas_base {
    _loading: boolean;
    _allInstantiatedDnasHashes: Array<string> | undefined;
    _dnaTemplates: Dictionary<GetTemplateForDnaOutput>;
    get _compositoryService(): CompositoryService;
    firstUpdated(): Promise<void>;
    displayInstallDna(dnaHash: string, retriesLeft?: number): Promise<void>;
    renderContent(): import("lit-element").TemplateResult;
    render(): import("lit-element").TemplateResult;
    static get styles(): import("lit-element").CSSResult[];
    static get scopedElements(): {
        'mwc-card': typeof Card;
        'mwc-button': typeof Button;
        'mwc-list': typeof List;
        'mwc-circular-progress': typeof CircularProgress;
        'mwc-list-item': typeof ListItem;
        'compository-install-dna-dialog': typeof CompositoryInstallDnaDialog;
    };
}
export {};
