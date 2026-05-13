import { useState, useEffect, useRef } from "react";
import useApi from "../hooks/useApi";
import type { EntryCodeDto, EntryCodeTypeDto, UserDto } from "../generated-ts-client";

type FormState = { typeId: string; expiry: string; codeOwnerId: string };

export default function CodesPage() {
    const api = useApi();
    const [codes, setCodes] = useState<EntryCodeDto[]>([]);
    const [codeTypes, setCodeTypes] = useState<EntryCodeTypeDto[]>([]);
    const [users, setUsers] = useState<UserDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [form, setForm] = useState<FormState>({ typeId: "", expiry: "", codeOwnerId: "" });
    const [submitting, setSubmitting] = useState(false);
    const dialogRef = useRef<HTMLDialogElement>(null);

    async function loadData() {
        setLoading(true);
        const [codesResult, typesResult, usersResult] = await Promise.all([
            api.getCodes(),
            api.getCodeTypes(),
            api.getUsers(),
        ]);
        setCodes(codesResult ?? []);
        setCodeTypes(typesResult ?? []);
        setUsers(usersResult ?? []);
        setLoading(false);
    }

    useEffect(() => { loadData(); }, []);

    function openDialog() {
        setForm({ typeId: codeTypes[0]?.id ?? "", expiry: "", codeOwnerId: "" });
        dialogRef.current?.showModal();
    }

    async function handleAdd(e: React.FormEvent) {
        e.preventDefault();
        setSubmitting(true);
        const result = await api.addCode({
            typeId: form.typeId,
            expiry: new Date(form.expiry).toISOString(),
            codeOwnerId: form.codeOwnerId || undefined,
        });
        if (result) {
            setCodes(prev => [...prev, result]);
            dialogRef.current?.close();
        }
        setSubmitting(false);
    }

    async function handleDelete(id: string) {
        await api.deleteCode(id);
        setCodes(prev => prev.filter(c => c.id !== id));
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Entry Codes</h1>
                    <p className="text-base-content/50 text-sm mt-0.5">Manage access codes for the smart lock</p>
                </div>
                <button className="btn btn-primary btn-sm" onClick={openDialog}>
                    + Add Code
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <span className="loading loading-spinner loading-md" />
                </div>
            ) : (
                <div className="card bg-base-100 shadow-sm border border-base-300">
                    <div className="overflow-x-auto">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Code</th>
                                    <th>Type</th>
                                    <th>Owner</th>
                                    <th>Expiry</th>
                                    <th>Uses</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {codes.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="text-center py-8 text-base-content/30">
                                            No codes yet
                                        </td>
                                    </tr>
                                ) : codes.map(code => (
                                    <tr key={code.id}>
                                        <td className="font-mono font-bold text-lg tracking-widest">
                                            {code.code}
                                        </td>
                                        <td>{code.type?.name}</td>
                                        <td>
                                            {code.codeOwner?.userName ?? (
                                                <span className="text-base-content/30">—</span>
                                            )}
                                        </td>
                                        <td className="text-sm">{new Date(code.expiry).toLocaleDateString()}</td>
                                        <td className="text-sm">
                                            {code.useCount}
                                            {code.type?.maxUses != null ? ` / ${code.type.maxUses}` : ""}
                                        </td>
                                        <td>
                                            <button
                                                className="btn btn-ghost btn-xs text-error"
                                                onClick={() => handleDelete(code.id)}
                                            >
                                                Delete
                                            </button>
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
                    <h3 className="font-bold text-lg mb-4">Add Entry Code</h3>
                    <form onSubmit={handleAdd} className="space-y-4">
                        <fieldset className="fieldset">
                            <legend className="fieldset-legend">Code Type</legend>
                            <select
                                className="select select-bordered w-full"
                                value={form.typeId}
                                onChange={e => setForm({ ...form, typeId: e.target.value })}
                                required
                            >
                                <option value="" disabled>Select a type</option>
                                {codeTypes.map(t => (
                                    <option key={t.id} value={t.id}>{t.name}</option>
                                ))}
                            </select>
                        </fieldset>
                        <fieldset className="fieldset">
                            <legend className="fieldset-legend">
                                Owner <span className="text-base-content/40 font-normal">(optional)</span>
                            </legend>
                            <select
                                className="select select-bordered w-full"
                                value={form.codeOwnerId}
                                onChange={e => setForm({ ...form, codeOwnerId: e.target.value })}
                            >
                                <option value="">No owner</option>
                                {users.map(u => (
                                    <option key={u.id} value={u.id}>{u.userName}</option>
                                ))}
                            </select>
                        </fieldset>
                        <fieldset className="fieldset">
                            <legend className="fieldset-legend">Expiry</legend>
                            <input
                                type="datetime-local"
                                className="input input-bordered w-full"
                                value={form.expiry}
                                onChange={e => setForm({ ...form, expiry: e.target.value })}
                                required
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
                                {submitting ? "Creating..." : "Create"}
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
