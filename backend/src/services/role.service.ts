import { DB } from '../config/typeorm'
import { Role } from '../entities/role.entity';

export class RoleService {
    public static async getRoles(): Promise<Role[]> {
        const roleRepository = DB.getRepository(Role);
        const rolesTypes = await roleRepository.find();
        return rolesTypes;
    }
}
