
import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt'
import { LoginDto } from './dto/loginDto';
import { UsuarioRepository } from 'src/usuario/usuario.repository';
import {  JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
    constructor(private readonly UsuarioRepository : UsuarioRepository,
                private readonly JwtService: JwtService){}

    async login(dto: LoginDto) {
        const user = await this.UsuarioRepository.buscarPorEmail(dto.email)
        if(!user) throw new UnauthorizedException("E-mail ou senha incorretos")

        const response = await bcrypt.compare(dto.senha, user.senha )
        if(!response) throw new UnauthorizedException ("E-mail ou senha incorretos")
        
        const token = await this.JwtService.signAsync({sub: user.id})
        return{
            access_token: token
        }
        
    }
}


