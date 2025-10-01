export interface ClientPhone {
    phoneID?: number;
    phoneNumber: string;
}

export interface ClientData {
    id?: number;
    name?: string;
    address?: string;
    email?: string
    phoneNums?: ClientPhone[];
}
