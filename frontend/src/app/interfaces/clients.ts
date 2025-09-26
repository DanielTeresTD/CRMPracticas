export interface ClientData {
    id?: number;
    name?: string;
    address?: string;
    phoneNums?: ClientPhone[];
}

export interface ClientPhone {
    phoneID?: number;
    phoneNumber: string;
}