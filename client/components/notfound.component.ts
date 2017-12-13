import { Component, OnInit } from "@angular/core";
import { ROUTER_DIRECTIVES } from '@angular/router';
import {TranslateService, TranslatePipe} from "ng2-translate/ng2-translate";

@Component({
    selector: 'notfound',
    template: `
    <br/>
        <div class="container">
            <div class="row">
                <div class="col-md-12">
                    <div class="error-template">
                        <h1>
                            {{ 'OOPS' | translate }}!</h1>
                        <h2>
                            404 {{ 'NOT_FOUND' | translate }}</h2>
                        <div class="error-details">
                            {{ 'SORRY_MESSAGE' | translate }}
                        </div>
                        <div class="error-actions">
                            <a [routerLink]="['/projects']" class="btn btn-primary btn-lg"><span class="glyphicon glyphicon-home"></span>
                                {{ 'TAKE_ME_HOME' | translate }} </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `,
    directives: [ROUTER_DIRECTIVES],
    pipes: [TranslatePipe]
})
export class NotFoundComponent implements OnInit {

    ngOnInit(){
    }

    constructor(public translateService: TranslateService) {}
}