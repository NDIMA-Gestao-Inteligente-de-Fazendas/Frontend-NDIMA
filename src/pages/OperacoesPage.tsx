import { useState, useEffect } from 'react';
import {
    CalendarCheck, Plus, CheckCircle2,
    Calendar, Tractor, AlertCircle, Search, Filter, Loader2, Trash2
} from 'lucide-react';
import * as tasksService from '../services/tasksService';
import type { APITask } from '../services/tasksService';

export default function OperacoesPage() {
    const [tasks, setTasks] = useState<APITask[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<'Todas' | 'Pendentes' | 'Concluídas'>('Todas');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Fetch tasks on mount
    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            setIsLoading(true);
            const data = await tasksService.getTasks();
            setTasks(data);
            setError(null);
        } catch (err: any) {
            setError(err.message || 'Erro ao carregar tarefas.');
        } finally {
            setIsLoading(false);
        }
    };

    // Filtered lists
    const filteredTasks = tasks.filter(t => {
        const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase());
        const isCompleted = t.status === 'CONCLUIDA';
        const matchesStatus = filterStatus === 'Todas' ? true :
            filterStatus === 'Pendentes' ? !isCompleted : isCompleted;
        return matchesSearch && matchesStatus;
    });

    const pendingTasks = filteredTasks.filter(t => t.status !== 'CONCLUIDA');
    const completedTasks = filteredTasks.filter(t => t.status === 'CONCLUIDA');

    const toggleTask = async (id: string, currentStatus: string) => {
        try {
            const newStatus = currentStatus === 'CONCLUIDA' ? 'PENDENTE' : 'CONCLUIDA';
            // Optimistic UI update
            setTasks(prev => prev.map(t => t._id === id ? { ...t, status: newStatus } : t));

            await tasksService.updateTask(id, { status: newStatus });
        } catch (err: any) {
            // Revert on error
            console.error("Failed to update task", err);
            fetchTasks();
            alert('Erro ao atualizar a tarefa.');
        }
    };

    const deleteTask = async (id: string) => {
        if (!confirm('Tem a certeza que deseja eliminar esta tarefa?')) return;
        try {
            setTasks(prev => prev.filter(t => t._id !== id));
            await tasksService.deleteTask(id);
        } catch (err: any) {
            console.error("Failed to delete task", err);
            fetchTasks();
            alert('Erro ao eliminar a tarefa.');
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'OPERACAO': return { bg: '#d1fae5', text: '#059669', label: 'Plantio' };
            case 'ADUBAGEM': return { bg: '#e0f2fe', text: '#0284c7', label: 'Adubação' };
            case 'COLHEITA': return { bg: '#fef3c7', text: '#d97706', label: 'Colheita' };
            case 'TAREFA': return { bg: '#f3f4f6', text: '#4b5563', label: 'Manutenção' };
            case 'IRRIGACAO': return { bg: '#cffafe', text: '#0891b2', label: 'Irrigação' };
            default: return { bg: '#f3e8ff', text: '#9333ea', label: 'Outro' };
        }
    };

    // FORM STATE
    // Note: Priority and Assignee are kept in UI state but not sent to backend as they are not supported by the API yet.
    const [newTask, setNewTask] = useState({
        title: '', description: '', date: '', type: 'OUTRO' as APITask['type'], priority: 'Média', assignee: ''
    });

    const handleCreateTask = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTask.title || !newTask.date) return;

        try {
            setIsSubmitting(true);
            const createdTask = await tasksService.createTask({
                title: newTask.title,
                description: newTask.description || undefined,
                type: newTask.type,
                dataPrevista: new Date(newTask.date).toISOString()
            });

            setTasks(prev => [...prev, createdTask]);
            setIsModalOpen(false);
            setNewTask({ title: '', description: '', date: '', type: 'OUTRO', priority: 'Média', assignee: '' });
        } catch (err: any) {
            alert(err.message || 'Erro ao criar tarefa.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh]">
                <Loader2 className="h-10 w-10 text-[#1A4D2E] animate-spin mb-4" />
                <p className="text-gray-500">A carregar operações...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center">
                <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
                <h2 className="text-xl font-bold text-gray-800 mb-2">Erro ao carregar dados</h2>
                <p className="text-gray-500 mb-4">{error}</p>
                <button onClick={fetchTasks} className="px-4 py-2 bg-[#1A4D2E] text-white rounded-lg hover:bg-[#123520] transition-colors">
                    Tentar Novamente
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-[1200px] mx-auto font-['Inter']">
            {/* ── HEADER ── */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-[#111827] font-['Outfit'] mb-2">Operações & Tarefas</h1>
                    <p className="text-[#6B7280]">Gestão diária de atividades da fazenda</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-[#1A4D2E] text-white rounded-xl font-semibold hover:bg-[#123520] transition-colors shadow-sm"
                    >
                        <Plus size={18} /> Nova Tarefa
                    </button>
                </div>
            </div>

            {/* ── FILTERS ── */}
            <div className="bg-white p-4 rounded-xl border border-[#E9EEE9] shadow-sm mb-6 flex flex-col sm:flex-row gap-4 justify-between items-center">
                <div className="relative w-full sm:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Pesquisar tarefas..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A4D2E]/20 focus:border-[#1A4D2E] transition-all"
                    />
                </div>
                <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
                    <Filter size={16} className="text-gray-400 mr-1 hidden sm:block" />
                    {(['Todas', 'Pendentes', 'Concluídas'] as const).map(status => (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            className={`px-4 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${filterStatus === status
                                ? 'bg-[#1A4D2E] text-white'
                                : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
                                }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>
            <br />
            {/* ── KANBAN / LIST ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 outline-none">

                {/* Pending Tasks Column */}
                <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between pb-2 border-b-2 border-orange-200">
                        <div className="flex items-center gap-2">
                            <ClockIcon className="text-orange-500" />
                            <h2 className="font-bold text-lg text-gray-800 font-['Outfit']">Pendentes</h2>
                        </div>
                        <span className="bg-orange-100 text-orange-700 font-bold px-2.5 py-0.5 rounded-full text-sm">
                            {pendingTasks.length}
                        </span>
                    </div>

                    {pendingTasks.length === 0 ? (
                        <div className="py-12 text-center text-gray-400 bg-white/50 border border-dashed border-gray-300 rounded-xl">
                            <CalendarCheck size={32} className="mx-auto mb-3 opacity-50" />
                            <p>Nenhuma tarefa pendente encontrada</p>
                        </div>
                    ) : (
                        pendingTasks.map(t => <TaskCard key={t._id} task={t} toggleTask={toggleTask} deleteTask={deleteTask} getTypeColor={getTypeColor} />)
                    )}
                </div>

                {/* Completed Tasks Column */}
                <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between pb-2 border-b-2 border-green-200">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="text-green-500" size={20} />
                            <h2 className="font-bold text-lg text-gray-800 font-['Outfit']">Concluídas</h2>
                        </div>
                        <span className="bg-green-100 text-green-700 font-bold px-2.5 py-0.5 rounded-full text-sm">
                            {completedTasks.length}
                        </span>
                    </div>

                    {completedTasks.length === 0 ? (
                        <div className="py-12 text-center text-gray-400 bg-white/50 border border-dashed border-gray-300 rounded-xl">
                            <Tractor size={32} className="mx-auto mb-3 opacity-50" />
                            <p>Nenhuma tarefa concluída</p>
                        </div>
                    ) : (
                        completedTasks.map(t => <TaskCard key={t._id} task={t} toggleTask={toggleTask} deleteTask={deleteTask} getTypeColor={getTypeColor} />)
                    )}
                </div>

            </div>

            {/* ── CREATE TASK MODAL ── */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex justify-center items-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden font-['Inter'] flex flex-col max-h-[90vh]">

                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <div>
                                <h2 className="text-xl font-bold text-[#111827] font-['Outfit']">Nova Tarefa</h2>
                                <p className="text-xs text-gray-500 mt-1">Registe uma nova operação na fazenda</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-700 transition-colors p-2 hover:bg-gray-100 rounded-lg">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
                            </button>
                        </div>

                        <form onSubmit={handleCreateTask} className="p-6 flex flex-col gap-5 overflow-y-auto">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Título da Tarefa *</label>
                                <input
                                    type="text" required
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1A4D2E]/20 focus:border-[#1A4D2E] transition-all bg-white"
                                    placeholder="Ex: Pulverização do Talhão 4"
                                    value={newTask.title} onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Descrição (Detalhes)</label>
                                <textarea
                                    rows={3}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1A4D2E]/20 focus:border-[#1A4D2E] transition-all bg-white resize-none"
                                    placeholder="Equipamentos necessários, instruções, etc."
                                    value={newTask.description} onChange={e => setNewTask({ ...newTask, description: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Data Prevista *</label>
                                    <input
                                        type="date" required
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1A4D2E]/20 focus:border-[#1A4D2E] transition-all bg-white"
                                        value={newTask.date} onChange={e => setNewTask({ ...newTask, date: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Prioridade (Opcional)</label>
                                    <select
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1A4D2E]/20 focus:border-[#1A4D2E] transition-all bg-white appearance-none"
                                        value={newTask.priority} onChange={e => setNewTask({ ...newTask, priority: e.target.value })}
                                    >
                                        <option value="Alta">Alta</option>
                                        <option value="Média">Média</option>
                                        <option value="Baixa">Baixa</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tipo de Operação</label>
                                    <select
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1A4D2E]/20 focus:border-[#1A4D2E] transition-all bg-white appearance-none"
                                        value={newTask.type} onChange={e => setNewTask({ ...newTask, type: e.target.value as any })}
                                    >
                                        <option value="OPERACAO">Plantio / Operação</option>
                                        <option value="ADUBAGEM">Adubação</option>
                                        <option value="COLHEITA">Colheita</option>
                                        <option value="IRRIGACAO">Irrigação</option>
                                        <option value="TAREFA">Manutenção de Máquinas</option>
                                        <option value="OUTRO">Outro</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Responsável (N/D)</label>
                                    <input
                                        type="text"
                                        placeholder="Usa apenas localmente"
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed"
                                        disabled
                                        title="Não suportado pela API atualmente"
                                    />
                                </div>
                            </div>

                            <div className="mt-4 flex gap-3">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors" disabled={isSubmitting}>
                                    Cancelar
                                </button>
                                <button type="submit" className="flex-[2] py-3 px-4 flex justify-center items-center bg-[#F7C04A] text-[#123520] font-bold rounded-xl hover:bg-[#eab308] hover:shadow-md transition-all disabled:opacity-70 disabled:cursor-not-allowed" disabled={isSubmitting}>
                                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Criar Tarefa'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

// Sub-components

function ClockIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
        </svg>
    )
}

function TaskCard({ task, toggleTask, deleteTask, getTypeColor }: { task: APITask, toggleTask: any, deleteTask: any, getTypeColor: any }) {
    const tColor = getTypeColor(task.type);
    const isCompleted = task.status === 'CONCLUIDA';

    return (
        <div className={`
            bg-white border rounded-xl p-4 shadow-sm transition-all duration-200 relative group
            ${isCompleted ? 'border-gray-100 opacity-75' : 'border-gray-200 hover:shadow-md hover:border-[#1A4D2E]/30'}
        `}>
            <button
                onClick={() => deleteTask(task._id)}
                className="absolute top-4 right-4 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                title="Eliminar tarefa"
            >
                <Trash2 size={16} />
            </button>
            <div className="flex gap-4">
                {/* Checbox column */}
                <div className="pt-1">
                    <button
                        onClick={() => toggleTask(task._id, task.status)}
                        className={`w-6 h-6 flex items-center justify-center rounded-full border-2 transition-colors
                            ${isCompleted ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 text-transparent hover:border-[#1A4D2E]'}
                        `}
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </button>
                </div>

                {/* Content column */}
                <div className="flex-1 min-w-0 pr-6">
                    <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className={`font-semibold text-base leading-tight truncate ${isCompleted ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                            {task.title}
                        </h3>
                    </div>

                    {task.description && (
                        <p className={`text-sm mb-3 line-clamp-2 ${isCompleted ? 'text-gray-400' : 'text-gray-600'}`}>
                            {task.description}
                        </p>
                    )}

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-auto">
                        <span className="flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-md"
                            style={{ backgroundColor: tColor.bg, color: tColor.text }}>
                            {tColor.label}
                        </span>

                        <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100">
                            <Calendar size={12} className="text-gray-400" />
                            {new Date(task.dataPrevista).toLocaleDateString('pt-AO', { day: '2-digit', month: 'short' })}
                        </div>

                        {isCompleted && task.dataConclusao && (
                            <div className="flex items-center gap-1.5 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-md border border-green-100">
                                <CheckCircle2 size={12} />
                                Concluída em: {new Date(task.dataConclusao).toLocaleDateString('pt-AO', { day: '2-digit', month: 'short' })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
