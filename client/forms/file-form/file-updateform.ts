import {Component, Input, OnInit} from '@angular/core';
import {Http, Response} from '@angular/http';
import {Headers} from '@angular/http';
import {Router} from '@angular/router';
import {ControlGroup, FormBuilder, Validators, NgClass, Control} from '@angular/common';
import {ControlGroupHelper} from '../ControlGroupHelper';
import {FieldErrors} from '../../pipes/FieldErrors';
import {TranslatePipe} from "ng2-translate/ng2-translate";
import {UploadedFile} from "../../services/models/uploadedFile";
import {ProjectsService} from "../../services/projects.service";
import {Projects} from "../../services/models/projects";
import {Observable} from "rxjs/Observable";


@Component({
    selector: 'file-updateform',
    templateUrl: 'client/forms/file-form/file-updateform.html',
    styleUrls: ['client/forms/file-form/file-form.css'],
    pipes: [FieldErrors, TranslatePipe],
    directives: [NgClass]
})
export class FileUpdateFormComponent implements OnInit {

    file: UploadedFile = new UploadedFile();
    fileForm: ControlGroup;

    constructor(protected http: Http, private router: Router, private builder:FormBuilder) { }

    ngOnInit() {
        this.fileForm = this.builder.group({
         project_name: ['', Validators.required ],
         platform: ['', Validators.required ],
         version: ['', Validators.required ],
         service_type: ['', Validators.required ],
         build_datetime: ['', Validators.required ],
         comment: ['', Validators.required ],
         alias: ['',],
         is_public: [false, Validators.required]
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

    @Input()
    set model (file: UploadedFile) {
        if (file) {
            this.file = file;
            this.file.build_datetime = this.toJSONLocal(new Date(this.file.build_datetime));
            ControlGroupHelper.updateControls(this.fileForm, this.file);
        }
    }

    toJSONLocal (date) {
        var local = new Date(date);
        local.setMinutes(date.getMinutes() - date.getTimezoneOffset());
        return local.toJSON().slice(0, 16);
    }

    private _projectId;

    @Input()
    set projectId(id: number){
        if(id)
        {
            this._projectId = id;
        }
    }

    onSubmit() {
        if (!this.fileForm.valid) {
            return ;
        }

        this.file.attributes = this.fileForm.value;
        var headers = new Headers({ 'Content-Type': 'application/json' });

        if (this.file.id) {
            this.http.put('/api/files/' + this.file.id, JSON.stringify({file: this.file}), { headers: headers})
                .map(res => res.json())
                .catch((error: any) => {
                    alert(error._body);
                    return Observable.throw(new Error(error.status));
                })
                .subscribe(
                    (data) => {
                        this.router.navigate(['/projects', this._projectId, '/files']);
                    },
                    (response: Response) => {
                        this.handleError(response);
                    }
                );
        }
    }

}
