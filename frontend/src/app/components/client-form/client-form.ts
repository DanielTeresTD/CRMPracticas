import {
  Component, EventEmitter, Input, OnInit,
  Output, OnChanges, SimpleChanges,
  ChangeDetectorRef
} from '@angular/core';
import {
  ReactiveFormsModule, FormBuilder, FormGroup,
  Validators, FormControl, FormArray
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ClientData, ClientPhone, UserData } from '../../interfaces/clients';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { InputTextModule } from 'primeng/inputtext';
import { RoleService } from '../../services/role.service';
import { AuthService } from '../../services/authService.service';

@Component({
  selector: 'app-client-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonModule, InputTextModule, SelectModule],
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
  public userForm!: FormGroup;
  public clientForm?: FormGroup;
  public fieldKeys: string[] = [];
  public fieldKeysClient: string[] = [];
  public roles?: any[];
  public user: UserData = {
    userName: '',
    password: '',
    dni: '',
    role: '',
    client: {
      name: '',
      address: '',
      email: '',
      dni: '',
      phoneNums: []
    }
  };

  constructor(private fb: FormBuilder, private role: RoleService,
    private authService: AuthService, private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.clientForm = this.fb.group({});
    this.userForm = this.fb.group({});
    this.role.getRoles().subscribe({
      next: (response) => {
        this.roles = response.data.map((obj: any) => ({ label: obj.type, value: obj.id }));
        this.cdr.detectChanges();
      }
    });



    if (this.client) {
      this.user.client = this.client;
    }

    this.buildUserForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['client'] && this.client || changes['mode']) {
      this.user.client = this.client;
      this.buildUserForm();
    }
  }

  // Build dynamic form group with every form control or form array based in the data 
  // provided by client atr.
  private async buildUserForm(): Promise<void> {
    let userData: any = this.user ?? {};

    this.userForm = this.fb.group({
      userName: [{ value: userData.userName || '', disabled: this.mode === 'view' }, Validators.required],
      password: [{ value: userData.password || '', disabled: this.mode === 'view' }, Validators.required],
      dni: [{ value: userData.dni || '', disabled: this.mode === 'view' }, Validators.required],
      role: [{ value: userData.role || '', disabled: this.mode === 'view' }, Validators.required]
    });

    if (this.mode === 'edit' && this.client?.dni) {
      this.authService.getUserData(this.client.dni).subscribe({
        next: (response) => {
          userData = {
            userName: response.data.userName,
            role: response.data.roleId,
            dni: this.client.dni
          };

          this.userForm.patchValue({
            userName: userData.userName || '',
            password: '',
            dni: userData.dni || '',
            role: userData.role || ''
          });
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error al obtener datos del usuario por dni:', error);
        }
      });


    }

    // If role is not user, don´t show client form
    this.userForm.get('role')?.valueChanges.subscribe((roleValue: number) => {
      if (roleValue === 2 || this.mode === 'edit') {
        this.buildClientForm();
      } else {
        this.clientForm = undefined;
      }
    });

    if (userData.role === 'user' || userData.role === 2) {
      this.buildClientForm();
    } else {
      this.clientForm = undefined;
    }
  }



  private buildClientForm(): void {
    const client = this.user?.client ?? {};

    const controls: { [key: string]: FormControl | FormArray } = {
      name: new FormControl({ value: client.name || '', disabled: this.mode === 'view' }, Validators.required),
      address: new FormControl({ value: client.address || '', disabled: this.mode === 'view' }, Validators.required),
      email: new FormControl({ value: client.email || '', disabled: this.mode === 'view' }, [Validators.required, Validators.email]),
    };

    // Edit or add phones
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
    this.fieldKeysClient = Object.keys(this.clientForm.controls);
  }

  public get phoneNums(): FormArray {
    return this.clientForm?.get('phoneNums') as FormArray;
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
    if (this.userForm.invalid || (this.clientForm && this.clientForm.invalid)) {
      this.userForm.markAllAsTouched();
      this.clientForm?.markAllAsTouched();
      return;
    }

    const userData = this.userForm.getRawValue();
    let formData = { ...userData };

    if (userData.role === 2 && this.clientForm) {
      formData = {
        ...formData,
        client: this.clientForm.getRawValue()
      };

      formData.client.dni = formData.dni;
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

  public getPhoneIDControl(index: number): FormControl {
    return this.getPhoneGroup(index).get('phoneID') as FormControl;
  }

  public getPhoneGroup(index: number): FormGroup {
    return this.phoneNums.at(index) as FormGroup;
  }

  public getPhoneNumberControl(index: number): FormControl {
    return this.getPhoneGroup(index).get('phoneNumber') as FormControl;
  }
}
