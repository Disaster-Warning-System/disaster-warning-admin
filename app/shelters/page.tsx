"use client";
import Link from "next/link";
import ShelterTable from "@/src/components/shelters/ShelterTable";
import { useShelters } from "@/src/hooks/useShelters";
export default function SheltersPage(){
 const {shelters,loading,error,refresh}=useShelters();
 return <main className="mx-auto min-h-screen max-w-7xl space-y-6 bg-slate-50 px-6 py-10"><header className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-semibold uppercase tracking-widest text-blue-700">District response</p><h1 className="mt-2 text-3xl font-bold">Shelter dashboard</h1><p className="mt-2 text-slate-600">Review capacity and coordinate shelter availability.</p></div><Link href="/shelters/create" className="rounded-lg bg-blue-700 px-5 py-3 font-semibold text-white">Register new shelter</Link></header><section className="grid gap-4 sm:grid-cols-3"><Metric label="Registered shelters" value={shelters.length}/><Metric label="Available spaces" value={shelters.reduce((n,s)=>n+s.availableSpaces,0)}/><Metric label="At capacity" value={shelters.filter(s=>s.occupancy>=s.capacity).length}/></section><div className="flex justify-end"><button onClick={()=>void refresh()} className="font-semibold text-blue-700">Refresh</button></div>{loading?<p role="status" className="rounded-xl bg-white p-8">Loading shelters...</p>:error?<p role="alert" className="rounded-xl bg-red-50 p-5 text-red-700">{error}</p>:<ShelterTable shelters={shelters}/>}</main>;
}
function Metric({label,value}:{label:string;value:number}){return <div className="rounded-xl border bg-white p-5"><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-3xl font-bold">{value}</p></div>;}
