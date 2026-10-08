 'use client';

import { useState } from 'react';
import apiClient from '../../api/axios';

const CreateAlert = () => {
    const [formData, setFormData] = useState({
        headline: '', instruction: '', severity: 'Warning',
        districts: [], channels: []
    });
    const [showPreview, setShowPreview] = useState(false);
    const [status, setStatus] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});

    const handleCheckbox = (e, type) => {
        const { value, checked } = e.target;
        setFormData(prev => {
            const list = checked ? [...prev[type], value] : prev[type].filter(item => item !== value);
            return { ...prev, [type]: list };
        });
    };

    const handlePreSubmit = (e) => {
        e.preventDefault();
        const nextErrors = {};
        if (!formData.headline.trim()) nextErrors.headline = 'Headline is required.';
        if (!formData.instruction.trim()) nextErrors.instruction = 'Instruction is required.';
        if (!formData.districts.length) nextErrors.districts = 'Select at least one target area.';
        if (!formData.channels.length) nextErrors.channels = 'Select at least one delivery channel.';
        setErrors(nextErrors);
        if (Object.keys(nextErrors).length) {
            return;
        }
        setShowPreview(true);
    };

    const handleConfirmDispatch = async () => {
        setIsSubmitting(true);
        try {
            const res = await apiClient.post('/alerts', formData);
            setStatus({ type: 'success', message: `Alert ${res.data.alert.alertId} Dispatched to ${res.data.recipientsReached} citizens.` });
            setShowPreview(false);
            setFormData({ headline: '', instruction: '', severity: 'Warning', districts: [], channels: [] });
        } catch (error) {
            setStatus({ type: 'error', message: error.response?.data?.message || 'Dispatch Failed' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded shadow-md relative">
            <h2 className="text-2xl font-bold mb-6">Issue Hazard Warning</h2>
            
            {status && <div className={`p-3 mb-4 rounded ${status.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{status.message}</div>}

            <form onSubmit={handlePreSubmit} className="space-y-4">
                <div><label className="font-medium">Headline</label>
                    <input type="text" value={formData.headline} className="w-full p-2 border rounded" onChange={e => setFormData({...formData, headline: e.target.value})} />
                    {errors.headline && <p className="text-sm text-red-600">{errors.headline}</p>}
                </div>
                <div><label className="font-medium">Instruction</label>
                    <textarea value={formData.instruction} className="w-full p-2 border rounded" onChange={e => setFormData({...formData, instruction: e.target.value})}></textarea>
                    {errors.instruction && <p className="text-sm text-red-600">{errors.instruction}</p>}
                </div>
                <div><label className="font-medium block mb-2">Severity</label>
                    <select value={formData.severity} className="w-full p-2 border rounded" onChange={e => setFormData({...formData, severity: e.target.value})}>
                        <option>Advisory</option><option>Watch</option><option>Warning</option><option>Evacuation Order</option>
                    </select>
                </div>
                
                <div className="flex gap-10">
                    <div>
                        <label className="font-medium block mb-2">Target Areas</label>
                        <label className="block"><input type="checkbox" value="Colombo" onChange={e => handleCheckbox(e, 'districts')}/> Colombo</label>
                        <label className="block"><input type="checkbox" value="Gampaha" onChange={e => handleCheckbox(e, 'districts')}/> Gampaha</label>
                    </div>
                    {errors.districts && <p className="text-sm text-red-600">{errors.districts}</p>}
                    <div>
                        <label className="font-medium block mb-2">Channels</label>
                        <label className="block"><input type="checkbox" value="SMS" onChange={e => handleCheckbox(e, 'channels')}/> SMS Gateway</label>
                        <label className="block"><input type="checkbox" value="Push" onChange={e => handleCheckbox(e, 'channels')}/> Push Notification</label>
                    </div>
                    {errors.channels && <p className="text-sm text-red-600">{errors.channels}</p>}
                </div>
                <button type="submit" className="w-full bg-blue-600 text-white font-bold py-2 rounded">Review Warning</button>
            </form>

            {/* Preview Modal */}
            {showPreview && (
                <div className="absolute top-0 left-0 w-full h-full bg-gray-900 bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded shadow-lg w-3/4">
                        <h3 className="text-xl font-bold mb-4 text-red-600">Confirm Dispatch</h3>
                        <p><strong>Headline:</strong> {formData.headline}</p>
                        <p><strong>Areas:</strong> {formData.districts.join(', ')}</p>
                        <p><strong>Channels:</strong> {formData.channels.join(', ')}</p>
                        <div className="mt-6 flex justify-end gap-4">
                            <button type="button" onClick={() => setShowPreview(false)} className="bg-gray-300 px-4 py-2 rounded">Cancel</button>
                            <button type="button" disabled={isSubmitting} onClick={handleConfirmDispatch} className="bg-red-600 text-white px-4 py-2 rounded disabled:opacity-50">{isSubmitting ? 'DISPATCHING...' : 'CONFIRM DISPATCH'}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
export default CreateAlert;