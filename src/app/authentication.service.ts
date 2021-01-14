import { Inject, Injectable } from '@angular/core';
import { BROWSER_STORAGE } from './storage';
// import { User } from './user';
// import { AuthResponse } from './authresponse';
// import { Loc8rDataService } from './loc8r-data.service';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  constructor(
    @Inject(BROWSER_STORAGE) private storage: Storage
  ) // private loc8rDataService: Loc8rDataService
  {}

  public getNoMemberName(): string {
    return this.storage.getItem('no-member');
  }

  private createNoMember(name: string): void{
    let id: string = Math.floor(Math.random() * 10000).toString();
    this.saveNoMemberName(name + "#" + id)
  }

  public setNoMemberName(name: string): void{
    if(this.isMemberExist()){
      let id:string = this.getUserID()
      this.saveNoMemberName(name + "#" + id)
    }else{
      this.createNoMember(name)
    }
  }

  private saveNoMemberName(token: string): void {
    this.storage.setItem('no-member', token);
  }

  
  public isMemberExist(): boolean {
    const noMembersNickName: string = this.getNoMemberName();
    if (noMembersNickName) {
      return true;
    } else {
      return false;
    }
  }
  public getUserNickName(): string {
    if (this.isMemberExist()) {
      const nickName: string = this.getNoMemberName().split("#")[0]
      return nickName;
    }
  }
  public getUserID(): string{
    if (this.isMemberExist()){
      const id: string = this.getNoMemberName().split("#")[1]
      return id;
    }
  }
  public getUserFullID(): string{
    if(this.isMemberExist()){
      const fullid: string = this.getNoMemberName()
      return fullid
    }
  }
  // public login(user: User): Promise<any> {
  //   return this.loc8rDataService
  //     .login(user)
  //     .then((authResp: AuthResponse) => this.saveToken(authResp.token));
  // }

  // public register(user: User): Promise<any> {
  //   return this.loc8rDataService
  //     .register(user)
  //     .then((authResp: AuthResponse) => this.saveToken(authResp.token));
  // }

  // public logout(): void {
  //   this.storage.removeItem('loc8r-token');
  // }

  //   public isLoggedIn(): boolean {
  //     const token: string = this.getToken();
  //     if (token) {
  //       const payload = JSON.parse(atob(token.split('.')[1]));
  //       return payload.exp > Date.now() / 1000;
  //     } else {
  //       return false;
  //     }
  //   }

  //   public getCurrentUser(): User {
  //     if (this.isLoggedIn()) {
  //       const token: string = this.getToken();
  //       const { email, name } = JSON.parse(atob(token.split('.')[1]));
  //       return { email, name } as User;
  //     }
  //   }
}
