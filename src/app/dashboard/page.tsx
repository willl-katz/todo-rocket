'use client'
import { Header } from "@/components/header";
import Loading from "@/components/loading";
import FormTasks from "@/components/forms/formAddTask";
import ListTasks from "@/components/listTasks";
import { AuthContext } from "@/hooks/useAuth";
import { parseCookies } from "nookies";
import { useContext, useEffect, useState } from "react";
import { redirect } from "next/navigation";
import { FormSupport } from "@/components/forms/formSupport";

import { Bounce, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';


export default function Dashboard() {
    const { user } = useContext(AuthContext)
    const [stateAddTask, setStateAddTask] = useState<boolean>(false)

    return !user ? <Loading/> : (
        <>
            <Header
            ContainsUser
            profile={user?.avatar_url}
            username={user?.username}
            />
            <FormTasks id={user.id} setStateAddTask={setStateAddTask}/>
            <ListTasks id={user.id} setStateAddTask={setStateAddTask} stateAddTask={stateAddTask}/>
            <FormSupport emailToUser={user.email} userName={user.username} />
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