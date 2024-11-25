import { Navigate, Route, Routes, useLocation } from "react-router-dom"
import HomePage from "./pages/home/HomePage"
import SignUpPage from "./pages/auth/signup/SignUpPage"
import LoginPage from "./pages/auth/login/LoginPage"
import Sidebar from "./components/common/Sidebar"
import RightPanel from "./components/common/RightPanel"
import NotificationPage from "./pages/notificaiton/NotificationPage"
import ProfilePage from "./pages/profile/ProfilePage"
import { Toaster } from "react-hot-toast"
import { useQuery } from "@tanstack/react-query"
import LoadingSpinner from "./components/common/LoadingSpinner"
import FollowPage from "./pages/home/FollowPage"
import FollowersFollowing from "./pages/profile/FollowersFollowing"
import SearchPage from "./pages/Search/SearchPage"


function App() {
  const { pathname } = useLocation();
  const {data:authUser, isLoading}=useQuery({
    queryKey:['authUser'],
      queryFn: async()=>{
        try{
          const res= await fetch("/api/auth/me");
          const data= await res.json();
          if(data.error) return null;
          if(!res.ok) {
            throw new Error(data.error || "Something went wrong")
          }
          console.log("authUser is here:",data)
          return data;
        }
        catch(error){
          throw new Error(error)
        }
      },
      retry: false,
  });

  if(isLoading){
     return (
     <div className="h-screen flex justify-center items-center">
      <LoadingSpinner size='lg'/>
     </div>
    )
    }
  return (
    <div className='flex max-w-6xl mx-auto'>
      {authUser && <Sidebar />}
      <Routes>
        <Route path='/' element={authUser ? <HomePage /> : <Navigate to="/login" />} />
				<Route path='/login' element={!authUser ? <LoginPage /> : <Navigate to="/" />} />
				<Route path='/signup' element={!authUser ? <SignUpPage />: <Navigate to="/" />} />
				<Route path='/notifications' element={authUser ? <NotificationPage /> : <Navigate to="/login" />} />
				<Route path='/profile/:username' element={authUser ? <ProfilePage />: <Navigate to="/login" />} />
        <Route path='/followPage' element={authUser ? <FollowPage /> : <Navigate to="/login" />} />
        <Route path="/followFollowing/:username/:type" element={authUser ? <FollowersFollowing /> : <Navigate to="/login" />} />
        <Route path="/search" element={authUser ? <SearchPage /> : <Navigate to="/login" />} />

      </Routes>
      {authUser && pathname !== "/followPage" && <RightPanel />}
      <Toaster />
    </div>
  )
}

export default App
