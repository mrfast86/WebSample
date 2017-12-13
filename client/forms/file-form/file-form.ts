import {Component, Input, OnInit, ChangeDetectionStrategy, NgZone} from '@angular/core';
import {Http, Response} from '@angular/http';
import {Router} from '@angular/router';
import {ControlGroup, FormBuilder, Validators, NgClass, Control} from '@angular/common';
import {ControlGroupHelper} from '../ControlGroupHelper';
import {FieldErrors} from '../../pipes/FieldErrors';
import {TranslateService, TranslatePipe} from "ng2-translate/ng2-translate";
import {FileDropDirective} from '../../services/fileUploader/file-drop.directive';
import {UploadedFile} from "../../services/models/uploadedFile";
import {ProjectsService} from "../../services/projects.service";
import {Projects} from "../../services/models/projects";
import {Observable} from "rxjs/Observable";

@Component({
    selector: 'file-form',
    templateUrl: 'client/forms/file-form/file-form.html',
    styleUrls: ['client/forms/file-form/file-form.css'],
    pipes: [FieldErrors, TranslatePipe],
    directives: [FileDropDirective,NgClass],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FileFormComponent implements OnInit {

    private project: Projects;

    uploadedFile: UploadedFile;
    completed: Boolean = false;
    started: Boolean = false;
    progress: Observable<Number> = Observable.of(0);
    public hasBaseDropZoneOver:boolean = false;
    private fileForm: ControlGroup;

    constructor(private uploader: ProjectsService, private router: Router, private builder:FormBuilder, private ngZone:NgZone, private projectsService: ProjectsService, private translateService: TranslateService) { }

    ngOnInit() {
        // If there is no loaded project in cache (on refresh)
         if(this.projectsService.loadedProjects == null)
         {
             // Load projects for name checking before upload
             this.projectsService.getProjects(function(err, data) {});
         }

        this.uploader.clear();
        this.fileForm = this.builder.group({
            project_name: ['', Validators.required ],
            platform: ['', Validators.required ],
            version: ['', Validators.required ],
            service_type: ['', Validators.required ],
            build_datetime: ['', Validators.required ],
            comment: ['', Validators.required ],
            alias: [''],
            is_public: [false, Validators.required]
        });

        this.uploader.completed.subscribe((c:Boolean) => this.completed = c);
        this.uploader.started.subscribe((s:Boolean) => this.started = s);
        this.ngZone.run(() =>
        this.uploader.progress.subscribe((p:Number) => this.ngZone.run(() => this.progress = Observable.of(p))));
        this.uploader.uploadedFile.subscribe((f:UploadedFile) => {
            this.uploadedFile = f;
        });
    }

    handleError(response: Response) {
        if (response.status === 422) {
            let errors : Object = response.json();
            for (var field in errors) {
                var fieldErrors: string[] = (<any>errors)[field];
                ControlGroupHelper.setControlErrors(this.fileForm, field, fieldErrors);
            }
        }
    }

    public fileOverBase(e:any):void {
        this.hasBaseDropZoneOver = e;
    }

    public browsedFile(event) {
        var files = event.srcElement.files;
        this.uploader.setFileToUpload(files[0]);
    }

    onSubmit() {
        if (!this.fileForm.valid) {
          return ;
        }

        // Search in cache for projects by name
        var projectFilter = this.projectsService.searchInLoadedProjectsByName(this.fileForm.value.project_name);
        var project;
        if (projectFilter.length > 0) {
            project = projectFilter[0];
        }

        //Throw error if project name does not exist and abort.
        if (project == null)
        {
            this.translateService.get('ERROR.PROJECTNAMENULL').subscribe((res:string) => {
                alert(res);
            })
        }
        else
        {
            this.ngZone.run(() =>
            this.uploader.uploadedFile.subscribe((file:UploadedFile) => {
                file.attributes = this.fileForm.value;
                var self = this;
                this.uploader.uploadToS3(function () {
                    self.uploader.saveFileDetails(file, function (status, data) {
                        self.uploader.clear();
                        self.router.navigate(['/projects']);
                    });
                });
            }));
        }
    }

}
