"use client"
import Image from "next/image";
import { InputForm } from "../customInputs/input";
import IconArrow from "@/assets/arrowDown.svg";
import { useState } from "react";

// Config para validar e pegar os dados do formulário
import { useForm } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from "yup";
import { sendReport } from "@/services/suport";
import { Bounce, toast } from "react-toastify";

const schema = yup.object({
    message: yup.string().trim().required("Porfavor, digite seu problema")
}).required();

type ReportUserProblemProps = {
    message: string;
}

type FormSupportProps = {
    emailToUser: string;
    userName: string;
}

export function FormSupport({emailToUser, userName}: FormSupportProps) {
    const [stateBoxSupport, setStateBoxSupport] = useState<boolean>(false);
    const [textReport, setTextReport] = useState<string>('')
    const [stateLoadingPassword, setStateLoadingPassword] = useState<boolean>(false)

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(schema)
    });

    function handleClickStateBoxSupport() {
        if(stateBoxSupport == false) {
            setStateBoxSupport(true)
        } else {
            setStateBoxSupport(false)
        }
    }

    async function onSubmit({message}:ReportUserProblemProps) {
        try {
            setStateLoadingPassword(true);
            await sendReport({
                message: message,
                userEmail: emailToUser,
                userName: userName
            })
            toast.success("Enviado com sucesso!", {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "dark",
                transition: Bounce,
            });
            setTextReport('')
            setStateBoxSupport(false)
        } catch {
            toast.error("Erro ao enviar", {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "dark",
                transition: Bounce,
            });
            setStateLoadingPassword(false)
        } finally {
            setStateLoadingPassword(false)
        }
    }

    return (
        <div className="fixed md:right-6 right-0 bottom-0 bg-gray-400 overflow-hidden rounded-t-md transition-all w-full md:w-fit z-50">
            <button className="bg-gray-700 p-3 flex items-center justify-between w-full" onClick={handleClickStateBoxSupport}>
                <span>⚙️ Suporte</span>
                <Image
                    src={IconArrow}
                    alt="Icone da aba fechada"
                    className={stateBoxSupport ? "w-5 rotate-0 transition-all ease-in" : "w-5 rotate-180 transition-all ease-out"}
                />
            </button>
            <form className={stateBoxSupport ? "h-fit transition-all ease-in" : "md:w-56 w-full opacity-0 transition-all ease-out h-0"} onSubmit={handleSubmit(onSubmit)}>
                <div className="p-4">
                    <p className="text-base mb-2">Como posso ajudar? 👨🏻‍💻</p>
                    <textarea
                        className="px-4 py-2 placeholder:text-gray-300 bg-gray-500 focus:outline-0 focus:border focus:border-purple border border-transparent transition resize-none h-28 text-base w-full"
                        {...register("message")}
                        placeholder="Digite seu problema..."
                        value={textReport}
                        onChange={content => setTextReport(content.target.value)}
                    />
                    <InputForm
                        type="submit"
                        textButton="Enviar"
                        stateLoadingPassword={stateLoadingPassword}
                    />
                </div>
            </form>
        </div>
    )
}