'use client';

import { useState, type FormEvent } from 'react';
import './App.css';
import { generateQR } from './qrcode';

function QRCodeContainer() {
  const [qrCode, setQrCode] = useState("");
  const [token, setToken] = useState("");
  const [isValid, setIsValid] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!token.trim()) {
      return;
    }

    setIsVerifying(true);
    try {
      // Verify JWT on the server side
      const response = await fetch('/api/verify-jwt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (!data.valid) {
        setIsValid(false);
        setQrCode(""); // Clear QR if invalid
        setIsVerifying(false);
        return;
      }

      console.log("valid")
      setIsValid(true);

      // Generate QR code with the token
      const result = await generateQR(token);
      setQrCode(result ?? "");
    } catch (error) {
      console.error("Failed to generate QR code:", error);
      setIsValid(false);
      setQrCode("");
    } finally {
      setIsVerifying(false);
    }
  };

  const qrDownload = () => {
    const link = document.createElement('a');
    link.href = qrCode;
    link.download = 'qr-code.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };



  return (
    <div className="App">
      <h1>QR Code Generator</h1>
      <form onSubmit={handleSubmit} className=''>
        <fieldset className="fieldset">

          <label className="label">Token</label>
          <input
            id="token"
            type="text"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            className="input"
            placeholder="Token"
          />
          <button type="submit" className="btn btn-primary" disabled={isVerifying}>
            {isVerifying ? 'Verifying...' : 'Generate QR Code'}
          </button>
        </fieldset>
      </form>
      {qrCode ? (
        <img src={qrCode} alt="QR Code" onClick={qrDownload} style={{ cursor: 'pointer' }} />
      ) : null}
      {
        isValid ? "Valid" : "Invalid"
      }
    </div>
  );
}

export default QRCodeContainer;