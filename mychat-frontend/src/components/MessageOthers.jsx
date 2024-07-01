import React from "react";
import "./myStyles.css";
import { useDispatch, useSelector } from "react-redux";

function MessageOthers({ props }) {
  const dispatch = useDispatch();
  const lightTheme = useSelector((state) => state.themeKey);

  return (
    <div className={"other-message-container" + (lightTheme ? "" : " dark")}>
      <div className={"conversation-container" + (lightTheme ? "" : " dark")}>
        {/* <div className={"con-icon" + (lightTheme ? "" : " dark")}>
          {props.sender.profileImage ? (
            <img src={props.sender.profileImage} alt="Sender Profile" className="profile-image" />
          ) : (
            props.sender.name[0]
          )}
        </div> */}
        <div className={"other-text-content" + (lightTheme ? "" : " dark")}>
          <p className={"con-title" + (lightTheme ? "" : " dark")}>
            {props.sender.name}
          </p>
          {props.content && (
            <p className={"con-lastMessage" + (lightTheme ? "" : " dark")}>
              {props.content}
            </p>
          )}
          {props.media && (
            <div className="message-media">
              <img src={props.media} alt="Attachment" />
            </div>
          )}
          <p className="self-timeStamp">{props.timeStamp}</p>
        </div>
      </div>
    </div>
  );
}

export default MessageOthers;
