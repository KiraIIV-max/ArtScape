import img from "../../src/assets/clip-message-sent 1.png"; 
import Photoroom from "../../src/assets/1-2Photoroom.png"; 
import Navbar from "../components/Navbar"; 
import React, { useEffect, useRef, useState } from "react"; 
import gsap from "gsap"; 
import { ScrollTrigger } from "gsap/ScrollTrigger"; 
// import axios from "axios"; 

gsap.registerPlugin(ScrollTrigger); 

const Register = () => { 
  const container = useRef(); 

  // const [successMsg, setSuccessMsg] = useState(""); 
  // const [errorMsg, setErrorMsg] = useState(""); 

  useEffect(() => { 
    let ctx = gsap.context(() => { 
      gsap.from(".reg-item", { 
        opacity: 0, 
        x: -300, 
        delay: 0.2, 
        duration: 4, 
        ease: "power2.out", 
      }); 
    }, container); 

    return () => ctx.revert(); 
  }, []); 

  const handlelayout = () => { 
    const el1 = document.getElementById("layout"); 
    el1.classList.remove("hidden"); 
    const el2 = document.getElementById("layout2"); 
    el2.classList.add("hidden"); 

    const el3 = document.getElementById("layout3"); 
    el3.classList.add("hidden"); 

    const el4 = document.getElementById("layout4"); 
    el4.classList.remove("opacity-0"); 
    el4.classList.add("ml-32"); 
    const el5 = document.getElementById("layout5"); 
    el5.classList.add("hidden"); 
  }; 

  // const handleRegister = (e) => { 
  //   e.preventDefault(); 

  //   const fullname = e.target.fullname.value; 
  //   const email = e.target.email.value; 
  //   const password = e.target.password.value; 

  //   axios 
  //     .post("http://localhost/php-api/register.php", { 
  //       fullname, 
  //       email, 
  //       password, 
  //     }) 
  //     .then((res) => { 
  //       console.log(res.data); 

  //       if (res.data.status === "success") { 
  //         setSuccessMsg(res.data.message); 
  //         setErrorMsg(""); 
  //         e.target.reset(); 
  //       } else if (res.data.status === "error") { 
  //         setErrorMsg(res.data.errors.join(" | ")); 
  //         setSuccessMsg(""); 
  //       } 
  //     }) 
  //     .catch(() => { 
  //       setErrorMsg("Something went wrong. Try again."); 
  //       setSuccessMsg(""); 
  //     }); 
  // }; 

  // const handleLogin = (e) => { 
  //   e.preventDefault(); 

  //   const email = e.target.email.value; 
  //   const password = e.target.password.value; 

  //   axios 
  //     .post("http://localhost/php-api/login.php", { email, password }) 
  //     .then((res) => { 
  //       if (res.data.status === "success") { 
  //         setSuccessMsg(res.data.message); 
  //         setErrorMsg(""); 
  //         e.target.reset(); 
  //       } else if (res.data.status === "error") { 
  //         setErrorMsg(res.data.errors.join(" | ")); 
  //         setSuccessMsg(""); 
  //       } 
  //     }) 
  //     .catch(() => { 
  //       setErrorMsg("Something went wrong. Try again."); 
  //       setSuccessMsg(""); 
  //     }); 
  // }; 

  return ( 
    <> 
      <section ref={container} className="ml-10 gap-10 items-center justify-center h-screen flex-row flex" > 
        <div className="mx-20 my-8"> 
          <div className="pb-14"> 
            <h1 className="font-bold text-4xl font-style italic"> 
              ArtScape{" "} 
              <img src={Photoroom} alt="logo" className="w-20 h-20 m-0 p-0 inline-block" />{" "} 
              Universe 
            </h1> 
          </div> 

          <div> 
            <p className="uppercase font-serif text-gray-500 text-sm"> 
              start for free 
            </p> 
            <h1 className="text-5xl pb-3 font-serif"> 
              Create an account{" "} 
              <span className="text-7xl text-blue-600">.</span> 
            </h1> 
            <p className="uppercase text-gray-500 text-sm"> 
              Already have an account?{" "} 
              <span onClick={handlelayout} id="layout5" className="cursor-pointer text-blue-600" > 
                Log In 
              </span> 
            </p> 
          </div> 

          {/* SUCCESS MESSAGE 
          {successMsg && ( 
            <p className="text-green-600 font-semibold mt-4">{successMsg}</p> 
          )} 

          ERROR MESSAGE 
          {errorMsg && ( 
            <p className="text-red-600 font-semibold mt-4">{errorMsg}</p> 
          )}  */}

          {/* register Form */} 
          <form  id="layout2" className="w-full flex flex-col gap-7 mt-10" > 
            <label className=" text-black font-semibold"> 
              Name{" "} 
              <input 
                placeholder="Enter your name" 
                required 
                type="text" 
                name="fullname" 
                className=" block rounded-full w-xl ml-3 px-10 py-3 bg-gray-200" 
              /> 
            </label> 

            <label className="text-black font-semibold"> 
              Email{" "} 
              <input 
                placeholder="Enter your email" 
                required 
                type="email" 
                name="email" 
                className="block rounded-full w-xl ml-3 px-10 py-3 bg-gray-200" 
              /> 
            </label> 

            <label className="text-black font-semibold"> 
              Password{" "} 
              <input 
                placeholder="Set a password" 
                required 
                type="password" 
                name="password" 
                className="block rounded-full w-xl ml-3 px-10 py-3 bg-gray-200" 
              /> 
            </label> 

            <button 
              type="submit" 
              className="cursor-pointer text-xl w-fit transition duration-300 ease-in-out group hover:-translate-y-1.5 hover:scale-105 ml-52 mt-8 z-20  px-4 py-2 text-white relative overflow-hidden" 
            > 
              Create account 
              <span className="absolute left-0 bottom-0 rounded-full w-full bg-blue-600 -z-10 h-full transition-all duration-500 ease-in-out"></span> 
            </button> 
          </form> 

          {/* Login Form */} 
          <form id="layout"  className=" hidden w-full flex flex-col gap-7 mt-10" > 
            <label className="text-black font-semibold"> 
              Email 
              <input 
                placeholder="Enter your email" 
                required 
                type="email" 
                name="email" 
                className="block rounded-full w-xl ml-3 px-10 py-3 bg-gray-200" 
              /> 
            </label> 

            <label className="text-black font-semibold"> 
              Password 
              <input 
                placeholder="Enter your password" 
                required 
                type="password" 
                name="password" 
                className="block rounded-full w-xl ml-3 px-10 py-3 bg-gray-200" 
              /> 
            </label> 

            <button className=" ml-52 cursor-pointer text-xl w-fit transition duration-300 ease-in-out group hover:-translate-y-1.5 hover:scale-105 mt-8 z-20  px-4 py-2 text-white relative overflow-hidden"> 
              Log in 
              <span className="absolute left-0 bottom-0 rounded-full w-full bg-blue-600 -z-10 h-full transition-all duration-500 ease-in-out"></span> 
            </button> 
          </form> 
        </div> 

        <div> 
          <span className="absolute top-0 right-0 -z-10 bg-slate-50 w-1/2 h-full"></span> 
          <img src={img} alt="art" className="reg-item w-full h-full object-cover" /> 
        </div> 
      </section> 
    </> 
  ); 
}; 

export default Register;
