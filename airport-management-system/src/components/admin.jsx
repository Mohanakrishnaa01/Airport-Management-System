import { useEffect, useState } from "react"
import { Form } from "./form"
import { NavBar } from "./navBar";
import { api } from "../utils/api";


export function Admin() {
    const [search, setSearch] = useState("");

    const [sortAsc, setSortAsc] = useState(true);
    const [sortCol, setSortCol] = useState(null);
    
    const [display, setDisplay] = useState("schedule");
    const [list, setList] = useState([]);

    const [searchList, setSearchList] = useState([]);
    
    const [showForm, setShowForm] = useState(false);
    // schedule-specific UI state
    const [pilotOptionsByRow, setPilotOptionsByRow] = useState({});
    const [selectedPilots, setSelectedPilots] = useState({});
    const [canTakeOffByRow, setCanTakeOffByRow] = useState({});
    
    // tests-specific UI state
    const [techOptionsByRow, setTechOptionsByRow] = useState({});
    const [selectedTechs, setSelectedTechs] = useState({});
    
    useEffect(()=>{
        if (list.length < 1) return

        const l = [];

        list[1].forEach(items=>{
            for (let item of items)
                
                if (item && item.toString().toLowerCase().includes(search.toLowerCase())){
                    l.push(items);
                    break;
                }
        })

        setSearchList([list[0], l])
    }, [search])

    useEffect( () => {
        const fetchData = async () => {
            try {
                let response;
                switch(display) {
                    case 'airplanes':
                        response = await api.getAirplanes();
                        break;
                    case 'workers':
                        response = await api.getWorkers();
                        break;
                    case 'schedule':
                        response = await api.getSchedule();
                        break;
                    case 'tests':
                        response = await api.getTests();
                        break;
                    case 'pilot':
                        response = await api.getPilots();
                        break;
                    default:
                        response = await api.getSchedule();
                }
                let data;
                if (response.ok) {
                    data = await response.json();
                    setList(data);
                } else {
                    const errorData = await response.json().catch(() => ({}));
                    console.error('Failed to fetch data:', errorData);
                    setList([]);
                    alert(`Failed to fetch data: ${errorData.message || 'Unknown error'}`);
                }
            } catch (err) {
                console.log("Error fetching: ", err);
                setList([]);
                alert("Network error occurred while fetching data");
            }
        }

        fetchData();
    }, [display])

    const handleSort = (colidx) => {
        const header = list[0];
        const rows = [...list[1]];

        const sorted = rows.sort((a, b) => {
            if (a[colidx] < b[colidx]) return sortAsc ? -1 : 1;
            if (a[colidx] > b[colidx]) return sortAsc ? 1 : -1;
            return 0;
        });

        setList([header, sorted]);
        setSortAsc(!sortAsc);
        setSortCol(colidx);
    }

    useEffect(()=>{
        setSearchList(list);
    }, [list])

    const handleAddClick = () => {
        setShowForm(true);
    };

    const handleFormClose = () => {
        setShowForm(false);
    };

    const mapTabToEndpoint = (tab) => {
        if (tab === 'airplane') return 'airplanes';
        return tab; // company, workers, schedule, tests
    };

    const handleFormSubmit = async (activeTab, formData) => {
        try {
            const endpoint = mapTabToEndpoint(activeTab);
            console.log(endpoint, JSON.stringify(formData));
            
            let response;
            switch(endpoint) {
                case 'airplanes':
                    response = await api.addAirplane(formData);
                    break;
                case 'company':
                    response = await api.addCompany(formData);
                    break;
                case 'workers':
                    response = await api.addWorker(formData);
                    break;
                case 'schedule':
                    response = await api.addSchedule(formData);
                    break;
                default:
                    throw new Error(`Unknown endpoint: ${endpoint}`);
            }

            if (!response.ok) {
                throw new Error(`Failed to add ${activeTab}`);
            }
            
            setShowForm(false);
            
            // If submitted tab differs from current display, switch to it
            setDisplay(display);

            // Refresh current list using api utilities
            let refreshResponse;
            switch(display) {
                case 'airplanes':
                    refreshResponse = await api.getAirplanes();
                    break;
                case 'workers':
                    refreshResponse = await api.getWorkers();
                    break;
                case 'schedule':
                    refreshResponse = await api.getSchedule();
                    break;
                case 'tests':
                    refreshResponse = await api.getTests();
                    break;
                case 'pilot':
                    refreshResponse = await api.getPilots();
                    break;
                default:
                    refreshResponse = await api.getSchedule();
            }
            
            if (refreshResponse.ok) {
                const data = await refreshResponse.json();
                setList(data);
            }
        } catch (err) {
            console.log("Error adding record: ", err);
            alert("Error adding record");
        }
    };

    // schedule: fetch available pilots per click for a row
    const fetchPilotsForRow = async (rowidx) => {
        try {
            const response = await api.getAvailablePilots();
            if (response.ok) {
                const data = await response.json();
                console.log(data);
                
                let options = [];
                if (Array.isArray(data) && data.length === 2) {
                    const optHeader = data[0];
                    const optRows = data[1];
                    const pilotIdIdx = optHeader.indexOf('pilot_id');
                    if (pilotIdIdx !== -1) {
                        options = optRows.map(r => r[pilotIdIdx]);
                    }
                }
                setPilotOptionsByRow(prev => ({ ...prev, [rowidx]: options }));
            }
        } catch (e) {
            console.error('Failed to load pilots', e);
            setPilotOptionsByRow(prev => ({ ...prev, [rowidx]: [] }));
        }
    };

    const handlePilotChange = async (rowidx, value) => {
        setSelectedPilots(prev => ({ ...prev, [rowidx]: value }));
        // reflect selection in table UI immediately
        const header = list[0];
        const rows = [...list[1]];
        
        const pilotIdx = header.indexOf('pilot_id');
        
        
        if (pilotIdx !== -1) {
            const updatedRow = [...rows[rowidx]];
            updatedRow[pilotIdx] = Number(value);
            rows[rowidx] = updatedRow;
            setList([header, rows]);
            setSearchList([header, rows]);
        }
        
        try {
            const scheduleIdx = header.indexOf('s_id');
            const scheduleId = rows[rowidx][scheduleIdx];
            // const scheduleIdIdx = header.indexOf('schedule_id');
            // const scheduleId = scheduleIdIdx !== -1 ? rows[rowidx][scheduleIdIdx] : null;
            await api.assignPilot(scheduleId, Number(value));
        } catch (e) {
            console.error('Failed to assign pilot', e);
        }
    };

    const handleCanTakeOffToggle = (rowidx) => {
        setCanTakeOffByRow(prev => {
            const next = { ...prev };
            next[rowidx] = !Boolean(prev[rowidx]);
            return next;
        });
    };

    // tests: fetch available technicians per click for a row based on dept_id
    const fetchTechsForRow = async (rowidx, deptId) => {
        try {
            const response = await api.getAvailableWorkers(deptId);
            if (response.ok) {
                const data = await response.json();
                let options = [];
                if (Array.isArray(data) && data.length === 2) {
                    const optHeader = data[0];
                    const optRows = data[1];
                    const techIdIdx = optHeader.indexOf('tech_id');
                    if (techIdIdx !== -1) {
                        options = optRows.map(r => r[techIdIdx]);
                    }
                }
                setTechOptionsByRow(prev => ({ ...prev, [rowidx]: options }));
            }
        } catch (e) {
            console.error('Failed to load technicians', e);
            setTechOptionsByRow(prev => ({ ...prev, [rowidx]: [] }));
        }
    };

    const handleTechChange = async (rowidx, value) => {
        setSelectedTechs(prev => ({ ...prev, [rowidx]: value }));
        // reflect selection in table UI immediately
        const header = list[0];
        const rows = [...list[1]];
        
        const techIdx = header.indexOf('tech_id');
        
        if (techIdx !== -1) {
            const updatedRow = [...rows[rowidx]];
            updatedRow[techIdx] = Number(value);
            rows[rowidx] = updatedRow;
            setList([header, rows]);
            setSearchList([header, rows]);
        }
        
        try {
            const testIdx = header.indexOf('test_id');
            const testId = rows[rowidx][testIdx];
            await api.assignTech(testId, Number(value));
        } catch (e) {
            console.error('Failed to assign technician', e);
        }
    };

    
    return (
        <div className="Admin-container">
            <NavBar />
            <div className="Admin-top">
                <select value={display} onChange={(e) => setDisplay(e.target.value)}>
                    <option value="workers">Workers</option>
                    <option value="pilot">Pilots</option>
                    <option value="airplanes">Airplanes</option>
                    <option value="schedule">Schedule</option>
                    <option value="tests">Tests</option>
                </select>
                <input type="text" placeholder="Enter..." value={search} name="search" onChange={e => {setSearch(e.target.value)}} />
            </div>
            <div className="Admin-list">
                {searchList.length > 1 ? (
                    <table>
                        <thead>
                            <tr className="row">
                                {searchList[0].map((header, idx) =>
                                    <th key={idx} className="header">{header}
                                        <button onClick={() => handleSort(idx)}>
                                            {sortCol === idx ? (sortAsc ? "▲" : "▼") : "↕"}
                                        </button>
                                    </th>
                                )}
                            </tr>
                        </thead>
                        <tbody>
                            {
                                searchList[1].map((row, rowidx)=>{
                                    const header = searchList[0];
                                    const isSchedule = display === 'schedule';
                                    const isTests = display === 'tests';
                                    const pilotIdx = isSchedule ? header.indexOf('pilot_id') : -1;
                                    const canTakeOffIdx = isSchedule ? header.indexOf('canTakeOff') : -1;
                                    const techIdx = isTests ? header.indexOf('tech_id') : -1;
                                    const deptIdx = isTests ? header.indexOf('dept_id') : -1;
                                    return (
                                        <tr className="row" key={rowidx}>
                                            {row.map((col, colidx)=>{
                                                if (isSchedule && colidx === pilotIdx) {
                                                    const options = pilotOptionsByRow[rowidx] || [];
                                                    const currentValue = selectedPilots[rowidx] ?? col;
                                                    return (
                                                        <td key={colidx}>
                                                            {currentValue === null || currentValue === '' ? (
                                                                <select
                                                                    className="pilot-dropdown"
                                                                    value={selectedPilots[rowidx] ?? ''}
                                                                    onChange={(e) => handlePilotChange(rowidx, e.target.value)}
                                                                    onClick={() => fetchPilotsForRow(rowidx)}
                                                                    onFocus={() => fetchPilotsForRow(rowidx)}
                                                                >
                                                                    <option value="" disabled>Select pilot</option>
                                                                    {options.map((pid) => (
                                                                        <option key={pid} value={pid}>{pid}</option>
                                                                    ))}
                                                                </select>
                                                            ) : (
                                                                <span>{currentValue}</span>
                                                            )}
                                                        </td>
                                                    );
                                                }
                                                if (isSchedule && colidx === canTakeOffIdx) {
                                                    const initial = Boolean(col);
                                                    const override = canTakeOffByRow[rowidx];
                                                    const effective = typeof override === 'boolean' ? override : initial;
                                                    return (
                                                        <td key={colidx}>
                                                            <button
                                                                className={`takeoff-toggle ${effective ? 'can' : 'cant'}`}
                                                                onClick={() => handleCanTakeOffToggle(rowidx)}
                                                            >
                                                                {effective ? 'Can takeoff' : "Can't takeoff"}
                                                            </button>
                                                        </td>
                                                    );
                                                }
                                                if (isTests && colidx === techIdx) {
                                                    const options = techOptionsByRow[rowidx] || [];
                                                    const currentValue = selectedTechs[rowidx] ?? col;
                                                    const deptId = deptIdx !== -1 ? row[deptIdx] : null;
                                                    return (
                                                        <td key={colidx}>
                                                            {currentValue === null || currentValue === '' ? (
                                                                <select
                                                                    className="pilot-dropdown"
                                                                    value={selectedTechs[rowidx] ?? ''}
                                                                    onChange={(e) => handleTechChange(rowidx, e.target.value)}
                                                                    onClick={() => deptId && fetchTechsForRow(rowidx, deptId)}
                                                                    onFocus={() => deptId && fetchTechsForRow(rowidx, deptId)}
                                                                >
                                                                    <option value="" disabled>Select technician</option>
                                                                    {options.map((tid) => (
                                                                        <option key={tid} value={tid}>{tid}</option>
                                                                    ))}
                                                                </select>
                                                            ) : (
                                                                <span>{currentValue}</span>
                                                            )}
                                                        </td>
                                                    );
                                                }
                                                if (isTests && (colidx === header.indexOf('weather') || colidx === header.indexOf('fuel') || colidx === header.indexOf('tyre'))) {
                                                    const deptId = deptIdx !== -1 ? row[deptIdx] : null;
                                                    const colName = header[colidx];
                                                    
                                                    if (deptId === 1 && colName === 'weather') {
                                                        return <td key={colidx} className="yet-to-complete">Yet to complete</td>;
                                                    } else if (deptId === 2 && colName === 'fuel') {
                                                        return <td key={colidx} className="yet-to-complete">Yet to complete</td>;
                                                    } else if (deptId === 3 && colName === 'tyre') {
                                                        return <td key={colidx} className="yet-to-complete">Yet to complete</td>;
                                                    } else {
                                                        return <td key={colidx}>-</td>;
                                                    }
                                                }
                                                return (<td key={colidx}>{col}</td>);
                                            })}
                                        </tr>
                                    );
                                })
                            }
                        </tbody>
                    </table>
                ) : "No record Found"}
            </div>
            <button className="add" onClick={handleAddClick}>+</button>
            
            {showForm && (
                <Form 
                    onClose={handleFormClose} 
                    onSubmit={handleFormSubmit}
                    display={display}
                />
            )}
        </div>
    )
}