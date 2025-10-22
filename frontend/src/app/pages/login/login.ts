import { Component } from "@angular/core";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { AuthService } from "../../services/authService.service";


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
  providers: [MessageService]
})
export class Login {
  user = {
    userName: null,
    password: null
  };

  constructor(private messageService: MessageService,
    private authService: AuthService
  ) { }

  onSubmit(user: any) {
    this.authService.login(user).subscribe();
  }
}
