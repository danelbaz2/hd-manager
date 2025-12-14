import React, { useState, useEffect, useRef } from 'react';
import {
    User,
    ChevronLeft,
    ChevronRight,
    Settings,
    Moon,
    Sun,
    LogOut,
    Home,
    List,
    MessageCircle,
    PieChart,
    FileText,
    Layers,
    LayoutGrid,
    AlignJustify,
    CheckCircle2,
    Clock,
    AlertCircle,
    Calendar as CalendarIcon,
    Flag,
    X,
    MoreHorizontal,
    ArrowRight,
    Search,
    Filter,
    CalendarDays,
    CalendarRange,
    Plus,
    Users,
    History,
    FileEdit,
    MessageSquare,
    Info,
    Tag
} from 'lucide-react';

// --- Constants & Helpers ---

const HEBREW_MONTHS = [
    'ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני',
    'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'
];

const HEBREW_DAYS_SHORT = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'];
const HEBREW_DAYS_FULL = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];

const getRelativeDate = (diffDays) => {
    const date = new Date();
    date.setDate(date.getDate() + diffDays);
    return date.toISOString().split('T')[0];
};

const formatDateHebrew = (date) => {
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';
    const dayName = HEBREW_DAYS_FULL[d.getDay()];
    const day = d.getDate();
    const month = d.getMonth() + 1;
    return `${dayName}, ${day}.${month}`;
};

const formatWeekRange = (date) => {
    const start = new Date(date);
    const day = start.getDay();
    start.setDate(start.getDate() - day);

    const end = new Date(start);
    end.setDate(start.getDate() + 6);

    const format = (d) => `${d.getDate()}.${d.getMonth() + 1}`;
    return `${format(start)} - ${format(end)}`;
};

const getStatusLabel = (s) => {
    switch (s) {
        case 'open': return 'פתוח';
        case 'in_progress': return 'בטיפול';
        case 'closed': return 'סגור';
        default: return s;
    }
};

// --- Data ---

const TAGS = [
    { id: 'tag1', label: 'פיתוח', color: 'bg-blue-100 text-blue-700 border-blue-200' },
    { id: 'tag2', label: 'עיצוב', color: 'bg-purple-100 text-purple-700 border-purple-200' },
    { id: 'tag3', label: 'בדיקות', color: 'bg-orange-100 text-orange-700 border-orange-200' },
    { id: 'tag4', label: 'שרתים', color: 'bg-slate-100 text-slate-700 border-slate-200' },
    { id: 'tag5', label: 'ניהול', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    { id: 'tag6', label: 'דחיפות גבוהה', color: 'bg-red-100 text-red-700 border-red-200' },
];

const USERS = [
    { id: 1, name: 'מאור', role: 'מנהל מערכת', iconColor: 'bg-blue-100 text-blue-600' },
    { id: 2, name: 'עילי', role: 'משתמש', iconColor: 'bg-indigo-100 text-indigo-600' },
    { id: 3, name: 'דן', role: 'בוט', iconColor: 'bg-cyan-100 text-cyan-600' },
    { id: 4, name: 'אוראל', role: 'אבטחה', iconColor: 'bg-rose-100 text-rose-600' },
    { id: 5, name: 'אורי', role: 'נינג׳ה', iconColor: 'bg-sky-100 text-sky-600' },
    { id: 6, name: 'עדן', role: 'בוגר', iconColor: 'bg-teal-100 text-teal-600' },
    { id: 7, name: 'גל', role: 'הגדרות', iconColor: 'bg-violet-100 text-violet-600' },
    { id: 8, name: 'עדי', role: 'עריכה', iconColor: 'bg-fuchsia-100 text-fuchsia-600' },
    { id: 9, name: 'אליה', role: 'בדיקות', iconColor: 'bg-lime-100 text-lime-600' },
];

const INITIAL_MISSIONS = [
    {
        id: 'MS-101',
        title: 'בדיקת שרתים שבועית',
        description: 'בדיקה מקיפה של שרתי ה-Production וה-Staging לוודא יציבות לאחר העדכון האחרון.',
        status: 'in_progress',
        responsibleUsersId: [1],
        participantsIds: [4, 3],
        tagId: 'tag4',
        date: getRelativeDate(0),
        deadline: getRelativeDate(2),
        createdAt: getRelativeDate(-2),
        updatedAt: getRelativeDate(0),
        priority: 'high'
    },
    {
        id: 'MS-102',
        title: 'עדכון מסד נתונים',
        description: 'הרצת סקריפטים של מיגרציה לטבלאות המשתמשים החדשות.',
        status: 'open',
        responsibleUsersId: [2],
        participantsIds: [1],
        tagId: 'tag1',
        date: getRelativeDate(1),
        deadline: getRelativeDate(1),
        createdAt: getRelativeDate(-1),
        updatedAt: getRelativeDate(-1),
        priority: 'medium'
    },
    {
        id: 'MS-103',
        title: 'סנכרון תהליכים',
        description: 'וידוא סנכרון תהליכי הרקע בין השרתים השונים.',
        status: 'closed',
        responsibleUsersId: [3],
        participantsIds: [],
        tagId: 'tag4',
        date: getRelativeDate(-2),
        deadline: getRelativeDate(-2),
        createdAt: getRelativeDate(-5),
        updatedAt: getRelativeDate(-2),
        priority: 'low'
    },
    {
        id: 'MS-104',
        title: 'סריקת וירוסים',
        description: 'ביצוע סריקה ידנית לאיתור נוזקות בשרת הקבצים.',
        status: 'open',
        responsibleUsersId: [4],
        participantsIds: [1, 5],
        tagId: 'tag6',
        date: getRelativeDate(1),
        deadline: getRelativeDate(3),
        createdAt: getRelativeDate(0),
        updatedAt: getRelativeDate(0),
        priority: 'high'
    },
    {
        id: 'MS-105',
        title: 'אופטימיזציה לקוד',
        description: 'שיפור ביצועים במודול הליבה של המערכת.',
        status: 'in_progress',
        responsibleUsersId: [5],
        participantsIds: [2],
        tagId: 'tag1',
        date: getRelativeDate(0),
        deadline: getRelativeDate(4),
        createdAt: getRelativeDate(-3),
        updatedAt: getRelativeDate(-1),
        priority: 'medium'
    },
    {
        id: 'MS-106',
        title: 'כתיבת תיעוד',
        description: 'כתיבת מסמכי אפיון ותיעוד טכני עבור ה-API החדש.',
        status: 'closed',
        responsibleUsersId: [6],
        participantsIds: [8],
        tagId: 'tag5',
        date: getRelativeDate(-5),
        deadline: getRelativeDate(-3),
        createdAt: getRelativeDate(-10),
        updatedAt: getRelativeDate(-3),
        priority: 'low'
    }
];

const MENU_ITEMS = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'missions', label: 'Missions', icon: List },
    { id: 'chat', label: 'Chat', icon: MessageCircle },
    { id: 'stats', label: 'Stats', icon: PieChart },
    { id: 'reports', label: 'Reports', icon: FileText },
];

const SEARCH_TYPES = [
    { id: 'all', label: 'חיפוש חופשי' },
    { id: 'title', label: 'כותרת משימה' },
    { id: 'status', label: 'סטטוס' },
    { id: 'tag', label: 'תגית' },
];

const getUserById = (id) => USERS.find(u => u.id === parseInt(id));
const getTagById = (id) => TAGS.find(t => t.id === id);

// --- Components ---

// *** WeeklyCalendar Component ***
const WeeklyCalendar = ({ currentDate, tasks, isDarkMode, onTaskClick }) => {
    // 1. Define window: Find the Sunday of the week containing currentDate
    const startWindow = new Date(currentDate);
    const dayOfWeek = startWindow.getDay(); // 0 is Sunday
    const diffToSunday = startWindow.getDate() - dayOfWeek;
    startWindow.setDate(diffToSunday);
    startWindow.setHours(0, 0, 0, 0);

    // End date is 6 days after Sunday (Saturday)
    const endWindow = new Date(startWindow);
    endWindow.setDate(startWindow.getDate() + 6);
    endWindow.setHours(23, 59, 59, 999);

    // 2. Generate the 7 days array for the header (Sunday to Saturday)
    const weekDays = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(startWindow);
        d.setDate(startWindow.getDate() + i);
        return d;
    });

    // 3. Filter tasks that visually overlap with this specific 7-day window
    const weekTasks = tasks.filter(task => {
        const taskStart = new Date(task.date);
        const taskEnd = task.deadline ? new Date(task.deadline) : new Date(taskStart);

        // Normalize times to ensure full day overlap coverage
        taskStart.setHours(0, 0, 0, 0);
        taskEnd.setHours(23, 59, 59, 999);

        return taskStart <= endWindow && taskEnd >= startWindow;
    });

    // 4. Calculate Grid Positions relative to the startWindow (Sunday)
    const getGridPosition = (task) => {
        const taskStart = new Date(task.date);
        const taskEnd = task.deadline ? new Date(task.deadline) : new Date(taskStart);

        // Normalize
        taskStart.setHours(0, 0, 0, 0);
        taskEnd.setHours(0, 0, 0, 0);

        // Visual Start: If task starts before window, clip it to start of window
        const visualStart = taskStart < startWindow ? new Date(startWindow) : new Date(taskStart);

        // Visual End: If task ends after window, clip it to end of window (normalized to midnight for diff calc)
        const endWindowMidnight = new Date(endWindow);
        endWindowMidnight.setHours(0, 0, 0, 0);
        const visualEnd = taskEnd > endWindowMidnight ? endWindowMidnight : new Date(taskEnd);

        // Calculate column start (1-based index)
        // Difference in days between visual start and window start
        const diffTime = visualStart - startWindow;
        const startOffset = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        // Calculate duration
        const durationTime = visualEnd - visualStart;
        const durationDays = Math.floor(durationTime / (1000 * 60 * 60 * 24)) + 1;

        return {
            colStart: startOffset + 1,
            colSpan: Math.max(1, durationDays)
        };
    };

    // Sort by visual start column for better packing
    const processedTasks = weekTasks.map(t => ({ ...t, ...getGridPosition(t) })).sort((a, b) => a.colStart - b.colStart);

    // Layout algorithm to assign rows (y-axis) without overlap
    const rows = [];
    processedTasks.forEach(task => {
        let rowIndex = 0;
        while (true) {
            const isOccupied = rows[rowIndex]?.some(t => {
                const tEnd = t.colStart + t.colSpan;
                const taskEnd = task.colStart + task.colSpan;
                return (task.colStart < tEnd && taskEnd > t.colStart);
            });

            if (!isOccupied) {
                if (!rows[rowIndex]) rows[rowIndex] = [];
                rows[rowIndex].push(task);
                task.visualRow = rowIndex;
                break;
            }
            rowIndex++;
        }
    });

    return (
        <div className={`h-full flex flex-col rounded-2xl border overflow-hidden shadow-sm ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
            {/* Calendar Header - Sticky */}
            <div className={`grid grid-cols-7 border-b divide-x divide-x-reverse sticky top-0 z-20 ${isDarkMode ? 'border-slate-700 divide-slate-700 bg-slate-800' : 'border-slate-100 divide-slate-100 bg-white'}`}>
                {weekDays.map((date, i) => {
                    const isToday = new Date().toDateString() === date.toDateString();
                    return (
                        <div key={i} className={`p-3 text-center transition-colors ${isToday ? (isDarkMode ? 'bg-blue-900/20' : 'bg-blue-50/50') : ''}`}>
                            <div className={`text-xs font-bold mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                {HEBREW_DAYS_FULL[date.getDay()]}
                            </div>
                            <div className={`text-sm font-bold ${isToday ? 'text-blue-600 scale-110 transform' : (isDarkMode ? 'text-white' : 'text-slate-900')}`}>
                                {date.getDate()}/{date.getMonth() + 1}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Calendar Body */}
            <div className="flex-1 relative overflow-y-auto custom-scrollbar p-2">
                {/* Background Grid Lines */}
                <div className="absolute inset-0 grid grid-cols-7 pointer-events-none">
                    {[...Array(7)].map((_, i) => (
                        <div key={i} className={`border-l border-r border-dashed border-opacity-30 h-full first:border-r-0 last:border-l-0 ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`}></div>
                    ))}
                </div>

                {/* Tasks Grid */}
                <div
                    className="grid grid-cols-7 gap-y-2 relative z-10"
                    style={{ gridAutoRows: 'minmax(45px, auto)' }}
                >
                    {processedTasks.map(task => {
                        const responsible = task.responsibleUsersId && task.responsibleUsersId.length > 0 ? getUserById(task.responsibleUsersId[0]) : null;
                        return (
                            <div
                                key={task.id}
                                onClick={() => onTaskClick(task)}
                                className={`mx-1 p-2 rounded-lg border shadow-sm cursor-pointer hover:shadow-md hover:translate-y-[-1px] transition-all flex flex-col justify-center relative group overflow-hidden ${isDarkMode ? 'bg-slate-700 border-slate-600' : 'bg-white border-slate-200'
                                    }`}
                                style={{
                                    gridColumnStart: task.colStart,
                                    gridColumnEnd: `span ${task.colSpan}`,
                                    gridRowStart: task.visualRow + 1
                                }}
                            >
                                {/* Status Bar */}
                                <div className={`absolute top-0 bottom-0 right-0 w-1.5 ${task.status === 'open' ? 'bg-emerald-500' :
                                        task.status === 'in_progress' ? 'bg-amber-500' : 'bg-slate-400'
                                    }`}></div>

                                <div className="pr-3 flex items-center justify-between">
                                    <span className={`text-xs font-bold truncate ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                                        {task.title}
                                    </span>
                                </div>

                                <div className="pr-3 flex items-center gap-2 mt-1">
                                    {responsible && (
                                        <div className={`flex items-center gap-1 text-[10px] ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                            <User size={10} />
                                            <span className="truncate max-w-[80px]">{responsible.name}</span>
                                        </div>
                                    )}
                                    {task.priority === 'high' && <Flag size={10} className="text-red-500 flex-shrink-0" fill="currentColor" />}
                                </div>
                            </div>
                        )
                    })}
                </div>

                {processedTasks.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-48 text-slate-400 opacity-60">
                        <CalendarRange size={48} className="mb-2" />
                        <p>אין משימות לשבוע זה</p>
                    </div>
                )}
            </div>
        </div>
    );
};

// ... Rest of components ...

const CreateMissionModal = ({ isOpen, onClose, isDarkMode, users, onCreate }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        responsibleUsersId: [],
        participantsIds: [],
        tagId: '',
        status: 'open',
        priority: 'medium',
        date: new Date().toISOString().split('T')[0],
        deadline: ''
    });

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        const newMission = {
            ...formData,
            id: `MS-${Math.floor(Math.random() * 10000)}`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        onCreate(newMission);
        onClose();
    };

    const toggleUserSelection = (field, userId) => {
        setFormData(prev => {
            const current = prev[field];
            const updated = current.includes(userId)
                ? current.filter(id => id !== userId)
                : [...current, userId];
            return { ...prev, [field]: updated };
        });
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity" onClick={onClose} />

            <div className={`relative w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh] ${isDarkMode ? 'bg-slate-800 text-white' : 'bg-white text-slate-900'
                }`}>
                <div className={`p-6 border-b flex justify-between items-center flex-shrink-0 ${isDarkMode ? 'border-slate-700' : 'border-slate-100'}`}>
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Plus className="text-blue-500" />
                        יצירת משימה חדשה
                    </h2>
                    <button onClick={onClose} className={`p-1 rounded-full transition-colors ${isDarkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-100'}`}>
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="md:col-span-2 space-y-2">
                                <label className="text-sm font-bold opacity-70">כותרת המשימה</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="לדוגמה: עדכון שרתי בסיס נתונים"
                                    className={`w-full p-3 rounded-xl border outline-none focus:ring-2 focus:ring-blue-500/20 ${isDarkMode ? 'bg-slate-900/50 border-slate-700' : 'bg-slate-50 border-slate-200'
                                        }`}
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold opacity-70">דחיפות</label>
                                <select
                                    className={`w-full p-3 rounded-xl border outline-none cursor-pointer ${isDarkMode ? 'bg-slate-900/50 border-slate-700' : 'bg-slate-50 border-slate-200'
                                        }`}
                                    value={formData.priority}
                                    onChange={e => setFormData({ ...formData, priority: e.target.value })}
                                >
                                    <option value="low">נמוכה</option>
                                    <option value="medium">בינונית</option>
                                    <option value="high">גבוהה</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold opacity-70">תיאור חופשי</label>
                            <textarea
                                rows={3}
                                placeholder="פרט את דרישות המשימה..."
                                className={`w-full p-3 rounded-xl border outline-none focus:ring-2 focus:ring-blue-500/20 resize-none ${isDarkMode ? 'bg-slate-900/50 border-slate-700' : 'bg-slate-50 border-slate-200'
                                    }`}
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-bold opacity-70">תגית ראשית</label>
                                <select
                                    className={`w-full p-3 rounded-xl border outline-none cursor-pointer ${isDarkMode ? 'bg-slate-900/50 border-slate-700' : 'bg-slate-50 border-slate-200'
                                        }`}
                                    value={formData.tagId}
                                    onChange={e => setFormData({ ...formData, tagId: e.target.value })}
                                >
                                    <option value="">בחר תגית...</option>
                                    {TAGS.map(tag => (
                                        <option key={tag.id} value={tag.id}>{tag.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold opacity-70">תאריך התחלה</label>
                                <input
                                    type="date"
                                    className={`w-full p-3 rounded-xl border outline-none ${isDarkMode ? 'bg-slate-900/50 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'
                                        }`}
                                    value={formData.date}
                                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-bold opacity-70">תאריך יעד (Deadline)</label>
                                <input
                                    type="date"
                                    className={`w-full p-3 rounded-xl border outline-none ${isDarkMode ? 'bg-slate-900/50 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'
                                        }`}
                                    value={formData.deadline}
                                    onChange={e => setFormData({ ...formData, deadline: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-bold opacity-70">אחראים</label>
                            <div className={`p-3 rounded-xl border min-h-[80px] max-h-[120px] overflow-y-auto grid grid-cols-2 sm:grid-cols-4 gap-2 ${isDarkMode ? 'bg-slate-900/50 border-slate-700' : 'bg-slate-50 border-slate-200'
                                }`}>
                                {users.map(u => {
                                    const isSelected = formData.responsibleUsersId.includes(u.id);
                                    return (
                                        <div
                                            key={u.id}
                                            onClick={() => toggleUserSelection('responsibleUsersId', u.id)}
                                            className={`flex items-center gap-2 p-1.5 rounded-lg cursor-pointer transition-all border select-none ${isSelected
                                                    ? 'bg-blue-500 text-white border-blue-600 shadow-sm'
                                                    : isDarkMode ? 'bg-slate-800 border-slate-700 hover:bg-slate-700' : 'bg-white border-slate-200 hover:bg-slate-100'
                                                }`}
                                        >
                                            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${u.iconColor} bg-white/90`}>
                                                <User size={10} />
                                            </div>
                                            <span className="text-xs font-bold truncate">{u.name}</span>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </form>
                </div>

                <div className={`p-4 bg-opacity-50 flex justify-end gap-3 flex-shrink-0 ${isDarkMode ? 'bg-slate-900/30' : 'bg-slate-50'
                    }`}>
                    <button onClick={onClose} className={`px-6 py-2 rounded-xl text-sm font-bold ${isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}>
                        ביטול
                    </button>
                    <button onClick={handleSubmit} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/20 flex items-center gap-2">
                        <Plus size={16} />
                        צור משימה
                    </button>
                </div>
            </div>
        </div>
    );
};

const CustomDatePicker = ({ selectedDate, onSelect, onClose, isDarkMode }) => {
    const [currentViewDate, setCurrentViewDate] = useState(new Date(selectedDate));

    const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

    const handlePrevMonth = () => {
        setCurrentViewDate(new Date(currentViewDate.getFullYear(), currentViewDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentViewDate(new Date(currentViewDate.getFullYear(), currentViewDate.getMonth() + 1, 1));
    };

    const handleDayClick = (day) => {
        const newDate = new Date(currentViewDate.getFullYear(), currentViewDate.getMonth(), day);
        onSelect(newDate);
        onClose();
    };

    const year = currentViewDate.getFullYear();
    const month = currentViewDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startDay = new Date(year, month, 1).getDay();

    const blanks = Array(startDay).fill(null);
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const totalSlots = [...blanks, ...days];

    return (
        <div className={`absolute top-full mt-4 left-1/2 transform -translate-x-1/2 w-72 rounded-xl shadow-2xl border p-4 animate-in fade-in zoom-in-95 duration-200 ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-800'
            }`}>
            <div className="flex items-center justify-between mb-4">
                <button onClick={handleNextMonth} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors">
                    <ChevronRight size={20} />
                </button>
                <div className="font-bold text-lg">
                    {HEBREW_MONTHS[month]} {year}
                </div>
                <button onClick={handlePrevMonth} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors">
                    <ChevronLeft size={20} />
                </button>
            </div>
            <div className="grid grid-cols-7 mb-2 text-center">
                {HEBREW_DAYS_SHORT.map((day, i) => (
                    <div key={i} className={`text-xs font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                        {day}
                    </div>
                ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
                {totalSlots.map((day, index) => {
                    if (!day) return <div key={index} className="h-8"></div>;
                    return (
                        <button
                            key={index}
                            onClick={() => handleDayClick(day)}
                            className={`h-8 w-8 rounded-full flex items-center justify-center text-sm transition-all relative ${isDarkMode ? 'hover:bg-slate-700 text-slate-200' : 'hover:bg-blue-50 text-slate-700'
                                }`}
                        >
                            {day}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

const MissionModal = ({ mission, isOpen, onClose, isDarkMode }) => {
    const [activeTab, setActiveTab] = useState('details');

    if (!isOpen || !mission) return null;

    const mockHistory = [
        { id: 1, type: 'create', user: 'מאור', role: 'מנהל', date: mission.createdAt ? new Date(mission.createdAt).toLocaleString('he-IL') : '', text: 'יצר את המשימה' },
        { id: 4, type: 'update', user: 'מאור', role: 'מנהל', date: mission.updatedAt ? new Date(mission.updatedAt).toLocaleString('he-IL') : '', text: 'עודכן לאחרונה' },
    ];

    const tag = getTagById(mission.tagId);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm transition-opacity" onClick={onClose} />
            <div className={`relative w-full max-w-md rounded-2xl shadow-2xl overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[85vh] ${isDarkMode ? 'bg-slate-800 text-white' : 'bg-white text-slate-900'}`}>
                <button onClick={onClose} className={`absolute top-3 left-3 z-30 p-1.5 rounded-full transition-all ${isDarkMode ? 'bg-black/20 hover:bg-black/40 text-white' : 'bg-white/50 hover:bg-white text-slate-800 shadow-sm'}`}>
                    <X size={18} />
                </button>
                <div className={`relative flex items-center w-full border-b ${isDarkMode ? 'border-slate-700 bg-slate-800/50' : 'border-slate-100 bg-slate-50/80'}`}>
                    <button onClick={() => setActiveTab('details')} className={`flex-1 py-4 text-sm font-bold transition-all relative outline-none z-10 ${activeTab === 'details' ? (isDarkMode ? 'text-blue-400' : 'text-blue-600') : (isDarkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-800')}`}>
                        פרטי משימה
                        {activeTab === 'details' && <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-blue-600 dark:bg-blue-400 rounded-t-full shadow-[0_-2px_10px_rgba(37,99,235,0.3)]"></span>}
                    </button>
                    <button onClick={() => setActiveTab('history')} className={`flex-1 py-4 text-sm font-bold transition-all relative outline-none z-10 ${activeTab === 'history' ? (isDarkMode ? 'text-blue-400' : 'text-blue-600') : (isDarkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-800')}`}>
                        היסטוריה
                        {activeTab === 'history' && <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-blue-600 dark:bg-blue-400 rounded-t-full shadow-[0_-2px_10px_rgba(37,99,235,0.3)]"></span>}
                    </button>
                </div>
                <div className="px-6 py-5 flex-shrink-0">
                    <div className="flex items-center gap-3 mb-2">
                        <span className={`text-xs font-mono font-medium ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>{mission.id}</span>
                        {tag && <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${tag.color}`}>{tag.label}</span>}
                    </div>
                    <h2 className="text-2xl font-bold leading-tight">{mission.title}</h2>
                </div>
                <div className="px-6 pb-6 overflow-y-auto custom-scrollbar flex-1">
                    {activeTab === 'details' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className={`flex justify-between items-center p-3 rounded-xl border ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                                <span className="text-sm font-bold opacity-70">סטטוס נוכחי</span>
                                <span className={`text-xs font-bold px-3 py-1 rounded-full border ${isDarkMode ? 'bg-slate-900 border-slate-600' : 'bg-white border-slate-200 shadow-sm'}`}>
                                    {getStatusLabel(mission.status)}
                                </span>
                            </div>
                            <div>
                                <h3 className={`text-sm font-bold mb-2 flex items-center gap-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}><FileText size={16} /> תיאור המשימה</h3>
                                <p className="leading-relaxed opacity-90 text-sm">{mission.description || 'אין תיאור זמין.'}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className={`p-3 rounded-xl border ${isDarkMode ? 'bg-slate-900/50 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                                    <div className="flex items-center gap-2 mb-1 opacity-70"><CalendarIcon size={14} /><span className="text-xs font-bold">תאריך התחלה</span></div>
                                    <p className="font-mono text-sm font-bold">{mission.date}</p>
                                </div>
                                <div className={`p-3 rounded-xl border ${isDarkMode ? 'bg-slate-900/50 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                                    <div className="flex items-center gap-2 mb-1 opacity-70"><Flag size={14} /><span className="text-xs font-bold">תאריך יעד</span></div>
                                    <p className="font-mono text-sm font-bold">{mission.deadline || 'לא הוגדר'}</p>
                                </div>
                            </div>
                            <div>
                                <h3 className={`text-sm font-bold mb-2 flex items-center gap-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}><Users size={16} /> אחראים</h3>
                                <div className="flex flex-wrap gap-2">
                                    {mission.responsibleUsersId.map(id => {
                                        const u = getUserById(id);
                                        return u ? <span key={id} className={`text-xs px-2 py-1 rounded border ${isDarkMode ? 'bg-slate-700 border-slate-600' : 'bg-slate-100 border-slate-200'}`}>{u.name}</span> : null;
                                    })}
                                </div>
                            </div>
                        </div>
                    )}
                    {activeTab === 'history' && (
                        <div className="animate-in fade-in slide-in-from-left-4 duration-300 relative pl-4 pt-2">
                            <div className={`absolute right-[19px] top-4 bottom-4 w-0.5 ${isDarkMode ? 'bg-slate-700' : 'bg-slate-200'}`}></div>
                            <div className="space-y-8">
                                {mockHistory.map((event, idx) => (
                                    <div key={event.id} className="relative flex gap-4">
                                        <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 border-4 ${isDarkMode ? 'bg-slate-800 border-slate-900' : 'bg-white border-white'}`}>
                                            <div className={`w-full h-full rounded-full flex items-center justify-center bg-slate-100 text-slate-600`}><Plus size={16} /></div>
                                        </div>
                                        <div className="flex-1 pt-1">
                                            <div className="flex justify-between items-start mb-1">
                                                <span className="text-xs font-bold">{event.user}</span>
                                                <span className="text-[10px] opacity-50 font-mono">{event.date}</span>
                                            </div>
                                            <p className={`text-sm p-3 rounded-lg ${isDarkMode ? 'bg-slate-900/50' : 'bg-slate-50'}`}>{event.text}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const CompactCard = ({ user, isDarkMode, onClick, allMissions }) => {
    const userMissions = allMissions.filter(m => m.responsibleUsersId.includes(user.id));
    const stats = {
        open: userMissions.filter(m => m.status === 'open').length,
        processing: userMissions.filter(m => m.status === 'in_progress').length,
        closed: userMissions.filter(m => m.status === 'closed').length
    };

    return (
        <div onClick={onClick} className={`p-4 rounded-xl shadow-sm border transition-all hover:shadow-md flex flex-col justify-between h-full cursor-pointer group ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white hover:border-slate-600' : 'bg-white border-slate-100 text-slate-800 hover:border-slate-200'}`}>
            <div className="flex flex-col items-center flex-1 justify-center">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110 mb-3 ${user.iconColor}`}>
                    <User size={24} />
                </div>
                <div className="text-center w-full">
                    <h3 className="text-lg font-bold font-sans truncate px-2">{user.name}</h3>
                    <p className={`text-xs truncate ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{user.role}</p>
                </div>
            </div>
            <div className={`grid grid-cols-3 gap-2 text-center text-xs py-2.5 rounded-lg mt-2 ${isDarkMode ? 'bg-slate-900/50' : 'bg-slate-50'}`}>
                <div><span className="block font-bold text-emerald-500 text-sm">{stats.open}</span><span className="text-[10px] opacity-70">פתוח</span></div>
                <div><span className="block font-bold text-amber-500 text-sm">{stats.processing}</span><span className="text-[10px] opacity-70">בטיפול</span></div>
                <div><span className="block font-bold text-slate-400 text-sm">{stats.closed}</span><span className="text-[10px] opacity-70">סגור</span></div>
            </div>
        </div>
    );
};

const MissionRow = ({ mission, isDarkMode, onClick }) => {
    const statusLabel = getStatusLabel(mission.status);
    const tag = getTagById(mission.tagId);
    const responsible = getUserById(mission.responsibleUsersId[0]);

    return (
        <div onClick={onClick} className={`flex items-center gap-4 p-4 rounded-xl border mb-3 transition-all cursor-pointer ${isDarkMode ? 'bg-slate-800 border-slate-700 hover:bg-slate-750' : 'bg-white border-slate-100 hover:bg-slate-50 hover:shadow-sm'}`}>
            <div className="flex flex-col items-center justify-center w-12 flex-shrink-0">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${isDarkMode ? 'bg-slate-700' : 'bg-slate-100'}`}>
                    <AlertCircle size={16} className={mission.status === 'open' ? 'text-emerald-500' : mission.status === 'in_progress' ? 'text-amber-500' : 'text-slate-500'} />
                </div>
                <span className="text-[10px] font-mono text-slate-400">{mission.id}</span>
            </div>
            <div className="flex-1 overflow-hidden px-2">
                <div className="flex items-center gap-2 mb-1">
                    <h3 className={`font-bold text-base truncate ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>{mission.title}</h3>
                    {tag && <span className={`text-[10px] px-1.5 rounded border ${tag.color}`}>{tag.label}</span>}
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1"><CalendarIcon size={12} /> יעד: {mission.deadline}</span>
                </div>
            </div>
            <div className={`hidden sm:flex px-3 py-1 rounded-full text-xs font-bold border w-24 justify-center ${mission.status === 'open' ? 'text-emerald-600 border-emerald-200 bg-emerald-50' : mission.status === 'in_progress' ? 'text-amber-600 border-amber-200 bg-amber-50' : 'text-slate-600 border-slate-200 bg-slate-50'}`}>
                {statusLabel}
            </div>
            <div className="flex items-center gap-2 w-32 justify-end pl-2 border-r border-slate-100 dark:border-slate-700">
                <div className="text-right hidden sm:block">
                    <span className={`block text-xs font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{responsible?.name || 'ללא'}</span>
                    <span className="block text-[10px] text-slate-400">{responsible?.role}</span>
                </div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${responsible?.iconColor || 'bg-gray-100'}`}>
                    <User size={14} />
                </div>
            </div>
        </div>
    );
};

const KanbanTask = ({ task, isDarkMode, onDragStart, onClick }) => {
    const responsible = getUserById(task.responsibleUsersId[0]);
    return (
        <div draggable onDragStart={(e) => onDragStart(e, task.id)} onClick={onClick} className={`p-4 rounded-xl border shadow-sm mb-3 cursor-pointer active:cursor-grabbing transition-all hover:shadow-md group ${isDarkMode ? 'bg-slate-800 border-slate-700 hover:border-slate-600' : 'bg-white border-slate-100 hover:border-slate-200'}`}>
            <div className="flex justify-between items-start mb-2">
                <h4 className={`font-bold text-sm leading-tight group-hover:text-blue-600 transition-colors ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{task.title}</h4>
            </div>
            <p className={`text-xs mb-4 line-clamp-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{task.description}</p>
            <div className="flex items-center justify-between mt-auto">
                <div className="flex items-center gap-1 text-slate-400 text-xs"><Clock size={12} /><span>{task.deadline}</span></div>
                {responsible && <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] ${responsible.iconColor}`}><User size={12} /></div>}
            </div>
        </div>
    );
};

const KanbanColumn = ({ title, status, tasks, isDarkMode, onDrop, onDragOver, icon: Icon, colorClass, onTaskClick }) => {
    return (
        <div onDrop={(e) => onDrop(e, status)} onDragOver={onDragOver} className={`flex-1 min-w-[300px] md:min-w-0 rounded-2xl p-4 flex flex-col h-full border ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
            <div className={`flex items-center justify-between mb-4 pb-3 border-b ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`}>
                <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center bg-slate-200 text-slate-600`}><span className="text-xs font-bold">{tasks.length}</span></div>
                    <h3 className={`font-bold text-lg ${colorClass}`}>{title}</h3>
                </div>
                <Icon size={18} className={colorClass} />
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar p-1">
                {tasks.map(task => (<KanbanTask key={task.id} task={task} isDarkMode={isDarkMode} onDragStart={(e, id) => e.dataTransfer.setData('taskId', id)} onClick={() => onTaskClick(task)} />))}
            </div>
        </div>
    );
};

export default function App() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState('home');
    const [viewMode, setViewMode] = useState('grid');
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedMission, setSelectedMission] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchType, setSearchType] = useState('all');
    const [timeRange, setTimeRange] = useState('day');
    const [missions, setMissions] = useState(INITIAL_MISSIONS);

    const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

    const changeDate = (direction) => {
        const newDate = new Date(currentDate);
        const daysToAdd = timeRange === 'week' ? 7 : 1;
        newDate.setDate(newDate.getDate() + (direction * daysToAdd));
        setCurrentDate(newDate);
    };

    const handleDateSelect = (date) => { setCurrentDate(date); setIsCalendarOpen(false); };
    const handleUserClick = (user) => { setSelectedUser(user); setCurrentPage('missions'); };
    const handleMissionClick = (mission) => { setSelectedMission(mission); };
    const handleCloseModal = () => { setSelectedMission(null); };
    const handleCreateMission = (newMission) => { setMissions([newMission, ...missions]); alert('משימה נוצרה בהצלחה!'); };

    // Filter Logic
    const filteredMissions = missions.filter(m => {
        const term = searchTerm.toLowerCase();
        let matchesSearch = true;
        if (term) {
            if (searchType === 'title') matchesSearch = m.title.toLowerCase().includes(term);
            else if (searchType === 'status') matchesSearch = m.status.includes(term);
            else matchesSearch = m.title.toLowerCase().includes(term) || m.description.toLowerCase().includes(term);
        }

        let matchesTime = true;
        const mDate = new Date(m.date);
        const curr = new Date(currentDate);
        if (timeRange === 'day') {
            matchesTime = mDate.toDateString() === curr.toDateString();
        }
        // For weekly view, we filter inside WeeklyCalendar to show the correct week, 
        // but for stats calculation in CompactCard, we also need to know which missions are active this week.
        if (timeRange === 'week') {
            const startWindow = new Date(currentDate);
            const dayOfWeek = startWindow.getDay();
            const diffToSunday = startWindow.getDate() - dayOfWeek;
            startWindow.setDate(diffToSunday);
            startWindow.setHours(0, 0, 0, 0);

            const endWindow = new Date(startWindow);
            endWindow.setDate(startWindow.getDate() + 6);
            endWindow.setHours(23, 59, 59, 999);

            const mStart = new Date(m.date);
            const mEnd = m.deadline ? new Date(m.deadline) : mStart;
            mStart.setHours(0, 0, 0, 0);
            mEnd.setHours(23, 59, 59, 999);

            matchesTime = mStart <= endWindow && mEnd >= startWindow;
        }

        return matchesSearch && matchesTime;
    });

    const handleDrop = (e, newStatus) => {
        const taskId = e.dataTransfer.getData('taskId');
        const updated = missions.map(m => m.id === taskId ? { ...m, status: newStatus } : m);
        setMissions(updated);
    };

    return (
        <div className={`h-screen max-h-screen font-sans flex transition-colors duration-300 overflow-hidden ${isDarkMode ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-900'}`} dir="rtl">
            <MissionModal mission={selectedMission} isOpen={!!selectedMission} onClose={handleCloseModal} isDarkMode={isDarkMode} />
            <CreateMissionModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} isDarkMode={isDarkMode} users={USERS} onCreate={handleCreateMission} />

            <aside className={`w-20 md:w-64 flex-shrink-0 flex flex-col items-center md:items-start py-6 px-4 shadow-xl z-20 transition-all duration-300 ${isDarkMode ? 'bg-slate-800' : 'bg-white'}`}>
                <div className="flex items-center gap-3 mb-10 w-full justify-center md:justify-start px-2">
                    <Layers className="text-blue-600" size={32} />
                    <h1 className="text-2xl font-bold text-blue-600 hidden md:block tracking-wide">System</h1>
                </div>
                <nav className="flex-1 w-full space-y-4">
                    {MENU_ITEMS.map((item) => (
                        <button key={item.id} onClick={() => { setCurrentPage(item.id); if (item.id === 'home') setSelectedUser(null); }} className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group ${currentPage === item.id ? 'bg-blue-50 text-blue-600 shadow-sm' : isDarkMode ? 'text-slate-400 hover:bg-slate-700' : 'text-slate-500 hover:bg-slate-50'}`}>
                            <item.icon size={22} className={currentPage === item.id ? 'text-blue-600' : 'group-hover:text-blue-500'} />
                            <span className={`hidden md:block font-medium ${currentPage === item.id ? 'font-bold' : ''}`}>{item.label}</span>
                        </button>
                    ))}
                </nav>
                <button className="flex items-center gap-3 text-red-500 font-medium mt-auto px-4 py-2 hover:bg-red-50 rounded-lg w-full transition-colors"><LogOut size={20} className="transform rotate-180" /><span className="hidden md:block">יציאה</span></button>
            </aside>

            <main className="flex-1 flex flex-col h-full relative">
                <header className={`relative h-20 flex-shrink-0 flex items-center justify-between px-8 shadow-sm z-30 ${isDarkMode ? 'bg-slate-800' : 'bg-white'}`}>
                    <div className="flex items-center gap-4">
                        {currentPage === 'home' && (
                            <div className="flex items-center bg-slate-100 p-1 rounded-lg dark:bg-slate-700">
                                <button onClick={() => setViewMode('grid')} className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-blue-600 dark:bg-slate-600 dark:text-white' : 'text-slate-400 hover:text-slate-600'}`}><LayoutGrid size={20} /></button>
                                <button onClick={() => setViewMode('list')} className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-blue-600 dark:bg-slate-600 dark:text-white' : 'text-slate-400 hover:text-slate-600'}`}><AlignJustify size={20} /></button>
                            </div>
                        )}
                        {currentPage === 'missions' && (
                            <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right duration-300">
                                <button onClick={() => setCurrentPage('home')} className={`p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}><ArrowRight size={20} className="transform rotate-180" /></button>
                                <h2 className={`text-xl font-bold hidden sm:block ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>המשימות של {selectedUser ? selectedUser.name : 'מאור'}</h2>
                            </div>
                        )}
                    </div>
                    <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center bg-white dark:bg-slate-700 rounded-full shadow-sm border border-slate-200 dark:border-slate-600 px-2 py-1 date-picker-container">
                        <button onClick={() => changeDate(-1)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-600 rounded-full transition-colors text-slate-500 dark:text-slate-300"><ChevronRight size={20} /></button>
                        <div className="relative px-4 min-w-[120px] text-center cursor-pointer select-none" onClick={() => setIsCalendarOpen(!isCalendarOpen)}>
                            <span className={`font-bold transition-colors ${isCalendarOpen ? 'text-blue-600 dark:text-blue-400' : 'text-slate-700 dark:text-slate-200 group-hover:text-blue-600'}`}>{timeRange === 'week' ? formatWeekRange(currentDate) : formatDateHebrew(currentDate)}</span>
                            {isCalendarOpen && <CustomDatePicker selectedDate={currentDate} onSelect={handleDateSelect} onClose={() => setIsCalendarOpen(false)} isDarkMode={isDarkMode} />}
                        </div>
                        <button onClick={() => changeDate(1)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-600 rounded-full transition-colors text-slate-500 dark:text-slate-300"><ChevronLeft size={20} /></button>
                    </div>
                    <div className="relative user-menu-container">
                        <button onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} className="flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-700 p-2 rounded-xl transition-colors">
                            <span className="font-bold text-slate-700 dark:text-slate-200 hidden sm:block">מנהל</span>
                            <div className="w-10 h-10 bg-slate-200 dark:bg-slate-600 rounded-full flex items-center justify-center text-slate-600 dark:text-slate-300"><User size={20} /></div>
                        </button>
                        {isUserMenuOpen && (
                            <div className={`absolute top-full left-0 mt-2 w-56 rounded-xl shadow-xl border overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-50 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
                                <div className="p-2 space-y-1">
                                    <button onClick={toggleDarkMode} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-slate-700 text-slate-200' : 'hover:bg-slate-50 text-slate-700'}`}>{isDarkMode ? <Sun size={18} /> : <Moon size={18} />}<span className="text-sm font-medium">{isDarkMode ? 'מצב אור' : 'מצב חשוך'}</span></button>
                                    <button className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-slate-700 text-slate-200' : 'hover:bg-slate-50 text-slate-700'}`}><Settings size={18} /><span className="text-sm font-medium">הגדרות</span></button>
                                </div>
                                <div className={`h-px mx-2 ${isDarkMode ? 'bg-slate-700' : 'bg-slate-100'}`}></div>
                                <div className="p-2"><button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors"><LogOut size={18} /><span className="text-sm font-medium">התנתק</span></button></div>
                            </div>
                        )}
                    </div>
                </header>

                <div className="flex-1 p-6 md:p-8 h-[calc(100vh-5rem)] overflow-hidden flex flex-col">
                    {currentPage === 'home' && (
                        <div className="flex flex-col h-full">
                            <div className={`relative flex flex-col md:flex-row gap-4 mb-6 shrink-0 animate-in fade-in slide-in-from-top-2 duration-200 items-center`}>
                                <div className={`relative flex-[1.5] max-w-md flex items-center p-1 rounded-xl border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                                    <div className="relative pl-2 border-l border-slate-200 dark:border-slate-700">
                                        <select value={searchType} onChange={(e) => setSearchType(e.target.value)} className={`appearance-none bg-transparent pr-8 pl-2 py-2 text-sm font-medium outline-none cursor-pointer ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>{SEARCH_TYPES.map(type => (<option key={type.id} value={type.id}>{type.label}</option>))}</select>
                                        <Filter size={14} className={`absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`} />
                                    </div>
                                    <div className="flex-1 relative">
                                        <Search size={18} className={`absolute right-3 top-1/2 -translate-y-1/2 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} />
                                        <input type="text" placeholder="חיפוש..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className={`w-full bg-transparent pr-10 pl-8 py-2 text-sm outline-none ${isDarkMode ? 'text-white placeholder-slate-500' : 'text-slate-800 placeholder-slate-400'}`} />
                                        {searchTerm && <button onClick={() => setSearchTerm('')} className="absolute left-2 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400"><X size={14} /></button>}
                                    </div>
                                </div>

                                <div className="flex-1"></div>

                                <div className={`flex p-1 rounded-xl border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                                    {[{ id: 'day', label: 'יומי', icon: CalendarDays }, { id: 'week', label: 'שבועי', icon: CalendarRange }].map(option => (
                                        <button key={option.id} onClick={() => setTimeRange(option.id)} className={`relative px-4 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 z-0 ${timeRange === option.id ? (isDarkMode ? 'bg-slate-700 text-white shadow-sm ring-1 ring-slate-600' : 'bg-blue-50 text-blue-600 shadow-sm ring-1 ring-blue-100') : (isDarkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-800')}`}>
                                            <option.icon size={16} /><span className="hidden sm:inline">{option.label}</span>
                                        </button>
                                    ))}
                                </div>
                                <button onClick={() => setIsCreateModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/20 transition-all active:scale-95"><Plus size={18} /><span className="hidden sm:inline">יצירת משימה</span></button>
                            </div>

                            <div className="flex-1 overflow-hidden relative">
                                {timeRange === 'week' && (
                                    viewMode === 'list' ? (
                                        <WeeklyCalendar currentDate={currentDate} tasks={filteredMissions} isDarkMode={isDarkMode} onTaskClick={handleMissionClick} />
                                    ) : (
                                        <div className="h-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 lg:grid-rows-3 gap-4 overflow-y-auto custom-scrollbar">
                                            {USERS.map((user) => (<CompactCard key={user.id} user={user} allMissions={filteredMissions} isDarkMode={isDarkMode} onClick={() => handleUserClick(user)} />))}
                                        </div>
                                    )
                                )}
                                {timeRange === 'day' && viewMode === 'grid' && (
                                    <div className="h-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 lg:grid-rows-3 gap-4 overflow-y-auto custom-scrollbar">
                                        {USERS.map((user) => (<CompactCard key={user.id} user={user} allMissions={filteredMissions} isDarkMode={isDarkMode} onClick={() => handleUserClick(user)} />))}
                                    </div>
                                )}
                                {timeRange === 'day' && viewMode === 'list' && (
                                    <div className="h-full overflow-auto pb-4 custom-scrollbar">
                                        <div className="flex px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 bg-slate-50 dark:bg-slate-800 rounded-lg sticky top-0 z-10">
                                            <div className="w-12 text-center">ID</div>
                                            <div className="flex-1 px-2">תיאור משימה</div>
                                            <div className="w-24 text-center hidden sm:block">סטטוס</div>
                                            <div className="w-32 text-left pl-2">משויך ל...</div>
                                        </div>
                                        <div className="space-y-1">
                                            {filteredMissions.length > 0 ? (filteredMissions.map((m) => (<MissionRow key={m.id} mission={m} isDarkMode={isDarkMode} onClick={() => handleMissionClick(m)} />))) : (
                                                <div className="flex flex-col items-center justify-center h-64 text-slate-400"><Search size={48} className="mb-4 opacity-50" /><p>לא נמצאו תוצאות עבור החיפוש שלך</p></div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                    {currentPage === 'missions' && selectedUser && (
                        <div className="h-full overflow-x-auto overflow-y-hidden">
                            <div className="flex h-full gap-6 w-full">
                                <KanbanColumn title="פתוח" status="open" tasks={missions.filter(t => t.status === 'open' && t.responsibleUsersId.includes(selectedUser.id))} isDarkMode={isDarkMode} onDrop={handleDrop} onDragOver={(e) => e.preventDefault()} icon={AlertCircle} colorClass="text-emerald-500" onTaskClick={handleMissionClick} />
                                <KanbanColumn title="בטיפול" status="in_progress" tasks={missions.filter(t => t.status === 'in_progress' && t.responsibleUsersId.includes(selectedUser.id))} isDarkMode={isDarkMode} onDrop={handleDrop} onDragOver={(e) => e.preventDefault()} icon={Clock} colorClass="text-amber-500" onTaskClick={handleMissionClick} />
                                <KanbanColumn title="סגור" status="closed" tasks={missions.filter(t => t.status === 'closed' && t.responsibleUsersId.includes(selectedUser.id))} isDarkMode={isDarkMode} onDrop={handleDrop} onDragOver={(e) => e.preventDefault()} icon={CheckCircle2} colorClass="text-slate-500" onTaskClick={handleMissionClick} />
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}