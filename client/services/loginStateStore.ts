
import {Injectable} from "@angular/core";
import {Http} from "@angular/http";
import {LoginState, initialLoginState} from "./models/loginState";
import {BehaviorSubject} from "rxjs/Rx";
import {Observable} from "rxjs/Observable";

@Injectable()
export class LoginStateStore {

    private _loginState: BehaviorSubject<LoginState> = new BehaviorSubject(initialLoginState);

    get loginState() {
        return new Observable(fn => this._loginState.subscribe(fn));
    }

    get isAdmin() {
        return this._loginState.getValue().groupLevel == 4;
    }

    get isVSMemberAndUp() {
        return this._loginState.getValue().groupLevel == 3 || this._loginState.getValue().groupLevel == 4;
    }

    constructor(private _http: Http) {}

    //Refresh login user status
    refreshLoginState() {
        return this._http.get("/api/login/status")
            .map(res => res.json())
            .catch((error: any) => {
                alert(error._body);
                return Observable.throw(new Error(error.status));
            })
            .subscribe((data) => {
                this._loginState.next(data)
            })
    }

    //Logout user
    logoutAction() {
        this._http.get("/api/logout")
            .map(res => res.json())
            .catch((error: any) => {
                alert(error._body);
                return Observable.throw(new Error(error.status));
            })
            .subscribe(
                (data) => {
                    this._loginState.next(data)
                }
            )
    }
}
