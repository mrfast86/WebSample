import { Component, OnInit } from "@angular/core";
import { ROUTER_DIRECTIVES, Router } from '@angular/router';
import {Projects} from "../../../services/models/projects";
import {LoginState} from "../../../services/models/loginState";
import {LoginStateStore} from "../../../services/loginStateStore";
import {ProjectsService} from "../../../services/projects.service";
import {TranslatePipe} from "ng2-translate/ng2-translate";

@Component({
    selector: 'router-outlet',
    template: `
        <div class="page-header">
            <h1>{{ 'PROJECT_LIST' | translate }}</h1>
        </div>
        <style style="text/css">
            tbody tr:hover {
                background-color: #B7BFC2;
            }
            td:hover {
                cursor: pointer;
            }
        </style>
        
    <button *ngIf="(groupLevel|async)==3 || (groupLevel|async)==4" type="submit" class="btn btn-primary" [routerLink]="['/upload']">{{ 'UPLOAD_FILE' | translate }}</button>
    <br/>

    <div class="table-responsive">
        <table class="table">
            <thead>
            <tr>
                <th>{{ 'PROJECT.NAME' | translate }}</th>
                <th>{{ 'PROJECT.CODE' | translate }}</th>
            </tr>
            </thead>
            <tbody>
            <tr *ngIf="loading">
                <td colspan="5">Loading...</td>
            </tr>
            <tr *ngFor="let project of projects" class='clickable-row' [routerLink]="['/projects', project.id, '/files']" >
                <td>{{project.project_name}}</td>
                <td>{{project.project_code}}</td>
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
export class ProjectsHomeComponent implements OnInit {
    private loading: boolean = true;
    private projects: Projects[] = [];

    ngOnInit() {
        this.loginStateStore.loginState.subscribe((loginState: LoginState) => {
            this.getProjects();
        });
    }

    constructor(private loginStateStore: LoginStateStore, private projectsService: ProjectsService, private router: Router) { }

    get groupLevel(){
        return this.loginStateStore.loginState.map((loginState: LoginState) => loginState.groupLevel);
    }

    getProjects() {
        var self = this;
        this.projectsService.getProjects(function(err, data){
            if(err) {
                alert(err);
            }
            else {
                self.projects = data;
                self.loading = false;
            }
        });
    }
}