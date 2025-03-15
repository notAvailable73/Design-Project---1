import React from "react";
import ProfilePic from "../components/ProfilePic";

const Home = () => {
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
