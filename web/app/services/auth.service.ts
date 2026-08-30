import {  AuthLogin, CreateUsuario } from './../types/auth';
import api from './api';


export const  login =  async(data : AuthLogin) =>{
    const response = await api.post('/auth/login',data)
    return response.data
}

export const cadastro = async(data:CreateUsuario) => {
    const response = await api.post("/usuario",data)

    return response.data
}

export const buscarUsuario = async() =>{
    const response = await api.get("/usuario")
    return response.data
}