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
    if (this.mode !== 'view') {
      // If phone array exists, create a new FormControl for each phone
      const phoneControls = this.clientPhones?.map(phone =>
        new FormControl(phone, Validators.required)
      ) ?? [];

      // If no phone is added, create an empty field to add new phone or edit existing one.
      if (phoneControls.length === 0) {
        phoneControls.push(new FormControl('', Validators.required));
      }

      // Create form array with key name phoneNums
      controls['phoneNums'] = this.fb.array(phoneControls);
    }

    // Create main form group with the controls created
    this.clientForm = this.fb.group(controls);
  }

  public get phoneNums(): FormArray {
    return this.clientForm.get('phoneNums') as FormArray;
  }

  public addPhone(): void {
    this.phoneNums.push(new FormControl('', Validators.required));
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

    // Transform the array of string into interface ClientPhone to handle future calls.
    if (formData.phoneNums) {
      formData.phoneNums = formData.phoneNums.map((phone: string) => ({
        phoneNumber: phone
      }));
    }

    // Send the form values to parent component.
    this.formSubmitted.emit(formData);
    // Close form and dialog.
    this.onClose?.();
  }

  public getFieldType(key: string): string {
    const value = this.clientForm?.get(key)?.value;
    return typeof value === 'number' ? 'number' : 'text';
  }

  public getPhoneControl(index: number): FormControl {
    return this.phoneNums.at(index) as FormControl;
  }
}
