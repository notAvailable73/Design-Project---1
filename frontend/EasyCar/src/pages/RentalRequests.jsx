import React, { useEffect, useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import { toast } from "react-toastify";
import { 
  FaCheck, 
  FaTimes, 
  FaSpinner, 
  FaBell, 
  FaHistory, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaSync,
  FaCar,
  FaUser
} from "react-icons/fa";

// Debug helper component
const DebugSummary = ({ userId, profileId, rentals, allRentals }) => {
  return (
    <div className="mb-4 bg-gray-700 p-3 rounded">
      <h3 className="text-lg font-semibold text-white mb-2">Potential Issues:</h3>
      <ul className="list-disc list-inside text-white">
        <li className={userId ? "text-gray-400 line-through" : "text-yellow-400 font-bold"}>
          Missing User ID in localStorage
        </li>
        <li className={profileId && userId && profileId === userId ? "text-gray-400 line-through" : "text-yellow-400 font-bold"}>
          User ID mismatch between localStorage and profile API
        </li>
        <li className={rentals.length > 0 ? "text-gray-400 line-through" : "text-yellow-400 font-bold"}>
          No rental requests found after filtering for your owner ID
        </li>
        <li className={allRentals.length > 0 ? "text-gray-400 line-through" : "text-yellow-400 font-bold"}>
          No rental requests returned from API at all
        </li>
      </ul>
    </div>
  );
};

const RentalRequests = () => {
  const [rentals, setRentals] = useState([]);
  const [allRentals, setAllRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [processingId, setProcessingId] = useState(null);
  const [activeTab, setActiveTab] = useState("pending");
  const [showDebug, setShowDebug] = useState(false);
  const [profileId, setProfileId] = useState(null);
  const [showAllRentals, setShowAllRentals] = useState(false);

  useEffect(() => {
    fetchRentals();
    
    // Set up auto-refresh every 30 seconds
    const intervalId = setInterval(() => {
      fetchRentals(true);
    }, 30000);
    
    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  const fetchRentals = async (skipLoadingState = false) => {
    if (!skipLoadingState) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }
    setError(null);

    try {
      // Try to fetch user profile to get accurate ID
      try {
        const profileResponse = await axiosInstance.get("/api/users/profile");
        // Store profile ID in state for debugging
        setProfileId(profileResponse.data._id);
        
        // Continue with existing profile handling logic
        if (profileResponse.data && profileResponse.data._id) {
          localStorage.setItem("userId", profileResponse.data._id);
          console.log("Setting userId from profile:", profileResponse.data._id);
        }
      } catch (profileError) {
        console.log("Error fetching profile:", profileError);
      }

      const response = await axiosInstance.get("/api/rentals");
      console.log("All rentals from API:", response.data);
      setAllRentals(response.data || []);
      
      const userId = localStorage.getItem("userId");
      
      if (response.data && Array.isArray(response.data)) {
        // Apply owner filtering only if not showing all rentals
        let userRentals = response.data;
        
        if (!showAllRentals) {
          // More flexible ID comparison for owner filtering
          userRentals = response.data.filter(rental => {
            if (!rental.owner) return false;
            
            // Try different comparison methods
            const ownerId = rental.owner._id;
            const isOwner = 
              ownerId === userId || 
              ownerId.toString() === userId ||
              (ownerId.trim && userId.trim && ownerId.trim() === userId.trim());
              
            if (isOwner) {
              console.log("Found matching rental for owner:", rental._id);
              
              // Add a display role to help distinguish owner/renter view
              rental.viewRole = "owner";
            }
            
            return isOwner;
          });
        } else {
          console.log("Showing all rentals without owner filtering");
          
          // Add viewRole to all rentals
          userRentals.forEach(rental => {
            const ownerId = rental.owner?._id;
            const renterId = rental.renter?._id;
            
            if (ownerId === userId || ownerId?.toString() === userId) {
              rental.viewRole = "owner";
            } else if (renterId === userId || renterId?.toString() === userId) {
              rental.viewRole = "renter";
            } else {
              rental.viewRole = "none";
            }
          });
        }
        
        console.log("Filtered rentals for user:", userRentals);
        setRentals(userRentals);
      } else {
        console.log("No rental data available");
        setRentals([]);
      }
      
      if (skipLoadingState) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    } catch (err) {
      console.error("Error fetching rental requests:", err);
      setError(err.message || "Failed to fetch rental requests");
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleManualRefresh = () => {
    fetchRentals(true);
    toast.info("Refreshing rental requests...");
  };
  
  // Debug function to update userId manually
  const updateUserIdManually = (e) => {
    e.preventDefault();
    const manualId = document.getElementById('manual-user-id').value;
    if (manualId) {
      localStorage.setItem("userId", manualId);
      toast.success("User ID updated in localStorage");
      fetchRentals(true);
    } else {
      toast.error("Please enter a valid user ID");
    }
  };

  const handleStatusUpdate = async (rentalId, status) => {
    try {
      setProcessingId(rentalId);
      await axiosInstance.put(`/api/rentals/${rentalId}/status`, { status });
      
      // Refresh the rentals list to ensure we have the latest data
      await fetchRentals(true);
      
      // Display a more informative success message based on the status
      if (status === 'accepted') {
        toast.success("Rental request accepted successfully! The renter will be notified.");
      } else if (status === 'rejected') {
        toast.success("Rental request rejected. The renter will be notified.");
      } else if (status === 'completed') {
        toast.success("Rental has been marked as completed!");
      } else if (status === 'cancelled') {
        toast.success("Rental has been cancelled successfully.");
      } else {
        toast.success(`Rental status updated to ${status}.`);
      }
    } catch (error) {
      console.error("Error updating rental status:", error);
      toast.error(error.response?.data?.message || `Failed to update rental status to ${status}`);
    } finally {
      setProcessingId(null);
    }
  };

  // Filter rentals based on active tab
  const filteredRentals = rentals.filter(rental => {
    if (activeTab === "pending") return rental.status === "pending";
    if (activeTab === "accepted") return rental.status === "accepted";
    if (activeTab === "rejected") return rental.status === "rejected";
    if (activeTab === "completed") return rental.status === "completed";
    if (activeTab === "cancelled") return rental.status === "cancelled";
    if (activeTab === "all") return true;
    return false;
  });

  // Count rentals by status
  const pendingCount = rentals.filter(r => r.status === "pending").length;
  const acceptedCount = rentals.filter(r => r.status === "accepted").length;
  const rejectedCount = rentals.filter(r => r.status === "rejected").length;
  const completedCount = rentals.filter(r => r.status === "completed").length;
  const cancelledCount = rentals.filter(r => r.status === "cancelled").length;

  // Add a function to test ID comparison logic
  const testIdComparison = (rental) => {
    if (!rental || !rental.owner) {
      toast.error("No rental or owner data available to test");
      return;
    }
    
    const ownerIdFromRental = rental.owner._id;
    const userIdFromStorage = localStorage.getItem("userId");
    
    console.group("ID Comparison Test");
    console.log("Owner ID from rental:", ownerIdFromRental);
    console.log("User ID from localStorage:", userIdFromStorage);
    console.log("Direct comparison (===):", ownerIdFromRental === userIdFromStorage);
    console.log("String comparison (toString):", ownerIdFromRental.toString() === userIdFromStorage);
    console.log("Trim comparison:", ownerIdFromRental.trim?.() === userIdFromStorage.trim?.());
    console.groupEnd();
    
    toast.info("ID comparison test results in console", {
      autoClose: 3000,
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 text-2xl mt-10">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">
            Rental Requests
            {showAllRentals && (
              <span className="ml-2 text-sm bg-yellow-500 text-black px-2 py-1 rounded-full">
                Showing All Rentals
              </span>
            )}
          </h1>
          <p className="text-gray-400 mt-2">
            This page shows rental requests where you are the owner. 
            {showAllRentals && " With 'Show All Rentals' enabled, it also shows rentals where you are the renter."}
          </p>
        </div>
        
        <div className="flex gap-2">
          <button 
            onClick={handleManualRefresh}
            disabled={refreshing || loading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg transition flex items-center"
          >
            {refreshing ? (
              <>
                <FaSpinner className="animate-spin mr-2" />
                Refreshing...
              </>
            ) : (
              <>
                <FaSync className="mr-2" />
                Refresh
              </>
            )}
          </button>
          
          {/* Debug toggle */}
          <button 
            onClick={() => setShowDebug(prev => !prev)}
            className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition"
          >
            {showDebug ? "Hide Debug" : "Debug"}
          </button>
        </div>
      </div>
      
      {/* Debug section */}
      {showDebug && (
        <div className="mb-8 p-4 bg-gray-800 rounded-lg border border-red-500">
          <h2 className="text-xl text-red-500 font-bold mb-4">Debug Information</h2>
          
          <DebugSummary 
            userId={localStorage.getItem("userId")} 
            profileId={profileId} 
            rentals={rentals} 
            allRentals={allRentals} 
          />
          
          <div className="p-3 bg-yellow-800 bg-opacity-40 rounded mb-4">
            <h3 className="text-md font-semibold text-yellow-400 mb-1">Note about email notifications:</h3>
            <p className="text-white text-sm">
              In development mode, emails may not be sent if email credentials are not configured.
              Status updates will still work correctly, but notification emails might not be delivered.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-white mb-2">User ID from localStorage: <span className="font-mono">{localStorage.getItem("userId") || "Not found"}</span></p>
              <p className="text-white mb-2">User ID from profile API: <span className="font-mono">{profileId || "Not fetched"}</span></p>
              {profileId && localStorage.getItem("userId") && (
                <p className="text-white mb-2">
                  Profile/localStorage match: {" "}
                  <span className={`font-bold ${profileId === localStorage.getItem("userId") ? "text-green-500" : "text-red-500"}`}>
                    {profileId === localStorage.getItem("userId") ? "✅ Yes" : "❌ No"}
                  </span>
                </p>
              )}
              
              {/* Form to manually set userId */}
              <form onSubmit={updateUserIdManually} className="mt-4 flex gap-2">
                <input 
                  type="text" 
                  id="manual-user-id" 
                  placeholder="Enter owner ID to test" 
                  className="p-2 bg-gray-700 border border-gray-600 rounded text-white flex-1"
                />
                <button 
                  type="submit" 
                  className="bg-yellow-600 hover:bg-yellow-700 text-white py-2 px-4 rounded"
                >
                  Update User ID
                </button>
              </form>
            </div>
            
            <div className="flex flex-col justify-between">
              <button
                onClick={async () => {
                  try {
                    const response = await axiosInstance.get("/api/users/profile");
                    localStorage.setItem("userId", response.data._id);
                    toast.success("User ID synchronized with profile");
                    fetchRentals(true);
                  } catch (error) {
                    toast.error("Failed to fetch profile");
                  }
                }}
                className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded transition flex items-center justify-center"
              >
                <FaSync className="mr-2" />
                Sync ID from Profile
              </button>
              
              <button
                onClick={() => {
                  const ownerId = prompt("Enter the owner ID from one of the rental requests below:");
                  if (ownerId) {
                    localStorage.setItem("userId", ownerId);
                    toast.success("User ID set from rental owner");
                    fetchRentals(true);
                  }
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded transition mt-2"
              >
                Copy ID from Request
              </button>
              
              <div className="mt-4 flex items-center bg-gray-700 p-2 rounded">
                <label className="flex items-center cursor-pointer text-white">
                  <span className="mr-2">Show All Rentals:</span>
                  <div className="relative">
                    <input 
                      type="checkbox" 
                      checked={showAllRentals}
                      onChange={() => {
                        setShowAllRentals(!showAllRentals);
                        fetchRentals(true);
                      }}
                      className="sr-only" 
                    />
                    <div className={`block w-10 h-6 rounded-full ${showAllRentals ? 'bg-green-400' : 'bg-gray-600'}`}></div>
                    <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${showAllRentals ? 'transform translate-x-4' : ''}`}></div>
                  </div>
                </label>
              </div>
            </div>
          </div>
          
          <h3 className="text-lg font-semibold text-white mt-4 mb-2">All Rentals from API (No Filtering):</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-white border-collapse">
              <thead>
                <tr className="bg-gray-700">
                  <th className="border border-gray-600 px-4 py-2">Rental ID</th>
                  <th className="border border-gray-600 px-4 py-2">Owner ID</th>
                  <th className="border border-gray-600 px-4 py-2">Renter ID</th>
                  <th className="border border-gray-600 px-4 py-2">Status</th>
                  <th className="border border-gray-600 px-4 py-2">Role</th>
                  <th className="border border-gray-600 px-4 py-2">Match?</th>
                  <th className="border border-gray-600 px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {allRentals.map(rental => (
                  <tr key={rental._id} className="hover:bg-gray-600">
                    <td className="border border-gray-600 px-4 py-2 font-mono text-xs">{rental._id}</td>
                    <td className="border border-gray-600 px-4 py-2 font-mono text-xs">
                      {rental.owner ? rental.owner._id : 'N/A'}
                    </td>
                    <td className="border border-gray-600 px-4 py-2 font-mono text-xs">
                      {rental.renter ? rental.renter._id : 'N/A'}
                    </td>
                    <td className="border border-gray-600 px-4 py-2">{rental.status}</td>
                    <td className="border border-gray-600 px-4 py-2">
                      {rental.viewRole === 'owner' ? (
                        <span className="bg-green-600 text-white text-xs px-2 py-1 rounded">Owner</span>
                      ) : rental.viewRole === 'renter' ? (
                        <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded">Renter</span>
                      ) : (
                        <span className="bg-gray-600 text-white text-xs px-2 py-1 rounded">None</span>
                      )}
                    </td>
                    <td className="border border-gray-600 px-4 py-2">
                      {rental.owner && (rental.owner._id === localStorage.getItem("userId") || 
                      rental.owner._id.toString() === localStorage.getItem("userId")) ? 
                        '✅' : '❌'}
                    </td>
                    <td className="border border-gray-600 px-4 py-2">
                      <button
                        onClick={() => {
                          if (rental.owner) {
                            localStorage.setItem("userId", rental.owner._id);
                            toast.success("Owner ID copied to localStorage");
                            fetchRentals(true);
                          }
                        }}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs py-1 px-2 rounded mr-1"
                        disabled={!rental.owner}
                      >
                        Use This ID
                      </button>
                      
                      <button
                        onClick={() => testIdComparison(rental)}
                        className="bg-purple-600 hover:bg-purple-700 text-white text-xs py-1 px-2 rounded"
                        disabled={!rental.owner}
                      >
                        Test Match
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Status Tabs */}
      <div className="flex flex-wrap mb-6 border-b border-gray-700">
        <button
          onClick={() => setActiveTab("pending")}
          className={`flex items-center px-6 py-3 font-medium text-sm ${
            activeTab === "pending" 
              ? "border-b-2 border-indigo-500 text-indigo-500" 
              : "text-gray-400 hover:text-white"
          }`}
        >
          <FaBell className="mr-2" />
          Pending
          {pendingCount > 0 && (
            <span className="ml-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              {pendingCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("accepted")}
          className={`flex items-center px-6 py-3 font-medium text-sm ${
            activeTab === "accepted" 
              ? "border-b-2 border-indigo-500 text-indigo-500" 
              : "text-gray-400 hover:text-white"
          }`}
        >
          <FaCheckCircle className="mr-2" />
          Accepted
          {acceptedCount > 0 && (
            <span className="ml-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              {acceptedCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("rejected")}
          className={`flex items-center px-6 py-3 font-medium text-sm ${
            activeTab === "rejected" 
              ? "border-b-2 border-indigo-500 text-indigo-500" 
              : "text-gray-400 hover:text-white"
          }`}
        >
          <FaTimesCircle className="mr-2" />
          Rejected
          {rejectedCount > 0 && (
            <span className="ml-2 bg-gray-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              {rejectedCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("completed")}
          className={`flex items-center px-6 py-3 font-medium text-sm ${
            activeTab === "completed" 
              ? "border-b-2 border-indigo-500 text-indigo-500" 
              : "text-gray-400 hover:text-white"
          }`}
        >
          <FaCheckCircle className="mr-2" />
          Completed
          {completedCount > 0 && (
            <span className="ml-2 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              {completedCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("cancelled")}
          className={`flex items-center px-6 py-3 font-medium text-sm ${
            activeTab === "cancelled" 
              ? "border-b-2 border-indigo-500 text-indigo-500" 
              : "text-gray-400 hover:text-white"
          }`}
        >
          <FaTimes className="mr-2" />
          Cancelled
          {cancelledCount > 0 && (
            <span className="ml-2 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              {cancelledCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("all")}
          className={`flex items-center px-6 py-3 font-medium text-sm ${
            activeTab === "all" 
              ? "border-b-2 border-indigo-500 text-indigo-500" 
              : "text-gray-400 hover:text-white"
          }`}
        >
          <FaHistory className="mr-2" />
          All Requests
          <span className="ml-2 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            {rentals.length}
          </span>
        </button>
      </div>

      {filteredRentals.length === 0 ? (
        <div className="text-center text-gray-400 p-10 bg-gray-800 rounded-lg">
          <div className="flex flex-col items-center justify-center">
            {activeTab === "pending" ? (
              <>
                <FaBell className="text-6xl mb-4 text-yellow-500 opacity-60" />
                <h2 className="text-2xl font-semibold mb-2">No pending rental requests</h2>
                <p className="max-w-md">
                  When someone requests to rent your car, you'll see it here and can approve or reject it.
                </p>
              </>
            ) : activeTab === "accepted" ? (
              <>
                <FaCheckCircle className="text-6xl mb-4 text-green-500 opacity-60" />
                <h2 className="text-2xl font-semibold mb-2">No accepted rental requests</h2>
                <p className="max-w-md">
                  Rentals you've approved will appear here.
                </p>
              </>
            ) : activeTab === "rejected" ? (
              <>
                <FaTimesCircle className="text-6xl mb-4 text-red-500 opacity-60" />
                <h2 className="text-2xl font-semibold mb-2">No rejected rental requests</h2>
                <p className="max-w-md">
                  Rentals you've rejected will appear here.
                </p>
              </>
            ) : activeTab === "completed" ? (
              <>
                <FaCheckCircle className="text-6xl mb-4 text-blue-500 opacity-60" />
                <h2 className="text-2xl font-semibold mb-2">No completed rental requests</h2>
                <p className="max-w-md">
                  Rentals you've marked as completed will appear here.
                </p>
              </>
            ) : activeTab === "cancelled" ? (
              <>
                <FaTimes className="text-6xl mb-4 text-orange-500 opacity-60" />
                <h2 className="text-2xl font-semibold mb-2">No cancelled rental requests</h2>
                <p className="max-w-md">
                  Rentals you've cancelled will appear here.
                </p>
              </>
            ) : (
              <>
                <FaHistory className="text-6xl mb-4 text-blue-500 opacity-60" />
                <h2 className="text-2xl font-semibold mb-2">No rental requests found</h2>
                <p className="max-w-md">
                  When users request to rent your vehicles, they'll appear here. 
                  Make sure your vehicles are active and available for rent.
                </p>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredRentals.map((rental) => (
            <div 
              key={rental._id} 
              className={`bg-gray-800 rounded-lg overflow-hidden shadow-lg p-6 border-l-4 ${
                rental.status === 'pending' ? 'border-yellow-500' :
                rental.status === 'accepted' ? 'border-green-500' :
                rental.status === 'rejected' ? 'border-red-500' :
                'border-gray-800'
              }`}
            >
              <div className="flex flex-col md:flex-row justify-between">
                <div className="mb-4 md:mb-0">
                  <h2 className="text-2xl font-bold text-white mb-2">
                    {rental.car.make} {rental.car.model} ({rental.car.year})
                    {rental.status === "pending" && (
                      <span className="ml-2 text-xs bg-yellow-500 text-black px-2 py-1 rounded">
                        Pending
                      </span>
                    )}
                    {rental.owner && rental.owner._id === localStorage.getItem("userId") && (
                      <span className="ml-2 text-xs bg-green-500 text-white px-2 py-1 rounded">You Own This Car</span>
                    )}
                    {rental.viewRole && (
                      <span className={`ml-2 text-xs px-2 py-1 rounded ${
                        rental.viewRole === 'owner' 
                          ? 'bg-green-700 text-white' 
                          : rental.viewRole === 'renter'
                          ? 'bg-blue-700 text-white'
                          : 'bg-gray-700 text-white'
                      }`}>
                        {rental.viewRole === 'owner' ? 'You are the Owner' : rental.viewRole === 'renter' ? 'You are the Renter' : 'No Role'}
                      </span>
                    )}
                  </h2>
                  <p className="text-gray-400">
                    Requested by: {rental.renter.name}
                  </p>
                  <p className="text-gray-400">
                    Dates: {new Date(rental.startDate).toLocaleDateString()} to {new Date(rental.endDate).toLocaleDateString()}
                  </p>
                  <p className="text-gray-400">
                    Total Price: ${rental.totalPrice}
                  </p>
                  <p className="text-gray-400">
                    Status: <span className={`font-semibold ${
                      rental.status === 'pending' ? 'text-yellow-500' : 
                      rental.status === 'accepted' ? 'text-green-500' : 
                      rental.status === 'rejected' ? 'text-red-500' : 
                      'text-gray-400'
                    }`}>{rental.status.charAt(0).toUpperCase() + rental.status.slice(1)}</span>
                  </p>
                  <p className="text-gray-400 mt-2">
                    Requested on: {new Date(rental.createdAt).toLocaleDateString()} at {new Date(rental.createdAt).toLocaleTimeString()}
                  </p>
                </div>

                {rental.status === 'pending' && (
                  <div className="flex space-x-4">
                    <button
                      onClick={() => handleStatusUpdate(rental._id, 'accepted')}
                      disabled={processingId === rental._id}
                      className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition duration-300 flex items-center"
                    >
                      {processingId === rental._id ? (
                        <FaSpinner className="animate-spin mr-2" />
                      ) : (
                        <FaCheck className="mr-2" />
                      )}
                      Accept
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(rental._id, 'rejected')}
                      disabled={processingId === rental._id}
                      className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition duration-300 flex items-center"
                    >
                      {processingId === rental._id ? (
                        <FaSpinner className="animate-spin mr-2" />
                      ) : (
                        <FaTimes className="mr-2" />
                      )}
                      Reject
                    </button>
                  </div>
                )}
                
                {rental.status === 'accepted' && rental.viewRole === 'owner' && (
                  <div className="flex space-x-4">
                    <button
                      onClick={() => handleStatusUpdate(rental._id, 'completed')}
                      disabled={processingId === rental._id}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-300 flex items-center"
                    >
                      {processingId === rental._id ? (
                        <FaSpinner className="animate-spin mr-2" />
                      ) : (
                        <FaCheckCircle className="mr-2" />
                      )}
                      Mark as Complete
                    </button>
                  </div>
                )}
                
                {(rental.status === 'pending' || rental.status === 'accepted') && rental.viewRole === 'renter' && (
                  <div className="flex space-x-4">
                    <button
                      onClick={() => handleStatusUpdate(rental._id, 'cancelled')}
                      disabled={processingId === rental._id}
                      className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition duration-300 flex items-center"
                    >
                      {processingId === rental._id ? (
                        <FaSpinner className="animate-spin mr-2" />
                      ) : (
                        <FaTimes className="mr-2" />
                      )}
                      Cancel Rental
                    </button>
                  </div>
                )}
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Pickup Location</h3>
                  <p className="text-gray-400">District: {rental.pickupLocation.properties.district}</p>
                  <p className="text-gray-400">Sub-District: {rental.pickupLocation.properties.subDistrict}</p>
                  <p className="text-gray-400">Address: {rental.pickupLocation.properties.address}</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Return Location</h3>
                  <p className="text-gray-400">District: {rental.returnLocation.properties.district}</p>
                  <p className="text-gray-400">Sub-District: {rental.returnLocation.properties.subDistrict}</p>
                  <p className="text-gray-400">Address: {rental.returnLocation.properties.address}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RentalRequests; 