import { Constructor, LitElement } from 'lit-element';
import { ZomeDef, CompositoryService, CompositoryInstallDnaDialog } from '@compository/lib';
import { List } from 'scoped-material-components/mwc-list';
import { Button } from 'scoped-material-components/mwc-button';
import { CheckListItem } from 'scoped-material-components/mwc-check-list-item';
import { Snackbar } from 'scoped-material-components/mwc-snackbar';
import { CircularProgress } from 'scoped-material-components/mwc-circular-progress';
import { TextField } from 'scoped-material-components/mwc-textfield';
import { Hashed } from '@holochain-open-dev/common';
import { Card } from 'scoped-material-components/mwc-card';
declare const CompositoryComposeZomes_base: Constructor<LitElement> & Constructor<{
    membraneContext: import("@holochain-open-dev/membrane-context").MembraneContext;
}>;
export declare class CompositoryComposeZomes extends CompositoryComposeZomes_base {
    zomeDefs: Array<Hashed<ZomeDef>>;
    _installDnaDialog: CompositoryInstallDnaDialog;
    _selectedIndexes: Set<number>;
    _templateName: string | undefined;
    static get styles(): import("lit-element").CSSResult[];
    get _compositoryService(): CompositoryService;
    firstUpdated(): void;
    loadZomes(): Promise<void>;
    createDnaTemplate(): Promise<void>;
    renderErrorSnackbar(): import("lit-element").TemplateResult;
    render(): import("lit-element").TemplateResult;
    static get scopedElements(): {
        'mwc-list': typeof List;
        'mwc-check-list-item': typeof CheckListItem;
        'mwc-circular-progress': typeof CircularProgress;
        'mwc-button': typeof Button;
        'mwc-textfield': typeof TextField;
        'compository-install-dna-dialog': typeof CompositoryInstallDnaDialog;
        'mwc-card': typeof Card;
        'mwc-snackbar': typeof Snackbar;
    };
}
export {};
