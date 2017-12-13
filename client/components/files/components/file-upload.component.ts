import { Component } from "@angular/core";
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateService, TranslatePipe } from 'ng2-translate/ng2-translate';
import {FileFormComponent} from "../../../forms/file-form/file-form";
import {ProjectsService} from "../../../services/projects.service";
import {LoginStateStore} from "../../../services/loginStateStore";

@Component({
    directives: [FileFormComponent],
    selector: "router-outlet",
    template: `
        <div class="page-header">
            <h1>{{ 'UPLOAD_FILE' | translate }}</h1>
        </div>
        
        <file-form [model]="projectId"></file-form>
    `,
    pipes: [TranslatePipe]
})

export class FileUploadComponent {

    public projectId: any;

    constructor(private route: ActivatedRoute, private projectsService: ProjectsService, private loginStateStore: LoginStateStore, private router: Router) {
    }

    ngOnInit ():any {
        // Security
        if (!this.loginStateStore.isVSMemberAndUp)
            this.router.navigate(['404']);
        // No longer needed after moving upload to project
        /*// If there is no loaded project in cache (on refresh)
        if(this.projectsService.loadedProjects == null)
        {
            var self = this;
            // Wait for load projects call back to finish, then check security
            this.projectsService.getProjects(function(err, data) {
                self.securityCheck();
            });
        }
        else
        {
            // If project already loaded, check security immediately
            this.securityCheck();
        }*/
    }

    /*securityCheck() {
        // Search by project id in already loaded projects
        var projectFilter = this.projectsService.searchInLoadedProjects(this.projectId);
        var project;
        if (projectFilter.length > 0) {
            project = projectFilter[0];
        }

        // If not VSMemeber and up, redirect
        if (!this.loginStateStore.isVSMemberAndUp) {
            this.router.navigate(['404']);
        }
    }*/
}
