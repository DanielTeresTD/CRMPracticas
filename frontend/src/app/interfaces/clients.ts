export interface ClientPhone {
    phoneID?: number;
    phoneNumber: string;
}

export interface ClientData {
    id?: number;
    name?: string;
    address?: string;
    email?: string;
    dni?: string;
    phoneNums?: ClientPhone[];
}

export interface UserData {
    userName: string;
    password: string;
    dni: string;
    role: string;
    client?: ClientData;
}


