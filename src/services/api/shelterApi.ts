import type { CreateShelterInput, Shelter, UpdateShelterInput } from "@/src/types/shelter";
const API=(process.env.NEXT_PUBLIC_API_URL||"http://localhost:5000").replace(/\/+$/,"");
type Envelope<T>={success:boolean;data:T;message?:string;errors?:string[]};
async function request<T>(path:string,init?:RequestInit):Promise<T>{
 let response:Response;try{response=await fetch(API+path,{...init,cache:"no-store",headers:{Accept:"application/json","Content-Type":"application/json",...init?.headers}});}catch{throw new Error("Unable to reach the shelter service.");}
 let body:Envelope<T>;try{body=await response.json() as Envelope<T>;}catch{throw new Error("The shelter service returned an invalid response.");}
 if(!response.ok||!body.success)throw new Error(body.errors?.join(", ")||body.message||"Shelter request failed.");return body.data;
}
export const getShelters=()=>request<Shelter[]>("/api/shelters");
export const getShelter=(id:string)=>request<Shelter>("/api/shelters/"+encodeURIComponent(id));
export const createShelter=(input:CreateShelterInput)=>request<Shelter>("/api/shelters",{method:"POST",body:JSON.stringify(input)});
export const updateShelter=(id:string,input:UpdateShelterInput)=>request<Shelter>("/api/shelters/"+encodeURIComponent(id),{method:"PATCH",body:JSON.stringify(input)});
