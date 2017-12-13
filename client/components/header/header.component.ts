import { Component, OnInit } from "@angular/core";
import { ROUTER_DIRECTIVES } from '@angular/router';
import {Router} from '@angular/router';
import { DROPDOWN_DIRECTIVES } from "ng2-dropdown";
import {LoginState} from "../../services/models/loginState";
import {LoginStateStore} from "../../services/loginStateStore";
import {TranslateService, TranslatePipe} from "ng2-translate/ng2-translate";
import {Config} from "../../config";

@Component({
    selector: 'header-outlet',
    template: `
        <nav class="navbar navbar-default navbar-fixed-top">
        <div class="container">
        <div class="navbar-header">
          <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#navbar" aria-expanded="false" aria-controls="navbar">
            <span class="sr-only">Toggle navigation</span>
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>
            <span class="icon-bar"></span>
          </button>
          <a class="navbar-brand" [routerLinkActiveOptions]="{ exact: true }" [routerLinkActive]="['active']" [routerLink]="['projects']" >{{ 'HOME' | translate }}</a>
        </div>
        <div id="navbar" class="navbar-collapse collapse">
        <ul class="nav navbar-nav">
            <li *ngIf="(groupLevel|async)==='4'" [routerLinkActiveOptions]="{ exact: true }" [routerLinkActive]="['active']"><a href="#admin" [routerLink]="['admin']" >{{ 'ADMIN' | translate }}</a></li>
        </ul>
        <ul class="nav navbar-nav navbar-right">
            <li dropdown>
                    <a style="cursor: pointer;" dropdown-open><span class="fa fa-language"></span>  {{langSelected}}</a>
                    <ul class="dropdown-menu">
                        <li><a (click)="updateLanguage('en')">en</a></li>
                        <li><a (click)="updateLanguage('kr')">kr</a></li>
                    </ul>
            </li>
            <li *ngIf="(loggedIn|async)===false"><a style="cursor: pointer;" (click)="registerAction()"><span class="glyphicon glyphicon-user"></span>  {{ 'SIGN_UP' | translate }}</a></li>
            <li *ngIf="(loggedIn|async)===false"><a style="cursor: pointer;" (click)="loginAction()"><span class="glyphicon glyphicon-log-in"></span>  {{ 'LOGIN' | translate }} </a></li>
            <li *ngIf="(loggedIn|async)===true"><a style="cursor: pointer;" (click)="logoutAction()"><span class="glyphicon glyphicon-log-in"></span>  {{ userName | async }}</a></li>
        </ul>
    </div>
    </div>
    </nav>
    `,
    directives: [ROUTER_DIRECTIVES, DROPDOWN_DIRECTIVES],
    pipes: [TranslatePipe]
})
export class HeaderComponent implements OnInit {

    private langSelected;

    get loggedIn() {
        return this.loginStateStore.loginState.map((loginState: LoginState) => loginState.loggedIn);
    }

    get userName() {
        return this.loginStateStore.loginState.map((loginState: LoginState) => loginState.userName);
    }

    get groupLevel(){
        return this.loginStateStore.loginState.map((loginState: LoginState) => loginState.groupLevel);
    }

    ngOnInit():any {
        this.loginStateStore.refreshLoginState();

        var userLang = navigator.language.split('-')[0];
        userLang = /(kr|en)/gi.test(userLang) ? userLang : 'en';
        this.updateLanguage(userLang);
    }
    
    constructor(private config: Config, private loginStateStore: LoginStateStore, public translateService: TranslateService, public router: Router) {}

    loginAction() {
        var callback = this.config.callback;
        window.location.href='https://join-test.vshower.com/?callback_url=' + callback;
    }

    registerAction() {
        var callback = this.config.callback;
        window.location.href='https://join-test.vshower.com/register_v2?callback_url=' + callback;
    }

    logoutAction() {
        this.loginStateStore.logoutAction();
        this.router.navigate(['projects']);
    }

    updateLanguage(lang) {
        this.langSelected = lang;
        this.translateService.use(lang);
    }
}