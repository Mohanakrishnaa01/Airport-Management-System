import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom";
import { NavBar } from "./navBar";
import { api } from "../utils/api";
import { useAuth } from "../contexts/AuthContext";

// Workers page – shows only the tasks assigned to the current technician
export function Worker() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [tasks, setTasks] = useState([]); // [headers, rows]
    const [filtered, setFiltered] = useState([]); // [headers, rows]
    const [search, setSearch] = useState("");

    const loggedInTechId = user?.id;

    // Enforce self-access: if URL tech_id doesn't match logged-in user's id, correct it
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const fromQuery = params.get("tech_id");
        const queryId = fromQuery ? Number(fromQuery) : undefined;
        if (loggedInTechId && queryId && queryId !== loggedInTechId) {
            params.set("tech_id", String(loggedInTechId));
            const newUrl = `${window.location.pathname}?${params.toString()}`;
            navigate(newUrl, { replace: true });
        } else if (loggedInTechId && !queryId) {
            params.set("tech_id", String(loggedInTechId));
            const newUrl = `${window.location.pathname}?${params.toString()}`;
            navigate(newUrl, { replace: true });
        }
    }, [loggedInTechId]);

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const effectiveTechId = typeof loggedInTechId === "number" && !Number.isNaN(loggedInTechId) ? loggedInTechId : "";
                const res = await api.getWorkerTasks(effectiveTechId);
                if (!res) {
                    // redirected due to 401 in apiRequest
                    return;
                }
                const data = await res.json();
                
                // Sort tasks by airplane time automatically
                if (data && data.length === 2) {
                    const headers = data[0];
                    const rows = [...data[1]];
                    
                    // Find the column index for airplane time (assuming it's named 'takeOff' or similar)
                    const timeColIdx = headers.findIndex(h => 
                        h.toLowerCase().includes('time') || 
                        h.toLowerCase().includes('takeoff') || 
                        h.toLowerCase().includes('schedule')
                    );
                    
                    if (timeColIdx !== -1) {
                        // Sort by time in ascending order (earliest first)
                        rows.sort((a, b) => {
                            const timeA = new Date(a[timeColIdx] || 0);
                            const timeB = new Date(b[timeColIdx] || 0);
                            return timeA - timeB;
                        });
                    }
                    
                    const sortedData = [headers, rows];
                    setTasks(sortedData);
                    setFiltered(sortedData);
                } else {
                    setTasks(data);
                    setFiltered(data);
                }
            } catch (e) {
                console.error("Failed to load worker tasks", e);
                setTasks([]);
                setFiltered([]);
                alert("Failed to load assigned work");
            }
        };
        if (typeof loggedInTechId === "number" && !Number.isNaN(loggedInTechId)) {
            fetchTasks();
        }
    }, [loggedInTechId]);

    useEffect(() => {
        if (!tasks || tasks.length < 2) return;
        if (!search) {
            setFiltered(tasks);
            return;
        }
        const header = tasks[0];
        const rows = tasks[1] || [];
        const q = search.toLowerCase();
        const filteredRows = rows.filter((r) => r.some((c) => c !== null && c !== undefined && c.toString().toLowerCase().includes(q)));
        setFiltered([header, filteredRows]);
    }, [search, tasks]);



    return (
        <div className="Admin-container">
            <NavBar />
            <div className="Admin-top">
                <input
                    type="text"
                    placeholder="Search your tasks..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>
            <div className="Admin-list">
                {filtered && filtered.length > 1 ? (
                    <table>
                        <thead>
                            <tr className="row">
                                {filtered[0].map((h, idx) => (
                                    <th key={idx} className="header">
                                        {h}
                                    </th>
                                ))}
                                <th className="header">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(filtered[1] || []).map((r, rIdx) => (
                                <tr className="row" key={rIdx}>
                                    {r.map((c, cIdx) => (
                                        <td key={cIdx}>{c}</td>
                                    ))}
                                    <td>
                                        <button type="button" style={{ backgroundColor: 'red', color: 'white' }}>Complete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    "No assigned work found"
                )}
            </div>
        </div>
    );
}


