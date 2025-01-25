import { Injectable } from '@angular/core';
import { Auth, RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  appVerifier: RecaptchaVerifier | undefined;
  confirmationResult: ConfirmationResult | undefined;

  constructor(private _fireAuth: Auth) {}

  recaptcha() {
    if (typeof window !== 'undefined') {
      const signInButton = document.getElementById('sign-in-button');
      if (signInButton) {
        this.appVerifier = new RecaptchaVerifier(this._fireAuth, 'sign-in-button', {
          size: 'invisible',
          callback: (response: any) => {
            console.log('reCAPTCHA solved:', response);
          },
          'expired-callback': () => {
            console.log('reCAPTCHA expired');
          }
        });
      } else {
        console.error('Sign-in button not found');
      }
    }
  }

  async signInWithPhoneNumber(phoneNumber: string) {
    try {
      if (!this.appVerifier) this.recaptcha();
      if (!this.appVerifier) throw new Error('reCAPTCHA verifier is not initialized');

      const confirmationResult = await signInWithPhoneNumber(this._fireAuth, phoneNumber, this.appVerifier);
      this.confirmationResult = confirmationResult;
      return confirmationResult;
    } catch (e) {
      console.error('Error during signInWithPhoneNumber:', e);
      throw e;
    }
  }

  async verifyOtp(otp: string) {
    try {
      if (!this.confirmationResult) throw new Error('No confirmation result available');
      const result = await this.confirmationResult.confirm(otp);
      console.log('OTP Verified:', result);
      return result.user;
    } catch (e) {
      console.error('Error verifying OTP:', e);
      throw e;
    }
  }
}