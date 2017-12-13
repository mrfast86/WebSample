import { Component, OnInit } from "@angular/core";
import { Router, ActivatedRoute } from '@angular/router';
import {Http} from '@angular/http';
import { TranslateService, TranslatePipe } from 'ng2-translate/ng2-translate';
import {FileUpdateFormComponent} from "../../../forms/file-form/file-updateform";
import {UploadedFile} from "../../../services/models/uploadedFile";
import {LoginStateStore} from "../../../services/loginStateStore";

@Component({
    directives: [FileUpdateFormComponent],
    selector: "router-outlet",
    template: `
        <div class="page-header">
            <h1>{{ 'FILE.UPDATE' | translate }}</h1>
        </div>
        
        <file-updateform [model]="file" [projectId]="projectId"></file-updateform>
    `,
    pipes: [TranslatePipe]
})

export class FileUpdateComponent {

    public projectId: any;
    public fileId: any;
    file: UploadedFile;

    constructor(private router: Router,private route: ActivatedRoute, private http: Http, private loginStateStore: LoginStateStore) {
        this.route.params.subscribe(params => {
            this.projectId = params['id'];
            this.fileId=params['fileId'];
        });
    }

    ngOnInit() {
        if (!this.loginStateStore.isAdmin)
            this.router.navigate(['404']);
        else {
            this.http.get("api/files/" + this.fileId)
                .map(res => res.json())
                .subscribe(
                    (data) => {
                        this.file = new UploadedFile(data);
                    }
                );
        }
    }
}
