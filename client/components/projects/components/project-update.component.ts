import { Component, OnInit } from "@angular/core";
import { Router, ActivatedRoute } from '@angular/router';
import {Http} from '@angular/http';
import {Projects} from "../../../services/models/projects";
import {ProjectFormComponent} from "../../../forms/project-form/project-form";
import {TranslatePipe } from 'ng2-translate/ng2-translate';
import {LoginStateStore} from "../../../services/loginStateStore";

@Component({
    directives: [ProjectFormComponent],
    selector: "router-outlet",
    template: `
        <div class="page-header">
            <h1>{{ 'UPDATE_PROJECT' | translate }}</h1>
        </div>
    
        <project-form [model]="project"></project-form>
`,
    pipes: [TranslatePipe]
})
export class ProjectUpdateComponent {

    project: Projects;
    id: Number;

    constructor(private router: Router, private route: ActivatedRoute, private http: Http, private loginStateStore: LoginStateStore) {
        this.route.params.subscribe(params => {
            this.id = +params['id'];
        });
    }

    ngOnInit() {
        if (!this.loginStateStore.isAdmin)
            this.router.navigate(['404']);
        else {
            this.http.get("api/projects/" + this.id)
                .map(res => res.json())
                .subscribe(
                    (data) => {
                        this.project = new Projects(data);
                    }
                );
        }
    }
}
