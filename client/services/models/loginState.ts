
export class LoginState {
    public loggedIn: boolean;
    public userName:string;
    public groupLevel:number;
    public pvid:string;
}

export const initialLoginState = {
    loggedIn: false,
    userName: 'Login',
    groupLevel:1,
    pvid:'0'
};