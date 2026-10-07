"use client";
import Link from "next/link";
import { useParams,useRouter } from "next/navigation";
import { useEffect,useState } from "react";
import ShelterForm from "@/src/components/shelters/ShelterForm";
import ShelterStatusBadge from "@/src/components/shelters/ShelterStatusBadge";
import { getShelter,updateShelter } from "@/src/services/api/shelterApi";
import type { Shelter,UpdateShelterInput } from "@/src/types/shelter";
export default function ShelterDetailsPage(){
 const {id}=useParams<{id:string}>();const router=useRouter();const [shelter,setShelter]=useState<Shelter|null>(null);const [error,setError]=useState("");
 useEffect(()=>{let active=true;getShelter(id).then(v=>{if(active)setShelter(v);}).catch(e=>{if(active)setError(e instanceof Error?e.message:"Could not load shelter.");});return()=>{active=false;};},[id]);
 async function submit(v:UpdateShelterInput){await updateShelter(id,v);router.push("/shelters");}
 if(error)return <main className="mx-auto max-w-3xl px-6 py-10"><Link href="/shelters">← Back</Link><p role="alert" className="mt-6 rounded bg-red-50 p-4 text-red-700">{error}</p></main>;
 if(!shelter)return <main className="mx-auto max-w-3xl px-6 py-10">Loading shelter...</main>;
 return <main className="mx-auto max-w-3xl space-y-6 px-6 py-10"><Link href="/shelters" className="font-semibold text-blue-700">← Back to shelters</Link><header className="flex justify-between gap-4"><div><h1 className="text-3xl font-bold">{shelter.name}</h1><p className="mt-2 text-slate-600">{shelter.location}</p></div><ShelterStatusBadge shelter={shelter}/></header><section className="grid grid-cols-3 gap-3"><Metric label="Capacity" value={shelter.capacity}/><Metric label="Occupancy" value={shelter.occupancy}/><Metric label="Available" value={shelter.availableSpaces}/></section><ShelterForm mode="update" shelter={shelter} onSubmit={submit}/></main>;
}
function Metric({label,value}:{label:string;value:number}){return <div className="rounded-xl border bg-white p-4"><p className="text-xs text-slate-500">{label}</p><p className="mt-1 text-xl font-bold">{value}</p></div>;}
