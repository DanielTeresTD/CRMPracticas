import { DB } from '../config/typeorm';
import { User } from '../entities/user.entity';
import * as crypto from "crypto";

interface LoginData {
    userName: string,
    password: string
}

export class UserService {

    public static async addUser(newUser: User): Promise<void> {
        newUser.password = this.encodeToSHA256Hex(newUser.password);
        const userRepository = DB.getRepository(User);
        await userRepository.save(newUser);
    }

    public static async findUser(user: LoginData): Promise<void> {
        user.password = this.encodeToSHA256Hex(user.password);
        const userRepository = DB.getRepository(User);

        const userExist = await userRepository.findOne({
            where: {
                userName: user.userName,
                password: user.password
            }
        })

        if (!userExist) {
            throw Error("User and password are incorrect");
        }
    }


    // Encode text using sha256 and return in hex format.
    private static encodeToSHA256Hex(text: string): string {
        return crypto.createHash('sha256').update(text).digest('hex');
    }

}
