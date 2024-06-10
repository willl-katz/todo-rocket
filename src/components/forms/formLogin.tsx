'use client'
import Image from "next/image";
import { Dispatch, SetStateAction, useContext, useState } from "react";
import ContainerGrid from "../container";
import imgMarcaLogin from "@/assets/img-marca-login.png";
import { InputForm } from "../customInputs/input";
import { AuthContext } from "@/hooks/useAuth";
import { GoogleLogin } from '@react-oauth/google';

// Config para validar e pegar os dados do formulário
import { useForm } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from "yup";

const schema = yup.object({
    email: yup.string().trim().required('Preencha o Email').email('Email Inválido'),
    password: yup.string().trim().required('Preencha a Senha')
}).required();

interface User {
    email: string;
    password: string;
}

type FormLoginProps = {
    setStateRegisterUser: Dispatch<SetStateAction<boolean>>;
    setStateForgotPasswordUser: Dispatch<SetStateAction<boolean>>;
}

export function FormLogin({setStateRegisterUser, setStateForgotPasswordUser}:FormLoginProps) {
    const { signIn, error:errorAuth, responseGoogle } = useContext(AuthContext)
    const [error, setError] = useState('')
    const [stateLoadingPassword, setStateLoadingPassword] = useState<boolean>(false)

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(schema)
    });

    async function onSubmit(data: User) {
        try {
            setStateLoadingPassword(true)
            await signIn(data)
        } catch(err: any) {
            setError(err.message)
            setStateLoadingPassword(false)
        } finally {
            setStateLoadingPassword(false)
        }
    }

    function handleClickRegister() {
        setStateRegisterUser(true)
    }

    function handleClickForgotPassword() {
        setStateForgotPasswordUser(true)
    }

    return (
        <>
            <section className="-mt-16 mb-4">
                <ContainerGrid className="flex flex-col items-center gap-4">
                    <div className="w-fit flex flex-col items-center gap-4">
                        <Image
                            src={imgMarcaLogin}
                            alt="Ilustração da marca"
                        />
                        <h1>Bem-Vindo Astronauta!</h1>
                    </div>
                    <form onSubmit={handleSubmit(onSubmit)} className="w-fit flex flex-col gap-1">
                        <div className="flex flex-col gap-2">
                            <InputForm
                                type="text"
                                placeholder="Email"
                                registerYup={register("email")}
                                errors={errors.email?.message}
                            />
                            <span className="text-danger text-base block">{errors.email?.message}</span>
                        </div>
                        <div className="flex flex-col gap-2">
                            <InputForm
                                type="password"
                                placeholder="Senha"
                                registerYup={register("password")}
                                errors={errors.password?.message}
                            />
                            <span className="text-danger text-base block">{errors.password?.message}</span>
                        </div>
                        <span className="text-danger text-base">{errorAuth != "" ? errorAuth : error}</span>
                        <InputForm type="submit" textButton="Logar" stateLoadingPassword={stateLoadingPassword}/>
                    </form>
                    <div className="flex flex-col gap-2 items-center">
                        {/* <button
                            className="px-4 py-2 placeholder:text-gray-200 bg-transparent flex gap-2 items-center justify-center hover:bg-blue-hover hover:bg-opacity-30 transition relative border border-gray-200 hover:border-blue-hover hover:border-opacity-0 w-full flex items-center justify-center gap-4 font-semibold tracking-wide"
                            onClick={handleClickGoogle}
                        >
                            <Image
                                src={iconGoogle}
                                alt="logar com a conta google"
                                className="w-8"
                            />
                            Google
                        </button> */}
                        <div className="mb-4">
                            <GoogleLogin
                                onSuccess={responseGoogle}
                                onError={() => {
                                    setError("Erro no login")
                                }}
                            />
                        </div>
                        <button
                            className="hover:text-blue hover:underline transition"
                            onClick={handleClickRegister}
                        >
                            Você não tem conta? Registre-se
                        </button>
                        <button
                            className="hover:text-blue hover:underline transition"
                            onClick={handleClickForgotPassword}
                        >
                            Esqueceu a senha?
                        </button>
                    </div>
                </ContainerGrid>
            </section>
        </>
    );
}