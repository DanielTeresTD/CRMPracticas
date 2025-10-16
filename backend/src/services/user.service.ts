import { DB } from '../config/typeorm';
import { User } from '../entities/user.entity';
import * as crypto from "crypto";
import { LogService } from '../services/log.service';
import { Log } from '../entities/log.entity';
import { DeepPartial } from 'typeorm';
import jwt from 'jsonwebtoken';

export class UserService {

    public static async registerUser(newUser: User): Promise<void> {
        newUser.password = this.encodeToSHA256Hex(newUser.password);
        const userRepository = DB.getRepository(User);
        await userRepository.save(newUser);
    }

    public static async login(user: DeepPartial<User>): Promise<{ token: string, user: Object }> {
        user.password = this.encodeToSHA256Hex(user.password!);
        const userRepository = DB.getRepository(User);

        const userExist = await userRepository.findOne({
            where: { userName: user.userName },
            relations: ["rol", "client"],
            select: {
                id: true,
                userName: true,
                password: true,
                rol: true,
                client: {
                    id: true
                }
            }
        });

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
            rol: userExist.rol.type
        };

        const token = jwt.sign(userParsed, process.env.JWT_PSSWD!, { expiresIn: '1h' });
        return { token, user: userParsed };
    }


    // Encode text using sha256 and return in hex format.
    private static encodeToSHA256Hex(text: string): string {
        return crypto.createHash('sha256').update(text).digest('hex');
    }

}
