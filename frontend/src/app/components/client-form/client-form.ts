import {
  Component, EventEmitter, Input, OnInit,
  Output, OnChanges, SimpleChanges
} from '@angular/core';
import {
  ReactiveFormsModule, FormBuilder, FormGroup,
  Validators, FormControl, FormArray
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ClientData } from '../../interfaces/clients';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-client-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonModule],
  templateUrl: './client-form.html',
  styleUrl: './client-form.scss'
})
export class ClientForm implements OnInit, OnChanges {
  @Input() client!: ClientData;
  @Input() clientPhones: string[] = [];
  @Input() mode?: 'view' | 'edit' | 'add';
  @Input() onClose!: () => void;
  @Output() formSubmitted = new EventEmitter<any>();

  public clientForm!: FormGroup;
  public fieldKeys: string[] = [];
  public formControl = FormControl;

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    this.buildForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['client'] && this.client) {
      this.buildForm();
    }
  }

  private buildForm(): void {
    const controls: { [key: string]: FormControl | FormArray } = {};
    this.fieldKeys = Object.keys(this.client ?? {}).filter(key => key !== 'phoneNums');

    this.fieldKeys.forEach((key) => {
      const value = this.client[key as keyof ClientData] ?? '';
      controls[key] = new FormControl(
        { value, disabled: this.mode === 'view' },
        Validators.required
      );
    });

    // Teléfonos (edit/add)
    if (this.mode !== 'view') {
      const phoneControls = this.clientPhones?.map(phone =>
        new FormControl(phone, Validators.required)
      ) ?? [];

      if (phoneControls.length === 0) {
        phoneControls.push(new FormControl('', Validators.required));
      }

      controls['phoneNums'] = this.fb.array(phoneControls);
    }

    this.clientForm = this.fb.group(controls);
  }

  get phoneNums(): FormArray {
    return this.clientForm.get('phoneNums') as FormArray;
  }

  addPhone(): void {
    this.phoneNums.push(new FormControl('', Validators.required));
  }

  removePhone(index: number): void {
    this.phoneNums.removeAt(index);
  }

  onSubmit(): void {
    if (this.clientForm.invalid) {
      this.clientForm.markAllAsTouched();
      return;
    }

    const formData = this.clientForm.getRawValue();

    // Adaptar formato de teléfonos para el backend
    if (formData.phoneNums) {
      formData.phoneNums = formData.phoneNums.map((phone: string) => ({
        phoneNumber: phone
      }));
    }

    this.formSubmitted.emit(formData);
    this.onClose?.();
  }

  getFieldType(key: string): string {
    const value = this.clientForm?.get(key)?.value;
    return typeof value === 'number' ? 'number' : 'text';
  }

  public getPhoneControl(index: number): FormControl {
    return this.phoneNums.at(index) as FormControl;
  }
}
