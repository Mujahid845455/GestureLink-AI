import AvatarCanvas from "../components/AvatarCanvas";
import Caption from "../components/Caption";
import { useState } from "react";

function Dashboard() {
    return (
        <div className="app-container">
            <div className="avatar-section">
                <AvatarCanvas />
            </div>
            <div className="caption-section">
                <Caption />
            </div>
        </div>
    );
}

export default Dashboard;
