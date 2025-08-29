import airplaneIcon from '../assets/airplane_icon.svg'
// import 

export function NavBar() {
    return (
        <div className="NavBar">
            <div>
                <h2>Airport Management System</h2>
                <img src={airplaneIcon} alt="airplane_logo"/>
            </div>
        </div>
    )
}