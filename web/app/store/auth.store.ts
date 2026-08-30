import { create } from "zustand";
import { Usuario } from "../types/auth";

interface AuthState{
    usuario:Usuario| null;
    setUsuario: (usuario:Usuario) => void
    logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
    usuario:null,
    setUsuario :(usuario) => {set({usuario })
},
    logout: () =>{
        set({usuario :null})
    },
}))