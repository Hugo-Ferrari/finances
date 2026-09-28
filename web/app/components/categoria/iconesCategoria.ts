import {
  Car,
  Dumbbell,
  Gamepad2,
  GraduationCap,
  HeartPulse,
  House,
  Plane,
  ShoppingCart,
  Utensils,
  Wallet,
} from "lucide-react";

export const iconesCategoria = [
  { nome: "Utensils", componente: Utensils },
  { nome: "Car", componente: Car },
  { nome: "House", componente: House },
  { nome: "HeartPulse", componente: HeartPulse },
  { nome: "GraduationCap", componente: GraduationCap },
  { nome: "Gamepad2", componente: Gamepad2 },
  { nome: "ShoppingCart", componente: ShoppingCart },
  { nome: "Plane", componente: Plane },
  { nome: "Wallet", componente: Wallet },
  { nome: "Dumbbell", componente: Dumbbell },
] as const;
