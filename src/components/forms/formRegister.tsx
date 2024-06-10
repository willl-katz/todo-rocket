import Image from "next/image";
import imgMarcaLogin from "@/assets/img-marca-login.png";
import { Dispatch, SetStateAction, useContext, useEffect, useState } from "react";
import ContainerGrid from "../container";
import { InputForm } from "../customInputs/input";
import { AuthContext } from "@/hooks/useAuth";

// Config para os avisos
import { Bounce, toast } from "react-toastify";

// Config para validar e pegar os dados do formulário
import { useForm } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from "yup";
import { FormConfirmEmail } from "./formConfirmEmail";
import { sendCodeConfirmEmail } from "@/services/auth";

type User = {
    username: string;
    email: string;
    password: string;
    token_confirm_email_register?: string;
}

type OnSubmitConfirmEmailProps = {
    token_confirm_email: string
}

type FormLoginProps = {
    setStateRegisterUser: Dispatch<SetStateAction<boolean>>;
}

const schema = yup.object({
    username: yup.string().trim().required('Preencha seu username').lowercase(),
    email: yup.string().required('Preencha o Email').email('Email Inválido'),
    password: yup.string().trim().required('Preencha a Senha'),
    password_confirmation: yup.string().oneOf([undefined, yup.ref('password')], 'As senhas precisam ser iguais')
}).required();

export function FormRegister({setStateRegisterUser}:FormLoginProps) {
    const { register: registerUser, confirmEmailUser, signIn } = useContext(AuthContext)
    const [stateLoadingPassword, setStateLoadingPassword] = useState<boolean>(false)
    const [stepForm, setStepForm] = useState<number>(1)
    const [emailForm, setEmailForm] = useState<string>("")

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(schema)
    });

    async function onSubmitUser(data: User) {
        try {
            if(!data) return;
            await registerUser(data)
            setStepForm(stepForm + 1)
            signIn({
                email: data.email,
                password: data.password
            })
        } catch (err:any) {
            if(err.message === 'duplicar valor da chave viola a restrição de unicidade "users_email_key"') {
                toast.error("Já existe esse email", {
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
            } else if(err.message === 'duplicar valor da chave viola a restrição de unicidade "users_username_key"') {
                toast.error("Esse nome de usuário já existe", {
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
            } else {
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
    }

    function handleClickReturnLogin() {
        setStateRegisterUser(false)
    }

    return (
        <>
            <section className={stepForm == 2 ? "mb-4" : "-mt-16 mb-4"}>
                <ContainerGrid className="flex flex-col items-center gap-4">
                    {
                        stepForm != 2 &&
                        <div className="w-fit flex flex-col items-center gap-4">
                            <Image
                                src={imgMarcaLogin}
                                alt="Ilustração da marca"
                            />
                            <h2 className="text-center">Registre-se Astronauta!<br/> E faça parte desse mundo</h2>
                        </div>
                    }
                        {
                            stepForm == 1 &&
                            <form onSubmit={handleSubmit(onSubmitUser)}>
                                <div className="w-fit flex flex-col gap-1">
                                    <div className="flex flex-col gap-2">
                                        <InputForm
                                            type="text"
                                            placeholder="Nome de usuário"
                                            registerYup={register("username")}
                                            errors={errors.username?.message}
                                        />
                                        <span className="text-danger text-base block">{errors.username?.message}</span>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <InputForm
                                            type="text"
                                            placeholder="Email"
                                            registerYup={register("email")}
                                            errors={errors.email?.message}
                                            value={emailForm}
                                            onChange={content => setEmailForm(content.target.value)}
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
                                    <div className="flex flex-col gap-2">
                                        <InputForm
                                            type="password"
                                            placeholder="Confirmar a Senha"
                                            registerYup={register("password_confirmation")}
                                            errors={errors.password_confirmation?.message}
                                        />
                                        <span className="text-danger text-base block">{errors.password_confirmation?.message}</span>
                                    </div>
                                    <button type="button" className="hover:text-blue hover:underline transition" onClick={handleClickReturnLogin}>Lembrou da sua conta? Faça o login</button>
                                    <InputForm type="submit" textButton="Continuar >" stateLoadingPassword={stateLoadingPassword} className="mt-4"/>
                                </div>
                            </form>
                        }
                        {
                            stepForm == 2 &&
                            <FormConfirmEmail/>
                        }
                </ContainerGrid>
            </section>
        </>
    );
}
