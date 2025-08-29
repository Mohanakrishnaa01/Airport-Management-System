import { useEffect, useState } from "react"

export function Admin() {
    const [search, setSearch] = useState("");
    const [sortAsc, setSortAsc] = useState(true);
    const [sortCol, setSortCol] = useState(null);
    const [display, setDisplay] = useState("airplanes");
    const [list, setList] = useState([]);

    useEffect( () => {
        const fetchData = async () => {
            try {
                const res = await fetch(`http://127.0.0.1:5000/api/${display}`);
                const data = await res.json();
                console.log(data);
                
                setList(data);
                
            } catch (err) {
                console.log("Error fetching: ", err);
                alert("error");
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
    
    return (
        <div className="Admin-container">
            <div className="Admin-top">
                <select value={display} onChange={(e) => setDisplay(e.target.value)}>
                    <option value="workers">Workers</option>
                    <option value="airplanes">Airplanes</option>
                    <option value="schedule">Schedule</option>
                    <option value="tests">Tests</option>
                </select>
                <input type="text" placeholder="Enter..." value={search} name="search" onChange={e => {setSearch(e.target.value)}} />
            </div>
            <div className="Admin-list">
                {list.length > 1 ? (
                    <table>
                        <thead>
                            <tr className="row">
                                {list[0].map((header, idx) =>
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
                                list[1].map((row, rowidx)=>
                                    <tr className="row" key={rowidx}>
                                        {row.map((col, colidx)=>
                                            <td key={colidx}>{col}</td>
                                        )}
                                    </tr>
                                )
                            }
                        </tbody>
                    </table>
                ) : "No record Found"}
                </div>
        </div>
    )
}