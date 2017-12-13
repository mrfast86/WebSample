/// <reference path="../typings/index.d.ts" />
import { bootstrap } from '@angular/platform-browser-dynamic';
import { enableProdMode } from "@angular/core";
import { HTTP_PROVIDERS } from "@angular/http";
import { TRANSLATE_PROVIDERS } from 'ng2-translate/ng2-translate';

enableProdMode();

import { AppComponent } from "./components/app.component";
import { APP_ROUTER_PROVIDERS } from "./routes";
import {LoginStateStore} from "./services/loginStateStore";
import {ProjectsService} from "./services/projects.service";
import {Config} from "./config";

bootstrap(AppComponent, [
    APP_ROUTER_PROVIDERS,
	HTTP_PROVIDERS,
	TRANSLATE_PROVIDERS,
    LoginStateStore,
    ProjectsService,
    Config
]);
