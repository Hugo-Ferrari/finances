import { redirect } from "next/navigation";

export default function Home() {
  console.log("estou com codgio novo")
  redirect("/login");
}