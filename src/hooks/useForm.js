import { useState } from 'react';

export const useForm = (initialState = {}) => {
    const [form, setForm] = useState(initialState);

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const resetForm = (newFormState = initialState) => {
        setForm(newFormState);
    };

    const setFormValue = (name, value) => {
        setForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return {
        form,
        handleChange,
        resetForm,
        setFormValue,
        setForm
    };
};
