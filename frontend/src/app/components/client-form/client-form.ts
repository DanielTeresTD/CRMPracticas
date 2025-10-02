import {
  Component, EventEmitter, Input, OnInit,
  Output, OnChanges, SimpleChanges
} from '@angular/core';
import {
  ReactiveFormsModule, FormBuilder, FormGroup,
  Validators, FormControl, FormArray
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ClientData, ClientPhone } from '../../interfaces/clients';
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
  @Input() clientPhones: ClientPhone[] = [];
  @Input() mode?: 'view' | 'edit' | 'add';
  @Input() onClose!: () => void;
  // Send form data to father component
  @Output() formSubmitted = new EventEmitter<any>();

  // Reactive form in TS.
  public clientForm!: FormGroup;
  public fieldKeys: string[] = [];

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    this.buildForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['client'] && this.client) {
      this.buildForm();
    }
  }

  // Build dynamic form group with every form control or form array based in the data 
  // provided by client atr.
  private buildForm(): void {
    // Empty object where each key will be the keys in client atr and it will 
    // create values of type FormControl or FormArray.
    const controls: { [key: string]: FormControl | FormArray } = {};
    // this.client ?? {} --> if client is null, create an empty object.
    // Get all keys names (fields) of client object except phoneNums field
    this.fieldKeys = Object.keys(this.client ?? {}).filter(key => key !== 'phoneNums' && key !== 'id');

    this.fieldKeys.forEach((key) => {
      // Get value of key field and tell TS 'key' is from ClientData interface
      const value = this.client[key as keyof ClientData] ?? '';
      // First value is the config object. Disabled forbid add or edition when it´s in view mode.
      controls[key] = new FormControl(
        { value, disabled: this.mode === 'view' },
        Validators.required // make this field obligatory to fill
      );
    });

    // Edit or add phones
    // ✅ Modificar para manejar teléfonos con phoneID
    if (this.mode !== 'view') {
      const phoneControls = this.clientPhones?.map(phone => {
        const phoneGroup = new FormGroup({
          phoneID: new FormControl(phone.phoneID || null),
          phoneNumber: new FormControl(phone.phoneNumber, Validators.required)
        });
        return phoneGroup;
      }) ?? [];

      if (phoneControls.length === 0) {
        phoneControls.push((new FormGroup({
          phoneID: new FormControl(null),
          phoneNumber: new FormControl('', Validators.required)
        })) as any);
      }

      controls['phoneNums'] = this.fb.array(phoneControls);
    }

    this.clientForm = this.fb.group(controls);
  }

  public get phoneNums(): FormArray {
    return this.clientForm.get('phoneNums') as FormArray;
  }

  public addPhone(): void {
    const newPhoneGroup = this.fb.group({
      phoneID: [null], // Nuevo teléfono sin ID
      phoneNumber: ['', Validators.required]
    });
    this.phoneNums.push(newPhoneGroup);
  }

  public removePhone(index: number): void {
    this.phoneNums.removeAt(index);
  }

  public onSubmit(): void {
    // If an error ocurred, force all fields to be marked as touched (used/interacted)
    if (this.clientForm.invalid) {
      this.clientForm.markAllAsTouched();
      return;
    }

    const formData = this.clientForm.getRawValue();
    // Send the form values to parent component.
    this.formSubmitted.emit(formData);
    // Close form and dialog.
    this.onClose?.();
  }

  public getFieldType(key: string): string {
    const value = this.clientForm?.get(key)?.value;
    return typeof value === 'number' ? 'number' : 'text';
  }

  public getPhoneIDControl(index: number): FormControl {
    return this.getPhoneGroup(index).get('phoneID') as FormControl;
  }

  public getPhoneGroup(index: number): FormGroup {
    return this.phoneNums.at(index) as FormGroup;
  }

  // ✅ Agregar método para obtener el control del número de teléfono
  public getPhoneNumberControl(index: number): FormControl {
    return this.getPhoneGroup(index).get('phoneNumber') as FormControl;
  }
}
