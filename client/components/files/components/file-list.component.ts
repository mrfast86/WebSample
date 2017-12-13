import { Component, OnInit } from "@angular/core";
import { ROUTER_DIRECTIVES } from '@angular/router';
import { Router, ActivatedRoute } from '@angular/router';
import {Http, Response} from '@angular/http';
import {TranslateService, TranslatePipe} from 'ng2-translate/ng2-translate';
import {ProjectsService} from "../../../services/projects.service";
import {Audit} from "../../../services/models/audit";
import {LoginState} from "../../../services/models/loginState";
import {LoginStateStore} from "../../../services/loginStateStore";
import {UploadedFile} from "../../../services/models/uploadedFile";
import {Config} from "../../../config";
import {DomSanitizationService} from '@angular/platform-browser';
import {ClipboardDirective} from 'angular2-clipboard';

@Component({
    directives: [ROUTER_DIRECTIVES, ClipboardDirective],
    styles: ['a { cursor:pointer;}'],
    selector: "router-outlet",
    template: `
        <div class="page-header">
            <h1>{{ 'FILE_LIST' | translate }}</h1>
        </div>
        
    <div class="table-responsive">
        <table class="table table-bordred table-striped">
    <thead>
    <tr>
        <th >{{ 'DOWNLOAD' | translate }}</th>
        <th>{{ 'FILE.BUILD_DATETIME' | translate }}</th>
        <th>{{ 'FILE.VERSION' | translate }}</th>
        <th>{{ 'FILE.PLATFORM' | translate }}</th>
        <th>{{ 'FILE.SERVICE_TYPE' | translate }}</th>
        <th>{{ 'FILE.COMMENTS' | translate }}</th>
        <th>{{ 'FILE.PERMALINK' | translate }}</th>
        <th>{{ 'FILE.ALIAS' | translate }}</th>
        <th *ngIf="(groupLevel|async)==3 || (groupLevel|async)==4">{{ 'EDIT' | translate }}</th>
        <th *ngIf="(groupLevel|async)==3 || (groupLevel|async)==4">{{ 'DELETE' | translate }}</th>
    </tr>
    </thead>
    <tbody>
    <tr *ngIf="loading">
        <td colspan="5">Loading...</td>
    </tr>
    <tr  *ngFor="let file of files">
        <td>            
             <a *ngIf="file.platform=='AOS'" (click)="download(file.id, file.permalink)"><span class="glyphicon glyphicon-download-alt"></span></a>
             <a *ngIf="file.platform=='IOS'" [attr.href]="itmsUrl(file.permalink)"><span class="glyphicon glyphicon-download-alt"></span></a>
        </td>
        <td>{{file.build_datetime | date:"medium"}}</td>
        <td>{{file.version}}</td>
        <td>{{file.platform}}</td>
        <td>{{file.service_type}}</td>
        <td>{{file.comment}}</td>
        <td>
              <button class="btn btn-default" type="button" ngIIclipboard [cbContent]="[downloadUrl(file.permalink)]">Copy</button>
        </td>
        <td>
              <button class="btn btn-default" type="button" ngIIclipboard [cbContent]="[downloadUrl(file.alias)]">Copy</button>
        </td>
        <td *ngIf="(groupLevel|async)==3 || (groupLevel|async)==4">
                 <button class="btn btn-primary btn-xs" style="height:25px;" data-title="Edit" data-toggle="modal" data-target="#edit" [routerLink]="['/projects', projectId, '/files', file.id]" >
                     <span class="glyphicon glyphicon-pencil"></span>
                 </button>
         </td>
         
        <td *ngIf="(groupLevel|async)==3 || (groupLevel|async)==4">
                 <button class="btn btn-danger btn-xs" style="height:25px;" data-title="Delete" data-toggle="modal" data-target="#delete" (click)="deleteModel(file)">
                     <span class="glyphicon glyphicon-trash"></span>
                 </button>
         </td>
    <tr *ngIf="!loading && files.length==0">
        <td colspan="5">{{ 'NO_FILE' | translate }}</td>
    </tr>
    </tbody>
</table>
</div>
    `,
    pipes: [TranslatePipe]
})

export class FilesComponent implements OnInit {

    private files: UploadedFile[] = []
    audit: Audit;
    projectId: Number;
    private loading: boolean = true;

    itmsUrl(permalink) {
        return this.sanitizer.bypassSecurityTrustUrl("itms-services://?action=download-manifest&url=" + this.config.downloadBaseUrl + permalink + ".plist");
    }

    downloadUrl(permalink) {
        return this.config.downloadBaseUrl + permalink;
    }

    get groupLevel(){
          return this.loginStateStore.loginState.map((loginState: LoginState) => loginState.groupLevel);
    }

    constructor(private config: Config, protected http: Http, private loginStateStore: LoginStateStore, private projectsService: ProjectsService, private route: ActivatedRoute, private router: Router, public translateService: TranslateService, private sanitizer:DomSanitizationService) {
        this.route.params.subscribe(params => {
            this.projectId = params['id'];
        });
    }

    ngOnInit():any {
        // If no projects are loaded, reload them into session (due to page refresh, need to reconstruct singleton implementation of projectService)
        if(this.projectsService.loadedProjects == null)
        {
            var self = this;
            this.projectsService.getProjects(function(err, data) {
                self.loadProjectFiles();
            });
        }
        else
        {
            this.loadProjectFiles();
        }
    }

    loadProjectFiles() {
        var projectFilter = this.projectsService.searchInLoadedProjects(this.projectId);
        var project;
        if (projectFilter.length > 0) {
            project = projectFilter[0];
        }

        // URL security - when project is null due to authentication issues or not set to public, navigate to 404.  Progress to page normally otherwise
        if ((project != null && project.is_public) || this.loginStateStore.isAdmin) {
            this.projectsService.getProjectFiles(this.projectId)
                .subscribe(
                    data =>
                    {
                        this.files = data,
                            this.loading = false;
                    },
                    error => alert(error)
                );
        }
        else {
            this.router.navigate(['404']);
        }
    }

    /**
     * Handle errors
     * @param response
     */
    handleError(response: Response) {
        if (response.status === 500) {
            let errors : Object = response.json();
        }
    }

    download(fileId: number, permalink: string, type: string){
        var downloadWindow = window.open(this.config.downloadBaseUrl + permalink);
    }

    deleteModel(file: UploadedFile) {
        this.translateService.get('FILE.DELETE').subscribe((res:string) => {
            if (confirm(res)) {
                var self = this;
                this.projectsService.deleteFile(this.projectId, file.id, function (status, response) {
                    if (status === 204) {
                        self.files.forEach((p:UploadedFile, i:number) => {
                            if (p.id === file.id) {
                                self.files.splice(i, 1);
                            }
                        });
                    }

                    if (status == 200) {
                        self.loadProjectFiles();
                    }

               });
            }
        })
    }
}
