import {Injectable} from "@angular/core";
import {Http,Headers} from "@angular/http";
import 'rxjs/add/operator/map';
import {Projects} from "./models/projects";
import {BehaviorSubject} from "rxjs/Rx";
import {Observable} from "rxjs/Observable";
import 'aws-sdk';
import {UploadedFile} from "./models/uploadedFile";
import {FileObject} from "./fileUploader/file-object";
declare const AWS;

@Injectable()
export class ProjectsService {

    public loadedProjects: Projects[];
    private fileObject: FileObject;

    private _progress: BehaviorSubject<Number> = new BehaviorSubject(0);
    private _started: BehaviorSubject<Boolean> = new BehaviorSubject(false);
    private _completed: BehaviorSubject<Boolean> = new BehaviorSubject(false);
    private _uploadedFile: BehaviorSubject<UploadedFile> = new BehaviorSubject(new UploadedFile());

    get progress() {
        return new Observable(fn => this._progress.subscribe(fn));
    }

    get started() {
        return new Observable(fn => this._started.subscribe(fn));
    }

    get completed() {
        return new Observable(fn => this._completed.subscribe(fn));
    }

    get uploadedFile() {
        return new Observable(fn => this._uploadedFile.subscribe(fn));
    }

    public fileName: string;

    get nameDisplay() {
        if(!this.fileName) {
            return "or drop file here..";
        }
        else {
            return this.fileName;
        }
    }
    
    constructor (private _http: Http) {}

    getProjects(callback) {
        var observable = this._http.get("api/projects");
        observable.subscribe(
            (data) => {
                this.loadedProjects = data.json();
                callback(null, data.json());
            },
            (error) => {
                callback(error);
            });
    }

    getProject(id): any {
        return this._http.get("api/projects/" + id)
            .catch((error: any) => {
                alert(error._body);
                return Observable.throw(new Error(error.status));
            })
            .map(res => res.json());
    }

    // Get all project files
    getProjectFiles(projectId){
        return this._http.get("api/projects/"+projectId+"/files")
            .catch((error: any) => {
                alert(error._body);
                return Observable.throw(new Error(error.status));
            })
            .map(res => res.json())
    }

    searchInLoadedProjects(projectId): any {
        return this.loadedProjects.filter(function (obj) {
            return (obj.id == projectId);
        })
    }

    searchInLoadedProjectsByName(project_name): any {
        return this.loadedProjects.filter(function (obj) {
            return (obj.project_name == project_name);
        })
    }

    // Delete project. Soft delete
    deleteProject(project: Projects, callback) {
        return this._http.delete('api/projects/' + project.id)
            .catch((error: any) => {
                alert(error._body);
                return Observable.throw(new Error(error.status));
            })
            .subscribe((response) => {
                callback(response.status, response.json());
            });
    }

    // Delete file. Soft delete
    deleteFile(projectId, fileId, callback) {
        return this._http.delete('api/projects/' + projectId + '/files/' + fileId)
            .catch((error: any) => {
                alert(error._body);
                return Observable.throw(new Error(error.status));
            })
            .subscribe((response) => {
                callback(response.status, response.json());
            });
    }

    // Populate file info from uploaded file
    public setFileToUpload(file:File):void {
        
        this.fileObject = new FileObject(file);
        if(!this.fileObject.valid)
        {
            alert("This file is not supported")
            return;
        }
        this._uploadedFile.next(this.fileObject.getUploadedFile());
        this.fileName = this.fileObject.name;
    }

    // Upload file to S3 server
    public uploadToS3(callback) {
        var url = '/api/aws?fileName=' + encodeURI(this.fileObject.name);
        this._http.get(url)
            .catch((error: any) => {
                alert(error._body);
                return Observable.throw(new Error(error.status));
            })
            .subscribe((response) => {
                var s3Url = response.json();
                this.xhrTransport(s3Url.url, this.fileObject, callback);
            });
    }

    // Save uploaded file details to backend.
    public saveFileDetails(file, callback)
    {
        var headers = new Headers({ 'Content-Type': 'application/json' });
        this._http.post('/api/files', JSON.stringify({file: file}), {headers : headers})
            .catch((error: any) => {
                alert(error._body);
                return Observable.throw(new Error(error.status));
            })
            .subscribe((response) => {
                callback(response.status, response.json());
            });
    }

    public clear() {
        this._progress = new BehaviorSubject(0);
        this._completed = new BehaviorSubject(false);
        this._uploadedFile = new BehaviorSubject(new UploadedFile());
        this.fileName = undefined;
    }

    protected xhrTransport(url, item:FileObject, callback):any {
        let xhr = new XMLHttpRequest();

        xhr.upload.onprogress = (event:any) => {
            let progress = Math.round(event.lengthComputable ? event.loaded * 100 / event.total : 0);
            this._progress.next(progress);
        };
        xhr.onload = () => {
            if(xhr.status == 200) {
                this._completed.next(true);
                this._progress.next(100);
                callback();
            }
            else {
                this._started.next(false);
                alert("file upload failed");
            }
        };
        xhr.onerror = () => {
            alert("file upload failed");
        };

        xhr.open("PUT", url, true);
        xhr.send(item.file);
        this._started.next(true);
    }

}