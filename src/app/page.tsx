'use client'
import { FormConfirmEmail } from "@/components/forms/formConfirmEmail";
import { FormForgotPassword } from "@/components/forms/formForgotPassword";
import { FormLogin } from "@/components/forms/formLogin";
import { FormRegister } from "@/components/forms/formRegister";
import { Header } from "@/components/header";
import { AuthContext } from "@/hooks/useAuth";
import { useContext, useEffect, useState } from "react";

import { Bounce, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

export default function Home() {
  const { notConfirmEmail } = useContext(AuthContext)
  const [stateRegisterUser, setStateRegisterUser] = useState<boolean>(false)
  const [stateForgotPasswordUser, setStateForgotPasswordUser] = useState<boolean>(false)

  useEffect(() => {}, [stateRegisterUser, stateForgotPasswordUser])

  return (
    <>
      <Header/>
      {
        notConfirmEmail ? <FormConfirmEmail setStateRegisterUser={setStateRegisterUser}/> : !stateRegisterUser ?
        !stateForgotPasswordUser ? <FormLogin setStateRegisterUser={setStateRegisterUser} setStateForgotPasswordUser={setStateForgotPasswordUser}/> : <FormForgotPassword setStateForgotPasswordUser={setStateForgotPasswordUser} /> :
        <FormRegister setStateRegisterUser={setStateRegisterUser}/>
      }
      <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
          transition={Bounce}
      />
    </>
  );
}

