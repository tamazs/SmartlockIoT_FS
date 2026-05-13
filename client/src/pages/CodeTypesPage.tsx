import { useState, useEffect, useRef } from "react";
import useApi from "../hooks/useApi";
import type { EntryCodeTypeDto } from "../generated-ts-client";

type FormState = { name: string; description: string; maxUses: string };

const emptyForm: FormState = { name: "", description: "", maxUses: "" };

export default function CodeTypesPage() {
    const api = useApi();
    const [types, setTypes] = useState<EntryCodeTypeDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState<FormState>(emptyForm);
    const [editId, setEditId] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const dialogRef = useRef<HTMLDialogElement>(null);

    async function loadTypes() {
        setLoading(true);
        const result = await api.getCodeTypes();
        setTypes(result ?? []);
        setLoading(false);
    }

    useEffect(() => { loadTypes(); }, []);

    function openCreate() {
        setEditId(null);
        setForm(emptyForm);
        dialogRef.current?.showModal();
    }

    function openEdit(type: EntryCodeTypeDto) {
        setEditId(type.id);
        setForm({
            name: type.name,
            description: type.description ?? "",
            maxUses: type.maxUses?.toString() ?? "",
        });
        dialogRef.current?.showModal();
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setSubmitting(true);
        const req = {
            name: form.name,
            description: form.description || undefined,
            maxUses: form.maxUses ? parseInt(form.maxUses, 10) : undefined,
        };
        if (editId) {
            const result = await api.updateCodeType(editId, req);
            if (result) setTypes(prev => prev.map(t => t.id === editId ? result : t));
        } else {
            const result = await api.createCodeType(req);
            if (result) setTypes(prev => [...prev, result]);
        }
        dialogRef.current?.close();
        setSubmitting(false);
    }

    async function handleDelete(id: string) {
        await api.deleteCodeType(id);
        setTypes(prev => prev.filter(t => t.id !== id));
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Code Types</h1>
                    <p className="text-base-content/50 text-sm mt-0.5">Manage entry code type templates</p>
                </div>
                <button className="btn btn-primary btn-sm" onClick={openCreate}>
                    + Add Type
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <span className="loading loading-spinner loading-md" />
                </div>
            ) : (
                <div className="card bg-base-100 shadow-sm border border-base-300">
                    <div className="overflow-x-auto">
                        <table className="table table-sm">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Description</th>
                                    <th>Max Uses</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {types.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="text-center py-8 text-base-content/30">
                                            No code types yet
                                        </td>
                                    </tr>
                                ) : types.map(type => (
                                    <tr key={type.id}>
                                        <td className="font-medium">{type.name}</td>
                                        <td className="text-base-content/60">
                                            {type.description ?? <span className="text-base-content/30">—</span>}
                                        </td>
                                        <td>
                                            {type.maxUses ?? <span className="text-base-content/30">Unlimited</span>}
                                        </td>
                                        <td>
                                            <div className="flex gap-2">
                                                <button
                                                    className="btn btn-ghost btn-xs"
                                                    onClick={() => openEdit(type)}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    className="btn btn-ghost btn-xs text-error"
                                                    onClick={() => handleDelete(type.id)}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            <dialog ref={dialogRef} className="modal">
                <div className="modal-box">
                    <h3 className="font-bold text-lg mb-4">
                        {editId ? "Edit Code Type" : "Add Code Type"}
                    </h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <fieldset className="fieldset">
                            <legend className="fieldset-legend">Name</legend>
                            <input
                                type="text"
                                className="input input-bordered w-full"
                                placeholder="e.g. Guest, Employee"
                                value={form.name}
                                onChange={e => setForm({ ...form, name: e.target.value })}
                                required
                            />
                        </fieldset>
                        <fieldset className="fieldset">
                            <legend className="fieldset-legend">
                                Description <span className="text-base-content/40 font-normal">(optional)</span>
                            </legend>
                            <input
                                type="text"
                                className="input input-bordered w-full"
                                placeholder="Brief description"
                                value={form.description}
                                onChange={e => setForm({ ...form, description: e.target.value })}
                            />
                        </fieldset>
                        <fieldset className="fieldset">
                            <legend className="fieldset-legend">
                                Max Uses <span className="text-base-content/40 font-normal">(optional — blank = unlimited)</span>
                            </legend>
                            <input
                                type="number"
                                className="input input-bordered w-full"
                                placeholder="Leave blank for unlimited"
                                min="1"
                                value={form.maxUses}
                                onChange={e => setForm({ ...form, maxUses: e.target.value })}
                            />
                        </fieldset>
                        <div className="modal-action">
                            <button
                                type="button"
                                className="btn btn-ghost"
                                onClick={() => dialogRef.current?.close()}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className={`btn btn-primary ${submitting ? "loading" : ""}`}
                                disabled={submitting}
                            >
                                {submitting ? "Saving..." : editId ? "Save Changes" : "Create"}
                            </button>
                        </div>
                    </form>
                </div>
                <form method="dialog" className="modal-backdrop">
                    <button>close</button>
                </form>
            </dialog>
        </div>
    );
}
