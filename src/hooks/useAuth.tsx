'use client'
import { confirmEmail, initializeProgram, recoverUserInformation, register, sendCodeConfirmEmail, signInRequest, signInRequestGoogle, signOut } from "@/services/auth";
import { jwtDecode } from "jwt-decode";
import { useRouter, usePathname } from "next/navigation";
import { setCookie, parseCookies, destroyCookie } from "nookies";
import { createContext, ReactNode, useEffect, useState } from "react";
import { Bounce, toast } from "react-toastify";

interface User {
    id: number;
    username: string;
    email: string;
    avatar_url: string;
    token?: string | undefined;
    confirm_email?: boolean;
}

interface NotConfirmEmailUser extends User  {
    tokenEmail?: string;
}

type SignInData = {
    email: string;
    password: string;
}

type RegisterData = {
    email: string;
    password: string;
    username: string;
}

type AuthContextType = {
    isAuthenticated: boolean;
    notConfirmEmail: boolean;
    signIn: (data: SignInData) => Promise<void>;
    responseGoogle: (response: any) => Promise<void>;
    singOut: () => Promise<void>;
    register: (data: RegisterData) => Promise<void>;
    setUser: (data: User | null) => void;
    confirmEmailUser: (tokenEmailForm:string) => Promise<void>;
    resendCodeEmail: ({ emailForm }:{emailForm:string|undefined}) => Promise<string | undefined>;
    user: User | null;
    error: string;
    // getServerSideProps: (url:string) => Promise<void>;
}

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthContext = createContext({} as AuthContextType);

export function AuthProvider({ children }: AuthProviderProps) {
    const router = useRouter();
    const pathname = usePathname();
    const [user, setUser] = useState<NotConfirmEmailUser | null>(null);
    const [error, setError] = useState<string>("");
    const [notConfirmEmail, setNotConfirmEmail] = useState<boolean>(false)
    const isAuthenticated = !!user;

    useEffect(() => {
        initializeProgram()
        const { 'nextauth.token': token } = parseCookies();
        if (token && user == null) {
            recoverUserInformation(token).then(response => {
                setUser(response.userAuth);
            }).catch(() => {
                destroyCookie(null, 'nextauth.token', { path: '/' });
                window.location.reload();
            })
            if (pathname == '/') {
                router.push('/dashboard')
            }
        } else if (!token) {
            router.push('/')
        }
    }, [pathname, router, user])

    async function signIn({email, password}:SignInData) {
        try {
            const { userAuth } = await signInRequest({
                email,
                password
            })
            if (userAuth == null) throw Error('Senha ou Email errados');
            if (!userAuth.confirm_email) {
                let tokenEmail = "";
                tokenEmail = await sendCodeConfirmEmail({
                    userEmail: userAuth.email
                })
                setUser({
                    id: userAuth.id,
                    email: userAuth.email,
                    confirm_email: userAuth.confirm_email,
                    tokenEmail: tokenEmail
                } as NotConfirmEmailUser)
                setNotConfirmEmail(true)
                throw Error('')
            }
            setCookie(undefined, 'nextauth.token', userAuth.token, {
                maxAge: 60 * 60 * 1, // 1 hour
            })
            setUser(userAuth);
            window.location.reload();
        } catch (err:any) {
            setError(err.message)
        }
    }

    async function responseGoogle(response: any) {
        const credential = response.credential
        try {
            const userData:{email:string, name:string, picture:string} = jwtDecode(credential);
            console.log(userData);
            const { userAuth, firstRegisterGoogle } = await signInRequestGoogle({
                emailGoogle: userData.email,
                pictureGoogle: userData.picture,
                usernameGoogle: userData.name
            })
            if(firstRegisterGoogle?.registerFirstGoogle) {
                await signIn({
                    email: firstRegisterGoogle.email,
                    password: firstRegisterGoogle.password
                })
                return
            }
            if (userAuth == null) throw Error('Algo deu errado');
            setCookie(undefined, 'nextauth.token', userAuth.token, {
                maxAge: 60 * 60 * 1, // 1 hour
            })
            setUser(userAuth);
            window.location.reload();
        } catch (error) {
            console.log('Erro ao decodificar o token JWT', error);
        }
    }

    async function singOut() {
        setUser(null)
        destroyCookie(null, 'nextauth.token', { path: '/' });
        await signOut(user?.id)
        window.location.reload()
    }

    async function confirmEmailUser(tokenEmailForm:string) {
        try {
            if (!user) return;
            if(user.tokenEmail == undefined) throw new Error("Não foi possível enviar o código ao email");
            if(user.tokenEmail === tokenEmailForm) {
                await confirmEmail({
                    id: user.id,
                    tokenEmail: user.tokenEmail,
                    tokenEmailForm
                })
                toast.success("Obrigado por confirmar 😁", {
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
                setNotConfirmEmail(false)
            } else {
                throw new Error("Token de confirmação inválido!")
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

    async function resendCodeEmail({ emailForm }:{emailForm:string|undefined}) {
        try {
            if(!emailForm) throw new Error("Não foi informado email algum");
            if (!user) throw new Error("Usuário não encontrado!");
            const tokenEmail = await sendCodeConfirmEmail({
                userEmail: emailForm
            })
            setUser({
                ...user,
                tokenEmail: tokenEmail
            })
            return tokenEmail
        } catch (err:any) {
            console.log(err.message);
        }
    }

    return (
        <AuthContext.Provider value={{
            signIn,
            singOut,
            register,
            setUser,
            confirmEmailUser,
            resendCodeEmail,
            responseGoogle,
            isAuthenticated,
            user,
            error,
            notConfirmEmail,
        }}>
            {children}
        </AuthContext.Provider>
    );
}