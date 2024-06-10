import Image from "next/image";
import ContainerGrid from "../container";
import imgMarcaLogin from "@/assets/img-marca-login.png";
import { InputForm } from "../customInputs/input";
import { Bounce, toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { Dispatch, SetStateAction, useContext, useState } from "react";
import { FormConfirmEmail } from "./formConfirmEmail";

// Config para validar e pegar os dados do formulário
import { useForm } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from "yup";
import { changePassword, confirmEmail, sendCodeConfirmEmail, verifyEmailExists } from "@/services/auth";
import { AuthContext } from "@/hooks/useAuth";

const schemaEmail = yup.object({
    email_forgot_password: yup.string().trim().required('Preencha o Email').email('Email Inválido')
}).required();

const schemaPassword = yup.object({
    forgot_password: yup.string().trim().required('Preencha a nova Senha')
}).required();

type OnSubmitProps = {
    token_confirm_email: string
}

type TempUserProps = {
    email: string,
    id: number
}

type FormForgotPasswordProps = {
    setStateForgotPasswordUser: Dispatch<SetStateAction<boolean>>;
}

export function FormForgotPassword({setStateForgotPasswordUser}:FormForgotPasswordProps) {
    const { resendCodeEmail } = useContext(AuthContext)
    const [stepForm, setStepForm] = useState<number>(1)
    const [tokenEmailUser, setTokenEmailUser] = useState<string>('')
    const [tempUser, setTempUser] = useState<TempUserProps>()
    const [timeResendCode, setTimeResendCode] = useState<number>(0)

    const formEmail = useForm({
        resolver: yupResolver(schemaEmail)
    });

    const formPassword = useForm({
        resolver: yupResolver(schemaPassword)
    });

    async function onSubmitEmail({ email_forgot_password }:{email_forgot_password: string;}) {
        console.log(email_forgot_password);
        try {
            let tempUser = await verifyEmailExists(email_forgot_password)
            if (tempUser.length > 0) {
                let tokenEmail = await sendCodeConfirmEmail({
                    userEmail: email_forgot_password
                })
                setTempUser(tempUser[0])
                setTokenEmailUser(tokenEmail)
                setStepForm(stepForm + 1)
            } else {
                throw Error('Este email não existe em nenhuma conta')
            }
        } catch (err:any) {
            toast.error(err.message, {
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
        }
    }

    async function onSubmitConfirmEmail({token_confirm_email}:OnSubmitProps) {
        try {
            if (!tempUser) throw Error("Usuário temporário não encontrado")
            await confirmEmail({
                id: tempUser.id,
                tokenEmail: tokenEmailUser,
                tokenEmailForm: token_confirm_email
            })
            setStepForm(stepForm + 1)
        } catch (err:any) {
            toast.error(err.message, {
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
        }
    }

    async function onSubmitChangePassword({ forgot_password }:{forgot_password: string;}) {
        try {
            if (!tempUser) throw Error("Usuário temporário não encontrado")
            await changePassword({
                newPassword: forgot_password,
                tempId: tempUser.id
            })
            setStateForgotPasswordUser(false);
            toast.success("Senha atualizada com sucesso", {
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
        } catch (err:any) {
            toast.error(err.message, {
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
        }
    }

    async function handleClickResend() {
        try {
            if(!tempUser) return;
            const tokenEmail = await resendCodeEmail({
                emailForm: tempUser.email
            });
            if(!tokenEmail) return;
            setTokenEmailUser(tokenEmail)
            setTimeResendCode(30)
        } catch (err:any) {
            console.log(err.message);
        }
    }

    return (
        <>
            <section className={stepForm == 2 ? "-mt-0" : "-mt-16"}>
                <ContainerGrid className="flex flex-col items-center justify-center">
                    {
                        stepForm == 1 &&
                        <>
                            <div className="w-fit flex flex-col items-center gap-4 mb-4">
                                <Image
                                    src={imgMarcaLogin}
                                    alt="Ilustração da marca"
                                />
                                <h1>Digite o email da sua conta</h1>
                            </div>
                            <form onSubmit={formEmail.handleSubmit(onSubmitEmail)} className="w-72">
                                <div className="flex flex-col gap-2">
                                    <InputForm
                                        type="text"
                                        placeholder="Email"
                                        registerYup={formEmail.register("email_forgot_password")}
                                        errors={formEmail.formState.errors.email_forgot_password?.message}
                                    />
                                    <span className="text-danger text-base block">{formEmail.formState.errors.email_forgot_password?.message}</span>
                                </div>
                                <InputForm
                                    type="submit"
                                    textButton="Confirmar"
                                    className="w-full"
                                />
                            </form>
                        </>
                    }
                    {
                        stepForm == 2 &&
                        <FormConfirmEmail
                            onSubmitExternal={onSubmitConfirmEmail}
                            handleClickResendExternal={handleClickResend}
                            timeResendCodeExternal={timeResendCode}
                        />
                    }
                    {
                        stepForm == 3 &&
                        <>
                            <div className="w-fit flex flex-col items-center gap-4 mb-4">
                                <Image
                                    src={imgMarcaLogin}
                                    alt="Ilustração da marca"
                                />
                                <h1>Escreva sua nova senha</h1>
                            </div>
                            <form onSubmit={formPassword.handleSubmit(onSubmitChangePassword)} className="w-72">
                                <div className="flex flex-col gap-2">
                                    <InputForm
                                        type="password"
                                        placeholder="Digite a senha"
                                        registerYup={formPassword.register("forgot_password")}
                                        errors={formPassword.formState.errors.forgot_password?.message}
                                    />
                                    <span className="text-danger text-base block">{formPassword.formState.errors.forgot_password?.message}</span>
                                </div>
                                <InputForm
                                    type="submit"
                                    textButton="Confirmar"
                                />
                            </form>
                        </>
                    }
                </ContainerGrid>
            </section>
        </>
    )
}