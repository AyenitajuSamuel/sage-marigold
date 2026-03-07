import React, { useState } from 'react';

const ConfirmationHandshake = ({ requestId, itemStatus, isRequester, onstatusUpdate }) => {
  const [showModal, setShowModal] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isRequester || itemStatus !== 'accepted') return null;

  const handleConfirmPickup = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`/api/requests/${requestId}/complete`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: verificationCode }), 
      });

      const data = await response.json();

      if (response.ok) {
        alert("Transaction Completed! Item is now 'Claimed' (^_^)");
        setShowModal(false);
        if (onstatusUpdate) onstatusUpdate(); 
      } else {
        setError(data.message || "Invalid code. pleasa try again!");
      }
    } catch (err) {
      setError("Server error. please try again later!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4">
      <button 
        onClick={() => setShowModal(true)}
        className="bg-green-600 text-white px-4 py-2 rounded shadow hover:bg-green-700"
      >
        Mark as Received (Confirm Pickup)
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-lg max-w-sm w-full">
            <h3 className="text-lg font-bold mb-2">Confirm Pickup</h3>
            <p className="text-sm text-gray-600 mb-4">
              Enter the 6-digit verification code you received from the donor:
            </p>
            
            <input 
              type="text" 
              maxLength="6"
              className="w-full border-2 border-gray-300 p-2 rounded text-center text-2xl tracking-widest mb-2"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              placeholder="000000"
            />

            {error && <p className="text-red-500 text-xs mb-2">{error}</p>}

            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setShowModal(false)} className="text-gray-500">Cancel</button>
              <button 
                onClick={handleConfirmPickup}
                disabled={loading || verificationCode.length !== 6}
                className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
              >
                {loading ? 'Verifying...' : 'Submit Code'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConfirmationHandshake;