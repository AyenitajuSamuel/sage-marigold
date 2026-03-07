import { useEffect, useState } from 'react';

const UserDashboard = () => {
    const [activity, setActivity] = useState({ myDonations: [], myApplications: [] });
    const [loading, setLoading] = useState(true);
    const [selectedItemRequests, setSelectedItemRequests] = useState(null);

    useEffect(() => {
        const fetchActivity = async () => {
            const token = localStorage.getItem("token");
            try {
                const res = await fetch('/api/users/activity', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await res.json();

                if (data.ok) setActivity(data);
            } catch (err) {
                console.error("Error fetching activity:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchActivity();
    }, []);

    const viewRequests = async (itemId) => {
        const token = localStorage.getItem("token");
        try {
            const res = await fetch(`/api/requests/item/${itemId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            console.log("requests for item:", data.requests);
            if (data.ok) {
                setSelectedItemRequests(data.requests);
            } else {
                alert(data.msg || "Could not fetch requests (T_T)");
            }
        } catch (err) {
            console.error("Error fetching item requests:", err);
        }
    };

    const handleAccept = async (requestId) => {
        if (!requestId) {
            alert("Error: request ID not found. check console (o_O)");
            return;
        }
        const token = localStorage.getItem("token");
        try {
            const res = await fetch(`/api/requests/${requestId}/accept`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ status: 'accepted' })
            });
            const data = await res.json();
            if (res.status === 400) {
                console.error("Backend 400 Error:", data);
                alert(`Validation Error: ${data.msg || "Invalid Request ID (ToT)"}`);
                return;
            }
            if (data.ok) {
                alert("Request Accepted! Item is now reserved (^_^)");
                window.location.reload();
            }
        } catch (err) {
            console.error("Accept Error:", err);
        }
    };

    const handleCancel = async (requestId) => {
        if (!requestId) return;
        if (!window.confirm("Are you sure you want to cancel this request?")) return;

        const token = localStorage.getItem("token");
        try {
            const res = await fetch(`/api/requests/${requestId}/cancel`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.ok) {
                alert("Request cancelled successfully");
                window.location.reload();
            }
        } catch (err) {
            console.error("Cancel Error:", err);
        }
    };

    const handleClaim = async (requestId, code) => {
        if (!code) return alert("Please enter the 6-digit code provided by the donor!");

        const token = localStorage.getItem("token");
        try {
            const res = await fetch(`/api/requests/${requestId}/claim`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ claim_code: code })
            });
            const data = await res.json();

            if (data.ok) {
                alert("Success! you have officially claimed this item. (^_^)v");
                window.location.reload();
            } else {
                alert(data.msg || "Invalid code. please try again!");
            }
        } catch (err) {
            console.error("claim Error:", err);
        }
    };

    if (loading) return <div className="p-8 text-center">Loading your activity...</div>;

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-8">
            <h1 className="text-3xl font-bold text-gray-800 text-center">Your Activity</h1>

            <section>
                <h2 className="text-xl font-semibold mb-4">Items You Requested</h2>
                <div className="grid gap-4">
                    {activity.myApplications.map(app => (
                        <div key={app.id} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex justify-between items-center">
                            <div>
                                <h3 className="font-medium text-lg">{app.item_name}</h3>
                                <p className="text-sm text-gray-500">Donor: {app.donor_name}</p>
                                <p className={`text-sm font-semibold mt-1 ${app.status === 'accepted' ? 'text-emerald-600' : 'text-amber-600'}`}>
                                    {app.status_message}
                                </p>
                            </div>

                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${app.status === 'accepted' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
                                {app.status}
                            </span>
                            {app.status === 'pending' && (
                                <button
                                    onClick={() => handleCancel(app.id)}
                                    className="text-red-500 hover:bg-red-50 px-3 py-1 rounded-md text-sm font-medium border border-red-100 transition"
                                >
                                    Cancel
                                </button>
                            )}
                            {app.status === 'accepted' && (
                                <div className="mt-4 flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Enter 6-digit code"
                                        maxLength="6"
                                        className="border p-2 rounded text-sm w-40"
                                        id={`code-${app.id}`}
                                    />
                                    <button
                                        onClick={() => {
                                            const code = document.getElementById(`code-${app.id}`).value;
                                            handleClaim(app.id, code);
                                        }}
                                        className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-bold hover:bg-blue-700"
                                    >
                                        Claim Item
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </section>

            <section>
                <h2 className="text-xl font-semibold mb-4">Your Shared Items</h2>
                <div className="grid gap-4">
                    {activity.myDonations.map(item => (
                        <div key={item.id} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex justify-between items-center">
                            <div>
                                <h3 className="font-medium">{item.title}</h3>
                                <p className="text-sm text-gray-500 italic">Status: {item.status}</p>
                                {item.status === 'reserved' && (
                                    <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded text-amber-800 text-sm">
                                        <strong>Claim Code:</strong> {item.claim_code || "Check details"}
                                    </div>
                                )}
                            </div>
                            <div className="text-right">
                                {item.pending_request_count > 0 ? (
                                    <button
                                        className="bg-emerald-600 text-white px-4 py-2 rounded-md text-sm hover:bg-emerald-700 transition"
                                        onClick={() => viewRequests(item.id)}
                                    >
                                        View {item.pending_request_count} Requests
                                    </button>
                                ) : (
                                    <span className="text-gray-400 text-sm">No requests yet</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/*REQUESTS MODAL*/}
            {selectedItemRequests && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-800">Interested People</h3>
                            <button onClick={() => setSelectedItemRequests(null)} className="text-gray-400 hover:text-gray-600 p-1">✕</button>
                        </div>

                        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                            {selectedItemRequests.length === 0 ? (
                                <p className="text-center text-gray-500 py-4">No active requests found.</p>
                            ) : (
                                selectedItemRequests.map(req => (

                                    <div key={req.id} className="border border-gray-100 bg-gray-50 p-4 rounded-xl flex justify-between items-start gap-4">
                                        <div className="flex-1">
                                            <p className="font-bold text-gray-900">{req.requester_name}</p>
                                            <p className="text-sm text-gray-600 mt-1 italic">
                                                "{req.application_data?.message || req.application_data || "No message provided (?_?)"}"
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => handleAccept(req.id || req.request_id)}
                                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm"
                                        >
                                            Accept
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserDashboard;