import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ClientData } from '../../interfaces/clients';

import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-client-form',
  imports: [CommonModule, ReactiveFormsModule, ButtonModule],
  templateUrl: './client-form.html',
  styleUrl: './client-form.scss'
})
export class ClientForm implements OnInit {
  @Input() client!: ClientData;
  @Input() clientPhones: string[] = [];
  @Input() visible: boolean = false;
  @Input() mode?: 'view' | 'edit' | 'add';
  @Input() onClose!: () => void;
  @Output() formSubmitted = new EventEmitter<any>();

  public clientForm!: FormGroup;
  public fieldKeys: string[] = [];

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    this.buildForm();
  }

  private buildForm(): void {
    const controls: { [key: string]: FormControl } = {};

    // Usamos las claves del cliente como nombres de campos
    this.fieldKeys = Object.keys(this.client ?? {});

    this.fieldKeys.forEach((key) => {
      const value = this.client[key as keyof ClientData] ?? '';
      controls[key] = new FormControl(
        { value, disabled: this.mode === 'view' },
        Validators.required // Puedes personalizar esto después
      );
    });

    this.clientForm = this.fb.group(controls);
  }

  onSubmit(): void {
    if (this.clientForm.invalid) {
      this.clientForm.markAllAsTouched();
      return;
    }

    const data = this.clientForm.getRawValue();
    console.log('Formulario enviado:', data);

    this.formSubmitted.emit(data);

    // Aquí puedes emitir o guardar los datos
    this.onClose?.();
  }

  getFieldType(key: string): string {
    const value = (this.client as Record<string, any>)[key];
    return typeof value === 'number' ? 'number' : 'text';
  }
}
