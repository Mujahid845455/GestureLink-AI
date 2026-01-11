// import AvatarCanvas from "../components/AvatarCanvas";
import { useState } from "react";
import Caption from "../components/Caption";
import UserDashboard from "../components/UserDashboard";
function Dashboard() {
    return (
        <div className="app-container">
            <div className="avatar-section">
                {/* <AvatarCanvas /> */}
                <UserDashboard/>
            </div>
            {/* <div className="caption-section">
                <Caption />
            </div> */}
        </div>
    );
}

export default Dashboard;
