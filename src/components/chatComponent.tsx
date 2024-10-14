'use client';

import { useState, useRef } from 'react';

const ChatComponent = () => {
  const [transcribedText, setTranscribedText] = useState('');
  const [responseText, setResponseText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const addLog = (message: string) => {
    setLogs(prevLogs => [...prevLogs, message]);
  };

  const startRecording = () => {
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = event => {
          audioChunksRef.current.push(event.data);
        };

        mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
          const audioArrayBuffer = await audioBlob.arrayBuffer();
          const audioBase64 = btoa(String.fromCharCode(...Array.from(new Uint8Array(audioArrayBuffer))));

          // Send the audioBlob to the server for conversion
          const response = await fetch('/api/generateText', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ audioBlob: audioBase64 }),
          });

          const data = await response.json();

          if (data.error) {
            addLog(`Error: ${data.error}`);
          } else {
            addLog(`Whisper Response: ${JSON.stringify(data)}`);

            if (data.transcribedText) {
              setTranscribedText(data.transcribedText);
              addLog(`Transcribed Text: ${data.transcribedText}`);

              if (data.text) {
                setResponseText(data.text);
                addLog(`Generated Text: ${data.text}`);
              } else {
                addLog(`Falcon response does not contain text: ${JSON.stringify(data)}`);
              }
            } else {
              addLog(`Whisper response does not contain transcribed text: ${JSON.stringify(data)}`);
            }
          }
        };

        mediaRecorder.start();
        setIsRecording(true);
      })
      .catch(error => {
        addLog(`Error accessing microphone: ${error}`);
      });
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <div>
      <button
        onMouseDown={startRecording}
        onMouseUp={stopRecording}
        onTouchStart={startRecording}
        onTouchEnd={stopRecording}
        style={{ padding: '10px', fontSize: '16px', margin: '10px 0' }}
      >
        {isRecording ? 'Recording...' : 'Hold to Record'}
      </button>
      {transcribedText && (
        <div>
          <h3>Transcribed Text:</h3>
          <p>{transcribedText}</p>
        </div>
      )}
      {responseText && (
        <div>
          <h3>Generated Text:</h3>
          <p>{responseText}</p>
        </div>
      )}
      <div>
        <h3>Logs:</h3>
        <ul>
          {logs.map((log, index) => (
            <li key={index}>{log}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ChatComponent;