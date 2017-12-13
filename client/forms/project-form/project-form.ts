import {Component, Input} from '@angular/core';
import {Http, Response} from '@angular/http';
import {Headers} from '@angular/http';
import {Router} from '@angular/router';
import {ControlGroup, FormBuilder, Validators, NgClass, Control} from '@angular/common';
import {ControlGroupHelper} from '../ControlGroupHelper';
import {FieldErrors} from '../../pipes/FieldErrors';
import {Projects} from "../../services/models/projects";
import {TranslatePipe} from "ng2-translate/ng2-translate";
import {Observable} from "rxjs/Observable";


@Component({
  selector: 'project-form',
  templateUrl: 'client/forms/project-form/project-form.html',
  styleUrls: ['client/forms/project-form/project-form.css'],
  pipes: [FieldErrors, TranslatePipe],
  directives: [NgClass]
})
export class ProjectFormComponent {

  project: Projects = new Projects();
  projectForm: ControlGroup;

  constructor(protected http: Http, protected router: Router, builder:FormBuilder) {
    this.projectForm = builder.group({
      project_name: ['', Validators.required ],
      project_code: ['', Validators.required ],
      is_public: [false, Validators.required]
    });
  }


  /**
   * Handle errors
   * @param response
   */
  handleError(response: Response) {
    if (response.status === 500) {
      let errors : Object = response.json();
      for (var field in errors) {
        var fieldErrors: string[] = (<any>errors)[field];
        ControlGroupHelper.setControlErrors(this.projectForm, field, fieldErrors);
      }
    }
  }

  @Input()
  set model (project: Projects) {
    if (project) {
      this.project = project;
      ControlGroupHelper.updateControls(this.projectForm, this.project);
    }
  }

  onSubmit() {
    if (!this.projectForm.valid) {
      return ;
    }

    this.project.attributes = this.projectForm.value;
    var headers = new Headers({ 'Content-Type': 'application/json' });

    if (this.project.id) {
      this.http.put('/api/projects/' + this.project.id, JSON.stringify({project: this.project}), { headers: headers})
        .map(res => res.json())
          .catch((error: any) => {
            alert(error._body);
            return Observable.throw(new Error(error.status));
          })
        .subscribe(
          (data) => {
            this.router.navigate(['admin']);
          },
          (response: Response) => {
            this.handleError(response);
          }
        );
    } else {
      this.http.post('/api/projects', JSON.stringify({project: this.project}), {headers : headers})
        .map(res => res.json())
          .catch((error: any) => {
            alert(error._body);
            return Observable.throw(new Error(error.status));
          })
        .subscribe(
          (data) => {
            this.project.id = data.id;
            this.router.navigate(['admin']);
          },
          (response: Response) => {
            this.handleError(response);
          }
        );
    }
  }

}
