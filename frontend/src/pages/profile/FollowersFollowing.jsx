import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import useFollow from "../../hooks/useFollow"; // Assuming useFollow hook exists

const SkeletonLoader = ({ count = 1 }) => {
  return Array(count)
    .fill(null)
    .map((_, index) => (
      <div
        key={index}
        className="animate-pulse flex items-center justify-between p-4 bg-[#16181C] rounded-md shadow-md w-[600px] mx-auto"
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-gray-700 rounded-full"></div>
          <div className="flex flex-col">
            <div className="w-24 h-4 bg-gray-700 rounded mb-2"></div>
            <div className="w-16 h-3 bg-gray-600 rounded"></div>
          </div>
        </div>
        <div className="w-20 h-8 bg-gray-700 rounded"></div>
      </div>
    ));
};

const FollowersFollowing = () => {
  const { username } = useParams(); // Capture 'username'
  const [type, setType] = useState("followers"); // Default to 'followers' tab

  // Fetch profile data
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["userProfile", username],
    queryFn: async () => {
      const res = await fetch(`/api/users/profile/${username}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch profile");
      return data;
    },
  });

  // Fetch followers/following data
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: [`${type}-${username}`],
    queryFn: async () => {
      const res = await fetch(`/api/users/followFollowing/${username}/${type}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch users");
      return data;
    },
  });

  // Fetch authenticated user data
  const { data: authUser } = useQuery({ queryKey: ["authUser"] });

  // Initialize follow/unfollow hooks
  const { follow, unfollow, isPending } = useFollow({
    onSuccess: () => refetch(),
    onError: (error) => console.error(error),
  });

  if (profileLoading || isLoading) {
    return (
      <div className="px-4 py-2">
        <div className="sticky top-0 bg-black z-10 border-b border-gray-800 p-4">
          <div className="flex flex-col items-center animate-pulse">
            <div className="w-32 h-6 bg-gray-700 rounded mb-2"></div>
            <div className="w-24 h-4 bg-gray-600 rounded"></div>
          </div>
        </div>
        <div className="mt-4">
          <SkeletonLoader count={6} />
        </div>
      </div>
    );
  }

  if (isError) {
    return <div className="text-red-500 text-center">{error.message}</div>;
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>No users found</p>
      </div>
    );
  }

  // Sort the list to place logged-in user at the top
  const sortedData = [...data].sort((a, b) => {
    if (a._id === authUser?._id) return -1; // Logged-in user first
    if (b._id === authUser?._id) return 1;
    return 0; // Maintain original order for others
  });

  return (
    <div className="px-4 py-2">
      {/* Profile Header */}
      <div className="sticky top-0 bg-black z-10 border-b border-gray-800 p-4">
        <div className="flex flex-col text-center">
          <h2 className="text-xl font-bold text-white">{profile.fullName}</h2>
          <p className="text-gray-500">@{profile.username}</p>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex justify-around mb-4">
        <div
          className={`flex-1 p-3 text-center cursor-pointer ${
            type === "followers" ? "font-bold border-b-2 border-primary" : ""
          }`}
          onClick={() => setType("followers")}
        >
          Followers
        </div>
        <div
          className={`flex-1 p-3 text-center cursor-pointer ${
            type === "following" ? "font-bold border-b-2 border-primary" : ""
          }`}
          onClick={() => setType("following")}
        >
          Following
        </div>
      </div>

      {/* User List */}
      <div className="flex flex-col gap-4">
        {sortedData.map((user) => {
          const amIFollowing = authUser?.following.includes(user?._id); // Check if the current user is following the profile

          return (
            <div
              key={user._id}
              className="flex items-center justify-between p-4 bg-[#16181C] rounded-md shadow-md w-[600px] mx-auto"
            >
              <Link to={`/profile/${user.username}`} className="flex gap-4 items-center flex-1">
                <div className="avatar">
                  <div className="w-10 h-10 rounded-full">
                    <img src={user.profileImg || "/avatar-placeholder.png"} alt={user.username} />
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-white">{user.fullName}</span>
                  <span className="text-sm text-slate-500">@{user.username}</span>
                  {user.bio && (
                    <p className="text-xs text-slate-400 mt-1 max-w-[400px] truncate">{user.bio}</p>
                  )}
                  <div className="flex gap-4 text-xs text-slate-500 mt-2">
                    <span>{user.followers.length || 0} Followers</span>
                    <span>{user.following.length || 0} Following</span>
                  </div>
                </div>
              </Link>

              {/* Hide Follow/Unfollow Button if the user is the logged-in user */}
              {user._id !== authUser?._id && (
                <button
                  className="btn btn-outline rounded-full btn-sm"
                  onClick={() => {
                    if (amIFollowing) {
                      unfollow(user._id); // Unfollow the user
                    } else {
                      follow(user._id); // Follow the user
                    }
                  }}
                  disabled={isPending}
                >
                  {isPending ? "Loading..." : amIFollowing ? "Unfollow" : "Follow"}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FollowersFollowing;
