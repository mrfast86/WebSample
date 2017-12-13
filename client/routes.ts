import { provideRouter, RouterConfig } from '@angular/router';
import { LocationStrategy, HashLocationStrategy } from "@angular/common";

import { ProjectsComponent } from './components/projects/components/projects.component';
import { AdminComponent } from './components/admin/admin.component';
import {ProjectUpdateComponent} from "./components/projects/components/project-update.component";
import {FilesComponent} from "./components/files/components/file-list.component";
import {ProjectCreateComponent} from "./components/projects/components/project-create.component";
import {FileUploadComponent} from "./components/files/components/file-upload.component";
import {FileUpdateComponent} from "./components/files/components/file-update.component";
import {ProjectsHomeComponent} from "./components/projects/components/project-home.component";
import {NotFoundComponent} from "./components/notfound.component";

const routes: RouterConfig = [
    { path: '', redirectTo: 'projects', pathMatch: 'full' },
    { path: 'admin', component: AdminComponent },
    { path: 'projects', component: ProjectsComponent ,
        children: [
            { path: '', component: ProjectsHomeComponent },
            { path: 'create', component: ProjectCreateComponent },
            { path: ':id', component: ProjectUpdateComponent },
            { path: ':id/files', component: FilesComponent },
            { path: ':id/files/:fileId', component: FileUpdateComponent }
        ]
    },
    { path: 'upload', component: FileUploadComponent },
    { path: '404', component: NotFoundComponent},
    { path: '**', redirectTo: '404'}
];

export const APP_ROUTER_PROVIDERS = [
    provideRouter(routes),
    { provide: LocationStrategy, useClass: HashLocationStrategy }
];
