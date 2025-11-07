'use client';

import { useState, type FormEvent } from 'react';
import './App.css';
import { config } from '@/config';
import { generateQR } from './qrcode';

function QRCodeContainer() {
  const [qrCode, setQrCode] = useState("");
  const [token, setToken] = useState("");

  console.log("qr: ", qrCode)
  console.log("jwt: ", config.jwt_secret)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!token.trim()) {
      return;
    }

    try {
      const result = await generateQR(token);
      setQrCode(result ?? "");
    } catch (error) {
      console.error("Failed to generate QR code:", error);
    }
  };

  return (
    <div className="App">
      <h1>QR Code Generator</h1>
      <form onSubmit={handleSubmit} className=''>
        <label htmlFor="token">Token:</label>
        <input
          id="token"
          type="text"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="Enter token"
        />
        <button type="submit">Generate QR Code</button>
      </form>
      {qrCode ? (
        <img src={qrCode} alt="QR Code" />
      ) : (
        <p>Enter a token and click Generate QR Code</p>
      )}
    </div>
  );
}

export default QRCodeContainer;