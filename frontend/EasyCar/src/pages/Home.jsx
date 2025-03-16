import React, { useEffect } from "react";
import ProfilePic from "../components/ProfilePic";

const Home = () => {
  useEffect(() => {
    // Fetch user info from localStorage
    const storedUserInfo = localStorage.getItem("token");
    console.log(storedUserInfo);
  }, []);
  return (
    <div>
      {" "}
      <div className="mb-4">
        <ProfilePic username="JohnDoe" size="40" />
      </div>
    </div>
  );
};

export default Home;
