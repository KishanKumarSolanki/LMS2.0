import { useCallback, useEffect, useState } from 'react';
import { FiSearch, FiTrash2 } from 'react-icons/fi';
import { userApi } from '../../lib/api';

export default function ManageUsers() {
    const [role, setRole] = useState('student');
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState('');
    const [error, setError] = useState('');
    const load = useCallback(() => userApi.list(role).then(setUsers).catch((requestError) => setError(requestError.message)), [role]);
    useEffect(() => { load(); }, [load]);
    const remove = async (id) => { if (!window.confirm('Remove this user?')) return; try { await userApi.remove(id); await load(); } catch (requestError) { setError(requestError.message); } };
    const filtered = users.filter((user) => `${user.name} ${user.email}`.toLowerCase().includes(search.toLowerCase()));
    return <div><div style={{ marginBottom: '2rem' }}><h1 className="page-title">Manage Users</h1><p className="page-sub">Students and teachers registered on your platform.</p></div>{error && <p style={{ color: '#b91c1c' }}>{error}</p>}<div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}><div><button className={`chip${role === 'student' ? ' active' : ''}`} onClick={() => setRole('student')}>Students</button><button className={`chip${role === 'teacher' ? ' active' : ''}`} onClick={() => setRole('teacher')}>Teachers</button></div><div style={{ position: 'relative' }}><FiSearch size={15} style={{ position: 'absolute', top: '50%', left: 12, transform: 'translateY(-50%)' }} /><input className="form-input" style={{ paddingLeft: 36 }} value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search users" /></div></div><div className="table-wrap"><table className="data-table"><thead><tr><th>Name</th><th>Email</th><th>{role === 'student' ? 'Courses' : 'Subject'}</th><th>Joined</th><th /></tr></thead><tbody>{filtered.map((user) => <tr key={user._id}><td>{user.name}</td><td>{user.email}</td><td>{role === 'student' ? `${user.enrollmentCount || 0} courses` : user.subject || '—'}</td><td>{new Date(user.createdAt).toLocaleDateString()}</td><td><button className="btn-outline" style={{ color: '#b91c1c' }} onClick={() => remove(user._id)}><FiTrash2 size={15} /></button></td></tr>)}</tbody></table></div></div>;
}
