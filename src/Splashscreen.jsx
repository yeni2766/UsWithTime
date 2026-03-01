import { useEffect } from "react"
import Logo from './assets/Whitelogo.gif'
export default function Splashscreen({setIsExiting,isExiting, showSplash}){
    useEffect(()=>{
        const exit = setTimeout(()=>{
            setIsExiting(prev=>!prev)
        },2000);

        const splashExit = setTimeout(()=>{
            showSplash(prev=>!prev)
        },2300);

        return () => {
        clearTimeout(exit);
        clearTimeout(splashExit);
        }
    },[])
    return(
        <div className={`flex flex-col items-center justify-center fixed inset-0 z-10 bg-[#ffb6d9] ${isExiting ? '-translate-y-full':'translate-y-0'} transition-transform duration-300 ease`}>
            <div className="relative -top-20 lg-top-40">
                <img src = {Logo} alt='Logo' className="w-62 h-62 lg:w-68 lg:h-68 object-contain"/>
            </div>
        </div>
    )
}