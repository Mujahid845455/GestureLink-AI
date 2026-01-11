import CanvasAvatar from "./CanvasAvatar";
import Caption from "./Caption";

function AvatarCanvas() {
    return (
        <div className="app-container">
            <div className="avatar-section">
                <CanvasAvatar/>
                
            </div>
            <div className="caption-section">
                <Caption />
            </div>
        </div>
    );
}

export default AvatarCanvas;