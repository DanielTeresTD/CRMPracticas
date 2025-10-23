import { DB } from '../config/typeorm';
import { User } from '../entities/user.entity';
import * as crypto from "crypto";
import { LogService } from '../services/log.service';
import { Log } from '../entities/log.entity';
import { DeepPartial } from 'typeorm';
import jwt from 'jsonwebtoken';

export class UserService {

    public static async registerUser(newUser: any): Promise<User> {
        newUser.password = this.encodeToSHA256Hex(newUser.password!);
        const userFormat: DeepPartial<User> = {
            userName: newUser.userName,
            password: newUser.password,
            client: {
                dni: newUser.dni
            },
            role: {
                id: newUser.role
            }
        }

        console.log("usuario formateado", userFormat);
        const userRepository = DB.getRepository(User);
        return await userRepository.save(userFormat);
    }

    public static async updateRegister(newUser: any): Promise<User> {
        newUser.password = this.encodeToSHA256Hex(newUser.password!);
        const userRepository = DB.getRepository(User);
        const oldUser = await this.findUserByDNI(newUser.dni);

        if (!oldUser) {
            throw Error("No user was found");
        }

        const userFormat: DeepPartial<User> = {
            id: oldUser.id,
            userName: newUser.userName,
            password: newUser.password,
            client: {
                dni: newUser.dni
            },
            role: {
                id: newUser.role
            }
        }

        return await userRepository.save(userFormat);
    }

    public static async login(user: DeepPartial<User>): Promise<{ token: string, user: Object }> {
        user.password = this.encodeToSHA256Hex(user.password!);
        const userRepository = DB.getRepository(User);

        const userExist = await userRepository.findOne({
            where: { userName: user.userName },
            relations: ["role", "client"],
            select: {
                id: true,
                userName: true,
                password: true,
                role: true,
                client: {
                    id: true
                }
            }
        });

        console.log(userExist?.password);
        console.log(user.password);

        if (!userExist) {
            throw Error("User with that name is not registered yet");
        }

        const passwordCorrect = userExist.password === user.password;
        const logData: DeepPartial<Log> = {
            success: passwordCorrect,
            userId: { id: userExist.id }
        };

        await LogService.add(logData);

        if (!passwordCorrect) {
            throw new Error("Password incorrect");
        }

        const userParsed = {
            userId: userExist.id,
            clientId: userExist.client?.id ?? null,
            userName: userExist.userName,
            role: userExist.role.type
        };

        const token = jwt.sign(userParsed, process.env.JWT_PSSWD!, { expiresIn: '1h' });
        return { token, user: userParsed };
    }


    // Encode text using sha256 and return in hex format.
    private static encodeToSHA256Hex(text: string): string {
        return crypto.createHash('sha256').update(text).digest('hex');
    }

    public static async findUserByDNI(dniU: string): Promise<User | null> {
        const userRepository = DB.getRepository(User);
        return await userRepository.findOne({
            where: {
                client: {
                    dni: dniU
                }
            },

            relations: ['client', 'role']
        });
    }

}
