'use client'
import Image from "next/image";
import imgMarcaLogin from "@/assets/img-marca-login.png";
import { InputForm } from "../customInputs/input";
import { Dispatch, SetStateAction, useContext, useEffect, useState } from "react";
import { AuthContext } from "@/hooks/useAuth";
import ContainerGrid from "../container";

// Config para validar e pegar os dados do formulário
import { useForm } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from "yup";
import { Bounce, toast } from "react-toastify";

const schemaConfirmEmail = yup.object({
    token_confirm_email: yup.string().uppercase().required("Preencha o token enviado no seu email")
}).required();

type OnSubmitProps = {
    token_confirm_email: string
}

type FormConfirmEmailProps = {
    onSubmitExternal?:(data:any) => Promise<void> | undefined;
    handleClickResendExternal?:() => Promise<void>;
    setStateRegisterUser?: Dispatch<SetStateAction<boolean>>;
    timeResendCodeExternal?: number;
}

export function FormConfirmEmail({onSubmitExternal, handleClickResendExternal, timeResendCodeExternal = 0, setStateRegisterUser}:FormConfirmEmailProps) {
    const { confirmEmailUser, resendCodeEmail, user } = useContext(AuthContext)
    const [stateLoadingPassword, setStateLoadingPassword] = useState<boolean>(false)
    const [timeResendCode, setTimeResendCode] = useState<number>(0)

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(schemaConfirmEmail)
    });

    useEffect(() => {
        if (timeResendCode > 0) {
            setTimeout(() => {
                setTimeResendCode(timeResendCode - 1)
            }, 1000)
        }
    }, [timeResendCode])

    async function onSubmit(data:OnSubmitProps) {
        try {
            setStateLoadingPassword(true)
            await confirmEmailUser(data.token_confirm_email)
        } catch (err:any) {
            console.log(err.message);
            setStateLoadingPassword(true)
        } finally {
            setStateLoadingPassword(false)
            if(setStateRegisterUser) {
                setStateRegisterUser(false)
            }
        }
    }

    async function handleClickResend() {
        try {
            if (user == null) throw new Error("Usuário não encontrado.");
            await resendCodeEmail({
                emailForm: user.email
            });
            setTimeResendCode(30)
        } catch (err:any) {
            console.log(err.message);
        }
    }

    return (
        <section className="-mt-16 mb-4">
        <ContainerGrid className="flex flex-col items-center gap-4">
            <div className="w-fit flex flex-col items-center gap-4">
                <Image
                    src={imgMarcaLogin}
                    alt="Ilustração da marca"
                />
                <div className="text-center">
                    <h2>Precisa do código de confirmação enviado no seu email registrado.</h2>
                    <h3><strong>ATENÇÂO:</strong> Verifique sua lixeira, caso não encontre na caixa de entrada 😉</h3>
                </div>
            </div>
            <form onSubmit={onSubmitExternal ? handleSubmit(onSubmitExternal) : handleSubmit(onSubmit)} className="w-fit flex flex-col gap-2 mx-auto mt-4">
                    <div className="flex flex-col gap-2">
                        <InputForm
                            type="text"
                            placeholder="Cole ou digite o código"
                            registerYup={register("token_confirm_email")}
                            errors={errors.token_confirm_email?.message}
                        />
                        <span className="text-danger text-base block">{errors.token_confirm_email?.message}</span>
                    </div>
                    <InputForm type="submit" textButton="Confirmar" stateLoadingPassword={stateLoadingPassword}/>
                    <InputForm type="button" textButton={timeResendCode > 0 ? `00:${timeResendCode.toString().padStart(2, "0")} - Reenviar Código` : timeResendCodeExternal > 0 ? `00:${timeResendCodeExternal.toString().padStart(2, "0")} - Reenviar Código` : "Reenviar Código"} stateLoadingPassword={stateLoadingPassword} onClick={handleClickResendExternal ? handleClickResendExternal : handleClickResend} disabled={timeResendCode > 0 ? true : timeResendCodeExternal > 0}/>
            </form>
        </ContainerGrid>
    </section>
    )
}