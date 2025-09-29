import { useEffect, useMemo, useState } from 'react';
import './form.css';

const TABS = ["company", "airplane", "workers", "schedule"];

function mapDisplayToInitialTab(display) {
    if (!display) return "company";
    if (display === "airplanes") return "airplane";
    return display;
}

function getInitialData(tab) {
    switch (tab) {
        case 'company':
            return { company_name: '' };
        case 'airplane':
            return { company_id: '', model_name: '', capacity: '' };
        case 'workers':
            return { tech_name: '', dept_id: '' };
        case 'schedule':
            return { company_id: '', airplane_id: '', pilot_id: '', takeOff: '', canTakeOff: false };
        default:
            return {};
    }
}

function getFields(tab) {
    switch (tab) {
        case 'company':
            return [
                { name: 'company_name', label: 'Company Name', type: 'text' },
            ];
        case 'airplane':
            return [
                { name: 'company_id', label: 'Company ID', type: 'number' },
                { name: 'model_name', label: 'Model Name', type: 'text' },
                { name: 'capacity', label: 'Capacity', type: 'number' },
            ];
        case 'workers':
            return [
                { name: 'tech_name', label: 'Technician Name', type: 'text' },
                { name: 'dept_id', label: 'Department ID', type: 'number' },
            ];
        case 'schedule':
            return [
                { name: 'company_id', label: 'Company ID', type: 'number' },
                { name: 'airplane_id', label: 'Airplane ID', type: 'number' },
                { name: 'takeOff', label: 'Take Off', type: 'datetime-local' },
            ];
        default:
            return [];
    }
}

export function Form({ display, onClose, onSubmit }) {
    const initialTab = useMemo(() => mapDisplayToInitialTab(display), [display]);
    const [activeTab, setActiveTab] = useState(initialTab);
    const [formData, setFormData] = useState(getInitialData(initialTab));

    useEffect(() => {
        const t = mapDisplayToInitialTab(display);
        setActiveTab(t);
        setFormData(getInitialData(t));
    }, [display]);

    useEffect(() => {
        setFormData(getInitialData(activeTab));
    }, [activeTab]);

    const handleChange = (name, value, type) => {
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? (value === '' ? '' : Number(value)) : value
        }));
    };

    const handleCheckbox = (name, checked) => {
        setFormData(prev => ({
            ...prev,
            [name]: checked
        }));
    };

    const handleSubmit = (e) => {
        console.log(formData);
        
        e.preventDefault();
        onSubmit(activeTab, formData);
    };

    const fields = getFields(activeTab);

    return (
        <div className="Form-Container">
            <div className="Form-Overlay" onClick={onClose}></div>
            <div className="Form-Modal">
                <div className="Form-Header">
                    <div className="Form-Tabs">
                        {TABS.map(tab => (
                            <button
                                key={tab}
                                className={`Form-Tab${tab === activeTab ? ' active' : ''}`}
                                onClick={() => setActiveTab(tab)}
                                type="button"
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                    <button className="Form-Close" onClick={onClose} type="button">×</button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="Form-Body">
                        {fields.map(field => (
                            <div key={field.name} className="Form-Field">
                                <label htmlFor={`${activeTab}-${field.name}`}>{field.label}</label>
                                {field.type === 'checkbox' ? (
                                    <input
                                        id={`${activeTab}-${field.name}`}
                                        type="checkbox"
                                        checked={!!formData[field.name]}
                                        onChange={(e) => handleCheckbox(field.name, e.target.checked)}
                                    />
                                ) : (
                                    <input
                                        id={`${activeTab}-${field.name}`}
                                        type={field.type}
                                        value={formData[field.name] ?? ''}
                                        onChange={(e) => handleChange(field.name, e.target.value, field.type)}
                                        required={field.type !== 'checkbox'}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="Form-Footer">
                        <button type="button" className="Form-Cancel" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="Form-Submit">
                            Add {activeTab}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}