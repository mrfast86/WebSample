import {Component} from '@angular/core';
import {ProjectFormComponent} from "../../../forms/project-form/project-form";
import {TranslatePipe } from 'ng2-translate/ng2-translate';
import {LoginStateStore} from "../../../services/loginStateStore";
import {Router} from "@angular/router";

@Component({
    selector: "router-outlet",
    template: `
    <div class="page-header">
        <h1>{{ 'NEW_PROJECT' | translate }}</h1>
    </div>
    
    <project-form></project-form>
    `,
    directives: [ProjectFormComponent],
    pipes: [TranslatePipe]
})
export class ProjectCreateComponent {

    constructor(private router: Router, private loginStateStore: LoginStateStore) {
    }
    
    ngOnInit() {
        if (!this.loginStateStore.isAdmin)
            this.router.navigate(['404']);
    }
}
