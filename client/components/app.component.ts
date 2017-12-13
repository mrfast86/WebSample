import { Component } from "@angular/core";
import { HeaderComponent } from "./header/header.component";
import { ROUTER_DIRECTIVES } from '@angular/router';

@Component({
    directives: [ROUTER_DIRECTIVES,HeaderComponent],
    selector: "app",
    template: `<div class="ui container">
        <br/>
        <header-outlet></header-outlet>
        <router-outlet></router-outlet>
    </div>`
})
export class AppComponent {}
