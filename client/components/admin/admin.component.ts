import { Component, OnInit } from "@angular/core";
import { ROUTER_DIRECTIVES } from '@angular/router';
import {Projects} from "../../services/models/projects";
import {LoginStateStore} from "../../services/loginStateStore";
import {ProjectsService} from "../../services/projects.service";
import {TranslateService, TranslatePipe} from "ng2-translate/ng2-translate";
import {Router} from '@angular/router';

@Component({
    selector: 'admin',
    template: `
        <div class="page-header">
            <h1>{{ 'ADMIN' | translate }}</h1>
        </div>
        
        <button type="submit" class="btn btn-primary" [routerLink]="['/projects/create']">{{ 'NEW_PROJECT' | translate }}</button>
        <br/>
        <br/>
        <div class="table-responsive">
        <table class="table table-bordred table-striped">
            <thead>
            <tr>
                <th>{{ 'PROJECT.NAME' | translate }}</th>
                <th>{{ 'PROJECT.CODE' | translate }}</th>
                <th>{{ 'PROJECT.FILE_COUNT' | translate }}</th>
                <th>{{ 'PROJECT.PUBLIC' | translate }}</th>
                <th>{{ 'EDIT' | translate }}</th>
                <th>{{ 'DELETE' | translate }}</th>
            </tr>
            </thead>
            <tbody>
            <tr *ngIf="loading">
                <td colspan="5">Loading...</td>
            </tr>
            <tr  *ngFor="let project of projects">
                <td>{{project.project_name}}</td>
                <td>{{project.project_code}}</td>
                <td>{{project.file_count}}</td>
                <td>{{project.is_public? "Yes":"No" }}</td>
                <td>
                        <button class="btn btn-primary btn-xs" style="height:25px;" data-title="Edit" data-toggle="modal" data-target="#edit" [routerLink]="['/projects', project.id]" >
                            <span class="glyphicon glyphicon-pencil"></span>
                        </button>
                </td>
                <td>
                        <button class="btn btn-danger btn-xs" style="height:25px;" data-title="Delete" data-toggle="modal" data-target="#delete" (click)="deleteModel(project)">
                            <span class="glyphicon glyphicon-trash"></span>
                        </button>
                </td>
            </tr>
            <tr *ngIf="!loading && projects.length==0">
                <td colspan="5">{{ 'NO_PROJECT' | translate }}</td>
            </tr>
            </tbody>
        </table>
</div>
    `,
    directives: [ROUTER_DIRECTIVES],
    pipes: [TranslatePipe]
})
export class AdminComponent implements OnInit {
    private loading: boolean = true;
    private projects: Projects[] = [];

    ngOnInit() {
        if (!this.loginStateStore.isAdmin)
            this.router.navigate(['404']);
        else
            this.getProjects();
    }

    constructor(private loginStateStore: LoginStateStore, private projectsService: ProjectsService, protected router: Router, public translateService: TranslateService) {}

    getProjects() {
        var self = this;
        this.projectsService.getProjects(function(err, data) {
            if(err) {
                alert(err);
            }
            else {
                self.projects = data;
                self.loading = false;
            }
        });
    }

    deleteModel(project: Projects) {
        this.translateService.get('PROJECT.DELETE').subscribe((res:string) => {
            if (confirm(res)) {
                var self = this;
                this.projectsService.deleteProject(project, function (status, response) {
                    if (status === 204) {
                        this.projects.forEach((p:Projects, i:number) => {
                            if (p.id === project.id) {
                                self.projects.splice(i, 1);
                            }
                        });
                    }

                    if (status == 200) {
                        self.getProjects();
                    }
                });
            }
        })
    }
}