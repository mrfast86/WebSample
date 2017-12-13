import {Injectable} from "@angular/core";

@Injectable()
export class Config {
    public callback="http://localhost:3000/api/login";
    public downloadBaseUrl="http://localhost:3000/api/download/";
}