"use client"
import Image from "next/image";
import { InputForm } from "../customInputs/input";
import userDefault from "@/assets/user-default.png";
import axios from "axios";
import { FormConfirmEmail } from "./formConfirmEmail";
import { useContext, useEffect, useState } from "react";
import { confirmEmail, sendCodeConfirmEmail, updateProfile, verifyEmailExists } from "@/services/auth";
import { Bounce, toast } from "react-toastify";

// Config para validar e pegar os dados do formulário
import { useForm } from "react-hook-form";
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from "yup";
import { AuthContext } from "@/hooks/useAuth";

type DataImageProps = {
    data: {
        filename: string,
        httpfilepath: string
    }
}

type User = {
    id: number;
    username: string;
    email: string;
    avatar_url: string;
    token?: string | undefined;
}

interface UserUpdateProps {
    usernameUpdate?: string | undefined;
    emailUpdate?: string | undefined;
    passwordUpdate?: string | undefined;
    avatar_url?: string | undefined;
}

type UserProps = {
    user: {
        id: number;
        username: string;
        email: string;
        avatar_url: string;
    },
    setUser: (data: User | null) => void
}

type OnSubmitConfirmEmailProps = {
    token_confirm_email: string
}

const schemaUpdate = yup.object({
    usernameUpdate: yup.string().lowercase().trim(),
    emailUpdate: yup.string().email('Email Inválido'),
    passwordUpdate: yup.string().trim(),
    passwordUpdate_confirmation: yup.string().trim().oneOf([undefined, yup.ref('passwordUpdate')], 'As senhas precisam ser iguais')
}).required();

export function FormInformationProfileUser({user, setUser}:UserProps) {
    const { resendCodeEmail } = useContext(AuthContext)
    const [uploading, setUploading] = useState(false);
    const [selectFile, setSelectFile] = useState<File | undefined>();
    const [linkImage, setLinkImage] = useState("")
    const [textPasswordChange, setTextPasswordChange] = useState<string>("")
    const [stepForm, setStepForm] = useState<number>(1)
    const [tokenEmailUser, setTokenEmailUser] = useState<string>("")
    const [tempUser, setTempUser] = useState<UserUpdateProps>()
    const [timeResendCode, setTimeResendCode] = useState<number>(0)

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(schemaUpdate)
    });

    useEffect(() => {}, [tokenEmailUser, tempUser])

    useEffect(() => {
        if (timeResendCode > 0) {
            setTimeout(() => {
                setTimeResendCode(timeResendCode - 1)
            }, 1000)
        }
    }, [timeResendCode])

    async function onSubmitVerifyEmail(data:OnSubmitConfirmEmailProps) {
        try {
            if (selectFile) {
                setUploading(true)
                await confirmEmail({
                    id: user.id,
                    tokenEmail: tokenEmailUser,
                    tokenEmailForm: data.token_confirm_email
                })
                await updateProfile({
                    id: user.id,
                    username: tempUser?.usernameUpdate,
                    email: tempUser?.emailUpdate,
                    password: tempUser?.usernameUpdate,
                    avatar_url: tempUser?.avatar_url
                })
                setUser(null)
                setTimeout(() => {
                    toast.success("Seus dados foram alterados com sucesso!", {
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
                }, 1000)
            } else {
                await confirmEmail({
                    id: user.id,
                    tokenEmail: tokenEmailUser,
                    tokenEmailForm: data.token_confirm_email
                })
                await updateProfile({
                    id: user.id,
                    username: tempUser?.usernameUpdate,
                    email: tempUser?.emailUpdate,
                    password: tempUser?.usernameUpdate
                })
                setUser(null)
                setTimeout(() => {
                    toast.success("Seus dados foram alterados com sucesso!", {
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
                }, 1000)
            }
        } catch(err: any) {
            setTimeout(() => {
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
            }, 1000)
            setUploading(false)
        } finally {
            setUploading(false)
        }
    }

    async function uploadImage({ emailUpdate, passwordUpdate, usernameUpdate }:UserUpdateProps) {
        try {
            if(selectFile) {
                setUploading(true);
                const formData = new FormData();
                formData.append("myImage", selectFile);
                const { data }:DataImageProps = await axios.post("/api/upimage", formData);
                if (emailUpdate) {
                    let EmailExist = await verifyEmailExists(emailUpdate)
                    if (EmailExist) throw new Error("Este email já é utilizado por outra conta")
                    let tokenEmail = ""
                    tokenEmail = await sendCodeConfirmEmail({
                        userEmail: emailUpdate
                    })
                    setTokenEmailUser(tokenEmail)
                    setTempUser({
                        emailUpdate,
                        passwordUpdate,
                        usernameUpdate,
                        avatar_url: data.httpfilepath.toString()
                    })
                    setStepForm(stepForm + 1)
                } else {
                    await updateProfile({
                        id: user.id,
                        username: usernameUpdate,
                        email: emailUpdate,
                        password: passwordUpdate,
                        avatar_url: data.httpfilepath.toString()
                    })
                    setUser(null)
                }
                setUploading(false);
            } else {
                if (emailUpdate) {
                    let EmailExist = await verifyEmailExists(emailUpdate)
                    if (EmailExist) throw new Error("Este email já é utilizado por outra conta")
                    let tokenEmail = await sendCodeConfirmEmail({
                        userEmail: emailUpdate
                    })
                    setTokenEmailUser(tokenEmail)
                    setTempUser({
                        emailUpdate,
                        passwordUpdate,
                        usernameUpdate,
                    })
                    setStepForm(stepForm + 1)
                } else {
                    await updateProfile({
                        id: user.id,
                        username: usernameUpdate,
                        email: emailUpdate,
                        password: passwordUpdate
                    })
                    setUser(null)
                    setTimeout(() => {
                        toast.success("Seus dados foram alterados com sucesso!", {
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
                    }, 1000)
                }
            }
        } catch (error: any) {
            console.log(error.response?.data);
            if(error.message == 'duplicar valor da chave viola a restrição de unicidade "users_username_key"') {
                toast.error("Nome de usuário já existe", {
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
                return
            }
            toast.error(error.message, {
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
            if (uploading) {
                setUploading(false);
            }
        }
    }

    const handleUpload = async (dataUser:UserUpdateProps) => {
        try {
            await uploadImage({
                usernameUpdate: dataUser.usernameUpdate,
                emailUpdate: dataUser.emailUpdate,
                passwordUpdate: dataUser.passwordUpdate,
            })
        } catch {
            toast.error("Erro na atualização dos seus dados", {
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
    };

    async function handleClickResend() {
        try {
            if(!tempUser) return;
            const tokenEmail = await resendCodeEmail({
                emailForm: tempUser.emailUpdate
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
            {
                stepForm == 1 &&
                <form onSubmit={handleSubmit(handleUpload)} encType="multipart/form-data" className="-mt-14 flex flex-col items-center w-full gap-2 mb-8">
                    <div className="rounded-full overflow-hidden relative w-40 h-40 mb-2">
                        <Image
                            src={linkImage != '' ? linkImage : user?.avatar_url ? user.avatar_url : userDefault}
                            alt="Imagem referente ao usuario"
                            width={100}
                            height={100}
                            quality={100}
                            className="w-full bg-white"
                        />
                        <InputForm
                            type="file"
                            className="appearance-none w-full h-full absolute top-0 left-0 bg-transparent cursor-pointer file:text-transparent file:bg-transparent file:outline-none file:border-none"
                            onChange={({target}) => {
                                if(target.files) {
                                    setLinkImage(URL.createObjectURL(target.files[0]));
                                    setSelectFile(target.files[0])
                                }
                            }}
                            accept="image/*"
                        />
                    </div>
                    <div className="flex flex-col gap-2 w-full max-w-72">
                        <InputForm
                            type="text"
                            placeholder={user.username}
                            registerYup={register("usernameUpdate")}
                            errors={errors.usernameUpdate?.message}
                        />
                        <span className="text-danger text-base block">{errors.usernameUpdate?.message}</span>
                    </div>
                    <div className="flex flex-col gap-2 w-full max-w-72">
                        <InputForm
                            type="text"
                            placeholder={user.email}
                            registerYup={register("emailUpdate")}
                            errors={errors.emailUpdate?.message}
                        />
                        <span className="text-danger text-base block">{errors.emailUpdate?.message}</span>
                    </div>
                    <div className="flex flex-col gap-2 w-full max-w-72">
                        <InputForm
                            type="password"
                            placeholder="Digite sua nova senha"
                            registerYup={register("passwordUpdate")}
                            errors={errors.passwordUpdate?.message}
                            value={textPasswordChange}
                            onChange={content => {
                                setTextPasswordChange(content.target.value)
                            }}
                        />
                        <span className="text-danger text-base block">{errors.passwordUpdate?.message}</span>
                    </div>
                    {
                        textPasswordChange !== '' &&
                        <div className="flex flex-col gap-2 w-full max-w-72">
                            <InputForm
                                type="password"
                                placeholder="Confirmar a nova Senha"
                                registerYup={register("passwordUpdate_confirmation")}
                                errors={errors.passwordUpdate_confirmation?.message}
                            />
                            <span className="text-danger text-base block">{errors.passwordUpdate_confirmation?.message}</span>
                        </div>
                    }
                    <InputForm
                        type="submit"
                        textButton="Salvar"
                        className="w-full max-w-72"
                    />
                </form>
            }
            {
                stepForm == 2 &&
                <FormConfirmEmail onSubmitExternal={onSubmitVerifyEmail} handleClickResendExternal={handleClickResend} timeResendCodeExternal={timeResendCode}/>
            }
        </>
    )
}
