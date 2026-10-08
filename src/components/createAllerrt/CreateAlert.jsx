 "use client";

 import apiClient from "../../api/axios";
 import { useState } from "react";

 const targetAreaOptions = ["Colombo", "Gampaha", "Kelani River Basin"];
 const channelOptions = ["SMS", "Push"];

 const initialFormData = {
     headline: "",
     instruction: "",
     severity: "Warning",
     targetAreas: [],
     channels: [],
 };

 const CreateAlert = () => {
     const [formData, setFormData] = useState(initialFormData);
     const [showPreview, setShowPreview] = useState(false);
     const [status, setStatus] = useState(null);
     const [isSubmitting, setIsSubmitting] = useState(false);
     const [errors, setErrors] = useState({});

     const updateFormData = (field, value) => {
         setFormData((current) => ({ ...current, [field]: value }));
     };

     const handleCheckbox = (event, field) => {
         const { checked, value } = event.target;
         setFormData((current) => ({
             ...current,
             [field]: checked
                 ? [...current[field], value]
                 : current[field].filter((item) => item !== value),
         }));
     };

     const validateForm = () => {
         const nextErrors = {};
         if (!formData.headline.trim()) nextErrors.headline = "Headline is required.";
         if (!formData.instruction.trim()) nextErrors.instruction = "Instruction is required.";
         if (!formData.targetAreas.length) nextErrors.targetAreas = "Select at least one target area.";
         if (!formData.channels.length) nextErrors.channels = "Select at least one delivery channel.";
         setErrors(nextErrors);
         return Object.keys(nextErrors).length === 0;
     };

     const handleSubmit = (event) => {
         event.preventDefault();
         if (validateForm()) {
             setStatus(null);
             setShowPreview(true);
         }
     };

     const submitAlert = async () => {
         setIsSubmitting(true);
         setStatus(null);
         try {
             const response = await apiClient.post("/alerts", formData);
             const alert = response.data.alert;
             setStatus({
                 type: "success",
                 message: `Alert ${alert.alertId} dispatched successfully.`,
             });
             setShowPreview(false);
             setFormData(initialFormData);
             setErrors({});
         } catch (error) {
             setStatus({
                 type: "error",
                 message: error.response?.data?.message || "Unable to save the alert.",
             });
         } finally {
             setIsSubmitting(false);
         }
     };

     return (
         <div className="mx-auto mt-10 max-w-2xl rounded-xl bg-white p-6 shadow-md">
             <h2 className="mb-6 text-2xl font-bold text-slate-900">Issue Hazard Warning</h2>

             {status && (
                 <div
                     className={`mb-4 rounded-lg p-3 ${
                         status.type === "success"
                             ? "bg-green-100 text-green-700"
                             : "bg-red-100 text-red-700"
                     }`}
                     role="status"
                 >
                     {status.message}
                 </div>
             )}

             <form onSubmit={handleSubmit} className="space-y-5">
                 <div>
                     <label htmlFor="headline" className="mb-1 block font-medium text-slate-700">
                         Headline
                     </label>
                     <input
                         id="headline"
                         type="text"
                         value={formData.headline}
                         onChange={(event) => updateFormData("headline", event.target.value)}
                         className="w-full rounded-lg border border-slate-300 p-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                     />
                     {errors.headline && <p className="mt-1 text-sm text-red-600">{errors.headline}</p>}
                 </div>

                 <div>
                     <label htmlFor="instruction" className="mb-1 block font-medium text-slate-700">
                         Instruction
                     </label>
                     <textarea
                         id="instruction"
                         value={formData.instruction}
                         onChange={(event) => updateFormData("instruction", event.target.value)}
                         rows={4}
                         className="w-full rounded-lg border border-slate-300 p-2.5 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                     />
                     {errors.instruction && <p className="mt-1 text-sm text-red-600">{errors.instruction}</p>}
                 </div>

                 <div>
                     <label htmlFor="severity" className="mb-1 block font-medium text-slate-700">
                         Severity
                     </label>
                     <select
                         id="severity"
                         value={formData.severity}
                         onChange={(event) => updateFormData("severity", event.target.value)}
                         className="w-full rounded-lg border border-slate-300 p-2.5"
                     >
                         <option>Advisory</option>
                         <option>Watch</option>
                         <option>Warning</option>
                         <option>Evacuation Order</option>
                     </select>
                 </div>

                 <div className="grid gap-5 sm:grid-cols-2">
                     <fieldset>
                         <legend className="mb-2 font-medium text-slate-700">Target Areas</legend>
                         <div className="space-y-2">
                             {targetAreaOptions.map((area) => (
                                 <label key={area} className="flex items-center gap-2 text-slate-600">
                                     <input
                                         type="checkbox"
                                         value={area}
                                         checked={formData.targetAreas.includes(area)}
                                         onChange={(event) => handleCheckbox(event, "targetAreas")}
                                         className="h-4 w-4 accent-blue-600"
                                     />
                                     {area}
                                 </label>
                             ))}
                         </div>
                         {errors.targetAreas && <p className="mt-1 text-sm text-red-600">{errors.targetAreas}</p>}
                     </fieldset>

                     <fieldset>
                         <legend className="mb-2 font-medium text-slate-700">Channels</legend>
                         <div className="space-y-2">
                             {channelOptions.map((channel) => (
                                 <label key={channel} className="flex items-center gap-2 text-slate-600">
                                     <input
                                         type="checkbox"
                                         value={channel}
                                         checked={formData.channels.includes(channel)}
                                         onChange={(event) => handleCheckbox(event, "channels")}
                                         className="h-4 w-4 accent-blue-600"
                                     />
                                     {channel}
                                 </label>
                             ))}
                         </div>
                         {errors.channels && <p className="mt-1 text-sm text-red-600">{errors.channels}</p>}
                     </fieldset>
                 </div>

                 <div className="flex flex-col gap-3 sm:flex-row">
                     <button
                         type="submit"
                         disabled={isSubmitting}
                         className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                     >
                         Review Warning
                     </button>
                 </div>
             </form>

             {showPreview && (
                 <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
                     <div
                         role="dialog"
                         aria-modal="true"
                         aria-labelledby="confirm-dispatch-title"
                         className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl"
                     >
                         <h3 id="confirm-dispatch-title" className="mb-4 text-xl font-bold text-red-600">
                             Confirm Dispatch
                         </h3>
                         <div className="space-y-2 text-slate-700">
                             <p><strong>Headline:</strong> {formData.headline}</p>
                             <p><strong>Instruction:</strong> {formData.instruction}</p>
                             <p><strong>Severity:</strong> {formData.severity}</p>
                             <p><strong>Target Areas:</strong> {formData.targetAreas.join(", ")}</p>
                             <p><strong>Channels:</strong> {formData.channels.join(", ")}</p>
                         </div>
                         <div className="mt-6 flex justify-end gap-3">
                             <button
                                 type="button"
                                 onClick={() => setShowPreview(false)}
                                 className="rounded-lg bg-slate-200 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-300"
                             >
                                 Cancel
                             </button>
                             <button
                                 type="button"
                                 onClick={submitAlert}
                                 disabled={isSubmitting}
                                 className="rounded-lg bg-red-600 px-4 py-2 font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                             >
                                 {isSubmitting ? "DISPATCHING..." : "Confirm Dispatch"}
                             </button>
                         </div>
                     </div>
                 </div>
             )}
         </div>
     );
 };

 export default CreateAlert;