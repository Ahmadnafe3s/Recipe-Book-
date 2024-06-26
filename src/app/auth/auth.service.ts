import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, Subject, catchError, tap, throwError } from "rxjs";
import { user } from "./user.model";
import { Router } from "@angular/router";

export interface authResponseData {
    idToken: string,
    email: string,
    displayName: string
    refreshToken: string,
    expiresIn: string,
    localId: string,
    registered?: boolean
}

@Injectable({
    providedIn: ('root')
})

export class AuthService {

    Users = new BehaviorSubject<user>(null)

    constructor(private http: HttpClient, private route: Router) { }

    SignUp(fullName: string, email: string, password: string) {
        return this.http.post<authResponseData>('https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyBsDAZK0HwEmvOF7HUipCdh_LDbXSPIi1Y',
            {
                email: email,
                password: password,
                displayName: fullName,
                returnSecureToken: true
            }
        )
            .pipe(catchError(this.HandleError), tap(
                resData => {
                    this.UserData(resData.email, resData.localId, resData.displayName, resData.idToken, +resData.expiresIn)
                }
            ))
    }

    logIn(email: string, password: string) {
        return this.http.post<authResponseData>('https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyBsDAZK0HwEmvOF7HUipCdh_LDbXSPIi1Y',
            {
                email: email,
                password: password,
                returnSecureToken: true
            }
        ).pipe(catchError(this.HandleError), tap(
            resData => {
                this.UserData(resData.email, resData.localId, resData.displayName, resData.idToken, +resData.expiresIn)
            }
        ))

    }


    resetPassword(email: string) {
        return this.http.post('https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=AIzaSyBsDAZK0HwEmvOF7HUipCdh_LDbXSPIi1Y',
            {
                email: email,
                requestType: "PASSWORD_RESET"
            }).pipe(catchError(this.HandleError))
    }


    private UserData(email, id, displayName, token, expiration) {
        const expiresIn = new Date(new Date().getTime() + expiration * 1000);
        const User = new user(email, id, displayName, token, expiresIn);
        this.Users.next(User);
        this.autoLogout(expiration * 1000);

        localStorage.setItem('userData', JSON.stringify(User))
    }


    autoLogin() {
        //Type always should be as local storage
        const USERDATA: { email: string, id: string, displayName: string, _token: string, _tokenExpirationDate: string } = JSON.parse(localStorage.getItem('userData'));

        //if localstorage doesnt have data then always logout..
        if (!USERDATA) {
            return;
        }

        const loadedUser = new user(USERDATA.email, USERDATA.id, USERDATA.displayName, USERDATA._token, new Date(USERDATA._tokenExpirationDate))



        if (loadedUser.token) {
            const expirationDate = new Date(USERDATA._tokenExpirationDate).getTime() - new Date().getTime()
            this.autoLogout(expirationDate); // if token exipration has time then it will login as long as token gets expires.
            this.Users.next(loadedUser);
        }

    }

    private HandleError(errRes: HttpErrorResponse) {
        let errorMessage = 'Network Error!'
        if (!errRes.error || !errRes.error.error) {
            return throwError(() => {
                throw new Error(errorMessage)
            })
        }
        switch (errRes.error.error.message) {
            case 'EMAIL_EXISTS':
                errorMessage = 'Email Already Exists..'
                break;
            case 'INVALID_PASSWORD':
                errorMessage = "Incorrect Password";
                break;
            case 'EMAIL_NOT_FOUND':
                errorMessage = "Invalid Email";
        }
        return throwError(() => {
            throw new Error(errorMessage)
        })
    }

    clearTime = null;

    onLogout() {
        this.Users.next(null);
        this.route.navigate(['/auth']);
        localStorage.removeItem('userData');

        if (this.clearTime) {
            clearTimeout(this.clearTime);
        }
        this.clearTime = null;
    }


    autoLogout(expiration: number) {
        this.clearTime = setTimeout(() => {
            this.onLogout();
        }, expiration);
    }

}