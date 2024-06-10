"use client"
import ContainerGrid from "@/components/container";
import { Header } from "@/components/header";
import Loading from "@/components/loading";
import { redirect } from "next/navigation";
import { parseCookies } from "nookies";
import { useContext, useEffect, useState } from "react";
import { FormInformationProfileUser } from "@/components/forms/formInformationProfile";
import { AuthContext } from "@/hooks/useAuth";

import { Bounce, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

export default function Account() {
    const { user, setUser } = useContext(AuthContext)

    return !user ? <Loading/> : (
        <>
            <Header/>
            <section>
                <ContainerGrid>
                    <FormInformationProfileUser
                        user={user}
                        setUser={setUser}
                    />
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
                </ContainerGrid>
            </section>
        </>
    )
}