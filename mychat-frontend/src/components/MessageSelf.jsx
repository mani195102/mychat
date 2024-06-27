import React from 'react';

function MessageSelf({ props }) {
  const renderMedia = (mediaUrl) => {
    if (mediaUrl) {
      const isImage = mediaUrl.endsWith('.jpg') || mediaUrl.endsWith('.jpeg') || mediaUrl.endsWith('.png');
      const isVideo = mediaUrl.endsWith('.mp4');

      if (isImage) {
        return <img src={mediaUrl} alt="Attachment" className="message-image" />;
      } else if (isVideo) {
        return (
          <video style={{width:'320px'}}controls className="message-video">
            <source src={mediaUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        );
      } else {
        return (
          <a href={mediaUrl} target="_blank" rel="noopener noreferrer">
            View Attachment
          </a>
        );
      }
    }
    return null;
  };

  return (
    <div className="self-message-container">
      <div className="messageBox">
        <p style={{ color: 'black' }}>{props.content}</p>
        {renderMedia(props.media)}
      </div>
    </div>
  );
}

export default MessageSelf;
