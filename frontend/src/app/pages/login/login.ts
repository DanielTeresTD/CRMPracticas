import { Component } from "@angular/core";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from "../../services/authService.service";

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './login.html',
  styleUrls: ['./login.scss'],
  providers: []
})
export class Login {
  [key: string]: any;
  username: string = '';
  password: string = '';
  loginValid: boolean = true;

  constructor(private authService: AuthService) { }

  onSubmit() {
    this.authService.login({ userName: this.username, password: this.password })
      .subscribe({
        next: res => this.loginValid = true,
        error: err => this.loginValid = false
      });
  }
}
