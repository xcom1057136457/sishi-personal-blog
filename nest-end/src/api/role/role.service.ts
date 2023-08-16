import { Injectable } from '@nestjs/common';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Role } from './entities/role.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {RoleMenu} from "../role-menu/entities/role-menu.entity";
import {RoleMenuService} from "../role-menu/role-menu.service";
import {RoleResourceService} from "../role-resource/role-resource.service";
import {RoleResource} from "../role-resource/entities/role-resource.entity";
import {RedisService} from "../redis/redis.service";

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role) private readonly roleRepository: Repository<Role>,
    private readonly roleMenuService: RoleMenuService,
    private readonly roleResourceService: RoleResourceService,
    private readonly redisService:RedisService
  ) {}

  create(role: Role) {
    const data = this.roleRepository.save(role);
    return data;
  }

  async findAll(roleName: string) {
    const data =await this.roleRepository
      .createQueryBuilder('role')
      .leftJoin('role.roleMenus', 'roleMenus')
      .leftJoin('role.roleResources', 'roleResources')
      .addSelect('roleMenus.menuId')
      .addSelect('roleResources.resourceId')
      .where('role.roleName LIKE :roleName', {
        roleName: `%${roleName}%`,
      })
      .getMany();
    const transformedData = data.map(role => ({
      ...role,
      menuId: role.roleMenus.map(menu => menu.menuId),
      resourceId: role.roleResources.map(resource => resource.resourceId),
    }));
    for(let i=0;i<transformedData.length;i++) {
      delete transformedData[i].roleMenus
      delete transformedData[i].roleResources
    }

    return transformedData;
  }

  async updateRoleMenu(data:{roleId:number,roleMenu:RoleMenu[]}) {
    const {roleId,roleMenu}=data
    await this.roleMenuService.deleteIdByRoleId(roleId)
    await this.roleMenuService.create(roleMenu)

    return true
  }

  async updateRoleResource(data:{roleId:number,roleResource:RoleResource[]}) {
    const {roleId,roleResource}=data
    await this.roleResourceService.deleteIdByRoleId(roleId)
    await this.roleResourceService.create(roleResource)
    return true
  }

  findOne(id: number) {
    return `This action returns a #${id} role`;
  }

  update(id: number, updateRoleDto: UpdateRoleDto) {
    return `This action updates a #${id} role`;
  }

  remove(id: number) {
    const data = this.roleRepository.delete(id)
    return data;
  }

  changeDisable(id:number,isDisable:number) {
    const data=this.roleRepository.query('update t_role set is_disable=? where id=?',[isDisable,id])
    return data
  }
}
