import Image from "next/image"
import LogoToDo from "@/assets/logo.svg";
import { Bounce, ToastContainer } from "react-toastify";

export default function Loading() {
    return (
        <div className="bg-gray-600 w-screen h-screen flex items-center justify-center gap-4">
            <Image
                src={LogoToDo}
                alt="Logo ToDo"
                className="w-44"
            />
            <div
            className="p-3 animate-spin drop-shadow-2xl bg-gradient-to-bl from-blue via-purple-400 to-purple md:w-16 md:h-16 h-16 w-16 aspect-square rounded-full"
            >
                <div
                    className="rounded-full h-full w-full bg-blue dark:bg-gray-600 background-blur-md"
                ></div>
            </div>
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
        </div>
    )
}