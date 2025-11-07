'use client';

import { useState, type FormEvent } from 'react';
import './App.css';
import { config } from '@/config';
import { generateQR } from './qrcode';
import { verifyJwt } from '@/utils/jwt';

function QRCodeContainer() {
  const [qrCode, setQrCode] = useState("");
  const [token, setToken] = useState("");
  const [isValid, setIsValid] = useState(false);

  console.log("qr: ", qrCode)
  console.log("jwt: ", config.jwt_secret)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!token.trim()) {
      return;
    }

    try {
      const valid = await verifyJwt(token);
      if (!valid) {
        setQrCode(""); // Clear QR if invalid
        return;
      }
      console.log("valid")
      setIsValid(true);

      const result = await generateQR(token);
      setQrCode(result ?? "");
      setIsValid(true)
    } catch (error) {
      console.error("Failed to generate QR code:", error);
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
          <button type="submit" className="btn btn-primary">Generate QR Code</button>
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